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
using namespace boost::math;

FaSTLMM::FaSTLMM() {
    U = MatrixXd::Zero(1,1);
    S = MatrixXd::Zero(1,1);
    initTrainingFlag = false;
}

FaSTLMM::FaSTLMM(const unordered_map<string, string> &options) {
    U = MatrixXd::Zero(1,1);
    S = MatrixXd::Zero(1,1);
    initTrainingFlag = false;
}

// Functions for Scheduler::set

void FaSTLMM::setX(MatrixXd inputX) {
    X = inputX;
}

void FaSTLMM::setY(MatrixXd inputY) {
    y = inputY;
}

void FaSTLMM::setAttributeMatrix(const string& str, MatrixXd* Z) {
    if (str == "setX") {
        setX(*Z);
    } else if (str == "setY") {
        setY(*Z);
    } else {
        std::clog << "Linear mixed models have no attribute with name " << str << endl;
    }
}

/* For Test Begins */

double FaSTLMM::get_ldelta0() {
    return ldelta0;
}

double FaSTLMM::get_nllmin() {
    return nllMin;
}

MatrixXd FaSTLMM::get_SUX() {
    return SUX;
}

MatrixXd FaSTLMM::get_SUy() {
    return SUy;
}

MatrixXd FaSTLMM::get_SUX0() {
    return SUX0;
}

/* For Test Ends */

void FaSTLMM::assertReadyToRun() {

}

// Get the Eigen-Decomposition K = U S U_t by SVD on X = U S_sqrt V
void FaSTLMM::decompose() {
    JacobiSVD<MatrixXd> svd(X, ComputeFullU);
    U = svd.matrixU();
    MatrixXd SV = svd.singularValues().array().square();
    long rank = SV.rows();
    S.resize(ns, 1);
    // low rank
    if (rank < ns) {
        long diff = ns - rank;
        S << SV,
             MatrixXd::Zero(diff, 1);
    }
    else {
        S = SV;
    }
}

// Initiate ns, nf, X0, S, U
void FaSTLMM::init(MatrixXd inputX, MatrixXd inputY) {
    if (!initTrainingFlag) {
        this->setX(inputX);
        this->setY(inputY);
        ns = X.rows();
        nf = X.cols();
        X0 = MatrixXd::Ones(ns,1);
        decompose();
        Uy = U.transpose()*y;
        initTrainingFlag = true;
    }
}

// cost function
double FaSTLMM::objective(double ldelta) {
    double delta = exp(ldelta);
    MatrixXd Sd = S.array() + delta;
    double ldet = Sd.array().log().matrix().sum();
    MatrixXd Sdi = Sd.array().inverse();
    double ss = 1.0 / ns * (Uy.cwiseProduct(Uy).cwiseProduct(Sdi).sum());
    double nLL = 0.5 * (ns * log(2 * M_PI) + ldet + ns + ns * log(ss));
    return nLL;
}

/* Do Brent Search on the negative of log-likelihood of the null model to get the optimal delta 
   and the corresponding minimum -log-likelihood of null model.
 */
void FaSTLMM::trainNullModel(double intervalNum, double ldeltaMin, double ldeltaMax) {
    VectorXd nllGrid = VectorXd::Ones(intervalNum + 1);
    VectorXd ldeltaGrid = (VectorXd::LinSpaced(intervalNum + 1, 0, intervalNum) / intervalNum * (ldeltaMax - ldeltaMin)).array() + ldeltaMin;
    for (long i = 0; i <= intervalNum; i++) {
        nllGrid(i) = this->objective(ldeltaGrid(i));
    }
    MatrixXf::Index minRow;
    nllMin = nllGrid.minCoeff(&minRow);
    ldelta0 = ldeltaGrid(minRow);
    double ldeltaOpt, nllOpt;
    class Objective : public brent::func_base {
        private:
            MatrixXd X, y;
        public:
            Objective(MatrixXd M1, MatrixXd M2): X(M1), y(M2) {}
            virtual double operator() (double x) {
                FaSTLMM flmm = FaSTLMM();
                flmm.init(X, y);
                return flmm.objective(x);
            }
    };
    Objective obj = Objective(X, y);
    for (long i = 1; i < intervalNum; i++) {
        if ( (nllGrid(i) < nllGrid(i - 1)) && (nllGrid(i) < nllGrid(i + 1)) ) {
            nllOpt = brent::local_min(ldeltaGrid(i - 1), ldeltaGrid(i + 1), 1.0E-11, obj, ldeltaOpt);
            if (nllOpt < nllMin) {
                nllMin = nllOpt;
                ldelta0 = ldeltaOpt;
            }
        }
    }
}

