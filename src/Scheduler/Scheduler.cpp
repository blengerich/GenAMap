//
//  Scheduler.cpp
//  
//
//  Created by Ben Lengerich on 1/27/16.
//
//

#include <exception>
#include <iostream>
#include <map>
#include <node.h>
#include <pthread.h>
#include <queue>
#include <stdio.h>
#include <uv.h>
#include <v8.h>

#include "algorithm/ProximalGradientDescent.hpp"
#include "algorithm/IterativeUpdate.hpp"
#include "algorithm/Algorithm.hpp"
#include "Scheduler/Scheduler.hpp"



using namespace std;
using v8::Exception;
using v8::FunctionCallbackInfo;
using v8::HandleScope;
using v8::Isolate;
using v8::Local;
using v8::Number;
using v8::Object;
using v8::String;
using v8::Value;

// Global static pointer used to ensure a single instance of this class.
Scheduler* Scheduler::s_instance = NULL;

struct Work {
	uv_work_t request;
	Persistent<Fucntion> callback;
	int results;
};


//////////////////////////////////////////
// Constructors
//////////////////////////////////////////

Scheduler::Scheduler()
: max_job_num(100)
, current_job_num(0)
, n_running_threads(0)
, algorithms_map(new std::map<int, Algorithm*>)
, algorithms_queue(new std::queue<Algorithm*>) {
	pthread_mutex_init(&n_running_threads_mutex, NULL);
	pthread_mutex_init(&algorithms_queue_mutex, NULL);
}

Scheduler& Scheduler::operator=(Scheduler const& s) {
	return *Scheduler::Instance();
}

Scheduler* Scheduler::Instance() {	
	if (!s_instance) {	// Singleton
		s_instance = new Scheduler;
	}
	return s_instance;
}

///////////////////////////////////////////
// Public Functions
///////////////////////////////////////////

void Scheduler::newAlgorithm(const FunctionCallbackInfo<Value>& args) {
	Isolate* isolate = args.GetIsolate();

	if (args.Length() < 1) {
		isolate->ThrowException(Exception::TypeError(
			String::NewFromUtf8(isolate, "Wrong number of arguments")));
		return;
	}

	if(!args[1]->IsString()) {
		isolate->ThrowException(Exception::TypeError(
			String::NewFromUtf8(isolate, "Wrong arguments")));
		return;
	}

	Algorithm* new_algorithm;
	switch(args[1]) {
		case proximal_gradient_descent:
			new_algorithm = new ProximalGradientDescent(args[2]);	// TODO: unpack this dict here
			break;
		case iterative_update:
			new_algorithm = new IterativeUpdate(args[2]);
			break;
		default:
			isolate->ThrowException(Exception::TypeError(
				String::NewFromUtf8(isolate, "Algorithm type not supported")));
			return;
	}

	const int new_job_num = getNewJobNum();
	if (new_job_num < 0) {
		isolate->ThrowException(Exception::Error(
			String::NewFromUtf8(isolate, "Could not add another job to queue. Queue full.")));
		return;
	}

	(*algorithms_map)[new_job_num] = new_algorithm;

	Local<Number> num = Number::New(isolate, new_job_num);
	args.GetReturnValue().Set(num);
}

void Scheduler::checkAlgorithm(const FunctionCallbackInfo<Value>& args) {
	Isolate* isolate = args.GetIsolate();

	if (args.Length() < 1) {
		isolate->ThrowException(Exception::TypeError(
			String::NewFromUtf8(isolate, "Must supply a job num to check.")));
		return;
	}

	if (!args[0]->IsNumber()) {
		isolate->ThrowException(Exception::TypeError(
			String::NewFromUtf8(isolate, "Job num must be a number.")));
		return;
	}

	float progress = (*algorithms_map)[args[1]]->getProgress();
	Local<Number> num = Number::New(isolate, progress);
	args.GetReturnValue().Set(num);
}


void Scheduler::trainAlgorithmAsync(const FunctionCallbackInfo<Value>& args) {
	Isolate* isolate = args.GetIsolate();
	Work* work = new Work();
	work->request.data = work;

	if (args.Length() < 2) {
		isolate->ThrowException(Exception::TypeError(
			String::NewFromUtf8(isolate, "Must give a callback and a job num to train.")));
		return;
	}

	Local<Function> callback = Local<Function>::Cast(args[0]);
	Local<Number> job_num = Local<Number>::Cast(args[1]);

	work->callback.Reset(isolate, callback);
	work->job_num = job_num;
	work->algorithm = (*algorithms_map)[job_num];
	work->model = new Model();

	uv_queue_work(uv_default_loop(), &work->request, trainAlgorithmThread, trainAlgorithmComplete);

	args.GetReturnValue().Set(Undefined(isolate));
}

