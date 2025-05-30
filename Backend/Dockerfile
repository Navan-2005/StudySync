# Use a specific Node.js version (good!)
FROM node:18.9.1

# Set working directory inside the container
WORKDIR /app

# Copy package files first (for caching layer in Docker builds)
COPY package.json package-lock.json* ./

# Install dependencies inside the container (no local node_modules)
RUN npm install

# Copy the remaining source code
COPY . .

# Expose port your backend listens on
EXPOSE 3000

# Start the backend server
CMD ["node", "server.js"]
