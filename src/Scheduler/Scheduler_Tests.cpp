//
//  Scheduler_Tests.cpp
//  
//
//  Created by Ben Lengerich on 1/27/16.
//
//

#include "gtest/gtest.h"
#include <Eigen/Dense>
#include <memory>
#include <stdio.h>
#include <unordered_map>

#include "Scheduler/Scheduler.hpp"
#include "Scheduler/Job.hpp"
#include "Algorithms/AlgorithmOptions.hpp"
#include "Models/ModelOptions.hpp"

using namespace std;
using namespace Eigen;

class SchedulerTest : public testing::Test {
protected:
	virtual void SetUp() {
		my_scheduler = Scheduler::Instance();
		alg_opts = AlgorithmOptions_t(
			proximal_gradient_descent,
			{{"tolerance", "0.01"}, {"learning_rate", "0.01"}});

		model_opts = ModelOptions_t(
			linear_regression,
			{{"lambda", "0.01"}, {"L2_lambda", "0.01"}});

        X = MatrixXf(10, 5);
        X << 0.8147,    0.1576,    0.6557,    0.7060,    0.4387,
        0.9058,    0.9706,    0.0357,    0.0318,    0.3816,
        0.1270,    0.9572,    0.8491,    0.2769,    0.7655,
        0.9134,    0.4854,    0.9340,    0.0462,    0.7952,
        0.6324,    0.8003,    0.6787,    0.0971,    0.1869,
        0.0975,    0.1419,    0.7577,    0.8235,    0.4898,
        0.2785,    0.4218,    0.7431,    0.6948,    0.4456,
        0.5469,    0.9157,    0.3922,    0.3171,    0.6463,
        0.9575,    0.7922,    0.6555,    0.9502,    0.7094,
        0.9649,    0.9595,    0.1712,    0.0344,    0.7547;
    	y = MatrixXf(10, 1);
        y << 0.4173,
        0.0497,
        0.9027,
        0.9448,
        0.4909,
        0.4893,
        0.3377,
        0.9001,
        0.3692,
        0.1112;

		LargeX = MatrixXf(n_patients, n_markers);
        for (unsigned int i = 0; i < n_patients; i++) {
            for (unsigned int j = 0; j < n_markers; j++) {
                LargeX(i,j) = rand();
            }
        }
    	LargeY = MatrixXf(n_patients, n_traits);
        for (unsigned int i = 0; i < n_patients; i++) {
            for (unsigned int j = 0; j < n_traits; j++) {
                LargeY(i,j) = rand();
            }
        }
	}

	virtual void TearDown() {}

    const unsigned int n_patients = 1000;
    const unsigned int n_markers = 1000;
    const unsigned int n_traits = 1;
	AlgorithmOptions_t alg_opts;
    MatrixXf X;
    MatrixXf y;
    MatrixXf LargeX;
    MatrixXf LargeY;
	ModelOptions_t model_opts;
	Scheduler* my_scheduler;
};


TEST_F(SchedulerTest, Singleton) {
	Scheduler* my_scheduler2 = Scheduler::Instance();
	ASSERT_EQ(my_scheduler, my_scheduler2);
}


TEST_F(SchedulerTest, getNewAlgorithmId) {
	algorithm_id_t alg_num1 = my_scheduler->getNewAlgorithmId();
	EXPECT_GT(alg_num1, 0);
	algorithm_id_t alg_num2 = my_scheduler->getNewAlgorithmId();
	EXPECT_GT(alg_num2, alg_num1);

	// Since we aren't actually making any algorithms, we shouldn't run out of IDs.
	for (int i = 0; i < 1000; i++) {
		EXPECT_GE(my_scheduler->getNewAlgorithmId(), 0);
	}
}


