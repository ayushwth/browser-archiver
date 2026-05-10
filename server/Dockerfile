FROM node:22-alpine

WORKDIR /app

# Install Chrome/Chromium and dependencies for Puppeteer + OpenSSL + build tools
RUN apk add --no-cache \
    chromium \
    chromium-swiftshader \
    openssl \
    python3 \
    make \
    g++ \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-dejavu

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy source code
COPY src ./src/

# Expose port
EXPOSE 3001

# Start the server without watch mode
CMD ["npm", "start"]
