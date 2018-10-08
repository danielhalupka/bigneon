FROM node:9.11

RUN mkdir /app
WORKDIR /app
ADD . /app/
RUN npm install

CMD ["bash", "./scripts/start_env.sh"]