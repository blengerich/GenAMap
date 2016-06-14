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
				algorithms_map[id] = unique_ptr<ProximalGradientDescent>(new ProximalGradientDescent(options.options));	
				break;
			}
			default:
				return -1;
		}
	}

	return id;
}

int Scheduler::newModel(const ModelOptions_t& options) {
	int id = getNewModelId();
	if (id >= 0) {
		switch(options.type) {
			case ada_multi_lasso: {
				models_map[id] = unique_ptr<AdaMultiLasso>(new AdaMultiLasso(options.options));
				break;
			}
			case gf_lasso: {
				models_map[id] = unique_ptr<Gflasso>(new Gflasso(options.options));
				break;
			}
			/*case lasso:
				my_model = new Lasso(options.options);
				break;*/
			case linear_regression: {
				models_map[id] = unique_ptr<LinearRegression>(new LinearRegression(options.options));
				break;
			}
			case multi_pop_lasso: {
				models_map[id] = unique_ptr<MultiPopLasso>(new MultiPopLasso(options.options));
				break;
			}
			case tree_lasso: {
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
	if (getModel(model_id)) {
		getModel(model_id)->setX(X);
		return true;
	}
	return false;
}


bool Scheduler::setY(const int model_id, const Eigen::MatrixXd& Y) {
	if (getModel(model_id)) {
		getModel(model_id)->setY(Y);
		return true;
	}
	return false;
}


int Scheduler::newJob(const JobOptions_t& options) {
	const int algorithm_id = options.algorithm_id;
	const int model_id = options.model_id;

	Job_t* my_job = new Job_t();
	const int job_id = getNewJobId();
	if (job_id >= 0) {
		my_job->job_id = job_id;
		if (getAlgorithm(algorithm_id)) {
			my_job->algorithm = getAlgorithm(algorithm_id);
			if (getModel(model_id)) {
				my_job->model = getModel(model_id);
				jobs_map[my_job->job_id] = unique_ptr<Job_t>(my_job);
				return job_id;
			}
		}
	}

	delete my_job;
	return -1;
}


bool Scheduler::startJob(const int job_id, void (*completion)(uv_work_t*, int)) {
	if (!ValidJobId(job_id)) {
		return false;
	}

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
	usleep(10);	// TODO: fix this rare race condition (stopping job before the worker thread has started is bad) in a better way? [Issue: https://github.com/blengerich/GenAMap_V2/issues/27]
	return true;
}


// Runs in libuv thread spawned by trainAlgorithmAsync
void trainAlgorithmThread(uv_work_t* req) {
	Job_t* job = static_cast<Job_t*>(req->data);
	if (!job) {
		cerr << "Job must not be null" << endl;
		return;
	} else if (!job->algorithm || !job->model) {
		cerr << "Job must have an algorithm and a model" << endl;
		return;
	}
	
	// TODO: as more algorithm/model types are created, add them here. [Issue: https://github.com/blengerich/GenAMap_V2/issues/25]
	if (ProximalGradientDescent* alg = dynamic_cast<ProximalGradientDescent*>(job->algorithm)) {
	    if (AdaMultiLasso* model = dynamic_cast<AdaMultiLasso*>(job->model)) {
	        alg->run(model);
	    } else if (LinearRegression* model = dynamic_cast<LinearRegression*>(job->model)) {
	        alg->run(model);
	    } /*else if (dynamic_cast<Lasso*>(job->model)) {
	        alg->run(dynamic_cast<Lasso*>(job->model)); 
	    }*/ /*else if (dynamic_cast<Gflasso*>(job->model)) {
	        alg->run(dynamic_cast<Gflasso*>(job->model));
	    }*/ 
	} else if (IterativeUpdate* alg = dynamic_cast<IterativeUpdate*>(job->algorithm)) {
		if (TreeLasso* model = dynamic_cast<TreeLasso*>(job->model)) {
			alg->run(model);	
		} /*else if (dynamic_cast<Lasso*>(job->model)) {
			alg->run(dynamic_cast<Lasso*>(job->model));	
		}*/ /*else if (dynamic_cast<AdaMultiLasso*>(job->model)) {
			alg->run(dynamic_cast<AdaMultiLasso*>(job->model));
		}*/ /*else if (dynamic_cast<Gflasso*>(job->model)) {
			alg->run(dynamic_cast<Gflasso*>(job->model));
		}*/
	}
}


double Scheduler::checkJobProgress(const int job_id) {
	if (ValidJobId(job_id) && getJob(job_id)->algorithm) {
		return getJob(job_id)->algorithm->getProgress();
	}
	return -1;
}


bool Scheduler::cancelJob(const int job_id) {
	if (ValidJobId(job_id) && getJob(job_id)->algorithm) {
		getJob(job_id)->algorithm->stop();	// TODO: switch to sending shutdown signal? [Issue: https://github.com/blengerich/GenAMap_V2/issues/21]
		while(getJob(job_id)->algorithm->getIsRunning()) {
			// TODO: stopping should be async with callback? [Issue: https://github.com/blengerich/GenAMap_V2/issues/26]
			usleep(1000);
		}
		return true;
	}
	return false;
}


bool Scheduler::deleteAlgorithm(const int algorithm_id) {
	// TODO: Safety checks here - How to ensure that no jobs refer to this algorithm? Reference count in algorithm object? [Issue: https://github.com/blengerich/GenAMap_V2/issues/22]
	if (getAlgorithm(algorithm_id)) {
		algorithms_map[algorithm_id].reset();
		algorithms_map.erase(algorithm_id);
		return true;
	} else {
		return false;
	}
}


bool Scheduler::deleteModel(const int model_id) {
	// TODO: Safety checks - How to ensure that no jobs refer to this algorithm? Reference count in algorithm obejct? [Issue: https://github.com/blengerich/GenAMap_V2/issues/24]
	if (models_map[model_id]) {
		models_map[model_id].reset();
		models_map.erase(model_id);
		return true;
	} else {
		return false;
	}
}


bool Scheduler::deleteJob(const int job_id) {
	// TODO: check that user owns this job [Issue: https://github.com/blengerich/GenAMap_V2/issues/23]
	if (cancelJob(job_id)) {
		jobs_map[job_id].reset();
		jobs_map.erase(job_id);
		return true;
	}
	return false;
}


Algorithm* Scheduler::getAlgorithm(const int algorithm_id) {
	return ValidAlgorithmId(algorithm_id) ? algorithms_map[algorithm_id].get() : NULL;
}


Model* Scheduler::getModel(const int model_id) {
	return ValidModelId(model_id) ? models_map[model_id].get() : NULL;
}


Job_t* Scheduler::getJob(const int job_id) {
	return ValidJobId(job_id) ? jobs_map[job_id].get() : NULL;
}


MatrixXd Scheduler::getResult(const int job_id) {
	return ValidJobId(job_id) ? getJob(job_id)->model->getBeta() : MatrixXd();
}

////////////////////////////////////////////////////////
// Private Functions
////////////////////////////////////////////////////////

int Scheduler::getNewModelId() {
	int retval = next_model_id;
	for (int i = 1; i < kMaxModelId; i++) {
		int candidate_model_id = (next_model_id + i) % kMaxModelId;
		if (!ValidModelId(candidate_model_id)) {
			next_model_id = candidate_model_id;
			return retval;
		}
	}
	return -1;
}


int Scheduler::getNewAlgorithmId() {
	int retval = next_algorithm_id;
	for (int i = 1; i < kMaxAlgorithmId; i++) {
		int candidate_algorithm_id = (next_algorithm_id + i) % kMaxAlgorithmId;
		if (!ValidAlgorithmId(candidate_algorithm_id)) {
			next_algorithm_id = candidate_algorithm_id;
			return retval;
		}
	}
	return -1;
}


int Scheduler::getNewJobId() {
	int retval = next_job_id;
	for (int i = 1; i < kMaxJobId; i++) {
		int candidate_job_id = (next_job_id + i) % kMaxJobId;
		if (!ValidJobId(candidate_job_id)) {
			next_job_id = candidate_job_id;
			return retval;
		}
	}
	return -1;
}


bool Scheduler::ValidAlgorithmId(const int id) {
	return (id >= 0 && id < kMaxAlgorithmId && algorithms_map[id] && algorithms_map[id].get());
}

bool Scheduler::ValidModelId(const int id) {
	return (id >= 0 && id < kMaxModelId && models_map[id] && models_map[id].get());
}

bool Scheduler::ValidJobId(const int id) {
	return (id >= 0 && id < kMaxJobId && jobs_map[id] && jobs_map[id].get());
}
