FROM node:16

WORKDIR /usr/src/app

COPY ./app ./app
COPY ./migrations ./migrations
COPY ./migrate-mongo-config.js ./
COPY ./package*.json ./

RUN npm i

EXPOSE 7000

CMD ["npm", "run", "start"]
