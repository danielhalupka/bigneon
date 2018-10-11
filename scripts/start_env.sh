#!/bin/bash

if [ -z $ENV ]; then
    ENV=$NODE_ENV
fi

if [ "$ENV" = "production" ]; then
    npm install
    npm run build
	./node_modules/.bin/serve -s build
else
echo not
	npm run start
fi
