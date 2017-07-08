//
// Created by haohanwang on 7/8/17.
//

#ifndef GENAMAP_V2_PLINKREADER_H
#define GENAMAP_V2_PLINKREADER_H

#include <plinkio/plinkio.h>

#include <Eigen/Dense>
#include <iostream>
#include <fstream>
using namespace Eigen;
using namespace std;

class PlinkReader {
private:
    PlinkReader(){};
    PlinkReader(PlinkReader const &);  // don't implement
    void operator=(PlinkReader const &); // don't implement
    struct pio_file_t plink_file;
    snp_t *snp_buffer;
    int sample_id;
    int locus_id;
public:
    static PlinkReader &getInstance() {
        static PlinkReader instance;
        return instance;
    }

    void readData(string);
};


#endif //GENAMAP_V2_PLINKREADER_H
