//
// Created by haohanwang on 1/24/16.
//

#include "DataBaseCommunicator.hpp"

void DataBaseCommunicator::connect(string db, string user, string pwd) {
    database = db;
    username = user;
    password = pwd;

    try {
        driver = get_driver_instance();
        con = driver->connect("tcp://127.0.0.1:3306", username, password);
        con->setSchema(database);
    }
    catch (sql::SQLException &e) {
        cout << "MySQL Exception" << endl;
    }
}


void DataBaseCommunicator::connect() {
    database = "genamap";
    username = "root";
    password = "needMOREsnow23";

    try {
        driver = get_driver_instance();
        con = driver->connect("tcp://127.0.0.1:3306", username, password);
        con->setSchema(database);
    }
    catch (sql::SQLException &e) {
        cout << "MySQL Exception" << endl;
    }
}

job_pack DataBaseCommunicator::getJob(int job_pk) {
    sql::Statement *stmt;
    sql::ResultSet *res;
    job_pack result;
    result.job_id = job_pk;
    stmt = con->createStatement();
    string query = "select * from job where id = " + to_string(job_pk) + ";";
    res = stmt->executeQuery(query);
    while (res->next()) {
        result.model_name = res->getString("model");
        result.algorithm_name = res->getString("algorithm");
        result.email = res->getString("user");
    }
    return result;
}

user_info DataBaseCommunicator::getUser(string email) {
    sql::Statement *stmt;
    sql::ResultSet *res;
    user_info result;
    result.email = email;
    stmt = con->createStatement();
    string query = "select * from user where email = '" + email + "';";
    res = stmt->executeQuery(query);
    while (res->next()) {
        result.name = res->getString("username");
        result.password = res->getString("password");
        result.organization = stoi(res->getString("organization"));
    }
    return result;
}

vector<data_pack> DataBaseCommunicator::getDataPathFromJob(int job_pk) {
    sql::Statement *stmt;
    sql::ResultSet *res, *res_data;
    vector<data_pack> result;
    stmt = con->createStatement();
    string query = "select * from job_data where job_id = " + to_string(job_pk) + ";";
    res = stmt->executeQuery(query);
    vector<data_pack>::iterator it = result.begin();
    while (res->next()) {
        string data_id = res->getString("data_id");
        query = "select * from data where id =" + data_id;
        res_data = stmt->executeQuery(query);
        while (res_data->next()) {
            data_pack dp;
            dp.data_id = stoi(data_id);
            dp.path = res_data->getString("path");
            dp.data_type = stoi(res_data->getString("type"));
            dp.email = res_data->getString("user");
            it = result.insert(it, dp);
        }
    }
    return result;
}

vector<data_pack> DataBaseCommunicator::getDataPathFromUser(string email) {
    sql::Statement *stmt;
    sql::ResultSet *res;
    vector<data_pack> result;
    stmt = con->createStatement();
    string query = "select * from data where user = '" + email + "';";
    res = stmt->executeQuery(query);
    vector<data_pack>::iterator it = result.begin();
    while (res->next()) {
        data_pack dp;
        dp.email = email;
        dp.data_id = stoi(res->getString("id"));
        dp.path = res->getString("path");
        dp.data_type = stoi(res->getString("type"));
        it = result.insert(it, dp);
    }
    return result;
}

vector<result_pack> DataBaseCommunicator::getResultPathFromJob(int job_pk) {
    sql::Statement *stmt;
    sql::ResultSet *res;
    vector<result_pack> result;
    stmt = con->createStatement();
    string query = "select * from result where job_id = " + to_string(job_pk) + ";";
    res = stmt->executeQuery(query);
    vector<result_pack>::iterator it = result.begin();
    while (res->next()) {
        result_pack rp;
        rp.job_id = job_pk;
        rp.path = res->getString("path");
        rp.result_id = stoi(res->getString("id"));
        it = result.insert(it, rp);
    }
    return result;
}

vector<result_pack> DataBaseCommunicator::getResultPathFromUser(string email) {
    vector<result_pack> result, tmp;
    vector<job_pack> jobs = getJobFromUser(email);
    for (unsigned int i = 0; i < jobs.size(); i++) {
        tmp = getResultPathFromJob(jobs[i].job_id);
        copy(tmp.begin(), tmp.end(), std::back_inserter(result));
    }
    return result;
}

vector<job_pack> DataBaseCommunicator::getJobFromUser(string email) {
    sql::Statement *stmt;
    sql::ResultSet *res;
    vector<job_pack> result;
    stmt = con->createStatement();
    string query = "select * from job where user = '" + email + "';";
    res = stmt->executeQuery(query);
    vector<job_pack>::iterator it = result.begin();
    while (res->next()) {
        job_pack jo;
        jo.email = email;
        jo.job_id = stoi(res->getString("id"));
        jo.model_name = res->getString("model");
        jo.algorithm_name = res->getString("algorithm");
        it = result.insert(it, jo);
    }
    return result;
}

