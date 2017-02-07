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
#include <mutex>
#include <node.h>
#include <stdio.h>
#include <thread>
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
#include "Models/LinearMixedModel.hpp"
#include "Models/SparseLMM.h"
#include "Stats/FisherTest.h"
#include "Stats/Chi2Test.h"
#include "Stats/WaldTest.h"
#include "Scheduler/Job.hpp"
#include "Scheduler/JobResult.hpp"
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
#include "../Models/LinearMixedModel.hpp"
#include "../Models/SparseLMM.h"
#include "../Models/TreeLasso.hpp"
#include "../Stats/FisherTest.h"
#include "../Stats/Chi2Test.h"
#include "../Stats/WaldTest.h"
#include "../Scheduler/Job.hpp"
#include "../Scheduler/JobResult.hpp"
#endif

using namespace std;

// Global static pointer used to ensure a single instance of this class.
Scheduler* Scheduler::s_instance;


//////////////////////////////////////////
// Constructors
//////////////////////////////////////////

Scheduler::Scheduler()
: next_algorithm_id(1)
, next_model_id(1)
, next_job_id(1) {
	algorithms_map = std::unordered_map<algorithm_id_t, unique_ptr<Algorithm>>();
	models_map = std::unordered_map<model_id_t, unique_ptr<Model>>();
	jobs_map = std::unordered_map<job_id_t, unique_ptr<Job_t>>();
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

algorithm_id_t Scheduler::newAlgorithm(const AlgorithmOptions_t& options) {
	const algorithm_id_t id = getNewAlgorithmId();
	// Determine the type of algorithm to create.
	if (ValidAlgorithmId(id)) {
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
				break;
			}
			default:
				return 0;
		}
	}

	return id;
}

model_id_t Scheduler::newModel(const ModelOptions_t& options) {
	const model_id_t id = getNewModelId();
	if (ValidModelId(id)) {
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
			case lmm: {
				models_map[id] = unique_ptr<LinearMixedModel>(new LinearMixedModel(options.options));
				break;
			}
			case slmm: {
				models_map[id] = unique_ptr<SparseLMM>(new SparseLMM(options.options));
				break;
			}
			default:
				return 0;
		}
	}

	return id;
}


bool Scheduler::setX(const job_id_t job_id, const Eigen::MatrixXf& X) {
	if (JobIdUsed(job_id) && getJob(job_id)->model) {
		getJob(job_id)->model->setX(X);
		return true;
	}
	return false;
}


bool Scheduler::setY(const job_id_t job_id, const Eigen::MatrixXf& Y) {
	if (JobIdUsed(job_id) && getJob(job_id)->model) {
		getJob(job_id)->model->setY(Y);
		return true;
	}
	return false;
}

// TODO: merge setX and setY into this function?
bool Scheduler::setModelAttributeMatrix(const job_id_t job_id, const string& str, Eigen::MatrixXf* Z) {
	try {
		if (JobIdUsed(job_id) && getJob(job_id)->model) {
			getJob(job_id)->model->setAttributeMatrix(str, Z);
			return true;
		}
		return false;
	} catch (const exception & e) {
		rethrow_exception(current_exception());
		return false;
	}
}


job_id_t Scheduler::newJob(const JobOptions_t& options) {
	Job_t* my_job = new Job_t();
	const job_id_t job_id = getNewJobId();
	if (ValidJobId(job_id)) {
		my_job->options = options;
		my_job->job_id = job_id;
		try {
			algorithm_id_t algorithm_id = newAlgorithm(options.alg_opts);
			my_job->algorithm = getAlgorithm(algorithm_id);
		} catch (const exception& e) {
			throw runtime_error("Error creating algorithm");
			return 0;
		}
		try {
			model_id_t model_id = newModel(options.model_opts);
			my_job->model = getModel(model_id);
			jobs_map[my_job->job_id] = unique_ptr<Job_t>(my_job);
			return job_id;
		} catch (const exception& e) {
			throw runtime_error("Error creating model");
			return 0;
		} 
	} else {
		throw runtime_error("could not get a new job id (queue may be full)");
	}

	delete my_job;
	return 0;
}


