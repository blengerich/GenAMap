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

TEST(SchedulerTest, Singleton_Test) {
	Scheduler* my_scheduler = Scheduler::Instance();
	Scheduler* my_scheduler2 = Scheduler::Instance();
	EXPECT_EQ(my_scheduler, my_scheduler2);
}

TEST(SchedulerTest, Always_True) {
    EXPECT_EQ(1,1);
}