import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { useWallet } from "../context/WalletContext";
import LoyaltyTokenABI from "../abi/LoyaltyToken_ABI.json";

const StoreRegister: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { walletAddress, signer } = useWallet();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const userId = location.state?.userId;
    const storeName = location.state?.storeName;

    const deployTokenContract = async () => {
        if (!signer || !storeName) {
            setError("Wallet not connected or store name missing.");
            return;
        }

        setLoading(true);
        try {
            const factory = new ethers.ContractFactory(
                LoyaltyTokenABI.abi,
                LoyaltyTokenABI.bytecode,
                signer
            );

            const contract = await factory.deploy(
                storeName,
                "LP", // token symbol
                1000 // initial supply
            );

            await contract.waitForDeployment();

            const deployedAddress = await contract.getAddress();

            console.log("✅ Token deployed at:", deployedAddress);

            // Call backend to create the store
            const response = await fetch("/api/stores", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: userId,
                    business_name: storeName,
                    description: "New Store Description",
                    location: "Unknown",
                    token_contract_address: deployedAddress,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to create store in backend.");
            }

            navigate("/store/dashboard");
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!userId || !storeName) {
            setError("Missing store registration context. Redirecting...");
            setTimeout(() => navigate("/register"), 2000);
        } else {
            deployTokenContract();
        }
    }, []);

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-info">
            <div className="card p-4 shadow bg-light" style={{ width: "30rem" }}>
                <h3 className="text-center mb-3">Registering Your Store...</h3>
                {loading && <p className="text-center">Please wait while we deploy your token contract and set up your store.</p>}
                {error && <p className="text-danger text-center">{error}</p>}
            </div>
        </div>
    );
};

export default StoreRegister;
