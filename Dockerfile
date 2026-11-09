FROM node:20-slim

# Install system dependencies required for Chrome and PDF rendering
RUN apt-get update || true && apt-get install -y \


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
    libjpeg-turbo8 \
    libpng16-16 \
    && rm -rf /var/lib/apt/lists/*

# Install Google Chrome
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install Node dependencies
RUN npm ci --only=production

# Copy the rest of your application code
COPY . .

# Expose port if your app serves HTTP (change 3000 to your actual port)
EXPOSE 3000

# Command to start your app (adjust 'your-entrypoint.js' to your main file name)
CMD ["node", "test-render.js"]