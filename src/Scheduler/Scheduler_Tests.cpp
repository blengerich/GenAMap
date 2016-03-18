//
//  Scheduler_Tests.cpp
//  
//
//  Created by Ben Lengerich on 1/27/16.
//
//

#include <stdio.h>
#include "gtest/gtest.h"

#include "Scheduler/Scheduler.hpp"

using namespace std;

TEST(SchedulerTest, getNewJobNum) {
	Scheduler* my_scheduler = Scheduler::Instance();
	int job_num1 = my_scheduler->getNewJobNum();
	EXPECT_GE(job_num1, 0);
	int job_num2 = my_scheduler->getNewJobNum();
	EXPECT_GT(job_num2, job_num1);
	EXPECT_NE(job_num1, job_num2);

	for (int i = 1; i < 100; i++) {
		my_scheduler->getNewJobNum();
	}
	int job_num = my_scheduler->getNewJobNum();
	EXPECT_EQ(job_num, 2);
}


TEST(SchedulerTest, newAlgorithm) {
	Scheduler* my_scheduler = Scheduler::Instance();
	int job_num = my_scheduler->newAlgorithm(Scheduler::algorithm_type::proximal_gradient_descent);
	EXPECT_GE(job_num, 0);
}


TEST(SchedulerTest, Train) {
	Scheduler* my_scheduler = Scheduler::Instance();
	int job_num = my_scheduler->newAlgorithm(Scheduler::algorithm_type::proximal_gradient_descent);
	EXPECT_EQ(true, my_scheduler->train(job_num));
}


TEST(SchedulerTest, Train_Not_Found) {
	Scheduler* my_scheduler = Scheduler::Instance();
	my_scheduler->train(0);
}


TEST(SchedulerTest, Singleton_Test) {
	Scheduler* my_scheduler = Scheduler::Instance();
	Scheduler* my_scheduler2 = Scheduler::Instance();
	ASSERT_EQ(my_scheduler, my_scheduler2);
}