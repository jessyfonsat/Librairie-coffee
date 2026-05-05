const API = 'api_produits.php';

async function apiGet(action, params = {}) {
    const url = new URL(API, location.href);
    url.searchParams.set('action', action);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
}

async function apiPost(action, data = {}) {
    const body = new FormData();
    body.append('action', action);
    Object.entries(data).forEach(([k, v]) => body.append(k, v));
    const res = await fetch(API, { method: 'POST', body });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
}

async function apiPostFile(action, data = {}, fileField, file) {
    const body = new FormData();
    body.append('action', action);
    Object.entries(data).forEach(([k, v]) => body.append(k, v));
    if (file) body.append(fileField, file);
    const res = await fetch(API, { method: 'POST', body });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
}

let _currentUser = null;

async function fetchMe() {
    try {
        const data = await apiGet('me');
        _currentUser = data.user || null;
    } catch (e) {
        _currentUser = null;
    }
    updateAuthUI(true);
    return _currentUser;
}

function getCurrentUser() { return _currentUser; }
function isAdmin() { return _currentUser && _currentUser.role === 'admin'; }

async function logout() {
    try { await apiPost('logout'); } catch (e) {}
    _currentUser = null;
    updateAuthUI(false);
}

function updateAuthUI(skipRender = false) {
    const user = _currentUser;
    document.querySelectorAll('.auth-area').forEach(el => {
        if (user) {
            let adminBtn = isAdmin()
                ? ' <button onclick="openOrdersPanel()" class="btn-auth btn-auth-outline" style="font-size:12px;padding:6px 12px;">Commandes</button>'
                : '';
            el.innerHTML = '<span class="user-greeting">Bonjour ' + escHtml(user.name) + '</span> <button onclick="logout()" class="btn-logout">Deconnexion</button>' + adminBtn;
        } else {
            el.innerHTML = '<button onclick="openModal(\'login\')" class="btn-auth">Connexion</button> <button onclick="openModal(\'register\')" class="btn-auth btn-auth-outline">Creer un compte</button>';
        }
    });
    const banner = document.getElementById('admin-banner');
    if (banner) banner.style.display = isAdmin() ? 'block' : 'none';

    if (!skipRender && _currentCategory !== undefined && _currentContainerId !== undefined) {
        renderProducts(_currentCategory, _currentContainerId);
    }
}

function openModal(tab) {
    const m = document.getElementById('auth-modal');
    if (m) { m.style.display = 'flex'; switchTab(tab || 'login'); }
}
function closeModal() {
    const m = document.getElementById('auth-modal');
    if (m) m.style.display = 'none';
}
function switchTab(tab) {
    document.querySelectorAll('.modal-tab').forEach(function(t) { t.classList.toggle('active', t.dataset.tab === tab); });
    document.querySelectorAll('.modal-form').forEach(function(f) { f.style.display = f.dataset.form === tab ? 'flex' : 'none'; });
    document.querySelectorAll('.modal-msg').forEach(function(m) { m.textContent = ''; });
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass  = document.getElementById('login-pass').value;
    const msg   = document.getElementById('login-msg');
    msg.textContent = 'Connexion...';
    try {
        const data = await apiPost('login', { email: email, password: pass });
        if (data.ok) {
            _currentUser = data.user;
            closeModal();
            updateAuthUI(false);
        } else {
            msg.textContent = data.error;
        }
    } catch (e) {
        msg.textContent = 'Erreur de connexion au serveur.';
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const prenom = document.getElementById('reg-prenom').value;
    const nom    = document.getElementById('reg-nom').value;
    const email  = document.getElementById('reg-email').value;
    const pass   = document.getElementById('reg-pass').value;
    const pass2  = document.getElementById('reg-pass2').value;
    const msg    = document.getElementById('reg-msg');
    if (pass !== pass2) { msg.textContent = 'Les mots de passe ne correspondent pas.'; return; }
    msg.textContent = 'Creation du compte...';
    try {
        const data = await apiPost('register', { prenom: prenom, nom: nom, email: email, password: pass });
        if (data.ok) {
            _currentUser = data.user;
            closeModal();
            updateAuthUI(false);
        } else {
            msg.textContent = data.error;
        }
    } catch (e) {
        msg.textContent = 'Erreur de connexion au serveur.';
    }
}

function getCart()   { try { return JSON.parse(localStorage.getItem('sm_cart') || '[]'); } catch(e) { return []; } }
function saveCart(c) { localStorage.setItem('sm_cart', JSON.stringify(c)); }

function addToCart(product) {
    if (!_currentUser) {
        openModal('login');
        const msg = document.getElementById('login-msg');
        if (msg) msg.textContent = 'Connectez-vous pour ajouter des articles au panier.';
        return;
    }
    const cart = getCart();
    const existing = cart.find(function(i) { return i.id === product.id; });
    if (existing) existing.qty++;
    else cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 });
    saveCart(cart);
    updateCartUI();
    showToast('"' + product.name + '" ajoute au panier');
}