organization_info DataBaseCommunicator::getOrganizationFromUser(string email) {
    organization_info oi;
    oi.name = "NULL";
    oi.id = 0;
    sql::Statement *stmt;
    sql::ResultSet *res;
    stmt = con->createStatement();
    user_info ui = getUser(email);
    string query = "select * from organization where id = " + to_string(ui.organization) + ";";
    res = stmt->executeQuery(query);
    while (res->next()) {
        oi.name = res->getString("organization_name");
        oi.id = ui.organization;
    }
    return oi;
}

int DataBaseCommunicator::getIDForInsert(string tableName) {
    int result_id=1;
    sql::Statement *stmt;
    sql::ResultSet *res;
    stmt = con->createStatement();
    string query = "select count(*) from " +tableName+";";
    res = stmt->executeQuery(query);
    while (res->next()) {
        result_id = stoi(res->getString("count(*)")) + 1;
    }
    return result_id;
}

int DataBaseCommunicator::insertResult(int jobID, string path) {
    int id = getIDForInsert("result");
    sql::PreparedStatement *prep_stmt;
    prep_stmt = con->prepareStatement("INSERT INTO result(id, job_id, path) VALUES (?, ? ,?)");
    prep_stmt->setInt(1, id);
    prep_stmt->setInt(2, jobID);
    prep_stmt->setString(3, path);
    prep_stmt->executeQuery();
    return id;
}

void DataBaseCommunicator::insertUser(string email, string password, string name, int organization_id) {
    sql::PreparedStatement *pstmt;
    pstmt = con->prepareStatement("INSERT INTO user(email, password, username, organization) VALUES (?,?,?,?)");
    pstmt->setString(1, email);
    pstmt->setString(2, password);
    pstmt->setString(3, name);
    pstmt->setInt(4, organization_id);
    pstmt->executeQuery();
}

int DataBaseCommunicator::insertOrganization(string organization_name) {
    int id = getIDForInsert("organization");
    sql::PreparedStatement *prep_stmt;
    prep_stmt = con->prepareStatement("INSERT INTO organization(id, organization_name) VALUES (?, ?)");
    prep_stmt->setInt(1, id);
    prep_stmt->setString(2, organization_name);
    prep_stmt->executeQuery();
    return id;
}

int DataBaseCommunicator::insertJob(string model, string algorithm, string email) {
    int id = getIDForInsert("job");
    sql::PreparedStatement *prep_stmt;
    prep_stmt = con->prepareStatement("INSERT INTO job (id, model, algorithm, user) VALUES (?, ?, ?, ?)");
    prep_stmt->setInt(1, id);
    prep_stmt->setString(2, model);
    prep_stmt->setString(3, algorithm);
    prep_stmt->setString(4, email);
    prep_stmt->executeQuery();
    return id;
}

int DataBaseCommunicator::insertData(string path, int type, string email) {
    int id = getIDForInsert("data");
    sql::PreparedStatement *prep_stmt;
    prep_stmt = con->prepareStatement("INSERT INTO data (id, path, type, user) VALUES (?, ?, ?, ?)");
    prep_stmt->setInt(1, id);
    prep_stmt->setString(2, path);
    prep_stmt->setInt(3, type);
    prep_stmt->setString(4, email);
    prep_stmt->executeQuery();
    return id;
}

void DataBaseCommunicator::insertJob2Data(int jobID, vector<int> dataIDs) {
    int id = getIDForInsert("job_data");
    sql::PreparedStatement *prep_stmt;
    prep_stmt = con->prepareStatement("INSERT INTO job_data (id, job_id, data_id) VALUES (?, ?, ?)");
    for (unsigned int i=0; i < dataIDs.size(); i++){
        prep_stmt->setInt(1, id++);
        prep_stmt->setInt(2, jobID);
        prep_stmt->setInt(3, dataIDs[i]);
        prep_stmt->executeQuery();
    }
}

int DataBaseCommunicator::insertResult(result_pack rp) {
    return insertResult(rp.job_id, rp.path);
}

void DataBaseCommunicator::insertUser(user_info ui) {
    return insertUser(ui.email, ui.password, ui.name, ui.organization);
}

int DataBaseCommunicator::insertJob(job_pack jo) {
    return insertJob(jo.model_name, jo.algorithm_name, jo.email);
}

int DataBaseCommunicator::insertData(data_pack dp) {
    return insertData(dp.path, dp.data_type, dp.email);
}
