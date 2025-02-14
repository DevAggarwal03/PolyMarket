const {
  time,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PredictionMarket", function () {
  let predictionMarket;
  let owner;
  let addr1;
  let addr2;
  let mockBTCOracle;
  let mockETHOracle;
  const subscriptionFee = ethers.parseEther("0.1");

  beforeEach(async function () {
    // Deploy mock price feed contracts
    const MockV3Aggregator = await ethers.getContractFactory("MockV3Aggregator");
    mockBTCOracle = await MockV3Aggregator.deploy(8, 50000 * 10**8); // 8 decimals, $50,000
    mockETHOracle = await MockV3Aggregator.deploy(8, 3000 * 10**8);  // 8 decimals, $3,000

    // Deploy PredictionMarket
    const PredictionMarket = await ethers.getContractFactory("PredictionMarket");
    [owner, addr1, addr2] = await ethers.getSigners();
    predictionMarket = await PredictionMarket.deploy();

    // Set up price feed addresses
    await predictionMarket.updatePriceFeedAddress("BTC", mockBTCOracle.target);
    await predictionMarket.updatePriceFeedAddress("ETH", mockETHOracle.target);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await predictionMarket.owner()).to.equal(owner.address);
    });

    it("Should set the correct subscription fee", async function () {
      expect(await predictionMarket.subscriptionFee()).to.equal(subscriptionFee);
    });
  });

  describe("Agent Subscription", function () {
    it("Should allow users to subscribe as agents", async function () {
      await predictionMarket.connect(addr1).subscribeAgent({ value: subscriptionFee });
      const agent = await predictionMarket.userToAgent(addr1.address);
      expect(agent.isAcitve).to.be.true;
    });

    it("Should reject subscription with insufficient fee", async function () {
      await expect(
        predictionMarket.connect(addr1).subscribeAgent({ 
          value: ethers.parseEther("0.05") 
        })
      ).to.be.revertedWith("Amount must be greater than or equal to 0.1 ether");
    });

    it("Should reject duplicate subscriptions", async function () {
      await predictionMarket.connect(addr1).subscribeAgent({ value: subscriptionFee });
      await expect(
        predictionMarket.connect(addr1).subscribeAgent({ value: subscriptionFee })
      ).to.be.revertedWith("You are already an agent");
    });

    it("Should allow subscription renewal", async function () {
      await predictionMarket.connect(addr1).subscribeAgent({ value: subscriptionFee });
      const initialEndTime = (await predictionMarket.userToAgent(addr1.address)).endTime;
      
      await time.increase(15 * 24 * 60 * 60); // Advance 15 days
      
      await predictionMarket.connect(addr1).renewSubscription({ value: subscriptionFee });
      const newEndTime = (await predictionMarket.userToAgent(addr1.address)).endTime;
      
      expect(newEndTime).to.be.gt(initialEndTime);
    });
  });

  describe("Question Management", function () {
    beforeEach(async function () {
      // Set current time
      await time.increase(0);
    });

    it("Should allow owner to create questions", async function () {
      const endTime = (await time.latest()) + 86400; // 1 day from now
      await predictionMarket.createQuestion(
        "Will BTC exceed $60,000?",
        "BTC price prediction",
        endTime,
        "BTC",
        60000 * 10**8,
        mockBTCOracle.target
      );

      const question = await predictionMarket.idToQuestion(1);
      expect(question.question).to.equal("Will BTC exceed $60,000?");
      expect(question.isActive).to.be.true;
    });

    it("Should not allow non-owners to create questions", async function () {
      const endTime = (await time.latest()) + 86400;
      await expect(
        predictionMarket.connect(addr1).createQuestion(
          "Will BTC exceed $60,000?",
          "BTC price prediction",
          endTime,
          "BTC",
          60000 * 10**8,
          mockBTCOracle.target
        )
      ).to.be.revertedWith("Only the owner can call this function");
    });

    it("Should not allow questions with past end time", async function () {
      const endTime = (await time.latest()) - 86400; // 1 day ago
      await expect(
        predictionMarket.createQuestion(
          "Will BTC exceed $60,000?",
          "BTC price prediction",
          endTime,
          "BTC",
          60000 * 10**8,
          mockBTCOracle.target
        )
      ).to.be.revertedWith("End time must be in the future");
    });
  });

  describe("Voting and Betting", function () {
    let questionId;

    beforeEach(async function () {
      const endTime = (await time.latest()) + 86400;
      await predictionMarket.createQuestion(
        "Will BTC exceed $60,000?",
        "BTC price prediction",
        endTime,
        "BTC",
        60000 * 10**8,
        mockBTCOracle.target
      );
      questionId = 1;
    });

    it("Should allow users to vote with ETH", async function () {
      const betAmount = ethers.parseEther("1");
      await predictionMarket.connect(addr1).vote(questionId, true, 0, { value: betAmount });
      
      const holdings = await predictionMarket.addressToQuestionIdToAmt(addr1.address, questionId);
      expect(holdings.yesVotes).to.equal(betAmount);
    });

    it("Should not allow voting on expired questions", async function () {
      await time.increase(86401); // Advance time past end time
      
      await expect(
        predictionMarket.connect(addr1).vote(questionId, true, 0, { value: ethers.parseEther("1") })
      ).to.be.revertedWith("Question has expired");
    });
  });

  describe("Question Resolution and Withdrawals", function () {
    let questionId;
    const betAmount = ethers.parseEther("1");

    beforeEach(async function () {
      const endTime = (await time.latest()) + 86400;
      await predictionMarket.createQuestion(
        "Will BTC exceed $60,000?",
        "BTC price prediction",
        endTime,
        "BTC",
        60000 * 10**8,
        mockBTCOracle.target
      );
      questionId = 1;

      // Place some bets
      await predictionMarket.connect(addr1).vote(questionId, true, 0, { value: betAmount });
      await predictionMarket.connect(addr2).vote(questionId, false, 0, { value: betAmount });
    });

    it("Should resolve question correctly based on oracle price", async function () {
      await time.increase(86401); // Advance past end time
      
      // Set BTC price to $65,000 (above target)
      await mockBTCOracle.updateAnswer(65000 * 10**8);
      
      await predictionMarket.checkAndResolveQuestion(questionId);
      
      expect(await predictionMarket.questionToWinningOutcome(questionId)).to.be.true;
      expect(await predictionMarket.isQuestionResolved(questionId)).to.be.true;
    });

    it("Should allow winners to withdraw their winnings", async function () {
      await time.increase(86401);
      await mockBTCOracle.updateAnswer(65000 * 10**8);
      await predictionMarket.checkAndResolveQuestion(questionId);

      const initialBalance = await ethers.provider.getBalance(addr1.address);
      await predictionMarket.connect(addr1).withdrawBets(questionId, betAmount, true);
      const finalBalance = await ethers.provider.getBalance(addr1.address);

      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should not allow losers to withdraw", async function () {
      await time.increase(86401);
      await mockBTCOracle.updateAnswer(65000 * 10**8);
      await predictionMarket.checkAndResolveQuestion(questionId);

      await expect(
        predictionMarket.connect(addr2).withdrawBets(questionId, betAmount, false)
      ).to.be.revertedWith("Can only withdraw winning bets");
    });
  });

  describe("Oracle Integration", function () {
    it("Should correctly fetch prices from oracle", async function () {
      const btcPrice = await predictionMarket.getLatestPrice("BTC");
      expect(btcPrice).to.equal(50000 * 10**8);
    });

    it("Should allow owner to update price feed addresses", async function () {
      const newMockOracle = await (await ethers.getContractFactory("MockV3Aggregator"))
        .deploy(8, 45000 * 10**8);
      
      await predictionMarket.updatePriceFeedAddress("BTC", newMockOracle.target);
      
      expect(await predictionMarket.cryptoPriceFeedAddresses("BTC"))
        .to.equal(newMockOracle.target);
    });
  });
});
