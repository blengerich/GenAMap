#ifndef JOBRESULT_HPP
#define JOBRESULT_HPP

#include <exception>
#include <Eigen/Dense>

#ifdef BAZEL
#include "Algorithms/AlgorithmOptions.hpp"
#include "Models/ModelOptions.hpp"
#include "Scheduler/Job.hpp"
#else
#include "../Algorithms/AlgorithmOptions.hpp"
#include "../Models/ModelOptions.hpp"
#include "Job.hpp"
#endif

using namespace Eigen;
using namespace std;

typedef struct JobResult_t {
	exception_ptr exception;
	JobOptions_t options;
	job_id_t job_id;
	MatrixXd beta; 
	string description;

	JobResult_t() {
		beta = MatrixXd();
		description = "";
	};

} JobResult_t;

#endif // JOBRESULT_HPP