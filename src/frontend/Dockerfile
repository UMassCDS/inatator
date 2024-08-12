# Use an official Node runtime as a parent image for building the React application
FROM node:14-alpine as build

# Set the working directory in the container to /app
WORKDIR /app

# Add the node_modules/.bin directory to the PATH for easier npm script execution
ENV PATH /app/node_modules/.bin:$PATH

# Copy the package.json and package-lock.json files to the working directory
COPY package.json package.json
COPY package-lock.json package-lock.json

# Install dependencies using npm and install react-scripts globally with silent flag
RUN npm install react-scripts -g --silent

# Copy the entire local directory's contents into the container at /app
COPY . .

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
