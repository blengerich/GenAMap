//
// Created by aditya gautam on 2/22/16.
//
#include "GFlasso.h"

using namespace Eigen;
// Constructors with different parameters provided
Gflasso::Gflasso() {
    corr_coff = MatrixXd::Random(MAX_TRAITS,MAX_TRAITS);
    corr_coff.setZero();
    lambda_flasso = 0.0;
    gamma_flasso = 0.0;
    flasso_type = GcFlasso;
}

Gflasso::Gflasso(double lambda,double gamma){
    corr_coff = MatrixXd::Random(MAX_TRAITS,MAX_TRAITS);
    corr_coff.setZero();
    lambda_flasso = lambda;
    gamma_flasso = gamma;
    flasso_type = GcFlasso;
}

Gflasso::Gflasso(MatrixXd corr_coff,double lambda,double gamma){
    this->corr_coff = corr_coff;
    gamma_flasso = gamma;
    lambda_flasso = lambda;
}

// Setting and getting various params of GFLasso model
void Gflasso::set_params(double lambda,double gamma){
    lambda_flasso = lambda;
    gamma_flasso = gamma;
}

vector<double> Gflasso::get_params(){
    vector<double> params;
    params.push_back(this->lambda_flasso);
    params.push_back(this->gamma_flasso);
    return params;
}

void Gflasso::set_lambda(double lambda){
    this->lambda_flasso = lambda;
}

void Gflasso::set_gamma(double gamma){
    this->gamma_flasso = gamma;
}

double Gflasso::get_lambda(){
    return (this->lambda_flasso);
}

double Gflasso::get_gamma(){
    return (this->gamma_flasso);
}

void Gflasso::set_flasso_type(int type){
    this->flasso_type = type;
}

int Gflasso::get_flasso_type() {
    return flasso_type;
}

void Gflasso::set_mau(double mau){
     this->mau = mau;
}

double Gflasso::get_mau() {
    return mau;
}

// Training functions : X,Y and other parameters
void Gflasso::train(){
    cout << " Error : No Parameters are provided. Cannot perform GFLasso regression !" <<endl;
}

void Gflasso::train(MatrixXd X,MatrixXd Y){
    cout << "Training set X and Y is provided !" << endl;
    this->X = X;
    this->Y = Y;
    int row =0, col =0;
    row = X.cols();
    col = Y.rows();

    // Initialize beta to some random values
    this->beta = MatrixXd::Random(row,col);
}

// Training data provided along with initial beta estimation
void Gflasso::train(MatrixXd X,MatrixXd Y,MatrixXd Beta){
    this->X = X;
    this->Y = Y;
    this->beta = Beta;
}

// Everything is provided i.e. Training data,traits corr. and regularization params
void Gflasso::train(MatrixXd X,MatrixXd Y,MatrixXd corr_coeff,double lamdba,double gamma){
    this->X = X;
    this->Y = Y;
    this->corr_coff = corr_coff;
    this->lambda_flasso = lamdba;
    this->gamma_flasso = gamma;
}

// Helper functions to calculate the Cost function
double Gflasso::gflasso_fusion_penalty(){

    int num_rows = corr_coff.rows(),num_cols = corr_coff.cols(),sign=1,mul_factor = 1;
    double total_sum = 0.0;

    // Go through each edge of the corr_coff matrix(graph)
    for(int start_node=0;start_node<num_rows;start_node++) {

        for (int end_node = 0; end_node < num_cols; end_node++) {

            if (corr_coff(start_node, end_node) == 0)
                continue;
            else if (corr_coff(start_node, end_node) < 0)
                sign = -1;
            else
                sign = 1;

            mul_factor=1;
            if(this->flasso_type==GwFlasso) {
                mul_factor = corr_coff(start_node, end_node);
            }

            //  Beta is N*J matrix, where N are the number of input sample and J aer the no. of features in Y.
            total_sum = mul_factor*abs(beta.col(start_node).sum() - sign * beta.col(end_node).sum());
        }
    }

    return total_sum;
}

