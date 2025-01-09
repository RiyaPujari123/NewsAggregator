# Step 1: Use a lightweight Node.js base image
FROM node:18-alpine

# Step 2: Set the working directory inside the container
WORKDIR /usr/src/app

# Step 3: Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Step 4: Install project dependencies
RUN npm install

# Step 5: Copy the entire application source code to the container
COPY . .

# Step 6: Expose the port the app runs on (3000 for most React apps)
EXPOSE 3000

# Step 7: Start the application
CMD ["npm", "start"]
