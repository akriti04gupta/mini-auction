# ==== Base Image ====
FROM node:20-alpine AS build

# ==== Frontend Build ====
WORKDIR /app/frontend

# Copy frontend package files and install dependencies
COPY frontend/package*.json ./
RUN npm install

# Copy the rest of frontend code and build
COPY frontend/ ./
RUN npm run build

# ==== Backend Setup ====
WORKDIR /app/backend

# Copy backend code
COPY backend/ ./

# Copy the built frontend into backend/public
COPY --from=build /app/frontend/build ../backend/public

# ==== Install backend dependencies if any (skip if none) ====
# RUN npm install --omit=dev

# ==== Expose port and start backend ====
EXPOSE 5000
CMD ["node", "index.js"]
