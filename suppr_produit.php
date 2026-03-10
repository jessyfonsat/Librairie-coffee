<?php
require 'connexion.php';

if (!isset($_GET['id'])) {
    die("ID du produit manquant.");
}

$id = $_GET['id'];

$sql = "DELETE FROM produit WHERE id_produit = ?";
$stmt = $pdo->prepare($sql);
$stmt->execute([$id]);

header("Location: Produits.php");
exit;
?>