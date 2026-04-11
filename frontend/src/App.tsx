import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Kardex from './pages/Kardex'
import Historial from './pages/Historial'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/kardex/:codigo" element={<Kardex />} />
      <Route path="/historial" element={<Historial />} />
    </Routes>
  )
}

export default App