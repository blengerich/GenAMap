

#include "Scheduler_node.hpp"

#include <Eigen/Dense>
#include <exception>
#include <iostream>
#include <map>
#include <node.h>
#include <pthread.h>
#include <queue>
#include <stdio.h>
#include <uv.h>
#include <v8.h>
#include <memory>

#include "../../Algorithms/ProximalGradientDescent.hpp"
#include "../../Algorithms/IterativeUpdate.hpp"
#include "../../Algorithms/Algorithm.hpp"
#include "../../Algorithms/AlgorithmOptions.hpp"
#include "../../Algorithms/HypoTestPlaceHolder.h"
#include "../../Models/ModelOptions.hpp"
#include "../Job.hpp"
#include "../Scheduler.hpp"
#include "../../JSON/JsonCoder.hpp"

using namespace Eigen;
using namespace std;
using namespace v8;


// Sets the X matrix of a given model.
// Arguments: job_id, JSON matrix
void setX(const FunctionCallbackInfo<Value>& args) {
	bool result = false;
	Isolate* isolate = args.GetIsolate();
	if (ArgsHaveJobID(args, 0)) {
		const job_id_t job_id = (unsigned int)Local<Number>::Cast(args[0])->Value();
		Local<v8::Array> ar = Local<v8::Array>::Cast(args[1]);
		MatrixXf* mat = v8toEigen(ar);
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
		const job_id_t job_id = (unsigned int)Local<Number>::Cast(args[0])->Value();
		Local<v8::Array> ar = Local<v8::Array>::Cast(args[1]);
		MatrixXf* mat = v8toEigen(ar);
		result = Scheduler::Instance()->setY(job_id, *mat);
	}
	args.GetReturnValue().Set(Boolean::New(isolate, result));
}

// Arguments: job_id, string of attribute name, matrix to use
void setModelAttributeMatrix(const FunctionCallbackInfo<Value>& args) {
	bool result = false;
	Isolate* isolate = args.GetIsolate();
	if (ArgsHaveJobID(args, 0)) {
		const job_id_t job_id = (unsigned int)Local<Number>::Cast(args[0])->Value();
		const string attribute_name(*v8::String::Utf8Value(args[1]->ToString()));
		Local<v8::Array> ar = Local<v8::Array>::Cast(args[2]);
		MatrixXf* mat = v8toEigen(ar);
		result = Scheduler::Instance()->setModelAttributeMatrix(job_id, attribute_name, mat);
	}
	args.GetReturnValue().Set(Boolean::New(isolate, result));	
}


// Creates a new job, but does not run it. Synchronous.
// Arguments: JSON to be converted to JobOptions_t
void newJob(const v8::FunctionCallbackInfo<v8::Value>& args) {
	Isolate* isolate = args.GetIsolate();
	Handle<Object> options_v8 = Handle<Object>::Cast(args[0]);
	const JobOptions_t& options = JobOptions_t(isolate, options_v8);
	try {
		const job_id_t id = Scheduler::Instance()->newJob(options);
		if (id == 0) {
			isolate->ThrowException(Exception::Error(
				String::NewFromUtf8(isolate, "Could not add another job")));
			return;
		}

		Local<Integer> retval = Integer::New(isolate, id);
		args.GetReturnValue().Set(retval);
	} catch (const exception& e) {
		isolate->ThrowException(Exception::Error(
			String::NewFromUtf8(isolate, e.what())));
		return;
	}
}


// Maybe begins the training of an algorithm, given the job number.
// Asynchronous.
// Arguments: job_id_t job_id, function callback
void startJob(const v8::FunctionCallbackInfo<v8::Value>& args) {
	Isolate* isolate = args.GetIsolate();
	// Inspect arguments.
	try {
		if (!ArgsHaveJobID(args, 0)) {
			args.GetReturnValue().Set(Boolean::New(isolate, false));
			return;
		}

		const job_id_t job_id = (unsigned int)Local<Number>::Cast(args[0])->Value();
		shared_ptr<Job_t> job = Scheduler::Instance()->getJob(job_id);
		job->exception = nullptr;
		job->callback.Reset(isolate, Local<Function>::Cast(args[1]));
		job->job_id = job_id;
		bool result = Scheduler::Instance()->startJob(job_id, trainAlgorithmComplete);
		usleep(1);	// let the execution thread start -- necessary?
		if (job->exception) {
			rethrow_exception(job->exception);
		}
		args.GetReturnValue().Set(Boolean::New(isolate, result));
	} catch (const exception& e) {
		isolate->ThrowException(Exception::Error(
			String::NewFromUtf8(isolate, e.what())));
		args.GetReturnValue().Set(Boolean::New(isolate, false));
	}
}

