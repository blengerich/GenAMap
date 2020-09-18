//
// Created by haohanwang on 3/25/16.
//

#ifndef GENAMAP_V2_MODEL_H
#define GENAMAP_V2_MODEL_H

#include <Eigen/Sparse>

using namespace Eigen;

class Model {
protected:
    SparseMatrix<float>  X;
    SparseMatrix<float>  beta;
    SparseMatrix<float>  y;
public:
    void setX(SparseMatrix<float> );
    void setY(SparseMatrix<float> );
    void initBeta();
    void initBeta(SparseMatrix<float> );
    void updateBeta(SparseMatrix<float> );
    SparseMatrix<float>  getX();
    SparseMatrix<float>  getBeta();
    SparseMatrix<float>  getY();

    SparseMatrix<float>  predict();
    SparseMatrix<float>  predict(SparseMatrix<float> );

    virtual SparseMatrix<float>  derivative();
    virtual SparseMatrix<float>  proximal_derivative();
    virtual SparseMatrix<float>  proximal_operator(SparseMatrix<float> , float);

    virtual float cost();

    Model();
    virtual ~Model(){};
};


#endif //GENAMAP_V2_MODEL_H
