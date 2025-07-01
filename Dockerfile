# 1) deps de desarrollo con Yarn v4
FROM node:19-alpine3.15 as dev-deps
WORKDIR /app

# activar Corepack y preparar Yarn Berry (v4.x)
RUN corepack enable \
 && corepack prepare yarn@stable --activate

# copiar config de Yarn Berry + lockfile
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

# instalar deps con formato Berry
RUN yarn install --immutable --network-concurrency 1 --network-timeout 600000

# 2) build
FROM node:19-alpine3.15 as builder
WORKDIR /app
COPY --from=dev-deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

# 3) deps de prod
FROM node:19-alpine3.15 as prod-deps
WORKDIR /app

# volver a preparar el mismo Yarn v4
RUN corepack enable \
 && corepack prepare yarn@stable --activate

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

RUN yarn install --production --immutable --network-concurrency 1 --network-timeout 600000

# 4) imagen final
FROM node:19-alpine3.15 as prod
WORKDIR /app
ARG APP_VERSION
ENV APP_VERSION=${APP_VERSION}
EXPOSE 3000

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder   /app/dist         ./dist

CMD ["node","dist/main.js"]
