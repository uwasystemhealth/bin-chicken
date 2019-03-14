FROM node:10-alpine

RUN NODE_ENV=production
RUN apk update
RUN apk add nginx certbot

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm pack

EXPOSE 9002 80 443
CMD [ "npm", "start" ]

