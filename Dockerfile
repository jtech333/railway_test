FROM node:20-slim

# Install system dependencies required for Chrome and PDF rendering
RUN echo "deb http://deb.debian.org/debian bookworm main" > /etc/apt/sources.list && \
    echo "deb http://security.debian.org/debian-security bookworm-security main" >> /etc/apt/sources.list && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
        wget \
        gnupg \
        libnss3 \
        libatk1.0-0 \
        libatk-bridge2.0-0 \
        libcups2 \
        libxcomposite1 \
        libxdamage1 \
        libxrandr2 \
        libgbm1 \
        libpango-1.0-0 \
        libjpeg62-turbo \
        libpng16-16 \
        fonts-liberation \
        fonts-noto-cjk \
    && rm -rf /var/lib/apt/lists/*

# Install prerequisites for downloading chrome
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# Download and install Google Chrome Stable
RUN curl -fsSL https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb -o /tmp/google-chrome.deb && \
    apt-get update && \
    apt-get install -y /tmp/google-chrome.deb && \
    rm /tmp/google-chrome.deb

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install Node dependencies
RUN npm ci --only=production

# Copy the rest of your application code
COPY . .

# Expose port if your app serves HTTP (change 3000 to your actual port)
EXPOSE 3000
# ... [previous steps installing dependencies and chrome] ...

# Tell Puppeteer where to find the system Chrome
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Expose port (if your server listens on one)
EXPOSE 8080

# Start your app
CMD ["node", "test-render.js"]