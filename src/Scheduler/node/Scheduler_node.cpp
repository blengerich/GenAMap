

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

#include "../../Algorithms/ProximalGradientDescent.hpp"
#include "../../Algorithms/IterativeUpdate.hpp"
#include "../../Algorithms/Algorithm.hpp"
#include "../../Algorithms/AlgorithmOptions.hpp"
#include "../../Models/ModelOptions.hpp"
#include "../Job.hpp"
#include "../Scheduler.hpp"
#include "../../JSON/JsonCoder.hpp"

using namespace std;
using namespace v8;


// Sets the X matrix of a given model.
// Arguments: job_id, JSON matrix
void setX(const FunctionCallbackInfo<Value>& args) {
	bool result = false;
	Isolate* isolate = args.GetIsolate();
	if (ArgsHaveJobID(args, 0)) {
		const int job_id = (int)Local<Number>::Cast(args[0])->Value();
		Local<v8::Array> ar = Local<v8::Array>::Cast(args[1]);
		MatrixXd* mat = v8toEigen(ar);
		result = Scheduler::Instance()->setX(job_id, *mat);
	}
	args.GetReturnValue().Set(Boolean::New(isolate, result));
}

// Sets the Y matrix of a given model.
// Arguments: job_id, JSON matrix
void setY(const FunctionCallbackInfo<Value>& args) {
	bool result = false;
	Isolate* isolate = args.GetIsolate();
	if (ArgsHaveJobID(args, 0)) {
		const int job_id = (int)Local<Number>::Cast(args[0])->Value();
		Local<v8::Array> ar = Local<v8::Array>::Cast(args[1]);
		MatrixXd* mat = v8toEigen(ar);
		result = Scheduler::Instance()->setY(job_id, *mat);
	}
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

	if (!ArgsHaveJobID(args, 0)) {
		args.GetReturnValue().Set(Boolean::New(isolate, false));
		return;
	}

	const int job_id = (int)Local<Number>::Cast(args[0])->Value();
	Job_t* job = Scheduler::Instance()->getJob(job_id);
	if (!job) {
		isolate->ThrowException(Exception::TypeError(
			String::NewFromUtf8(isolate, "Job id must correspond to a job that has been created.")));
		args.GetReturnValue().Set(Boolean::New(isolate, false));
		return;
	}

	if (job->algorithm->getIsRunning()) {
		isolate->ThrowException(Exception::Error(
			String::NewFromUtf8(isolate, "Job is already running.")));
		args.GetReturnValue().Set(Boolean::New(isolate, false));
		return;
	}

	job->callback.Reset(isolate, Local<Function>::Cast(args[1]));
	job->job_id = job_id;
	bool result = Scheduler::Instance()->startJob(job_id, trainAlgorithmComplete);
	args.GetReturnValue().Set(Boolean::New(isolate, result));
}

// Checks the status of an algorithm, given the algorithm's job number.
// Currently synchronous.
// Arguments: int job_id
void checkJob(const v8::FunctionCallbackInfo<v8::Value>& args) {
	Isolate* isolate = args.GetIsolate();

	// Check argument types.
	if (!ArgsHaveJobID(args, 0)) {
		args.GetReturnValue().Set(Boolean::New(isolate, false));
		return;
	}

	int job_id = (int)Local<Number>::Cast(args[0])->Value();
	const double progress = Scheduler::Instance()->checkJobProgress(job_id);
	Local<Number> retval = Number::New(isolate, progress);
	args.GetReturnValue().Set(retval);
}

// Gets the results of a job, given the job's id.
// Synchronous.
// Arguments: int job_id
// Returns: MatrixXd of results, empty on error.
void getJobResult(const v8::FunctionCallbackInfo<v8::Value>& args) {
	Isolate* isolate = args.GetIsolate();

	// Check argument types.
	if (!ArgsHaveJobID(args, 0)) {
		args.GetReturnValue().Set(Boolean::New(isolate, false));
		return;
	}

	int job_id = (int)Local<Number>::Cast(args[0])->Value();
	const MatrixXd& result = Scheduler::Instance()->getJobResult(job_id);
	Local<v8::Array> obj = v8::Array::New(isolate);
	// TODO: Fewer convserions to return a matrix [Issue: https://github.com/blengerich/GenAMap_V2/issues/17]
	obj->Set(0, v8::String::NewFromUtf8(isolate, JsonCoder::getInstance().encodeMatrix(result).c_str()));
	args.GetReturnValue().Set(obj);
}


