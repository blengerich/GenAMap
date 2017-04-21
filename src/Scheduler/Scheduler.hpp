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
	job_id_t newJob(const JobOptions_t&);
	// Assumes that algorithm and job have been created by this scheduler.
	// Simply packages as a job and assigns an ID.
	// Returns the job's assigned ID, 0 for failure.
	
	bool setX(const job_id_t, const Eigen::MatrixXf&);
	// Sets the X matrix for the job at the given job_id.
	// returns true on success, false otherwise.

	bool setY(const job_id_t, const Eigen::MatrixXf&);
	// Sets the Y matrix for the job at the given job_id.
	// returns true on success, false otherwise.

	bool setModelAttributeMatrix(const job_id_t, const string&, Eigen::MatrixXf*);
	// Sets a matrix with the given name for the job at the given job_id.
	// returns true on success, false otherwise.

	bool startJob(const job_id_t, void (*f)(uv_work_t*, int));
	// Queues the job at the given job_id, with the callback to be called when the job is completed.
	// Returns true if successfully queued, false otherwise.

	float checkJobProgress(const job_id_t);
	// Returns the progress of the job or -1 on failure.

	bool cancelJob(const job_id_t);
	// Cancels a potentially running job.
	// Returns True is the job was successfully sent a shutdown signal, false otherwise.

	shared_ptr<Model> getModel(const model_id_t);
	shared_ptr<Algorithm> getAlgorithm(const algorithm_id_t);
	shared_ptr<Job_t> getJob(const job_id_t);

	MatrixXf getJobResult(const job_id_t);

	// TODO: How to know if the user owns the algorithm?
	bool deleteJob(const job_id_t);

	static Scheduler& Instance();
	// This class follows the singleton pattern.

protected:
	// Singleton constructors must be protected or private
	Scheduler();
	Scheduler(Scheduler const&){};
	Scheduler& operator=(Scheduler const&);

private:
	algorithm_id_t newAlgorithm(const AlgorithmOptions_t&);
	// returns the algorithm's assigned ID, 0 for failure.

	model_id_t newModel(const ModelOptions_t&);
	// returns the model's assigned ID, 0 for failure.

	algorithm_id_t getNewAlgorithmId();
	model_id_t getNewModelId();
	job_id_t getNewJobId();
	// Generates and returns new identifier. Failure is identified with 0.
    
	// Checks whether an ID fits in the range used to index algorithms, models, or job.
	bool ValidAlgorithmId(const algorithm_id_t);
	bool ValidModelId(const model_id_t);
	bool ValidJobId(const job_id_t);

	// Checks whether an Id is currently being used. Returns true for currently in use, false otherwise.
	bool AlgorithmIdUsed(const algorithm_id_t);
	bool ModelIdUsed(const model_id_t);
	bool JobIdUsed(const job_id_t);


	bool deleteAlgorithm(const algorithm_id_t);
	bool deleteModel(const model_id_t);


    #ifdef BAZEL
    FRIEND_TEST(SchedulerTest, newAlgorithm);
    FRIEND_TEST(SchedulerTest, newModel);
    FRIEND_TEST(SchedulerTest, getNewAlgorithmId);
    FRIEND_TEST(SchedulerTest, getNewModelId);
    FRIEND_TEST(SchedulerTest, getNewJobId);
    FRIEND_TEST(SchedulerTest, ValidAlgorithmId);
    FRIEND_TEST(SchedulerTest, ValidModelId);
    FRIEND_TEST(SchedulerTest, ValidJobId);
    FRIEND_TEST(SchedulerTest, AlgorithmIdUsed);
    FRIEND_TEST(SchedulerTest, ModelIdUsed);
    FRIEND_TEST(SchedulerTest, JobIdUsed);
    #endif

    const unsigned int kMaxThreads = 5;

    const algorithm_id_t kMaxAlgorithmId = 100;
    algorithm_id_t next_algorithm_id;

    const model_id_t kMaxModelId = 100;
    model_id_t next_model_id;

    const job_id_t kMaxJobId = 100;
    job_id_t next_job_id;

    unordered_map<algorithm_id_t, shared_ptr<Algorithm>> algorithms_map;
    unordered_map<model_id_t, shared_ptr<Model>> models_map;
    unordered_map<job_id_t, shared_ptr<Job_t>> jobs_map;
    // Maps to track all jobs (running, waiting, and completed). indexed by job_id.  
};

void trainAlgorithmThread(uv_work_t* req);

#endif /* Scheduler_hpp */
