import React from "react";
import { useNavigate } from "react-router-dom";

const demoPerks = [
    {
        name: "10% Off Voucher",
        image: "https://via.placeholder.com/150", 
    },
    {
        name: "Free Coffee",
        image: "https://via.placeholder.com/150",
    },
    {
        name: "Bonus Points",
        image: "https://via.placeholder.com/150",
    },
];

const StoreDashboard: React.FC = () => {
    const storeName = "Store namenya bebas dulu"; 
    const navigate = useNavigate();

    return (
        <div className="d-flex justify-content-center align-items-start min-vh-100 bg-success py-5">
        <div className="card bg-warning shadow p-4 w-75">
            <h1 className="text-center mb-4">{storeName}</h1>

            <div className="d-flex justify-content-between align-items-center mb-4">
            <h3>Perks Offered</h3>
            <button
                className="btn btn-primary"
                onClick={() => navigate("/store/assign-point")}
            >
                Assign Point to Member
            </button>
            </div>

            <div className="row">
            {demoPerks.map((perk, index) => (
                <div className="col-md-4 mb-4" key={index}>
                <div className="card h-100">
                    <img
                    src={perk.image}
                    className="card-img-top"
                    alt={perk.name}
                    style={{ objectFit: "cover", height: "150px" }}
                    />
                    <div className="card-body text-center">
                    <h5 className="card-title">{perk.name}</h5>
                    </div>
                </div>
                </div>
            ))}
            </div>
        </div>
        </div>
    );
};

export default StoreDashboard;
