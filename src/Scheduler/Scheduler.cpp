//
//  Scheduler.cpp
//  
//
//  Created by Ben Lengerich on 1/27/16.
//
//

#include <exception>
#include <iostream>
#include <map>
#include <pthread.h>
#include <queue>
#include <stdio.h>

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
, n_running_threads(0)
, algorithms_map(new std::map<int, Algorithm*>)
, algorithms_queue(new std::queue<Algorithm*>) {
	pthread_mutex_init(&n_running_threads_mutex, NULL);
	pthread_mutex_init(&algorithms_queue_mutex, NULL);
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

int Scheduler::newAlgorithm(const algorithm_type& algorithm_name, const map<string, string>& options) {
	// Algorithm must be added before it can be run.
	Algorithm* new_algorithm;
	switch(algorithm_name) {
		case proximal_gradient_descent:
			new_algorithm = new ProximalGradientDescent(options);
			break;
		case iterative_update :
			new_algorithm = new IterativeUpdate(options);
			break;
		default :
			cout << "Attempted to create an Algorithm type that does not exist" << endl;
			return -1;
	}

	const int new_job_num = getNewJobNum();
	if (new_job_num < 0) {	// job num = -1 indicates no available job numbers
		return -1;
	}

	(*algorithms_map)[new_job_num] = new_algorithm;
	//algorithms_queue->push(new_algorithm);

	return new_job_num;
}

bool Scheduler::train(int jobNum) {
	// Open a new thread and then start the job.
	// When deployed on AWS auto-scale, we will increase the size of the instance
	// here and decrease on completion of job.
	struct thread_info* tinfo;
	pthread_attr_t attr;
	
	try {
		algorithms_queue->push((*algorithms_map)[jobNum]);
		if (n_running_threads < kMaxThreads) {
			pthread_t thread;
			
			pthread_attr_init(&attr);
			pthread_create(&thread, &attr, &Scheduler::train_thread, tinfo);
		}
	} catch (exception& e) {
		return false;
	}
	return true;
}

void* Scheduler::train_thread(void* arg) {
	pthread_mutex_lock(&(s_intance->n_running_threads_mutex));
	n_running_threads++;
	pthread_mutex_unlock(&(s_instance->n_running_threads_mutex));
	// Expects to run in a child thread.
	
	// Run the algorithm if there is one waiting.
	pthread_mutex_lock(&(s_instance->algorithms_queue_mutex));
	while (!(&s_instance->algorithms_queue->empty())) {
		// Pop from queue.
		Algorithm* algorithm = algorithms_queue->front();
		algorithms_queue->pop();
		pthread_mutex_unlock(&algorithms_queue_mutex);

		// Run the algorithm here. What is the interface for running?
		algorithm->run(new Model);// what is my model?
		// Handle the results here
	}
	// If no algorithms are waiting to run, kill this thread.
	pthread_mutex_lock(&n_running_threads_mutex);
	n_running_threads--;
	pthread_mutex_unlock(&n_running_threads_mutex);
	pthread_exit(0);
}

double Scheduler::checkStatus(int jobNum) {
	return (*algorithms_map)[jobNum]->getProgress();
}

int Scheduler::getNewJobNum() {
	for (int i = 1; i < max_job_num; i++) {
		int candidate_job_num = (current_job_num + i) % max_job_num;
		if (algorithms_map->count(candidate_job_num) == 0) {
			current_job_num = candidate_job_num;
			return candidate_job_num;
		}
	}
	return -1;
}

