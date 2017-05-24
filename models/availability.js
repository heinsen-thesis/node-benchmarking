var express = require('express');
var benchrest = require('bench-rest');
var moment = require('moment');
const jade = require('jade');
var fs = require('fs');

const availabilityTestCompiledFunction = jade.compileFile('views/partials/availability-item-template.jade');

var exec = require('child_process').exec;
var child;

function availabilityTestRun(host, nNodes, nRequests, startRate, nSteps) {
  const startDate = moment().format();
  const resultsFileName = 'availability_test_result/availability-test-' + startDate + '-nodes-' + nNodes + '-nRequests-' + nRequests + '-nSteps-' + nSteps;

  fs.writeFile(resultsFileName, '', function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
  });

  recursiveTestRun(host, nNodes, nRequests, startRate, 1, nSteps, resultsFileName);
}

function recursiveTestRun(host, nNodes, nRequests, rate, step, nSteps, resultsFileName) {
  console.log('host:' + host + ' nNodes:' + nNodes + ' nRequests:' + nRequests + ' Rate:' + rate + ' Step:' + step + 'nSteps:' + nSteps);
  availabilityTest(host, nNodes, nRequests, rate, function(fileName) {
    availabilityReadFile(nNodes, fileName, resultsFileName, function() {
      if(step <= nSteps) {
        recursiveTestRun(host, nNodes, nRequests, rate+100, step+1, nSteps, resultsFileName);
      }
    });
  });
}

function availabilityTest(host, nNodes, nRequests, rate, callback) {
  const date = moment().format();
  const duration = ((nRequests + (rate-1))/rate);

  const fileName = 'availability_test/availability-' + date + '-nodes-' + nNodes + '-nRequests-' + nRequests + '-rate-' + rate + '-duration-' + duration;
  console.log('duration: ' + duration);
  const command = 'artillery quick --duration '+ duration +' --rate '+ rate +' -n 1 --output ' + fileName + ' ' + host;

  child = exec(command, function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
    callback(fileName);
  });
}

function availabilityReadFile(nNodes, fileName, resultsFileName, callback) {
  fs.readFile(fileName, 'utf8', function (err, data) {
    if (err) throw err; // we'll not consider error handling for now
    var obj = JSON.parse(data);
    console.log("Median:");
    console.log(obj.aggregate.scenarioDuration.median);
    console.log("Duration:");
    console.log(obj.aggregate.phases[0].duration);
    console.log("Arrival Rate:");
    console.log(obj.aggregate.phases[0].arrivalRate);

    const testResultItem = availabilityTestCompiledFunction({
        nodes: nNodes,
        rate: obj.aggregate.phases[0].arrivalRate,
        duration: obj.aggregate.phases[0].duration,
        median: obj.aggregate.scenarioDuration.median
    })

    fs.appendFile(resultsFileName, testResultItem, function (err) {
      if (err) throw err;
      console.log('Saved!');
    });
  });

  callback();
}

module.exports = {
 availabilityTestRun: availabilityTestRun,
 availabilityTest : availabilityTest,
 availabilityReadFile: availabilityReadFile
}