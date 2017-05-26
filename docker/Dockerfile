FROM node:boron

# Create app directory
RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

RUN git clone https://github.com/heinsen-thesis/node-benchmarking.git ./

RUN mkdir -p /usr/src/app/availability_test_result
RUN mkdir -p /usr/src/app/availability_test

# Install app dependencies
RUN npm install

# Bundle app source
COPY . /usr/src/app

EXPOSE 3000
EXPOSE 8080


CMD [ "npm", "start" ]