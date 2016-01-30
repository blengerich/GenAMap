//
//  Scheduler.h
//  
//
//  Created by Ben Lengerich on 1/25/16.
//
//

#ifndef Scheduler_h
#define Scheduler_h

#include <map>
#include <vector>

#include "Algorithm.hpp"

class Scheduler {
private:
    int maxJobNum;
    int currentJobNum;
    std::map<int, Algorithm> algorithms;    // indexed by jobNum
    
    // Socket stuff
    
public:
    bool train(int);
    // trains the algorithm associated with the given jobNum
    
    float checkStatus(int);
    // Returns a status code for the given jobNum
    
    //std::string predict(int)
    // Not sure what this is for
    
    // Socket stuff
};


#endif /* Scheduler_h */
