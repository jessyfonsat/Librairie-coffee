-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : mar. 05 mai 2026 à 08:07
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
  `_id_adresse` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `rue_adresse` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ville_adresse` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `code_postal` int DEFAULT NULL,
  `Pays` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `_Id_client` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`_id_adresse`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `client`
--

DROP TABLE IF EXISTS `client`;
CREATE TABLE IF NOT EXISTS `client` (
  `_Id_client` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Nom_client` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `prenom_client` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `e_mail_client` varchar(113) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telephone_client` int DEFAULT NULL,
  `date_inscription_` date DEFAULT NULL,
  `mot_de_passe` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'client',
  PRIMARY KEY (`_Id_client`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `client`
--

INSERT INTO `client` (`_Id_client`, `Nom_client`, `prenom_client`, `e_mail_client`, `telephone_client`, `date_inscription_`, `mot_de_passe`, `role`) VALUES
('cli_6adf0cd0305885fd', 'jess', 'jess', 'jessy.fonsat@gmail.com', NULL, '2026-05-02', '$2y$10$CdHC0QYX7fGAdkcBDHC.KulZCIMwbPJA77VSqMiRjYNc173I1sGNm', 'client'),
('cli_admin_default', 'Moka', 'Admin', 'admin@sepiamoka.fr', NULL, '2026-05-02', '$2y$10$qr0GHyh8c.AiMif7/X3kfOco.RogmLOak6RInCewDTYAmh4Zov.8.', 'admin');

-- --------------------------------------------------------

--
-- Structure de la table `commande`
--

DROP TABLE IF EXISTS `commande`;
CREATE TABLE IF NOT EXISTS `commande` (
  `_id_commande` int NOT NULL AUTO_INCREMENT,
  `date_commande` timestamp NULL DEFAULT NULL,
  `statut_commande` char(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mode_retrait` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Total_commande` decimal(15,2) DEFAULT NULL,
  `_Id_client` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`_id_commande`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `contenu_commande`
--

DROP TABLE IF EXISTS `contenu_commande`;
CREATE TABLE IF NOT EXISTS `contenu_commande` (
  `Id_CONTENU_COMMANDE` int NOT NULL AUTO_INCREMENT,
  `Quantite` int NOT NULL,
  `prix_unitaire` decimal(15,2) NOT NULL,
  `id_produit` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `_id_commande` int NOT NULL,
  PRIMARY KEY (`Id_CONTENU_COMMANDE`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `produit`
--

DROP TABLE IF EXISTS `produit`;
CREATE TABLE IF NOT EXISTS `produit` (
  `id_produit` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Nom_produit` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description_produit` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `prix_produit` decimal(15,2) DEFAULT NULL,
  `type_produit` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stock_produit` int DEFAULT NULL,
  `image_produit` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id_produit`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `produit`
--

INSERT INTO `produit` (`id_produit`, `Nom_produit`, `description_produit`, `prix_produit`, `type_produit`, `stock_produit`, `image_produit`) VALUES
('prod_034d62dbd9d5c9f0', 'Chocolat chaud', 'Boisson chaude réconfortante à base de chocolat et de lait, le chocolat chaud séduit par sa texture onctueuse et son goût riche en cacao. Doux et gourmand, il peut être légèrement sucré et parfois agrémenté de crème ou de mousse de lait. Parfait pour une pause cocooning à tout moment de la journée.', 4.00, 'boisson', 10, 'uploads/img_720ac9b86d480e86.jpg'),
('prod_1bfe4660811a87e8', 'La femme de ménage', '-Roman de Freida McFadden, publié en 2022\r\n-Millie, une jeune femme en difficulté, devient femme de ménage chez une famille aisée', 10.50, 'livre', 5, 'uploads/img_ea1f72ebc351b641.jpg'),
('prod_1e20a67651b6dc3f', 'UBE LATTE', 'Boisson douce et crémeuse à base d’ube (igname violette), originaire des Philippines. L’ube latte séduit par sa couleur violette naturelle et son goût délicatement sucré aux notes de vanille et de noisette. Préparé avec du lait et de la purée d’ube, il peut être dégusté chaud ou glacé pour une pause gourmande et réconfortante.', 7.00, 'boisson', 10, 'uploads/img_f00caf735fb483dd.jpg'),
('prod_26d511d8bd105b82', 'Nos étoiles contraires', '-Ecrit par John Green et publié en 2012\r\n-Hazel, atteinte d’un cancer, rencontre Augustus dans un groupe de soutien', 12.50, 'livre', 3, 'uploads/img_ba5c840ad90e6be6.webp'),
('prod_3d7f3dd54dab703e', 'L\'autre Moi', '-Roman de Franck Thilliez, publié en 2024\r\n-L’histoire suit un personnage confronté à des troubles liés à son identité', 11.50, 'livre', 14, 'uploads/img_d8457839570bcc19.jpg'),
('prod_69f858212fa89c06', 'L\'intruse', '-Roman de Freida McFadden, publié en 2023\r\n-Une femme s’installe dans une maison où elle ne se sent pas à sa place\r\n-Des événements étranges et inquiétants commencent à se produire', 9.50, 'livre', 2, 'uploads/img_969340d656a5fd7c.jpg'),
('prod_6f8f61de86c38b8a', 'café vietnamien', 'Café intense et gourmand, le café vietnamien est préparé avec un café filtré lentement, puis mélangé à du lait concentré sucré. Servi chaud ou glacé, il offre un contraste unique entre la puissance du café et la douceur sucrée et crémeuse. Une boisson riche en saveurs, idéale pour une pause énergisante et originale.', 5.00, 'boisson', 12, 'uploads/img_4628a79b885c3022.jpg'),
('prod_a83db12d9e80dacb', 'La prof', '-Roman de Freida McFadden, publié en 2023\r\n-Eve, professeure de mathématiques, semble mener une vie normale\r\n-Une relation interdite avec un élève vient tout bouleverser', 5.00, 'livre', 7, 'uploads/img_5bab15e58d3594b9.jpg'),
('prod_b4c8f2200097a4f3', 'ice americano', 'Café rafraîchissant et intense, l’iced americano est préparé à partir d’un espresso allongé avec de l’eau froide et servi sur des glaçons. Sans lait, il offre un goût pur et légèrement amer, idéal pour les amateurs de café noir en version glacée. Une boisson simple, légère et désaltérante.', 4.00, 'boisson', 20, 'uploads/img_738ce8b7b0f368f4.jpg'),
('prod_bridgerton3', 'Bridgerton – Tome 3', 'Julia Quinn – Romance historique – 368 pages. Époque victorienne.', 23.00, 'livre', 15, 'la_chronique_des_bridgerton_tome_3_benedict-1472181-264-432.jpg'),
('prod_cafe', 'Café', 'Espresso simple, grains sélectionnés. Classique et fort, réveil assuré.', 3.00, 'boisson', 50, '1055859-fu-patisserie-et-coffee-shop-paris-13e-cafe-latte.jpg'),
('prod_chai', 'Chai Latte', 'Mélange d\'épices (cannelle, cardamome, gingembre) et lait chaud. Épicé et réconfortant.', 5.00, 'boisson', 50, 'Chai.jpg'),
('prod_dnd', 'Donjons & Dragons', 'Manuel de jeu officiel – Fantaisie et aventure – 312 pages. Pour vrais aventuriers.', 14.50, 'livre', 12, '81VpJt4SpDL._SL1500_.jpg'),
('prod_f21a122a989023de', 'Egg coffee', 'Spécialité vietnamienne gourmande et originale, l’egg coffee associe un café intense à une crème onctueuse à base de jaune d’œuf et de lait sucré. Sa texture mousseuse et veloutée rappelle un dessert, avec des notes riches et légèrement vanillées. Une boisson unique, à la fois réconfortante et surprenante.', 6.50, 'boisson', 4, 'uploads/img_d5e0f09da4161f6a.jpg'),
('prod_fb46aef09afed1f2', 'Brown Sugar Shaken Espresso', 'Boisson glacée onctueuse et parfumée, le Brown Sugar Shaken Espresso associe un espresso secoué avec du sucre brun, des glaçons et une touche de cannelle, puis complété avec du lait. Son goût est à la fois riche, légèrement sucré et subtilement épicé, avec des notes de caramel. Une boisson rafraîchissante et gourmande, parfaite pour les amateurs de café doux et aromatique.', 3.50, 'boisson', 5, 'uploads/img_ce545c2734438070.jpg'),
('prod_jenny_han', 'À tous les garçons que j\'ai aimé', 'Jenny Han – Romance Young Adult – 320 pages. Bestseller mondial.', 17.00, 'livre', 20, '1_9782822241977_1_75.jpg'),
('prod_latte', 'Latte', 'Espresso allongé, lait texturé, mousse douce. Doux et crémeux.', 4.50, 'boisson', 50, 'site-malongo-5-1024x614.jpg'),
('prod_long_game', 'The Long Game', 'Rachel Reid – Romance sportive – 384 pages. Rivalité et passion.', 25.00, 'livre', 10, '71LLGT0DIxL._SL1500_.jpg'),
('prod_matcha', 'Matcha Latte', 'Thé matcha japonais, lait végétal moussé. Douceur végétale, sans caféine forte.', 7.00, 'boisson', 50, '103507218.jpg'),
('prod_moka', 'Moka', 'Espresso double, chocolat, lait crémeux. Intense et gourmand, notes chocolatées.', 5.00, 'boisson', 50, '63d1e7f3-be97-494b-bc2e-2c5fc7e9b99d_bSPeBjy.jpg'),
('prod_original', 'The Original', 'Roman feel-good – Ambiance café et livres – 290 pages. Cozy et inspirant.', 15.00, 'livre', 18, 'Cozy Book Café Corner _ Warm Lights, Coffee & Stacks of Books _ Vision Board _ Cozy Living.jpg'),
('prod_rwrb', 'Red White & Royal Blue', 'Casey McQuiston – Romance et politique – 416 pages. Drôle et touchant.', 15.00, 'livre', 20, '71Fq7XMmjEL._SL1500_.jpg'),
('prod_the_glace', 'Thé glacé à l\'orange', 'Thé vert infusé à froid, jus d\'orange pressé, menthe. Frais et vitaminé.', 4.50, 'boisson', 50, 'iced-coffee-drink-menu-orange-americano-fusion-with-fresh-orange-fruit-mixed-in-a-plastic-cup-drink-menu-product-free-photo.jpg');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;