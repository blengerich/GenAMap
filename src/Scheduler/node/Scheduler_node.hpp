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
#include "../Scheduler.hpp"

using namespace std;
using namespace v8;



//////////////////////////////////////////////////////
// Visible from Node
/////////////////////////////////////////////////////

void newAlgorithm(const v8::FunctionCallbackInfo<v8::Value>& args);
// Creates a new algorithm, does not add to queue.
// Returns the new job num or -1 on failure.
// Arguments: JSON to be converted to AlgorithmOptions_t


void newModel(const v8::FunctionCallbackInfo<v8::Value>& args);
// Arguments: JSON to be converted to ModelOptions_t


void setX(const v8::FunctionCallbackInfo<v8::Value>& args);
// Arguments: model_num, JSON Matrix

void setY(const v8::FunctionCallbackInfo<v8::Value>& args);
// Arguments: model_num, JSON Matrix

void newJob(const v8::FunctionCallbackInfo<v8::Value>& args);
// Arguments: JSON to be converted to JobOptions_t


void startJob(const v8::FunctionCallbackInfo<v8::Value>& args);
// trains the algorithm associated
// Arguments: function callback, int job_id
// returns True for success, false for failure.

void checkJob(const v8::FunctionCallbackInfo<v8::Value>&args);
// Returns a status code for the given jobNum
// Arguments: int job_id
// Returns -1 on error.

void cancelJob(const int job_num);
// cancels the algorithm associated with the given jobNum
// Arguments: int job_id
// Returns True for success, false on failure.


void deleteAlgorithm(const v8::FunctionCallbackInfo<v8::Value>& args);
// Arguments: int alg_id
// Returns: boolean for success

void deleteModel(const v8::FunctionCallbackInfo<v8::Value>& args);
// Arguments: int model_id
// Returns: boolean for success

void deleteJob(const v8::FunctionCallbackInfo<v8::Value>& args);
// Arguments: int job_id
// Returns: boolean for success

/////////////////////////////////////////////////////
// Invisible from Node
/////////////////////////////////////////////////////

void trainAlgorithmThread(uv_work_t* req);
void trainAlgorithmComplete(uv_work_t* req, int status);


