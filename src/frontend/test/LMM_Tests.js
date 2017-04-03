var assert = require('chai').assert;
var expect = require('chai').expect;
var backend = require('../../Scheduler/node/build/Release/scheduler.node');

// Model Options
var model_opts = {'type': 0,	// Linear Regression
			'options': {'lambda': 0.05, 'L2_lambda': 0.01}};
var bad_model_opts = {'type': 108,
			'options': {'lambda': 0.05, 'L2_lambda': 0.01}};

// Algorithm Options
var alg_opts = {'type': 1, 	// ProximalGradientDescent
			'options': {'tolerance': 0.01, 'learning_rate': 0.1}};
var bad_alg_opts = {'type': 10,
			'options': {'tolerance': 0.01, 'learning_rate': 0.1}};

describe('FaSTLMM', function() {
	describe('newJob', function() {
		var id1 = backend.newJob({'algorithm_options': alg_opts, 'model_options': model_opts});
		// var id2 = backend.newJob({'model_options': model_opts, 'algorithm_options': alg_opts});
		// it('should return a non-negative integer for the first job ID', function () {
		// 	assert.isAtLeast(id1, 1);
		// });		
		// it('should return a larger integer for the second job ID', function () {
		// 	assert.isAtLeast(id2, id1);
		// });
		
		// it('should throw exception when bad options are given', function () {
		// 	assert.throws(function() {backend.newJob(
		// 		{'model_options': bad_model_opts, 'algorithm_options': alg_opts})},
		// 		Error, 'Error creating model');
		// 	assert.throws(function() {backend.newJob(
		// 		{'algorithm_options': bad_alg_opts, 'model_options': model_opts})},
		// 		Error, 'Error creating algorithm');
		// });
	});


});


