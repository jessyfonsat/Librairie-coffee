<?php
require 'connexion.php';

$message = "";

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $nom = $_POST['nom_produit'] ?? '';
    $description = $_POST['description_produit'] ?? '';
    $prix = $_POST['prix_produit'] ?? '';
    $type = $_POST['type_produit'] ?? '';
    $stock = $_POST['stock_produit'] ?? '';

    if (!empty($nom) && !empty($description) && !empty($prix) && !empty($type) && !empty($stock)) {
        $sql = "INSERT INTO produit (Nom_produit, description_produit, prix_produit, type_produit, stock_produit)
                VALUES (?, ?, ?, ?, ?)";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([$nom, $description, $prix, $type, $stock]);

        $message = "Produit ajouté avec succès !";
    } else {
        $message = "Tous les champs sont obligatoires.";
    }
}
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Ajouter un produit</title>
</head>
<body>

    <h1>Ajouter un produit</h1>

    <p><a href="Produits.php">Retour aux produits</a></p>

    <?php if (!empty($message)): ?>
        <p><?= htmlspecialchars($message) ?></p>
    <?php endif; ?>

    <form method="POST" action="">
        <label>Nom du produit :</label><br>
        <input type="text" name="nom_produit"><br><br>

        <label>Description :</label><br>
        <textarea name="description_produit"></textarea><br><br>

        <label>Prix :</label><br>
        <input type="number" step="0.01" name="prix_produit"><br><br>

        <label>Type :</label><br>
        <input type="text" name="type_produit"><br><br>

        <label>Stock :</label><br>
        <input type="number" name="stock_produit"><br><br>

        <button type="submit">Ajouter</button>
    </form>

</body>
</html>