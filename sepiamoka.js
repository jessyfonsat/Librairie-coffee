// ===== SEPIA & MOKA - Shared JS =====

// --- AUTH ---
function getUsers() { try { return JSON.parse(localStorage.getItem('sm_users') || '[]'); } catch { return []; } }
function saveUsers(u) { localStorage.setItem('sm_users', JSON.stringify(u)); }
function getCurrentUser() { try { return JSON.parse(localStorage.getItem('sm_current_user') || 'null'); } catch { return null; } }
function setCurrentUser(u) { localStorage.setItem('sm_current_user', JSON.stringify(u)); }
function logout() { localStorage.removeItem('sm_current_user'); updateAuthUI(); updateCartUI(); }

function register(name, email, password) {
  const users = getUsers();
  if (users.find(u => u.email === email)) return { ok: false, msg: 'Email déjà utilisé.' };
  const user = { id: Date.now(), name, email, password };
  users.push(user);
  saveUsers(users);
  setCurrentUser({ id: user.id, name: user.name, email: user.email });
  return { ok: true };
}

function login(email, password) {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return { ok: false, msg: 'Email ou mot de passe incorrect.' };
  setCurrentUser({ id: user.id, name: user.name, email: user.email });
  return { ok: true };
}

// --- CART ---
function getCart() { try { return JSON.parse(localStorage.getItem('sm_cart') || '[]'); } catch { return []; } }
function saveCart(c) { localStorage.setItem('sm_cart', JSON.stringify(c)); }

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(i => i.id === product.id);
  if (existing) existing.qty++;
  else cart.push({ ...product, qty: 1 });
  saveCart(cart);
  updateCartUI();
  showCartToast(product.name);
}

function removeFromCart(id) {
  const cart = getCart().filter(i => i.id !== id);
  saveCart(cart);
  renderCart();
  updateCartUI();
}

function updateQty(id, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (item) {
    item.qty += delta;
    if (item.qty <= 0) { saveCart(cart.filter(i => i.id !== id)); }
    else saveCart(cart);
  }
  renderCart();
  updateCartUI();
}

function updateCartUI() {
  const cart = getCart();
  const total = cart.reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = total;
    el.style.display = total > 0 ? 'inline-flex' : 'none';
  });
}

function showCartToast(name) {
  let t = document.getElementById('sm-toast');
  if (!t) { t = document.createElement('div'); t.id = 'sm-toast'; document.body.appendChild(t); }
  t.textContent = `✓ "${name}" ajouté au panier`;
  t.className = 'sm-toast show';
  clearTimeout(t._timeout);
  t._timeout = setTimeout(() => t.classList.remove('show'), 2500);
}

function updateAuthUI() {
  const user = getCurrentUser();
  document.querySelectorAll('.auth-area').forEach(el => {
    if (user) {
      el.innerHTML = `<span class="user-greeting">👋 ${user.name}</span> <button onclick="logout()" class="btn-logout">Déconnexion</button>`;
    } else {
      el.innerHTML = `<button onclick="openModal('login')" class="btn-auth">Connexion</button> <button onclick="openModal('register')" class="btn-auth btn-auth-outline">Créer un compte</button>`;
    }
  });
}

// --- MODAL ---
function openModal(tab) {
  const m = document.getElementById('auth-modal');
  if (!m) return;
  m.style.display = 'flex';
  switchTab(tab);
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

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const pass = document.getElementById('login-pass').value;
  const res = login(email, pass);
  const msg = document.getElementById('login-msg');
  if (res.ok) { closeModal(); updateAuthUI(); }
  else msg.textContent = res.msg;
}

function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value;
  const email = document.getElementById('reg-email').value;
  const pass = document.getElementById('reg-pass').value;
  const pass2 = document.getElementById('reg-pass2').value;
  const msg = document.getElementById('reg-msg');
  if (pass !== pass2) { msg.textContent = 'Les mots de passe ne correspondent pas.'; return; }
  const res = register(name, email, pass);
  if (res.ok) { closeModal(); updateAuthUI(); }
  else msg.textContent = res.msg;
}

// --- CART PANEL ---
function toggleCart() {
  const panel = document.getElementById('cart-panel');
  if (!panel) return;
  const open = panel.classList.toggle('open');
  if (open) renderCart();
}

function renderCart() {
  const list = document.getElementById('cart-list');
  const total = document.getElementById('cart-total');
  if (!list) return;
  const cart = getCart();
  if (cart.length === 0) {
    list.innerHTML = '<p class="cart-empty">Votre panier est vide 🫖</p>';
    if (total) total.textContent = '';
    return;
  }
  list.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-info">
        <strong>${item.name}</strong>
        <span>${item.price}€ × ${item.qty}</span>
      </div>
      <div class="cart-item-actions">
        <button onclick="updateQty('${item.id}', -1)">−</button>
        <span>${item.qty}</span>
        <button onclick="updateQty('${item.id}', 1)">+</button>
        <button onclick="removeFromCart('${item.id}')" class="cart-remove">✕</button>
      </div>
    </div>
  `).join('');
  const t = cart.reduce((s, i) => s + parseFloat(i.price) * i.qty, 0);
  if (total) total.innerHTML = `<strong>Total : ${t.toFixed(2)} €</strong>`;
}

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();
  updateAuthUI();

  // Close modal on backdrop click
  const m = document.getElementById('auth-modal');
  if (m) m.addEventListener('click', e => { if (e.target === m) closeModal(); });

  // Close cart panel on outside click
  document.addEventListener('click', e => {
    const panel = document.getElementById('cart-panel');
    const cartBtn = document.querySelector('.cart-btn');
    if (panel && panel.classList.contains('open') && !panel.contains(e.target) && cartBtn && !cartBtn.contains(e.target)) {
      panel.classList.remove('open');
    }
  });
});