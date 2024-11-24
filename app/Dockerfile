# Use an official Node runtime as a parent image
FROM node:21.6

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
RUN npm install -f

# Install dotenv globally
RUN npm install -g dotenv-cli

# Bundle your app source
COPY . .

# Build your Next.js app
RUN npm run build

EXPOSE 3000

# Start the app
CMD ["npm", "start"]