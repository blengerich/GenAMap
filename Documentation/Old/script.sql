-- MySQL dump 10.13  Distrib 5.5.47, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: genamap
-- ------------------------------------------------------
-- Server version	5.5.47-0ubuntu0.14.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `data`
--

DROP TABLE IF EXISTS `data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `data` (
  `id` int(11) NOT NULL,
  `path` varchar(1000) NOT NULL,
  `type` int(11) DEFAULT NULL,
  `user` varchar(45) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_data_1_idx` (`user`),
  CONSTRAINT `fk_data_1` FOREIGN KEY (`user`) REFERENCES `user` (`email`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `data`
--

LOCK TABLES `data` WRITE;
/*!40000 ALTER TABLE `data` DISABLE KEYS */;
INSERT INTO `data` VALUES (1,'/home/haohanwang/CLion/Algorithms/sampleData/matrix.csv',1,'whaohan@acm.org'),(2,'/home/haohanwang/CLion/Algorithms/sampleData/vector.csv',2,'whaohan@acm.org'),(3,'/home/haohanwang/CLion/Algorithms/sampleData/matrix.tsv',1,'whaohan@acm.org'),(4,'/home/haohanwang/CLion/Algorithms/sampleData/vector.tsv',2,'whaohan@acm.org'),(5,'/home/haohanwang/CLion/Algorithms/sampleData/vector.csv',2,'hw@a.com'),(6,'/home/haohanwang/CLion/Algorithms/sampleData/matrix.csv',1,'hw@a.com');
/*!40000 ALTER TABLE `data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job`
--

DROP TABLE IF EXISTS `job`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `job` (
  `id` int(11) NOT NULL,
  `model` varchar(45) NOT NULL,
  `algorithm` varchar(45) DEFAULT NULL,
  `user` varchar(45) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_idx` (`user`),
  CONSTRAINT `user` FOREIGN KEY (`user`) REFERENCES `user` (`email`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job`
--

LOCK TABLES `job` WRITE;
/*!40000 ALTER TABLE `job` DISABLE KEYS */;
INSERT INTO `job` VALUES (1,'lasso','pgd','whaohan@acm.org'),(2,'rigid','pgd','whaohan@acm.org'),(3,'lasso','pgd','hw@a.com');
/*!40000 ALTER TABLE `job` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_data`
--

DROP TABLE IF EXISTS `job_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `job_data` (
  `id` int(11) NOT NULL,
  `job_id` int(11) NOT NULL,
  `data_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_job_id_idx` (`job_id`),
  KEY `fk_data_id_idx` (`data_id`),
  CONSTRAINT `data_id` FOREIGN KEY (`data_id`) REFERENCES `data` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `job_id` FOREIGN KEY (`job_id`) REFERENCES `job` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_data`
--

LOCK TABLES `job_data` WRITE;
/*!40000 ALTER TABLE `job_data` DISABLE KEYS */;
INSERT INTO `job_data` VALUES (1,1,1),(2,1,2),(3,2,3),(4,2,4),(5,3,5),(6,3,6);
/*!40000 ALTER TABLE `job_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organization`
--

DROP TABLE IF EXISTS `organization`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `organization` (
  `id` int(11) NOT NULL,
  `organization_name` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organization`
--

LOCK TABLES `organization` WRITE;
/*!40000 ALTER TABLE `organization` DISABLE KEYS */;
INSERT INTO `organization` VALUES (1,'CMU'),(2,'cmu'),(3,'cmu');
/*!40000 ALTER TABLE `organization` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `result`
--

DROP TABLE IF EXISTS `result`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `result` (
  `id` int(11) NOT NULL,
  `job_id` int(11) NOT NULL,
  `path` varchar(1000) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `job_id_idx` (`job_id`),
  CONSTRAINT `result_job_id` FOREIGN KEY (`job_id`) REFERENCES `job` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `result`
--

LOCK TABLES `result` WRITE;
/*!40000 ALTER TABLE `result` DISABLE KEYS */;
INSERT INTO `result` VALUES (1,1,'/home/haohanwang/CLion/Algorithms/sampleData/beta.tsv'),(2,1,'/home/haohanwang/CLion/Algorithms/sampleData/beta.tsv'),(3,1,'/home/haohanwang/CLion/Algorithms/sampleData/beta.tsv'),(4,3,'/home/haohanwang/CLion/Algorithms/sampleData/beta.tsv'),(5,3,'/home/haohanwang/CLion/Algorithms/sampleData/beta.tsv'),(6,3,'/home/haohanwang/CLion/Algorithms/sampleData/beta.tsv');
/*!40000 ALTER TABLE `result` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `email` varchar(45) NOT NULL,
  `password` varchar(45) NOT NULL,
  `username` varchar(45) DEFAULT NULL,
  `organization` int(11) NOT NULL,
  PRIMARY KEY (`email`),
  KEY `organization_idx` (`organization`),
  CONSTRAINT `organization` FOREIGN KEY (`organization`) REFERENCES `organization` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES ('hw@a.com','123','hw',1),('whaohan@acm.org','123456','Haohan',1);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2016-02-20 20:29:54