// Cost function of GFlasso
double Gflasso::cost(){

    return (
            (Y - X * beta).squaredNorm() +
            lambda_flasso*(beta.cwiseAbs().sum()) +
            gamma_flasso*(gflasso_fusion_penalty())
    );
}

// Support for Smoothing Proximal Gradient Method

/*
 * This function will give the number of edges present int the original
 * correlation coeff. matrix which determines the level of correlation
 * between different features of Y.
 * This value will be used in determining the size of other matrixes,
 * which will be used in the calculating the gradient.
 */
int Gflasso::get_num_edges(){

    int row=corr_coff.rows(), col = corr_coff.cols(),row_idx=0,col_idx=0,count=0;

    for(row_idx=0;row_idx<row;row_idx++) {
        for(col_idx=0;col_idx<col;col_idx++) {
            if (corr_coff(row_idx, col_idx) != 0){
                count++;
            }
        }
    }

    return count;
}

/* Edge Vertex matrix is used in the calculation of gradient and is corresponding
 * to the other(Matrix) form of the Fusion Penalty calculated above
 *
 * Size of this matrix is E*M, where E is the number of Edges in the
 * Initial correlation coeff. matrix and M in the number of features in
 * the Input i.e. Beta Matrix row size
 * */
void Gflasso::update_edge_vertex_matrix(){

    // Initialize the matrix size based on the input parameters
    this->edge_vertex_matrix = MatrixXd::Random(this->get_num_edges(),beta.rows());
    edge_vertex_matrix.setZero();

    // For each edge, just fill only two values i.e the column corresponding to edge
    int num_rows = (this->corr_coff).rows(),num_cols = (this->corr_coff).cols(),sign=1,present_row=0;

    // Go through each edge of the corr_coff matrix(graph)
    for(int start_node=0;start_node<num_rows;start_node++) {

        for (int end_node = 0; end_node < num_cols; end_node++) {

            if (corr_coff(start_node, end_node) == 0)
                continue;
            else if (corr_coff(start_node, end_node) < 0)
                sign = -1;
            else
                sign = 1;

            /* we have a edge now, fill one row of the edge vertex matrix */
            // Go through each column of this row and check if edge = col index
            for(int i=0;i<beta.rows();i++){

                if(i==start_node){
                    edge_vertex_matrix(present_row,i)=abs(corr_coff(start_node, end_node))*gamma_flasso;
                } else if(i==end_node){
                    edge_vertex_matrix(present_row,i)=-sign*abs(corr_coff(start_node, end_node))*gamma_flasso;
                }
            }

            present_row++;
        }
    }
}

void Gflasso::update_alpha_matrix(){

     // Alpha Matrix is S(CB/mau), where C is a edge_vertex matrix and B is the beta matrix
     // Mau is the smoothing parameter
    alpha_matrix = MatrixXd::Random(get_num_edges(),beta.cols());
    alpha_matrix.setZero();

    alpha_matrix = edge_vertex_matrix*beta;
    alpha_matrix = alpha_matrix/mau;
    int num_row = alpha_matrix.rows(),num_col = alpha_matrix.cols(),alpha_val=0;

    for(int row_idx=0;row_idx<num_row;row_idx++){

        for(int col_idx=0;col_idx<num_col;col_idx++){

            alpha_val = alpha_matrix(row_idx,col_idx);

            if(alpha_val >=1){
                alpha_matrix(row_idx,col_idx) = 1;
            }else if(alpha_val <= -1){
                alpha_matrix(row_idx,col_idx) = -1;
            }
        }
    }

}

/* This functions returns the gradient of Lipschitz.
 * This output matrix dimensions are M*J.
 * M is the number of features in the input variable
 * J is the number of features on the output variable.
 */
MatrixXd Gflasso::gradient_descent(){

    /* First calculate the Edge vertex and Alpha Matrix */
    update_edge_vertex_matrix();
    update_alpha_matrix();

    return ( (X.transpose())*(X*beta - Y) + (edge_vertex_matrix.transpose()*alpha_matrix) );
}
