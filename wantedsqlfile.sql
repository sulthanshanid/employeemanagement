-- MySQL dump 10.13  Distrib 8.0.32, for Win64 (x86_64)
--
-- Host: localhost    Database: rami
-- ------------------------------------------------------
-- Server version	8.0.32

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `attendance`
--

DROP TABLE IF EXISTS `attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance` (
  `attendance_id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int DEFAULT NULL,
  `date` date DEFAULT NULL,
  `status` enum('Present','Absent','Leave','Holiday') NOT NULL,
  `wage` decimal(10,2) DEFAULT '0.00',
  `workplace_id` int DEFAULT NULL,
  PRIMARY KEY (`attendance_id`),
  UNIQUE KEY `unique_employee_date` (`employee_id`,`date`),
  KEY `fk_workplace_id` (`workplace_id`),
  CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`),
  CONSTRAINT `fk_workplace_id` FOREIGN KEY (`workplace_id`) REFERENCES `workplaces` (`workplace_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance`
--

LOCK TABLES `attendance` WRITE;
/*!40000 ALTER TABLE `attendance` DISABLE KEYS */;
/*!40000 ALTER TABLE `attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `deduction`
--

DROP TABLE IF EXISTS `deduction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `deduction` (
  `deduction_id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `remark` varchar(255) DEFAULT NULL,
  `date` date NOT NULL,
  PRIMARY KEY (`deduction_id`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `deduction_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deduction`
--

LOCK TABLES `deduction` WRITE;
/*!40000 ALTER TABLE `deduction` DISABLE KEYS */;
/*!40000 ALTER TABLE `deduction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `employee_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `arabic_name` varchar(100) DEFAULT NULL,
  `date_of_join` date DEFAULT NULL,
  `designation` varchar(255) DEFAULT NULL,
  `basic_wage` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`employee_id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES (4,'AHMED SAMEER ABDELNABY',NULL,NULL,'NO',140.00),(5,'IBRAHIM ABUL KAHIR',NULL,NULL,'NO',0.00),(6,'ALA GAMAAL ASAAD',NULL,NULL,'NO',0.00),(7,'AYMAN ABOUELHAMD',NULL,NULL,'NO',0.00),(8,'ABDUL RAHEEM AHMED',NULL,NULL,'NO',0.00),(9,'SAEED SHAFIK',NULL,NULL,'NO',0.00),(10,'MUHAMMED RABIE SAYED',NULL,NULL,'NO',0.00),(11,'MUHAMMED MABROOK ABDELGHAFAR',NULL,NULL,'NO',0.00),(12,'RAHMATULLAH - DRIVER',NULL,NULL,'NO',0.00),(13,'SADDAM - DRIVER',NULL,NULL,'NO',0.00),(14,'SAEED - DRIVER',NULL,NULL,'NO',0.00),(15,'ASEM KHALFALLAH ABDELRAZAK',NULL,NULL,'NO',0.00),(16,'MOHAMMED RAJAB',NULL,NULL,'NO',0.00),(17,'ABUBAKER UBAID NOURELDIN',NULL,NULL,'NO',0.00),(18,'HAYSEM ELFOULY ELNAHAS',NULL,NULL,'NO',0.00),(19,'YAHYA MUHAMMED AHMED',NULL,NULL,'NO',0.00),(20,'ASEM KASAB SABER',NULL,NULL,'NO',0.00),(21,'EL BADAVI MOSSAD',NULL,NULL,'NO',0.00),(22,'ALA AHMED ABDEL RAZIM',NULL,NULL,'NO',0.00),(23,'RIFAYYI ABUL FADHL',NULL,NULL,'NO',0.00),(24,'MUHAMMED YOUSSUF ABBAS',NULL,NULL,'NO',0.00),(25,'MOHAMMED AHMED EL SAYED',NULL,NULL,'NO',0.00),(26,'IBRAHIM WAGIH MOHAMMED',NULL,NULL,'NO',0.00),(27,'MOHAMMED NOOR - CLEANER',NULL,NULL,'NO',0.00),(28,'ASSAYID BASYOUNI',NULL,NULL,'NO',0.00),(29,'HUSSEIN ABDUL HAFIZ',NULL,NULL,'NO',0.00),(30,'AWAD MAGDI ABDEL HAKIM',NULL,NULL,'NO',0.00),(31,'MOHAMMED ALI ABDEL MONEM',NULL,NULL,'NO',0.00),(32,'AHMED SAEED AL HADAD',NULL,NULL,'NO',0.00),(33,'MUKTHAR MUHAMMED AHMED',NULL,NULL,'NO',0.00),(34,'HAMDHEE',NULL,NULL,'NO',0.00),(35,'MOHAMMED ALI ABDEL NASEER',NULL,NULL,'NO',0.00),(36,'HANI MUHAMMED AHMED',NULL,NULL,'NO',0.00);
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `loans`
--

DROP TABLE IF EXISTS `loans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `loans` (
  `loan_id` int NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `loan_amount` decimal(10,2) NOT NULL,
  `loan_date` date NOT NULL,
  PRIMARY KEY (`loan_id`),
  KEY `employee_id` (`employee_id`),
  CONSTRAINT `loans_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `loans`
--

LOCK TABLES `loans` WRITE;
/*!40000 ALTER TABLE `loans` DISABLE KEYS */;
/*!40000 ALTER TABLE `loans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `workplaces`
--

DROP TABLE IF EXISTS `workplaces`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `workplaces` (
  `workplace_id` int NOT NULL AUTO_INCREMENT,
  `workplace_name` varchar(100) NOT NULL,
  `location` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`workplace_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `workplaces`
--

LOCK TABLES `workplaces` WRITE;
/*!40000 ALTER TABLE `workplaces` DISABLE KEYS */;
INSERT INTO `workplaces` VALUES (5,'Mazyed Mall',NULL),(6,'Abu Dhabi',NULL),(7,'MBZ Villa Fathima',NULL),(8,'oknnc',NULL),(9,'ok',NULL);
/*!40000 ALTER TABLE `workplaces` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-01-02 12:57:38