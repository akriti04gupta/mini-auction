# ==== Frontend Build Stage ====
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# ==== Backend Stage ====
FROM node:20-alpine AS backend

WORKDIR /app/backend

# Copy backend code
COPY backend/ ./

# Copy frontend build into backend/public
COPY --from=frontend-build /app/frontend/build ./public

# Expose backend port
EXPOSE 5000

# Start backend
CMD ["node", "index.js"]
