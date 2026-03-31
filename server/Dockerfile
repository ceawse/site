FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the server code
COPY . .

# Ensure the uploads directory exists
RUN mkdir -p uploads

# Expose the port the app runs on
EXPOSE 5000

# Start the server
CMD ["npm", "start"]
