var express = require('express');
var benchrest = require('bench-rest');

var router = express.Router();

 
var flow = 'http://localhost:8080/rules';  // can use as simple single GET

// if the above flow will be used with the command line runner or
// programmatically from a separate file then export it.
module.exports = flow;

// There are even more flow options like setup and teardown, see detailed usage
var runOptions = {
  limit: 10,     // concurrent connections
  iterations: 100  // number of iterations to perform
};

/* GET home page. */
router.get('/', function(req, res, next) {
	benchrest(flow, runOptions)
    	.on('error', function (err, ctxName) { console.error('Failed in %s with err: ', ctxName, err); })
    	.on('end', function (stats, errorCount) {
    		console.log('error count: ', errorCount);
    		console.log('stats', stats);
    		const movieResults = stats.main.meter;

    		console.log('test', movieResults);
    	});

  res.render('index', { title: 'Express' });
});

module.exports = router;
