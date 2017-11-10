//
// Created by haohanwang on 8/27/16.
//

#include "HypoTestPlaceHolder.h"

HypoTestPlaceHolder::HypoTestPlaceHolder() {
    model = shared_ptr<StatsBasic>(nullptr);
}

HypoTestPlaceHolder::HypoTestPlaceHolder(const unordered_map<string, string>& opts) {
    model = shared_ptr<StatsBasic>(nullptr);
}

float HypoTestPlaceHolder::getProgress() {
    if (model.get() == nullptr){
        return 0;
    }
    else {
        progress = model->getProgress();
        return progress;
    }
}

bool HypoTestPlaceHolder::getIsRunning() {
    if (model.get() == nullptr){
        return true;
    }
    else{
        isRunning = model->getIsRunning();
        return isRunning;
    }
}

void HypoTestPlaceHolder::stop() {
    if (model.get() == nullptr){
    }
    else{
        model->stop();
    }
}

void HypoTestPlaceHolder::run(shared_ptr<StatsBasic> m) {
    model = m;
    model->setUpRun();
    model->run();
    model->finishRun();
}

void HypoTestPlaceHolder::run(shared_ptr<Chi2Test> m) {
    model = m;
    model->setUpRun();
    model->run();
    model->finishRun();
}

void HypoTestPlaceHolder::run(shared_ptr<FisherTest> m) {
    model = m;
    model->setUpRun();
    model->run();
    model->finishRun();
}

void HypoTestPlaceHolder::run(shared_ptr<WaldTest> m) {
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
