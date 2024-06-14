# Use the official Node.js 18 image as the base
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Install Yarn
# RUN npm install -g yarn

# Copy package.json and yarn.lock
# COPY package.json yarn.lock ./
# COPY package.json ./
COPY package.json .yarnrc.yml ./

# Install the dependencies
# RUN yarn
RUN npm i

# Set the command to start the React application in development mode
CMD ["npm", "run", "dev"]

# Expose the port for the frontend application
EXPOSE 5180
