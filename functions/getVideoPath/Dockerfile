# Use the official Puppeteer image.
# https://hub.docker.com/r/buildkite/puppeteer
FROM buildkite/puppeteer:latest

# Create and change to the app directory.
WORKDIR /usr/src/app

# Install dependencies.
COPY package*.json ./
RUN npm install

# Copy application code.
COPY . .

EXPOSE 8080

# Run the web service on container startup.
CMD ["npm", "start"]
