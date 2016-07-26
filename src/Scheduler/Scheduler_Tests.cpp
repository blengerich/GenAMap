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

        X = MatrixXd(10, 5);
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
    	y = MatrixXd(10, 1);        
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

		LargeX = MatrixXd(n_patients, n_markers);
        for (int i = 0; i < n_patients; i++) {
            for (int j = 0; j < n_markers; j++) {
                LargeX(i,j) = rand();
            }
        }
    	LargeY = MatrixXd(n_patients, n_traits);        
        for (int i = 0; i < n_patients; i++) {
            for (int j = 0; j < n_traits; j++) {
                LargeY(i,j) = rand();
            }
        }
	}

	virtual void TearDown() {}

    const int n_patients = 1000;
    const int n_markers = 1000;
    const int n_traits = 1;
	AlgorithmOptions_t alg_opts;
    MatrixXd X;
    MatrixXd y;
    MatrixXd LargeX;
    MatrixXd LargeY;
	ModelOptions_t model_opts;
	Scheduler* my_scheduler;
};


TEST_F(SchedulerTest, Singleton) {
	Scheduler* my_scheduler2 = Scheduler::Instance();
	ASSERT_EQ(my_scheduler, my_scheduler2);
}


TEST_F(SchedulerTest, getNewAlgorithmId) {
	int alg_num1 = my_scheduler->getNewAlgorithmId();
	EXPECT_GE(alg_num1, 0);
	int alg_num2 = my_scheduler->getNewAlgorithmId();
	EXPECT_GT(alg_num2, alg_num1);

	// Since we aren't actually making any algorithms, we shouldn't run out of IDs.
	for (int i = 0; i < 1000; i++) {
		EXPECT_GE(my_scheduler->getNewAlgorithmId(), 0);
	}
}


TEST_F(SchedulerTest, newAlgorithm) {
	int alg_num1 = my_scheduler->newAlgorithm(alg_opts);
	EXPECT_GE(alg_num1, 0);
	// TODO: other checks to ensure the algorithm was constructed correctly [Issue: https://github.com/blengerich/GenAMap_V2/issues/15]

	// TODO: test other algorithm types here [Issue: https://github.com/blengerich/GenAMap_V2/issues/7]
}


TEST_F(SchedulerTest, getNewModelId) {
	int model_num1 = my_scheduler->getNewModelId();
	EXPECT_GE(model_num1, 0);
	int model_num2 = my_scheduler->getNewModelId();
	EXPECT_GT(model_num2, model_num1);

	// Since we aren't actually making any models, we shouldn't run out of IDs.
	for (int i = 0; i < 1000; i++) {
		EXPECT_GE(my_scheduler->getNewModelId(), 0);
	}
}


TEST_F(SchedulerTest, newModel) {
	int model_num1 = my_scheduler->newModel(model_opts);
	EXPECT_GE(model_num1, 0);
}


TEST_F(SchedulerTest, SetX) {
	int job_id = my_scheduler->newJob(JobOptions_t(alg_opts, model_opts));
	Eigen::MatrixXd m(2,3);
	m << 1, 2,
		 3, 4,
		 5, 6;
	EXPECT_EQ(true, my_scheduler->setX(job_id, m));
}


TEST_F(SchedulerTest, SetY) {
	int job_id = my_scheduler->newJob(JobOptions_t(alg_opts, model_opts));
	Eigen::MatrixXd m(2,3);
	m << 1, 2,
		 3, 4,
		 5, 6;
	EXPECT_EQ(true, my_scheduler->setY(job_id, m));
}


TEST_F(SchedulerTest, getNewJobId) {
	int job_num1 = my_scheduler->getNewJobId();
	EXPECT_GE(job_num1, 0);
	int job_num2 = my_scheduler->getNewJobId();
	EXPECT_GT(job_num2, job_num1);

	for (int i = 0; i < 1000; i++) {
		EXPECT_GE(my_scheduler->getNewJobId(), 0);
	}
}


TEST_F(SchedulerTest, newJob) {
	int job_num1 = my_scheduler->newJob(JobOptions_t(alg_opts, model_opts));
	ASSERT_GE(job_num1, 0);
}


TEST_F(SchedulerTest, ValidAlgorithmId) {
	ASSERT_FALSE(my_scheduler->ValidAlgorithmId(-1));
	EXPECT_FALSE(my_scheduler->ValidAlgorithmId(my_scheduler->getNewAlgorithmId()));
	int alg_num = my_scheduler->newAlgorithm(alg_opts);
	ASSERT_TRUE(my_scheduler->ValidAlgorithmId(alg_num));
}


