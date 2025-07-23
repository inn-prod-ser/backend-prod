FROM node:20.12.2-alpine

WORKDIR /app

COPY . .

RUN corepack enable && corepack prepare yarn@4.8.0 --activate
RUN yarn config set nodeLinker node-modules
RUN yarn install --immutable --mode=skip-build
RUN yarn build

ENV NODE_ENV=production

CMD ["node", "dist/main.js"]
