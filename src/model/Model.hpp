//
// Created by haohanwang on 1/24/16.
//

#include <Eigen/Dense>
#include <unordered_map>

using namespace Eigen;
using namespace std;

#ifndef ALGORITHMS_MODEL_HPP
#define ALGORITHMS_MODEL_HPP

class Model {
protected:
    MatrixXd X;
    MatrixXd beta;
    MatrixXd y;
public:
    void setX(const MatrixXd&);
    void setY(const MatrixXd&);
    void initBeta();
    void initBeta(MatrixXd);
    void updateBeta(MatrixXd);
    MatrixXd getX();
    MatrixXd getBeta();
    MatrixXd getY();

    MatrixXd predict();
    MatrixXd predict(MatrixXd);

    virtual MatrixXd derivative();
    virtual MatrixXd proximal_derivative();
    virtual MatrixXd proximal_operator(MatrixXd, float);

    virtual double cost();

    Model();
    Model(const unordered_map<string, string>&);
    Model(MatrixXd, VectorXd);

    virtual ~Model(){};
};


#endif //ALGORITHMS_MODEL_HPP
