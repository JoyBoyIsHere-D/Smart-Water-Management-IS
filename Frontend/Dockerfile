# Frontend Dockerfile — multi-stage build
# Stage 1: Build the React/Vite app
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./
RUN npm install

# Copy the rest of the source
COPY . .

# Build the production bundle
# VITE_API_URL must be set at build time via --build-arg or .env
RUN npm run build

# Stage 2: Serve the built files using 'serve'
FROM node:18-alpine

RUN npm install -g serve

WORKDIR /app

# Copy only the built output from Stage 1
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]
