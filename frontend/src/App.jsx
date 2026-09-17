import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import ProjectWorkspace from "./pages/projectWorkspace";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">

        <main className="app-content">
          <Routes>

            <Route
              path="/"
              element={<Login />}
            />

            <Route
              path="/register"
              element={<Register />}
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/projects/:projectId"
              element={
                <ProtectedRoute>
                  <ProjectWorkspace />
                </ProtectedRoute>
              }
            />

          </Routes>
        </main>

        <footer className="devcollab-footer">
          <p>
            Developed by{" "}
            <span className="footer-name">
              Himanshi Agrawal
            </span>
            {" "} | All Rights Reserved © 2026
          </p>
        </footer>

      </div>
    </BrowserRouter>
  );
}

export default App;