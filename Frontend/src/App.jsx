import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Overview from './components/pages/Overview'
import WaterQuality from './components/pages/WaterQuality'
import Anomalies from './components/pages/Anomalies'
import Analytics from './components/pages/Analytics'
import FederatedLearning from './components/pages/FederatedLearning'
import DataUploadPage from './components/pages/DataUploadPage'
import Settings from './components/pages/Settings'
import Login from './components/pages/Login'
import Signup from './components/pages/Signup'
import './App.css'

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Overview />} />
        <Route path="quality" element={<WaterQuality />} />
        <Route path="anomalies" element={<Anomalies />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="federated" element={<FederatedLearning />} />
        <Route path="upload" element={<DataUploadPage />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default App
