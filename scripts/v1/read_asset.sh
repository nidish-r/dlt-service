#!/bin/bash

# Define the HMAC secret, payload, and timestamp
HMAC_SECRET="your_default_hmac_secret"
TIMESTAMP=$(date +%s)

# Serialize the payload to ensure consistent formatting
PAYLOAD=$(echo -n '{"functionName": "ReadAsset", "args": ["asset27"]}' | jq -c .)

# Generate HMAC signature using the payload and timestamp
SIGNATURE=$(echo -n "$PAYLOAD$TIMESTAMP" | openssl dgst -sha256 -hmac "$HMAC_SECRET" | sed 's/^.* //')

# Debugging - print out the variables to verify
echo "Client Payload: $PAYLOAD"
echo "Client Timestamp: $TIMESTAMP"
echo "Client Signature: $SIGNATURE"
echo "Client HMAC_SECRET: $HMAC_SECRET"

# Execute the cURL command
curl -X POST http://localhost:3000/v1/chaincode/read \
-H "Content-Type: application/json" \
-H "x-api-key: your_default_api_key" \
-H "x-signature: $SIGNATURE" \
-H "x-timestamp: $TIMESTAMP" \
-d "$PAYLOAD"