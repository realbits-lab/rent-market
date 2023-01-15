#!/bin/sh

rm -rf flatten_contracts/
mkdir flatten_contracts/

hh flat contracts/rentNFT.sol > flatten_contracts/flattenRentNFT.sol
hh flat contracts/promptNFT.sol > flatten_contracts/flattenPromptNFT.sol
hh flat contracts/rentMarket.sol > flatten_contracts/flattenRentMarket.sol
hh flat contracts/iterableMapLib.sol > flatten_contracts/flattenIterableMapLib.sol