FROM node:22
ENV NODE_ENV production

WORKDIR /usr/src/app

COPY ./app ./app
COPY ./migrations ./migrations
COPY ./migrate-mongo-config.js ./
COPY ./package*.json ./

RUN yarn

EXPOSE 4200

CMD ["yarn", "run", "start"]
