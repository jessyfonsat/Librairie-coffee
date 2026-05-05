<?php

session_start();
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

require 'connexion.php';

$action = $_GET['action'] ?? $_POST['action'] ?? '';

// ── Helpers ──────────────────────────────────────────────────────────────────

function jsonOk($data = [])  { echo json_encode(['ok' => true]  + $data); exit; }
function jsonErr($msg)        { echo json_encode(['ok' => false, 'error' => $msg]); exit; }

function isAdmin() {
    return isset($_SESSION['user']) && ($_SESSION['user']['role'] ?? '') === 'admin';
}
function requireAdmin() {
    if (!isAdmin()) jsonErr('Accès refusé. Vous devez être administrateur.');
}
function generateId($prefix = '') {
    return $prefix . bin2hex(random_bytes(8));
}

// ── Auth ─────────────────────────────────────────────────────────────────────

if ($action === 'login') {
    $email = trim($_POST['email'] ?? '');
    $pass  = $_POST['password'] ?? '';
    if (!$email || !$pass) jsonErr('Email et mot de passe requis.');

    $stmt = $pdo->prepare("SELECT * FROM client WHERE e_mail_client = ?");
    $stmt->execute([$email]);
    $client = $stmt->fetch();

    if (!$client) jsonErr('Email ou mot de passe incorrect.');

    $mdp = $client['mot_de_passe'] ?? '';
    $ok  = false;

    if (strlen($mdp) > 0 && $mdp[0] === '$') {
        $ok = password_verify($pass, $mdp);
    } else {
        $ok = ($pass === $mdp);
        if ($ok) {
            $hash = password_hash($pass, PASSWORD_DEFAULT);
            $pdo->prepare("UPDATE client SET mot_de_passe=? WHERE _Id_client=?")->execute([$hash, $client['_Id_client']]);
        }
    }

    if (!$ok) jsonErr('Email ou mot de passe incorrect.');

    $_SESSION['user'] = [
        'id'    => $client['_Id_client'],
        'name'  => $client['prenom_client'] . ' ' . $client['Nom_client'],
        'email' => $client['e_mail_client'],
        'role'  => $client['role'] ?? 'client',
    ];
    jsonOk(['user' => $_SESSION['user']]);
}

if ($action === 'register') {
    $nom     = trim($_POST['nom'] ?? '');
    $prenom  = trim($_POST['prenom'] ?? '');
    $email   = trim($_POST['email'] ?? '');
    $pass    = $_POST['password'] ?? '';

    if (!$nom || !$prenom || !$email || !$pass) jsonErr('Tous les champs sont requis.');
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) jsonErr('Email invalide.');
    if (strlen($pass) < 6) jsonErr('Le mot de passe doit faire au moins 6 caractères.');

    $check = $pdo->prepare("SELECT _Id_client FROM client WHERE e_mail_client = ?");
    $check->execute([$email]);
    if ($check->fetch()) jsonErr('Cet email est déjà utilisé.');

    $id   = generateId('cli_');
    $hash = password_hash($pass, PASSWORD_DEFAULT);
    $pdo->prepare("INSERT INTO client (_Id_client, Nom_client, prenom_client, e_mail_client, mot_de_passe, date_inscription_, role)
                   VALUES (?, ?, ?, ?, ?, CURDATE(), 'client')")
        ->execute([$id, $nom, $prenom, $email, $hash]);

    $_SESSION['user'] = [
        'id'    => $id,
        'name'  => $prenom . ' ' . $nom,
        'email' => $email,
        'role'  => 'client',
    ];
    jsonOk(['user' => $_SESSION['user']]);
}

if ($action === 'logout') {
    session_destroy();
    jsonOk();
}

if ($action === 'me') {
    if (isset($_SESSION['user'])) jsonOk(['user' => $_SESSION['user']]);
    else jsonOk(['user' => null]);
}

// ── Produits ─────────────────────────────────────────────────────────────────

if ($action === 'list') {
    $type = $_GET['type'] ?? null;
    if ($type) {
        $stmt = $pdo->prepare("SELECT * FROM produit WHERE type_produit = ? ORDER BY Nom_produit");
        $stmt->execute([$type]);
    } else {
        $stmt = $pdo->query("SELECT * FROM produit ORDER BY type_produit, Nom_produit");
    }
    jsonOk(['produits' => $stmt->fetchAll()]);
}

if ($action === 'get') {
    $id = $_GET['id'] ?? '';
    if (!$id) jsonErr('ID manquant.');
    $stmt = $pdo->prepare("SELECT * FROM produit WHERE id_produit = ?");
    $stmt->execute([$id]);
    $p = $stmt->fetch();
    if (!$p) jsonErr('Produit introuvable.');
    jsonOk(['produit' => $p]);
}

