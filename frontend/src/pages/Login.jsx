import { useState } from "react";
import { Link } from "react-router-dom";
import { FiMail, FiLock, FiMessageCircle } from "react-icons/fi";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", formData);
      login(data.user, data.token);
    } catch (error) {
      setError(error.response?.data?.message || "Unable to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-brand-panel">
        <div className="brand-content">
          <div className="brand-logo">
            <FiMessageCircle />
          </div>

          <h1>Conversa</h1>

          <p>
            Connect instantly. Chat privately. Stay close to the people who
            matter.
          </p>

          <div className="brand-features">
            <span>Real-time conversations</span>
            <span>Private & group chats</span>
            <span>Instant connection</span>
          </div>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-card">
          <div className="mobile-brand">
            <FiMessageCircle />
            <span>Conversa</span>
          </div>

          <div className="auth-heading">
            <p className="eyebrow">WELCOME BACK</p>
            <h2>Sign in to your account</h2>
            <p>Continue your conversations from where you left off.</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email address</label>

              <div className="input-wrapper">
                <FiMail />
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>

              <div className="input-wrapper">
                <FiLock />
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button className="auth-button" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="auth-switch">
            New to Conversa? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
