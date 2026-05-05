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
    try { await apiPost('logout'); } catch (e) { /* ignore */ }
    _currentUser = null;
    updateAuthUI(false); 
}


function updateAuthUI(skipRender = false) {
    const user = _currentUser;
    document.querySelectorAll('.auth-area').forEach(el => {
        if (user) {
            el.innerHTML = `<span class="user-greeting">👋 ${escHtml(user.name)}</span> <button onclick="logout()" class="btn-logout">Déconnexion</button>`;
        } else {
            el.innerHTML = `<button onclick="openModal('login')" class="btn-auth">Connexion</button> <button onclick="openModal('register')" class="btn-auth btn-auth-outline">Créer un compte</button>`;
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
    document.querySelectorAll('.modal-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    document.querySelectorAll('.modal-form').forEach(f => f.style.display = f.dataset.form === tab ? 'flex' : 'none');
    document.querySelectorAll('.modal-msg').forEach(m => m.textContent = '');
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass  = document.getElementById('login-pass').value;
    const msg   = document.getElementById('login-msg');
    msg.textContent = 'Connexion...';
    try {
        const data = await apiPost('login', { email, password: pass });
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
        const data = await apiPost('register', { prenom, nom, email, password: pass });
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



function getCart()   { try { return JSON.parse(localStorage.getItem('sm_cart') || '[]'); } catch { return []; } }
function saveCart(c) { localStorage.setItem('sm_cart', JSON.stringify(c)); }

function addToCart(product) {
    if (!_currentUser) {
        openModal('login');
        const msg = document.getElementById('login-msg');
        if (msg) msg.textContent = '⚠️ Connectez-vous pour ajouter des articles au panier.';
        return;
    }
    const cart = getCart();
    const existing = cart.find(i => i.id === product.id);
    if (existing) existing.qty++;
    else cart.push({ ...product, qty: 1 });
    saveCart(cart);
    updateCartUI();
    showCartToast(product.name);
}

function removeFromCart(id) {
    saveCart(getCart().filter(i => i.id !== id));
    renderCart(); updateCartUI();
}

function updateQty(id, delta) {
    const cart = getCart();
    const item = cart.find(i => i.id === id);
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) saveCart(cart.filter(i => i.id !== id));
        else saveCart(cart);
    }
    renderCart(); updateCartUI();
}

function updateCartUI() {
    const total = getCart().reduce((s, i) => s + i.qty, 0);
    document.querySelectorAll('.cart-count').forEach(el => {
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
        list.innerHTML = '<p class="cart-empty">Votre panier est vide 🫖</p>';
        if (total) total.innerHTML = '';
        return;
    }
    list.innerHTML = cart.map(item => `
        <div class="cart-item">
          <div class="cart-item-info">
            <strong>${escHtml(item.name)}</strong>
            <span>${parseFloat(item.price).toFixed(2)}€ × ${item.qty}</span>
          </div>
          <div class="cart-item-actions">
            <button onclick="updateQty('${item.id}',-1)">−</button>
            <span>${item.qty}</span>
            <button onclick="updateQty('${item.id}',1)">+</button>
            <button onclick="removeFromCart('${item.id}')" class="cart-remove">✕</button>
          </div>
        </div>`).join('');
    const t = cart.reduce((s, i) => s + parseFloat(i.price) * i.qty, 0);
    if (total) total.innerHTML = `<strong>Total : ${t.toFixed(2)} €</strong>`;
}

function showCartToast(name) {
    let t = document.getElementById('sm-toast');
    if (!t) { t = document.createElement('div'); t.id = 'sm-toast'; t.className = 'sm-toast'; document.body.appendChild(t); }
    t.textContent = `✓ "${name}" ajouté au panier`;
    t.classList.add('show');
    clearTimeout(t._timeout);
    t._timeout = setTimeout(() => t.classList.remove('show'), 2500);
}


let _currentCategory    = undefined;
let _currentContainerId = undefined;


async function renderProducts(category, containerId) {
    _currentCategory    = category;
    _currentContainerId = containerId;
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '<p style="text-align:center;padding:40px;opacity:.5;">Chargement des produits...</p>';

    let data;
    try {
        data = await apiGet('list', { type: category });
    } catch (e) {
        container.innerHTML = `<p style="color:#c0392b;text-align:center;padding:20px;">
            Impossible de contacter le serveur PHP.<br>
            <small>Verifiez que XAMPP/WAMP est demarré et que le fichier api_produits.php est présent.</small>
        </p>`;
        return;
    }

    if (!data.ok) {
        container.innerHTML = `<p style="color:#c0392b;text-align:center;padding:20px;">Erreur : ${escHtml(data.error)}</p>`;
        return;
    }

    const produits = data.produits || [];
    const admin    = isAdmin();

    if (produits.length === 0 && !admin) {
        container.innerHTML = '<p style="text-align:center;padding:40px;opacity:.5;">Aucun produit pour le moment.</p>';
        return;
    }

    const cards = produits.map(p => {
        const imgSrc = p.image_produit || '';
        return `
        <div class="product" data-id="${escHtml(p.id_produit)}">
          <div class="product-img-wrap">
            <img src="${escHtml(imgSrc)}" alt="${escHtml(p.Nom_produit)}" width="200" height="220"
                 style="object-fit:cover;border-radius:8px;display:block;"
                 onerror="this.style.background='#ddd';this.removeAttribute('src')">
            <div class="product-tooltip">
              <strong>${escHtml(p.Nom_produit)}</strong><br><br>
              ${escHtml(p.description_produit)}<br><br>
              ${p.stock_produit > 0 ? 'Stock : ' + p.stock_produit : '<span style="color:#ff8a80">Rupture de stock</span>'}
            </div>
          </div>
          <div style="margin-top:6px;">${escHtml(p.Nom_produit)}<br>${parseFloat(p.prix_produit).toFixed(2)}€</div>
          <button class="btn-add-cart"
            data-id="${escHtml(p.id_produit)}"
            data-name="${escHtml(p.Nom_produit)}"
            data-price="${parseFloat(p.prix_produit)}"
            ${p.stock_produit <= 0 ? 'disabled style="opacity:.4;cursor:not-allowed"' : ''}>
            ${p.stock_produit > 0 ? '+ Panier' : 'Indisponible'}
          </button>
          ${admin ? `
          <div class="admin-product-btns">
            <button class="btn-admin-edit" onclick="openProductEditor('${escHtml(category)}','${escHtml(p.id_produit)}')">✏️ Modifier</button>
            <button class="btn-admin-del"  onclick="confirmDeleteProduct('${escHtml(p.id_produit)}')">🗑️</button>
          </div>` : ''}
        </div>`;
    }).join('');

    const addBtn = admin ? `
        <div class="product product-add-new" onclick="openProductEditor('${escHtml(category)}', null)">
          <div class="add-new-inner">
            <span class="add-new-icon">＋</span>
            <span>Ajouter un produit</span>
          </div>
        </div>` : '';

    container.innerHTML = cards + addBtn;

    
    container.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.addEventListener('click', function() {
            addToCart({
                id:    this.dataset.id,
                name:  this.dataset.name,
                price: parseFloat(this.dataset.price)
            });
        });
    });
}

async function confirmDeleteProduct(id) {
    if (!confirm('Supprimer ce produit définitivement ?')) return;
    try {
        const data = await apiPost('delete', { id });
        if (data.ok) renderProducts(_currentCategory, _currentContainerId);
        else alert('Erreur : ' + data.error);
    } catch (e) {
        alert('Erreur de connexion au serveur.');
    }
}



let _editorCategory  = null;
let _editorProductId = null;
let _pendingFile     = null;

async function openProductEditor(category, id) {
    _editorCategory  = category;
    _editorProductId = id;
    _pendingFile     = null;

    const modal = document.getElementById('product-editor-modal');
    if (!modal) return;

    document.getElementById('pe-title').textContent         = id ? 'Modifier le produit' : 'Ajouter un produit';
    document.getElementById('pe-name').value                = '';
    document.getElementById('pe-desc').value                = '';
    document.getElementById('pe-price').value               = '';
    document.getElementById('pe-stock').value               = '';
    document.getElementById('pe-msg').textContent           = '';
    document.getElementById('pe-img-file').value            = '';
    const prevImg = document.getElementById('pe-img-preview');
    prevImg.style.display = 'none';
    prevImg.src = '';

    if (id) {
        document.getElementById('pe-msg').textContent = 'Chargement...';
        try {
            const data = await apiGet('get', { id });
            document.getElementById('pe-msg').textContent = '';
            if (!data.ok) { alert('Erreur : ' + data.error); return; }
            const p = data.produit;
            document.getElementById('pe-name').value  = p.Nom_produit         || '';
            document.getElementById('pe-desc').value  = p.description_produit || '';
            document.getElementById('pe-price').value = p.prix_produit        || '';
            document.getElementById('pe-stock').value = p.stock_produit       || '';
            if (p.image_produit) {
                prevImg.src = p.image_produit;
                prevImg.style.display = 'block';
            }
        } catch (e) {
            alert('Erreur de connexion au serveur.');
            return;
        }
    }

    modal.style.display = 'flex';
}

function closeProductEditor() {
    const modal = document.getElementById('product-editor-modal');
    if (modal) modal.style.display = 'none';
}

function handleProductImageChange(input) {
    _pendingFile = input.files[0] || null;
    if (_pendingFile) {
        const reader = new FileReader();
        reader.onload = e => {
            const preview = document.getElementById('pe-img-preview');
            preview.src   = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(_pendingFile);
    }
}

async function saveProductEditor() {
    const name  = document.getElementById('pe-name').value.trim();
    const desc  = document.getElementById('pe-desc').value.trim();
    const prix  = document.getElementById('pe-price').value;
    const stock = document.getElementById('pe-stock').value;
    const msg   = document.getElementById('pe-msg');

    if (!name)                          { msg.textContent = 'Le nom est obligatoire.'; return; }
    if (!desc)                          { msg.textContent = 'La description est obligatoire.'; return; }
    if (!prix || parseFloat(prix) <= 0) { msg.textContent = 'Le prix doit être un nombre positif.'; return; }
    if (!_editorProductId && !_pendingFile) { msg.textContent = 'Veuillez choisir une image pour le nouveau produit.'; return; }

    msg.textContent = 'Enregistrement en cours...';

    try {
        let imagePath = '';
        if (_pendingFile) {
            const upData = await apiPostFile('upload_image', {}, 'image', _pendingFile);
            if (!upData.ok) { msg.textContent = 'Erreur upload : ' + upData.error; return; }
            imagePath = upData.path;
        }

        const payload = { nom: name, description: desc, prix, stock, type: _editorCategory };
        if (imagePath) payload.image = imagePath;

        let data;
        if (_editorProductId) {
            payload.id = _editorProductId;
            data = await apiPost('edit', payload);
        } else {
            data = await apiPost('add', payload);
        }

        if (data.ok) {
            closeProductEditor();
            renderProducts(_currentCategory, _currentContainerId);
        } else {
            msg.textContent = data.error;
        }
    } catch (e) {
        msg.textContent = 'Erreur de connexion au serveur.';
    }
}



function escHtml(s) {
    return String(s ?? '')
        .replace(/&/g,'&amp;').replace(/</g,'&lt;')
        .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}



document.addEventListener('DOMContentLoaded', async () => {
    
    
    await fetchMe();
    updateCartUI();

    document.getElementById('auth-modal')?.addEventListener('click', e => {
        if (e.target.id === 'auth-modal') closeModal();
    });
    document.getElementById('product-editor-modal')?.addEventListener('click', e => {
        if (e.target.id === 'product-editor-modal') closeProductEditor();
    });
    document.addEventListener('click', e => {
        const panel   = document.getElementById('cart-panel');
        const cartBtn = document.querySelector('.cart-btn');
        if (panel?.classList.contains('open') && !panel.contains(e.target) && !cartBtn?.contains(e.target)) {
            panel.classList.remove('open');
        }
    });
});