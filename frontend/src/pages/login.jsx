import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );

      navigate("/dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-decoration auth-decoration-one"></div>
      <div className="auth-decoration auth-decoration-two"></div>

      <div className="auth-container">
        <section className="auth-brand-panel">
          <div className="auth-brand">
            <div className="brand-logo">D</div>

            <div>
              <h2>DevCollab</h2>
              <span>Developer Workspace</span>
            </div>
          </div>

          <div className="auth-brand-content">
            <p className="eyebrow">BUILD • COLLABORATE • SHIP</p>

            <h1>
              Your projects.
              <br />
              Your team.
              <br />
              <span>One workspace.</span>
            </h1>

            <p>
              Organize tasks, collaborate with your team and keep every
              project update in one place.
            </p>
          </div>

          <div className="auth-features">
            <span>✓ Real-time collaboration</span>
            <span>✓ Kanban task management</span>
            <span>✓ Team roles & activity</span>
          </div>
        </section>

        <section className="auth-form-panel">
          <div className="auth-form-wrapper">
            <div className="auth-form-heading">
              <p className="eyebrow">WELCOME BACK</p>
              <h2>Sign in to DevCollab</h2>
              <p>Continue working with your team.</p>
            </div>

            <form className="auth-form" onSubmit={handleLogin}>
              <div className="form-field">
                <label>Email address</label>

                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label>Password</label>

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button className="auth-submit-btn" type="submit">
                Sign In
                <span>→</span>
              </button>
            </form>

            <p className="auth-switch">
              Don't have an account?{" "}
              <Link to="/register">Create account</Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Login;