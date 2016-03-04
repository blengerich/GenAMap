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
#include <pthread.h>
#include <queue>
#include <vector>
#include "gtest/gtest_prod.h"

#include "algorithm/Algorithm.hpp"

using namespace std;

class Scheduler {
/* Class to run jobs and get information about the currently running jobs.
	The first class on the C++ side.
*/

public:
	static Scheduler* Instance();	// Singleton

    enum algorithm_type {
    	proximal_gradient_descent,
    	iterative_update
    };

	int newAlgorithm(const algorithm_type& algorithm_name, const map<string, string>& options=map<string, string>());
	// Creates a new algorithm in the queue.
	// Returns the new job num or -1 on failure.

    bool train(int job_num);
    // trains the algorithm associated with the given jobNum
    // returns True for success, false for failure.

    bool cancel(int job_num);
    // cancels the algorithm associated with the given jobNum
    // Returns True for success, false on failure.

    double checkStatus(int job_num);
    // Returns a status code for the given jobNum
    // Returns -1 on error.

    // TODO How is the result calculated?
    // When to return the result? Is it getting polled by Node?
    // Should have a callback that pushes data to Node server in JSON format.
    //Result* getResults(int job_num);

    //std::string predict(int)
    // Not sure what this is for
    // Don't actually need socket stuff?


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


    //bool[] available_job_nums;
    
    map<int, Algorithm*>* algorithms_map;
    // indexed by jobNum
    
    queue<Algorithm*>* algorithms_queue;
    pthread_mutex_t algorithms_queue_mutex;
    // Running jobs and jobs waiting for a thread

	int getNewJobNum();
    FRIEND_TEST(SchedulerTest, getNewJobNum);


    static void* train_thread(void* arg);
    // Spawns a new thread to be in charge of training.

    //map<int, pthread_t*> threads;
    // Threads that are currently running training jobs.
    // Maps from pid to pthread_t.

};


#endif /* Scheduler_h */
