import React, { useState } from "react";
import { ethers } from "ethers";
import { useWallet } from "../context/WalletContext";

const StoreAssignPoint: React.FC = () => {
    const [memberId, setMemberId] = useState("");
    const [paymentAmount, setPaymentAmount] = useState("");
    const [pointPercentage, setPointPercentage] = useState("");
    const [status, setStatus] = useState("");

    const { signer } = useWallet();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!signer) {
            setStatus("Wallet not connected");
            return;
        }

        try {
            setStatus("Loading ABI...");
            const res = await fetch("/src/public/LoyaltyToken_ABI.json");
            const abi = await res.json();

            const contractAddress = "0xa16E02E87b7454126E5E10d957A927A7F5B5d2be";
            const loyaltyTokenContract = new ethers.Contract(contractAddress, abi, signer);

            const amount = BigInt(paymentAmount); // assuming it's an integer string
            const percentage = BigInt(Math.floor(Number(pointPercentage) * 100));
            const points = (amount * percentage) / BigInt(10000); // since percentage is *100


            setStatus("Sending transaction...");
            const tx = await loyaltyTokenContract.assignPoints(memberId, points); // assuming assignPoints(address,uint256)
            await tx.wait();

            setStatus("Points assigned successfully.");
        } catch (error: any) {
            console.error("Error assigning points:", error);
            setStatus(`Error: ${error.message}`);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-start min-vh-100 bg-success py-5">
            <div className="card bg-warning shadow p-4 w-75">
                <h2 className="text-center mb-4">Assign Loyalty Points</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="memberId" className="form-label fw-bold">Member ID</label>
                        <input
                            type="text"
                            className="form-control"
                            id="memberId"
                            value={memberId}
                            onChange={(e) => setMemberId(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="paymentAmount" className="form-label fw-bold">Payment Amount</label>
                        <input
                            type="number"
                            className="form-control"
                            id="paymentAmount"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            required
                            min="0"
                            step="0.01"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="pointPercentage" className="form-label fw-bold">Percentage of Point to Payment</label>
                        <input
                            type="number"
                            className="form-control"
                            id="pointPercentage"
                            value={pointPercentage}
                            onChange={(e) => setPointPercentage(e.target.value)}
                            required
                            min="0"
                            max="100"
                            step="0.1"
                        />
                    </div>
                    <div className="text-center">
                        <button type="submit" className="btn btn-primary px-4">Assign Points</button>
                    </div>
                    {status && <p className="mt-3 text-center fw-bold">{status}</p>}
                </form>
            </div>
        </div>
    );
};

export default StoreAssignPoint;
