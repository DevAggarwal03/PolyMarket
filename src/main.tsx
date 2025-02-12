import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import WalletProvider from './utils/walletProvider.tsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
      <WalletProvider>
        <App />
      </WalletProvider>
    </BrowserRouter>
)
