//
//  Scheduler.cpp
//  
//
//  Created by Ben Lengerich on 1/27/16.
//
//

#include <stdio.h>

#include "algorithm/Algorithm.hpp"
#include "Scheduler/Scheduler.hpp"

using namespace std;

// Global static pointer used to ensure a single instance of this class.
Scheduler* Scheduler::s_instance = NULL;


Scheduler* Scheduler::Instance() {	
	if (!s_instance) {	// Singleton
		s_instance = new Scheduler;
	}
	return s_instance;
};

bool Scheduler::train(int jobNum) {
	return 0;
};

double Scheduler::checkStatus(int jobNum) {
	return algorithms[jobNum]->getProgress();
};