function removeFromCart(id) {
    saveCart(getCart().filter(function(i) { return i.id !== id; }));
    renderCart();
    updateCartUI();
}

function updateQty(id, delta) {
    const cart = getCart();
    const item = cart.find(function(i) { return i.id === id; });
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) saveCart(cart.filter(function(i) { return i.id !== id; }));
        else saveCart(cart);
    }
    renderCart();
    updateCartUI();
}

function updateCartUI() {
    const total = getCart().reduce(function(s, i) { return s + i.qty; }, 0);
    document.querySelectorAll('.cart-count').forEach(function(el) {
        el.textContent = total;
        el.style.display = total > 0 ? 'inline-flex' : 'none';
    });
}

function toggleCart() {
    const panel = document.getElementById('cart-panel');
    if (!panel) return;
    if (panel.classList.toggle('open')) renderCart();
}

function renderCart() {
    const list  = document.getElementById('cart-list');
    const total = document.getElementById('cart-total');
    if (!list) return;
    const cart = getCart();
    if (!cart.length) {
        list.innerHTML = '<p class="cart-empty">Votre panier est vide</p>';
        if (total) total.innerHTML = '';
        return;
    }
    list.innerHTML = cart.map(function(item) {
        return '<div class="cart-item">' +
            '<div class="cart-item-info">' +
            '<strong>' + escHtml(item.name) + '</strong>' +
            '<span>' + parseFloat(item.price).toFixed(2) + 'EUR x ' + item.qty + '</span>' +
            '</div>' +
            '<div class="cart-item-actions">' +
            '<button onclick="updateQty(\'' + item.id + '\',-1)">-</button>' +
            '<span>' + item.qty + '</span>' +
            '<button onclick="updateQty(\'' + item.id + '\',1)">+</button>' +
            '<button onclick="removeFromCart(\'' + item.id + '\')" class="cart-remove">X</button>' +
            '</div></div>';
    }).join('');
    const t = cart.reduce(function(s, i) { return s + parseFloat(i.price) * i.qty; }, 0);
    if (total) total.innerHTML = '<strong>Total : ' + t.toFixed(2) + ' EUR</strong>';
}

function showToast(text, duration) {
    duration = duration || 2500;
    var t = document.getElementById('sm-toast');
    if (!t) {
        t = document.createElement('div');
        t.id = 'sm-toast';
        t.className = 'sm-toast';
        document.body.appendChild(t);
    }
    t.textContent = text;
    t.classList.add('show');
    clearTimeout(t._timeout);
    t._timeout = setTimeout(function() { t.classList.remove('show'); }, duration);
}

var _checkoutMode = 'livraison';

