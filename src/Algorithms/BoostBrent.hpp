/*
 * BoostBrent.hpp
 *
 * Created on: April 10, 2017
 * Author: Jie Xie (jiexie@andrew.cmu.edu)
 */

#ifndef ALGORITHMS_BOOSTBRENT_HPP
#define ALGORITHMS_BOOSTBRENT_HPP

#ifdef BAZEL
#include "Algorithms/Algorithm.hpp"
#include "Models/lmm.hpp"
#else
#include "Algorithm.hpp"
#include "../Models/lmm.hpp"
#endif

using namespace std;

class BoostBrent : public Algorithm {

private:

    float ldelta_start;
    float ldelta_end;
    float ldelta_interval;

    static constexpr float default_ldelta_start = -5;
    static constexpr float default_ldelta_end = 5;
    static constexpr float default_ldelta_interval = 500;

public:

    BoostBrent();
    BoostBrent(const unordered_map<string, string>);

    void set_ldelta_start(float);
    void set_ldelta_end(float);
    void set_ldelta_interval(float);

    float get_ldelta_start();
    float get_ldelta_end();
    float get_ldelta_interval();

    void run(Model*);
    void run(FaSTLMM*);

};

#endif


