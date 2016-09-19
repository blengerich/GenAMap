//
// Created by haohanwang on 8/27/16.
//

#include "HypoTestPlaceHolder.h"
#include <iostream>
using namespace std;

HypoTestPlaceHolder::HypoTestPlaceHolder() {
    model = NULL;
}

HypoTestPlaceHolder::HypoTestPlaceHolder(const unordered_map<string, string>& opts) {
    model = NULL;
}

double HypoTestPlaceHolder::getProgress() {
    if (model == NULL){
        return 0;
    }
    else {
        progress = model->getProgress();
        return progress;
    }
}

bool HypoTestPlaceHolder::getIsRunning() {
    if (model==NULL){
        return true;
    }
    else{
        isRunning = model->getIsRunning();
        return isRunning;
    }
}

void HypoTestPlaceHolder::stop() {
    if (model==NULL){
    }
    else{
        model->stop();
    }
}

void HypoTestPlaceHolder::run(StatsBasic *m) {
    model = m;
    model->setUpRun();
    model->run();
    model->finishRun();
}

void HypoTestPlaceHolder::run(Chi2Test *m) {
    model = m;
    model->setUpRun();
    model->run();
    model->finishRun();
}

void HypoTestPlaceHolder::run(FisherTest *m) {
    model = m;
    model->setUpRun();
    model->run();
    model->finishRun();
}

void HypoTestPlaceHolder::run(WaldTest *m) {
    model = m;
    model->setUpRun();
    model->run();
    model->finishRun();
}

void HypoTestPlaceHolder::setUpRun() {
    isRunning = true;
    progress = 0.0;
    shouldStop = false;
}

void HypoTestPlaceHolder::finishRun() {
    isRunning = false;
    progress = 1.0;
}
