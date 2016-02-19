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

#include "algorithm/Algorithm.hpp"

class Scheduler {
/* Class to run jobs and get information about the currently running jobs.
	The first class on the C++ side.
*/


public:
	static Scheduler* Instance();	// Singleton

    bool train(int);
    // trains the algorithm associated with the given jobNum
    
    bool cancel(int);
    // cancels the algorithm associated with the given jobNum

    double checkStatus(int);
    // Returns a status code for the given jobNum
    

    //std::string predict(int)
    // Not sure what this is for
    
    // Socket stuff

protected:
	// Singleton constructors must be protected or private
	Scheduler(){};
	Scheduler(Scheduler const&){};
	Scheduler& operator=(Scheduler const&){};

private:
    static Scheduler* s_instance;	// Singleton

    int maxJobNum;
    int currentJobNum;
    std::map<int, Algorithm*> algorithms;    // indexed by jobNum
    
    // Socket stuff
    
};


#endif /* Scheduler_h */
