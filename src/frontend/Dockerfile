# Use an official Node runtime as a parent image
FROM node:14-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the local directory's contents into the container at /app
COPY . .

# Install dependencies using npm or yarn
RUN npm install

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Define the command to run your React application when the container starts
CMD ["npm", "start"]