function openCheckout() {
    var cart = getCart();
    if (!cart.length) {
        showToast('Votre panier est vide !');
        return;
    }

    if (!document.getElementById('checkout-modal')) {
        var div = document.createElement('div');
        div.id = 'checkout-modal';
        div.style.display = 'none';
        div.innerHTML =
            '<div class="checkout-box">' +
            '<h2 style="font-family:\'Playfair Display\',serif;font-size:20px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;">' +
            'Finaliser ma commande <button class="modal-close" onclick="closeCheckout()">X</button></h2>' +

            '<div id="checkout-recap" style="background:rgba(47,94,47,.07);border:1px solid rgba(47,94,47,.15);border-radius:10px;padding:14px 16px;margin-bottom:20px;font-size:13px;"></div>' +

            '<div style="display:flex;gap:10px;margin-bottom:20px;">' +
            '<button class="checkout-mode-btn active" id="mode-livraison" onclick="selectMode(\'livraison\')">Livraison a domicile</button>' +
            '<button class="checkout-mode-btn" id="mode-surplace" onclick="selectMode(\'surplace\')">Retrait sur place</button>' +
            '</div>' +

            '<div id="checkout-form-livraison">' +
            '<div class="pe-field"><label>Adresse de livraison</label>' +
            '<input type="text" id="co-adresse" placeholder="Numero et rue"></div>' +
            '<div class="pe-field"><label>Code postal et Ville</label>' +
            '<input type="text" id="co-ville" placeholder="75001 Paris"></div>' +
            '<div style="display:flex;gap:12px;">' +
            '<div class="pe-field" style="flex:1"><label>Date souhaitee</label>' +
            '<input type="date" id="co-date-liv"></div>' +
            '<div class="pe-field" style="flex:1"><label>Heure souhaitee</label>' +
            '<input type="time" id="co-heure-liv" min="09:00" max="20:00"></div>' +
            '</div></div>' +

            '<div id="checkout-form-surplace" style="display:none;">' +
            '<p style="background:rgba(47,94,47,.08);border-radius:8px;padding:12px 14px;font-size:13px;line-height:1.6;margin-bottom:14px;">' +
            'Venez recuperer votre commande au 12 rue des Librairies, 75005 Paris</p>' +
            '<div style="display:flex;gap:12px;">' +
            '<div class="pe-field" style="flex:1"><label>Date de retrait</label>' +
            '<input type="date" id="co-date-sp"></div>' +
            '<div class="pe-field" style="flex:1"><label>Heure de retrait</label>' +
            '<input type="time" id="co-heure-sp" min="09:00" max="20:00"></div>' +
            '</div>' +
            '<p style="font-size:12px;opacity:.6;margin-top:8px;text-align:center;">Horaires : Mar-Ven 9h-19h | Sam-Dim 10h-20h</p>' +
            '</div>' +

            '<div class="pe-field"><label>Note ou commentaire (optionnel)</label>' +
            '<textarea id="co-note" placeholder="Allergie, precision sur la commande..." style="resize:vertical;min-height:70px;"></textarea></div>' +

            '<div id="checkout-msg" class="pe-msg"></div>' +

            '<div class="pe-actions">' +
            '<button class="pe-btn-cancel" onclick="closeCheckout()">Annuler</button>' +
            '<button class="pe-btn-save" onclick="submitCheckout()">Confirmer la commande</button>' +
            '</div></div>';

        document.body.appendChild(div);
        div.addEventListener('click', function(e) { if (e.target.id === 'checkout-modal') closeCheckout(); });
    }

    var total = cart.reduce(function(s, i) { return s + parseFloat(i.price) * i.qty; }, 0);
    var recapEl = document.getElementById('checkout-recap');
    recapEl.innerHTML = cart.map(function(i) {
        return '<div style="display:flex;justify-content:space-between;padding:4px 0;opacity:.85;">' +
            '<span>' + escHtml(i.name) + ' x ' + i.qty + '</span>' +
            '<span>' + (parseFloat(i.price) * i.qty).toFixed(2) + 'EUR</span></div>';
    }).join('') +
    '<div style="display:flex;justify-content:space-between;padding-top:10px;margin-top:8px;border-top:1px solid rgba(47,94,47,.15);font-size:14px;">' +
    '<strong>Total</strong><strong>' + total.toFixed(2) + 'EUR</strong></div>';

    var today = new Date().toISOString().split('T')[0];
    ['co-date-liv','co-date-sp'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) { el.min = today; el.value = today; }
    });
    ['co-heure-liv','co-heure-sp'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.value = '12:00';
    });

    document.getElementById('checkout-msg').textContent = '';
    selectMode('livraison');
    var modal = document.getElementById('checkout-modal');
    modal.style.display = 'flex';
}

function closeCheckout() {
    var m = document.getElementById('checkout-modal');
    if (m) m.style.display = 'none';
}

function selectMode(mode) {
    _checkoutMode = mode;
    document.getElementById('checkout-form-livraison').style.display = mode === 'livraison' ? 'block' : 'none';
    document.getElementById('checkout-form-surplace').style.display  = mode === 'surplace'  ? 'block' : 'none';
    document.getElementById('mode-livraison').classList.toggle('active', mode === 'livraison');
    document.getElementById('mode-surplace').classList.toggle('active', mode === 'surplace');
}

