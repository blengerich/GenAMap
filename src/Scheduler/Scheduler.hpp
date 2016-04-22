//
//  Scheduler.h
//  
//
//  Created by Ben Lengerich on 1/25/16.
//
//

#ifndef Scheduler_hpp
#define Scheduler_hpp

#include <mutex>
#include <pthread.h>
#include <queue>
#include <unordered_map>
#include <v8.h>
#include <vector>

#ifdef BAZEL
#include "algorithm/Algorithm.hpp"
#include "algorithm/AlgorithmOptions.hpp"
#include "model/ModelOptions.hpp"
#include "Scheduler/Job.hpp"
#include "gtest/gtest_prod.h"
#else
#include "../algorithm/Algorithm.hpp"
#include "../algorithm/AlgorithmOptions.hpp"
#include "Job.hpp"
#include "../model/ModelOptions.hpp"
#endif


using namespace std;

class Scheduler {
/* Class to run jobs and get information about the currently running jobs.
*/

public:
	int newAlgorithm(const AlgorithmOptions_t&);
	// returns the algorithm's assigned ID, -1 for failure.

	int newModel(const ModelOptions_t&);
	// returns the model's assigned ID, -1 for failure.

	int newJob(const JobOptions_t&);
	// Assumes that algorithm and job have been created by this scheduler.
	// Simply packages as a job and assigns an ID.
	// Returns the job's assigned ID, -1 for failure.

	bool startJob(Isolate*, const Local<Function>&, const Local<Number>&);
	// Returns true if successfully queued, false otherwise.

	double checkJob(const int);
	// Returns the progress of the job.

	bool cancelJob(const int);
	// Cancels a potentially running job.

	// TODO: How to know if the user owns the algorithm?
	bool deleteAlgorithm(const int);
	bool deleteModel(const int);
	bool deleteJob(const int);

	bool getJob(const int);

	static Scheduler* Instance();
	// This class follows the singleton pattern.

protected:
	// Singleton constructors must be protected or private
	Scheduler();
	Scheduler(Scheduler const&){};
	Scheduler& operator=(Scheduler const&);

private:

	int getNewAlgorithmId();
    // Generates and returns new job identifier. Failure is identified with -1.

	int getNewModelId();
    // Generates and returns new job identifier. Failure is identified with -1.

	int getNewJobId();
    // Generates and returns new job identifier. Failure is identified with -1.

    #ifdef BAZEL
    FRIEND_TEST(SchedulerTest, getNewAlgorithmId);
    FRIEND_TEST(SchedulerTest, getNewModelId);
    FRIEND_TEST(SchedulerTest, getNewJobId);
    #endif

    static Scheduler* s_instance;   // Singleton
    const int kMaxThreads = 5;

    const int kMaxAlgorithmId = 100;
    int next_algorithm_id;

    const int kMaxModelId = 100;
    int next_model_id;

    const int kMaxJobId = 100;
    int next_job_id;

    unordered_map<int, Algorithm*> algorithms_map;
    unordered_map<int, Model*> models_map;
    unordered_map<int, Job_t*> jobs_map;
    // tracks all jobs (running, waiting, and completed). indexed by job_id.  
};

void trainAlgorithmThread(uv_work_t* req);
void trainAlgorithmComplete(uv_work_t* req, int status);


#endif /* Scheduler_hpp */
