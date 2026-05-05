<?php 
$page = $_GET['page'] ?? 'accueil';
?>

<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Library Cafe</title>
  
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Montserrat', sans-serif;
      background: #e7e0c9;
      color: #2f5e2f;
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 40px;
      background: rgba(255,255,255,0.3);
    }

    nav a {
      margin-right: 20px;
      text-decoration: none;
      color: #2f5e2f;
      font-weight: 600;
      font-size: 14px;
    }

    .logo {
      font-weight: 700;
      letter-spacing: 2px;
    }

    .ticker {
      white-space: nowrap;
      overflow: hidden;
      border-top: 1px solid rgba(0,0,0,0.1);
      border-bottom: 1px solid rgba(0,0,0,0.1);
      padding: 6px 0;
      font-size: 12px;
    }

    .ticker span {
      display: inline-block;
      padding-left: 100%;
      animation: scroll 18s linear infinite;
    }

    @keyframes scroll {
      from { transform: translateX(0); }
      to { transform: translateX(-100%); }
    }

    .hero {
      padding: 80px 60px 40px;
      font-size: 28px;
      font-weight: 700;
      line-height: 1.4;
    }

    .lines {
      padding: 20px 60px;
    }

    .line {
      height: 6px;
      background: #bdbdbd;
      border-radius: 10px;
      margin: 30px 0;
      opacity: 0.6;
    }

    .section-title {
      text-align: center;
      margin-top: 60px;
      font-weight: 700;
      letter-spacing: 1px;
    }

    .products {
      display: flex;
      justify-content: center;
      gap: 40px;
      padding: 40px;
      flex-wrap: wrap;
    }

    .product {
      text-align: center;
      font-size: 12px;
    }

    .bottle {
      width: 60px;
      height: 90px;
      background: linear-gradient(#eee, #cfcfcf);
      border-radius: 10px;
      margin: 0 auto 10px;
      box-shadow: inset 0 0 4px rgba(0,0,0,0.2);
    }

    footer {
      height: 80px;
    }

    @media (max-width: 768px) {
      .hero { font-size: 22px; padding: 60px 30px; }
      header { padding: 15px 20px; }
      .lines { padding: 20px 30px; }
    }
  </style>
</head>
<body>

  <header>
    <nav>
      <a href="index.php?page=accueil">Accueil</a>
      <a href="index.php?page=menu">Menu</a>
      <a href="index.php?page=librairie">Librairie</a>
      <a href="index.php?page=apropos">À propos</a>
    </nav>
    <div class="logo">Sépia & Moka</div>
    <div>🛒</div>
  </header>

  <div class="ticker">
    <div class="ticker-track">
      <span>Profitez de nos boissons chaudes et de nos livres ! &nbsp;&nbsp;&nbsp; Nouveautés chaque semaine &nbsp;&nbsp;&nbsp; Venez nous rendre visite !</span>
      <span>Profitez de nos boissons chaudes et de nos livres ! &nbsp;&nbsp;&nbsp; Nouveautés chaque semaine &nbsp;&nbsp;&nbsp; Venez nous rendre visite !</span>
    </div>
  </div>

  <?php if ($page == 'accueil') : ?>
    <section class="hero">
      Bienvenue chers lecteurs,<br>
      CHEZ NOUS ON DÉVORE LES LIVRES AUTOUR D'UN BON CAFÉ !
    </section>
  <?php endif; ?>

  <main>
    <?php
      if ($page == 'accueil') {
        include 'acceuil.php';
      }

      elseif ($page == 'menu') {
        include 'boissons.html';
      }

      elseif ($page == 'librairie') {
        include 'librairie.html';
      }

      elseif ($page == 'apropos') {
        include 'apropos.html';
      }

      else {
        echo "<p>Page non trouvée.</p>";
      }
    ?>
  </main>

  <footer>
    <div class="footer-inner">
      <div class="footer-brand">
        <span class="footer-logo">Sépia &amp; Moka</span>
        <p>Café-librairie indépendant</p>
        <p>Ouvert du mardi au dimanche · 9h–19h</p>
      </div>
    </div>
    <div class="footer-bottom">© 2026 Sépia &amp; Moka — Tous droits réservés</div>
  </footer>

</body>
</html>