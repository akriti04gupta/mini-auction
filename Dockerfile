# ---------- Stage 1: Build React frontend ----------
FROM node:18 AS build-frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ---------- Stage 2: Build backend + serve frontend ----------
FROM node:18 AS build-backend
WORKDIR /app

# Install backend deps
COPY backend/package*.json ./
RUN npm install --omit=dev
COPY backend/ ./

# Copy frontend build into backend folder
COPY --from=build-frontend /app/frontend/build ./frontend/build

EXPOSE 5000
CMD ["node", "index.js"]
