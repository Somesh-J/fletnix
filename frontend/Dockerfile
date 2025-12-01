# FletNix Frontend - Production Dockerfile for Railway
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application (VITE_API_URL set via Railway env vars at build time)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Install serve to run the static files
RUN npm install -g serve

# Railway sets PORT environment variable
ENV PORT=3000

EXPOSE $PORT

# Serve the built application
CMD serve -s dist -l $PORT
