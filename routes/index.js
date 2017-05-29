var express = require('express');
var zipFolder = require('zip-folder');
var availabilityModel = require('../models/availability.js')

var fs = require('fs');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  availabilityModel.identifyTestFiles(function(testResults) {
      res.render('index', { 
        title: 'Availability test', 
        testResults: testResults, 
        host: availabilityModel.config.host, 
        nNodes: availabilityModel.config.nNodes, 
        nRequests: availabilityModel.config.nRequests, 
        startRate: availabilityModel.config.startRate, 
        nSteps: availabilityModel.config.nSteps, 
        startStep: availabilityModel.config.startStep, 
        inProgress: availabilityModel.config.inProgress });
  });
});

router.post('/startAvailabilityTest', function(req, res){
  console.log('Started test');
  availabilityModel.vegetaTestRun(req.body.host, 
    parseInt(req.body.nNodes), 
    parseInt(req.body.nRequests), 
    parseInt(req.body.startRate), 
    parseInt(req.body.nSteps), 
    parseInt(req.body.startStep));
});

router.post('/zipTestFiles', function(req, res) {
  console.log('zipTestFiles');
  zipFolder('./results/', './public/archive.zip', function(err) {
      if(err) {
          console.log('zipFolder erro:', err);
      } else {
          console.log('Successfully ziped folder');
      }
  });

  res.sendStatus(200);
});

module.exports = router;
