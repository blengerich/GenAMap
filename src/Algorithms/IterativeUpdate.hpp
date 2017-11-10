//
// Created by haohanwang on 1/31/16.
//

#ifndef ALGORITHMS_ITERATIVEUPDATE_HPP
#define ALGORITHMS_ITERATIVEUPDATE_HPP

#include <map>
#include <memory>

#include "Algorithm.hpp"
#include "../Models/TreeLasso.hpp"

using namespace std;

class IterativeUpdate : public Algorithm{
private:
    float residue;
    float prev_residue;
    float tol;

    static constexpr float default_tolerance = 1e-5;

public:
    IterativeUpdate();
    IterativeUpdate(const unordered_map<string, string>&);

    void setTolerance(float);
    void assertReadyToRun();
    void run(shared_ptr<Model>);
    void run(shared_ptr<TreeLasso>);
    void stop();
};


#endif //ALGORITHMS_ITERATIVEUPDATE_HPP
