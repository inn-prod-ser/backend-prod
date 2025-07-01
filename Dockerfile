FROM node:19-alpine3.15 as dev-deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install \
      --frozen-lockfile \
      --network-concurrency 1 \
      --network-timeout 600000

FROM node:19-alpine3.15 as builder
WORKDIR /app
COPY --from=dev-deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

FROM node:19-alpine3.15 as prod-deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install \
      --production \
      --frozen-lockfile \
      --network-concurrency 1 \
      --network-timeout 600000

FROM node:19-alpine3.15 as prod
EXPOSE 3000
WORKDIR /app
ARG APP_VERSION
ENV APP_VERSION=${APP_VERSION}
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder   /app/dist         ./dist
CMD ["node","dist/main.js"]
