# travel_compare_backend/Dockerfile
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Expose the backend port
EXPOSE 3001

# Start the server
CMD ["node", "index.js"]
