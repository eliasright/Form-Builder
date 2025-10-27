FROM node:20-alpine

WORKDIR /app

# Install Vite globally as fallback
RUN npm install -g vite

# Copy package files first for better caching
COPY package*.json ./

# Clear npm cache and install dependencies with verbose logging
RUN npm cache clean --force && \
    npm install --verbose

# Copy source code
COPY . .

# Expose port
EXPOSE 5179

# Start development server with host flag
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5179"]