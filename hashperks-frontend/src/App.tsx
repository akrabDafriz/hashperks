import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import StoreDashboard from "./pages/StoreDashboard";
import StoreAssignPoint from "./pages/StoreAssignPoint";
import MemberDashboard from "./pages/MemberDashboard";
import MemberRegister from "./pages/MembershipRegister";
import StoreRegister from "./pages/StoreRegister";

const App: React.FC = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/store/register" element={<StoreRegister />} />
        <Route path="/store/dashboard" element={<StoreDashboard />} />
        <Route path="/store/assign-point" element={<StoreAssignPoint />} />
        <Route path="/member/dashboard" element={<MemberDashboard />} />
        <Route path="/member/membership-register" element={<MemberRegister />} />
      </Routes>
    </>
  );
};

export default App;
