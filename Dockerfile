# Build stage 
FROM node:18.14 AS build 

WORKDIR /usr/app 

# Copy package.json and package-lock.json 
COPY package*.json ./ 

# Install npm packages, including sharp 
RUN npm install 

# Remove node_modules directory
RUN find node_modules -mindepth 1 -delete

# Copy the rest of your application's code 
COPY . . 

# Install npm packages again
RUN npm ci

# Build your application 
RUN npm run build 

# Production stage 
FROM node:18-bullseye 

WORKDIR /usr/app 

# Copy built files from the build stage 
COPY --from=build /usr/app/dist ./dist 
COPY --from=build /usr/app/.env ./.env 
COPY --from=build /usr/app/node_modules ./node_modules 
COPY --from=build /usr/app/package*.json ./ 

# Expose the port the app runs on 
EXPOSE 4000 

# Start the application 
CMD ["npm", "run", "start"]