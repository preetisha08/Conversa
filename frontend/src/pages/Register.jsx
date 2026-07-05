import { useState } from "react";
import { Link } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiMessageCircle } from "react-icons/fi";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function Register() {
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
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
      const { data } = await api.post("/auth/register", formData);
      login(data.user, data.token);
    } catch (error) {
      setError(error.response?.data?.message || "Unable to create account");
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
            One place for meaningful private conversations and effortless group
            chats.
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
            <p className="eyebrow">GET STARTED</p>
            <h2>Create your account</h2>
            <p>Join Conversa and start connecting instantly.</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full name</label>

              <div className="input-wrapper">
                <FiUser />
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

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
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  minLength="6"
                  required
                />
              </div>
            </div>

            <button className="auth-button" type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
