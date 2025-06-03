# HashPerks

## Steps to Develop

1. Go into each directory and execute:

```bash
npm install
```

2. Open two terminal and go into `smart-contract` folder

3. In one of the terminal, execute:

```bash
npx hardhat node
```

4. In the other terminal, execute:

```bash
npx hardhat run ./scripts/deploy.js --network localhost
```

5. Create .env file in _api_ folder and write this inside it:

```dotenv
PORT=3001
NODE_ENV=development

BLOCKCHAIN_RPC_URL="http://127.0.0.1:8545"

BACKEND_WALLET_PRIVATE_KEY=<FIRST PRIVATE KEY ON HARDHATE NODE>
FACTORY_DEPLOYER_PRIVATE_KEY=<FIRST PRIVATE KEY ON HARDHATE NODE>
```

6. Open new terminal in the _api_ folder and execute this command:

```bash
npm run dev
```

7. Create .env.local file in _frontend_ and write this inside it:

```dotenv
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:3001/api/v1
```

8. Open new terminal in the _frontend_ folder and execute this command:

```bash
npm run dev
```

---

<h1>Enjoy Developing!</h1>
