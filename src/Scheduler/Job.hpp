#ifndef JOB_HPP
#define JOB_HPP

#include <uv.h>
#include <v8.h>

#ifdef BAZEL
#include "algorithm/Algorithm.hpp"
#include "algorithm/AlgorithmOptions.hpp"
#include "model/Model.hpp"
#include "model/ModelOptions.hpp"
#else
#include "../algorithm/Algorithm.hpp"
#include "../algorithm/AlgorithmOptions.hpp"
#include "../model/Model.hpp"
#include "../model/ModelOptions.hpp"
#endif

using namespace std;
using namespace v8;

typedef struct Job_t {
	uv_work_t request;
	Persistent<Function> callback;
	int job_id;
	Algorithm* algorithm;
	Model* model;
	//Results_t* results;	// Unclear how results should be packaged.
} Job_t;

typedef struct JobOptions_t {
	int algorithm_id;
	int model_id;
	//double priority;

	JobOptions_t(v8::Isolate* isolate, v8::Handle<v8::Object> options_v8) {
		v8::Handle<v8::Value> algorithm_id_handle = options_v8->Get(
			v8::String::NewFromUtf8(isolate, "algorithm_id"));
		v8::Handle<v8::Value> model_id_handle = options_v8->Get(
			v8::String::NewFromUtf8(isolate, "model_id"));

		algorithm_id = algorithm_id_handle->IntegerValue();
		model_id = model_id_handle->IntegerValue();
	}

	JobOptions_t(int algorithm, int model)
	: algorithm_id(algorithm)
	, model_id(model){};

} JobOptions_t;

#endif // JOB_HPP