import './App.css'
import { Routes, Route } from 'react-router-dom'
import Home from './Pages/Home'
import Questions from './Pages/userHome'
import UserBets from './Pages/userBets'
import AdminDashboard from './Pages/AdminPage'
function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path='/user' element = {<Questions/>}/>
        <Route path='/userbets' element = {<UserBets/>}/>
        <Route path='/admin' element = {<AdminDashboard/>}/>
      </Routes>
    </>
  )
}

export default App
