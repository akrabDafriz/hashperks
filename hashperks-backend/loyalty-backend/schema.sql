-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Store hashed passwords, not plaintext
    wallet_address VARCHAR(255) UNIQUE,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'store_owner', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Stores Table
CREATE TABLE IF NOT EXISTS stores (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, -- Store owner
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    token_contract_address VARCHAR(255) UNIQUE, -- Address of the store's unique loyalty token
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_stores_user_id ON stores(user_id);

-- Loyalty Programs Table
CREATE TABLE IF NOT EXISTS loyalty_programs (
   id SERIAL PRIMARY KEY,
   store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE NOT NULL,
   name VARCHAR(255) NOT NULL,
   description TEXT,
   points_conversion_rate NUMERIC(10, 2) DEFAULT 1.00,
   is_default_for_store BOOLEAN DEFAULT FALSE,
   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
   updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_loyalty_programs_store_id ON loyalty_programs(store_id);

-- Memberships Table
-- Links users to loyalty programs they've joined
CREATE TABLE IF NOT EXISTS memberships (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    loyalty_program_id INTEGER REFERENCES loyalty_programs(id) ON DELETE CASCADE NOT NULL,
    join_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    points_balance INTEGER DEFAULT 0, -- Can be managed here or purely on-chain
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, loyalty_program_id) -- A user can only join a specific program once
);
CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_loyalty_program_id ON memberships(loyalty_program_id);

-- Perks Table
CREATE TABLE IF NOT EXISTS perks (
    id SERIAL PRIMARY KEY,
    loyalty_program_id INTEGER REFERENCES loyalty_programs(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    points_required INTEGER NOT NULL CHECK (points_required > 0),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_perks_loyalty_program_id ON perks(loyalty_program_id);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL, -- The user (member) involved
    member_wallet_address VARCHAR(255), -- For cases where backend user_id might not be known yet
    store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
    loyalty_program_id INTEGER REFERENCES loyalty_programs(id) ON DELETE CASCADE,
    membership_id INTEGER REFERENCES memberships(id) ON DELETE SET NULL, -- Optional link to membership record
    perk_id INTEGER REFERENCES perks(id) ON DELETE SET NULL, -- Optional if it's a perk redemption
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('earn', 'redeem_perk', 'redeem_general', 'admin_adjustment')),
    points_changed INTEGER NOT NULL, -- Positive for earn, negative for redeem/burn
    transaction_hash VARCHAR(255) UNIQUE, -- Blockchain transaction hash, if applicable
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_store_id ON transactions(store_id);
CREATE INDEX IF NOT EXISTS idx_transactions_loyalty_program_id ON transactions(loyalty_program_id);
CREATE INDEX IF NOT EXISTS idx_transactions_membership_id ON transactions(membership_id);
CREATE INDEX IF NOT EXISTS idx_transactions_perk_id ON transactions(perk_id);


-- #############################################################################
-- # Populate Tables with Sample Data                                #
-- #############################################################################

-- Sample Users
-- User 1 (dafriz) - will get id=1
INSERT INTO users (username, email, password_hash, wallet_address, role, created_at, updated_at) VALUES
('dafriz', 'dafriz@gmail.com', '$2b$10$FlhFmjEg3yfUOc6JKkG0/uH7ue9pC3E86E01vbfiuzQuNMhR967Le', '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', 'user', '2025-05-29 20:20:44.199403', '2025-05-29 20:20:44.199403');

-- Other Sample Users - will get id=2, 3, 4, 5 respectively
INSERT INTO users (username, email, password_hash, wallet_address, role) VALUES
('alice_owner', 'alice@example.com', '$2b$10$FlhFmjEg3yfUOc6JKkG0/uH7ue9pC3E86E01vbfiuzQuNMhR967Le', '0xAliceWalletAddress001', 'store_owner'),
('bob_member', 'bob@example.com', '$2b$10$FlhFmjEg3yfUOc6JKkG0/uH7ue9pC3E86E01vbfiuzQuNMhR967Le', '0xBobWalletAddress002', 'user'),
('charlie_member', 'charlie@example.com', '$2b$10$FlhFmjEg3yfUOc6JKkG0/uH7ue9pC3E86E01vbfiuzQuNMhR967Le', '0xCharlieWalletAddress003', 'user');

-- Sample Stores (alice_owner (user_id=2) owns them)
INSERT INTO stores (user_id, name, description, category, token_contract_address) VALUES
(2, 'Alice''s Coffee Corner', 'Best coffee in town!', 'Cafe', '0xContractAddressForCoffee'),
(2, 'Alice''s Book Nook', 'A cozy place for book lovers.', 'Bookstore', '0xContractAddressForBooks');

-- Sample Loyalty Programs (store_id=1 is Coffee Corner, store_id=2 is Book Nook)
-- These IDs (1 and 2) are SERIAL from the stores table inserts above.
INSERT INTO loyalty_programs (store_id, name, description, points_conversion_rate, is_default_for_store) VALUES
(1, 'Coffee Corner Rewards', 'Earn points with every coffee.', 1.00, TRUE),
(2, 'Book Nook Loyalty', 'Read more, earn more.', 0.50, TRUE);

-- Sample Memberships
-- Bob (user_id=3) joins Coffee Corner Rewards (loyalty_program_id=1) - gets membership_id=1
INSERT INTO memberships (user_id, loyalty_program_id, points_balance) VALUES
(3, 1, 50);
-- Charlie (user_id=4) joins Coffee Corner Rewards (loyalty_program_id=1) - gets membership_id=2
INSERT INTO memberships (user_id, loyalty_program_id, points_balance) VALUES
(4, 1, 100);
-- Bob (user_id=3) also joins Book Nook Loyalty (loyalty_program_id=2) - gets membership_id=3
INSERT INTO memberships (user_id, loyalty_program_id, points_balance) VALUES
(3, 2, 20);

-- Sample Perks
-- Perks for Coffee Corner Rewards (loyalty_program_id=1)
INSERT INTO perks (loyalty_program_id, name, description, points_required) VALUES
(1, 'Free Espresso Shot', 'Add an extra shot to any drink.', 25),
(1, '50% Off Any Pastry', 'Enjoy a delicious pastry at half price.', 75);
-- Perks for Book Nook Loyalty (loyalty_program_id=2)
INSERT INTO perks (loyalty_program_id, name, description, points_required) VALUES
(2, '10% Off Next Purchase', 'Get 10% off your entire next purchase.', 50);

-- Sample Transactions
-- Bob (user_id=3) earns points at Coffee Corner (membership_id=1)
INSERT INTO transactions (user_id, member_wallet_address, store_id, loyalty_program_id, membership_id, transaction_type, points_changed, transaction_hash) VALUES
(3, '0xBobWalletAddress002', 1, 1, 1, 'earn', 20, '0xBlockchainHashEarn001');
-- Charlie (user_id=4) redeems a perk (perk_id=1 from Coffee Corner) at Coffee Corner (membership_id=2)
INSERT INTO transactions (user_id, member_wallet_address, store_id, loyalty_program_id, membership_id, perk_id, transaction_type, points_changed, transaction_hash) VALUES
(4, '0xCharlieWalletAddress003', 1, 1, 2, 1, 'redeem_perk', -25, '0xBlockchainHashRedeem001');
-- Admin adjustment for Bob (user_id=3) at Book Nook (membership_id=3)
INSERT INTO transactions (user_id, member_wallet_address, store_id, loyalty_program_id, membership_id, transaction_type, points_changed, notes) VALUES
(3, '0xBobWalletAddress002', 2, 2, 3, 'admin_adjustment', 10, 'Welcome bonus points');

-- Update membership points_balance based on initial transactions (simplified example)
-- In a real app, this would be handled by triggers or application logic.
UPDATE memberships SET points_balance = points_balance + 20 WHERE user_id = 3 AND loyalty_program_id = 1; -- Bob @ Coffee Corner Rewards
UPDATE memberships SET points_balance = points_balance - 25 WHERE user_id = 4 AND loyalty_program_id = 1; -- Charlie @ Coffee Corner Rewards
UPDATE memberships SET points_balance = points_balance + 10 WHERE user_id = 3 AND loyalty_program_id = 2; -- Bob @ Book Nook Loyalty

SELECT 'Database creation and sample data population complete.' AS status;

