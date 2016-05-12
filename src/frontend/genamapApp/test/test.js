var assert = require('chai').assert;
var backend = require('../../../Scheduler/node/build/Release/scheduler')

describe('Scheduler', function() {
	describe('newAlgorithm', function() {
		it('should return 0 for the first algorithm ID', function () {
			assert.equal(0, backend.newAlgorithm({'type': '3',
				'options': {'tolerance': '0.01', 'learning_rate': '0.1'}}));
		});

		it('should return 1 for the second algorithm ID', function () {
			assert.equal(1, backend.newAlgorithm({'type': 3,
				'options': {'tolerance': 0.01, 'learning_rate': 0.1}}));
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
		it('should return 0 for the first model ID', function () {
			assert.equal(0, backend.newModel({'type': '1',
				'options': {'lambda': '0.05', 'L2_lambda': '0.01'}}));
		});
		
		it('should return 1 for the second model ID', function () {
			assert.equal(1, backend.newModel({'type': '1',
				'options': {'lambda': 0.05, 'L2_lambda': 0.01}}));
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
});
