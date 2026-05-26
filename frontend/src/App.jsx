import React from 'react'
import { Dashboard } from './pages/Dashboard'

function App() {
  return (
    <div className="min-h-screen bg-navy-950 relative overflow-hidden">
      {/* Dynamic Background Noise/Ornaments if any */}
      <Dashboard />
    </div>
  )
}

export default App
export { App }
