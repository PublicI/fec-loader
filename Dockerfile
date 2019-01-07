FROM node:10.14-alpine

# https://github.com/nodejs/docker-node/blob/master/6/onbuild/Dockerfile
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV
COPY . /usr/src/app
RUN apk --update add git && rm -rf /var/cache/apk/*
RUN npm ci && npm cache clean --force

CMD ["npm", "start"]
