FROM node:20-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 5173

# Start development server with host flag
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]