# Dockerfile

# --- Stage 1: Build the React Frontend ---
FROM node:18-alpine AS builder

# Set the main working directory
WORKDIR /app

# Copy the entire project context (both frontend and backend folders)
COPY . .

# Set the working directory to the frontend to build it
WORKDIR /app/frontend
RUN npm install
RUN npm run build


# --- Stage 2: Setup the Production Server ---
FROM node:18-alpine

WORKDIR /app

# Copy the backend's package files from the project context
COPY backend/package*.json ./
# Run npm install for the backend
RUN npm install --omit=dev

# Copy the rest of the backend source code
COPY backend/ .

# Copy the built frontend from the builder stage
COPY --from=builder /app/frontend/build ./public

EXPOSE 5000
CMD ["node", "index.js"]
