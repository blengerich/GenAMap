

#include "Scheduler_node.hpp"

#include <exception>
#include <iostream>
#include <map>
#include <node.h>
#include <pthread.h>
#include <queue>
#include <stdio.h>
#include <uv.h>
#include <v8.h>

#include "../../algorithm/ProximalGradientDescent.hpp"
#include "../../algorithm/IterativeUpdate.hpp"
#include "../../algorithm/Algorithm.hpp"
#include "../../algorithm/AlgorithmOptions.hpp"
#include "../../model/ModelOptions.hpp"
#include "../Job.hpp"
#include "../Scheduler.hpp"

using namespace std;
using namespace v8;


// Creates a new algorithm, but does not run it. Currently synchronous.
// Arguments: JSON to be converted to AlgorithmOptions_t
void newAlgorithm(const FunctionCallbackInfo<Value>& args) {
	Isolate* isolate = args.GetIsolate();

	if (args.Length() < 1) {
		isolate->ThrowException(Exception::TypeError(
			String::NewFromUtf8(isolate, "Wrong number of arguments")));
		return;

	}

	Handle<Object> options_v8 = Handle<Object>::Cast(args[0]);
	const AlgorithmOptions_t& options = AlgorithmOptions_t(isolate, options_v8);

	const int id = Scheduler::Instance()->newAlgorithm(options);
	if (id < 0) {
		isolate->ThrowException(Exception::Error(
			String::NewFromUtf8(isolate, "Could not add another algorithm.")));
		return;
	}

	Local<Integer> retval = Integer::New(isolate, id);
	args.GetReturnValue().Set(retval);
}

// Creates a new model, but does not run it. Synchronous.
// Arguments: JSON to be converted to ModelOptions_t
void newModel(const FunctionCallbackInfo<Value>& args) {
	Isolate* isolate = args.GetIsolate();
	Handle<Object> options_v8 = Handle<Object>::Cast(args[0]);
	const ModelOptions_t& options = ModelOptions_t(isolate, options_v8);
	const int id = Scheduler::Instance()->newModel(options);
	if (id < 0) {
		isolate->ThrowException(Exception::Error(
			String::NewFromUtf8(isolate, "Could not add another model")));
		return;
	}

	Local<Integer> retval = Integer::New(isolate, id);
	args.GetReturnValue().Set(retval);
}

// Sets the X matrix of a given model.
// Arguments: model_num, JSON matrix
void setX(const FunctionCallbackInfo<Value>& args) {
	Isolate* isolate = args.GetIsolate();
	const int model_num = (int)Local<Number>::Cast(args[0])->Value();
	Local<v8::Array> ar = Local<v8::Array>::Cast(args[1]);

	const unsigned int rows = ar->Length();
	const unsigned int cols = Local<v8::Array>::Cast(ar->Get(0))->Length();
	Eigen::MatrixXd Matrix(rows, cols);

	for (unsigned int i=0; i<rows; i++) {
		for (unsigned int j=0; j<cols; j++) {
			Matrix(i,j) = (double)Local<v8::Array>::Cast(ar->Get(i))->Get(j)->NumberValue();
		}
	}
	/*cout << "X: " << endl << Matrix << endl;*/
	bool result = Scheduler::Instance()->setX(model_num, Matrix);
	Local<Boolean> retval = Boolean::New(isolate, result);
	args.GetReturnValue().Set(retval);
}

// Sets the Y matrix of a given model.
// Arguments: model_num, JSON matrix
void setY(const FunctionCallbackInfo<Value>& args) {
	Isolate* isolate = args.GetIsolate();

	const int model_num = (int)Local<Number>::Cast(args[0])->Value();
	Local<v8::Array> ar = Local<v8::Array>::Cast(args[1]);

	const unsigned int rows = ar->Length();
	const unsigned int cols = Local<v8::Array>::Cast(ar->Get(0))->Length();
	Eigen::MatrixXd Matrix(rows, cols);

	for (unsigned int i=0; i<rows; i++) {
		for (unsigned int j=0; j<cols; j++) {
			Matrix(i,j) = (double)Local<v8::Array>::Cast(ar->Get(i))->Get(j)->NumberValue();
		}
	}
	/*cout << "Y: " << endl << Matrix << endl;*/
	bool result = Scheduler::Instance()->setY(model_num, Matrix);
	args.GetReturnValue().Set(Boolean::New(isolate, result));	
}


// Creates a new job, but does not run it. Synchronous.
// Arguments: JSON to be converted to JobOptions_t
void newJob(const v8::FunctionCallbackInfo<v8::Value>& args) {
	Isolate* isolate = args.GetIsolate();
	Handle<Object> options_v8 = Handle<Object>::Cast(args[0]);
	const JobOptions_t& options = JobOptions_t(isolate, options_v8);
	const int id = Scheduler::Instance()->newJob(options);
	if (id < 0) {
		isolate->ThrowException(Exception::Error(
			String::NewFromUtf8(isolate, "Could not add another job")));
		return;
	}

	Local<Integer> retval = Integer::New(isolate, id);
	args.GetReturnValue().Set(retval);
}


