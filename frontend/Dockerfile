FROM node:22
WORKDIR /app
COPY package*.json .npmrc ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
