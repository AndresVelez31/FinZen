# Stage 1: install dependencies and build the Nuxt app (prerendered blog + Nitro server)
FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: run only the .output folder produced by the build (it bundles its own dependencies)
FROM node:24-alpine
WORKDIR /app
ENV HOST=0.0.0.0 PORT=3000 NODE_ENV=production
COPY --from=builder /app/.output ./.output
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