static void trainAlgorithmThread(uv_work_t* req) {
	// Running in worker thread.
	Work* work = static_cast<Work*>(req->data);
	
	// Run algorithm here.
	//work->results = work->algorithm->run(work->model);	// Results should just be a pointer to the location of the data, would rather not transport huge matrices back to Node.
	work->results = 1;
}

static void trainAlgorithmComplete(uv_work_t* req, int status) {
	// Runs in event loop when algorithm completes.
	Isolate* isolate = Isolate::GetCurrent();

	HandleScope handleScope(isolate);

	Work* work = static_cast<Work*>(req->data);
	// Pack up the data here to be returned to JS - unclear what the format is
	Local<Array> result_list = Array::New(isolate);
	Handle<Value> argv[] = { result_list };

	// execute the callback
	Local<Function>::New(isolate, work->callback)->Call(isolate->GetCurrentContext()->Global(), 1, argv);

	work->callback.Reset();
	delete work;
}

/*
bool Scheduler::cancelALgorithm(int job_num) {
	return false;
}*/



/////////////////////////////////////
// Private Functions
////////////////////////////////////
int Scheduler::getNewJobNum() {
	for (int i = 1; i < max_job_num; i++) {
		int candidate_job_num = (current_job_num + i) % max_job_num;
		if (algorithms_map->count(candidate_job_num) == 0) {
			current_job_num = candidate_job_num;
			return candidate_job_num;
		}
	}
	return -1;
}

// Register with Node
void Init(Local<Object> exports) {
	NODE_SET_METHOD(exports, "newAlgorithm", newAlgorithm);
	NODE_SET_METHOD(exports, "checkAlgorithm", checkAlgorithm);
	NODE_SET_METHOD(exports, "trainAlgorithm", trainAlgorithm);
}

NODE_MODULE(addon, Init)


/*
bool Scheduler::trainAlgorithm(int job_num) {
	// Open a new thread and then start the job.
	// When deployed on AWS auto-scale, we will increase the size of the instance
	// here and decrease on completion of job.
	struct thread_info* tinfo;
	pthread_attr_t attr;
	
	try {
		algorithms_queue->push((*algorithms_map)[job_num]);
		if (n_running_threads < kMaxThreads) {
			pthread_t thread;
			
			pthread_attr_init(&attr);
			pthread_create(&thread, &attr, &Scheduler::train_thread, tinfo);
		}
	} catch (exception& e) {
		return false;
	}
	return true;
}*/

/*
void Scheduler::newAlgorithm(const algorithm_type& algorithm_name, const map<string, string>& options) {
	// Algorithm must be added before it can be run.
	Algorithm* new_algorithm;
	switch(algorithm_name) {
		case proximal_gradient_descent:
			new_algorithm = new ProximalGradientDescent(options);
			break;
		case iterative_update :
			new_algorithm = new IterativeUpdate(options);
			break;
		default :
			cout << "Attempted to create an Algorithm type that does not exist" << endl;
			return -1;
	}

	const int new_job_num = getNewJobNum();
	if (new_job_num < 0) {	// job num = -1 indicates no available job numbers
		return -1;
	}

	(*algorithms_map)[new_job_num] = new_algorithm;
	//algorithms_queue->push(new_algorithm);

	return new_job_num;
}*/


/*
void* Scheduler::train_thread(void* arg) {
	pthread_mutex_lock(&(s_intance->n_running_threads_mutex));
	n_running_threads++;
	pthread_mutex_unlock(&(s_instance->n_running_threads_mutex));
	// Expects to run in a child thread.
	
	// Run the algorithm if there is one waiting.
	pthread_mutex_lock(&(s_instance->algorithms_queue_mutex));
	while (!(&s_instance->algorithms_queue->empty())) {
		// Pop from queue.
		Algorithm* algorithm = algorithms_queue->front();
		algorithms_queue->pop();
		pthread_mutex_unlock(&algorithms_queue_mutex);

		// Run the algorithm here. What is the interface for running?
		algorithm->run(new Model);// what is my model?
		// Handle the results here
	}
	// If no algorithms are waiting to run, kill this thread.
	pthread_mutex_lock(&n_running_threads_mutex);
	n_running_threads--;
	pthread_mutex_unlock(&n_running_threads_mutex);
	pthread_exit(0);
}*/
