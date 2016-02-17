cmake_minimum_required(VERSION 3.3)
project(Algorithms)
include_directories(/usr/local/include/eigen3/)

set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++11 -lmysqlcppconn")

set(SOURCE_FILES src/main.cpp src/model/Model.cpp src/model/Model.hpp src/algorithm/Algorithm.cpp src/algorithm/Algorithm.hpp src/algorithm/ProximalGradientDescent.cpp src/algorithm/ProximalGradientDescent.hpp
        src/model/LinearRegression.cpp src/model/LinearRegression.hpp src/FileIO.cpp src/FileIO.hpp src/DataBaseCommunicator.cpp src/DataBaseCommunicator.hpp
        src/model/TreeLasso.cpp src/model/TreeLasso.hpp src/JsonCoder.cpp src/JsonCoder.hpp src/jsoncpp.cpp src/algorithm/IterativeUpdate.cpp src/algorithm/IterativeUpdate.hpp
        src/model/MultiPopLasso.cpp src/model/MultiPopLasso.hpp src/Math.cpp src/Math.hpp)
add_executable(Algorithms ${SOURCE_FILES})

target_link_libraries(Algorithms /usr/lib/libmysqlcppconn.so)