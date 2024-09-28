# Build stage
FROM node:20-bullseye-slim as build

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Vite React application
RUN npm run build

# Serve stage
FROM nginx:stable-alpine

# Copy the build output from the build stage to the Nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 to allow external access
EXPOSE 80

# Define the command to run Nginx in the foreground to serve the React application
CMD ["nginx", "-g", "daemon off;"]
