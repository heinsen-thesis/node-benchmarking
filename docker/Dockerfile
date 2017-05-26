FROM node:boron

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN git clone https://github.com/heinsen-thesis/node-benchmarking.git ./

# Install app dependencies
RUN npm install

# Bundle app source
COPY . /usr/src/app

EXPOSE 41234

CMD [ "npm", "start" ]