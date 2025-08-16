# Dockerfile

# --- Stage 1: Build the React Frontend ---
FROM node:18-alpine AS builder

# Set a general working directory
WORKDIR /app

# Copy the frontend's package files first
COPY frontend/package*.json ./frontend/
# Change to the frontend directory to run npm install
WORKDIR /app/frontend
RUN npm install

# Copy the rest of the frontend source code
COPY frontend/ .
# Run the build
RUN npm run build


# --- Stage 2: Setup the Production Server ---
FROM node:18-alpine

WORKDIR /app

# Copy the backend's package files
COPY backend/package*.json ./
# Run npm install for the backend
RUN npm install --omit=dev

# Copy the rest of the backend source code
COPY backend/ .

# Copy the built frontend from the builder stage
COPY --from=builder /app/frontend/build ./public

EXPOSE 5000
CMD ["node", "index.js"]