async function submitCheckout() {
    var msg  = document.getElementById('checkout-msg');
    var cart = getCart();
    msg.textContent = '';

    var adresse = '', ville = '', date = '', heure = '';

    if (_checkoutMode === 'livraison') {
        adresse = document.getElementById('co-adresse').value.trim();
        ville   = document.getElementById('co-ville').value.trim();
        date    = document.getElementById('co-date-liv').value;
        heure   = document.getElementById('co-heure-liv').value;
        if (!adresse) { msg.textContent = 'Veuillez entrer votre adresse.'; return; }
        if (!ville)   { msg.textContent = 'Veuillez entrer votre ville.'; return; }
        if (!date)    { msg.textContent = 'Veuillez choisir une date de livraison.'; return; }
        if (!heure)   { msg.textContent = 'Veuillez choisir une heure de livraison.'; return; }
    } else {
        adresse = '12 rue des Librairies';
        ville   = '75005 Paris';
        date    = document.getElementById('co-date-sp').value;
        heure   = document.getElementById('co-heure-sp').value;
        if (!date)  { msg.textContent = 'Veuillez choisir une date de retrait.'; return; }
        if (!heure) { msg.textContent = 'Veuillez choisir une heure de retrait.'; return; }
    }

    var note  = document.getElementById('co-note').value.trim();
    var total = cart.reduce(function(s, i) { return s + parseFloat(i.price) * i.qty; }, 0);

    msg.textContent = 'Envoi de la commande...';
    try {
        var data = await apiPost('commande', {
            mode:     _checkoutMode,
            adresse:  adresse,
            ville:    ville,
            date:     date,
            heure:    heure,
            note:     note,
            total:    total.toFixed(2),
            articles: JSON.stringify(cart.map(function(i) { return { id: i.id, nom: i.name, prix: i.price, qte: i.qty }; }))
        });
        if (!data.ok) {
            msg.textContent = 'Erreur : ' + data.error;
            return;
        }
    } catch (e) {
        console.warn('Commande non enregistree cote serveur :', e);
    }

    closeCheckout();
    saveCart([]);
    updateCartUI();
    var panel = document.getElementById('cart-panel');
    if (panel) panel.classList.remove('open');
    renderCart();
    showToast('Commande confirmee ! A bientot chez Sepia & Moka', 5000);
}

var _currentCategory    = undefined;
var _currentContainerId = undefined;

async function renderProducts(category, containerId) {
    _currentCategory    = category;
    _currentContainerId = containerId;
    var container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '<p style="text-align:center;padding:40px;opacity:.5;">Chargement des produits...</p>';

    var data;
    try {
        data = await apiGet('list', { type: category });
    } catch (e) {
        container.innerHTML = '<p style="color:#c0392b;text-align:center;padding:20px;">Impossible de contacter le serveur PHP.<br><small>Verifiez que XAMPP/WAMP est demarre et que api_produits.php est present.</small></p>';
        return;
    }

    if (!data.ok) {
        container.innerHTML = '<p style="color:#c0392b;text-align:center;padding:20px;">Erreur : ' + escHtml(data.error) + '</p>';
        return;
    }

    var produits = data.produits || [];
    var admin    = isAdmin();

    if (produits.length === 0 && !admin) {
        container.innerHTML = '<p style="text-align:center;padding:40px;opacity:.5;">Aucun produit pour le moment.</p>';
        return;
    }

    var cards = produits.map(function(p) {
        var imgSrc = p.image_produit || '';
        var stockInfo = p.stock_produit > 0
            ? 'Stock : ' + p.stock_produit
            : '<span style="color:#ff8a80">Rupture de stock</span>';
        var btnDisabled = p.stock_produit <= 0 ? ' disabled style="opacity:.4;cursor:not-allowed"' : '';
        var btnLabel    = p.stock_produit > 0 ? '+ Panier' : 'Indisponible';
        var adminBtns   = admin
            ? '<div class="admin-product-btns">' +
              '<button class="btn-admin-edit" onclick="openProductEditor(\'' + escHtml(category) + '\',\'' + escHtml(p.id_produit) + '\')">Modifier</button>' +
              '<button class="btn-admin-del" onclick="confirmDeleteProduct(\'' + escHtml(p.id_produit) + '\')">Supprimer</button>' +
              '</div>'
            : '';
        return '<div class="product" data-id="' + escHtml(p.id_produit) + '">' +
            '<div class="product-img-wrap">' +
            '<img src="' + escHtml(imgSrc) + '" alt="' + escHtml(p.Nom_produit) + '" width="200" height="220"' +
            ' style="object-fit:cover;border-radius:8px;display:block;" onerror="this.style.background=\'#ddd\';this.removeAttribute(\'src\')">' +
            '<div class="product-tooltip"><strong>' + escHtml(p.Nom_produit) + '</strong><br><br>' +
            escHtml(p.description_produit) + '<br><br>' + stockInfo + '</div>' +
            '</div>' +
            '<div style="margin-top:6px;">' + escHtml(p.Nom_produit) + '<br>' + parseFloat(p.prix_produit).toFixed(2) + 'EUR</div>' +
            '<button class="btn-add-cart" data-id="' + escHtml(p.id_produit) + '" data-name="' + escHtml(p.Nom_produit) + '" data-price="' + parseFloat(p.prix_produit) + '"' + btnDisabled + '>' + btnLabel + '</button>' +
            adminBtns + '</div>';
    }).join('');

    var addBtn = admin
        ? '<div class="product product-add-new" onclick="openProductEditor(\'' + escHtml(category) + '\', null)">' +
          '<div class="add-new-inner"><span class="add-new-icon">+</span><span>Ajouter un produit</span></div></div>'
        : '';

    container.innerHTML = cards + addBtn;

    container.querySelectorAll('.btn-add-cart').forEach(function(btn) {
        btn.addEventListener('click', function() {
            addToCart({ id: this.dataset.id, name: this.dataset.name, price: parseFloat(this.dataset.price) });
        });
    });
}

