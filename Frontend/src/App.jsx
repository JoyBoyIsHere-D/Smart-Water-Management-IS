import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Overview from './components/pages/Overview'
import WaterQuality from './components/pages/WaterQuality'
import Anomalies from './components/pages/Anomalies'
import Analytics from './components/pages/Analytics'
import DataUploadPage from './components/pages/DataUploadPage'
import Settings from './components/pages/Settings'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Overview />} />
        <Route path="quality" element={<WaterQuality />} />
        <Route path="anomalies" element={<Anomalies />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="upload" element={<DataUploadPage />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default App
