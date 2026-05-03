<?php
$host   = "sql313.infinityfree.com";
$dbname = "if0_41813847_LIBRAIRIE";
$user   = "if0_41813847";
$pass   = "salut123aze";

try {
    $pdo = new PDO(
        "mysql:host=localhost;port=3307;dbname=$dbname;charset=utf8mb4",
        $user,
        $pass
    );
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    die(json_encode(['ok' => false, 'error' => 'Erreur connexion : ' . $e->getMessage()]));
}
?>