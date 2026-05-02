-- ============================================================
-- Sépia & Moka — Base de données complète
-- Importer dans phpMyAdmin après avoir créé la BDD "librairie-coffee"
-- ============================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";
SET NAMES utf8mb4;

-- ─── TABLES ──────────────────────────────────────────────────────────────────

DROP TABLE IF EXISTS `contenu_commande`;
DROP TABLE IF EXISTS `commande`;
DROP TABLE IF EXISTS `adresse`;
DROP TABLE IF EXISTS `produit`;
DROP TABLE IF EXISTS `client`;

CREATE TABLE `client` (
  `_Id_client`        varchar(50)  COLLATE utf8mb4_unicode_ci NOT NULL,
  `Nom_client`        varchar(50)  COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `prenom_client`     varchar(50)  COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `e_mail_client`     varchar(113) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telephone_client`  int          DEFAULT NULL,
  `date_inscription_` date         DEFAULT NULL,
  `mot_de_passe`      varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role`              varchar(20)  COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'client',
  PRIMARY KEY (`_Id_client`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `produit` (
  `id_produit`          varchar(50)   COLLATE utf8mb4_unicode_ci NOT NULL,
  `Nom_produit`         varchar(100)  COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description_produit` TEXT          COLLATE utf8mb4_unicode_ci NOT NULL,
  `prix_produit`        decimal(15,2) DEFAULT NULL,
  `type_produit`        varchar(50)   COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `stock_produit`       int           DEFAULT NULL,
  `image_produit`       TEXT          COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_produit`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `adresse` (
  `_id_adresse`   varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rue_adresse`   varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ville_adresse` varchar(50)  COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `code_postal`   int          DEFAULT NULL,
  `Pays`          varchar(50)  COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `_Id_client`    varchar(50)  COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`_id_adresse`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `commande` (
  `_id_commande`    int           NOT NULL AUTO_INCREMENT,
  `date_commande`   timestamp     NULL DEFAULT NULL,
  `statut_commande` char(50)      COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mode_retrait`    varchar(50)   COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Total_commande`  decimal(15,2) DEFAULT NULL,
  `_Id_client`      varchar(50)   COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`_id_commande`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `contenu_commande` (
  `Id_CONTENU_COMMANDE` int           NOT NULL AUTO_INCREMENT,
  `Quantite`            int           NOT NULL,
  `prix_unitaire`       decimal(15,2) NOT NULL,
  `id_produit`          varchar(50)   COLLATE utf8mb4_unicode_ci NOT NULL,
  `_id_commande`        int           NOT NULL,
  PRIMARY KEY (`Id_CONTENU_COMMANDE`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── COMPTE ADMIN ─────────────────────────────────────────────────────────────
-- Email    : admin@sepiamoka.fr
-- Mot de passe : admin1234
-- (le mot de passe sera automatiquement hashé lors de la 1ère connexion)

INSERT INTO `client` (_Id_client, Nom_client, prenom_client, e_mail_client, mot_de_passe, date_inscription_, role)
VALUES ('cli_admin_default', 'Moka', 'Admin', 'admin@sepiamoka.fr', 'admin1234', CURDATE(), 'admin');

-- ─── BOISSONS ─────────────────────────────────────────────────────────────────

INSERT INTO `produit` (id_produit, Nom_produit, description_produit, prix_produit, type_produit, stock_produit, image_produit) VALUES
('prod_matcha',    'Matcha Latte',          'Thé matcha japonais, lait végétal moussé. Douceur végétale, sans caféine forte.',             7.00,  'boisson', 50, '103507218.jpg'),
('prod_moka',      'Moka',                  'Espresso double, chocolat, lait crémeux. Intense et gourmand, notes chocolatées.',             5.00,  'boisson', 50, '63d1e7f3-be97-494b-bc2e-2c5fc7e9b99d_bSPeBjy.jpg'),
('prod_chai',      'Chai Latte',            'Mélange d''épices (cannelle, cardamome, gingembre) et lait chaud. Épicé et réconfortant.',    5.00,  'boisson', 50, 'Chai.jpg'),
('prod_cafe',      'Café',                  'Espresso simple, grains sélectionnés. Classique et fort, réveil assuré.',                     3.00,  'boisson', 50, '1055859-fu-patisserie-et-coffee-shop-paris-13e-cafe-latte.jpg'),
('prod_latte',     'Latte',                 'Espresso allongé, lait texturé, mousse douce. Doux et crémeux.',                              4.50,  'boisson', 50, 'site-malongo-5-1024x614.jpg'),
('prod_the_glace', 'Thé glacé à l''orange', 'Thé vert infusé à froid, jus d''orange pressé, menthe. Frais et vitaminé.',                  4.50,  'boisson', 50, 'iced-coffee-drink-menu-orange-americano-fusion-with-fresh-orange-fruit-mixed-in-a-plastic-cup-drink-menu-product-free-photo.jpg');

-- ─── LIVRES ───────────────────────────────────────────────────────────────────

INSERT INTO `produit` (id_produit, Nom_produit, description_produit, prix_produit, type_produit, stock_produit, image_produit) VALUES
('prod_jenny_han',   'À tous les garçons que j''ai aimé', 'Jenny Han – Romance Young Adult – 320 pages. Bestseller mondial.',                17.00, 'livre', 20, '1_9782822241977_1_75.jpg'),
('prod_rwrb',        'Red White & Royal Blue',             'Casey McQuiston – Romance et politique – 416 pages. Drôle et touchant.',           15.00, 'livre', 20, '71Fq7XMmjEL._SL1500_.jpg'),
('prod_long_game',   'The Long Game',                      'Rachel Reid – Romance sportive – 384 pages. Rivalité et passion.',                 25.00, 'livre', 10, '71LLGT0DIxL._SL1500_.jpg'),
('prod_bridgerton3', 'Bridgerton – Tome 3',                'Julia Quinn – Romance historique – 368 pages. Époque victorienne.',               23.00, 'livre', 15, 'la_chronique_des_bridgerton_tome_3_benedict-1472181-264-432.jpg'),
('prod_original',    'The Original',                       'Roman feel-good – Ambiance café et livres – 290 pages. Cozy et inspirant.',        15.00, 'livre', 18, 'Cozy Book Café Corner _ Warm Lights, Coffee & Stacks of Books _ Vision Board _ Cozy Living.jpg'),
('prod_dnd',         'Donjons & Dragons',                  'Manuel de jeu officiel – Fantaisie et aventure – 312 pages. Pour vrais aventuriers.', 14.50, 'livre', 12, '81VpJt4SpDL._SL1500_.jpg');

COMMIT;
