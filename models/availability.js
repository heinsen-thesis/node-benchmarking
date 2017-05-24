var express = require('express');
var benchrest = require('bench-rest');
var moment = require('moment');

var exec = require('child_process').exec;
var child;

function availabilityTest(host, nNodes, nRequests, rate, callback) {
  const date = moment().format();
  const duration = ((nRequests + (rate-1))/rate);

  const fileName = 'availability_tests/availability-' + date + '-nodes-' + nNodes + '-nRequests-' + nRequests + '-rate-' + rate + '-duration-' + duration;
  console.log('duration: ' + duration);
  const command = 'artillery quick --duration '+ duration +' --rate '+ rate +' -n 1 --output ' + fileName + ' '+ host;

  child = exec(command, function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
    callback(fileName);
  });
}

var fs = require('fs');

function availabilityReadFile(fileName) {
  fs.readFile(fileName, 'utf8', function (err, data) {
    if (err) throw err; // we'll not consider error handling for now
    var obj = JSON.parse(data);
    console.log("Median:");
    console.log(obj.aggregate.scenarioDuration.median);
    console.log("Duration:");
    console.log(obj.aggregate.phases[0].duration);
    console.log("Arrival Rate:");
    console.log(obj.aggregate.phases[0].arrivalRate);



  });
}

module.exports = {
 availabilityTest : availabilityTest,
 availabilityReadFile: availabilityReadFile
}