//
// Created by haohanwang on 6/14/16.
//

#ifndef GENAMAP_V2_SPARSELMM_H
#define GENAMAP_V2_SPARSELMM_H


#include "LinearMixedModel.hpp"

class SparseLMM : public LinearMixedModel{
private:
    float l1Reg;
    MatrixXf rX;
    MatrixXf rY;

    static constexpr float default_l1Reg = 0.0;
public:
    SparseLMM();
    SparseLMM(const unordered_map<string, string>& options);

    void rotateXY(float);
    MatrixXf getRotatedX();
    MatrixXf getRoattedY();

    void setL1reg(float);
    float getL1reg();
};


#endif //GENAMAP_V2_SPARSELMM_H