async function confirmDeleteProduct(id) {
    if (!confirm('Supprimer ce produit definitivement ?')) return;
    try {
        var data = await apiPost('delete', { id: id });
        if (data.ok) renderProducts(_currentCategory, _currentContainerId);
        else alert('Erreur : ' + data.error);
    } catch (e) {
        alert('Erreur de connexion au serveur.');
    }
}

var _editorCategory  = null;
var _editorProductId = null;
var _pendingFile     = null;

async function openProductEditor(category, id) {
    _editorCategory  = category;
    _editorProductId = id;
    _pendingFile     = null;

    var modal = document.getElementById('product-editor-modal');
    if (!modal) return;

    document.getElementById('pe-title').textContent = id ? 'Modifier le produit' : 'Ajouter un produit';
    document.getElementById('pe-name').value        = '';
    document.getElementById('pe-desc').value        = '';
    document.getElementById('pe-price').value       = '';
    document.getElementById('pe-stock').value       = '';
    document.getElementById('pe-msg').textContent   = '';
    document.getElementById('pe-img-file').value    = '';
    var prevImg = document.getElementById('pe-img-preview');
    prevImg.style.display = 'none';
    prevImg.src = '';

    if (id) {
        document.getElementById('pe-msg').textContent = 'Chargement...';
        try {
            var data = await apiGet('get', { id: id });
            document.getElementById('pe-msg').textContent = '';
            if (!data.ok) { alert('Erreur : ' + data.error); return; }
            var p = data.produit;
            document.getElementById('pe-name').value  = p.Nom_produit         || '';
            document.getElementById('pe-desc').value  = p.description_produit || '';
            document.getElementById('pe-price').value = p.prix_produit        || '';
            document.getElementById('pe-stock').value = p.stock_produit       || '';
            if (p.image_produit) { prevImg.src = p.image_produit; prevImg.style.display = 'block'; }
        } catch (e) {
            alert('Erreur de connexion au serveur.'); return;
        }
    }
    modal.style.display = 'flex';
}

function closeProductEditor() {
    var modal = document.getElementById('product-editor-modal');
    if (modal) modal.style.display = 'none';
}

