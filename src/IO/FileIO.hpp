//
// Created by haohanwang on 1/24/16.
//

#ifndef ALGORITHMS_FILEIO_HPP
#define ALGORITHMS_FILEIO_HPP

#include <iostream>
#include <vector>
#include <Eigen/Dense>
#include <unordered_map>
//#include "model/TreeLasso.hpp"

using namespace Eigen;
using namespace std;

struct docInfo{
    unsigned long row;
    unsigned long col;
};

class FileIO { //singleton class
private:
    string formats;
    FileIO() {formats = ".tsv, .csv"; };

    FileIO(FileIO const &);  // don't implement

    void operator=(FileIO const &); // don't implement

    vector<string> split(const string &, string);

    string checkFileFormat(string);

    docInfo countRowCol(string, string);

    unsigned long countColumn(string, string);

    void formatError();

    VectorXf decodeLine(string, string, unsigned long);

    string getNextToken(unsigned long, string);

//    Tree* readTreeFromParanthesis(string);

public:
    static FileIO &getInstance() {
        static FileIO instance;
        return instance;
    }

    MatrixXf readMatrixFile(string);

//    Tree* readTreeFile(string);

    void writeMatrixFile(string, MatrixXf);

    void writeVectorFile(string, VectorXf);

//    void writeTreeFile(string, Tree*);
};


#endif //ALGORITHMS_FILEIO_HPP
