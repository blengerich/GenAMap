//
//  Scheduler.cpp
//  
//
//  Created by Ben Lengerich on 1/27/16.
//
//

#include <stdio.h>
#include <exception>
#include <iostream>
#include <map>
#include <queue>

#include "algorithm/ProximalGradientDescent.hpp"
#include "algorithm/IterativeUpdate.hpp"
#include "algorithm/Algorithm.hpp"
#include "Scheduler/Scheduler.hpp"

using namespace std;

// Global static pointer used to ensure a single instance of this class.
Scheduler* Scheduler::s_instance = NULL;

Scheduler::Scheduler()
: max_job_num(100)
, current_job_num(0)
, algorithms_map(new std::map<int, Algorithm*>)
, algorithms_queue(new std::queue<Algorithm*>){
}

Scheduler& Scheduler::operator=(Scheduler const& s) {
	return *Scheduler::Instance();
}

Scheduler* Scheduler::Instance() {	
	if (!s_instance) {	// Singleton
		s_instance = new Scheduler;
	}
	return s_instance;
}

bool Scheduler::train(int jobNum) {
	return false;
}

double Scheduler::checkStatus(int jobNum) {
	return (*algorithms_map)[jobNum]->getProgress();
}

int Scheduler::getNewJobNum() {
	for (int i = 1; i < max_job_num; i++) {
		int candidate_job_num = (current_job_num + i) % max_job_num;
		cout << candidate_job_num << endl;
		if (algorithms_map->count(candidate_job_num) == 0) {
			current_job_num = candidate_job_num;
			return candidate_job_num;
		}
	}
	return -1;
}

int Scheduler::newAlgorithm(const algorithm_type& algorithm_name, const map<string, string>& options) {
	Algorithm* new_algorithm;
	switch(algorithm_name) {
		case proximal_gradient_descent:
			new_algorithm = new ProximalGradientDescent(options);
			break;
			/*try {
				new_algorithm->setLearningRate(options["learningRate"]);
				new_algorithm->setTolerance(options["tolerance"]);
			} catch (exception& e) {}*/
		case iterative_update :
			new_algorithm = new IterativeUpdate(options);
			break;
			/*try {
				new_algorithm->setTolerance(options["tolerance"]);
			} catch (exception& e) {}*/
		default :
			cout << "Attempted to create an Algorithm type that does not exist" << endl;
			return -1;
	}

	const int new_job_num = getNewJobNum();
	cout << new_job_num << endl;
	if (new_job_num < 0) {	// job num = -1 indicates no available job numbers
		return -1;
	}

	(*algorithms_map)[new_job_num] = new_algorithm;
	algorithms_queue->push(new_algorithm);

	return new_job_num;
}