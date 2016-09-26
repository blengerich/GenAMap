//
// Created by haohanwang on 8/22/16.
//

#ifndef GENAMAP_V2_CHI2TEST_H
#define GENAMAP_V2_CHI2TEST_H

#include "Stats.hpp"

class Chi2Test : public StatsBasic{
public:
    void run();
    Chi2Test(){};
    Chi2Test(const unordered_map<string, string> &);
};


#endif //GENAMAP_V2_CHI2TEST_H
