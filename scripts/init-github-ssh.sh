#!/usr/bin/env bash

declare -r SSH_FILE="$(mktemp -u $HOME/.ssh/github)"

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

# Decrypt the file containing the private key
 openssl aes-256-cbc \
   -K $encrypted_6c9a730b25b5_key \
   -iv $encrypted_6c9a730b25b5_iv \
   -in ".travis/deploy_key.enc" \
   -out "$SSH_FILE" -d
# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

# Enable SSH authentication

chmod 600 "$SSH_FILE" && \
    printf "%s\n" \
      "Host github.com" \
      "  IdentityFile $SSH_FILE" \
      "  LogLevel ERROR" >> ~/.ssh/config


