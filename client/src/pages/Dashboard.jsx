import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const handleLogout = async () => {
        try {
            await logout();
            navigate("/login", { replace: true });
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h2>Sweety</h2>
        <span>Blood Glucose Tracker</span>
      </div>

      <div className="navbar-user">
        <span>Welcome, {user?.name || "User"}</span>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
