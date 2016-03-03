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
    void setTolerance(double);

    void run(TreeLasso*);

    IterativeUpdate();
    IterativeUpdate(const map<string, string>& options);
};


#endif //ALGORITHMS_ITERATIVEUPDATE_HPP
