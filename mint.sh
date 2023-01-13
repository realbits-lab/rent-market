#!/bin/sh

# Loop count.
loop_count=2940
nft_owner_address=0x1e60Cf7B8fB0B7EaD221CF8D0e7d19c863FfbE40
metadata_url="https://js-nft.s3.ap-northeast-2.amazonaws.com/json"

echo "-- Mint"
for (( i = 2; i <= $loop_count; i++ ))
do
	hh safeMint --name testNFT --address $nft_owner_address --uri "${metadata_url}/${i}.json"
done