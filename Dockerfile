# 1) Etapa de build (incluye devDependencies)
FROM node:19-alpine3.15 AS build
WORKDIR /app

# Copio metadata y monto node_modules con Yarn v1 (clásico)
COPY package.json yarn.lock ./
RUN yarn install \
      --network-timeout 600000 \
      --network-concurrency 1

# Copio el resto del código y compilo
COPY . .
RUN yarn build


# 2) Etapa de producción (solo runtime)
FROM node:19-alpine3.15 AS prod
WORKDIR /app

# Copio artifacts del build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist         ./dist

# Inyecta tu versión al runtime
ARG APP_VERSION
ENV APP_VERSION=${APP_VERSION}

EXPOSE 3000

CMD ["node", "dist/main.js"]
