FROM node:20.12.2-alpine

WORKDIR /app

COPY package.json yarn.lock ./

RUN corepack enable && corepack prepare yarn@4.8.0 --activate
RUN yarn install --immutable

COPY . .

RUN yarn build

ENV NODE_ENV=production

CMD ["node", "dist/main.js"]
