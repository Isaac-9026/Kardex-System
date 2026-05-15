import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Kardex from './pages/Kardex'
import Historial from './pages/Historial'
import SaldosIniciales from './pages/SaldosIniciales'
import { AuthProvider } from './context/AuthContex' // ajusta la ruta según tu proyecto

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/kardex/:procesamiento_id" element={<Kardex />} />
        <Route path="/historial" element={<Historial />} />
        <Route path="/saldos" element={<SaldosIniciales />} />
      </Routes>
    </AuthProvider>
  )
}

export default App