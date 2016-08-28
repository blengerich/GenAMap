//
// Created by haohanwang on 8/27/16.
//

#ifndef GENAMAP_V2_HYPOTESTPLACEHOLDER_H
#define GENAMAP_V2_HYPOTESTPLACEHOLDER_H

#include "Algorithm.hpp"
#include "Stats/Stats.hpp"


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
