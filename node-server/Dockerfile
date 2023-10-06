# Use the official Node.js 18 image as the base
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the remaining application files
COPY . .

# Set the command to start the Node.js server
CMD ["npx", "nodemon", "index.js"]

# Expose the port for the Node.js server
EXPOSE 5001