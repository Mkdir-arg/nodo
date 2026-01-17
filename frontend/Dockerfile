FROM mcr.microsoft.com/devcontainers/javascript-node:20

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Configure npm for better network handling and install
RUN npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-timeout 300000 && \
    npm install --no-audit

# Copy source code (node_modules excluded by .dockerignore)
COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]
