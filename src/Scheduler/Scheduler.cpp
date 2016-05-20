//
//  Scheduler.cpp
//  
//
//  Created by Ben Lengerich on 1/27/16.
//
//

#include "Scheduler.hpp"

#include <Eigen/Dense>
#include <exception>
#include <iostream>
#include <memory>
#include <node.h>
#include <stdio.h>
#include <typeinfo>
#include <unistd.h>
#include <unordered_map>
#include <uv.h>

#ifdef BAZEL
#include "algorithm/Algorithm.hpp"
#include "algorithm/AlgorithmOptions.hpp"
#include "algorithm/IterativeUpdate.hpp"
#include "algorithm/ProximalGradientDescent.hpp"
#include "model/AdaMultiLasso.hpp"
#include "model/GFlasso.h"
#include "model/lasso.hpp"
#include "model/LinearRegression.hpp"
#include "model/Model.hpp"
#include "model/ModelOptions.hpp"
#include "model/MultiPopLasso.hpp"
#include "model/TreeLasso.hpp"
#include "Scheduler/Job.hpp"
#else
#include "../algorithm/Algorithm.hpp"
#include "../algorithm/AlgorithmOptions.hpp"
#include "../algorithm/ProximalGradientDescent.hpp"
#include "../algorithm/IterativeUpdate.hpp"
#include "../model/AdaMultiLasso.hpp"
#include "../model/GFlasso.h"
#include "../model/lasso.hpp"
#include "../model/LinearRegression.hpp"
#include "../model/Model.hpp"
#include "../model/ModelOptions.hpp"
#include "../model/MultiPopLasso.hpp"
#include "../model/TreeLasso.hpp"
#include "../Scheduler/Job.hpp"
#endif

using namespace std;

// Global static pointer used to ensure a single instance of this class.
Scheduler* Scheduler::s_instance;


//////////////////////////////////////////
// Constructors
//////////////////////////////////////////

Scheduler::Scheduler()
: next_algorithm_id(0)
, next_model_id(0)
, next_job_id(0) {
	algorithms_map = std::unordered_map<int, unique_ptr<Algorithm>>();
	models_map = std::unordered_map<int, unique_ptr<Model>>();
	jobs_map = std::unordered_map<int, unique_ptr<Job_t>>();
}

Scheduler& Scheduler::operator=(Scheduler const& s) {
	return *Scheduler::Instance();
}

Scheduler* Scheduler::Instance() {	
	if (!s_instance) {	// Singleton
		s_instance = new Scheduler();
	}
	return s_instance;
}

/////////////////////////////////////////////////////////
// Public Functions
/////////////////////////////////////////////////////////

int Scheduler::newAlgorithm(const AlgorithmOptions_t& options) {
	//Algorithm* my_algorithm;
	int id = getNewAlgorithmId();
	// Determine the type of algorithm to create.
	if (id >= 0) {
		switch(options.type) {
			/*case brent_search:
				my_algorithm = new BrentSearch(options);
				break;
			case grid_search:
				my_algorithm = new GridSearch(options);
				break;
			case iterative_update:
				my_algorithm = new IterativeUpdate(options);
				break;*/
			case algorithm_type::proximal_gradient_descent: {
				ProximalGradientDescent* my_algorithm = new ProximalGradientDescent(options.options);
				algorithms_map[id] = unique_ptr<Algorithm>(my_algorithm);	
				break;
			}
			default:
				return -1;
		}
	}

	return id;
}

