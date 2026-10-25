import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { logout } from "../redux/authSlice";
import "../styles/auth.css";

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  function handleLogout() {
    dispatch(logout());
    navigate("/login");
  }

  return (
    <div className="auth-page">
      <div className="auth-card dashboard-card">
        <div className="auth-brand">✦ MultiAI</div>
        <h1>Welcome{user?.name ? `, ${user.name}` : ""}</h1>
        <p className="muted">What would you like to do?</p>

        <div className="dash-actions">
          <Link to="/chat" className="dash-tile">
            <strong>💬 Start chatting</strong>
            <span className="muted">Ask coding, research or document questions</span>
          </Link>
          <Link to="/documents" className="dash-tile">
            <strong>📄 Manage documents</strong>
            <span className="muted">Upload PDFs to use as a knowledge base</span>
          </Link>
        </div>

        <button className="btn" onClick={handleLogout}>Log out</button>
      </div>
    </div>
  );
}