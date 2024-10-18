#!/bin/bash

# Define the HMAC secret, payload, and timestamp
HMAC_SECRET="your_default_hmac_secret"
TIMESTAMP=$(date +%s)

# Define the payload for creating a new asset
# Example asset with ID, Color, Size, Owner, and AppraisedValue
PAYLOAD=$(echo -n '{
    "functionName": "CreateAsset",
    "args": ["asset27", "blue", "10", "Alice", "5000"]
}' | jq -c .)

# Generate HMAC signature using the payload and timestamp
SIGNATURE=$(echo -n "$PAYLOAD$TIMESTAMP" | openssl dgst -sha256 -hmac "$HMAC_SECRET" | sed 's/^.* //')

# Debugging - print out the variables to verify
echo "Client Payload: $PAYLOAD"
echo "Client Timestamp: $TIMESTAMP"
echo "Client Signature: $SIGNATURE"
echo "Client HMAC_SECRET: $HMAC_SECRET"

# Execute the cURL command for write operation (create asset) in v1
curl -X POST http://localhost:3000/v1/chaincode/write \
-H "Content-Type: application/json" \
-H "x-api-key: your_default_api_key" \
-H "x-signature: $SIGNATURE" \
-H "x-timestamp: $TIMESTAMP" \
-d "$PAYLOAD"
