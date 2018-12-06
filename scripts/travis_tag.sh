#!/usr/bin/env bash

set -e

if [[ -z "$CI" ]]; then
    echo "Script should be run in travis only"
    exit 1
fi

echo "+git checkout master"
git checkout master
echo "+git remote add sshremote git@github.com:big-neon/bn-web.git"
git remote add sshremote git@github.com:big-neon/bn-web.git
echo "+npm run release:patch"
npm version patch
git push sshremote master
git push sshremote --tags

