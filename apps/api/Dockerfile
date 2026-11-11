FROM node:22-bookworm-slim AS build

WORKDIR /app

COPY apps/api/package.json apps/api/package-lock.json ./
RUN npm ci

COPY apps/api/ ./
RUN npm run build

FROM node:22-bookworm-slim AS runtime

ENV NODE_ENV=production
WORKDIR /app

COPY --from=build /app/package.json /app/package-lock.json ./
# node-pg-migrate is currently a devDependency, so keep installed dependencies
# available in this image for the one-shot migration service.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/migrations ./migrations

EXPOSE 3000

CMD ["node", "dist/server.js"]
