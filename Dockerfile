FROM node:20.12.2-alpine

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

RUN yarn build

ENV NODE_ENV=production

CMD ["node", "dist/main.js"]
