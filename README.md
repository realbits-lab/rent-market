# Rent market

[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)
<a href="http://www.repostatus.org/#active"><img src="http://www.repostatus.org/badges/latest/active.svg" /></a>

## Getting started

## Install npm

```bash
foo@bar:~$ npm i --legacy-peer-deps
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

## Use remix

- If you want to use [REMIX](https://remix.ethereum.org/) IDE, install remixd and run.

```bash
foo@bar:~$ remixd
```

## Use hardhat

- If you want to use hardhat, use hardhat command.
- Check contract size.

```bash
hh size-contracts (--no-compile)
```

## Build package

- For development.

```bash
foo@bar:~$ cd package
foo@bar:~$ npm run build:development
```

- For production.

```bash
foo@bar:~$ cd package
foo@bar:~$ npm run build:production
```

## Use ethernal

- https://app.tryethernal.com/

## Hardhat test

- Set NETWORK in .env to localhost
- hardhat-ethernal@3.1.0 package has a problem in resolving dependency

## Deploy rent market contract

- check NETWORK in .env
- hh deployRentMarket --contract rentMarket
- Change NEXT_PUBLIC_RENT_MARKET_CONTRACT_ADDRESS in rent-content .env

## If you change rent market contract

### Change development configuration

- Change rent market contract address in prompt-nft .env
- Change rent market contract address in rent-content .env
- Change rent market contract address in rent-market .env

### Re-register

- Re-register collection (including payment nft)
- Re-register service
- Re-register token

### Change prompt nft configuration

- Change rent market address in prompt nft with changeRentMarketContract function.

### Change reward token share configuration for market contract address setting

- Change the getRentMarketContractAddressArray data for a new rent market contract address.
- Use addRentMarketContractAddress or removeRentMarketContractAddress function.

### Change production service configuration

- Change fictures service configuration
- Change market service configuration
- Change other services configuration

## Change .env variables for selecting blockchain network

- ACCOUNT_PRIVATE_KEY
- RENTMARKET_CONTRACT_ADDRESS
- NFT_CONTRACT_ADDRESS
- REWARD_TOKEN_CONTRACT_ADDRESS
- REWARD_TOKEN_SHARE_CONTRACT_ADDRESS
- TEST_TOKEN_CONTRACT_ADDRESS
- NETWORK