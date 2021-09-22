FROM node:14.16.0-alpine AS development
ENV NODE_ENV=development
WORKDIR /app
RUN chown -R node:node /app
USER node
COPY package*.json ./
RUN npm ci --include=dev
COPY . .
RUN npm run build

FROM node:14.16.0-alpine AS production
ENV NODE_ENV=production
WORKDIR /app
RUN chown -R node:node /app
USER node
COPY package*.json ./
COPY --from=development /app/dist /app/dist
RUN npm ci --omit=dev
EXPOSE $PORT
CMD ["node", "dist/src/main"]
