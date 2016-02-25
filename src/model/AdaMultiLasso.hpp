//
// Created by haohanwang on 2/24/16.
//

#ifndef GENAMAP_V2_ADAMULTILASSO_HPP
#define GENAMAP_V2_ADAMULTILASSO_HPP

#include "model/Model.hpp"
#include <iostream>

class AdaMultiLasso : public Model{
private:
    double lambda1;
    double lambda2;
    MatrixXd snpsFeature1;
    MatrixXd snpsFeature2;

    VectorXd w;
    VectorXd v;

    double penalty_cost();

public:
    AdaMultiLasso();
    void setLambda1(double);
    void setLambda2(double);

    void setSnpsFeature1(MatrixXd);
    void setSnpsFeature2(MatrixXd);
    MatrixXd getSnpsFeature1();
    MatrixXd getSnpsFeature2();
    VectorXd getW();
    VectorXd getV();

    VectorXd getTheta();
    VectorXd getRho();

    void setX(MatrixXd);
    void setY(MatrixXd);
    void setXY(MatrixXd, MatrixXd);
    void initBeta();

    double cost();
};


#endif //GENAMAP_V2_ADAMULTILASSO_HPP
