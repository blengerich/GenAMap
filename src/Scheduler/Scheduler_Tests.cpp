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
#include "algorithm/AlgorithmOptions.hpp"
#include "model/ModelOptions.hpp"

using namespace std;


TEST(SchedulerTest, Singleton) {
	Scheduler* my_scheduler = Scheduler::Instance();
	Scheduler* my_scheduler2 = Scheduler::Instance();
	ASSERT_EQ(my_scheduler, my_scheduler2);
}


TEST(SchedulerTest, getNewAlgorithmId) {
	Scheduler* my_scheduler = Scheduler::Instance();
	int alg_num1 = my_scheduler->getNewAlgorithmId();
	EXPECT_GE(alg_num1, 0);
	int alg_num2 = my_scheduler->getNewAlgorithmId();
	EXPECT_GT(alg_num2, alg_num1);

	for (int i = 0; i < 1000; i++) {
		EXPECT_GE(my_scheduler->getNewAlgorithmId(), 0);
	}
}


TEST(SchedulerTest, newAlgorithm) {
	Scheduler* my_scheduler = Scheduler::Instance();
	AlgorithmOptions_t alg_opts = AlgorithmOptions_t(
		algorithm_type::proximal_gradient_descent, {{"tolerance", "0.01"}, {"learning_rate", "0.01"}});
	int alg_num1 = my_scheduler->newAlgorithm(alg_opts);
	EXPECT_GE(alg_num1, 0);

	/*alg_opts = AlgorithmOptions_t(
		algorithm_type::iterative_update, unordered_map<string, string>());
	int job_num2 = my_scheduler->newAlgorithm(alg_opts);
	EXPECT_GE(job_num2, job_num1);*/
}


TEST(SchedulerTest, getNewModelId) {
	Scheduler* my_scheduler = Scheduler::Instance();
	int model_num1 = my_scheduler->getNewModelId();
	EXPECT_GE(model_num1, 0);
	int model_num2 = my_scheduler->getNewModelId();
	EXPECT_GT(model_num2, model_num1);

	for (int i = 0; i < 1000; i++) {
		EXPECT_GE(my_scheduler->getNewModelId(), 0);
	}
}


TEST(SchedulerTest, newModel) {
	Scheduler* my_scheduler = Scheduler::Instance();
	ModelOptions_t model_opts = ModelOptions_t(linear_regression, {{"lambda", "0.01"}, {"L2_lambda", "0.01"}});
	int model_num1 = my_scheduler->newModel(model_opts);
	EXPECT_GE(model_num1, 0);
}

TEST(SchedulerTest, SetX) {
	Scheduler* my_scheduler = Scheduler::Instance();
	ModelOptions_t model_opts = ModelOptions_t(linear_regression, {{"lambda", "0.01"}, {"L2_lambda", "0.01"}});
	int model_num = my_scheduler->newModel(model_opts);
	Eigen::MatrixXd m(2,3);
	m << 1, 2,
		 3, 4,
		 5, 6;
	EXPECT_EQ(true, my_scheduler->setX(model_num, m));
}


TEST(SchedulerTest, SetY) {
	Scheduler* my_scheduler = Scheduler::Instance();
	ModelOptions_t model_opts = ModelOptions_t(linear_regression, {{"lambda", "0.01"}, {"L2_lambda", "0.01"}});
	int model_num = my_scheduler->newModel(model_opts);
	Eigen::MatrixXd m(2,3);
	m << 1, 2,
		 3, 4,
		 5, 6;
	EXPECT_EQ(true, my_scheduler->setY(model_num, m));
}

TEST(SchedulerTest, getNewJobId) {
	Scheduler* my_scheduler = Scheduler::Instance();
	int job_num1 = my_scheduler->getNewJobId();
	EXPECT_GE(job_num1, 0);
	int job_num2 = my_scheduler->getNewJobId();
	EXPECT_GT(job_num2, job_num1);

	for (int i = 0; i < 1000; i++) {
		EXPECT_GE(my_scheduler->getNewJobId(), 0);
	}
}


TEST(SchedulerTest, newJob) {
	Scheduler* my_scheduler = Scheduler::Instance();
	AlgorithmOptions_t alg_opts = AlgorithmOptions_t(
		algorithm_type::proximal_gradient_descent, {{"tolerance", "0.01"}, {"learning_rate", "0.01"}});
	int alg_num = my_scheduler->newAlgorithm(alg_opts);
	ModelOptions_t model_opts = ModelOptions_t(linear_regression, {{"lambda", "0.01"}, {"L2_lambda", "0.01"}});
	int model_num = my_scheduler->newModel(model_opts);
	JobOptions_t job_opts = JobOptions_t(alg_num, model_num);
	int job_num1 = my_scheduler->newJob(job_opts);
	ASSERT_GE(job_num1, 0);
}

void NullFunc(uv_work_t* req, int status) {};

