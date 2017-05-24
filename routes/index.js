var express = require('express');
var model = require('../models/availability.js')

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  const host = 'http://localhost:8080/rules';
  
  const nRequests = 10000;
  const stepSize = 1000;

  // model.availability(host, nRequests, stepSize, function() {
    
  // });

  // model.availabilitySecond(host, nRequests, stepSize, function() {


  // });
  model.availabilityTest(host, 1, nRequests, stepSize, function(fileName) {
    model.availabilityReadFile(fileName);
  });

  res.render('index', { title: 'Availability test' });
});

module.exports = router;
