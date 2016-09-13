//
// Created by haohanwang on 8/27/16.
//

#ifndef GENAMAP_V2_HYPOTESTPLACEHOLDER_H
#define GENAMAP_V2_HYPOTESTPLACEHOLDER_H

#include "Algorithm.hpp"
#ifdef BAZEL
#include "Stats/Stats.hpp"
#else
#include "../Stats/Stats.hpp"
#endif


class HypoTestPlaceHolder : public Algorithm {
private:
    StatsBasic * model;
public:

    HypoTestPlaceHolder();
    HypoTestPlaceHolder(const unordered_map<string, string>);

    double getProgress();
    bool getIsRunning();
    void stop();

    void assertReadyToRun(){};
    void run(StatsBasic*);
    void setUpRun(){};
    void finishRun(){};
};


#endif //GENAMAP_V2_HYPOTESTPLACEHOLDER_H
