#!/bin/sh -x

# Prepare static files such as web workers and WASM

# Prepare static directories
mkstatic() {
  [ ! -d static/$1 ] && mkdir static/$1 || rm -f static/$1/*
}
mkstatic argon2
mkstatic ed25519

# Copy static files
cp node_modules/@very-amused/argon2-wasm/build/* static/argon2/
cp node_modules/@very-amused/ed25519-wasm/build/* static/ed25519/

# Ensure static files and directories are world-accessible
# Set all static directories to 755
for dir in `find static -type d`; do
  chmod 755 "$dir"
done

# Set all static files to 644
for file in `find static -type f`; do
  chmod 644 "$file"
done