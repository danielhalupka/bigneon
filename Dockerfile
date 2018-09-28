FROM node:9.11

RUN mkdir /app
WORKDIR /app
ADD . /app/
RUN npm install && npm run build

CMD ["./scripts/start_env.sh"]
USER node
