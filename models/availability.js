var express = require('express');
var benchrest = require('bench-rest');
var moment = require('moment');
const jade = require('jade');
var async = require('async');
var fs = require('fs');
var os = require('os');

const availabilityTestCompiledFunction = jade.compileFile('views/partials/availability-item-template.jade');
const availabilityTestTableCompielFunction = jade.compileFile('views/partials/availability-table-item-template.jade');
const availability_test_folder = 'results/availability_test/';
const availability_test_result_folder = 'results/availability_test_result/';
const availability_test_bin_folder = 'test/availability_test_bin/';

var exec = require('child_process').exec;

var config = {
  host: "146.148.31.131:8080/rules",
  nNodes: 1,
  nRequests: 100000,
  startRate: 10000,
  nSteps: 20,
  startStep: 1,
  resultsFileName: "",
  inProgress: false
}

var currentStep = 0;

var scriptConfig = {
  fileName: ""
}

function vegetaTestRun(host, nNodes, nRequests, startRate, nSteps, startStep) {
  console.log('vegetaTestRun called');
  if(config.inProgress == false) {
    console.log('vegeta test run started');
    config.inProgress = true;
    const startDate = moment().format("M-D-YY-h-mm-ss-a");
    config.host = host;
    config.nNodes = nNodes;
    config.nRequests = nRequests;
    config.startRate = startRate;
    config.nSteps = nSteps;
    config.startStep = startStep;
    config.resultsFileName = 'availability-test-' + startDate + '-nodes-' + nNodes + '-nRequests-' + nRequests + '-nSteps-' + nSteps + '.json';
    recursiveTestRun(startStep);
  }
}

function recursiveTestRun(step) {
  availabilityTest(step, function(filename) {
      console.log("We are completly done");
      config.inProgress = false;

  });
}

function availabilityTest(currentStep, callback) {
  console.log('availabilityTest step:');
  console.log(currentStep);

  const date = moment().format("M-D-YY-h-mm-ss-a");
  const currentRate = (config.startRate*currentStep);
  const duration = (config.nRequests + (currentRate-1))/currentRate;
  const fileName = 'availability-' + date + '-nodes-' + config.nNodes + '-nRequests-' + config.nRequests + '-rate-' + currentRate;
  
  console.log('fileName:');
  console.log(fileName);

  let platform = os.platform() == 'darwin' ? '-darwin' : '';

  const command = 'echo "GET http://' + config.host +'/" | vegeta/vegeta'+ platform +' attack -duration='+ duration +'s -rate='+ currentRate +' -connections=100000 -timeout=5s | tee '+ availability_test_bin_folder + fileName +'.bin | vegeta/vegeta' + platform + ' report && vegeta/vegeta' + platform + ' report -inputs=' + availability_test_bin_folder + fileName + '.bin -reporter=json > ' + availability_test_folder + fileName + '.json';

  async.parallel([
      async.apply(exec, command)
    ],
    function(error, stdout, stderr) {
      console.log('stdout: ' + stdout);
      
      console.log('This step done!');
      availabilityReadFile(fileName, currentStep);

      if(currentStep >= config.nSteps) {
        console.log('Out test is done');
        callback(fileName);
        return
      }
      else {
        console.log('Running another loop');
        return availabilityTest(++currentStep, callback);
      }
  });
}

function availabilityReadFile(fileName, step) {
  console.log('availabilityReadFile called, at step:');
  console.log(step);
  let data = fs.readFileSync(availability_test_folder + fileName + '.json', 'utf8');
  var obj = JSON.parse(data);
  console.log("Median:");
  console.log(obj.latencies.mean);
  console.log("Duration:");
  console.log(obj.duration);
  console.log("Arrival Rate:");
  console.log(obj.rate);
  console.log("Success percentage:");
  console.log(obj.success);

  let resultData = fs.existsSync(availability_test_result_folder + config.resultsFileName) ? JSON.parse(fs.readFileSync(availability_test_result_folder + config.resultsFileName, 'utf8')) : {testResultsArr: []};

  resultData.testResultsArr.push({
    rate: (config.startRate*step),
    duration: Math.ceil(obj.duration/1000000000),
    median: Math.ceil(obj.latencies.mean/1000000),
    successRate: obj.success
  });
  
  fs.writeFileSync(availability_test_result_folder + config.resultsFileName, JSON.stringify(resultData));
}

function identifyTestFiles(callback) {
  console.log('identifyTestFiles');
  var tables = '';
  fs.readdirSync(availability_test_result_folder).forEach(file => {
    if(file.includes('availability')) {
      var json = JSON.parse(fs.readFileSync(availability_test_result_folder + file, 'utf8'));
      var items = '';
      json.testResultsArr.forEach(function(item) {
          items += availabilityTestCompiledFunction({
            nodes: item.nodes,
            rate: item.rate,
            duration: item.duration,
            median: item.median,
            successRate: item.successRate
          });
      });
      
      tables += availabilityTestTableCompielFunction({
        title: file,
        items: items
      });
    }
  });
  callback(tables);
}

module.exports = {
 availabilityTest : availabilityTest,
 availabilityReadFile: availabilityReadFile,
 identifyTestFiles: identifyTestFiles,
 config: config,
 vegetaTestRun: vegetaTestRun
}