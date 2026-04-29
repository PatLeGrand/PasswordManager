import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom"
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Layout from "./components/ui/Layout.tsx"
import ShareCreate from './pages/ShareCreate'
import ShareView from './pages/ShareView'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" />
}

export default function App() {
  return (
    <BrowserRouter>
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
                    path="/"
                    element={
                    <PrivateRoute>
                        <Layout />
                    </PrivateRoute>
                    }
                    >
                <Route index element={<Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/share/create/:serviceId" element={<ShareCreate />} />
                <Route path="/share/:token" element={<ShareView />} />
            </Route>
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
  </BrowserRouter>
  )
}