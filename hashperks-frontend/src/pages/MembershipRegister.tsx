import React, { useState } from "react";

const demoStores = [
    { id: 1, name: "Coffee Haven", description: "Kopi uenak coy" },
    { id: 2, name: "Tech Gadgets", description: "Halo semua david disini" },
    { id: 3, name: "Book World", description: "read some books" },
];

const MemberRegister: React.FC = () => {
    const [search, setSearch] = useState("");
    const [selectedStore, setSelectedStore] = useState<null | typeof demoStores[0]>(null);

    const filteredStores = demoStores.filter((store) =>
        store.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleRegister = (storeId: number) => {
        // TODO: Call smart contract to register membership for user
        console.log("Registering member to store:", storeId);
        setSelectedStore(null); // Close modal
    };

    return (
        <div className="d-flex justify-content-center align-items-start min-vh-100 bg-success py-5">
        <div className="card bg-warning shadow p-4 w-75">
            <h2 className="text-center mb-4">Membership Registry</h2>

            {/* Search Input */}
            <div className="mb-4">
            <input
                type="text"
                className="form-control"
                placeholder="Search for a store..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            </div>

            {/* Store List */}
            <div className="row">
            {filteredStores.map((store) => (
                <div key={store.id} className="col-md-4 mb-4">
                <div
                    className="card h-100 cursor-pointer"
                    onClick={() => setSelectedStore(store)}
                    style={{ cursor: "pointer" }}
                >
                    <div className="card-body text-center">
                    <h5 className="card-title">{store.name}</h5>
                    <p className="card-text">{store.description}</p>
                    </div>
                </div>
                </div>
            ))}
            </div>
        </div>

        {/* Store Details Modal */}
        {selectedStore && (
            <div
            className="modal d-block"
            tabIndex={-1}
            role="dialog"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            onClick={() => setSelectedStore(null)}
            >
            <div
                className="modal-dialog"
                role="document"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title">{selectedStore.name}</h5>
                    <button
                    type="button"
                    className="btn-close"
                    onClick={() => setSelectedStore(null)}
                    ></button>
                </div>
                <div className="modal-body">
                    <p>{selectedStore.description}</p>
                </div>
                <div className="modal-footer">
                    <button
                    className="btn btn-secondary"
                    onClick={() => setSelectedStore(null)}
                    >
                    Cancel
                    </button>
                    <button
                    className="btn btn-primary"
                    onClick={() => handleRegister(selectedStore.id)}
                    >
                    Register as Member
                    </button>
                </div>
                </div>
            </div>
            </div>
        )}
        </div>
    );
};

export default MemberRegister;
