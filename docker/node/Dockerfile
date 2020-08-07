FROM node:12.13-alpine

# add bash
RUN apk update
RUN apk upgrade
RUN apk add bash

WORKDIR /app

COPY . /app

COPY ./docker/wait-for-it.sh /usr/local

RUN chmod +x /usr/local/wait-for-it.sh

CMD ["sh","-c","ls && /usr/local/wait-for-it.sh mongo-graph:27017 && npm install && npm run nodemon "]