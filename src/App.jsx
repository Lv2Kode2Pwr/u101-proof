import { BrowserRouter, Routes, Route } from 'react-router-dom'
import RegisterItem from './RegisterItem'
import VerifyItem from './VerifyItem'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RegisterItem />} />
        <Route path="/verify/:hash" element={<VerifyItem />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App