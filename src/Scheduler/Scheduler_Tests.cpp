//
//  Scheduler_Tests.cpp
//  
//
//  Created by Ben Lengerich on 1/27/16.
//
//

#include <Eigen/Dense>
#include <stdio.h>
#include "gtest/gtest.h"
#include <unordered_map>

#include "Scheduler/Scheduler.hpp"
#include "algorithm/AlgorithmOptions.hpp"
#include "model/ModelOptions.hpp"

using namespace std;


TEST(SchedulerTest, getNewAlgorithmId) {
	Scheduler* my_scheduler = Scheduler::Instance();
	int alg_num1 = my_scheduler->getNewAlgorithmId();
	EXPECT_GE(alg_num1, 0);
	int alg_num2 = my_scheduler->getNewAlgorithmId();
	EXPECT_GT(alg_num2, alg_num1);
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
}


TEST(SchedulerTest, newModel) {
	Scheduler* my_scheduler = Scheduler::Instance();
	ModelOptions_t model_opts = ModelOptions_t(linear_regression, {{"lambda", "0.01"}, {"L2_lambda", "0.01"}});
	int model_num1 = my_scheduler->newModel(model_opts);
	EXPECT_GE(model_num1, 0);
}


TEST(SchedulerTest, getNewJobId) {
	Scheduler* my_scheduler = Scheduler::Instance();
	int job_num1 = my_scheduler->getNewJobId();
	EXPECT_GE(job_num1, 0);
	int job_num2 = my_scheduler->getNewJobId();
	EXPECT_GT(job_num2, job_num1);
}


TEST(SchedulerTest, newJobAlgNotFound) {
	Scheduler* my_scheduler = Scheduler::Instance();
	JobOptions_t job_opts = JobOptions_t(1, 1);
	int job_num1 = my_scheduler->newJob(job_opts);
	EXPECT_EQ(job_num1, -1);
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
	EXPECT_GE(job_num1, 0);
}


TEST(SchedulerTest, Train) {
	//Scheduler* my_scheduler = Scheduler::Instance();
	//int job_num = my_scheduler->newAlgorithm(Scheduler::algorithm_type::proximal_gradient_descent);
	//EXPECT_EQ(true, my_scheduler->train(job_num));
}


/*TEST(SchedulerTest, Train_Not_Found) {
	Scheduler* my_scheduler = Scheduler::Instance();
	//my_scheduler->train(0);
}*/


TEST(SchedulerTest, Singleton) {
	Scheduler* my_scheduler = Scheduler::Instance();
	Scheduler* my_scheduler2 = Scheduler::Instance();
	ASSERT_EQ(my_scheduler, my_scheduler2);
}

TEST(SchedulerTest, SetX) {
	Scheduler* my_scheduler = Scheduler::Instance();
	ModelOptions_t model_opts = ModelOptions_t(linear_regression, {{"lambda", "0.01"}, {"L2_lambda", "0.01"}});
	int model_num = my_scheduler->newModel(model_opts);
	Eigen::MatrixXd m(2,3);
	m << 1, 2,
		 3, 4,
		 5, 6;
	EXPECT_EQ(my_scheduler->setX(model_num, m), true);
}


TEST(SchedulerTest, SetY) {
	Scheduler* my_scheduler = Scheduler::Instance();
	ModelOptions_t model_opts = ModelOptions_t(linear_regression, {{"lambda", "0.01"}, {"L2_lambda", "0.01"}});
	int model_num = my_scheduler->newModel(model_opts);
	Eigen::MatrixXd m(2,3);
	m << 1, 2,
		 3, 4,
		 5, 6;
	EXPECT_EQ(my_scheduler->setY(model_num, m), true);
}
