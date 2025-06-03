import { Link } from "react-router-dom";
import { User } from "lucide-react";

// Mock login status and role (replace with actual logic or context)
const isLoggedIn = true; // Set false to simulate logged-out state
const userRole = "store"; // Can be 'store' or 'member'

const Navbar: React.FC = () => {
  // Determine destination for Profile icon
  const profileLink = isLoggedIn ? "/profile" : "/login";

  // Determine Dashboard link based on login status and role
  let dashboardLink = "#";
  if (isLoggedIn) {
    dashboardLink = userRole === "store" ? "/store/dashboard" : "/member/dashboard";
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">HashPerks</Link>
        
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>

            <li className="nav-item">
              <Link
                className={`nav-link ${!isLoggedIn ? "disabled" : ""}`}
                to={dashboardLink}
                aria-disabled={!isLoggedIn}
              >
                Dashboard
              </Link>
            </li>
          </ul>

          <Link className="btn btn-outline-light d-flex align-items-center" to={profileLink}>
            <User className="me-2" size={18} />
            Profile
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