TEST_F(SchedulerTest, ValidModelId) {
	ASSERT_FALSE(my_scheduler->ValidModelId(-1));
	EXPECT_FALSE(my_scheduler->ValidModelId(my_scheduler->getNewModelId()));

	int model_num1 = my_scheduler->newModel(model_opts);
	ASSERT_TRUE(my_scheduler->ValidModelId(model_num1));
}


TEST_F(SchedulerTest, ValidJobId) {
	ASSERT_FALSE(my_scheduler->ValidJobId(-1));
	EXPECT_FALSE(my_scheduler->ValidJobId(my_scheduler->getNewJobId()));
	
	int job_num1 = my_scheduler->newJob(JobOptions_t(alg_opts, model_opts));
	ASSERT_TRUE(my_scheduler->ValidJobId(job_num1));

	my_scheduler->deleteJob(job_num1);
	ASSERT_FALSE(my_scheduler->ValidJobId(job_num1));
}


void NullFunc(uv_work_t* req, int status) {};


TEST_F(SchedulerTest, Train_Not_Found) {
	ASSERT_FALSE(my_scheduler->startJob(-1, NullFunc));
}


TEST_F(SchedulerTest, Train) {
	int job_id = my_scheduler->newJob(JobOptions_t(alg_opts, model_opts));
	ASSERT_TRUE(my_scheduler->setX(job_id, X));
    ASSERT_TRUE(my_scheduler->setY(job_id, y));
	ASSERT_TRUE(my_scheduler->startJob(job_id, NullFunc));
}

TEST_F(SchedulerTest, CheckJobProgress) {
    EXPECT_EQ(-1, my_scheduler->checkJobProgress(-1));	// job progress == -1 for bad ID

    int job_id = my_scheduler->newJob(JobOptions_t(alg_opts, model_opts));
    ASSERT_TRUE(my_scheduler->setX(job_id, LargeX));
    ASSERT_TRUE(my_scheduler->setY(job_id, LargeY));
    ASSERT_EQ(0, my_scheduler->checkJobProgress(job_id));	// job progress == 0 before being run
    ASSERT_TRUE(my_scheduler->startJob(job_id, NullFunc));
    while(my_scheduler->checkJobProgress(job_id) == 0) {
    	usleep(1);
    }
    double progress = my_scheduler->checkJobProgress(job_id);	// 0 < job progress < 1 before end of run
    ASSERT_GE(progress, 0);
    ASSERT_LT(progress, 1);
    double progress_2 = my_scheduler->checkJobProgress(job_id);	// job progress monotonically increasing
    ASSERT_GE(progress_2, progress);
    while(my_scheduler->checkJobProgress(job_id) < 1.0) {
        usleep(1);
    }
    ASSERT_EQ(1.0, my_scheduler->checkJobProgress(job_id));	// job progress == 1 after run

	// Everything should be the same for a second run (this small job only takes 1 iteration, though).
	int job_id2 = my_scheduler->newJob(JobOptions_t(alg_opts, model_opts));
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

    // Run large job again
    int job_id3 = my_scheduler->newJob(JobOptions_t(alg_opts, model_opts));
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
    ASSERT_LT(progress, 1);
    progress_2 = my_scheduler->checkJobProgress(job_id3);
    ASSERT_GE(progress_2, progress);
    while(my_scheduler->checkJobProgress(job_id3) < 1.0) {
        usleep(1);
    }
    ASSERT_EQ(1.0, my_scheduler->checkJobProgress(job_id3));

	/*ASSERT_TRUE(my_scheduler->deleteJob(job_id3));
	ASSERT_EQ(my_scheduler->checkJobProgress(job_id3), -1);	// job progress == -1 after being deleted*/
}


TEST_F(SchedulerTest, GetJobResult) {
    int job_num = my_scheduler->newJob(JobOptions_t(alg_opts, model_opts));
    my_scheduler->setX(job_num, X);
    my_scheduler->setY(job_num, y);    
    ASSERT_TRUE(my_scheduler->startJob(job_num, NullFunc));

    MatrixXd results = my_scheduler->getJobResult(job_num);
    while (my_scheduler->checkJobProgress(job_num) < 1.0) {
        usleep(1);
    }
    results = my_scheduler->getJobResult(job_num);
}
