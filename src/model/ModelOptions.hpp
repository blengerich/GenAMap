

#ifndef MODEL_OPTIONS_HPP
#define MODEL_OPTIONS_HPP

#include <unordered_map>
#include <v8.h>

using namespace std;
using namespace v8;

enum model_type {
	linear_regression = 1,
	lasso = 2,
	ada_multi_lasso = 3,
	gf_lasso = 4,
	multi_pop_lasso = 5,
	tree_lasso = 6
};

typedef struct ModelOptions_t {
	model_type type;
	unordered_map<string, string> options;

	ModelOptions_t(Isolate* isolate, Handle<Object> options_v8) {
		Handle<Value> type_handle = options_v8->Get(
			String::NewFromUtf8(isolate, "type"));
		type = (model_type)type_handle->IntegerValue();

		// Convert v8 properties into a dictionary of options
		Handle<Object> opts = options_v8->Get(
			String::NewFromUtf8(isolate, "options")).As<Object>();
		Local<v8::Array> props = opts->GetPropertyNames();

		for (unsigned int i=0; i < props->Length(); i++) {
			v8::String::Utf8Value param1(
				props->Get(Integer::New(isolate, i))->ToString());

			v8::String::Utf8Value param2(opts->Get(
				v8::String::NewFromUtf8(isolate, *param1)->ToString()));
			options.emplace(string(*param1), string(*param2));
		}
	}

	ModelOptions_t(model_type model, unordered_map<string, string> opts)
	: type(model)
	, options(opts){};
} ModelOptions_t;

#endif // MODEL_OPTIONS_HPP