TEST_F(SchedulerTest, newAlgorithm) {
	algorithm_id_t alg_num1 = my_scheduler->newAlgorithm(alg_opts);
	EXPECT_GE(alg_num1, 0);
    EXPECT_TRUE(my_scheduler->deleteAlgorithm(alg_num1));

	AlgorithmOptions_t alg_opts2 = AlgorithmOptions_t(brent_search, 
        {{"tolerance", "0.01"}, {"learning_rate", "0.01"}});
    algorithm_id_t alg_num2 = my_scheduler->newAlgorithm(alg_opts2);
    EXPECT_GE(alg_num2, 0);
    EXPECT_TRUE(my_scheduler->deleteAlgorithm(alg_num2));

    AlgorithmOptions_t alg_opts3 = AlgorithmOptions_t( grid_search, 
        {{"tolerance", "0.01"}, {"learning_rate", "0.01"}});
    algorithm_id_t alg_num3 = my_scheduler->newAlgorithm(alg_opts3);
    EXPECT_GE(alg_num3, 0);
    EXPECT_TRUE(my_scheduler->deleteAlgorithm(alg_num3));

    AlgorithmOptions_t alg_opts4 = AlgorithmOptions_t(iterative_update,
        {{"tolerance", "0.01"}, {"learning_rate", "0.01"}});
    algorithm_id_t alg_num4 = my_scheduler->newAlgorithm(alg_opts4);
    EXPECT_GE(alg_num4, 0);
    EXPECT_TRUE(my_scheduler->deleteAlgorithm(alg_num4));
    
    AlgorithmOptions_t alg_opts5 = AlgorithmOptions_t(hypo_test,
        {{"tolerance", "0.01"}, {"learning_rate", "0.01"}});
    algorithm_id_t alg_num5 = my_scheduler->newAlgorithm(alg_opts5);
    EXPECT_GE(alg_num5, 0);
    EXPECT_TRUE(my_scheduler->deleteAlgorithm(alg_num5));
}


TEST_F(SchedulerTest, getNewModelId) {
	model_id_t model_num1 = my_scheduler->getNewModelId();
	EXPECT_GE(model_num1, 0);
	model_id_t model_num2 = my_scheduler->getNewModelId();
	EXPECT_GT(model_num2, model_num1);

	// Since we aren't actually making any models, we shouldn't run out of IDs.
	for (int i = 0; i < 1000; i++) {
		EXPECT_GE(my_scheduler->getNewModelId(), 0);
	}
}


TEST_F(SchedulerTest, newModel) {
	model_id_t model_num1 = my_scheduler->newModel(model_opts);
	EXPECT_GE(model_num1, 0);
}


TEST_F(SchedulerTest, SetX) {
	job_id_t job_id = my_scheduler->newJob(JobOptions_t(alg_opts, model_opts));
	Eigen::MatrixXf m(2,3);
	m << 1, 2,
		 3, 4,
		 5, 6;
	EXPECT_EQ(true, my_scheduler->setX(job_id, m));
}


TEST_F(SchedulerTest, SetY) {
	job_id_t job_id = my_scheduler->newJob(JobOptions_t(alg_opts, model_opts));
	Eigen::MatrixXf m(2,3);
	m << 1, 2,
		 3, 4,
		 5, 6;
	EXPECT_EQ(true, my_scheduler->setY(job_id, m));
}


TEST_F(SchedulerTest, getNewJobId) {
	job_id_t job_id1 = my_scheduler->getNewJobId();
	EXPECT_GT(job_id1, 0);
	job_id_t job_id2 = my_scheduler->getNewJobId();
	EXPECT_GT(job_id2, job_id1);

	for (int i = 0; i < 1000; i++) {
		EXPECT_GT(my_scheduler->getNewJobId(), 0);
	}
}


TEST_F(SchedulerTest, newJob) {
	job_id_t job_id1 = my_scheduler->newJob(JobOptions_t(alg_opts, model_opts));
	ASSERT_GT(job_id1, 0);
}

