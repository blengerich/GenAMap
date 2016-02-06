//
// Created by haohanwang on 2/2/16.
//

#ifndef ALGORITHMS_MULTIPOPLASSO_HPP
#define ALGORITHMS_MULTIPOPLASSO_HPP

#include "Model.hpp"

class MultiPopLasso : public Model {
private:
    double lambda;
    VectorXd population;

    double groupPenalization();
public:
    void setLambda(double);
    void setPopulation(VectorXd);
    double cost();
};


#endif //ALGORITHMS_MULTIPOPLASSO_HPP
