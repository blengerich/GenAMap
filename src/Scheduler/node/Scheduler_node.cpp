

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
void newAlgorithm(const v8::FunctionCallbackInfo<v8::Value>& args) {
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
			String::NewFromUtf8(isolate, "Could not add another algorithm (algorithm map may be full).")));
		return;
	}

	Local<Integer> retval = Integer::New(isolate, id);
	args.GetReturnValue().Set(retval);
}


void newModel(const v8::FunctionCallbackInfo<v8::Value>& args) {
	Isolate* isolate = args.GetIsolate();
	Handle<Object> options_v8 = Handle<Object>::Cast(args[0]);
	const ModelOptions_t& options = ModelOptions_t(isolate, options_v8);
	const int id = Scheduler::Instance()->newModel(options);
	if (id < 0) {
		isolate->ThrowException(Exception::Error(
			String::NewFromUtf8(isolate, "Could not add another model (model map may be full)")));
		return;
	}

	Local<Integer> retval = Integer::New(isolate, id);
	args.GetReturnValue().Set(retval);
}


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
// Expects arguments function callback, int job_id
void startJob(const v8::FunctionCallbackInfo<v8::Value>& args) {
	Isolate* isolate = args.GetIsolate();
	// Inspect arguments.
	//assert(args.Length() >= 2, "Must give a callback and a job num to train.");

	Scheduler::Instance()->startJob(
		isolate, Local<Function>::Cast(args[0]), Local<Number>::Cast(args[1]));
	args.GetReturnValue().Set(Undefined(isolate));
}

// Checks the status of an algorithm, given the algorithm's job number.
// Currently synchronous.
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


void deleteAlgorithm(const v8::FunctionCallbackInfo<v8::Value>& args) {
	Isolate* isolate = args.GetIsolate();
	const int algorithm_id = (int)Local<Integer>::Cast(args[0])->Value();
	const bool success = Scheduler::Instance()->deleteAlgorithm(algorithm_id);
	Handle<Boolean> retval = Boolean::New(isolate, success);
	args.GetReturnValue().Set(retval);
}


void deleteModel(const v8::FunctionCallbackInfo<v8::Value>& args) {
	Isolate* isolate = args.GetIsolate();
	const int model_id = (int)Local<Integer>::Cast(args[0])->Value();
	const bool success = Scheduler::Instance()->deleteModel(model_id);
	Handle<Boolean> retval = Boolean::New(isolate, success);
	args.GetReturnValue().Set(retval);
}


void deleteJob(const v8::FunctionCallbackInfo<v8::Value>& args) {
	Isolate* isolate = args.GetIsolate();
	const int job_id = (int)Local<Integer>::Cast(args[0])->Value();
	const bool success = Scheduler::Instance()->deleteJob(job_id);
	Handle<Boolean> retval = Boolean::New(isolate, success);
	args.GetReturnValue().Set(retval);
}

void hello(const v8::FunctionCallbackInfo<v8::Value>& args) {
	Isolate* isolate = args.GetIsolate();
  	args.GetReturnValue().Set(String::NewFromUtf8(isolate, "world"));
}

void Add(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();

  // Check the number of arguments passed.
  if (args.Length() < 2) {
    // Throw an Error that is passed back to JavaScript
    isolate->ThrowException(Exception::TypeError(
        String::NewFromUtf8(isolate, "Wrong number of arguments")));
    return;
  }

  // Check the argument types
  if (!args[0]->IsNumber() || !args[1]->IsNumber()) {
    isolate->ThrowException(Exception::TypeError(
        String::NewFromUtf8(isolate, "Wrong arguments")));
    return;
  }

  // Perform the operation
  double value = args[0]->NumberValue() + args[1]->NumberValue();
  Local<Number> num = Number::New(isolate, value);

  // Set the return value (using the passed in
  // FunctionCallbackInfo<Value>&)
  args.GetReturnValue().Set(num);
}


/////////////////////
// Register with Node
/////////////////////

void Init(Handle<Object> exports, Handle<Object> module) {
	NODE_SET_METHOD(exports, "newAlgorithm", newAlgorithm);
	NODE_SET_METHOD(exports, "newModel", newModel);
	NODE_SET_METHOD(exports, "newJob", newJob);
	NODE_SET_METHOD(exports, "startJob", startJob);
	NODE_SET_METHOD(exports, "checkJob", checkJob);
	NODE_SET_METHOD(exports, "cancelJob", cancelJob);
	NODE_SET_METHOD(exports, "hello", hello);
	NODE_SET_METHOD(exports, "add", Add);
}

NODE_MODULE(scheduler, Init)