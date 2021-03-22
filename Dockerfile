FROM node:14.16.0-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm i --only=development && npm uninstall argon2 && npm i argon2 && npm install --save-dev ansi-styles
COPY . .
ENV NODE_ENV=development
RUN npm run build

FROM node:14.16.0-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY --from=development /app/dist ./dist
ENV NODE_ENV=production
EXPOSE $PORT
CMD ["node", "dist/src/main"]