int Scheduler::newModel(const ModelOptions_t& options) {
	//Model* my_model;
	int id = getNewModelId();
	if (id >= 0) {
		switch(options.type) {
			case ada_multi_lasso: {
				AdaMultiLasso* my_model = new AdaMultiLasso(options.options);
				models_map[id] = unique_ptr<Model>(my_model);
				break;
			}
			case gf_lasso: {
				Gflasso* my_model = new Gflasso(options.options);
				models_map[id] = unique_ptr<Model>(my_model);
				break;
			}
			/*case lasso:
				my_model = new Lasso(options.options);
				break;*/
			case linear_regression: {
				cerr << "linereg" << endl;
				/*LinearRegression* my_model = ;*/
				models_map[id] = unique_ptr<LinearRegression>(new LinearRegression(options.options));
				break;
			}
			case multi_pop_lasso: {
				MultiPopLasso* my_model = new MultiPopLasso(options.options);
				models_map[id] = unique_ptr<Model>(my_model);
				break;
			}
			case tree_lasso: {
				/*TreeLasso* my_model = ;*/
				models_map[id] = unique_ptr<Model>(new TreeLasso(options.options));
				break;
			}
			default:
				return -1;
		}
	}

	return id;
}


bool Scheduler::setX(const int model_id, const Eigen::MatrixXd& X) {
	cout << "trying to set X" << endl;
	if (model_id >= 0 && model_id < kMaxModelId && models_map[model_id].get()) {
		cout << "trying to set X" << endl;
		models_map[model_id].get()->setX(X);
		return true;
	}
	return false;
}


bool Scheduler::setY(const int model_id, const Eigen::MatrixXd& Y) {
	if (model_id >= 0 && model_id < kMaxModelId && models_map[model_id].get()) {
		models_map[model_id].get()->setY(Y);
		return true;
	}
	return false;
}


int Scheduler::newJob(const JobOptions_t& options) {
	const int algorithm_id = options.algorithm_id;
	const int model_id = options.model_id;

	Job_t* my_job = new Job_t();
	my_job->job_id = getNewJobId();
	if (my_job->job_id >= 0) {
		unordered_map<int, unique_ptr<Algorithm>>::iterator it = algorithms_map.find(algorithm_id);
		if (it != algorithms_map.end()) {
			my_job->algorithm = it->second.get();
			unordered_map<int, unique_ptr<Model>>::iterator it = models_map.find(model_id);
			if (it != models_map.end()) {
				my_job->model = it->second.get();
				jobs_map[my_job->job_id] = unique_ptr<Job_t>(my_job);
				return my_job->job_id;
			}
		}	
	}
	delete my_job;
	return -1;
}


bool Scheduler::startJob(const int job_id, void (*completion)(uv_work_t*, int)) {
	Job_t* job = getJob(job_id);
	job->request.data = job;
	if (!job) {
		cerr << "Job must not be null" << endl;
		return false;
	} else if (!job->algorithm || !job->model) {
		cerr << "Job must have an algorithm and a model" << endl;
		return false;
	}
	uv_queue_work(uv_default_loop(), &(job->request), trainAlgorithmThread, completion);
	return true;
}


// Runs in libuv thread spawned by trainAlgorithmAsync
void trainAlgorithmThread(uv_work_t* req) {
	cerr << "inside thread" << endl;
	// Running in worker thread.
	Job_t* job = static_cast<Job_t*>(req->data);
	if (!job) {
		cerr << "Job must not be null" << endl;
		return;
	} else if (!job->algorithm || !job->model) {
		cerr << "Job must have an algorithm and a model" << endl;
		return;
	}
	
	// TODO: as more algorithm/model types are created, add them here.
	/*Algorithm* alg;
	Model* model;*/
	if (ProximalGradientDescent* alg = dynamic_cast<ProximalGradientDescent*>(job->algorithm)) {
		/*cout << "proximal_gradient_descent" << endl;*/
		/*cout << job->model->getX().rows() << endl;
		cout << job->model->getX().cols() << endl;
		cout << job->model->getY().rows() << endl;
		cout << job->model->getY().cols() << endl;*/
		/*ProximalGradientDescent* alg = (ProximalGradientDescent*)(job->algorithm);*/
		if (LinearRegression* model = dynamic_cast<LinearRegression*>(job->model)) {
			/*cout << "running" << endl;*/
			/*alg->run(dynamic_cast<LinearRegression*>(job->model));	*/
			alg->run(model);
		} /*else if (dynamic_cast<Lasso*>(job->model)) {
			alg->run(dynamic_cast<Lasso*>(job->model));	
		}*/ else if (dynamic_cast<AdaMultiLasso*>(job->model)) {
			alg->run(dynamic_cast<AdaMultiLasso*>(job->model));
		} /*else if (dynamic_cast<Gflasso*>(job->model)) {
			alg->run(dynamic_cast<Gflasso*>(job->model));
		}*/
	} else if (dynamic_cast<IterativeUpdate*>(job->algorithm)) {
		IterativeUpdate* alg = (IterativeUpdate*)(job->algorithm);
		if (dynamic_cast<TreeLasso*>(job->model)) {
			alg->run(dynamic_cast<TreeLasso*>(job->model));	
		} /*else if (dynamic_cast<Lasso*>(job->model)) {
			alg->run(dynamic_cast<Lasso*>(job->model));	
		}*/ /*else if (dynamic_cast<AdaMultiLasso*>(job->model)) {
			alg->run(dynamic_cast<AdaMultiLasso*>(job->model));
		}*/ /*else if (dynamic_cast<Gflasso*>(job->model)) {
			alg->run(dynamic_cast<Gflasso*>(job->model));
		}*/
	}
}



