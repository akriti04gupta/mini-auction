# ----------------------------
# Base image
# ----------------------------
FROM node:20-alpine AS base
WORKDIR /app

# ----------------------------
# Build frontend
# ----------------------------
FROM base AS build-frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ----------------------------
# Build backend
# ----------------------------
FROM base AS build-backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --omit=dev
COPY backend/ ./

# ----------------------------
# Final image
# ----------------------------
FROM node:20-alpine
WORKDIR /app

# Copy backend
COPY --from=build-backend /app/backend ./

# Copy frontend build into backend public folder
COPY --from=build-frontend /app/frontend/build ./frontend/build

# Expose port
EXPOSE 5000

# Start backend
CMD ["node", "index.js"]


# Copy frontend build into backend folder
COPY --from=build-frontend /app/frontend/build ./frontend/build

EXPOSE 5000
CMD ["node", "index.js"]
