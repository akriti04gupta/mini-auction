# Dockerfile

# --- Stage 1: Build the React Frontend (No changes here) ---
FROM node:18-alpine AS builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build


# --- Stage 2: Setup the Production Server (FINAL, MOST RELIABLE) ---
FROM node:18-alpine

# Set the working directory for the entire application.
WORKDIR /app

# Copy the ENTIRE backend source code first.
# This is a more robust approach that ensures all files, including package.json,
# are in place before we try to install anything.
COPY backend/ .

# Now that all files are present, install the production dependencies.
# We use the modern --omit=dev flag as recommended by npm.
RUN npm install --omit=dev

# Copy the built static files from the 'builder' stage (Stage 1)
# into a 'public' directory.
COPY --from=builder /app/frontend/build ./public

# Expose the port the backend server will run on.
EXPOSE 5000

# The command to start the backend server.
CMD ["node", "index.js"]
