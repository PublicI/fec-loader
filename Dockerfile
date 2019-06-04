FROM publicintegrity/loader

RUN pip install awscli
RUN apk --update add jq sed curl gzip && rm -rf /var/cache/apk/*

# https://github.com/nodejs/docker-node/blob/master/6/onbuild/Dockerfile
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV
COPY . /usr/src/app
RUN npm ci && npm cache clean --force

CMD ["node","./bin/fec"]
