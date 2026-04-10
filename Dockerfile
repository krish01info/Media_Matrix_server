# 1. Use the official Node.js image as the base
FROM node:20-alpine

# 2. Create a folder inside the container for our code
WORKDIR /app

# 3. Copy the package files first (to speed up builds)
COPY package*.json ./

# 4. Install the dependencies we added (Express, Redis, etc.)
RUN npm install

# 5. Copy the rest of your server code
COPY . .

# 6. Tell Docker the app runs on port 3000
EXPOSE 3000

# 7. The command to start your server
CMD ["npm", "run", "dev"]