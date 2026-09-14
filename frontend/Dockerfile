FROM node:20-alpine

WORKDIR /app

# Copy dependency definition
COPY package.json ./

# Install dependencies using standard npm
RUN npm install

# Copy source code and assets
COPY . .

EXPOSE 3001

CMD ["npm", "run", "dev"]
