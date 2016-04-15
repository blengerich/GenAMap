//
// Created by haohanwang on 1/24/16.
//

#include <iostream>

#ifdef BAZEL
#include "algorithm/Algorithm.hpp"
#include "model/Model.hpp"

#else
#include "Algorithm.hpp"
#include "../model/Model.hpp"
#endif

using namespace std;

Algorithm::Algorithm() {
	progress = 0;
	maxIteration=1000;
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

void Algorithm::run(Model*) {
	cout<<"This algorithm is not implemented for current model"<<endl;
}