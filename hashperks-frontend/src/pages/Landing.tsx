import { Link } from "react-router-dom";
// import Navbar from "../components/Navbar"; 
// import { Sparkles } from "lucide-react";

const Landing: React.FC = () => {
  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-success">
      <div className="card bg-warning shadow-lg p-4" style={{ width: "30rem" }}>
        <h1 className="text-center mb-3">HashPerks</h1>
        <p className="text-dark mb-4">
          <strong>HashPerks</strong> is a blockchain-based loyalty reward platform designed to empower businesses and engage customers. Stores can reward loyal buyers with points directly linked to their wallet, while members collect, track, and redeem their points for exclusive perks — all transparently recorded on-chain.
        </p>
        <div className="d-grid gap-3">
          <Link to="/login" className="btn btn-primary w-100">
            Login as member/store
          </Link>
          <Link to="/register" className="btn btn-outline-dark w-100">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Landing;
