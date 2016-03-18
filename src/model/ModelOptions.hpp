

#ifndef MODEL_OPTIONS_HPP
#define MODEL_OPTIONS_HPP

#include <v8.h>

using namespace std;

enum model_type {
	linear_regression,
	lasso,
	ada_multi_lasso,
	gf_lasso,
	multi_pop_lasso,
	tree_lasso
};

struct ModelOptions_t {
	model_type type;

	/* TODO:
		Add all the options that are required to build the various models
		Write constructors for the models to accept the options struct
	*/
	ModelOptions_t(v8::Isolate* isolate, v8::Handle<v8::Object> options_v8) {
		v8::Handle<v8::Value> type_handle = options_v8->Get(
			v8::String::NewFromUtf8(isolate, "type"));
		type = (model_type)type_handle->IntegerValue();
	}
};

#endif // MODEL_OPTIONS_HPP