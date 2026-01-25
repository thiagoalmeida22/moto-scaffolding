-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: motos
-- ------------------------------------------------------
-- Server version	8.0.44

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
-- Dumping data for table `fotos`
--

LOCK TABLES `fotos` WRITE;
/*!40000 ALTER TABLE `fotos` DISABLE KEYS */;
INSERT INTO `fotos` (`id`, `foto_path`, `descricao`, `created_at`) VALUES (1,'/pictures/Honda/CG_125_TITAN_KS/honda-cg-160-2025-2_jpg_-_Copy.jpg',NULL,'2026-01-25 02:31:43');
INSERT INTO `fotos` (`id`, `foto_path`, `descricao`, `created_at`) VALUES (2,'/pictures/Honda/CG_125_TITAN_KS/images_-_Copy.jpg',NULL,'2026-01-25 02:31:43');
INSERT INTO `fotos` (`id`, `foto_path`, `descricao`, `created_at`) VALUES (3,'/pictures/Honda/CG_125_TITAN_KS/visao-da-lateral-direita-da-honda-cg-160-titan_-_Copy.jpg',NULL,'2026-01-25 02:31:43');
INSERT INTO `fotos` (`id`, `foto_path`, `descricao`, `created_at`) VALUES (4,'/pictures/Honda/CG_160_FAN_ESDI_FLEXONE/202509_CG160_START_Cor_Azul.jpg',NULL,'2026-01-25 02:32:06');
INSERT INTO `fotos` (`id`, `foto_path`, `descricao`, `created_at`) VALUES (5,'/pictures/Honda/CG_160_FAN_ESDI_FLEXONE/Costas.jpg',NULL,'2026-01-25 02:32:06');
INSERT INTO `fotos` (`id`, `foto_path`, `descricao`, `created_at`) VALUES (6,'/pictures/Honda/CG_160_FAN_ESDI_FLEXONE/frente.jpg',NULL,'2026-01-25 02:32:06');
/*!40000 ALTER TABLE `fotos` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-24 23:44:10
