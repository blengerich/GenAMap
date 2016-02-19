//
// Created by haohanwang on 1/24/16.
//

#ifndef ALGORITHMS_DATABASECOMMUNICATOR_HPP
#define ALGORITHMS_DATABASECOMMUNICATOR_HPP

#include <string>
#include <iostream>
#include <vector>

#include "mysql_connection.h"

#include <cppconn/driver.h>
#include <cppconn/exception.h>
#include <cppconn/resultset.h>
#include <cppconn/statement.h>
#include <cppconn/prepared_statement.h>

using namespace std;
using namespace sql::mysql;

struct job_pack {
    int job_id;
    string email;
    string model_name;
    string algorithm_name;
};

struct data_pack {
    int data_id;
    string path;
    int data_type;
    string email;
};

struct result_pack{
    int result_id;
    string path;
    int job_id;
};

struct progress_pack{
    int job_id;
    double progress;
};

struct user_info{
    string email;
    string password;
    string name;
    int organization;
};

struct organization_info{
    int id;
    string name;
};

class DataBaseCommunicator {
private:
    DataBaseCommunicator() {};
    DataBaseCommunicator(DataBaseCommunicator const &);
    void operator=(DataBaseCommunicator const &);

    string database;
    string username;
    string password;

    sql::Driver *driver;
    sql::Connection *con;

    int getIDForInsert(string);
public:
    static DataBaseCommunicator &getInstance() {
        static DataBaseCommunicator instance;
        return instance;
    }

    void connect(string, string, string);

    job_pack getJob(int);
    user_info getUser(string);
    vector<data_pack> getDataPathFromJob(int);
    vector<data_pack> getDataPathFromUser(string);
    vector<result_pack> getResultPathFromJob(int);
    vector<result_pack> getReusltPathFromUser(string);

    vector<job_pack> getJobFromUser(string);
    organization_info getOrganizationFromUser(string);

    int insertResult(int, string);
    void insertUser(string, string, string, int);
    int insertOrganization(string);
    int insertJob(string, string, string);
    int insertData(string, int, string);
    void insertJob2Data(int, vector<int>);

    int insertResult(result_pack);
    void insertUser(user_info);
    int insertJob(job_pack);
    int insertData(data_pack);
};


#endif //ALGORITHMS_DATABASECOMMUNICATOR_HPP