// Cancels a potentially running Algorithm.
// Synchronous.
// Arguments: int job_id
// Returns: boolean representing success.
void cancelJob(const v8::FunctionCallbackInfo<v8::Value>& args) {
	Isolate* isolate = args.GetIsolate();

	// Check argument types.
	if (!ArgsHaveJobID(args, 0)) {
		args.GetReturnValue().Set(Boolean::New(isolate, false));
		return;
	}

	const int job_id = (int)Local<Integer>::Cast(args[0])->Value();
	const bool success = Scheduler::Instance()->cancelJob(job_id);
	Handle<Boolean> retval = Boolean::New(isolate, success);
	args.GetReturnValue().Set(retval);
}


// Arguments: job_id
void deleteJob(const v8::FunctionCallbackInfo<v8::Value>& args) {
	Isolate* isolate = args.GetIsolate();

	if (!ArgsHaveJobID(args, 0)) {
		args.GetReturnValue().Set(Boolean::New(isolate, false));
		return;
	}

	const int job_id = (int)Local<Integer>::Cast(args[0])->Value();
	const bool success = Scheduler::Instance()->deleteJob(job_id);
	Handle<Boolean> retval = Boolean::New(isolate, success);
	args.GetReturnValue().Set(retval);
}

/////////////////////////////////
// Helper Functions
/////////////////////////////////

// Handles packaging of algorithm results to return to the frontend.
// Called by libuv in event loop when async training completes.
void trainAlgorithmComplete(uv_work_t* req, int status) {
	cerr << status;
	// Runs in event loop when algorithm completes.
	Isolate* isolate = Isolate::GetCurrent();
	HandleScope handleScope(isolate);

	Job_t* job = static_cast<Job_t*>(req->data);
	Local<v8::Array> obj = v8::Array::New(isolate);

	// If the job failed, the first argument says "Error", the second is the exception text.
	if (job->exception) {
		obj->Set(0, v8::String::NewFromUtf8(isolate, "Error"));
		try {
			rethrow_exception(job->exception);
		} catch(const exception& e) {
			obj->Set(1, v8::String::NewFromUtf8(isolate, e.what()));	
		}
	} else {
		// Pack up the data to be returned to JS
		const MatrixXd& result = job->model->getBeta();
		// TODO: Fewer convserions to return a matrix [Issue: https://github.com/blengerich/GenAMap_V2/issues/17]
		obj->Set(0, v8::String::NewFromUtf8(isolate, "Result"));
		obj->Set(1, v8::String::NewFromUtf8(isolate, JsonCoder::getInstance().encodeMatrix(result).c_str()));	
	}
	
	Handle<Value> argv[] = { obj };
	// execute the callback
	Local<Function>::New(isolate, job->callback)->Call(
		isolate->GetCurrentContext()->Global(), 1, argv);
	job->callback.Reset();
}


MatrixXd* v8toEigen(Local<v8::Array>& ar) {
	const unsigned int rows = ar->Length();
	Local<v8::Array> props = Local<v8::Object>::Cast(ar->Get(0))->GetPropertyNames();
	const unsigned int cols = props->Length();
	Eigen::MatrixXd* mat = new Eigen::MatrixXd(rows, cols);

	for (unsigned int i=0; i<rows; i++) {
		for (unsigned int j=0; j<cols; j++) {
			(*mat)(i,j) = (double)Local<v8::Object>::Cast(ar->Get(i))->Get(props->Get(j))->NumberValue();
		}
	}
	return mat;
}

// Checks that the argument in the supplied position is a number type.
// Doesn't check that it is a valid job ID.
bool ArgsHaveJobID(const FunctionCallbackInfo<Value>& args, const int position) {
	Isolate* isolate = args.GetIsolate();
	if (args.Length() < 1) {
		isolate->ThrowException(Exception::TypeError(
			String::NewFromUtf8(isolate, "Must supply a job id.")));
		args.GetReturnValue().Set(Boolean::New(isolate, false));
		return false;
	}

	if (!(args[0]->IsNumber())) {
		isolate->ThrowException(Exception::TypeError(
			String::NewFromUtf8(isolate, "Job id must be a number.")));
		args.GetReturnValue().Set(Boolean::New(isolate, false));
		return false;
	}

	return true;
}

/* Deprecated - only interacting with jobs now
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

*/