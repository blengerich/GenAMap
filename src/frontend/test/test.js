var assert = require('chai').assert;
var expect = require('chai').expect;
var backend = require('../../Scheduler/node/build/Release/scheduler.node');

// Model Options
var model_opts = {'type': '6',	// Linear Regression
			'options': {'lambda': 0.05, 'L2_lambda': 0.01}};
var bad_model_opts = {'type': 108,
			'options': {'lambda': 0.05, 'L2_lambda': 0.01}};

// Algorithm Options
var alg_opts = {'type': 4, 	// ProximalGradientDescent
			'options': {'tolerance': 0.01, 'learning_rate': 0.1}};
var bad_alg_opts = {'type': 10,
			'options': {'tolerance': 0.01, 'learning_rate': 0.1}};

// Fake Data
var smallX = [[1, 2, 3], [0 ,2, 1]];
var smallY = [[1], [0]];

var largeX = [];
var largeY = [];
const n_patients = 1000;
const n_markers = 100;
const n_traits = 1;
for (i = 0; i < n_patients; i++) {
	var markers = [];
	for (j = 0; j < n_markers; j++) {
		markers.push(Math.round(Math.random()));
	}
	largeX.push(markers);

	var traits = [];
	for (k = 0; k < n_traits; k++) {
		traits.push(Math.round(Math.random()));
	}
	largeY.push(traits);
}

describe('LinearRegression', function() {
	describe('newJob', function() {
		var id1 = backend.newJob({'algorithm_options': alg_opts, 'model_options': model_opts});
		var id2 = backend.newJob({'model_options': model_opts, 'algorithm_options': alg_opts});
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
			assert.isTrue(backend.setX(job_id, smallX));
		});

		it('should return false for a job that has not been created', function () {
			assert.equal(false, backend.setX(-1, smallX));
			assert.equal(false, backend.setX(100, smallX));
		});
		
	});

	describe('setY', function() {
		var job_id = backend.newJob({'model_options': model_opts, 'algorithm_options': alg_opts});
		it('should return true when correctly done', function () {
			assert.isTrue(backend.setY(job_id, smallY));
		});

		it('should return false for a job that has not been created', function () {
			assert.equal(false, backend.setY(-1, smallY));
			assert.equal(false, backend.setY(100, smallY));
		});
	});

	describe('startJob', function() {
		var job_id = backend.newJob({'model_options': model_opts, 'algorithm_options': alg_opts});

		it('throw error for bad options', function () {
			assert.throws(function() {backend.startJob(-1, function() {})},
				Error, 'Job ID does not match any jobs.');
		});

		it('return true for good job start', function() {
			assert.isTrue(backend.setX(job_id, smallX));
			assert.isTrue(backend.setY(job_id, smallY));
			assert.isTrue(backend.startJob(job_id, function(results) {} ));
		});

		var job_id2 = backend.newJob({'model_options': model_opts, 'algorithm_options': alg_opts});
		it('return true for second good job start', function() {
			assert.isTrue(backend.setX(job_id2, largeX));
			assert.isTrue(backend.setY(job_id2, largeY));
			assert.isTrue(backend.startJob(job_id2, function(results) {} ));
			assert.throws(function() { backend.startJob(job_id2, function() {} )},
				Error, 'Job is already running.');
		});

		it('throw error for trying to start already running job', function() {
			assert.throws(function() { backend.startJob(job_id2, function() {} )},
				Error, 'Job is already running.');
		});

		it('throw error for second bad options', function () {
			assert.throws(function() {backend.startJob(-1, function() {})},
				Error, 'Job ID does not match any jobs.');
		});
	});


	describe('getJobResult', function() {
		var job_id = backend.newJob({'model_options': model_opts, 'algorithm_options': alg_opts});
		
		it('return filled results matrix for good job run', function(done) {
			assert.isTrue(backend.setX(job_id, smallX));
			assert.isTrue(backend.setY(job_id, smallY));
			assert.isTrue(backend.startJob(job_id, function(results) {
				assert.deepEqual(backend.getJobResult(job_id), results);
				done();}));
		});
	});


	describe('checkJob', function() {
		var job_id = backend.newJob({'model_options': model_opts, 'algorithm_options': alg_opts});
		it('large job progress = 0 before starting', function() {
			assert.isTrue(backend.setX(job_id, largeX));
			assert.isTrue(backend.setY(job_id, largeY));
			assert.equal(0, backend.checkJob(job_id));
		});

		// it('large job progress < 1 before ending and == 1 on ending', function(done) {
		// 	backend.startJob(job_id, function(results) {
		// 		//assert.equal(backend.checkJob(job_id), 1);
		// 		//assert.deepEqual(backend.getJobResult(job_id), results);
		// 		//done();
		// 	} );
		// 	while (backend.checkJob(job_id) == 0) {}	// wait for job to actually start
		// 	assert.isBelow(backend.checkJob(job_id), 1, 'job progress should be less than 1 immediately after starting');
		// });

		// var job_id3 = backend.newJob({'model_options': model_opts, 'algorithm_options': alg_opts});
		// it('small job progress = 0 before starting', function() {
		// 	assert.isTrue(backend.setX(job_id3, smallX));
		// 	assert.isTrue(backend.setY(job_id3, smallY));
		// 	assert.equal(0, backend.checkJob(job_id3));
		// });

		// it('small job progress = 1 after ending', function(done) { 
		// 	backend.startJob(job_id3, function(results) {
		// 		assert.equal(1, backend.checkJob(job_id3));
		// 		assert.deepEqual(backend.getJobResult(job_id3), results);
		// 		done();
		// 	});
		// });

		// var job_id4 = backend.newJob({'model_options': model_opts, 'algorithm_options': alg_opts});
		// it('large job progress = 0 before starting', function() {
		// 	assert.isTrue(backend.setX(job_id4, largeX));
		// 	assert.isTrue(backend.setY(job_id4, largeY));
		// 	assert.equal(0, backend.checkJob(job_id4));
		// });

		// it('large job progress < 1 before ending and == 1 on ending', function(done) {
		// 	backend.startJob(job_id4, function(results) {
		// 		assert.equal(backend.checkJob(job_id4), 1);
		// 		assert.deepEqual(backend.getJobResult(job_id4), results);
		// 		done();
		// 	} );
		// 	while (backend.checkJob(job_id4) == 0) {}
		// 	assert.isBelow(backend.checkJob(job_id4), 1, 'job progress should be less than 1 immediately after starting');
		// });
	});
});
