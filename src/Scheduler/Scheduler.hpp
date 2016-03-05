//
//  Scheduler.h
//  
//
//  Created by Ben Lengerich on 1/25/16.
//
//

#ifndef Scheduler_h
#define Scheduler_h

#include <map>
#include <mutex>
#include <node.h>
#include <pthread.h>
#include <queue>
#include <vector>
#include "gtest/gtest_prod.h"

#include "algorithm/Algorithm.hpp"

using namespace std;
using namespace v8::Exception;
using namespace v8::FunctionCallbackInfo;
using namespace v8::Isolate;
using namespace v8::Local;
using namespace v8::Number;
using namespace v8::Object;
using namespace v8::String;
using namespace v8::Value;

class Scheduler {
/* Class to run jobs and get information about the currently running jobs.
	The first class on the C++ side.
*/

/* TODO
    Cancel jobs
    Return results as JSON
    Receive inputs as JSON
*/

public:
	static Scheduler* Instance();	// Singleton

    enum algorithm_type {
    	proximal_gradient_descent,
    	iterative_update
    };

	void newAlgorithm(const FunctionCallbackInfo<Value>& args);
		//const algorithm_type& algorithm_name, const map<string, string>& options=map<string, string>());
	// Creates a new algorithm in the queue.
	// Returns the new job num or -1 on failure.

    void trainAlgorithm(const FunctionCallbackInfo<Value>& args);
    // trains the algorithm associated with the given jobNum
    // returns True for success, false for failure.

    //void cancelAlgorithm(int job_num);
    // cancels the algorithm associated with the given jobNum
    // Returns True for success, false on failure.

    void checkAlgorithm(const FunctionCallbackInfo<Value>& args);
    // Returns a status code for the given jobNum
    // Returns -1 on error.

    // TODO How is the result calculated?
    // Should have a callback that pushes data to Node server in JSON format.

protected:
	// Singleton constructors must be protected or private
	Scheduler();
	Scheduler(Scheduler const&){};
	Scheduler& operator=(Scheduler const&);

private:
    static Scheduler* s_instance;   // Singleton
    const int kMaxThreads = 5;
    int max_job_num;
    int current_job_num;

    // Need to track all jobs and currently running jobs.
    int n_running_threads;
    pthread_mutex_t n_running_threads_mutex;

    map<int, Algorithm*>* algorithms_map;
    // tracks all algorithms (running, waiting, and completed). indexed by jobNum.
    
    queue<Algorithm*>* algorithms_queue;
    pthread_mutex_t algorithms_queue_mutex;
    // Running jobs and jobs waiting for a thread

	int getNewJobNum();
    FRIEND_TEST(SchedulerTest, getNewJobNum);


    static void* train_thread(void* arg);
    // Spawns a new thread to be in charge of training.
};


#endif /* Scheduler_h */
