FROM node:24

RUN apt update -y && \
    apt install sqlite3

WORKDIR /app

USER node