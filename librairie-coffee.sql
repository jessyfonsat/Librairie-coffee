-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : sam. 02 mai 2026 à 13:57
-- Version du serveur : 8.4.7
-- Version de PHP : 8.3.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `librairie-coffee`
--

-- --------------------------------------------------------

--
-- Structure de la table `adresse`
--

DROP TABLE IF EXISTS `adresse`;
CREATE TABLE IF NOT EXISTS `adresse` (
  `_id_adresse` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rue_adresse` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ville_adresse` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `code_postal` int DEFAULT NULL,
  `Pays` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `_Id_client` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`_id_adresse`),
  KEY `_Id_client` (`_Id_client`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `client`
--

DROP TABLE IF EXISTS `client`;
CREATE TABLE IF NOT EXISTS `client` (
  `_Id_client` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Nom_client` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `prenom_client` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `e_mail_client` varchar(113) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telephone_client` int DEFAULT NULL,
  `date_inscription_` date DEFAULT NULL,
  PRIMARY KEY (`_Id_client`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `commande`
--

DROP TABLE IF EXISTS `commande`;
CREATE TABLE IF NOT EXISTS `commande` (
  `_id_commande` int NOT NULL,
  `date_commande` timestamp NULL DEFAULT NULL,
  `statut_commande` char(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mode_retrait` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Total_commande` decimal(15,2) DEFAULT NULL,
  `_Id_client` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`_id_commande`),
  KEY `_Id_client` (`_Id_client`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `contenu_commande`
--

DROP TABLE IF EXISTS `contenu_commande`;
CREATE TABLE IF NOT EXISTS `contenu_commande` (
  `Id_CONTENU_COMMANDE` int NOT NULL,
  `Quantit�` int NOT NULL,
  `prix_unitaire` decimal(15,2) NOT NULL,
  `id_produit` int NOT NULL,
  `_id_commande` int NOT NULL,
  PRIMARY KEY (`Id_CONTENU_COMMANDE`),
  KEY `id_produit` (`id_produit`),
  KEY `_id_commande` (`_id_commande`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `produit`
--

DROP TABLE IF EXISTS `produit`;
CREATE TABLE IF NOT EXISTS `produit` (
  `id_produit` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Nom_produit` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description_produit` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prix_produit` decimal(15,2) DEFAULT NULL,
  `type_produit` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stock_produit` int DEFAULT NULL,
  PRIMARY KEY (`id_produit`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `produit`
--

INSERT INTO `produit` (`id_produit`, `Nom_produit`, `description_produit`, `prix_produit`, `type_produit`, `stock_produit`) VALUES
('', 'Test : Café colombie', 'Café doux et parfumé', 11.90, 'Café', 13);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