// Checks the status of an algorithm, given the algorithm's job number.
// Currently synchronous.
// Arguments: job_id_t job_id
void checkJob(const v8::FunctionCallbackInfo<v8::Value>& args) {
	Isolate* isolate = args.GetIsolate();

	// Check argument types.
	if (!ArgsHaveJobID(args, 0)) {
		args.GetReturnValue().Set(Boolean::New(isolate, false));
		return;
	}

	const job_id_t job_id = (unsigned int)Local<Number>::Cast(args[0])->Value();
	const float progress = Scheduler::Instance()->checkJobProgress(job_id);
	Local<Number> retval = Number::New(isolate, progress);
	args.GetReturnValue().Set(retval);
}

// Gets the results of a job, given the job's id.
// Synchronous.
// Arguments: job_id_t job_id
// Returns: MatrixXf of results, empty on error.
void getJobResult(const v8::FunctionCallbackInfo<v8::Value>& args) {
	Isolate* isolate = args.GetIsolate();
	try {
		// Check argument types.
		if (!ArgsHaveJobID(args, 0)) {
			args.GetReturnValue().Set(Boolean::New(isolate, false));
			return;
		}

		const job_id_t job_id = (unsigned int)Local<Number>::Cast(args[0])->Value();
		const MatrixXf& result = Scheduler::Instance()->getJobResult(job_id);
		Local<v8::Array> obj = v8::Array::New(isolate);
		obj->Set(0, v8::String::NewFromUtf8(isolate, JsonCoder::getInstance().encodeMatrix(result).c_str()));
		args.GetReturnValue().Set(obj);
	}
	catch (const exception& e) {
		isolate->ThrowException(Exception::Error(
			String::NewFromUtf8(isolate, e.what())));
	}
}


// Cancels a potentially running Algorithm.
// Synchronous.
// Arguments: job_id_t job_id
// Returns: boolean representing success.
void cancelJob(const v8::FunctionCallbackInfo<v8::Value>& args) {
	Isolate* isolate = args.GetIsolate();

	// Check argument types.
	if (!ArgsHaveJobID(args, 0)) {
		args.GetReturnValue().Set(Boolean::New(isolate, false));
		return;
	}
	try {
		const job_id_t job_id = (unsigned int)Local<Integer>::Cast(args[0])->Value();
		const bool success = Scheduler::Instance()->cancelJob(job_id);
		Handle<Boolean> retval = Boolean::New(isolate, success);
		args.GetReturnValue().Set(retval);
	} catch(const exception& e) {
		isolate->ThrowException(Exception::Error(
			String::NewFromUtf8(isolate, e.what())));
	}
}


// Arguments: job_id
void deleteJob(const v8::FunctionCallbackInfo<v8::Value>& args) {
	Isolate* isolate = args.GetIsolate();

	if (!ArgsHaveJobID(args, 0)) {
		args.GetReturnValue().Set(Boolean::New(isolate, false));
		return;
	}

	const job_id_t job_id = (unsigned int)Local<Integer>::Cast(args[0])->Value();
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
	// Runs in event loop when algorithm completes.
	Isolate* isolate = Isolate::GetCurrent();
	HandleScope handleScope(isolate);
	Job_t* job = static_cast<Job_t*>(req->data);
	Local<v8::Array> obj = v8::Array::New(isolate);

	try {
		// Pack up the data to be returned to JS
		const MatrixXf& result = Scheduler::Instance()->getJobResult(job->job_id);
		// TODO: Fewer convserions to return a matrix
		obj->Set(0, v8::String::NewFromUtf8(isolate, JsonCoder::getInstance().encodeMatrix(result).c_str()));
		
		if (status < 0) { // libuv error
			throw runtime_error("Libuv error (check server)");
		}
		if (job->exception) {
			rethrow_exception(job->exception); 
		}
	} catch(const exception& e) {
		// If the job failed, the second entry in the array is the exception text.
		// Is this really a good way to return data? It is different than the result from getJobResult()
		obj->Set(1, v8::String::NewFromUtf8(isolate, e.what()));	
	}
	
	Handle<Value> argv[] = { obj };
	// execute the callback
	Local<Function>::New(isolate, job->callback)->Call(
		isolate->GetCurrentContext()->Global(), 1, argv);
	job->callback.Reset();
}


MatrixXf* v8toEigen(Local<v8::Array>& ar) {
	const unsigned int rows = ar->Length();
	Local<v8::Array> props = Local<v8::Object>::Cast(ar->Get(0))->GetPropertyNames();
	const unsigned int cols = props->Length();
	Eigen::MatrixXf* mat = new Eigen::MatrixXf(rows, cols);

	for (unsigned int i=0; i<rows; i++) {
		for (unsigned int j=0; j<cols; j++) {
			(*mat)(i,j) = (float)Local<v8::Object>::Cast(ar->Get(i))->Get(props->Get(j))->NumberValue();
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
