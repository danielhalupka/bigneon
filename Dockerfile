FROM node:9.11

RUN mkdir /app
WORKDIR /app
ADD . /app/
RUN npm install

CMD ["./scripts/start_env.sh"]
USER node
