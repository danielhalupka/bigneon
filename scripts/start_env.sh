#!/bin/bash

if [ -z $ENV ]; then
    ENV=$NODE_ENV
fi

if [ -z $NODE_ENV ]; then
    NODE_ENV=$ENV
fi

if [ "$ENV" = "production" ]; then
    npm install
    npm run build
    if [ ! -z "$PORT" ] && [ "$PORT" -ne 0 ]; then
        echo "Serving static files from $PORT"
	    ./node_modules/.bin/serve -s build
	fi
else
	npm run start
fi
