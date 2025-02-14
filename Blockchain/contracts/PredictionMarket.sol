// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// Import SEI's oracle interface
interface ISeiPriceOracle {
    function getPrice(string memory denom) external view returns (uint256 price, uint256 timestamp);
}

contract PredictionMarket {
    address private owner;
    uint256 public totalAgents;
    uint256 public totalQuestions;
    uint256 public subscriptionFee = 0.1 ether;
    mapping(uint256 => bool) public isQuestionResolved;
    mapping(uint256 => bool) public questionToWinningOutcome;

    address public constant priceOracleAddress = 0x2880aB155794e7179c9eE2e38200202908C17B43;

    struct holdingAmt {
        uint256 yesVotes;
        uint256 noVotes;
    }

    mapping(address => mapping(uint256 => holdingAmt))
        public addressToQuestionIdToAmt;

    struct Agent {
        uint256 id;
        address walletAddress;
        bool isAcitve;
        uint256 endTime;
    }

    struct Question {
        uint256 id;
        string question;
        string description;
        uint256 endTime;
        uint256 yesVotes; // Now represents total ETH bet on YES
        uint256 noVotes; // Now represents total ETH bet on NO
        bool isActive;
        string cryptoCurrency;
    }

    mapping(address => Agent) public userToAgent;
    mapping(uint256 => Question) public idToQuestion;

    mapping(uint256 => uint256) public questionTargetPrices;

    // Events
    event AgentSubscribed(address indexed agent, uint256 id);
    event AgentRenewed(address indexed agent, uint256 id);
    event QuestionCreated(
        uint256 indexed id,
        string question,
        string description,
        uint256 endTime,
        string cryptoCurrency
    );
    event VoteCasted(
        address indexed voter,
        uint256 indexed questionId,
        bool vote
    );
    event WinnerDeclared(uint256 indexed questionId, bool outcome);

    ISeiPriceOracle public oracle;

    constructor() {
        owner = msg.sender;
        oracle = ISeiPriceOracle(priceOracleAddress);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    function getOwner() public view returns (address) {
        return owner;
    }

    function subscribeAgent() public payable {
        require(
            msg.value >= subscriptionFee,
            "Amount must be greater than or equal to 0.1 ether"
        );
        require(!userToAgent[msg.sender].isAcitve, "You are already an agent");

        totalAgents++;

        userToAgent[msg.sender] = Agent({
            id: totalAgents,
            walletAddress: msg.sender,
            isAcitve: true,
            endTime: block.timestamp + 30 days
        });

        emit AgentSubscribed(msg.sender, totalAgents);
    }

    function isSubscribed(address _walletAddress) public view returns (bool) {
        return userToAgent[_walletAddress].isAcitve;
    }

    function renewSubscription() public payable {
        require(
            msg.value >= subscriptionFee,
            "Amount must be greater than or equal to 0.1 ether"
        );
        require(
            userToAgent[msg.sender].walletAddress != address(0),
            "Not a subscriber, first subscribe as an agent"
        );

        userToAgent[msg.sender].endTime = block.timestamp + 30 days;
        userToAgent[msg.sender].isAcitve = true;

        emit AgentRenewed(msg.sender, userToAgent[msg.sender].id);
    }

    function createQuestion(
        string memory _question,
        string memory _description,
        uint256 _endTime,
        string memory _cryptoCurrency,
        uint256 _targetPrice
    ) public onlyOwner {
        require(
            bytes(_question).length > 0 && bytes(_description).length > 0,
            "Question and description must not be empty"
        );
        require(_endTime > block.timestamp, "End time must be in the future");

        totalQuestions++;

        idToQuestion[totalQuestions] = Question({
            id: totalQuestions,
            question: _question,
            description: _description,
            endTime: block.timestamp + _endTime,
            yesVotes: 1,
            noVotes: 1,
            isActive: true,
            cryptoCurrency: _cryptoCurrency
        });

        questionTargetPrices[totalQuestions] = _targetPrice;
        emit QuestionCreated(
            totalQuestions,
            _question,
            _description,
            _endTime,
            _cryptoCurrency
        );
    }

    function closeQuestion(uint256 _questionId) public onlyOwner {
        require(idToQuestion[_questionId].isActive, "Question is not active");
        require(
            idToQuestion[_questionId].endTime < block.timestamp,
            "Question is not expired"
        );

        idToQuestion[_questionId].isActive = false;
    }

    function vote(
        uint256 _questionId,
        bool _vote
    ) public payable {
        require(idToQuestion[_questionId].isActive, "Question is not active");
        require(
            idToQuestion[_questionId].endTime > block.timestamp,
            "Question has expired"
        );
        require(msg.value > 0, "Amount must be greater than 0");

        Question storage question = idToQuestion[_questionId];
        uint256 betAmount = msg.value;

        if (_vote) {
            // For YES votes
            question.yesVotes += betAmount;
            addressToQuestionIdToAmt[msg.sender][_questionId]
                .yesVotes += betAmount;
        } else {
            // For NO votes
            question.noVotes += betAmount;
            addressToQuestionIdToAmt[msg.sender][_questionId]
                .noVotes += betAmount;
        }

        emit VoteCasted(msg.sender, _questionId, _vote);
    }

    function withdrawBets(
        uint256 _questionId,
        uint256 _amount,
        bool _vote
    ) public {
        // require(!idToQuestion[_questionId].isActive, "Question must be closed");
        // require(isQuestionResolved[_questionId], "Question must be resolved");
        require(_amount > 0, "Amount must be greater than 0");

        Question storage question = idToQuestion[_questionId];
        bool isWinningVote = questionToWinningOutcome[_questionId] == _vote;
        require(isWinningVote, "Can only withdraw winning bets");

        uint256 totalPool = question.yesVotes + question.noVotes;
        uint256 winningPool = _vote ? question.yesVotes : question.noVotes;

        if (isQuestionResolved[_questionId]) {
            if(_vote == questionToWinningOutcome[_questionId]){
                require(
                    addressToQuestionIdToAmt[msg.sender][_questionId]
                        .yesVotes >= 0,
                    "Insufficient yes votes"
                );
                
                uint256 payout = _vote ?  addressToQuestionIdToAmt[msg.sender][_questionId].yesVotes : addressToQuestionIdToAmt[msg.sender][_questionId].noVotes;

                addressToQuestionIdToAmt[msg.sender][_questionId]
                    .yesVotes = 0;
                addressToQuestionIdToAmt[msg.sender][_questionId]
                    .noVotes = 0;

                (bool success, ) = payable(msg.sender).call{value: payout}("");
                require(success, "Transfer failed");
                
            }
        } else {
            if (_vote) {
                require(
                    addressToQuestionIdToAmt[msg.sender][_questionId]
                        .yesVotes >= _amount,
                    "Insufficient yes votes"
                );
                addressToQuestionIdToAmt[msg.sender][_questionId]
                    .yesVotes -= _amount;
            } else {
                require(
                    addressToQuestionIdToAmt[msg.sender][_questionId].noVotes >=
                        _amount,
                    "Insufficient no votes"
                );
                addressToQuestionIdToAmt[msg.sender][_questionId]
                    .noVotes -= _amount;
            }

            // Calculate payout based on proportion of winning pool
            uint256 payout = (_amount * totalPool) / winningPool;
            require(
                address(this).balance >= payout,
                "Insufficient contract balance"
            );

            (bool success, ) = payable(msg.sender).call{value: payout}("");
            require(success, "Transfer failed");

        }

    }

    // Modified getLatestPrice function for SEI oracle
    function getLatestPrice(string memory _cryptoCurrency) public view returns (uint256) {
        (uint256 price, ) = oracle.getPrice(_cryptoCurrency);
        return price;
    }

    function checkAndResolveQuestion(uint256 _questionId) public onlyOwner {
        Question storage question = idToQuestion[_questionId];
        require(question.isActive, "Question is not active");
        require(
            question.endTime < block.timestamp,
            "Question has not ended yet"
        );
        require(!isQuestionResolved[_questionId], "Question already resolved");

        uint256 currentPrice = getLatestPrice(question.cryptoCurrency);
        uint256 targetPrice = questionTargetPrices[_questionId];

        bool outcome = currentPrice >= targetPrice;

        question.isActive = false;
        questionToWinningOutcome[_questionId] = outcome;
        isQuestionResolved[_questionId] = true;

        emit WinnerDeclared(_questionId, outcome);
    }

    // function updatePriceFeedAddress(
    //     string memory _cryptoCurrency,
    //     address _priceFeed
    // ) public onlyOwner {
    //     require(_priceFeed != address(0), "Invalid price feed address");
    //     cryptoPriceFeedAddresses[_cryptoCurrency] = _priceFeed;
    // }
}
