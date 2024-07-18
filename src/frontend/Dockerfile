# Use an official Node runtime as a parent image
FROM node:14-alpine

# Set the working directory in the container
WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json

# Install dependencies using npm or yarn
RUN npm install

# Copy the local directory's contents into the container at /app
COPY . .

# Define the command to run your React application when the container starts
CMD ["npm", "start"]
