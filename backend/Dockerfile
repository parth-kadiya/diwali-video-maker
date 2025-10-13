# Base image Node.js ka lenge
FROM node:18-slim

# FFmpeg install karne ke liye commands
RUN apt-get update && apt-get install -y ffmpeg

# Application ke liye directory banayenge
WORKDIR /usr/src/app

# package.json aur package-lock.json ko copy karenge
COPY package*.json ./

# Dependencies install karenge
RUN npm install

# Baaki ka saara code copy karenge
COPY . .

# Server start karne ki command
CMD [ "npm", "start" ]