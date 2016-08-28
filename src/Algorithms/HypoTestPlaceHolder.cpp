//
// Created by haohanwang on 8/27/16.
//

#include "HypoTestPlaceHolder.h"

HypoTestPlaceHolder::HypoTestPlaceHolder() {
    model = NULL;
}

HypoTestPlaceHolder::HypoTestPlaceHolder(const unordered_map<string, string> map) {
    model = NULL;
}

double HypoTestPlaceHolder::getProgress() {
    if (model == NULL){
        return 0;
    }
    else {
        model->getProgress();
    }
    return 0;
}

bool HypoTestPlaceHolder::getIsRunning() {
    if (model==NULL){
        return false;
    }
    else{
        model->getIsRunning();
    }
    return false;
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
    m->setUpRun();
    model->run();
    m->finishRun();
}
