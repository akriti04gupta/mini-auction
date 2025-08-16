# ==== Frontend Build Stage ====
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend

# Copy frontend package.json and install dependencies
COPY frontend/package*.json ./
RUN npm install

# Copy frontend source code and build
COPY frontend/ ./
RUN npm run build

# ==== Backend Stage ====
FROM node:20-alpine AS backend

WORKDIR /app/backend

# Copy backend code
COPY backend/ ./

# Copy root package.json (backend dependencies) and install
COPY package*.json ./
RUN npm install --omit=dev

# Copy frontend build into backend/public
COPY --from=frontend-build /app/frontend/build ./public

# Expose backend port
EXPOSE 5000

# Start backend
CMD ["node", "index.js"]
