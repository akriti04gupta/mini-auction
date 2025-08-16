# Dockerfile

# --- Stage 1: Build the React Frontend (No changes here) ---
FROM node:18-alpine AS builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build


# --- Stage 2: Setup the Production Server (IMPROVED) ---
FROM node:18-alpine

# Set the working directory for the entire application.
WORKDIR /app

# Copy the backend's package.json and package-lock.json first for caching.
COPY backend/package*.json ./

# Install backend dependencies in the root of our app directory.
RUN npm install --production

# Copy the rest of the backend source code.
COPY backend/ .

# Copy the built static files from the 'builder' stage (Stage 1)
# into a 'public' directory.
COPY --from=builder /app/frontend/build ./public

# Expose the port the backend server will run on.
EXPOSE 5000

# The command to start the backend server.
CMD ["node", "index.js"]
