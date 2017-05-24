var express = require('express');
var model = require('../models/availability.js')

var fs = require('fs');

var router = express.Router();
/* GET home page. */
router.get('/', function(req, res, next) {
  model.identifyTestFiles(function(testResults) {
      res.render('index', { title: 'Availability test', testResults: testResults });
  });
});

router.post('/startAvailabilityTest', function(req, res){
  console.log('Started test');
  const host = 'http://localhost:8080/rules';
  const nRequests = 100;
  const nNodes = 1;
  const startRate = 100;
  const nSteps = 2;
  const startStep = 1;
  model.availabilityTestRun(host, nNodes, nRequests, startRate, nSteps, startStep);
});

module.exports = router;
