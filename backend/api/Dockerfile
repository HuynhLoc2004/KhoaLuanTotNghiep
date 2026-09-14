FROM node:20-alpine

WORKDIR /app

# Copy dependency definition
COPY package.json ./

# Install dependencies using standard npm
RUN npm install

# Copy source and config
COPY tsconfig.json ./
COPY src/ ./src/

EXPOSE 3000

ENV PORT=3000
ENV REDIS_URL=redis://redis:6379/0
ENV RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672/

CMD ["npm", "run", "dev"]
