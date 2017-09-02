//
// Created by haohanwang on 7/8/17.
//
#include <string>

#include "PlinkReader.h"
#include "FileIO.hpp"

void PlinkReader::readData(string filename) {
    if( pio_open( &plink_file, filename.c_str() ) != PIO_OK )
    {
        printf( "Error: Could not open file" );
    }

    if( !pio_one_locus_per_row( &plink_file ) )
    {
        printf( "This script requires that snps are rows and samples columns.\n" );
    }

    locus_id = 0;
    snp_buffer = (snp_t *) malloc(pio_row_size( &plink_file ));

    long m = pio_num_samples( &plink_file );
    long n = pio_num_loci(&plink_file );

    MatrixXf X = MatrixXf::Zero(m, n);
    vector<string> markers(n);

    while( pio_next_row( &plink_file, snp_buffer ) == PIO_OK )
    {
        for( sample_id = 0; sample_id < pio_num_samples( &plink_file ); sample_id++)
        {
            X(sample_id,locus_id)=snp_buffer[ sample_id ];
        }
        markers[locus_id]=pio_get_locus( &plink_file, locus_id )->name;
        locus_id++;
    }

    free( snp_buffer );
    pio_close( &plink_file );

    MatrixXf y = MatrixXf::Zero(m, 1);
    string tmp = filename + ".fam";
    const char *fileName = tmp.c_str();
    ifstream infile;
    infile.open(fileName);
    string line;
    long m0 = 0;
    while (getline(infile, line)){
        vector<string> values = FileIO::getInstance().split(line, " ");
        y(m0, 0) = stof(values[values.size() - 1]);
        m0 += 1;
    }
    infile.close();
}

void PlinkReader::getX(string filename, MatrixXf &X)
{
    if( pio_open( &plink_file, filename.c_str() ) != PIO_OK )
    {
        printf( "Error: Could not open file" );
    }

    if( !pio_one_locus_per_row( &plink_file ) )
    {
        printf( "This script requires that snps are rows and samples columns.\n" );
    }

    locus_id = 0;
    snp_buffer = (snp_t *) malloc( pio_row_size( &plink_file ) );

    long m = pio_num_samples( &plink_file );
    long n = pio_num_loci(&plink_file );

    X = MatrixXf::Zero(m, n);
    vector<string> markers(n);

    while(pio_next_row( &plink_file, snp_buffer ) == PIO_OK )
    {
        for( sample_id = 0; sample_id < pio_num_samples( &plink_file ); sample_id++)
        {
            if (snp_buffer[sample_id] == 3) X(sample_id, locus_id) = 0;
            else X(sample_id, locus_id) = snp_buffer[sample_id];
        }
        locus_id++;
    }

    free( snp_buffer );
    pio_close( &plink_file );
}

void PlinkReader::getXname(string filename, vector<string> &markers)
{
    if( pio_open( &plink_file, filename.c_str() ) != PIO_OK )
    {
        printf( "Error: Could not open file" );
    }

    if( !pio_one_locus_per_row( &plink_file ) )
    {
        printf( "This script requires that snps are rows and samples columns.\n" );
    }

    locus_id = 0;
    snp_buffer = (snp_t *) malloc( pio_row_size( &plink_file ) );

    long m = pio_num_samples( &plink_file );
    long n = pio_num_loci(&plink_file );
    markers.resize(n);

    while( pio_next_row( &plink_file, snp_buffer ) == PIO_OK )
    {
        markers[locus_id]=pio_get_locus( &plink_file, locus_id )->name;
        locus_id++;
    }

    free( snp_buffer );
    pio_close( &plink_file );

}

void PlinkReader::getY(string filename, MatrixXf &y)
{
    if( pio_open( &plink_file, filename.c_str() ) != PIO_OK )
    {
        printf( "Error: Could not open file" );
    }

    if( !pio_one_locus_per_row( &plink_file ) )
    {
        printf( "This script requires that snps are rows and samples columns.\n" );
    }

    locus_id = 0;
    snp_buffer = (snp_t *) malloc( pio_row_size( &plink_file ) );

    long m = pio_num_samples( &plink_file );

    y = MatrixXf::Zero(m, 1);
    string tmp = filename + ".fam";
    const char *fileName = tmp.c_str();
    ifstream infile;
    infile.open(fileName);
    string line;
    long m0 = 0;
    while (getline(infile, line)){
        vector<string> values = FileIO::getInstance().split(line, " ");
        y(m0, 0) = stof(values[values.size()-1]);
        m0 += 1;
    }

    infile.close();
    free( snp_buffer );
    pio_close( &plink_file );
}