// Maybe begins the training of an algorithm, given the job number.
// Asynchronous.
// Arguments: int job_id, function callback
void startJob(const v8::FunctionCallbackInfo<v8::Value>& args) {
	Isolate* isolate = args.GetIsolate();
	// Inspect arguments.
	//assert(args.Length() >= 2, "Must give a callback and a job num to train.");
	const int job_id = (int)Local<Number>::Cast(args[0])->Value();
	Job_t* job = Scheduler::Instance()->getJob(job_id);
	job->request.data = job;
	job->callback.Reset(isolate, Local<Function>::Cast(args[1]));
	job->job_id = job_id;

	bool result = Scheduler::Instance()->startJob(job, trainAlgorithmComplete);
	args.GetReturnValue().Set(Boolean::New(isolate, result));
}

// Checks the status of an algorithm, given the algorithm's job number.
// Currently synchronous.
// Arguments: int job_id
void checkJob(const v8::FunctionCallbackInfo<v8::Value>& args) {
	Isolate* isolate = args.GetIsolate();

	// Check argument types.
	if (args.Length() < 1) {
		isolate->ThrowException(Exception::TypeError(
			String::NewFromUtf8(isolate, "Must supply a job id to check.")));
		return;
	}

	if (!args[0]->IsNumber()) {
		isolate->ThrowException(Exception::TypeError(
			String::NewFromUtf8(isolate, "Job id must be a number.")));
		return;
	}

	int job_id = (int)Local<Number>::Cast(args[0])->Value();
	const double progress = Scheduler::Instance()->checkJob(job_id);
	Local<Number> retval = Number::New(isolate, progress);
	args.GetReturnValue().Set(retval);
}


// Cancels a potentially running Algorithm.
// Synchronous.
// Arguments: int job_id
// Returns: boolean representing success.
void cancelJob(const v8::FunctionCallbackInfo<v8::Value>& args) {
	Isolate* isolate = args.GetIsolate();

	// Check argument types.
	if (args.Length() < 1) {
		isolate->ThrowException(Exception::TypeError(
			String::NewFromUtf8(isolate, "Must supply a job id to cancel.")));
		return;
	}
	
	if (!args[0]->IsNumber()) {
		isolate->ThrowException(Exception::TypeError(
			String::NewFromUtf8(isolate, "Job id must be a number.")));
		return;
	}

	const int job_id = (int)Local<Integer>::Cast(args[0])->Value();
	const bool success = Scheduler::Instance()->cancelJob(job_id);
	Handle<Boolean> retval = Boolean::New(isolate, success);
	args.GetReturnValue().Set(retval);
}


// Arguments: int alg_id
// Returns: boolean for success
void deleteAlgorithm(const v8::FunctionCallbackInfo<v8::Value>& args) {
	Isolate* isolate = args.GetIsolate();
	const int algorithm_id = (int)Local<Integer>::Cast(args[0])->Value();
	const bool success = Scheduler::Instance()->deleteAlgorithm(algorithm_id);
	Handle<Boolean> retval = Boolean::New(isolate, success);
	args.GetReturnValue().Set(retval);
}


// Arguments: int model_id
void deleteModel(const v8::FunctionCallbackInfo<v8::Value>& args) {
	Isolate* isolate = args.GetIsolate();
	const int model_id = (int)Local<Integer>::Cast(args[0])->Value();
	const bool success = Scheduler::Instance()->deleteModel(model_id);
	Handle<Boolean> retval = Boolean::New(isolate, success);
	args.GetReturnValue().Set(retval);
}


// Arguments: job_id
void deleteJob(const v8::FunctionCallbackInfo<v8::Value>& args) {
	Isolate* isolate = args.GetIsolate();
	const int job_id = (int)Local<Integer>::Cast(args[0])->Value();
	const bool success = Scheduler::Instance()->deleteJob(job_id);
	Handle<Boolean> retval = Boolean::New(isolate, success);
	args.GetReturnValue().Set(retval);
}


// Handles packaging of algorithm results to return to the frontend.
// Called by libuv in event loop when async training completes.
void trainAlgorithmComplete(uv_work_t* req, int status) {
	// Runs in event loop when algorithm completes.
	Isolate* isolate = Isolate::GetCurrent();
	HandleScope handleScope(isolate);

	Job_t* job = static_cast<Job_t*>(req->data);
	
	// Pack up the data here to be returned to JS - unclear what the format is
	Local<v8::Array> result_list = v8::Array::New(isolate);
	Handle<Value> argv[] = { result_list };

	// execute the callback
	Local<Function>::New(isolate, job->callback)->Call(
		isolate->GetCurrentContext()->Global(), 1, argv);
	job->callback.Reset();
	delete job;
	// Should call scheduler's delete job function here
}

