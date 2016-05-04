

#ifndef ALGORITHM_OPTIONS_HPP
#define ALGORITHM_OPTIONS_HPP

#include <unordered_map>
#include <v8.h>

using namespace std;
using namespace v8;

enum algorithm_type {
	brent_search = 1,
	grid_search = 2,
	iterative_update = 3,
    proximal_gradient_descent = 4,
};

struct AlgorithmOptions_t {
	algorithm_type type;
	unordered_map<string, string> options;

	/*int max_iteration;
	double tolerance;
	double learning_rate;*/

	AlgorithmOptions_t(v8::Isolate* isolate, v8::Handle<v8::Object> options_v8) {
		v8::Handle<v8::Value> type_handle = options_v8->Get(
			v8::String::NewFromUtf8(isolate, "type"));
		type = (algorithm_type)type_handle->IntegerValue();
		
		// Convert v8 properties into a dictionary of options
		Handle<Object> opts = options_v8->Get(
			String::NewFromUtf8(isolate, "options")).As<Object>();
		Local<v8::Array> props = opts->GetPropertyNames();

		for (unsigned int i=0; i < props->Length(); i++) {
			v8::String::Utf8Value param1(props->Get(Integer::New(isolate, i))->ToString());
			v8::String::Utf8Value param2(opts->Get(i)->ToString());
			options.emplace(string(*param1), string(*param2));
		}

		/*
		v8::Handle<v8::Value> max_iteration_handle = options_v8->Get(
			v8::String::NewFromUtf8(isolate, "max_iteration"));
		v8::Handle<v8::Value> tolerance_handle = options_v8->Get(
			v8::String::NewFromUtf8(isolate, "tolerance"));
		v8::Handle<v8::Value> learning_rate_handle = options_v8->Get(
			v8::String::NewFromUtf8(isolate, "learning_rate"));*/
		//v8::assert(type_handle->IsInteger(), "Expected integer algorithm type");
		//v8::assert(max_iteration_handle->IsInteger(), "Expected integer number of iterations");
		
		
		/*max_iteration = max_iteration_handle->IntegerValue();
		tolerance = tolerance_handle->NumberValue();
		learning_rate = learning_rate_handle->NumberValue();*/
	}
};

#endif // ALGORITHM_OPTIONS_HPP