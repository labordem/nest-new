FROM node:14.16.0-alpine AS development
WORKDIR /app
COPY package*.json ./
ENV NODE_ENV=development
COPY . .
RUN chown -R node:node /app
USER node
RUN npm ci
RUN npm run build

FROM node:14.16.0-alpine AS production
RUN apk add dumb-init
WORKDIR /app
COPY package*.json ./
ENV NODE_ENV=production
COPY --from=development /app/dist /app/dist
EXPOSE $PORT
RUN chown -R node:node /app
USER node
RUN npm ci --production
CMD ["dumb-init", "node", "dist/src/main"]
