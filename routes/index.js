var express = require('express');
var model = require('../models/availability.js')

var fs = require('fs');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  model.identifyTestFiles(function(testResults) {
      res.render('index', { 
        title: 'Availability test', 
        testResults: testResults, 
        host: model.config.host, 
        nNodes: model.config.nNodes, 
        nRequests: model.config.nRequests, 
        startRate: model.config.startRate, 
        nSteps: model.config.nSteps, 
        startStep: model.config.startStep, 
        inProgress: model.config.inProgress });
  });
});

router.post('/startAvailabilityTest', function(req, res){
  console.log('Started test');
  model.availabilityTestRun(req.body.host, 
    parseInt(req.body.nNodes), 
    parseInt(req.body.nRequests), 
    parseInt(req.body.startRate), 
    parseInt(req.body.nSteps), 
    parseInt(req.body.startStep));
});

router.post('/startScriptAvailabilityTest', function(req, res){
  console.log('Started script test');
  model.vegetaTestRun(req.body.host, 
    parseInt(req.body.nNodes), 
    parseInt(req.body.nRequests), 
    parseInt(req.body.startRate), 
    parseInt(req.body.nSteps), 
    parseInt(req.body.startStep));
});

module.exports = router;
