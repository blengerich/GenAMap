//
// Created by haohanwang on 8/22/16.
//

#ifndef GENAMAP_V2_WALDTEST_H
#define GENAMAP_V2_WALDTEST_H

#include "Stats.hpp"

class WaldTest : public StatsBasic{
public:
    void run();
    WaldTest(){};
    WaldTest(const unordered_map<string, string> &);
};


#endif //GENAMAP_V2_WALDTEST_H
