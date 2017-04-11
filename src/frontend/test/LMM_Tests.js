var assert = require('chai').assert;
var expect = require('chai').expect;
var backend = require('../../Scheduler/node/build/Release/scheduler.node');

// Model Options
var model_opts = {'type': 10, 'options': {'lambda': 0.05, 'L2_lambda': 0.01}};
var bad_model_opts = {'type': 108, 'options': {'lambda': 0.05, 'L2_lambda': 0.01}};

// Algorithm Options
var alg_opts = {'type': 7,
			'options': {'ldelta_start': -5, 'ldelta_end': 5, 'ldelta_interval': 500}};
var bad_alg_opts = {'type': 10,
			'options': {'ldelta_start': -5, 'ldelta_end': 5, 'ldelta_interval': 500}};

var X = [[0.8147,    0.1576,    0.6557,    0.7060,    0.4387],
[0.9058,    0.9706,    0.0357,    0.0318,    0.3816],
[0.1270,    0.9572,    0.8491,    0.2769,    0.7655],
[0.9134,    0.4854,    0.9340,    0.0462,    0.7952],
[0.6324,    0.8003,    0.6787,    0.0971,    0.1869],
[0.0975,    0.1419,    0.7577,    0.8235,    0.4898],
[0.2785,    0.4218,    0.7431,    0.6948,    0.4456],
[0.5469,    0.9157,    0.3922,    0.3171,    0.6463],
[0.9575,    0.7922,    0.6555,    0.9502,    0.7094],
[0.9649,    0.9595,    0.1712,    0.0344,    0.7547]];

var Y = [[0.4173],
[0.0497],
[0.9027],
[0.9448],
[0.4909],
[0.4893],
[0.3377],
[0.9001],
[0.3692],
[0.1112]];


describe('FaSTLMM', function() {
	describe('newJob', function() {
		var id1 = backend.newJob({'algorithm_options': alg_opts, 'model_options': model_opts});
		var id2 = backend.newJob({'algorithm_options': alg_opts, 'model_options': model_opts});
		it('should return a non-negative integer for the first job ID', function () {
			assert.isAtLeast(id1, 1);
		});		
		it('should return a larger integer for the second job ID', function () {
			assert.isAtLeast(id2, id1);
		});
		
		it('should throw exception when bad options are given', function () {
			assert.throws(function() {backend.newJob(
				{'model_options': bad_model_opts, 'algorithm_options': alg_opts})},
				Error, 'Error creating model');
			assert.throws(function() {backend.newJob(
				{'algorithm_options': bad_alg_opts, 'model_options': model_opts})},
				Error, 'Error creating algorithm');
		});
	});

	describe('setX', function() {
		var job_id = backend.newJob({'model_options': model_opts, 'algorithm_options': alg_opts});
		it('should return true when correctly done', function () {
			assert.isTrue(backend.setX(job_id, X));
		});

		it('should return false for a job that has not been created', function () {
			assert.equal(false, backend.setX(-1, X));
			assert.equal(false, backend.setX(100, X));
		});
		
	});

	describe('setY', function() {
		var job_id = backend.newJob({'model_options': model_opts, 'algorithm_options': alg_opts});
		it('should return true when correctly done', function () {
			assert.isTrue(backend.setY(job_id, Y));
		});

		it('should return false for a job that has not been created', function () {
			assert.equal(false, backend.setY(-1, Y));
			assert.equal(false, backend.setY(100, Y));
		});
	});

	describe('startJob', function() {
		var job_id = backend.newJob({'model_options': model_opts, 'algorithm_options': alg_opts});
		it('throw error for bad options', function () {
			assert.throws(function() {backend.startJob(-1, function() {})},
				Error, 'Job ID does not match any jobs.');
			assert.throws(function() {backend.startJob(job_id, function() {})},
				Error, 'X and Y matrices of size (0,0), and (0,0) are not compatible.');
		});

		it('return true for good job start', function() {
			assert.isTrue(backend.setX(job_id, X));
			assert.isTrue(backend.setY(job_id, Y));
			assert.isTrue(backend.startJob(job_id, function(results) {} ));
		});

		var job_id2 = backend.newJob({'model_options': model_opts, 'algorithm_options': alg_opts});
		it('return true for second good job start', function() {
			this.timeout(5000);	// let's see how long this job takes
			assert.isTrue(backend.setX(job_id2, X));
			assert.isTrue(backend.setY(job_id2, Y));
			assert.isTrue(backend.startJob(job_id2, function(results) {} ));
		});

		it('throw error for second bad options', function () {
			assert.throws(function() {backend.startJob(-1, function() {})},
				Error, 'Job ID does not match any jobs.');
		});
	});

	describe('getJobResult', function() {
		this.timeout(0);	// let's see how long this job takes
		var job_id = backend.newJob({'model_options': model_opts, 'algorithm_options': alg_opts});
		
		it('return filled results matrix for good job run', function(done) {
			assert.isTrue(backend.setX(job_id, X));
			assert.isTrue(backend.setY(job_id, Y));
			assert.isTrue(backend.startJob(job_id, function(results) {
				assert.deepEqual(backend.getJobResult(job_id), results);
				done();
			}));
		});
	});

});


