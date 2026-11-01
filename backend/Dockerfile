# Pro Security DevOps Dockerfile
FROM node:18-alpine

# Set Environment to production by default
ENV NODE_ENV=production

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
# Changed from 'npm ci' to 'npm install' because package-lock.json is missing
COPY package*.json ./
RUN npm install --only=production

# Copy application source
COPY . .

# Ensure the uploads directory exists and is writable by the non-root node user
RUN mkdir -p uploads && chown -R node:node /usr/src/app

# Switch to non-root user
USER node

# Expose port
EXPOSE 3000

# Healthcheck for container reliability
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD node -e "require('http').get('http://127.0.0.1:3000/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# Start the application
CMD [ "node", "server.js" ]
