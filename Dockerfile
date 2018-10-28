FROM alpine:3.8
RUN apk --update add bash postgresql-client jq sed && rm -rf /var/cache/apk/*
