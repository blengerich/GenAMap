//
// Created by haohanwang on 1/31/16.
//

#ifndef ALGORITHMS_ITERATIVEUPDATE_HPP
#define ALGORITHMS_ITERATIVEUPDATE_HPP

#include <map>

#include "Algorithm.hpp"
#include "../Models/TreeLasso.hpp"

using namespace std;

class IterativeUpdate : public Algorithm{
private:
    double residue;
    double prev_residue;
    double tol;

    static constexpr double default_tolerance = 1e-5;

public:
    IterativeUpdate();
    IterativeUpdate(const unordered_map<string, string>&);

    void setTolerance(double);
    void assertReadyToRun();
    void run(TreeLasso*);
    void stop();
};


#endif //ALGORITHMS_ITERATIVEUPDATE_HPP