double Scheduler::checkJob(const int job_id) {
	return Instance()->jobs_map[job_id].get()->algorithm->getProgress();
}


bool Scheduler::cancelJob(const int job_num) {
	// TODO: How to cancel an algorithm while it's running?
	// remove from maps and queues.
	return false;
}


bool Scheduler::deleteAlgorithm(const int algorithm_id) {
	// TODO: Safety checks here
	if (algorithms_map[algorithm_id]) {
		algorithms_map[algorithm_id].reset();
		algorithms_map.erase(algorithm_id);
		return true;
	} else {
		return false;
	}
}


bool Scheduler::deleteModel(const int model_id) {
	// TODO: Safety checks
	if (models_map[model_id]) {
		models_map[model_id].reset();
		models_map.erase(model_id);
		return true;
	} else {
		return false;
	}
}


bool Scheduler::deleteJob(const int job_id) {
	// TODO: safety checks
	if (jobs_map[job_id] && jobs_map[job_id].get()) {
		jobs_map[job_id].reset();
		jobs_map.erase(job_id);	
		return true;
	} else {
		return false;
	}
	
}


Job_t* Scheduler::getJob(const int job_id) {
	return jobs_map[job_id].get();
}


MatrixXd Scheduler::getResult(const int job_id) {
	return getJob(job_id)->model->getBeta();
}


////////////////////////////////////////////////////////
// Private Functions
////////////////////////////////////////////////////////

int Scheduler::getNewModelId() {
	int retval = next_model_id;
	for (int i = 1; i < s_instance->kMaxModelId; i++) {
		int candidate_model_id = (s_instance->next_model_id + i) % s_instance->kMaxModelId;
		if (s_instance->models_map.count(candidate_model_id) == 0) {
			s_instance->next_model_id = candidate_model_id;
			return retval;
		}
	}
	return -1;
}


int Scheduler::getNewAlgorithmId() {
	int retval = next_algorithm_id;
	for (int i = 1; i < kMaxAlgorithmId; i++) {
		int candidate_algorithm_id = (next_algorithm_id + i) % kMaxAlgorithmId;
		if (algorithms_map.count(candidate_algorithm_id) == 0) {
			next_algorithm_id = candidate_algorithm_id;
			return retval;
		}
	}
	return -1;
}


int Scheduler::getNewJobId() {
	int retval = next_job_id;
	for (int i = 1; i < s_instance->kMaxJobId; i++) {
		int candidate_job_id = (s_instance->next_job_id + i) % s_instance->kMaxJobId;
		if (s_instance->jobs_map.count(candidate_job_id) == 0) {
			s_instance->next_job_id = candidate_job_id;
			return retval;
		}
	}
	return -1;
}
