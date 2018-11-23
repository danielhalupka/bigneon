#!/bin/sh

npm install --production
npm install --only=dev 
npm run build