TEST_F(SchedulerTest, ValidAlgorithmId) {
    ASSERT_FALSE(my_scheduler->ValidAlgorithmId(-1));
    EXPECT_TRUE(my_scheduler->ValidAlgorithmId(my_scheduler->getNewAlgorithmId()));
    const algorithm_id_t alg_num = my_scheduler->newAlgorithm(alg_opts);
    ASSERT_TRUE(my_scheduler->ValidAlgorithmId(alg_num));
}


TEST_F(SchedulerTest, ValidModelId) {
    ASSERT_FALSE(my_scheduler->ValidModelId(-1));
    EXPECT_TRUE(my_scheduler->ValidModelId(my_scheduler->getNewModelId()));
    const model_id_t model_num1 = my_scheduler->newModel(model_opts);
    ASSERT_TRUE(my_scheduler->ValidModelId(model_num1));
}


TEST_F(SchedulerTest, ValidJobId) {
    ASSERT_FALSE(my_scheduler->ValidJobId(-1));
    EXPECT_TRUE(my_scheduler->ValidJobId(my_scheduler->getNewJobId()));
    const job_id_t job_id1 = my_scheduler->newJob(JobOptions_t(alg_opts, model_opts));
    ASSERT_TRUE(my_scheduler->ValidJobId(job_id1));
    my_scheduler->deleteJob(job_id1);
    ASSERT_TRUE(my_scheduler->ValidJobId(job_id1));
}


TEST_F(SchedulerTest, AlgorithmIdUsed) {
	ASSERT_FALSE(my_scheduler->AlgorithmIdUsed(-1));
	EXPECT_FALSE(my_scheduler->AlgorithmIdUsed(my_scheduler->getNewAlgorithmId()));
	const algorithm_id_t alg_num = my_scheduler->newAlgorithm(alg_opts);
	ASSERT_TRUE(my_scheduler->AlgorithmIdUsed(alg_num));
    my_scheduler->deleteAlgorithm(alg_num);
    ASSERT_FALSE(my_scheduler->AlgorithmIdUsed(alg_num));
}


TEST_F(SchedulerTest, ModelIdUsed) {
	ASSERT_FALSE(my_scheduler->ModelIdUsed(-1));
	EXPECT_FALSE(my_scheduler->ModelIdUsed(my_scheduler->getNewModelId()));
	const model_id_t model_num1 = my_scheduler->newModel(model_opts);
	ASSERT_TRUE(my_scheduler->ModelIdUsed(model_num1));
    my_scheduler->deleteModel(model_num1);
    ASSERT_FALSE(my_scheduler->ModelIdUsed(model_num1));
}


TEST_F(SchedulerTest, JobIdUsed) {
	ASSERT_FALSE(my_scheduler->JobIdUsed(-1));
	EXPECT_FALSE(my_scheduler->JobIdUsed(my_scheduler->getNewJobId()));
	const job_id_t job_id1 = my_scheduler->newJob(JobOptions_t(alg_opts, model_opts));
	ASSERT_TRUE(my_scheduler->JobIdUsed(job_id1));
	my_scheduler->deleteJob(job_id1);
	ASSERT_FALSE(my_scheduler->JobIdUsed(job_id1));
}


void NullFunc(uv_work_t* req, int status) {};


TEST_F(SchedulerTest, Train_Not_Found) {
    try {
	   my_scheduler->startJob(-1, NullFunc);
    } catch (const exception& e) {
        EXPECT_STREQ("Job id must correspond to a job that has been created.", e.what());
    }
}


TEST_F(SchedulerTest, Train) {
	job_id_t job_id = my_scheduler->newJob(JobOptions_t(alg_opts, model_opts));
	ASSERT_TRUE(my_scheduler->setX(job_id, X));
    ASSERT_TRUE(my_scheduler->setY(job_id, y));
	ASSERT_TRUE(my_scheduler->startJob(job_id, NullFunc));
    /*ASSERT_TRUE(my_scheduler->deleteJob(job_id));*/
}


