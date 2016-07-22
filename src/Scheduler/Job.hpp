#ifndef JOB_HPP
#define JOB_HPP

#include <uv.h>
#include <v8.h>
#include <Eigen/Dense>

#ifdef BAZEL
#include "Algorithms/Algorithm.hpp"
#include "Algorithms/AlgorithmOptions.hpp"
#include "Models/Model.hpp"
#include "Models/ModelOptions.hpp"
#else
#include "../Algorithms/Algorithm.hpp"
#include "../Algorithms/AlgorithmOptions.hpp"
#include "../Models/Model.hpp"
#include "../Models/ModelOptions.hpp"
#endif

using namespace std;
using namespace v8;

typedef struct Job_t {
	uv_work_t request;
	Persistent<Function> callback;
	int job_id;
	Algorithm* algorithm;
	Model* model;
} Job_t;

typedef struct JobOptions_t {
	AlgorithmOptions_t alg_opts;
	ModelOptions_t model_opts;
	//double priority;

	JobOptions_t(v8::Isolate* isolate, v8::Handle<v8::Object> options_v8) {
		Handle<Object> alg_opts_v8 = Handle<Object>::Cast(options_v8->Get(
			v8::String::NewFromUtf8(isolate, "algorithm_options")));
		alg_opts = AlgorithmOptions_t(isolate, alg_opts_v8);

		Handle<Object> model_opts_v8 = Handle<Object>::Cast(options_v8->Get(
			v8::String::NewFromUtf8(isolate, "model_options")));
		model_opts = ModelOptions_t(isolate, model_opts_v8);
	}

	JobOptions_t(AlgorithmOptions_t alg, ModelOptions_t model)
	: alg_opts(alg)
	, model_opts(model){};

} JobOptions_t;

#endif // JOB_HPP