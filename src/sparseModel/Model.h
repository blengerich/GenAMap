//
// Created by haohanwang on 3/25/16.
//

#ifndef GENAMAP_V2_MODEL_H
#define GENAMAP_V2_MODEL_H

#include <Eigen/Sparse>

using namespace Eigen;

class Model {
protected:
    SparseMatrix<double>  X;
    SparseMatrix<double>  beta;
    SparseMatrix<double>  y;
public:
    void setX(SparseMatrix<double> );
    void setY(SparseMatrix<double> );
    void initBeta();
    void initBeta(SparseMatrix<double> );
    void updateBeta(SparseMatrix<double> );
    SparseMatrix<double>  getX();
    SparseMatrix<double>  getBeta();
    SparseMatrix<double>  getY();

    SparseMatrix<double>  predict();
    SparseMatrix<double>  predict(SparseMatrix<double> );

    virtual SparseMatrix<double>  derivative();
    virtual SparseMatrix<double>  proximal_derivative();
    virtual SparseMatrix<double>  proximal_operator(SparseMatrix<double> , float);

    virtual double cost();

    Model();
//    Model(SparseMatrix<double> , VectorXd);

    virtual ~Model(){};
};


#endif //GENAMAP_V2_MODEL_H
