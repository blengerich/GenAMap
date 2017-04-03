/*
 * lmm.cpp
 *
 * Created on: Feb 19, 2017
 * Author: Jie Xie (jiexie@andrew.cmu.edu)
 */

#include "lmm.hpp"
#include <stdexcept>

using namespace std;
using namespace Eigen;

FaSTLMM::FaSTLMM() {
    U = MatrixXf::Zero(1,1);
    S = MatrixXf::Zero(1,1);
    initTrainingFlag = false;
}

FaSTLMM::FaSTLMM(const unordered_map<string, string> &options) {
    U = MatrixXf::Zero(1,1);
    S = MatrixXf::Zero(1,1);
    initTrainingFlag = false;
}

void FaSTLMM::setX(MatrixXf inputX) {
    X = inputX;
}

void FaSTLMM::setY(MatrixXf inputY) {
    y = inputY;
}

void FaSTLMM::setAttributeMatrix(const string& str, MatrixXf* Z) {
    if (str == "setX") {
        setX(*Z);
    } else if (str == "setY") {
        setY(*Z);
    } else {
        std::clog << "Linear mixed models have no attribute with name " << str << endl;
    }
}

VectorXf FaSTLMM::getP() {
    return p;
}

MatrixXf FaSTLMM::getBeta() {
    return beta;
}

void FaSTLMM::assertReadyToRun() {

}

// Get the Eigen-Decomposition K = U S U_t by SVD on X = U S_sqrt V
void FaSTLMM::decompose() {
    JacobiSVD<MatrixXf> svd(X, ComputeFullU);
    U = svd.matrixU();
    MatrixXf SV = svd.singularValues().array().square();
    long rank = SV.rows();
    S.resize(ns, 1);
    // low rank
    if (rank < ns) {
        long diff = ns - rank;
        S << SV,
                   MatrixXf::Zero(diff, 1);
    }
    else {
        S = SV;
    }
}

// Initiate ns, nf, S, U
void FaSTLMM::init(MatrixXf inputX, MatrixXf inputY) {
    if (!initTrainingFlag) {
        this->setX(inputX);
        this->setY(inputY);
        ns = X.rows();
        nf = X.cols();
        decompose();
        initTrainingFlag = true;
    }
}

// cost function
float FaSTLMM::cost(float ldelta) {
    float delta = exp(ldelta);
    MatrixXf Sd = S.array() + delta;
    float ldet = Sd.array().log().matrix().sum();
    MatrixXf Sdi = Sd.array().inverse();
    MatrixXf Uy = U.transpose()*y;
    float ss = 1.0 / ns * (Uy.cwiseProduct(Uy).cwiseProduct(Sdi).sum());
    float nLL = 0.5 * (ns * log(2 * M_PI) + ldet + ns + ns * log(ss));
    return nLL;
}

/* Do Brent Search on the negative of log-likelihood of the null model to get the optimal delta 
   and the corresponding minimum -log-likelihood of null model.
 */
float FaSTLMM::trainNullModel(float intervalNum, float lo, float hi) {
    using namespace boost::math::tools;
    VectorXf nllGrid = VectorXf::Ones(intervalNum + 1);
    VectorXf ldeltaGrid = (VectorXf::LinSpaced(intervalNum + 1, 0, intervalNum) / intervalNum * (hi - lo)).array() + lo;
    for (long i = 0; i <= intervalNum; i++) {
        nllGrid(i) = this->cost(ldeltaGrid(i));
    }
    MatrixXf::Index minRow;
    float nllMin = nllGrid.minCoeff(&minRow);
    float ldeltaMin = ldeltaGrid(minRow);
    float ldeltaOpt, nllOpt;
    struct func {
        private: 
            MatrixXf X, y;
        public: 
            func(MatrixXf M1, MatrixXf M2): X(M1), y(M2) {}
            virtual float operator()(float x) {
                FaSTLMM flmm = FaSTLMM();
                flmm.init(X, y);
                return flmm.cost(x);
            }
    };
    int bits = std::numeric_limits<float>::digits;
    for (long i = 1; i < intervalNum; i++) {
        if ( (nllGrid(i) < nllGrid(i - 1)) && (nllGrid(i) < nllGrid(i + 1)) ) {
            std::pair<float, float> r = brent_find_minima(func(X, y), ldeltaGrid(i - 1), ldeltaGrid(i + 1), bits);
            ldeltaOpt = r.first;
            nllOpt = r.second;
            if (nllOpt < nllMin) {
                nllMin = nllOpt;
                ldeltaMin = ldeltaOpt;
            }
        }
    }
    return ldeltaMin;
}

