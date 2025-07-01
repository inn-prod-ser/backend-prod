# --- 1) Imagen base con Yarn Classic v1 activado
FROM node:19-alpine3.15 AS base
# Habilitamos Corepack y preparamos Yarn@1.22.19 (Classic)
RUN corepack enable && corepack prepare yarn@1.22.19 --activate
WORKDIR /app
COPY package.json yarn.lock ./

# --- 2) Instalo deps de desarrollo (crea node_modules con Yarn v1)
FROM base AS dev-deps
RUN yarn install \
      --frozen-lockfile \
      --network-timeout 600000

# --- 3) Compilo el proyecto
FROM base AS builder
WORKDIR /app
COPY --from=dev-deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

# --- 4) Instalo sólo deps de producción
FROM base AS prod-deps
RUN yarn install \
      --production \
      --frozen-lockfile \
      --network-timeout 600000

# --- 5) Imagen final
FROM node:19-alpine3.15 AS prod
# Volvemos a activar Yarn v1 para cualquier script que lo necesite
RUN corepack enable && corepack prepare yarn@1.22.19 --activate
WORKDIR /app
ARG APP_VERSION
ENV APP_VERSION=${APP_VERSION}

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder   /app/dist         ./dist

EXPOSE 3000
CMD ["node", "dist/main.js"]
