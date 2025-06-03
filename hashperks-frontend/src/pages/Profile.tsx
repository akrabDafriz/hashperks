import React from "react";
import { useNavigate } from "react-router-dom";

const Profile: React.FC = () => {
  // Dummy user
  const user = {
    name: "jimmy johnson",
    email: "johnson@example.com",
    joined: "January 2024",
  };

  const navigate = useNavigate();

  return (
    <div className="d-flex justify-content-center align-items-start min-vh-100 bg-success py-5">
      <div className="card bg-warning shadow p-4 w-75" style={{ maxWidth: "500px" }}>
        <h2 className="text-center mb-4">Profile</h2>

        <div className="mb-3">
          <strong>Name:</strong>
          <p>{user.name}</p>
        </div>

        <div className="mb-3">
          <strong>Email:</strong>
          <p>{user.email}</p>
        </div>

        <div className="mb-4">
          <strong>Joined:</strong>
          <p>{user.joined}</p>
        </div>

        <button className="btn btn-primary w-100" onClick={() => navigate("/")}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
