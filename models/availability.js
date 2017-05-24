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
  host: "",
  nNodes: 1,
  nRequests: 10000,
  startRate: 100,
  nSteps: 14,
  resultsFileName: "",
  inProgress: false
}

function availabilityTestRun(host, nNodes, nRequests, startRate, nSteps, startStep) {
  const startDate = moment().format("M-D-YY-h-mm-ss-a");
  config.host = host;
  config.nNodes = nNodes;
  config.nRequests = nRequests;
  config.startRate = startRate;
  config.nSteps = nSteps;
  config.resultsFileName = 'availability_test_result/availability-test-' + startDate + '-nodes-' + nNodes + '-nRequests-' + nRequests + '-nSteps-' + nSteps + '.json';
  recursiveTestRun(startStep);
}

function recursiveTestRun(step) {
  console.log('host:' + config.host + ' nNodes:' + config.nNodes + ' nRequests:' + config.nRequests + ' Rate:' + (config.startRate*step) + ' Step:' + step + ' nSteps:' + config.nSteps);
  availabilityTest(step, function(fileName) {
    availabilityReadFile(fileName, function() {
      if(step < config.nSteps) {
        console.log('Running another loop');
        recursiveTestRun(step+1);
      } else {
        console.log('Writing file');
        fs.writeFile(config.resultsFileName, JSON.stringify(testResults), function(err) {
        if(err) {
          return console.log(err);
        }});
      }
    });
  });
}

function availabilityTest(step, callback) {
  console.log('availabilityTest');
  const date = moment().format("M-D-YY-h-mm-ss-a");

  const currentRate = (config.startRate*step);

  const duration = ((config.nRequests + (currentRate-1))/currentRate);

  const fileName = 'availability_test/availability-' + date + '-nodes-' + config.nNodes + '-nRequests-' + config.nRequests + '-rate-' + currentRate + '.json';
  const command = 'artillery quick --duration '+ duration +' --rate '+ currentRate +' -n 1 --output ' + fileName + ' ' + config.host;

  child = exec(command, function (error, stdout, stderr) {
    if (error !== null) {
      console.log('exec error: ' + error);
    }
    callback(fileName);
  });
}

function availabilityReadFile(fileName, callback) {
  fs.readFile(fileName, 'utf8', function (err, data) {
    if (err) throw err; // we'll not consider error handling for now
    var obj = JSON.parse(data);
    console.log("Median:");
    console.log(obj.aggregate.scenarioDuration.median);
    console.log("Duration:");
    console.log(obj.aggregate.phases[0].duration);
    console.log("Arrival Rate:");
    console.log(obj.aggregate.phases[0].arrivalRate);

    testResults.testResultsArr.push({
      'nodes': config.nNodes,
      'rate': obj.aggregate.phases[0].arrivalRate,
      'duration': obj.aggregate.phases[0].duration,
      'median': obj.aggregate.scenarioDuration.median
    });

    callback();
  });
}

function identifyTestFiles(callback) {
  var tables = '';
  fs.readdirSync('availability_test_result/').forEach(file => {
        if(file.includes('availability')) {
          var json = require('../availability_test_result/' + file);
          console.log(json.testResultsArr);
          var items;
          for(var item in json.testResultsArr) {
            console.log(json.testResultsArr[item].nodes);
            items += availabilityTestCompiledFunction({
              nodes: json.testResultsArr[item].nodes,
              rate: json.testResultsArr[item].rate,
              duration: json.testResultsArr[item].duration,
              median: json.testResultsArr[item].median
            })
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
 availabilityTestRun: availabilityTestRun,
 availabilityTest : availabilityTest,
 availabilityReadFile: availabilityReadFile,
 identifyTestFiles: identifyTestFiles
}