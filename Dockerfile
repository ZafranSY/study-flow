FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Build the application, skipping TypeScript checks using the new script
RUN npm run build:docker

EXPOSE 8080

# Command to run the built application using the 'preview' script
CMD ["npm", "run", "preview"]
