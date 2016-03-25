#ifndef JOB_HPP
#define JOB_HPP

#include <uv.h>
#include <v8.h>

#ifdef BAZEL
#include "algorithm/Algorithm.hpp"
#include "model/Model.hpp"
#else
#include "../algorithm/Algorithm.hpp"
#include "../model/Model.hpp"
#endif

using namespace std;
using namespace v8;

struct Job_t {
	uv_work_t request;
	Persistent<Function> callback;
	int job_id;
	Algorithm* algorithm;
	Model* model;
	//Results_t* results;	// Unclear how results should be packaged.
};

/*
struct Work {
	uv_work_t request;
	Persistent<Function> callback;
	int results;
	Local<Number> job_num;
	Algorithm* algorithm;
	Model* model;
};*/

struct JobOptions_t {
	int algorithm_id;
	int model_id;
	//double priority;

	JobOptions_t(v8::Isolate* isolate, v8::Handle<v8::Object> options_v8) {
		v8::Handle<v8::Value> algorithm_id_handle = options_v8->Get(
			v8::String::NewFromUtf8(isolate, "algorithm_id"));
		v8::Handle<v8::Value> model_id_handle = options_v8->Get(
			v8::String::NewFromUtf8(isolate, "model_id"));
		//assert(algorithm_id_handle->IsInteger(), "Expected integer algorithm ID");
		//assert(model_id_handle->IsInteger(), "Expected integer model ID");
		
		algorithm_id = algorithm_id_handle->IntegerValue();
		model_id = model_id_handle->IntegerValue();
	}
};

#endif // JOB_HPP