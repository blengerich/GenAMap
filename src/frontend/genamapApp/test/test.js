var assert = require('chai').assert;
var backend = require('../../../Scheduler/node/build/Release/scheduler');

describe('Scheduler', function() {
	describe('newAlgorithm', function() {
		var id1 = backend.newAlgorithm({'type': '1',
				'options': {'tolerance': '0.01', 'learning_rate': '0.1'}});
		var id2 = backend.newAlgorithm({'type': 1,
				'options': {'tolerance': 0.01, 'learning_rate': 0.1}});

		it('should return at least 0 for the first algorithm ID', function () {
			assert.isAtLeast(id1, 0);
		});

		it('should return a higher value for the second algorithm ID', function () {
			assert.isAtLeast(id2, id1);
		});

		it('should throw exception when options are not given', function() {
			assert.throws(function() {backend.newAlgorithm()},
				TypeError, 'Wrong number of arguments');
		});

		it('should throw exception when bad options are given', function() {
			assert.throws(function() {backend.newAlgorithm({'type' : '5',
				'options' : {'tolerance': '0.01', 'learning_rate': '0.1'}})},
				Error, 'Could not add another algorithm');
		});
	});

	describe('newModel', function() {
		var id1 = backend.newModel({'type': '1',
				'options': {'lambda': '0.05', 'L2_lambda': '0.01'}});
		var id2 = backend.newModel({'type': '1',
				'options': {'lambda': 0.05, 'L2_lambda': 0.01}});
		it('should return at least 0 for the first model ID', function () {
			assert.isAtLeast(id1, 0);
		});
		
		it('should return a higher value for the second model ID', function () {
			assert.isAtLeast(id2, id1);
		});
		
		it('should throw exception when bad options are given', function () {
			assert.throws(function() {backend.newModel({'type': '8',
				'options': {'lambda': 0.05, 'L2_lambda': 0.01}})},
				Error, 'Could not add another model');
		});
	});

	describe('setX', function() {
		it('should return true when correctly done', function () {
			var model_id = backend.newModel({'type': '1',
				'options': {'lambda': '0.05', 'L2_lambda': '0.01'}});
			assert.equal(true, backend.setX(model_id, [[1,2], [3,4]]));
		});

		it('should return false for a model that has not been created', function () {
			var model_id = backend.newModel({'type': '1',
				'options': {'lambda': '0.05', 'L2_lambda': '0.01'}});
			assert.equal(false, backend.setX(model_id+1, [[1,2], [3,4]]));
		});
		
	});

	describe('setY', function() {
		it('should return true when correctly done', function () {
			var model_id = backend.newModel({'type': '1',
				'options': {'lambda': '0.05', 'L2_lambda': '0.01'}});
			assert.equal(true, backend.setY(model_id, [[1,2], [3,4]]));
		});

		it('should return false for a model that has not been created', function () {
			var model_id = backend.newModel({'type': '1',
				'options': {'lambda': '0.05', 'L2_lambda': '0.01'}});
			assert.equal(false, backend.setY(model_id+1, [[1,2], [3,4]]));
		});
		
	});

	describe('newJob', function() {
		var model_id = backend.newModel({'type': '1',
			'options': {'lambda': '0.05', 'L2_lambda': '0.01'}});
		var alg_id = backend.newAlgorithm({'type': '1',
			'options': {'tolerance': '0.01', 'learning_rate': '0.1'}});

		var id1 = backend.newJob({'model_id': model_id, 'algorithm_id': alg_id, 'model_type':1, 'algorithm_type':3});
		var id2 = backend.newJob({'model_id': model_id, 'algorithm_id': alg_id, 'model_type':1, 'algorithm_type':3});
		it('should return 0 for the first job ID', function () {
			assert.isAtLeast(id1, 0);
		});
		
		it('should return 1 for the second job ID', function () {
			assert.isAtLeast(id2, id1);
		});
		
		it('should throw exception when bad options are given', function () {
			assert.throws(function() {backend.newJob(
				{'model_id': -1, 'algorithm_id': alg_id, 'model_type':1, 'algorithm_type':3})},
				Error, 'Could not add another job');
			assert.throws(function() {backend.newJob(
				{'model_id': model_id, 'algorithm_id': -1, 'model_type':1, 'algorithm_type':3})},
				Error, 'Could not add another job');
		});	
	});


	describe('startJob', function() {
		var model_id = backend.newModel({'type': '1',
			'options': {'lambda': '0.05', 'L2_lambda': '0.01'}});
		var alg_id = backend.newAlgorithm({'type': '1',
			'options': {'tolerance': '0.01', 'learning_rate': '0.1'}});
		var job_id = backend.newJob({'model_id': model_id, 'algorithm_id': alg_id, 'model_type':1, 'algorithm_type':3});
		
		it('return true for good job start', function () {
			assert.equal(true, 
				backend.startJob(job_id, function() {/*empty callback*/} ));
		});

		//it('return false for bad options', function () {
		//	assert.equal(false, 
		//		backend.startJob(job_id+1, function() {/*empty callback*/} ));
		//});
	});

});
