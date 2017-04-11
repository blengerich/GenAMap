//
// Created by haohanwang on 8/27/16.
//

#ifndef GENAMAP_V2_HYPOTESTPLACEHOLDER_H
#define GENAMAP_V2_HYPOTESTPLACEHOLDER_H

#include <memory>
#include "Algorithm.hpp"

#ifdef BAZEL
#include "Stats/Stats.hpp"
#include "Stats/Chi2Test.h"
#include "Stats/FisherTest.h"
#include "Stats/WaldTest.h"
#else
#include "../Stats/Stats.hpp"
#include "../Stats/Chi2Test.h"
#include "../Stats/FisherTest.h"
#include "../Stats/WaldTest.h"
#endif


class HypoTestPlaceHolder : public Algorithm {
private:
    shared_ptr<StatsBasic> model;
public:

    HypoTestPlaceHolder();
    HypoTestPlaceHolder(const unordered_map<string, string>&);

    float getProgress();
    bool getIsRunning();
    void stop();

    void assertReadyToRun(){};
    void run(shared_ptr<StatsBasic>);
    void run(shared_ptr<Chi2Test>);
    void run(shared_ptr<FisherTest>);
    void run(shared_ptr<WaldTest>);
    void setUpRun();
    void finishRun();
};


#endif //GENAMAP_V2_HYPOTESTPLACEHOLDER_H
