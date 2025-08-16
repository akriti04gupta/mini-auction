# Dockerfile

# --- Stage 1: Build the React Frontend ---
FROM node:18-alpine AS builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build


# --- Stage 2: Setup the Production Server (FINAL, MOST EXPLICIT) ---
FROM node:18-alpine

# Set the working directory for the application.
WORKDIR /app

# 1. Copy ONLY the package.json and package-lock.json from the backend.
# This is a very explicit step to ensure these files exist before anything else.
COPY backend/package.json ./
COPY backend/package-lock.json ./

# 2. Now, run npm install.
# It will only install dependencies based on the package files.
RUN npm install --omit=dev

# 3. Now, copy the rest of your backend source code.
COPY backend/ .

# 4. Copy the built frontend from the 'builder' stage.
COPY --from=builder /app/frontend/build ./public

# Expose the port and set the start command.
EXPOSE 5000
CMD ["node", "index.js"]
