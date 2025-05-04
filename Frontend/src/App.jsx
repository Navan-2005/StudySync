import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import QuizPage from './Pages/QuizPage'
import QuizGenerator from './Components/QuizGenerator'
import QuizTaker from './Components/QuizTaker'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<QuizGenerator />} />
          <Route path='/quiz/:id' element={<QuizTaker />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
