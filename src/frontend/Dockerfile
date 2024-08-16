# Use an official Node runtime as a parent image for building the React application
FROM node:20-bullseye-slim as build

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json files to the working directory
COPY package.json .

# Install dependencies using npm and install react-scripts globally with silent flag
RUN npm install 

# Copy the entire local directory's contents into the container at /app
COPY src/ ./src/
COPY public/ ./public/

# Build the React application
RUN npm run build

# Use the official Nginx stable image for serving the built React application
FROM nginx:stable-alpine

# Copy the build output from the previous stage to the Nginx html directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 to allow external access
EXPOSE 80

# Define the command to run Nginx in the foreground to serve the React application
CMD ["nginx", "-g", "daemon off;"]
