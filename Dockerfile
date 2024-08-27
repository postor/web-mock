# Use an official Node.js image as a parent image
FROM node:lts-alpine

# Set the working directory in the container
WORKDIR /app

# Install build tools (optional, depending on your project needs)
# RUN apk add --no-cache \
#     git \
#     python3 \
#     make \
#     g++

# Copy package.json and package-lock.json into the container
# COPY package*.json ./

# Install dependencies for the entire monorepo
# RUN npm install

# Copy the entire project into the container
ADD . .

# Build each workspace
# RUN npm run build --workspace=db
RUN set -x && \
    ls && \
    npm -w db install && \
    npm -w common install && \
    npm -w common run build && \
    npm -w backend install && \
    npm -w backend run build && \
    npm -w frontend install && \
    npm -w frontend run build 

# Expose ports (adjust based on your application requirements)
# EXPOSE 3000 4000 5000

# Define the command to start your application
# CMD ["npm", "start"]
