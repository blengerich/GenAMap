//
// Created by haohanwang on 1/24/16.
//

#include "Algorithm.hpp"

#include <stdexcept>

#ifdef BAZEL
#include "Models/Model.hpp"
#else
#include "../Models/Model.hpp"
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
	mtx.lock();	// Wait until the algorithm has actually finished to return.
	mtx.unlock();
}

void Algorithm::run(Model* model) {
	throw runtime_error("This algorithm is not implemented for the selected model.");
}