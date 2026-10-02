FROM node:22-alpine

WORKDIR /app

# Copy only the dependency files first so Docker can cache this layer
COPY package.json package-lock.json ./
RUN npm ci

# Then copy the source
COPY . .

EXPOSE 5173

# --host makes the dev server reachable from outside the container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]