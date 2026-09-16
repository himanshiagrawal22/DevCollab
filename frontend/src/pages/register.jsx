import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          name,
          email,
          password,
        }
      );

      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
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
            <p className="eyebrow">WORK BETTER TOGETHER</p>

            <h1>
              Turn ideas into
              <br />
              <span>real projects.</span>
            </h1>

            <p>
              Create workspaces, manage tasks and collaborate with developers
              in real time.
            </p>
          </div>

          <div className="auth-features">
            <span>✓ Create collaborative projects</span>
            <span>✓ Assign and track tasks</span>
            <span>✓ Stay updated in real time</span>
          </div>
        </section>

        <section className="auth-form-panel">
          <div className="auth-form-wrapper">
            <div className="auth-form-heading">
              <p className="eyebrow">GET STARTED</p>
              <h2>Create your account</h2>
              <p>Start collaborating with your team.</p>
            </div>

            <form className="auth-form" onSubmit={handleRegister}>
              <div className="form-field">
                <label>Full name</label>

                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

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
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <button className="auth-submit-btn" type="submit">
                Create Account
                <span>→</span>
              </button>
            </form>

            <p className="auth-switch">
              Already have an account?{" "}
              <Link to="/">Sign in</Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Register;