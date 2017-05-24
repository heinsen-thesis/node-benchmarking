var express = require('express');
var model = require('../models/availability.js')

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  const host = 'http://localhost:8080/rules';
  const nRequests = 10000;
  const nNodes = 1;
  const startRate = 1000;
  const nSteps = 1;

  model.availabilityTestRun(host, nNodes, nRequests, startRate, nSteps);

  res.render('index', { title: 'Availability test' });
});

module.exports = router;