if ($action === 'add') {
    requireAdmin();
    $nom         = trim($_POST['nom'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $prix        = floatval($_POST['prix'] ?? 0);
    $type        = trim($_POST['type'] ?? '');
    $stock       = intval($_POST['stock'] ?? 0);
    $image       = trim($_POST['image'] ?? '');

    if (!$nom || !$description || !$prix || !$type) jsonErr('Champs obligatoires manquants.');

    $id = generateId('prod_');
    $pdo->prepare("INSERT INTO produit (id_produit, Nom_produit, description_produit, prix_produit, type_produit, stock_produit, image_produit)
                   VALUES (?, ?, ?, ?, ?, ?, ?)")
        ->execute([$id, $nom, $description, $prix, $type, $stock, $image]);
    jsonOk(['id' => $id]);
}

if ($action === 'edit') {
    requireAdmin();
    $id          = trim($_POST['id'] ?? '');
    $nom         = trim($_POST['nom'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $prix        = floatval($_POST['prix'] ?? 0);
    $type        = trim($_POST['type'] ?? '');
    $stock       = intval($_POST['stock'] ?? 0);
    $image       = trim($_POST['image'] ?? '');

    if (!$id || !$nom || !$description || !$prix || !$type) jsonErr('Champs obligatoires manquants.');

    $sets   = "Nom_produit=?, description_produit=?, prix_produit=?, type_produit=?, stock_produit=?";
    $params = [$nom, $description, $prix, $type, $stock];
    if ($image) { $sets .= ", image_produit=?"; $params[] = $image; }
    $params[] = $id;

    $pdo->prepare("UPDATE produit SET $sets WHERE id_produit=?")->execute($params);
    jsonOk();
}

if ($action === 'delete') {
    requireAdmin();
    $id = trim($_POST['id'] ?? '');
    if (!$id) jsonErr('ID manquant.');
    $pdo->prepare("DELETE FROM produit WHERE id_produit = ?")->execute([$id]);
    jsonOk();
}

if ($action === 'upload_image') {
    requireAdmin();
    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) jsonErr('Erreur lors de l\'upload.');

    $file     = $_FILES['image'];
    $maxSize  = 5 * 1024 * 1024;
    $allowed  = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    $finfo    = new finfo(FILEINFO_MIME_TYPE);
    $mimeType = $finfo->file($file['tmp_name']);

    if ($file['size'] > $maxSize)       jsonErr('Image trop lourde (max 5 Mo).');
    if (!in_array($mimeType, $allowed)) jsonErr('Format non autorisé (jpg, png, webp, gif).');

    $ext       = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename  = generateId('img_') . '.' . strtolower($ext);
    $uploadDir = __DIR__ . '/uploads/';
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
    if (!move_uploaded_file($file['tmp_name'], $uploadDir . $filename)) jsonErr('Impossible de sauvegarder le fichier.');

    jsonOk(['path' => 'uploads/' . $filename]);
}

// ── Commandes ────────────────────────────────────────────────────────────────

if ($action === 'commande') {
    // L'utilisateur doit être connecté
    if (!isset($_SESSION['user'])) jsonErr('Vous devez être connecté pour passer une commande.');

    $id_client = $_SESSION['user']['id'];
    $mode      = trim($_POST['mode']    ?? '');
    $adresse   = trim($_POST['adresse'] ?? '');
    $ville     = trim($_POST['ville']   ?? '');
    $date      = trim($_POST['date']    ?? '');
    $heure     = trim($_POST['heure']   ?? '');
    $note      = trim($_POST['note']    ?? '');
    $total     = floatval($_POST['total'] ?? 0);
    $articles  = trim($_POST['articles'] ?? '[]');

    if (!$mode || !$adresse || !$date || !$heure) jsonErr('Données de commande incomplètes.');

    // Créer la table si elle n'existe pas encore
    $pdo->exec("CREATE TABLE IF NOT EXISTS commande (
        id_commande    VARCHAR(32)    PRIMARY KEY,
        id_client      VARCHAR(32)    NOT NULL,
        mode_livraison VARCHAR(20)    NOT NULL,
        adresse        VARCHAR(255)   NOT NULL,
        ville          VARCHAR(100)   NOT NULL,
        date_souhaitee DATE           NOT NULL,
        heure_souhaitee TIME          NOT NULL,
        note           TEXT,
        total          DECIMAL(10,2)  NOT NULL,
        articles       TEXT           NOT NULL,
        date_commande  DATETIME       DEFAULT CURRENT_TIMESTAMP,
        statut         VARCHAR(30)    DEFAULT 'en attente'
    )");

    $id_commande = generateId('cmd_');
    $pdo->prepare("INSERT INTO commande
        (id_commande, id_client, mode_livraison, adresse, ville, date_souhaitee, heure_souhaitee, note, total, articles)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
        ->execute([$id_commande, $id_client, $mode, $adresse, $ville, $date, $heure, $note, $total, $articles]);

    jsonOk(['id_commande' => $id_commande]);
}

// ── Mes commandes (client) ────────────────────────────────────────────────────

if ($action === 'mes_commandes') {
    if (!isset($_SESSION['user'])) jsonErr('Non connecté.');
    $stmt = $pdo->prepare("SELECT * FROM commande WHERE id_client = ? ORDER BY date_commande DESC");
    $stmt->execute([$_SESSION['user']['id']]);
    jsonOk(['commandes' => $stmt->fetchAll()]);
}

// ── Toutes les commandes (admin) ──────────────────────────────────────────────

if ($action === 'toutes_commandes') {
    requireAdmin();
    $stmt = $pdo->query("SELECT c.*, cl.prenom_client, cl.Nom_client, cl.e_mail_client
        FROM commande c
        LEFT JOIN client cl ON c.id_client = cl._Id_client
        ORDER BY c.date_commande DESC");
    jsonOk(['commandes' => $stmt->fetchAll()]);
}

if ($action === 'update_statut') {
    requireAdmin();
    $id     = trim($_POST['id']     ?? '');
    $statut = trim($_POST['statut'] ?? '');
    $statuts_valides = ['en attente', 'confirmée', 'en préparation', 'prête', 'livrée', 'annulée'];
    if (!$id || !in_array($statut, $statuts_valides)) jsonErr('Données invalides.');
    $pdo->prepare("UPDATE commande SET statut=? WHERE id_commande=?")->execute([$statut, $id]);
    jsonOk();
}

jsonErr('Action inconnue.');
?>
