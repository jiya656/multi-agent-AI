import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../redux/authSlice";

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  function handleLogout() {
    dispatch(logout());
    navigate("/login");
  }

  return (
    <div style={{ maxWidth: 500, margin: "80px auto", fontFamily: "sans-serif", textAlign: "center" }}>
      <h1>Welcome to Multi-Agent AI Workspace</h1>
      <p>
        You are logged in successfully{user?.name ? `, ${user.name}` : ""}.
      </p>
      <button onClick={handleLogout} style={{ padding: "8px 20px", marginTop: 20, cursor: "pointer" }}>
        Logout
      </button>
    </div>
  );
}