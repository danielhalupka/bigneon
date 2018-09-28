#!/bin/bash
if [ "$ENV" = "production" ]; then
	./node_modules/.bin/serve -s build
else
	npm run start
fi