TEST(SchedulerTest, Train) {
	Scheduler* my_scheduler = Scheduler::Instance();
	ModelOptions_t model_opts = ModelOptions_t(linear_regression, {{"lambda", "0.01"}, {"L2_lambda", "0.01"}});
	int model_num1 = my_scheduler->newModel(model_opts);
	AlgorithmOptions_t alg_opts = AlgorithmOptions_t(
		algorithm_type::proximal_gradient_descent, {{"tolerance", "0.01"}, {"learning_rate", "0.01"}});

    MatrixXd X(10, 5);
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
    MatrixXd y(10, 1);
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
    Scheduler::Instance()->setX(model_num1, X);
    Scheduler::Instance()->setY(model_num1, y);
    
	int alg_num1 = my_scheduler->newAlgorithm(alg_opts);
	int job_num = my_scheduler->newJob(JobOptions_t(alg_num1, model_num1));

	if (!my_scheduler->getJob(job_num) || !my_scheduler->getJob(job_num)->model) {
		cerr << "model null" << endl;
	}
	if (!my_scheduler->getJob(job_num) && !my_scheduler->getJob(job_num)->algorithm) {
		cerr << "algorithm null" << endl;
	}
	ASSERT_EQ(true, my_scheduler->startJob(job_num, NullFunc));
}


TEST(SchedulerTest, ValidAlgorithmId) {
	Scheduler* my_scheduler = Scheduler::Instance();
	ASSERT_FALSE(Scheduler::Instance()->ValidAlgorithmId(-1));
	EXPECT_FALSE(Scheduler::Instance()->ValidAlgorithmId(Scheduler::Instance()->getNewAlgorithmId()));
	AlgorithmOptions_t alg_opts = AlgorithmOptions_t(
		algorithm_type::proximal_gradient_descent, {{"tolerance", "0.01"}, {"learning_rate", "0.01"}});
	int alg_num = my_scheduler->newAlgorithm(alg_opts);
	ASSERT_TRUE(Scheduler::Instance()->ValidModelId(alg_num));
}

TEST(SchedulerTest, ValidModelId) {
	Scheduler* my_scheduler = Scheduler::Instance();
	ASSERT_FALSE(my_scheduler->ValidModelId(-1));
	EXPECT_FALSE(my_scheduler->ValidModelId(Scheduler::Instance()->getNewModelId()));
	ModelOptions_t model_opts = ModelOptions_t(linear_regression, {{"lambda", "0.01"}, {"L2_lambda", "0.01"}});
	int model_num1 = Scheduler::Instance()->newModel(model_opts);
	ASSERT_TRUE(Scheduler::Instance()->ValidModelId(model_num1));
}

// TODO: extract jobs and models into "sample" jobs/model for quick setup/teardown.
TEST(SchedulerTest, ValidJobId) {
	Scheduler* my_scheduler = Scheduler::Instance();
	ASSERT_FALSE(my_scheduler->ValidJobId(-1));
	EXPECT_FALSE(my_scheduler->ValidJobId(my_scheduler->getNewJobId()));
	
	AlgorithmOptions_t alg_opts = AlgorithmOptions_t(
		algorithm_type::proximal_gradient_descent, {{"tolerance", "0.01"}, {"learning_rate", "0.01"}});
	int alg_num = my_scheduler->newAlgorithm(alg_opts);
	ModelOptions_t model_opts = ModelOptions_t(linear_regression, {{"lambda", "0.01"}, {"L2_lambda", "0.01"}});
	int model_num = my_scheduler->newModel(model_opts);
	JobOptions_t job_opts = JobOptions_t(alg_num, model_num);
	int job_num1 = my_scheduler->newJob(job_opts);
	ASSERT_TRUE(my_scheduler->ValidJobId(job_num1));

	my_scheduler->deleteJob(job_num1);
	ASSERT_FALSE(my_scheduler->ValidJobId(job_num1));
}

TEST(SchedulerTest, CheckJobProgress) {
	Scheduler* my_scheduler = Scheduler::Instance();
	EXPECT_EQ(my_scheduler->checkJobProgress(0), -1);

	ModelOptions_t model_opts = ModelOptions_t(linear_regression, {{"lambda", "0.01"}, {"L2_lambda", "0.01"}});
	int model_num1 = my_scheduler->newModel(model_opts);
	AlgorithmOptions_t alg_opts = AlgorithmOptions_t(
		algorithm_type::proximal_gradient_descent, {{"tolerance", "0.01"}, {"learning_rate", "0.01"}});

    MatrixXd X(10, 5);
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
    MatrixXd y(10, 1);
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
    Scheduler::Instance()->setX(model_num1, X);
    Scheduler::Instance()->setY(model_num1, y);
    
	int alg_num1 = my_scheduler->newAlgorithm(alg_opts);
	int job_num = my_scheduler->newJob(JobOptions_t(alg_num1, model_num1));
	ASSERT_EQ(true, my_scheduler->startJob(job_num, NullFunc));

	double progress = my_scheduler->checkJobProgress(job_num);
	ASSERT_GE(progress, 0);
	double progress_2 = my_scheduler->checkJobProgress(job_num);
	ASSERT_GE(progress_2, progress);

	/*ASSERT_TRUE(my_scheduler->deleteJob(job_num));
	ASSERT_EQ(my_scheduler->checkJobProgress(job_num), -1);*/
}

// TODO: can algorithms only be used for 1 job at a time?


/*TEST(SchedulerTest, Train_Not_Found) {
	Scheduler* my_scheduler = Scheduler::Instance();
	//my_scheduler->train(0);
}*/


//} // Namespace