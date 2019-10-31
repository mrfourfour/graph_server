FROM node:12.10.0

# Expose the default port
EXPOSE 8080

# Create/Set the working directory
RUN mkdir /app
WORKDIR /app

# Copy App
COPY . /app

RUN npm install

# Set Command
CMD node app.js