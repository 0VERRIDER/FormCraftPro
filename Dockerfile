FROM node:20-alpine

WORKDIR /app

# Install build dependencies for bcrypt and netcat (for wait-for-it script)
RUN apk add --no-cache python3 make g++ netcat-openbsd

# Copy package files first for better caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Make entrypoint script executable
RUN chmod +x docker-entrypoint.sh wait-for-it.sh

# Set environment variables
ENV NODE_ENV=production

# Expose port 5000
EXPOSE 5000

# Start the application
ENTRYPOINT ["./docker-entrypoint.sh"]