TEST_F(SchedulerTest, CheckJobProgress) {
    EXPECT_EQ(-1, my_scheduler->checkJobProgress(-1));	// job progress == -1 for bad ID

    // Large Job
    job_id_t job_id = my_scheduler->newJob(JobOptions_t(alg_opts, model_opts));
    ASSERT_TRUE(my_scheduler->setX(job_id, LargeX));
    ASSERT_TRUE(my_scheduler->setY(job_id, LargeY));
    ASSERT_EQ(0, my_scheduler->checkJobProgress(job_id));	// job progress == 0 before being run
    ASSERT_TRUE(my_scheduler->startJob(job_id, NullFunc));
    while(my_scheduler->checkJobProgress(job_id) == 0) {
    	usleep(1);
    }
    float progress = my_scheduler->checkJobProgress(job_id);	// 0 < job progress < 1 before end of run
    ASSERT_GE(progress, 0);
    /*ASSERT_LT(progress, 1);*/
    float progress_2 = my_scheduler->checkJobProgress(job_id);	// job progress monotonically increasing
    ASSERT_GE(progress_2, progress);
    while(my_scheduler->checkJobProgress(job_id) < 1.0) {
        usleep(1);
    }
    ASSERT_EQ(1.0, my_scheduler->checkJobProgress(job_id));	// job progress == 1 after run
    ASSERT_TRUE(my_scheduler->deleteJob(job_id));

	// Everything should be the same for a second run (this small job only takes 1 iteration, though).
    job_id_t job_id2 = my_scheduler->newJob(JobOptions_t(alg_opts, model_opts));
	my_scheduler->setX(job_id2, X);
    my_scheduler->setY(job_id2, y);
	ASSERT_TRUE(my_scheduler->startJob(job_id2, NullFunc));

	progress = my_scheduler->checkJobProgress(job_id2);
	ASSERT_GE(progress, 0);
	progress_2 = my_scheduler->checkJobProgress(job_id2);
	ASSERT_GE(progress_2, progress);

    while(my_scheduler->checkJobProgress(job_id2) < 1.0) {
        usleep(1);
    }
    ASSERT_EQ(1.0, my_scheduler->checkJobProgress(job_id2));
    ASSERT_TRUE(my_scheduler->deleteJob(job_id2));

    // Run large job again
    job_id_t job_id3 = my_scheduler->newJob(JobOptions_t(alg_opts, model_opts));
    ASSERT_NE(job_id, job_id3);
    my_scheduler->setX(job_id3, LargeX);
    my_scheduler->setY(job_id3, LargeY);
    ASSERT_EQ(0, my_scheduler->checkJobProgress(job_id3));
    ASSERT_TRUE(my_scheduler->startJob(job_id3, NullFunc));
    while(my_scheduler->checkJobProgress(job_id3) == 0) {
    	usleep(1);
    }
    progress = my_scheduler->checkJobProgress(job_id3);
    ASSERT_GE(progress, 0);
    // EXPECT_LT(progress, 1); bad to test this because we can't guarantee the job hasn't finished yet
    progress_2 = my_scheduler->checkJobProgress(job_id3);
    ASSERT_GE(progress_2, progress);
    while(my_scheduler->checkJobProgress(job_id3) < 1.0) {
        usleep(1);
    }
    ASSERT_EQ(1.0, my_scheduler->checkJobProgress(job_id3));

	ASSERT_TRUE(my_scheduler->deleteJob(job_id3));
	ASSERT_EQ(my_scheduler->checkJobProgress(job_id3), -1);	// job progress == -1 after being deleted
}


