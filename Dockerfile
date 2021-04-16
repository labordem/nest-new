FROM node:14.16.0-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm i --only=development && npm uninstall argon2 && npm i argon2 && npm i -D ansi-styles
COPY . .
ENV NODE_ENV=development
RUN npm run build

FROM node:14.16.0-alpine AS production
RUN apk add dumb-init
USER node
WORKDIR /app
COPY --chown=node:node package*.json ./
ENV NODE_ENV=production
RUN npm i --only=production
COPY --chown=node:node --from=development /app/dist ./dist
EXPOSE $PORT
CMD ["dumb-init", "node", "dist/src/main"]
