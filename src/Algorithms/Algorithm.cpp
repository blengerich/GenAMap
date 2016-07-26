//
// Created by haohanwang on 1/24/16.
//

#include <stdexcept>
#include <iostream>

#ifdef BAZEL
#include "Algorithms/Algorithm.hpp"
#include "Models/AdaMultiLasso.hpp"
#include "Models/GFlasso.h"
#include "Models/LinearMixedModel.hpp"
#include "Models/LinearRegression.hpp"
#include "Models/Model.hpp"
#include "Models/MultiPopLasso.hpp"
#include "Models/SparseLMM.h"
#include "Models/TreeLasso.hpp"
#else
#include "../Algorithms/Algorithm.hpp"
#include "../Models/AdaMultiLasso.hpp"
#include "../Models/GFlasso.h"
#include "../Models/LinearMixedModel.hpp"
#include "../Models/LinearRegression.hpp"
#include "../Models/Model.hpp"
#include "../Models/MultiPopLasso.hpp"
#include "../Models/SparseLMM.h"
#include "../Models/TreeLasso.hpp"
#endif

using namespace std;

Algorithm::Algorithm() {
	progress = 0;
	maxIteration=1000;
	isRunning = false;
	shouldStop = false;
}

int Algorithm::getMaxIteration() {
	return maxIteration;
}

double Algorithm::getProgress() {
	return progress;
}

void Algorithm::setMaxIteration(int m) {
	maxIteration = m;
}

bool Algorithm::getIsRunning() {
	return isRunning;
}

void Algorithm::stop() {
	shouldStop = true;
}
