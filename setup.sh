#!/bin/sh

# Sample base uri
# Must have a tail "/"
# https://js-nft.s3.ap-northeast-2.amazonaws.com/json/
# Sample token uri
# https://js-nft.s3.ap-northeast-2.amazonaws.com/json/1

# Local network
# rentMarket : 0xa513E6E4b8f2a923D98304ec87F64353C4D5C853
# testNFT : 0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6
# testToken : 0x8A791620dd6260079BF849Dc5567aDC3F2FdC318

# Mumbai network
# rentMarket : 0xe0831b91EBf62f7921eE8ED7C4f4ec4B489dDe8f
# testNFT : 0x82087ff39e079c44b98c3abd053f734b351d5b20
# testToken : 0xD3AFd6f8941fcdB8Bdb8bBb6dff6E8e5C3e8964D

mode="rent"
while :; do
    case $1 in
        -l|--localhost) network="localhost"            
        ;;
        -m|--mumbai) network="mumbai"            
        ;;
        -p|--prompt) mode="prompt"
        ;;
        *) break
    esac
    shift
done

echo $network

if [ "$network" = "localhost" ]; then
	echo "-- localhost network"

	# 1. Set NFT owner and contract address.
	# address 1 of local host
	rentmarket_contract_address=0xa513E6E4b8f2a923D98304ec87F64353C4D5C853
	nft_owner_address=0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
	nft_contract_address=0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6

	# 2. Set collection contract address and metadata uri.
	collection_contract_address=0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6
	collection_uri="https://js-nft.s3.ap-northeast-2.amazonaws.com/collection.json"

	# 3. Set service EOA address and metadata uri.
	# address 2 of local host
	service_eoa_address=0x70997970C51812dc3A010C7d01b50e0d17dc79C8
	service_uri="https://realbits-snapshot.s3.ap-northeast-2.amazonaws.com/realbits-snapshot.json"

	# 4. Set token contract address and name.
	test_token_address=0x8A791620dd6260079BF849Dc5567aDC3F2FdC318
	test_token_name="testToken"
elif [ "$network" = "mumbai" ]; then
	echo "-- mumbai network"

	# 1. Set NFT owner and contract address.
	# address 1 of local host
	rentmarket_contract_address=0xe0831b91EBf62f7921eE8ED7C4f4ec4B489dDe8f
	nft_owner_address=0x1e60Cf7B8fB0B7EaD221CF8D0e7d19c863FfbE40
	nft_contract_address=0xEc5c525B98F1c7Ae02a802Bb9f64a96d1621eBbE

	# 2. Set collection contract address and metadata uri.
	collection_contract_address=0x1e60Cf7B8fB0B7EaD221CF8D0e7d19c863FfbE40
	collection_uri="https://js-nft.s3.ap-northeast-2.amazonaws.com/collection.json"

	# 3. Set service EOA address and metadata uri.
	# address 2 of local host
	service_eoa_address=0x1e60Cf7B8fB0B7EaD221CF8D0e7d19c863FfbE40
	service_uri="https://realbits-snapshot.s3.ap-northeast-2.amazonaws.com/realbits-snapshot.json"

	# 4. Set token contract address and name.
	test_token_address=0xD3AFd6f8941fcdB8Bdb8bBb6dff6E8e5C3e8964D
	test_token_name="testToken"
else
	echo "-- N/A network"
	exit
fi

# Metadata json file IPFS CID.
cid=bafybeiervowpq3fr3nydb3taxaqkusutnduv7kuspo6b27kolt7myw4piu
# metadata_url="ipfs://${cid}"
# Don't add tail "/" after url.
metadata_url="https://js-nft.s3.ap-northeast-2.amazonaws.com/json"

# Loop count.
loop_count=5

if [ "$mode" = "prompt" ]; then
	echo "-- prompt mode"
	exclusive=false
	nft_name="promptNFT"
	nft_symbol="PNT"
elif [ "$mode" = "rent" ]; then
	echo "-- rent mode"
	exclusive=true
	nft_name="rentNFT"
	nft_symbol="RNT"
else
	echo "-- else mode"
	exclusive=true
	nft_name="rentNFT"
	nft_symbol="RNT"
fi
token_name="testToken"
token_symbol="TTT"

# Deploy rentMarket and testNFT contract.
echo "-- Deploy rentMarket"
hh deployRentMarket --contract rentMarket --exclusive $exclusive
#hh verify $deployed_contract_address

echo "-- Deploy NFT"
if [ "$mode" = "prompt" ]; then
	hh deployPromptNftContract --contract $nft_name --name $nft_name --symbol $nft_symbol --address $rentmarket_contract_address
else
	hh deployContract --contract $nft_name --name $nft_name --symbol $nft_symbol
fi
#hh verify $deployed_contract_address

echo "-- Deploy testToken"
hh deployContract --contract testToken --name $token_name --symbol $token_symbol
#hh verify $deployed_contract_address

# Mint.
if [ "$mode" = "rent" ]; then
	echo "-- Mint"
	for (( i = 1; i <= $loop_count; i++ ))
	do
		hh safeMint --contract $nft_name --address $nft_owner_address --uri "${metadata_url}/${i}.json"
	done
fi

# Register service.
# use addr2 in localhost.
echo "-- Register collection"
hh registerCollection --contract rentMarket --address $collection_contract_address --uri $collection_uri

echo "-- Register service"
hh registerService --contract rentMarket --address $service_eoa_address --uri $service_uri

# echo "-- Register token"
# hh registerToken --name rentMarket --address $test_token_address --token $test_token_name

# Register NFT.
if [ "$mode" = "rent" ]; then
	echo "-- Register NFT"
	for (( i = 1; i <= $loop_count; i++ ))
	do
		hh registerNFT --contract rentMarket --address $nft_contract_address --token $i
	done
fi
