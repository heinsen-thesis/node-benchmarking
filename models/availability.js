var express = require('express');
var benchrest = require('bench-rest');
var moment = require('moment');
const jade = require('jade');
var fs = require('fs');

const availabilityTestCompiledFunction = jade.compileFile('views/partials/availability-item-template.jade');
const availabilityTestTableCompielFunction = jade.compileFile('views/partials/availability-table-item-template.jade');

var exec = require('child_process').exec;
var child;

var testResults = {
    testResultsArr: []
};

var config = {
  host: "35.187.19.229:8080",
  nNodes: 10,
  nRequests: 10000,
  startRate: 100,
  nSteps: 14,
  startStep: 14,
  resultsFileName: "",
  inProgress: false
}

var scriptConfig = {
  fileName: ""
}

function vegettaTestRun(host, nNodes, nRequests, startRate, nSteps, startStep) {
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
  console.log('host:' + config.host + ' nNodes:' + config.nNodes + ' nRequests:' + config.nRequests + ' Rate:' + (config.startRate*step) + ' Step:' + step + ' nSteps:' + config.nSteps);
  availabilityTest(step, function(fileName) {
    availabilityReadFile(fileName, function(err) {
      if(err !== null){
        console.log('Error ocurred, lets genereate some results');
        createResults(config.resultsFileName, testResults);
      }
      else if(step >= config.nSteps) {
        console.log('Out test is done, creating results');
        createResults(config.resultsFileName, testResults);
      }
      else {
        console.log('Running another loop');
        recursiveTestRun(++step);
      }
    });
  });
}

function createResults(resultsFileName, testResultJSONArray) {
  console.log('Creating result JSON file');
  fs.writeFile(resultsFileName, JSON.stringify(testResultJSONArray), function(err) {
    if(err) {
      return console.log(err);
    }});
}

function availabilityTest(step, callback) {
  console.log('availabilityTest');
  const date = moment().format("M-D-YY-h-mm-ss-a");
  const currentRate = (config.startRate*step);
  console.log('currentRate:');
  console.log(currentRate);
  const duration = (config.nRequests + (currentRate-1))/currentRate;
  console.log('duration:');
  console.log(duration);
  const fileName = 'availability_test/availability-' + date + '-nodes-' + config.nNodes + '-nRequests-' + config.nRequests + '-rate-' + currentRate;
  console.log('fileName:');
  console.log(fileName);

  const command = 'echo "GET http://' + config.host +'/" | vegeta attack -duration='+ duration +'s -rate='+ currentRate +' -connections=100000 | tee '+ fileName +'.bin | vegeta report';
  const secondCommand = 'vegeta report -inputs=' + fileName + '.bin -reporter=json > ' + fileName + '.json';

  child = exec(command, function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
    else {
      child = exec(secondCommand, function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
          console.log('exec error: ' + error);
        }
        console.log('Script done!');
        callback(fileName);
      });
    }
  });
}

function availabilityReadFile(fileName, callback) {
  fs.readFile(fileName + '.json', 'utf8', function (err, data) {
    if (err) {
      console.log('ReadFile: Error ocurred');
      callback(err);
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
      'rate': Math.ceil(obj.rate),
      'duration': Math.ceil(obj.duration/1000000000),
      'median': Math.ceil(obj.latencies.mean/1000000),
      'successRate': obj.success
    });

    callback(null);
  }
  });
}

function identifyTestFiles(callback) {
  var tables = '';
  fs.readdirSync('availability_test_result/').forEach(file => {
        if(file.includes('availability')) {
          var json = require('../availability_test_result/' + file);
          var items = '';
          for(var item in json.testResultsArr) {
            items += availabilityTestCompiledFunction({
              nodes: json.testResultsArr[item].nodes,
              rate: json.testResultsArr[item].rate,
              duration: json.testResultsArr[item].duration,
              median: json.testResultsArr[item].median,
              successRate: json.testResultsArr[item].successRate
            });
          }
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
 vegettaTestRun: vegettaTestRun
}