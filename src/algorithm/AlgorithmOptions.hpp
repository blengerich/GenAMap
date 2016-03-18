

#ifndef ALGORITHM_OPTIONS_HPP
#define ALGORITHM_OPTIONS_HPP

#include <v8.h>

using namespace std;


enum algorithm_type {
    proximal_gradient_descent = 1,
    iterative_update = 2
};

struct AlgorithmOptions_t {
	// TODO: algorithm constructors that accept this options type
	algorithm_type type;
	int max_iteration;
	double tolerance;
	double learning_rate;

	AlgorithmOptions_t(v8::Isolate* isolate, v8::Handle<v8::Object> options_v8) {
		v8::Handle<v8::Value> type_handle = options_v8->Get(
			v8::String::NewFromUtf8(isolate, "type"));
		v8::Handle<v8::Value> max_iteration_handle = options_v8->Get(
			v8::String::NewFromUtf8(isolate, "max_iteration"));
		v8::Handle<v8::Value> tolerance_handle = options_v8->Get(
			v8::String::NewFromUtf8(isolate, "tolerance"));
		v8::Handle<v8::Value> learning_rate_handle = options_v8->Get(
			v8::String::NewFromUtf8(isolate, "learning_rate"));
		//v8::assert(type_handle->IsInteger(), "Expected integer algorithm type");
		//v8::assert(max_iteration_handle->IsInteger(), "Expected integer number of iterations");
		
		type = (algorithm_type)type_handle->IntegerValue();
		max_iteration = max_iteration_handle->IntegerValue();
		tolerance = tolerance_handle->NumberValue();
		learning_rate = learning_rate_handle->NumberValue();
	}
};

#endif // ALGORITHM_OPTIONS_HPP