bool Scheduler::startJob(const job_id_t job_id, void (*completion)(uv_work_t*, int)) {
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
		return true;
	} catch (const exception& ex) {
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

	job->thread_id = std::this_thread::get_id();
	// TODO: as more algorithm/model types are created, add them here.
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
		    } else if (LinearMixedModel* model = dynamic_cast<LinearMixedModel*>(job->model)) {
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
		    } else if (LinearMixedModel* model = dynamic_cast<LinearMixedModel*>(job->model)) {
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


float Scheduler::checkJobProgress(const job_id_t job_id) {
	if (JobIdUsed(job_id) && getJob(job_id)->algorithm) {
		return getJob(job_id)->algorithm->getProgress();
	}
	return -1;
}


bool Scheduler::cancelJob(const job_id_t job_id) {
	if (JobIdUsed(job_id) && getJob(job_id)->algorithm) {
		getJob(job_id)->algorithm->stop();
		return true;
	}
	return false;
}


bool Scheduler::deleteAlgorithm(const algorithm_id_t algorithm_id) {
	if (getAlgorithm(algorithm_id) && !getAlgorithm(algorithm_id)->getIsRunning()) {
		getAlgorithm(algorithm_id)->mtx.lock();
		algorithms_map[algorithm_id].reset();
		algorithms_map.erase(algorithm_id);
		return true;
	} else {
		return false;
	}
}


bool Scheduler::deleteModel(const model_id_t model_id) {
	if (getModel(model_id)) {
		/*getModel(model_id)->mtx.lock();*/
		models_map[model_id].reset();
		models_map.erase(model_id);
		return true;
	} else {
		return false;
	}
}


bool Scheduler::deleteJob(const job_id_t job_id) {
	if (JobIdUsed(job_id) && cancelJob(job_id)) {
		// Make sure the job is not currently running.
		getJob(job_id)->algorithm->mtx.lock();
		jobs_map[job_id].reset();
		jobs_map.erase(job_id);
		return true;
	}
	return false;
}


Algorithm* Scheduler::getAlgorithm(const algorithm_id_t algorithm_id) {
	if (AlgorithmIdUsed(algorithm_id)) {
		return algorithms_map[algorithm_id].get();
	} 
	throw runtime_error("Algorithm ID does not match any algorithms.");
	return NULL;
}


Model* Scheduler::getModel(const model_id_t model_id) {
	if (ModelIdUsed(model_id)) {
		return models_map[model_id].get();
	} 
	throw runtime_error("Model ID does not match any models.");
	return NULL;
}


Job_t* Scheduler::getJob(const job_id_t job_id) {
	if (JobIdUsed(job_id)) {
		return jobs_map[job_id].get();
	}
	throw runtime_error("Job ID does not match any jobs.");
	return NULL;
}


JobResult_t* Scheduler::getJobResult(const job_id_t job_id) {
	JobResult_t* result = new JobResult_t();
	if (JobIdUsed(job_id)) {
		Job_t* job = getJob(job_id);
		result->exception = job->exception;
		result->options = job->options;
		result->job_id = job_id;
		result->description = "Effect Size";
		if (AdaMultiLasso* model = dynamic_cast<AdaMultiLasso*>(job->model)) {
	        result->beta = model->getBeta();
	    } else if (Gflasso* model = dynamic_cast<Gflasso*>(job->model)) {
	        result->beta = model->getBeta();
	    } else if (LinearRegression* model = dynamic_cast<LinearRegression*>(job->model)) {
	        result->beta = model->getBeta();
	    } else if (MultiPopLasso* model = dynamic_cast<MultiPopLasso*>(job->model)) {
	        result->beta = model->getBeta();
	    } else if (SparseLMM* model = dynamic_cast<SparseLMM*>(job->model)) {
	        result->beta = model->getBeta();
	    } else if (TreeLasso* model = dynamic_cast<TreeLasso*>(job->model)) {
	        result->beta = model->getBeta();
	    } else if (LinearMixedModel* model = dynamic_cast<LinearMixedModel*>(job->model)) {
			result->beta = model->getBeta();
		} else if (FisherTest* model = dynamic_cast<FisherTest*>(job->model)) {
			result->beta = model->getBeta();
		} else if (Chi2Test* model = dynamic_cast<Chi2Test*>(job->model)) {
			result->beta = model->getBeta();
		} else if (WaldTest* model = dynamic_cast<WaldTest*>(job->model)) {
			result->beta = model->getBeta();
		} else {
	    	result->beta = model->getBeta();
	    }
	}
	return result;
}

////////////////////////////////////////////////////////
// Private Functions
////////////////////////////////////////////////////////

model_id_t Scheduler::getNewModelId() {
	model_id_t candidate_model_id = next_model_id;
	for (unsigned int i = 1; i < kMaxModelId; i++) {
		candidate_model_id = (candidate_model_id + 1) % kMaxModelId + 1;
		if (!ModelIdUsed(candidate_model_id)) {
			model_id_t retval = next_model_id;
			next_model_id = candidate_model_id;
			return retval;
		}
	}
	return 0;
}


algorithm_id_t Scheduler::getNewAlgorithmId() {
	algorithm_id_t candidate_algorithm_id = next_algorithm_id;
	for (unsigned int i = 1; i < kMaxAlgorithmId; i++) {
		candidate_algorithm_id = (candidate_algorithm_id + 1) % kMaxAlgorithmId + 1;
		if (!AlgorithmIdUsed(candidate_algorithm_id)) {
			algorithm_id_t retval = next_algorithm_id;
			next_algorithm_id = candidate_algorithm_id;
			return retval;
		}
	}
	return 0;
}


job_id_t Scheduler::getNewJobId() {
	job_id_t candidate_job_id = next_job_id;
	for (unsigned int i = 1; i < kMaxJobId; i++) {
		candidate_job_id = (candidate_job_id + i) % kMaxJobId + 1;
		if (!JobIdUsed(candidate_job_id)) {
			job_id_t retval = next_job_id;
			next_job_id = candidate_job_id;
			return retval;
		}
	}
	return 0;
}


bool Scheduler::ValidAlgorithmId(const algorithm_id_t id) {
	return (id > 0 && id <= kMaxAlgorithmId);
}

bool Scheduler::ValidModelId(const model_id_t id) {
	return (id > 0 && id <= kMaxModelId);
}

bool Scheduler::ValidJobId(const job_id_t id) {
	return (id > 0 && id <= kMaxJobId);
}

bool Scheduler::AlgorithmIdUsed(const algorithm_id_t id) {
	return (ValidAlgorithmId(id) && algorithms_map[id] && algorithms_map[id].get());
}

bool Scheduler::ModelIdUsed(const model_id_t id) {
	return (ValidModelId(id) && models_map[id] && models_map[id].get());
}

bool Scheduler::JobIdUsed(const job_id_t id) {
	return (ValidJobId(id) && jobs_map[id] && jobs_map[id].get());
}