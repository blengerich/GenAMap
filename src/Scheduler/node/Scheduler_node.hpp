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
#include "../../Algorithms/HypoTestPlaceHolder.h"
#include "../Scheduler.hpp"

using namespace std;
using namespace v8;


//////////////////////////////////////////////////////
// Visible from Node
/////////////////////////////////////////////////////

void setX(const v8::FunctionCallbackInfo<v8::Value>& args);
// Arguments: job_num, JSON Matrix

void setY(const v8::FunctionCallbackInfo<v8::Value>& args);
// Arguments: job_num, JSON Matrix

void setModelAttributeMatrix(const v8::FunctionCallbackInfo<v8::Value>& args);
// Arguments: job_num, attribute name, JSON Matrix

void newJob(const v8::FunctionCallbackInfo<v8::Value>& args);
// Arguments: JSON to be converted to JobOptions_t

void startJob(const v8::FunctionCallbackInfo<v8::Value>& args);
// trains the algorithm associated
// Arguments: function callback, job_id_t job_id
// returns True for success, false for failure.

void checkJob(const v8::FunctionCallbackInfo<v8::Value>&args);
// Returns a status code for the given jobNum
// Arguments: job_id_t job_id
// Returns -1 on error.

void getJobResult(const v8::FunctionCallbackInfo<v8::Value>&args);
// Returns a Matrix of results for the given jobNum
// Arguments: job_id_t job_id
// Returns empty matrix on error.

void cancelJob(const v8::FunctionCallbackInfo<v8::Value>& args);
// cancels the algorithm associated with the given jobNum
// Arguments: job_id_t job_id
// Returns True for success, false on failure.

void deleteJob(const v8::FunctionCallbackInfo<v8::Value>& args);
// Arguments: job_id_t job_id
// Returns: boolean for success

/* Deprecated
void newAlgorithm(const v8::FunctionCallbackInfo<v8::Value>& args);
// Creates a new algorithm, does not add to queue.
// Returns the new job num or -1 on failure.
// Arguments: JSON to be converted to AlgorithmOptions_t

void newModel(const v8::FunctionCallbackInfo<v8::Value>& args);
// Arguments: JSON to be converted to ModelOptions_t

void deleteAlgorithm(const v8::FunctionCallbackInfo<v8::Value>& args);
// Arguments: int alg_id
// Returns: boolean for success

void deleteModel(const v8::FunctionCallbackInfo<v8::Value>& args);
// Arguments: int model_id
// Returns: boolean for success
*/

/////////////////////////////////////////////////////
// Invisible from Node
/////////////////////////////////////////////////////

void trainAlgorithmComplete(uv_work_t* req, int status);

MatrixXd* v8toEigen(Local<v8::Array>& ar);

bool ArgsHaveJobID(const FunctionCallbackInfo<Value>& args, const int position);

/////////////////////
// Register with Node
/////////////////////

void Init(Handle<Object> exports, Handle<Object> module) {
	NODE_SET_METHOD(exports, "setX", setX);
	NODE_SET_METHOD(exports, "setY", setY);
	NODE_SET_METHOD(exports, "setModelAttributeMatrix", setModelAttributeMatrix);
	NODE_SET_METHOD(exports, "newJob", newJob);
	NODE_SET_METHOD(exports, "startJob", startJob);
	NODE_SET_METHOD(exports, "checkJob", checkJob);
	NODE_SET_METHOD(exports, "cancelJob", cancelJob);
	NODE_SET_METHOD(exports, "getJobResult", getJobResult);
	NODE_SET_METHOD(exports, "deleteJob", deleteJob);
}

NODE_MODULE(scheduler, Init)
