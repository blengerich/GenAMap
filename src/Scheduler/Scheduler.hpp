//
//  Scheduler.h
//  
//
//  Created by Ben Lengerich on 1/25/16.
//
//

#ifndef Scheduler_hpp
#define Scheduler_hpp

#include <Eigen/Dense>
#include <memory>
#include <unordered_map>
#include <uv.h>
#include <vector>

#ifdef BAZEL
#include "Algorithms/Algorithm.hpp"
#include "Algorithms/AlgorithmOptions.hpp"
#include "Models/ModelOptions.hpp"
#include "Scheduler/Job.hpp"
#include "gtest/gtest_prod.h"
#else
#include "../Algorithms/Algorithm.hpp"
#include "../Algorithms/AlgorithmOptions.hpp"
#include "Job.hpp"
#include "../Models/ModelOptions.hpp"
#endif


using namespace std;

class Scheduler {
/* Class to run jobs and get information about the currently running jobs.
*/

public:	
	int newJob(const JobOptions_t&);
	// Assumes that algorithm and job have been created by this scheduler.
	// Simply packages as a job and assigns an ID.
	// Returns the job's assigned ID, -1 for failure.
	
	bool setX(const int, const Eigen::MatrixXd&);
	// returns true on success, false otherwise.

	bool setY(const int, const Eigen::MatrixXd&);
	// returns true on success, false otherwise.

	/*bool checkJobReadyToRun(const int);*/
	// Returns true if the job has all parameters set and is ready to run.
	
	bool startJob(const int, void (*f)(uv_work_t*, int));
	// Returns true if successfully queued, false otherwise.

	double checkJobProgress(const int);
	// Returns the progress of the job.

	bool cancelJob(const int);
	// Cancels a potentially running job.

	Model* getModel(const int);
	Algorithm* getAlgorithm(const int);
	Job_t* getJob(const int);

	MatrixXd getJobResult(const int);

	// TODO: How to know if the user owns the algorithm? [Issue: https://github.com/blengerich/GenAMap_V2/issues/28]
	bool deleteJob(const int);

	static Scheduler* Instance();
	// This class follows the singleton pattern.

protected:
	// Singleton constructors must be protected or private
	Scheduler();
	Scheduler(Scheduler const&){};
	Scheduler& operator=(Scheduler const&);

private:
	int newAlgorithm(const AlgorithmOptions_t&);
	// returns the algorithm's assigned ID, -1 for failure.

	int newModel(const ModelOptions_t&);
	// returns the model's assigned ID, -1 for failure.

	// Generates and returns new identifier. Failure is identified with -1.
	int getNewAlgorithmId();
	int getNewModelId();
	int getNewJobId();
    
	// Checks whether an Id is currently being used. Returns true for currently in use, false otherwise.
	bool ValidAlgorithmId(const int);
	bool ValidModelId(const int);
	bool ValidJobId(const int);

	bool deleteAlgorithm(const int);
	bool deleteModel(const int);


    #ifdef BAZEL
    FRIEND_TEST(SchedulerTest, newAlgorithm);
    FRIEND_TEST(SchedulerTest, newModel);
    FRIEND_TEST(SchedulerTest, getNewAlgorithmId);
    FRIEND_TEST(SchedulerTest, getNewModelId);
    FRIEND_TEST(SchedulerTest, getNewJobId);
    FRIEND_TEST(SchedulerTest, ValidAlgorithmId);
    FRIEND_TEST(SchedulerTest, ValidModelId);
    FRIEND_TEST(SchedulerTest, ValidJobId);
    #endif

    static Scheduler* s_instance;   // Singleton
    const int kMaxThreads = 5;

    const int kMaxAlgorithmId = 100;
    int next_algorithm_id;

    const int kMaxModelId = 100;
    int next_model_id;

    const int kMaxJobId = 100;
    int next_job_id;

    unordered_map<int, unique_ptr<Algorithm>> algorithms_map;
    unordered_map<int, unique_ptr<Model>> models_map;
    unordered_map<int, unique_ptr<Job_t>> jobs_map;
    // tracks all jobs (running, waiting, and completed). indexed by job_id.  
};

void trainAlgorithmThread(uv_work_t* req);

#endif /* Scheduler_hpp */
