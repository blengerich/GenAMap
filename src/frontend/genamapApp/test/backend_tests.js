var assert = require('chai').assert;
var expect = require('chai').expect;
var backend = require('../../../Scheduler/node/build/Release/scheduler.node');

describe('Scheduler', function() {
	var alg_opts = {'type': 1,
				'options': {'tolerance': 0.01, 'learning_rate': 0.1}};
	var bad_alg_opts = {'type': 10,
				'options': {'tolerance': 0.01, 'learning_rate': 0.1}};
	var model_opts = {'type': '1',
				'options': {'lambda': 0.05, 'L2_lambda': 0.01}};
	var bad_model_opts = {'type': 8,
				'options': {'lambda': 0.05, 'L2_lambda': 0.01}}

	describe('newJob', function() {
		var id1 = backend.newJob({'algorithm_options': alg_opts, 'model_options': model_opts});
		var id2 = backend.newJob({'model_options': model_opts, 'algorithm_options': alg_opts});
		it('should return 0 for the first job ID', function () {
			assert.isAtLeast(id1, 0);
		});
		
		it('should return 1 for the second job ID', function () {
			assert.isAtLeast(id2, id1);
		});
		
		
		it('should throw exception when bad options are given', function () {
			assert.throws(function() {backend.newJob(
				{'model_options': bad_model_opts, 'algorithm_options': alg_opts})},
				Error, 'Could not add another job');
			assert.throws(function() {backend.newJob(
				{'algorithm_options': bad_alg_opts, 'model_options': model_opts})},
				Error, 'Could not add another job');
		});
		// TODO: more robust to bad options (currently segfaulting if passing an int)
	});


	describe('setX', function() {
		var job_id = backend.newJob({'model_options': model_opts, 'algorithm_options': alg_opts});
		it('should return true when correctly done', function () {
			assert.equal(true, backend.setX(job_id, [[1,2], [3,4]]));
		});

		it('should return false for a job that has not been created', function () {
			assert.equal(false, backend.setX(job_id+10, [[1,2], [3,4]]));
		});
		
	});

	describe('setY', function() {
		var job_id = backend.newJob({'model_options': model_opts, 'algorithm_options': alg_opts});
		it('should return true when correctly done', function () {
			assert.equal(true, backend.setY(job_id, [[1,2], [3,4]]));
		});

		it('should return false for a job that has not been created', function () {
			assert.equal(false, backend.setY(job_id+10, [[1,2], [3,4]]));
		});
		
	});

	describe('startJob', function() {
		var job_id = backend.newJob({'model_options': model_opts, 'algorithm_options': alg_opts});

		it('return true for good job start', function() {
			assert.equal(true, backend.setX(job_id, [[0, 1], [1, 1]]));
			assert.equal(true, backend.setY(job_id, [[0], [1]]));
			assert.equal(true, 
				backend.startJob(job_id, function(results) {/* empty */} ));
		});

		it('throw error for bad options', function () {
			assert.throws(function() {backend.startJob(job_id+10, function() {/*empty callback*/})},
				TypeError, 'Job id must correspond to a job that has been created.');
		});

		var job_id2 = backend.newJob({'model_options': model_opts, 'algorithm_options': alg_opts});

		it('return true for second good job start', function() {
			assert.equal(true, backend.setX(job_id2, [[0, 1], [1, 1]]));
			assert.equal(true, backend.setY(job_id2, [[0], [1]]));
			assert.equal(true, 
				backend.startJob(job_id2, function(results) {/* empty */} ));
		});

		it('throw error for second bad options', function () {
			assert.throws(function() {backend.startJob(job_id2+10, function() {/*empty callback*/})},
				TypeError, 'Job id must correspond to a job that has been created.');
		});
	});


	describe('getJobResult', function() {
		var job_id = backend.newJob({'model_options': model_opts, 'algorithm_options': alg_opts});
		
		it('return filled results matrix for good job run', function() {
			assert.equal(true, backend.setX(job_id, [[0, 1], [1, 1]]));
			assert.equal(true, backend.setY(job_id, [[0], [1]]));
			assert.equal(true, 
				backend.startJob(job_id, function(results) {
					assert.equal(backend.getJobResult(job_id), results);} ));
		});
	});

	describe('checkJob', function() {
		var largeX = [];
		var largeY = [];
		const n_patients = 1000;
		const n_markers = 1000;
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

		var job_id = backend.newJob({'model_options': model_opts, 'algorithm_options': alg_opts});		
		it('large job progress = 0 before starting', function() {
			assert.equal(true, backend.setX(job_id, largeX));
			assert.equal(true, backend.setY(job_id, largeY));
			assert.equal(0, backend.checkJob(job_id));
		});

		it('large job progress < 1 before ending', function() {
			backend.startJob(job_id, function(results) {} );
			assert.isBelow(backend.checkJob(job_id), 1, 'job progress should be less than 1 immediately after starting');
			console.log(backend.checkJob(job_id));
		});
		it('large job progress = 1 after ending', function() {
			backend.startJob(job_id, function(results) {
					assert.equal(backend.checkJob(job_id), 1);
					assert.deepEqual(backend.getJobResult(job_id), results);
				});
		});

		var job_id2 = backend.newJob({'model_options': model_opts, 'algorithm_options': alg_opts});
		it('small job progress = 0 before starting', function() {
			assert.equal(true, backend.setX(job_id2, [[0, 1], [1, 1]]));
			assert.equal(true, backend.setY(job_id2, [[0], [1]]));
			assert.equal(0, backend.checkJob(job_id2));
		});

		it('small job progress = 1 after ending', function() {
			assert.equal(true, 
				backend.startJob(job_id2, function(results) {
					assert.equal(backend.checkJob(job_id2), 1);
					assert.deepEqual(backend.getJobResult(job_id2), results);
				} ));
		});

		var job_id3 = backend.newJob({'model_options': model_opts, 'algorithm_options': alg_opts});
		it('large job progress = 0 before starting', function() {
			assert.equal(true, backend.setX(job_id3, largeX));
			assert.equal(true, backend.setY(job_id3, largeY));
			//assert.equal(0, backend.checkJob(job_id3));
		});

		/*it('large job progress < 1 before ending', function() {
			backend.startJob(job_id3, function(results) {} );
			console.log(backend.checkJob(job_id3));
			assert.isBelow(backend.checkJob(job_id3), 1, 'job progress should be less than 1 immediately after starting')
		});*/

		/*it('large job progress = 1 after ending', function() {
			backend.startJob(job_id3, function(results) {
					assert.equal(backend.checkJob(job_id3), 1);
					assert.deepEqual(backend.getJobResult(job_id3), results);
			});
		});*/
	});

});
