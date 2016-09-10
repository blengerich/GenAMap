#include <zlib.h>
#include <iostream>
#include <string>
#include <string.h>
#include <stdio.h>
#include <typeinfo>
#include <unistd.h>
#include <vector>
#include <sstream>
#include <cstdlib>

#include <dirent.h>
// for sleep

#include <eigen3/Eigen/Dense>
 
#define GZ_BUF_SIZE 1048576
 
using namespace std;
using namespace Eigen;

bool gzLoad(char* gzfn, ::std::string &out){
    //open .gz file
    gzFile gzfp = gzopen(gzfn,"rb");
    if(!gzfp)
    {
        return false;
    }

    //read and add it to out
    unsigned char buf[GZ_BUF_SIZE];
    int have;
    // load GZ_BUF_SIZE one time
    while( (have = gzread(gzfp,buf,GZ_BUF_SIZE)) > 0)
    {
        out.append((const char*)buf,have);
    }
    //close .gz file
    gzclose(gzfp);
    return true;
}

vector<string> mysplit(string str, char delimiter) {
  vector<string> internal;
  stringstream ss(str); // Turn the string into a stream.
  string tok;
  
  while(getline(ss, tok, delimiter)) {
    internal.push_back(tok);
  }
  
  return internal;
}

vector<string> getfilename(){
    struct dirent *ptr;
    vector<string> filename;      
    DIR *dir;
    dir=opendir("./data");  
    while((ptr=readdir(dir))!=NULL){ 
        if(ptr->d_name[0] == '.')
            continue;
        filename.push_back(ptr->d_name);
    }  
    closedir(dir); 
    return filename;
}  

int getSnpNum(string path){
    string out;
    vector<string> filelist = getfilename();
    path += filelist[0];
    char *pathname = new char[path.size()+1];
    std::copy(path.begin(), path.end(), pathname);
    pathname[path.size()] = '\0';

    printf("%s\n", pathname);

    if (gzLoad(pathname,out)){
        vector<string> firstcase = mysplit(out, '\t');
        cout << firstcase.size() << endl;
        int snp_num = (int)firstcase.size()/2;
        // release the string
        std::string().swap(out);
        // release the vector
        vector<string>().swap( firstcase );

        return snp_num;
    }
    else{
        return -1;
    }
}

VectorXf readOneSNP(char* pathname , int snp_num){
    VectorXf snp(snp_num);
    string out;
    if (gzLoad(pathname,out)){
        vector<string> one_snp = mysplit(out, '\t');
        // put them into eigen
        float f1 = std::atof(one_snp[1].c_str());
        float f2 = std::atof(one_snp[3].c_str());
        for (int i = 0 ; i < snp_num ; i++){
            snp(i) = std::atof(one_snp[i*2+1].c_str());
        }
    }
    return snp;
}


MatrixXf readSNPs(string path){
    // ("./data/");
    cout << "???" << endl;
    int snp_num = getSnpNum(path);
    vector<string> filelist = getfilename();
    MatrixXf snps(filelist.size() , snp_num);
    for (int i = 0; i < filelist.size(); i++){
        // Use the first file to calculate the dimension
        path += filelist[i];
        char *pathname = new char[path.size()+1];
        std::copy(path.begin(), path.end(), pathname);
        pathname[path.size()] = '\0';
        snps.row(i) = readOneSNP(pathname, snp_num);

    }
    vector<string>().swap(filelist);
    return snps;
}

// int main(){

//     int snp_num = getSnpNum("./data/");
//     printf("%d\n", snp_num);
//     MatrixXf snps(3,snp_num);
//     snps = readSNPs("./data/");
//     cout << snps << endl;
//     return 0;


// }