TEST_F(SchedulerTest, DeleteJob) {
    ASSERT_FALSE(my_scheduler->deleteJob(-1));  // can't delete non-existent job

    // Short job - delete after finishing
    job_id_t job_id = my_scheduler->newJob(JobOptions_t(alg_opts, model_opts));
    my_scheduler->setX(job_id, X);
    my_scheduler->setY(job_id, y);
    ASSERT_TRUE(my_scheduler->startJob(job_id, NullFunc));

    float progress = my_scheduler->checkJobProgress(job_id);
    ASSERT_GE(progress, 0);
    float progress_2 = my_scheduler->checkJobProgress(job_id);
    ASSERT_GE(progress_2, progress);
    while(my_scheduler->checkJobProgress(job_id) < 1.0) {
        usleep(1);
    }
    ASSERT_EQ(1.0, my_scheduler->checkJobProgress(job_id));
    ASSERT_TRUE(my_scheduler->deleteJob(job_id));
    ASSERT_FALSE(my_scheduler->deleteJob(job_id));  // can't delete job twice

    
    // Large job - delete while it is running
    job_id = my_scheduler->newJob(JobOptions_t(alg_opts, model_opts));
    ASSERT_TRUE(my_scheduler->setX(job_id, LargeX));
    ASSERT_TRUE(my_scheduler->setY(job_id, LargeY));
    ASSERT_EQ(0, my_scheduler->checkJobProgress(job_id));   // job progress == 0 before being run
    ASSERT_TRUE(my_scheduler->startJob(job_id, NullFunc));
    while(my_scheduler->checkJobProgress(job_id) == 0) {
        usleep(1);
    }
    progress = my_scheduler->checkJobProgress(job_id);   // 0 < job progress < 1 before end of run
    ASSERT_GE(progress, 0);
    /*ASSERT_LT(progress, 1);*/
    ASSERT_TRUE(my_scheduler->deleteJob(job_id));   // should be able to safely delete a job while it's running (it gets cancelled)
    ASSERT_EQ(-1, my_scheduler->checkJobProgress(job_id)); // deleted job has progress = -1
    /*

    // Should be able to do it all again.
    job_id = my_scheduler->newJob(JobOptions_t(alg_opts, model_opts));
    ASSERT_TRUE(my_scheduler->setX(job_id, LargeX));
    ASSERT_TRUE(my_scheduler->setY(job_id, LargeY));
    ASSERT_EQ(0, my_scheduler->checkJobProgress(job_id));   // job progress == 0 before being run
    ASSERT_TRUE(my_scheduler->startJob(job_id, NullFunc));
    while(my_scheduler->checkJobProgress(job_id) == 0) {
        usleep(1);
    }
    progress = my_scheduler->checkJobProgress(job_id);   // 0 < job progress < 1 before end of run
    ASSERT_GE(progress, 0);
    ASSERT_LT(progress, 1);
    ASSERT_TRUE(my_scheduler->deleteJob(job_id));   // should be able to safely delete a job while it's running (it gets cancelled)    
    ASSERT_EQ(-1, my_scheduler->checkJobProgress(job_id)); // deleted job has progress = -1
    */
}


TEST_F(SchedulerTest, GetJobResult) {
    job_id_t job_id = my_scheduler->newJob(JobOptions_t(alg_opts, model_opts));
    my_scheduler->setX(job_id, X);
    my_scheduler->setY(job_id, y);    
    ASSERT_TRUE(my_scheduler->startJob(job_id, NullFunc));

    std::unique_ptr<JobResult_t> results = my_scheduler->getJobResult(job_id);
    while (my_scheduler->checkJobProgress(job_id) < 1.0) {
        usleep(1);
    }
    results = my_scheduler->getJobResult(job_id);
    ASSERT_TRUE(results.get());
    EXPECT_FALSE(results->exception);
    /*EXPECT_EQ(alg_opts, results->options.alg_opts);
    EXPECT_EQ(model_opts, results->options.model_opts);*/
    EXPECT_EQ(job_id, results->job_id);
    /*ASSERT_TRUE(results->beta);*/
    // TODO: Check description here
}
