//
//  Scheduler.cpp
//  
//
//  Created by Ben Lengerich on 1/27/16.
//
//

#include "Scheduler.hpp"

#include <Eigen/Dense>
#include <stdexcept>
#include <iostream>
#include <memory>
#include <node.h>
#include <stdio.h>
#include <typeinfo>
#include <unistd.h>
#include <unordered_map>
#include <uv.h>

#ifdef BAZEL
#include "Algorithms/Algorithm.hpp"
#include "Algorithms/AlgorithmOptions.hpp"
#include "Algorithms/BrentSearch.hpp"
#include "Algorithms/GridSearch.hpp"
#include "Algorithms/IterativeUpdate.hpp"
#include "Algorithms/ProximalGradientDescent.hpp"
#include "Algorithms/HypoTestPlaceHolder.h"
#include "Models/AdaMultiLasso.hpp"
#include "Models/GFlasso.h"
#include "Models/lasso.hpp"
#include "Models/LinearRegression.hpp"
#include "Models/Model.hpp"
#include "Models/ModelOptions.hpp"
#include "Models/MultiPopLasso.hpp"
#include "Models/TreeLasso.hpp"
#include "Stats/FisherTest.h"
#include "Stats/Chi2Test.h"
#include "Stats/WaldTest.h"
#include "Scheduler/Job.hpp"
#else
#include "../Algorithms/Algorithm.hpp"
#include "../Algorithms/AlgorithmOptions.hpp"
#include "../Algorithms/BrentSearch.hpp"
#include "../Algorithms/GridSearch.hpp"
#include "../Algorithms/IterativeUpdate.hpp"
#include "../Algorithms/ProximalGradientDescent.hpp"
#include "../Algorithms/HypoTestPlaceHolder.h"
#include "../Models/AdaMultiLasso.hpp"
#include "../Models/GFlasso.h"
#include "../Models/lasso.hpp"
#include "../Models/LinearRegression.hpp"
#include "../Models/Model.hpp"
#include "../Models/ModelOptions.hpp"
#include "../Models/MultiPopLasso.hpp"
#include "../Models/TreeLasso.hpp"
#include "../Stats/FisherTest.h"
#include "../Stats/Chi2Test.h"
#include "../Stats/WaldTest.h"
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
			case algorithm_type::brent_search:
				algorithms_map[id] = unique_ptr<BrentSearch>(new BrentSearch(options.options));
				break;
			case algorithm_type::grid_search:
				algorithms_map[id] = unique_ptr<GridSearch>(new GridSearch(options.options));
				break;
			case algorithm_type::iterative_update:
				algorithms_map[id] = unique_ptr<IterativeUpdate>(new IterativeUpdate(options.options));
				break;
			case algorithm_type::proximal_gradient_descent: {
				algorithms_map[id] = unique_ptr<ProximalGradientDescent>(new ProximalGradientDescent(options.options));	
				break;
			}
			case algorithm_type::hypo_test:{
				algorithms_map[id] = unique_ptr<HypoTestPlaceHolder>(new HypoTestPlaceHolder(options.options));
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
			case linear_regression: {
				models_map[id] = unique_ptr<LinearRegression>(new LinearRegression(options.options));
				break;
			}
			case multi_pop_lasso: {
				models_map[id] = unique_ptr<MultiPopLasso>(new MultiPopLasso(options.options));
				break;
			}
			case tree_lasso: {
				models_map[id] = unique_ptr<TreeLasso>(new TreeLasso(options.options));
				break;
			}
			case fisher_test: {
				models_map[id] = unique_ptr<FisherTest>(new FisherTest(options.options));
				break;
			}
			case chi2_test: {
				models_map[id] = unique_ptr<Chi2Test>(new Chi2Test(options.options));
				break;
			}
			case wald_test: {
				models_map[id] = unique_ptr<WaldTest>(new WaldTest(options.options));
				break;
			}
			default:
				return -1;
		}
	}

	return id;
}


bool Scheduler::setX(const int job_id, const Eigen::MatrixXd& X) {
	if (ValidJobId(job_id) && getJob(job_id)->model) {
		getJob(job_id)->model->setX(X);
		return true;
	}
	return false;
}


bool Scheduler::setY(const int job_id, const Eigen::MatrixXd& Y) {
	if (ValidJobId(job_id) && getJob(job_id)->model) {
		getJob(job_id)->model->setY(Y);
		return true;
	}
	return false;
}

// TODO: merge setX and setY into this function?
bool Scheduler::setModelAttributeMatrix(const int job_id, const string& str, Eigen::MatrixXd* Z) {
	try {
		if (ValidJobId(job_id) && getJob(job_id)->model) {
			getJob(job_id)->model->setAttributeMatrix(str, Z);
			return true;
		}
		return false;
	} catch (const exception & e) {
		rethrow_exception(current_exception());
		return false;
	}
}


