#!/usr/bin/env bash

declare -r SSH_FILE="$(mktemp -u $HOME/.ssh/githubXXX)"

# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

# Decrypt the file containing the private key
 openssl aes-256-cbc \
   -K $encrypted_0f38ef5cd5f1_key \
   -iv $encrypted_0f38ef5cd5f1_iv \
   -in ".travis/github_deploy_key.enc" \
   -out "$SSH_FILE" -d
# - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

# Enable SSH authentication

chmod 600 "$SSH_FILE" && \
    printf "%s\n" \
      "Host github.com" \
      "  IdentityFile $SSH_FILE" \
      "  LogLevel ERROR" >> ~/.ssh/config


