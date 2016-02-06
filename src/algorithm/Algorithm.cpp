//
// Created by haohanwang on 1/24/16.
//
#include <iostream>
using namespace std;

#include "Algorithm.hpp"

Algorithm::Algorithm() {progress = 0; maxIteration=1000;};
int Algorithm::getMaxIteration(void) {return maxIteration; };
double Algorithm::getProgress(void) {return progress; };
void Algorithm::setMaxIteration(int m) { maxIteration = m;};
void Algorithm::run(Model*) { cout<<"This algorithm is not implemented for current model"<<endl;};