-- ============================================================
-- Migration : Sépia & Moka — ajout colonnes manquantes
-- À importer dans phpMyAdmin APRÈS librairie-coffee.sql
-- ============================================================

USE `librairie-coffee`;

-- Colonne image dans produit
ALTER TABLE `produit`
    ADD COLUMN IF NOT EXISTS `image_produit` TEXT COLLATE utf8mb4_unicode_ci DEFAULT NULL;

-- Colonne mot_de_passe dans client
ALTER TABLE `client`
    ADD COLUMN IF NOT EXISTS `mot_de_passe` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL;

-- Colonne role dans client  (client / admin)
ALTER TABLE `client`
    ADD COLUMN IF NOT EXISTS `role` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'client';

-- Agrandir description_produit (était varchar(50), trop court)
ALTER TABLE `produit`
    MODIFY COLUMN `description_produit` TEXT COLLATE utf8mb4_unicode_ci NOT NULL;

-- ──────────────────────────────────────────────────────────────
-- Compte administrateur par défaut
-- Email    : admin@sepiamoka.fr
-- Mot de passe : admin1234   (à changer après la première connexion !)
-- ──────────────────────────────────────────────────────────────
INSERT IGNORE INTO `client`
    (_Id_client, Nom_client, prenom_client, e_mail_client, mot_de_passe, date_inscription_, role)
VALUES (
    'cli_admin_default',
    'Moka',
    'Admin',
    'admin@sepiamoka.fr',
    '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uSc5uXsQW', -- admin1234
    CURDATE(),
    'admin'
);

-- ──────────────────────────────────────────────────────────────
-- Données de démonstration — Boissons
-- ──────────────────────────────────────────────────────────────
INSERT IGNORE INTO `produit` (id_produit, Nom_produit, description_produit, prix_produit, type_produit, stock_produit, image_produit) VALUES
('prod_matcha',      'Matcha Latte',             'Thé matcha japonais, lait végétal moussé. Douceur végétale, sans caféine forte.',               7.00,  'boisson', 50, '103507218.jpg'),
('prod_moka',        'Moka',                     'Espresso double, chocolat, lait crémeux. Intense & gourmand, notes chocolatées.',               5.00,  'boisson', 50, '63d1e7f3-be97-494b-bc2e-2c5fc7e9b99d_bSPeBjy.jpg'),
('prod_chai',        'Chai Latte',               'Mélange d\'épices (cannelle, cardamome, gingembre) & lait chaud. Épicé & réconfortant.',        5.00,  'boisson', 50, 'Chai.jpg'),
('prod_cafe',        'Café',                     'Espresso simple, grains sélectionnés. Classique & fort, réveil assuré.',                        3.00,  'boisson', 50, '1055859-fu-patisserie-et-coffee-shop-paris-13e-cafe-latte.jpg'),
('prod_latte',       'Latte',                    'Espresso allongé, lait texturé, mousse douce. Doux & crémeux.',                                 4.50,  'boisson', 50, 'site-malongo-5-1024x614.jpg'),
('prod_the_glace',   'Thé glacé à l\'orange',    'Thé vert infusé à froid, jus d\'orange pressé, menthe. Frais & vitaminé.',                     4.50,  'boisson', 50, 'iced-coffee-drink-menu-orange-americano-fusion-with-fresh-orange-fruit-mixed-in-a-plastic-cup-drink-menu-product-free-photo.jpg');

-- ──────────────────────────────────────────────────────────────
-- Données de démonstration — Livres
-- ──────────────────────────────────────────────────────────────
INSERT IGNORE INTO `produit` (id_produit, Nom_produit, description_produit, prix_produit, type_produit, stock_produit, image_produit) VALUES
('prod_jenny_han',   'À tous les garçons que j\'ai aimé', 'Jenny Han – Romance Young Adult – 320 pages. Bestseller mondial.',               17.00, 'livre', 20, '1_9782822241977_1_75.jpg'),
('prod_rwrb',        'Red White & Royal Blue',            'Casey McQuiston – Romance & politique – 416 pages. Drôle & touchant.',            15.00, 'livre', 20, '71Fq7XMmjEL._SL1500_.jpg'),
('prod_long_game',   'The Long Game',                     'Rachel Reid – Romance sportive – 384 pages. Rivalité & passion.',                  25.00, 'livre', 10, '71LLGT0DIxL._SL1500_.jpg'),
('prod_bridgerton3', 'Bridgerton – Tome 3',               'Julia Quinn – Romance historique – 368 pages. Époque victorienne.',                23.00, 'livre', 15, 'la_chronique_des_bridgerton_tome_3_benedict-1472181-264-432.jpg'),
('prod_original',    'The Original',                      'Roman feel-good – Ambiance café & livres – 290 pages. Cozy & inspirant.',          15.00, 'livre', 18, 'Cozy Book Café Corner _ Warm Lights, Coffee & Stacks of Books _ Vision Board _ Cozy Living.jpg'),
('prod_dnd',         'Donjons & Dragons',                 'Manuel de jeu officiel – Fantaisie & aventure – 312 pages. Pour vrais aventuriers.', 14.50, 'livre', 12, '81VpJt4SpDL._SL1500_.jpg');

COMMIT;
