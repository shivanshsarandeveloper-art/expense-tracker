
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./Dashboard";
import { getCurrentUser } from "./utils/Auth";
import Profile from "./pages/Profile";

function ProtectedRoute({ children }) {
  return getCurrentUser()
    ? children
    : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/login"
          element={
            getCurrentUser()
              ? <Navigate to="/" replace />
              : <Login />
          }
        />
        <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