function handleProductImageChange(input) {
    _pendingFile = input.files[0] || null;
    if (_pendingFile) {
        var reader = new FileReader();
        reader.onload = function(e) {
            var preview = document.getElementById('pe-img-preview');
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(_pendingFile);
    }
}

async function saveProductEditor() {
    var name  = document.getElementById('pe-name').value.trim();
    var desc  = document.getElementById('pe-desc').value.trim();
    var prix  = document.getElementById('pe-price').value;
    var stock = document.getElementById('pe-stock').value;
    var msg   = document.getElementById('pe-msg');

    if (!name)                          { msg.textContent = 'Le nom est obligatoire.'; return; }
    if (!desc)                          { msg.textContent = 'La description est obligatoire.'; return; }
    if (!prix || parseFloat(prix) <= 0) { msg.textContent = 'Le prix doit etre un nombre positif.'; return; }
    if (!_editorProductId && !_pendingFile) { msg.textContent = 'Veuillez choisir une image pour le nouveau produit.'; return; }

    msg.textContent = 'Enregistrement en cours...';
    try {
        var imagePath = '';
        if (_pendingFile) {
            var upData = await apiPostFile('upload_image', {}, 'image', _pendingFile);
            if (!upData.ok) { msg.textContent = 'Erreur upload : ' + upData.error; return; }
            imagePath = upData.path;
        }
        var payload = { nom: name, description: desc, prix: prix, stock: stock, type: _editorCategory };
        if (imagePath) payload.image = imagePath;

        var data;
        if (_editorProductId) {
            payload.id = _editorProductId;
            data = await apiPost('edit', payload);
        } else {
            data = await apiPost('add', payload);
        }
        if (data.ok) { closeProductEditor(); renderProducts(_currentCategory, _currentContainerId); }
        else msg.textContent = data.error;
    } catch (e) {
        msg.textContent = 'Erreur de connexion au serveur.';
    }
}

var _ordersFilterStatut = '';

async function openOrdersPanel() {
    if (!isAdmin()) return;

    var existing = document.getElementById('orders-panel');
    if (existing) {
        existing.style.display = 'flex';
        loadOrders();
        return;
    }

    var panel = document.createElement('div');
    panel.id = 'orders-panel';
    panel.innerHTML =
        '<div class="orders-box">' +
        '<div class="orders-header">' +
        '<h2>Gestion des commandes</h2>' +
        '<button class="modal-close" onclick="closeOrdersPanel()">X</button>' +
        '</div>' +
        '<div class="orders-toolbar">' +
        '<select id="orders-filter-statut" onchange="filterOrders()">' +
        '<option value="">Tous les statuts</option>' +
        '<option value="en attente">En attente</option>' +
        '<option value="confirmée">Confirmée</option>' +
        '<option value="en préparation">En préparation</option>' +
        '<option value="prête">Prête</option>' +
        '<option value="livrée">Livrée</option>' +
        '<option value="annulée">Annulée</option>' +
        '</select>' +
        '<button class="orders-refresh-btn" onclick="loadOrders()">Actualiser</button>' +
        '</div>' +
        '<div id="orders-list" class="orders-list"><p class="orders-loading">Chargement...</p></div>' +
        '</div>';

    panel.style.display = 'flex';
    panel.addEventListener('click', function(e) { if (e.target.id === 'orders-panel') closeOrdersPanel(); });
    document.body.appendChild(panel);
    loadOrders();
}

function closeOrdersPanel() {
    var panel = document.getElementById('orders-panel');
    if (panel) panel.style.display = 'none';
}

function filterOrders() {
    _ordersFilterStatut = document.getElementById('orders-filter-statut').value;
    renderOrdersList(window._lastOrdersData || []);
}

async function loadOrders() {
    var list = document.getElementById('orders-list');
    if (!list) return;
    list.innerHTML = '<p class="orders-loading">Chargement...</p>';
    try {
        var data = await apiGet('toutes_commandes');
        if (!data.ok) {
            list.innerHTML = '<p class="orders-error">Erreur : ' + escHtml(data.error) + '</p>';
            return;
        }
        window._lastOrdersData = data.commandes || [];
        renderOrdersList(window._lastOrdersData);
    } catch (e) {
        list.innerHTML = '<p class="orders-error">Impossible de contacter le serveur.</p>';
    }
}

function renderOrdersList(commandes) {
    var list = document.getElementById('orders-list');
    if (!list) return;

    var filtered = _ordersFilterStatut
        ? commandes.filter(function(c) { return c.statut === _ordersFilterStatut; })
        : commandes;

    if (!filtered.length) {
        list.innerHTML = '<p class="orders-empty">Aucune commande trouvee.</p>';
        return;
    }

    var statutColors = {
        'en attente':     '#f39c12',
        'confirmée':      '#2980b9',
        'en préparation': '#8e44ad',
        'prête':          '#27ae60',
        'livrée':         '#7f8c8d',
        'annulée':        '#c0392b'
    };

    list.innerHTML = filtered.map(function(c) {
        var articles = [];
        try { articles = JSON.parse(c.articles || '[]'); } catch(e) {}
        var color = statutColors[c.statut] || '#888';
        var modeLabel = c.mode_livraison === 'surplace' ? 'Retrait sur place' : 'Livraison';
        var dateCmd = c.date_commande ? new Date(c.date_commande).toLocaleString('fr-FR') : '-';
        var dateSouhaitee = c.date_souhaitee ? c.date_souhaitee : '-';
        var heureSouhaitee = c.heure_souhaitee ? c.heure_souhaitee.slice(0,5) : '-';
        var clientName = c.prenom_client ? escHtml(c.prenom_client + ' ' + c.Nom_client) : 'Client inconnu';
        var clientEmail = c.e_mail_client ? escHtml(c.e_mail_client) : '';

        return '<div class="order-card">' +
            '<div class="order-card-header">' +
            '<div>' +
            '<span class="order-id">#' + escHtml(c.id_commande) + '</span>' +
            '<span class="order-date">' + dateCmd + '</span>' +
            '</div>' +
            '<span class="order-statut-badge" style="background:' + color + ';">' + escHtml(c.statut) + '</span>' +
            '</div>' +
            '<div class="order-card-body">' +
            '<div class="order-info-row"><span class="order-info-label">Client</span><span>' + clientName + (clientEmail ? ' - ' + clientEmail : '') + '</span></div>' +
            '<div class="order-info-row"><span class="order-info-label">Mode</span><span>' + modeLabel + '</span></div>' +
            '<div class="order-info-row"><span class="order-info-label">Adresse</span><span>' + escHtml(c.adresse) + ', ' + escHtml(c.ville) + '</span></div>' +
            '<div class="order-info-row"><span class="order-info-label">Date souhaitee</span><span>' + dateSouhaitee + ' a ' + heureSouhaitee + '</span></div>' +
            (c.note ? '<div class="order-info-row"><span class="order-info-label">Note</span><span>' + escHtml(c.note) + '</span></div>' : '') +
            '<div class="order-articles">' +
            articles.map(function(a) {
                return '<span class="order-article-tag">' + escHtml(a.nom || a.name || '') + ' x ' + (a.qte || a.qty || 1) + ' - ' + parseFloat(a.prix || a.price || 0).toFixed(2) + 'EUR</span>';
            }).join('') +
            '</div>' +
            '<div class="order-card-footer">' +
            '<strong class="order-total">Total : ' + parseFloat(c.total).toFixed(2) + ' EUR</strong>' +
            '<div class="order-statut-actions">' +
            '<select class="order-statut-select" onchange="updateOrderStatut(\'' + escHtml(c.id_commande) + '\', this.value)">' +
            ['en attente','confirmée','en préparation','prête','livrée','annulée'].map(function(s) {
                return '<option value="' + s + '"' + (c.statut === s ? ' selected' : '') + '>' + s + '</option>';
            }).join('') +
            '</select>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
    }).join('');
}

async function updateOrderStatut(id, statut) {
    try {
        var data = await apiPost('update_statut', { id: id, statut: statut });
        if (data.ok) {
            var c = (window._lastOrdersData || []).find(function(o) { return o.id_commande === id; });
            if (c) c.statut = statut;
            renderOrdersList(window._lastOrdersData || []);
            showToast('Statut mis a jour : ' + statut);
        } else {
            showToast('Erreur : ' + data.error, 3000);
        }
    } catch (e) {
        showToast('Erreur de connexion.', 3000);
    }
}

function escHtml(s) {
    return String(s == null ? '' : s)
        .replace(/&/g,'&amp;').replace(/</g,'&lt;')
        .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

document.addEventListener('DOMContentLoaded', async function() {
    await fetchMe();
    updateCartUI();

    var authModal = document.getElementById('auth-modal');
    if (authModal) authModal.addEventListener('click', function(e) { if (e.target.id === 'auth-modal') closeModal(); });

    var peModal = document.getElementById('product-editor-modal');
    if (peModal) peModal.addEventListener('click', function(e) { if (e.target.id === 'product-editor-modal') closeProductEditor(); });

    document.addEventListener('click', function(e) {
        var panel   = document.getElementById('cart-panel');
        var cartBtn = document.querySelector('.cart-btn');
        if (panel && panel.classList.contains('open') && !panel.contains(e.target) && !(cartBtn && cartBtn.contains(e.target))) {
            panel.classList.remove('open');
        }
    });
});
