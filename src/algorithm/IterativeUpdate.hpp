//
// Created by haohanwang on 1/31/16.
//

#ifndef ALGORITHMS_ITERATIVEUPDATE_HPP
#define ALGORITHMS_ITERATIVEUPDATE_HPP

#include <map>

#include "Algorithm.hpp"
#include "../model/TreeLasso.hpp"

using namespace std;

class IterativeUpdate : public Algorithm{
private:
    double residue;
    double prev_residue;
    double tol;
public:
    IterativeUpdate();
    IterativeUpdate(const unordered_map<string, string>&);

    void setTolerance(double);

    void run(TreeLasso*);
    void stop();
};


#endif //ALGORITHMS_ITERATIVEUPDATE_HPP
