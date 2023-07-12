# Install npm

```console
foo@bar:~$ npm i --legacy-peer-deps
```

- hardhat-ethernal@3.1.0 package has a problem in resolving dependency

# Use remix

- If you want to use [REMIX](https://remix.ethereum.org/) IDE, install remixd and run.

```console
foo@bar:~$ remixd
```

# Use hardhat

- If you want to use hardhat, use hardhat command.

# Build package

- For development.

```console
foo@bar:~$ cd package
foo@bar:~$ npm run build:development
```

- For production.

```console
foo@bar:~$ cd package
foo@bar:~$ npm run build:production
```

# Use ethernal

- https://app.tryethernal.com/

# Hardhat test

- Set NETWORK in .env to localhost

# Deploy rent market contract

- check NETWORK in .env
- hh deployRentMarket --contract rentMarket --exclusive {true|false}
- Change NEXT_PUBLIC_RENT_MARKET_CONTRACT_ADDRESS in rent-content .env