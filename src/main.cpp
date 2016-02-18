#include <iostream>
#include <Eigen/Dense>

#include "model/LinearRegression.hpp"
#include "algorithm/ProximalGradientDescent.hpp"
#include "IO/FileIO.hpp"
//#include "DataBaseCommunicator.hpp"
#include "json/JsonCoder.hpp"

using namespace Eigen;
using namespace std;
int main()
{
    //    used for test these methods
/*
    string path1 = "/home/haohanwang/CLion/Algorithms/sampleData/matrix.csv";
    string path2 = "/home/haohanwang/CLion/Algorithms/sampleData/vector.csv";

    MatrixXd X= FileIO::getInstance().readMatrixFile(path1);
    //VectorXd y= FileIO::getInstance().readVectorFile(path2);

    cout << X <<endl;
    //cout << y <<endl;

    float lr = 0.01;
    float lambda = 0.01;

    LinearRegression LR = LinearRegression();
    LR.setX(X);
    LR.setY(y);
    ProximalGradientDescent pgd = ProximalGradientDescent();
    //pgd.run(LR);
    //VectorXd beta = LR.getBeta();
    cout << beta << endl;

    string mat = JsonCoder::getInstance().encodeMatrix(X);
    cout<<mat<<endl;

    mainMessage mm;
    mm.command = 1;
    mm.detailedMessage = mat;

    string mmt = JsonCoder::getInstance().encodeMainMessage(mm);
    cout << mmt << endl;
    mainMessage m2 = JsonCoder::getInstance().decodeMainMessage(mmt);
    cout << m2.command <<endl;
    cout << m2.detailedMessage<<endl;*/

}
