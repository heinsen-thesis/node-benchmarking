var express = require('express');
var benchrest = require('bench-rest');
var moment = require('moment');
const jade = require('jade');
var async = require('async');
var fs = require('fs');

const availabilityTestCompiledFunction = jade.compileFile('views/partials/availability-item-template.jade');
const availabilityTestTableCompielFunction = jade.compileFile('views/partials/availability-table-item-template.jade');

var exec = require('child_process').exec;

var testResults = {
    testResultsArr: []
};

var config = {
  host: "localhost:8080",
  nNodes: 1,
  nRequests: 10000,
  startRate: 100,
  nSteps: 12,
  startStep: 10,
  resultsFileName: "",
  inProgress: false
}

var currentStep = 0;

var scriptConfig = {
  fileName: ""
}

function vegetaTestRun(host, nNodes, nRequests, startRate, nSteps, startStep) {
  const startDate = moment().format("M-D-YY-h-mm-ss-a");
  config.host = host;
  config.nNodes = nNodes;
  config.nRequests = nRequests;
  config.startRate = startRate;
  config.nSteps = nSteps;
  config.startStep = startStep;
  config.resultsFileName = 'availability_test_result/availability-test-' + startDate + '-nodes-' + nNodes + '-nRequests-' + nRequests + '-nSteps-' + nSteps + '.json';
  recursiveTestRun(startStep);
}

function recursiveTestRun(step) {
  availabilityTest(step, function(filename) {
      console.log("We are completly done");


  });
}

function availabilityTest(currentStep, callback) {
  console.log('availabilityTest step:');
  console.log(currentStep);
  const date = moment().format("M-D-YY-h-mm-ss-a");
  const currentRate = (config.startRate*currentStep);
  const duration = (config.nRequests + (currentRate-1))/currentRate;
  const fileName = 'availability_test/availability-' + date + '-nodes-' + config.nNodes + '-nRequests-' + config.nRequests + '-rate-' + currentRate;
  
  console.log('fileName:');
  console.log(fileName);

  const command = 'echo "GET http://' + config.host +'/" | vegeta/vegeta attack -duration='+ duration +'s -rate='+ currentRate +' -connections=100000 | tee '+ fileName +'.bin | vegeta/vegeta report && vegeta/vegeta report -inputs=' + fileName + '.bin -reporter=json > ' + fileName + '.json';

  exec(command, function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
      return
    }
    else {
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
    }
  });
}

function availabilityReadFile(fileName, step) {
  console.log('availabilityReadFile called, at step:');
  console.log(step);
  fs.readFile(fileName + '.json', 'utf8', function (err, data) {
    if (err) {
      console.log('ReadFile: Error ocurred');
      return
    }
    else {
      var obj = JSON.parse(data);
      // console.log(obj);
      console.log("Median:");
      console.log(obj.latencies.mean);
      console.log("Duration:");
      console.log(obj.duration);
      console.log("Arrival Rate:");
      console.log(obj.rate);
      console.log("Success percentage:");
      console.log(obj.success);

      testResults.testResultsArr.push({
        'rate': (config.startRate*step),
        'duration': Math.ceil(obj.duration/1000000000),
        'median': Math.ceil(obj.latencies.mean/1000000),
        'successRate': obj.success
      });
      createResults(config.resultsFileName, testResults);
    }
  });
}

function createResults(resultsFileName, testResultJSONArray) {
  console.log('Creating result JSON file');
  fs.writeFile(resultsFileName, JSON.stringify(testResultJSONArray), function(err) {
    if(err) {
      return console.log(err);
    }});
}


function identifyTestFiles(callback) {
  var tables = '';
  fs.readdirSync('availability_test_result/').forEach(file => {
    if(file.includes('availability')) {
      var json = require('../availability_test_result/' + file);
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