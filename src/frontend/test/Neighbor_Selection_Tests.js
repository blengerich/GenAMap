var assert = require('chai').assert;
var expect = require('chai').expect;
var backend = require('../../Scheduler/node/build/Release/scheduler.node');

// Model Options
var model_opts = {'type': '0',	// Linear Regression
			'options': {'lambda': 0.5, 'L1_lambda': 1}};

// Algorithm Options
var alg_opts = {'type': 5, 	// ProximalGradientDescent
			'options': {'tolerance': 0.01, 'learning_rate': 0.001}};

// Fake Data
var smallX = [[1,0.5,0.5], [2,1,1], [3,1.5,1.5]];

var largeX = [];
const n_patients = 100;
const n_markers = 10;
for (i = 0; i < n_patients; i++) {
	var markers = [];
	for (j = 1; j < n_markers; j++) {
		markers.push(Math.round(Math.random()) + 1);
	}
	largeX.push(markers);
}

describe('NeighborSelection', function() {

	describe('get result of small job', function() {
		var job_id = backend.newJob({'model_options': model_opts, 'algorithm_options': alg_opts});
		
		it('return filled results matrix for good job run', function(done) {
			assert.isTrue(backend.setX(job_id, smallX));
			assert.isTrue(backend.startJob(job_id, function(results) {
				assert.deepEqual(backend.getJobResult(job_id), results);
				done();
			}));
		});
	});
	
	describe('get result of large job', function() {
		var job_id = backend.newJob({'model_options': model_opts, 'algorithm_options': alg_opts});
		
		it('return filled results matrix for good job run', function(done) {
			assert.isTrue(backend.setX(job_id, largeX));
			assert.isTrue(backend.startJob(job_id, function(results) {
				assert.deepEqual(backend.getJobResult(job_id), results);
				done();
			}));
		});
	});
});
