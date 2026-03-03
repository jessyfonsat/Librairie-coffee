<?php
require 'connexion.php';

$sql="SELECT*FROM produit";
$stmt = $pdo->query($sql);
$produits = $stmt->fetchAll(PDO::FETCH_ASSOC);

?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <titleP>Produits</title>
</head>
<body>
    <h1>Nos produits</h1>

        <?php if (count($produits) === 0): ?>
           <p>Aucun produit pour le moment.</p>
        <?php else: ?>
             <p>Voici nos produits disponibles :</p>
        <?php foreach ($produits as $p): ?>
            <div style="border:1px solid #ccc; padding:10px;margin:10px;">
             <h3><?= htmlspecialchars($p['Nom_produit'] ?? $p['nom_produit'] ?? '') ?></h3>
             <p><?= htmlspecialchars($p['description_produit'] ?? '') ?></p>
            <strong><?= htmlspecialchars($p['prix_produit'] ?? '') ?> €</strong>
        <?php endforeach; ?>
        <?php endif; ?>

</body>
 
</html>