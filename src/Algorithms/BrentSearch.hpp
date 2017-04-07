#ifndef ALGORITHMS_BRENTSEARCH_HPP
#define ALGORITHMS_BRENTSEARCH_HPP

#include <iostream>
#include <vector>
#include <math.h>
#include <cstdlib>
#include <iostream>
#include <memory>

#ifdef BAZEL
#include "Algorithms/Algorithm.hpp"
#include "Models/LinearMixedModel.hpp"
#else
#include "Algorithm.hpp"
#include "AlgorithmOptions.hpp"
#include "../Models/LinearMixedModel.hpp"
#endif

using namespace std;

class BrentSearch:public Algorithm{

private :
    float a; // start of the search
    float b; // End point of the search
    float c; // Prior value/estimate of least value
    float m; // Positive tolerance
    float e; // Positive tolerance error
    float t;
    float min_val; // Minimum value of the objective function
    float min_val_param; // Search parameter at which the value is minimum
    float delta; // 2*Delta window will be set based on the optimal Grid Search result.

    static constexpr float default_a = 0.0;
    static constexpr float default_b = 0.0;
    static constexpr float default_c = 0.0;
    static constexpr float default_m = 0.0;
    static constexpr float default_e = 0.0;
    static constexpr float default_t = 0.0;
    static constexpr float default_delta = 0.5; // Default window size = 1

public :
    BrentSearch();
    BrentSearch(const unordered_map<string, string>&);

    // Setters and Getters
    void set_a(float);
    void set_b(float);
    void set_c(float);
    void set_m(float);
    void set_e(float);
    void set_t(float);
    void set_delta(float);
    void set_min_cost_val(float);
    void set_best_param_val(float);

    float get_a();
    float get_b();
    float get_c();
    float get_m();
    float get_e();
    float get_t();
    float get_delta();
    float get_min_cost_val();
    float get_best_param_val();

    // Extract Brent search parameters from vector
    vector<float> get_brent_params();

    void run(shared_ptr<Model>);
    // Run LLM model object pointer
    void sub_run(shared_ptr<LinearMixedModel>);
};

#endif
