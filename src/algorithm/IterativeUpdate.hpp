//
// Created by haohanwang on 1/31/16.
//

#ifndef ALGORITHMS_ITERATIVEUPDATE_HPP
#define ALGORITHMS_ITERATIVEUPDATE_HPP

#include "Algorithm.hpp"
#include "../model/TreeLasso.hpp"

class IterativeUpdate : public Algorithm{
private:
    double residue;
    double prev_residue;
    double tol;
public:
    void setTolerance(double);

    void run(TreeLasso*);

    IterativeUpdate();
};


#endif //ALGORITHMS_ITERATIVEUPDATE_HPP