Vector2f FaSTLMM::tstat(float beta, float var, float sigma, float df) {
    using namespace boost::math;
    float ts = beta/sqrt(var*sigma);
    students_t t_dist(df);
    float tail_quantile = cdf(complement(t_dist, abs(ts)));
    float ps = 2*tail_quantile;
    Vector2f result;
    result(0) = ts;
    result(1) = ps;
    return result;
}

// https://fuyunfei1.gitbooks.io/c-tips/content/pinv_with_eigen.html
// Compute the (Moore-Penrose) pseudo-inverse of a matrix.
template<typename _Matrix_Type_>
_Matrix_Type_ pseudoInverse(const _Matrix_Type_ &a, float epsilon = std::numeric_limits<float>::epsilon())
{
    Eigen::JacobiSVD< _Matrix_Type_ > svd(a ,Eigen::ComputeThinU | Eigen::ComputeThinV);
    float tolerance = epsilon * std::max(a.cols(), a.rows()) *svd.singularValues().array().abs()(0);
    return svd.matrixV() *  (svd.singularValues().array().abs() > tolerance).select(svd.singularValues().array().inverse(), 0).matrix().asDiagonal() * svd.matrixU().adjoint();
}

// For every SNP, find its beta, variance of beta, do t-test and output the p-values.
void FaSTLMM::hypothesis_test(MatrixXf SUX, MatrixXf SUy, MatrixXf SUX0) {
    p.resize(nf);
    for (int i=0; i < nf; i++) {
        MatrixXf UXi;
        UXi.resize(ns, 2);
        UXi << SUX0, SUX.col(i);
        MatrixXf XX = UXi.transpose()*UXi; // dimension is always 2*2
        MatrixXf XX_i = pseudoInverse(XX); // XX_i[1, 1] is variance of beta
        beta = (XX_i*UXi.transpose())*SUy; // dimension is always 2*1
        MatrixXf Uyr = SUy - (UXi*beta);
        float Q = (Uyr.transpose()*Uyr)(0, 0);
        float sigma = Q/ns; // genetic variance sigma_g
        Vector2f tp = this->tstat(beta(1, 0), XX_i(1, 1), sigma, ns-1);
        float ts = tp(0);
        float ps = tp(1);
        if ((ts > -1e10) && (ts < 1e10)) p(i) = ps;
        else p(i) = 1;
    }
}


void FaSTLMM::train(float intervalNum, float ldeltaMin, float ldeltaMax) {
    float delta0 = exp(this->trainNullModel(intervalNum, ldeltaMin, ldeltaMax));
    VectorXf Sdi = (S.array() + delta0).inverse();
    VectorXf SdiSqrt = Sdi.array().sqrt();
    MatrixXf SUX = U.transpose() * X;
    SUX = (SUX.transpose() * SdiSqrt.asDiagonal()).transpose();
    MatrixXf SUy = U.transpose() * y;
    SUy = SUy.cwiseProduct(SdiSqrt);
    MatrixXf X0 = MatrixXf::Ones(ns,1);
    MatrixXf SUX0 = U.transpose() * X0;
    SUX0 = SUX0.cwiseProduct(SdiSqrt);
    // Hypothesis Testing on beta
    this->hypothesis_test(SUX, SUy, SUX0);
}






