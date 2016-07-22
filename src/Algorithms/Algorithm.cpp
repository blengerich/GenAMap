//
// Created by haohanwang on 1/24/16.
//

#include <iostream>

#ifdef BAZEL
#include "Algorithms/Algorithm.hpp"
#include "Models/Model.hpp"
#else
#include "Algorithm.hpp"
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
}

/*
void Algorithm::run(Model*) {
	cout<<"This algorithm is not implemented for current model"<<endl;
}*/