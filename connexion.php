<?php
$is_local = (strpos($_SERVER['HTTP_HOST'], 'localhost') !== false || strpos($_SERVER['HTTP_HOST'], '127.0.0.1') !== false);

if ($is_local) {
    $host   = "localhost";
    $port   = "3306";
    $dbname = "librairie-coffee";
    $user   = "root";
    $pass   = "";
    $dsn    = "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4";
} else {
    $host   = "sql313.infinityfree.com";
    $dbname = "if0_41813847_LIBRAIRIE";
    $user   = "if0_41813847";
    $pass   = "salut123aze";
    $dsn    = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
}

try {
    $pdo = new PDO($dsn, $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    die(json_encode(['ok' => false, 'error' => 'Erreur connexion : ' . $e->getMessage()]));
}
?>

// lksdjlkjflsjflksq
