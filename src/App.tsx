import './App.css'
import { Routes, Route } from 'react-router-dom'
import Home from './Pages/Home'
import Questions from './Pages/Questions'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/questions" element={<Questions/>}/>
      </Routes>
    </>
  )
}

export default App;