Vector2d FaSTLMM::tstat(double beta, double var, double sigma, double df) {
    double ts = beta/sqrt(var*sigma);
    students_t t_dist(df);
    double tail_quantile = cdf(complement(t_dist, abs(ts)));
    double ps = 2*tail_quantile;
    Vector2d result;
    result(0) = ts;
    result(1) = ps;
    return result;
}

// https://fuyunfei1.gitbooks.io/c-tips/content/pinv_with_eigen.html
// Compute the (Moore-Penrose) pseudo-inverse of a matrix.
template<typename _Matrix_Type_>
_Matrix_Type_ pseudoInverse(const _Matrix_Type_ &a, double epsilon = std::numeric_limits<double>::epsilon())
{
    Eigen::JacobiSVD< _Matrix_Type_ > svd(a ,Eigen::ComputeThinU | Eigen::ComputeThinV);
    double tolerance = epsilon * std::max(a.cols(), a.rows()) *svd.singularValues().array().abs()(0);
    return svd.matrixV() *  (svd.singularValues().array().abs() > tolerance).select(svd.singularValues().array().inverse(), 0).matrix().asDiagonal() * svd.matrixU().adjoint();
}

// For every SNP, find its beta, variance of beta, do t-test and output the p-values.
VectorXd FaSTLMM::hypothesis_test(MatrixXd SUX, MatrixXd SUy, MatrixXd X, MatrixXd SUX0) {
    VectorXd p;
    p.resize(nf);
    for (int i=0; i < nf; i++) {
        MatrixXd UXi;
        UXi.resize(ns, 2);
        UXi << SUX0, SUX.col(i);
        MatrixXd XX = UXi.transpose()*UXi; // dimension is always 2*2
        MatrixXd XX_i = pseudoInverse(XX); // XX_i[1, 1] is variance of beta
        MatrixXd beta = (XX_i*UXi.transpose())*SUy; // dimension is always 2*1
        MatrixXd Uyr = SUy - (UXi*beta);
        double Q = (Uyr.transpose()*Uyr)(0, 0);
        double sigma = Q/ns; // genetic variance sigma_g
        Vector2d tp = this->tstat(beta(1, 0), XX_i(1, 1), sigma, ns-1);
        double ts = tp(0);
        double ps = tp(1);
        if ((ts > -1e10) && (ts < 1e10)) p(i) = ps;
        else p(i) = 1;
    }
    return p;
}


void FaSTLMM::train(double intervalNum, double ldeltaMin, double ldeltaMax) {
    this->trainNullModel(intervalNum, ldeltaMin, ldeltaMax);
    delta0 = exp(ldelta0);
    VectorXd Sdi = (S.array() + delta0).inverse();
    VectorXd SdiSqrt = Sdi.array().sqrt();
    SUX = U.transpose() * X;
    SUX = (SUX.transpose() * SdiSqrt.asDiagonal()).transpose();
    SUy = U.transpose() * y;
    SUy = SUy.cwiseProduct(SdiSqrt);
    SUX0 = U.transpose() * X0;
    SUX0 = SUX0.cwiseProduct(SdiSqrt);
    // Hypothesis Testing on beta
    VectorXd p = this->hypothesis_test(SUX, SUy, X, SUX0);
}