int Scheduler::newJob(const JobOptions_t& options) {
	Job_t* my_job = new Job_t();
	const int job_id = getNewJobId();
	if (job_id >= 0) {
		my_job->job_id = job_id;
		int algorithm_id = newAlgorithm(options.alg_opts);
		if (getAlgorithm(algorithm_id)) {
			my_job->algorithm = getAlgorithm(algorithm_id);
			int model_id = newModel(options.model_opts);
			if (getModel(model_id)) {
				my_job->model = getModel(algorithm_id);
				jobs_map[my_job->job_id] = unique_ptr<Job_t>(my_job);
				return job_id;
			} else {
				throw runtime_error("Error creating model");
			}
		} else {
			throw runtime_error("Error creating algorithm");
		}
	} else {
		throw runtime_error("could not get a new job id (queue may be full)");
	}

	delete my_job;
	return -1;
}


bool Scheduler::startJob(const int job_id, void (*completion)(uv_work_t*, int)) {
	if (!ValidJobId(job_id)) {
		throw runtime_error("Job id must correspond to a job that has been created.");
		return false;
	}
	Job_t* job = getJob(job_id);

	if (!job) {
		throw runtime_error("Job must not be null.");
		return false;
	} else if (!job->algorithm || !job->model) {
		throw runtime_error("Job must have an algorithm and a model.");
		return false;
	} else if (job->algorithm->getIsRunning()) {
		throw runtime_error("Job is already running.");
		return false;
	}
	try {
		job->algorithm->assertReadyToRun();
		job->model->assertReadyToRun();
		job->request.data = job;
		uv_queue_work(uv_default_loop(), &(job->request), trainAlgorithmThread, completion);
		usleep(10);	// TODO: fix this rare race condition (stopping job before the worker thread has started is bad) in a better way? [Issue: https://github.com/blengerich/GenAMap_V2/issues/27]
		return true;
	} catch (const exception& ex) {
		//job->exception = current_exception();	// Must save the exception so that it can be passed between threads - but this is running in main thread?
		rethrow_exception(current_exception());
		return false;
	}
}


