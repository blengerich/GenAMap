//
// Created by haohanwang on 1/24/16.
//

#include <Eigen/Dense>
#include <unordered_map>
#include <queue>

using namespace Eigen;
using namespace std;

#ifndef ALGORITHMS_MODEL_HPP
#define ALGORITHMS_MODEL_HPP


typedef unsigned int model_id_t;

struct modelResult{
    string rowStr;
    string colStr;
    MatrixXf beta;
};

class Model {
protected:
    MatrixXf X;
    MatrixXf beta;
    MatrixXf y;
public:
    void setX(const MatrixXf&);
    void setY(const MatrixXf&);
    virtual void setAttributeMatrix(const string&, MatrixXf*);
    void initBeta();
    void initBeta(MatrixXf);
    void updateBeta(MatrixXf);
    MatrixXf getX();
    MatrixXf getBeta();
    MatrixXf getY();
    modelResult getClusteringResult(); // Scheduler needs to run model.getClusteringResult() for the result, instead of getBeta();

    MatrixXf predict();
    MatrixXf predict(MatrixXf);
    
    virtual void assertReadyToRun(){};
    virtual MatrixXf derivative();
    virtual MatrixXf proximal_derivative();
    virtual MatrixXf proximal_operator(MatrixXf, float);

    virtual double cost();

    Model();
    Model(const unordered_map<string, string>&);
    Model(MatrixXf, VectorXd);

    virtual ~Model(){};
};


#endif //ALGORITHMS_MODEL_HPP
