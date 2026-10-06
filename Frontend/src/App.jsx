import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import ChartPage from './pages/ChartPage'
import Articles from './pages/Articles'
import Pipeline from './pages/Pipeline'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="chart" element={<ChartPage />} />
          <Route path="articles" element={<Articles />} />
          <Route path="pipeline" element={<Pipeline />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
