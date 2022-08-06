Based on official Harmony docs:

https://docs.harmony.one/home/developers/deploying-on-harmony/using-hardhat

### Setup environment
1) Create .env file
`touch .env`
2) Add private key
`HARMONY_PRIVATE_KEY=12345`

### Install dependencies
`npm i`

### Compile
`npx hardhat compile`

### Running tests
`
npx hardhat test
`

### Deployment

```
npx hardhat run scripts/deploy.js --network mainnet
```

### Verification
```
npx hardhat verify --network mainnet 0xa5058569A9563374A111577C24E702AfD1438F8E
```


