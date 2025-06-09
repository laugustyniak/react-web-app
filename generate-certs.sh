#!/bin/bash

# Create certs directory if it doesn't exist
mkdir -p certs

# Generate private key
openssl genrsa -out certs/localhost.key 2048

# Generate certificate signing request
openssl req -new -key certs/localhost.key -out certs/localhost.csr -subj "/C=US/ST=CA/L=San Francisco/O=Development/CN=localhost"

# Generate self-signed certificate
openssl x509 -req -in certs/localhost.csr -signkey certs/localhost.key -out certs/localhost.crt -days 365 -extensions v3_req -extfile <(cat <<EOF
[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = 127.0.0.1
IP.1 = 127.0.0.1
EOF
)

# Clean up CSR file
rm certs/localhost.csr

echo "✅ SSL certificates generated successfully!"
echo "📁 Certificate: certs/localhost.crt"
echo "🔑 Private key: certs/localhost.key"
echo ""
echo "⚠️  Note: You'll need to accept the self-signed certificate in your browser"
