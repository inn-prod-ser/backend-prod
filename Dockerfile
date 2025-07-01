# Usamos Node+Alpine
FROM node:19-alpine3.15

WORKDIR /app

# 1) Instalo Yarn Classic v1, bypass Corepack/Berry
RUN npm install -g yarn@1.22.19

# 2) Copio lockfile y package.json y monto node_modules
COPY package.json yarn.lock ./
RUN yarn install \
      --frozen-lockfile \
      --network-timeout 600000

# 3) Copio el resto y compilo
COPY . .
RUN yarn build

# 4) Runtime
ARG APP_VERSION
ENV APP_VERSION=${APP_VERSION}
EXPOSE 3000

CMD ["node", "dist/main.js"]