// Runs in libuv thread spawned by startJob
void trainAlgorithmThread(uv_work_t* req) {
	Job_t* job = static_cast<Job_t*>(req->data);
	if (!job) {
		throw runtime_error("Job must not be null");
		return;
	}

	// TODO: as more algorithm/model types are created, add them here. [Issue: https://github.com/blengerich/GenAMap_V2/issues/25]
	try {
		if (!job->algorithm || !job->model) {
			throw runtime_error("Job must have an algorithm and a model");
		}
		job->algorithm->assertReadyToRun();
		job->model->assertReadyToRun();
		// Object slicing makes this annoying
		if (BrentSearch* alg = dynamic_cast<BrentSearch*>(job->algorithm)) {
			alg->setUpRun();
			if (AdaMultiLasso* model = dynamic_cast<AdaMultiLasso*>(job->model)) {
		        alg->run(model);
		    } else if (Gflasso* model = dynamic_cast<Gflasso*>(job->model)) {
		        alg->run(model);
		    } else if (LinearRegression* model = dynamic_cast<LinearRegression*>(job->model)) {
		        alg->run(model);
		    } else if (MultiPopLasso* model = dynamic_cast<MultiPopLasso*>(job->model)) {
		        alg->run(model);
		    } else if (SparseLMM* model = dynamic_cast<SparseLMM*>(job->model)) {
		        alg->run(model);
		    } else if (TreeLasso* model = dynamic_cast<TreeLasso*>(job->model)) {
		        alg->run(model);
		    } else {
		        throw runtime_error("Requested model type not implemented for the requested algorithm");
		    }
		    alg->finishRun();
		} else if (GridSearch* alg = dynamic_cast<GridSearch*>(job->algorithm)) {
			alg->setUpRun();
			if (AdaMultiLasso* model = dynamic_cast<AdaMultiLasso*>(job->model)) {
		        alg->run(model);
		    } else if (Gflasso* model = dynamic_cast<Gflasso*>(job->model)) {
		        alg->run(model);
		    } else if (LinearRegression* model = dynamic_cast<LinearRegression*>(job->model)) {
		        alg->run(model);
		    } else if (MultiPopLasso* model = dynamic_cast<MultiPopLasso*>(job->model)) {
		        alg->run(model);
		    } else if (SparseLMM* model = dynamic_cast<SparseLMM*>(job->model)) {
		        alg->run(model);
		    } else if (TreeLasso* model = dynamic_cast<TreeLasso*>(job->model)) {
		        alg->run(model);
		    } else {
		        throw runtime_error("Requested model type not implemented for the requested algorithm");
		    }
		    alg->finishRun();
		} else if (IterativeUpdate* alg = dynamic_cast<IterativeUpdate*>(job->algorithm)) {
			alg->setUpRun();
			if (AdaMultiLasso* model = dynamic_cast<AdaMultiLasso*>(job->model)) {
		        alg->run(model);
		    } else if (Gflasso* model = dynamic_cast<Gflasso*>(job->model)) {
		        alg->run(model);
		    } else if (LinearRegression* model = dynamic_cast<LinearRegression*>(job->model)) {
		        alg->run(model);
		    } else if (MultiPopLasso* model = dynamic_cast<MultiPopLasso*>(job->model)) {
		        alg->run(model);
		    } else if (SparseLMM* model = dynamic_cast<SparseLMM*>(job->model)) {
		        alg->run(model);
		    } else if (TreeLasso* model = dynamic_cast<TreeLasso*>(job->model)) {
		        alg->run(model);
		    } else {
		        throw runtime_error("Requested model type not implemented for the requested algorithm");
		    }
		    alg->finishRun();
		} else if (ProximalGradientDescent* alg = dynamic_cast<ProximalGradientDescent*>(job->algorithm)) {
			alg->setUpRun();
			if (AdaMultiLasso* model = dynamic_cast<AdaMultiLasso*>(job->model)) {
		        alg->run(model);
		    } else if (Gflasso* model = dynamic_cast<Gflasso*>(job->model)) {
		        alg->run(model);
		    } else if (LinearRegression* model = dynamic_cast<LinearRegression*>(job->model)) {
		        alg->run(model);
		    } else if (MultiPopLasso* model = dynamic_cast<MultiPopLasso*>(job->model)) {
		        alg->run(model);
		    } else if (SparseLMM* model = dynamic_cast<SparseLMM*>(job->model)) {
		        alg->run(model);
		    } else if (TreeLasso* model = dynamic_cast<TreeLasso*>(job->model)) {
		        alg->run(model);
		    } else {
		        throw runtime_error("Requested model type not implemented for the requested algorithm");
		    }
		    alg->finishRun();
		} else if (HypoTestPlaceHolder* alg = dynamic_cast<HypoTestPlaceHolder*>(job->algorithm)){
			alg->setUpRun();
			if (FisherTest* model = dynamic_cast<FisherTest*>(job->model)) {
				alg->run(model);
			} else if (Chi2Test* model = dynamic_cast<Chi2Test*>(job->model)) {
				alg->run(model);
			} else if (WaldTest* model = dynamic_cast<WaldTest*>(job->model)) {
				alg->run(model);
			} else {
				throw runtime_error("Requested model type not implemented for the requested algorithm");
			}
			alg->finishRun();
		} else {
			throw runtime_error("Requested algorithm type not implemented");
		}
	} catch (const exception& ex) {
		job->exception = current_exception();	// Must save the exception so that it can be passed between threads.
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
			usleep(100);
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
	if (ValidJobId(job_id) && cancelJob(job_id)) {
		//jobs_map[job_id].reset();
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
	if (ValidJobId(job_id)) {
		return jobs_map[job_id].get();
	}
	throw runtime_error("Job ID does not match any jobs.");
	return NULL;
}


MatrixXd Scheduler::getJobResult(const int job_id) {
	if (ValidJobId(job_id)) {
		Job_t* job = getJob(job_id);
		if (AdaMultiLasso* model = dynamic_cast<AdaMultiLasso*>(job->model)) {
	        return model->getBeta();
	    } else if (Gflasso* model = dynamic_cast<Gflasso*>(job->model)) {
	        return model->getBeta();
	    } else if (LinearRegression* model = dynamic_cast<LinearRegression*>(job->model)) {
	        return model->getBeta();
	    } else if (MultiPopLasso* model = dynamic_cast<MultiPopLasso*>(job->model)) {
	        return model->getBeta();
	    } else if (SparseLMM* model = dynamic_cast<SparseLMM*>(job->model)) {
	        return model->getBeta();
	    } else if (TreeLasso* model = dynamic_cast<TreeLasso*>(job->model)) {
	        return model->getBeta();
	    } else if (FisherTest* model = dynamic_cast<FisherTest*>(job->model)) {
			return model->getBeta();
		} else if (Chi2Test* model = dynamic_cast<Chi2Test*>(job->model)) {
			return model->getBeta();
		} else if (WaldTest* model = dynamic_cast<WaldTest*>(job->model)) {
			return model->getBeta();
		} else {
	    	return model->getBeta();
	    }
	} else {
		return MatrixXd();
	}
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
