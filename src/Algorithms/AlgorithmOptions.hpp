

#ifndef ALGORITHM_OPTIONS_HPP
#define ALGORITHM_OPTIONS_HPP

#include <iostream>
#include <unordered_map>
#include <v8.h>

using namespace std;
using namespace v8;

enum algorithm_type {
	brent_search = 0,
	proximal_gradient_descent = 1,
	grid_search = 2,
	iterative_update = 3,
	hypo_test = 4,
	neighbor_selection = 5,
};

typedef struct AlgorithmOptions_t {
	algorithm_type type;
	unordered_map<string, string> options;

	AlgorithmOptions_t(v8::Isolate* isolate, v8::Handle<v8::Object> options_v8) {
		v8::Handle<v8::Value> type_handle = options_v8->Get(
			v8::String::NewFromUtf8(isolate, "type"));
		type = (algorithm_type)type_handle->IntegerValue();
		
		// Convert v8 properties into a dictionary of options
		Handle<v8::Object> opts = options_v8->Get(
			v8::String::NewFromUtf8(isolate, "options")).As<v8::Object>();
		Local<v8::Array> props = opts->GetPropertyNames();

		for (unsigned int i=0; i < props->Length(); i++) {
			v8::String::Utf8Value param1(
				props->Get(Integer::New(isolate, i))->ToString());
			
			v8::String::Utf8Value param2(opts->Get(
				v8::String::NewFromUtf8(isolate, *param1)->ToString()));
			options.emplace(string(*param1), string(*param2));
		}
	}

	AlgorithmOptions_t(algorithm_type t, unordered_map<string, string> opt)
	: type(t)
	, options(opt) {}

	AlgorithmOptions_t(){};

} AlgorithmOptions_t;

#endif // ALGORITHM_OPTIONS_HPP
