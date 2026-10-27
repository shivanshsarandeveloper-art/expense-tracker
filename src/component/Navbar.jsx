
import { Link } from "react-router";

function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        ExpenseTracker
      </Link>

      <div className="navbar-links">
        <Link to="/">Dashboard</Link>
        <Link to="/profile">Profile</Link>

        <span className="navbar-user">
          {user?.name || "User"}
        </span>

        <button
          type="button"
          className="logout-button"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
