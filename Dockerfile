FROM mhart/alpine-node:10.13 as builder

RUN apk update && \
	apk add git
#Create the app dir and install all of the dependencies
WORKDIR /app
COPY . ./
CMD ["./scripts/build_prod.sh"]
