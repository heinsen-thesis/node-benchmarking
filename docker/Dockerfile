FROM node:boron

# Create app directory
RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

RUN git clone https://github.com/heinsen-thesis/node-benchmarking.git ./

RUN mkdir -p /usr/src/app/results/availability_test_result
RUN mkdir -p /usr/src/app/results/availability_test
RUN mkdir -p /usr/src/app/test/availability_test_bin

# Install app dependencies
RUN npm install

# Bundle app source
COPY . /usr/src/app

EXPOSE 8000

CMD [ "npm", "start" ]