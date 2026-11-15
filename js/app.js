/* =========================================================
   ClientFlow CRM - Application Logic
   ========================================================= */

/* ============ KEYS & HELPERS ============ */
const CLIENTS_KEY = 'clientflow_clients';
const INVOICES_KEY = 'clientflow_invoices';
const SETTINGS_KEY = 'clientflow_settings';

function escapeHTML(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function showToast(message, type = 'success') {
  const colors = type === 'success'
    ? 'border-emerald-500/40 text-emerald-300'
    : 'border-rose-500/40 text-rose-300';
  const toast = document.createElement('div');
  toast.className = `toast glass border ${colors} px-4 py-3 rounded-xl text-sm font-medium shadow-2xl`;
  toast.textContent = message;
  document.getElementById('toastContainer').appendChild(toast);
  setTimeout(() => toast.remove(), 2800);
}

/* ============ MOBILE SIDEBAR ============ */
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');

function openSidebar() {
  sidebar.classList.add('open');
  sidebarOverlay.classList.add('show');
}

function closeSidebar() {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('show');
}

document.getElementById('openSidebar').addEventListener('click', openSidebar);
document.getElementById('closeSidebar').addEventListener('click', closeSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);

/* ============ SETTINGS ============ */
const defaultSettings = {
  agencyName: 'ClientFlow Agency',
  ownerName: 'Daniyal Dynihmind',
  email: 'billing@clientflow.dev',
  phone: '',
  address: 'Karachi, Pakistan',
  tagline: 'Digital Agency',
  website: '',
  accent: '#10b981',
  initials: 'CF',
  currency: 'USD',
  prefix: 'INV-',
  defaultTax: 0,
  terms: 14,
  showFooter: true
};

const CURRENCY_SYMBOLS = { USD: '$', EUR: '€', GBP: '£', PKR: 'Rs ', AED: 'AED ' };

let settings = loadSettings();

function loadSettings() {
  const saved = localStorage.getItem(SETTINGS_KEY);
  return saved ? { ...defaultSettings, ...JSON.parse(saved) } : { ...defaultSettings };
}

function saveSettingsToStorage() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function money(n) {
  const sym = CURRENCY_SYMBOLS[settings.currency] || '$';
  return sym + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function applyBranding() {
  const accent = settings.accent;
  document.getElementById('sideBrandName').textContent = settings.agencyName.split(' ')[0] || 'Client';
  document.getElementById('sideLogo').innerHTML = `<span class="font-extrabold text-slate-950 text-sm">${escapeHTML(settings.initials || 'CF')}</span>`;
  document.getElementById('sideLogo').style.background = `linear-gradient(135deg, ${accent}, ${accent}99)`;

  const avatarInitials = (settings.ownerName || 'DD').split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
  document.getElementById('headerAvatar').textContent = avatarInitials;
  document.getElementById('headerName').textContent = settings.ownerName;
  document.getElementById('greetName').textContent = (settings.ownerName || '').split(' ')[0];

  document.getElementById('p-agency').textContent = settings.agencyName;
  document.getElementById('p-agency').style.color = accent;
  document.getElementById('p-address').textContent = settings.address;
  document.getElementById('p-email').textContent = settings.email;
  document.getElementById('p-footer').textContent = settings.showFooter ? 'Thank you for your business.' : '';
  document.getElementById('p-footer').style.display = settings.showFooter ? '' : 'none';

  let styleTag = document.getElementById('accentStyle');
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = 'accentStyle';
    document.head.appendChild(styleTag);
  }
  styleTag.textContent = `
    .btn-primary { background: linear-gradient(135deg, ${accent}, ${accent}cc) !important; }
    .nav-item.active { color: ${accent} !important; box-shadow: inset 3px 0 0 ${accent} !important; }
    .glow-text { background: linear-gradient(135deg, ${accent}, #06b6d4) !important; -webkit-background-clip: text !important; }
    .tilt:hover { border-color: ${accent}66 !important; }
  `;
}

function fillSettingsForm() {
  const form = document.getElementById('settingsForm');
  Object.keys(defaultSettings).forEach(key => {
    const el = form.elements[key];
    if (!el) return;
    if (el.type === 'checkbox') el.checked = !!settings[key];
    else el.value = settings[key];
  });
  updateBrandPreview();
}

function readSettingsForm() {
  const form = document.getElementById('settingsForm');
  const data = {};
  Object.keys(defaultSettings).forEach(key => {
    const el = form.elements[key];
    if (!el) return;
    if (el.type === 'checkbox') data[key] = el.checked;
    else if (el.type === 'number') data[key] = Number(el.value) || 0;
    else data[key] = el.value.trim();
  });
  data.initials = (data.initials || 'CF').toUpperCase().slice(0, 2);
  return data;
}

function updateBrandPreview() {
  const form = document.getElementById('settingsForm');
  const accent = form.elements.accent.value || settings.accent;
  const initials = (form.elements.initials.value || 'CF').toUpperCase().slice(0, 2);
  const logo = document.getElementById('prevLogo');
  logo.textContent = initials;
  logo.style.background = `linear-gradient(135deg, ${accent}, ${accent}99)`;
  document.getElementById('prevName').textContent = form.elements.agencyName.value || 'Your Agency';
  document.getElementById('prevTag').textContent = form.elements.tagline.value || 'Your tagline';
  document.getElementById('prevBtn').style.background = accent;
}

document.getElementById('settingsForm').addEventListener('input', updateBrandPreview);

document.querySelectorAll('[data-color]').forEach(b => {
  b.addEventListener('click', () => {
    document.getElementById('settingsForm').elements.accent.value = b.dataset.color;
    updateBrandPreview();
  });
});

document.getElementById('settingsForm').addEventListener('submit', e => {
  e.preventDefault();
  settings = { ...settings, ...readSettingsForm() };
  saveSettingsToStorage();
  applyBranding();
  updatePreview();
  showToast('Settings saved successfully.');
});

document.getElementById('resetSettings').addEventListener('click', () => {
  openConfirm({
    title: 'Reset settings?',
    message: 'Your agency profile and branding will return to the default values.',
    onConfirm: () => {
      settings = { ...defaultSettings };
      saveSettingsToStorage();
      fillSettingsForm();
      applyBranding();
      updatePreview();
      showToast('Settings reset to defaults.');
    }
  });
});

document.getElementById('clearData').addEventListener('click', () => {
  openConfirm({
    title: 'Clear all data?',
    message: 'All clients, invoices and settings will be deleted from this browser. This cannot be undone.',
    onConfirm: () => {
      localStorage.removeItem(CLIENTS_KEY);
      localStorage.removeItem(INVOICES_KEY);
      localStorage.removeItem(SETTINGS_KEY);
      location.reload();
    }
  });
});

/* ============ CUSTOM CONFIRM ============ */
const confirmModal = document.getElementById('confirmModal');
let pendingAction = null;

function openConfirm({ title, message, onConfirm }) {
  document.getElementById('confirmTitle').textContent = title;
  document.getElementById('confirmMessage').textContent = message;
  pendingAction = onConfirm;
  confirmModal.classList.remove('hidden');
  confirmModal.classList.add('flex');
  lucide.createIcons();
}

function closeConfirm() {
  confirmModal.classList.add('hidden');
  confirmModal.classList.remove('flex');
  pendingAction = null;
}

document.getElementById('confirmOk').addEventListener('click', () => {
  if (pendingAction) pendingAction();
  closeConfirm();
});
document.getElementById('confirmCancel').addEventListener('click', closeConfirm);
confirmModal.addEventListener('click', e => { if (e.target === confirmModal) closeConfirm(); });

/* ============ SEED DATA ============ */
const seedClients = [
  { id: 1, name: 'Sarah Johnson', company: 'Acme Corp', email: 'sarah@acmecorp.com', phone: '+1 415 555 0101', status: 'Active', value: 4500 },
  { id: 2, name: 'Mark Reynolds', company: 'Nova Labs', email: 'mark@novalabs.io', phone: '+44 20 7946 0958', status: 'Lead', value: 1800 },
  { id: 3, name: 'Emily Chen', company: 'Bright Studio', email: 'emily@brightstudio.co', phone: '+61 2 9876 5432', status: 'Lead', value: 950 },
  { id: 4, name: 'David Miller', company: 'TechWave', email: 'david@techwave.com', phone: '+1 212 555 0199', status: 'Active', value: 7200 },
  { id: 5, name: 'Olivia Brown', company: 'Greenleaf Co.', email: 'olivia@greenleaf.co', phone: '+1 303 555 0144', status: 'Completed', value: 3100 },
  { id: 6, name: 'James Wilson', company: 'Pixel Forge', email: 'james@pixelforge.dev', phone: '+1 646 555 0177', status: 'Completed', value: 5600 }
];

const seedInvoices = [
  { id: 1024, number: 'INV-1024', clientId: 1, date: '2026-05-02', due: '2026-05-16', status: 'Paid', items: [{ desc: 'Website redesign', qty: 1, price: 3000 }, { desc: 'Hosting setup', qty: 1, price: 500 }], tax: 0, discount: 0, notes: 'Thank you for choosing ClientFlow.' },
  { id: 1025, number: 'INV-1025', clientId: 2, date: '2026-05-10', due: '2026-05-24', status: 'Pending', items: [{ desc: 'MVP development', qty: 1, price: 1800 }], tax: 0, discount: 0, notes: '' },
  { id: 1023, number: 'INV-1023', clientId: 4, date: '2026-04-01', due: '2026-04-15', status: 'Overdue', items: [{ desc: 'CRM dashboard', qty: 1, price: 7200 }], tax: 0, discount: 0, notes: 'Payment reminder sent.' }
];

function load(key, seed) {
  const saved = localStorage.getItem(key);
  if (saved) return JSON.parse(saved);
  localStorage.setItem(key, JSON.stringify(seed));
  return JSON.parse(JSON.stringify(seed));
}

let clients = load(CLIENTS_KEY, seedClients);
let invoices = load(INVOICES_KEY, seedInvoices);

function saveClients() { localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients)); }
function saveInvoices() { localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices)); }

const getClient = id => clients.find(c => c.id === Number(id));

/* ============ CLIENTS ============ */
const statusBadge = {
  Lead: '<span class="badge badge-lead">● Lead</span>',
  Active: '<span class="badge badge-active">● Active</span>',
  Completed: '<span class="badge badge-completed">● Completed</span>'
};

function renderClients() {
  const term = document.getElementById('clientSearch').value.trim().toLowerCase();
  const status = document.getElementById('statusFilter').value;

  const filtered = clients.filter(c => {
    const matchesSearch = [c.name, c.company, c.email].some(f => f.toLowerCase().includes(term));
    const matchesStatus = status === 'all' || c.status === status;
    return matchesSearch && matchesStatus;
  });

  document.getElementById('clientsTable').innerHTML = filtered.map(c => `
    <tr class="table-row">
      <td class="px-5 py-4">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400/80 to-cyan-500/80 flex items-center justify-center font-bold text-slate-950 text-xs">
            ${escapeHTML(c.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase())}
          </div>
          <span class="font-semibold text-white">${escapeHTML(c.name)}</span>
        </div>
      </td>
      <td class="px-5 py-4 text-slate-300">${escapeHTML(c.company)}</td>
      <td class="px-5 py-4 text-slate-400">${escapeHTML(c.email)}</td>
      <td class="px-5 py-4">${statusBadge[c.status] || ''}</td>
      <td class="px-5 py-4 text-right font-semibold text-white">${money(c.value)}</td>
      <td class="px-5 py-4 text-right">
        <button onclick="deleteClient(${c.id})" class="p-2 rounded-lg hover:bg-rose-500/10 transition" title="Delete client">
          <i data-lucide="trash-2" class="w-4 h-4 text-slate-500 hover:text-rose-400"></i>
        </button>
      </td>
    </tr>`).join('');

  document.getElementById('emptyState').classList.toggle('hidden', filtered.length > 0);
  updateStats();
  refreshSelects();
  lucide.createIcons();
}

function updateStats() {
  const count = s => clients.filter(c => c.status === s).length;
  document.getElementById('count-lead').textContent = count('Lead');
  document.getElementById('count-active').textContent = count('Active');
  document.getElementById('count-completed').textContent = count('Completed');
  document.getElementById('dash-active').textContent = count('Active');
}

function addClient(data) {
  clients.unshift({
    id: Date.now(),
    name: data.name.trim(),
    company: data.company.trim(),
    email: data.email.trim(),
    phone: (data.phone || '').trim(),
    status: data.status,
    value: Number(data.value) || 0
  });
  saveClients();
  renderClients();
  showToast(`Client "${data.name.trim()}" added successfully.`);
}

function deleteClient(id) {
  const client = getClient(id);
  if (!client) return;
  openConfirm({
    title: 'Delete client?',
    message: `"${client.name}" from ${client.company} will be removed permanently. This cannot be undone.`,
    onConfirm: () => {
      clients = clients.filter(c => c.id !== id);
      saveClients();
      renderClients();
      showToast('Client deleted.', 'error');
    }
  });
}

/* ============ ADD CLIENT MODAL ============ */
const modal = document.getElementById('clientModal');
const form = document.getElementById('clientForm');

function openModal() { modal.classList.remove('hidden'); modal.classList.add('flex'); lucide.createIcons(); }
function closeModal() { modal.classList.add('hidden'); modal.classList.remove('flex'); form.reset(); }

document.getElementById('openAddClient').addEventListener('click', openModal);
document.getElementById('closeModal').addEventListener('click', closeModal);
document.getElementById('cancelModal').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
form.addEventListener('submit', e => {
  e.preventDefault();
  addClient(Object.fromEntries(new FormData(form).entries()));
  closeModal();
});

// Esc closes any open popup or the mobile drawer
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeConfirm(); closeModal(); closeSidebar(); }
});

document.getElementById('clientSearch').addEventListener('input', renderClients);
document.getElementById('statusFilter').addEventListener('change', renderClients);

/* ============ INVOICES LIST ============ */
const invoiceBadge = {
  Paid: '<span class="badge badge-paid">● Paid</span>',
  Pending: '<span class="badge badge-pending">● Pending</span>',
  Overdue: '<span class="badge badge-overdue">● Overdue</span>'
};

function invoiceTotal(inv) {
  const sub = inv.items.reduce((s, i) => s + i.qty * i.price, 0);
  const disc = sub * (inv.discount / 100);
  const tax = (sub - disc) * (inv.tax / 100);
  return sub - disc + tax;
}

function renderInvoices() {
  const sorted = [...invoices].sort((a, b) => b.id - a.id);
  document.getElementById('invoicesTable').innerHTML = sorted.map(inv => {
    const c = getClient(inv.clientId);
    return `
    <tr class="table-row">
      <td class="px-5 py-4 font-semibold text-white">${escapeHTML(inv.number)}</td>
      <td class="px-5 py-4 text-slate-300">${escapeHTML(c ? c.company : 'Unknown')}</td>
      <td class="px-5 py-4 text-slate-400">${escapeHTML(inv.date)}</td>
      <td class="px-5 py-4">${invoiceBadge[inv.status] || ''}</td>
      <td class="px-5 py-4 text-right font-semibold text-white">${money(invoiceTotal(inv))}</td>
      <td class="px-5 py-4 text-right whitespace-nowrap">
        <button onclick="editInvoice(${inv.id})" class="p-2 rounded-lg hover:bg-slate-800 transition" title="Edit / View">
          <i data-lucide="eye" class="w-4 h-4 text-slate-400 hover:text-emerald-400"></i>
        </button>
        <button onclick="deleteInvoice(${inv.id})" class="p-2 rounded-lg hover:bg-rose-500/10 transition" title="Delete invoice">
          <i data-lucide="trash-2" class="w-4 h-4 text-slate-500 hover:text-rose-400"></i>
        </button>
      </td>
    </tr>`;
  }).join('');
  document.getElementById('invoiceEmpty').classList.toggle('hidden', invoices.length > 0);
  updateDashboard();
  lucide.createIcons();
}

function deleteInvoice(id) {
  const inv = invoices.find(i => i.id === id);
  if (!inv) return;
  openConfirm({
    title: 'Delete invoice?',
    message: `Invoice ${inv.number} will be removed permanently.`,
    onConfirm: () => {
      invoices = invoices.filter(i => i.id !== id);
      saveInvoices();
      renderInvoices();
      showToast('Invoice deleted.', 'error');
    }
  });
}

/* ============ DASHBOARD ============ */
function updateDashboard() {
  const paid = invoices.filter(i => i.status === 'Paid');
  document.getElementById('dash-revenue').textContent = money(paid.reduce((s, i) => s + invoiceTotal(i), 0));
  document.getElementById('dash-pending').textContent = invoices.filter(i => i.status === 'Pending').length;
  const overdue = invoices.filter(i => i.status === 'Overdue').length;
  document.querySelector('#dash-overdue span').textContent = `${overdue} overdue`;
}

const activity = [
  { icon: 'check', color: 'emerald', text: 'Invoice INV-1024 paid by <b>Acme Corp</b>', time: '2 hours ago' },
  { icon: 'user-plus', color: 'cyan', text: 'New lead added: <b>Bright Studio</b>', time: '5 hours ago' },
  { icon: 'send', color: 'violet', text: 'Invoice INV-1025 sent to <b>Nova Labs</b>', time: 'Yesterday' },
  { icon: 'alert-triangle', color: 'rose', text: 'Invoice INV-1023 is overdue (<b>TechWave</b>)', time: '2 days ago' }
];

const colorMap = {
  emerald: ['bg-emerald-500/15', 'text-emerald-400'],
  cyan: ['bg-cyan-500/15', 'text-cyan-400'],
  violet: ['bg-violet-500/15', 'text-violet-400'],
  rose: ['bg-rose-500/15', 'text-rose-400']
};

document.getElementById('activityList').innerHTML = activity.map(a => `
  <li class="flex gap-3">
    <div class="w-8 h-8 rounded-full ${colorMap[a.color][0]} flex items-center justify-center shrink-0"><i data-lucide="${a.icon}" class="w-4 h-4 ${colorMap[a.color][1]}"></i></div>
    <div><p class="text-sm text-slate-200">${a.text}</p><p class="text-xs text-slate-500">${a.time}</p></div>
  </li>`).join('');

/* ============ INVOICE BUILDER ============ */
const itemsWrap = document.getElementById('itemsWrap');
let editingId = null;

function nextInvoiceNumber() {
  const max = invoices.reduce((m, i) => Math.max(m, i.id), 1023);
  return (settings.prefix || 'INV-') + (max + 1);
}

function itemRowHTML(item = { desc: '', qty: 1, price: 0 }) {
  return `
  <div class="item-row grid grid-cols-12 gap-2 items-center">
    <input class="input col-span-5 rounded-lg px-3 py-2 text-sm" data-k="desc" placeholder="Service description" value="${escapeHTML(item.desc)}" />
    <input class="input col-span-2 rounded-lg px-3 py-2 text-sm" data-k="qty" type="number" min="1" value="${item.qty}" />
    <input class="input col-span-3 rounded-lg px-3 py-2 text-sm" data-k="price" type="number" min="0" step="0.01" value="${item.price}" />
    <button class="remove-item col-span-2 p-2 rounded-lg hover:bg-rose-500/10 flex justify-center" title="Remove">
      <i data-lucide="x" class="w-4 h-4 text-slate-500 hover:text-rose-400"></i>
    </button>
  </div>`;
}

itemsWrap.addEventListener('click', e => {
  const btn = e.target.closest('.remove-item');
  if (btn) { btn.parentElement.remove(); updatePreview(); }
});

function readForm() {
  const items = [...itemsWrap.querySelectorAll('.item-row')].map(row => ({
    desc: row.querySelector('[data-k="desc"]').value,
    qty: Number(row.querySelector('[data-k="qty"]').value) || 0,
    price: Number(row.querySelector('[data-k="price"]').value) || 0
  }));
  return {
    number: document.getElementById('f-number').value,
    date: document.getElementById('f-date').value,
    due: document.getElementById('f-due').value,
    status: document.getElementById('f-status').value,
    clientId: document.getElementById('f-client').value,
    items,
    tax: Number(document.getElementById('f-tax').value) || 0,
    discount: Number(document.getElementById('f-discount').value) || 0,
    notes: document.getElementById('f-notes').value
  };
}

function updatePreview() {
  const d = readForm();
  const c = getClient(d.clientId);
  const fmtDate = s => s ? new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  document.getElementById('p-number').textContent = '#' + (d.number || 'INV-0000');
  document.getElementById('p-client-name').textContent = c ? c.name : '—';
  document.getElementById('p-client-company').textContent = c ? c.company : '—';
  document.getElementById('p-client-email').textContent = c ? c.email : '—';
  document.getElementById('p-date').textContent = fmtDate(d.date);
  document.getElementById('p-due').textContent = fmtDate(d.due);
  document.getElementById('p-status').textContent = d.status;
  document.getElementById('p-notes').textContent = d.notes || '—';

  document.getElementById('p-items').innerHTML = d.items.map(i => `
    <tr class="border-b border-slate-200">
      <td class="py-3 text-slate-800">${escapeHTML(i.desc) || '—'}</td>
      <td class="py-3 text-center">${i.qty}</td>
      <td class="py-3 text-right">${money(i.price)}</td>
      <td class="py-3 text-right font-semibold">${money(i.qty * i.price)}</td>
    </tr>`).join('');

  const sub = d.items.reduce((s, i) => s + i.qty * i.price, 0);
  const disc = sub * (d.discount / 100);
  const tax = (sub - disc) * (d.tax / 100);
  document.getElementById('p-subtotal').textContent = money(sub);
  document.getElementById('p-discount').textContent = '-' + money(disc);
  document.getElementById('p-tax').textContent = money(tax);
  document.getElementById('p-total').textContent = money(sub - disc + tax);
}

function refreshSelects() {
  const sel = document.getElementById('f-client');
  const current = sel.value;
  sel.innerHTML = clients.map(c => `<option value="${c.id}">${escapeHTML(c.name)} – ${escapeHTML(c.company)}</option>`).join('');
  if (current && clients.some(c => String(c.id) === current)) sel.value = current;
}

function resetBuilder() {
  editingId = null;
  document.getElementById('f-number').value = nextInvoiceNumber();
  document.getElementById('f-date').value = new Date().toISOString().slice(0, 10);
  const due = new Date();
  due.setDate(due.getDate() + Number(settings.terms || 14));
  document.getElementById('f-due').value = due.toISOString().slice(0, 10);
  document.getElementById('f-status').value = 'Pending';
  document.getElementById('f-tax').value = settings.defaultTax || 0;
  document.getElementById('f-discount').value = 0;
  document.getElementById('f-notes').value = '';
  itemsWrap.innerHTML = itemRowHTML({ desc: 'Web development service', qty: 1, price: 1000 });
  refreshSelects();
  updatePreview();
  lucide.createIcons();
}

function openBuilder() {
  resetBuilder();
  showView('builder');
}

function editInvoice(id) {
  const inv = invoices.find(i => i.id === id);
  if (!inv) return;
  editingId = id;
  refreshSelects();
  document.getElementById('f-number').value = inv.number;
  document.getElementById('f-date').value = inv.date;
  document.getElementById('f-due').value = inv.due;
  document.getElementById('f-status').value = inv.status;
  document.getElementById('f-client').value = inv.clientId;
  document.getElementById('f-tax').value = inv.tax;
  document.getElementById('f-discount').value = inv.discount;
  document.getElementById('f-notes').value = inv.notes || '';
  itemsWrap.innerHTML = inv.items.map(item => itemRowHTML(item)).join('');
  updatePreview();
  showView('builder');
}

document.getElementById('addItem').addEventListener('click', () => {
  itemsWrap.insertAdjacentHTML('beforeend', itemRowHTML());
  lucide.createIcons();
  updatePreview();
});

document.getElementById('view-builder').addEventListener('input', updatePreview);
document.getElementById('view-builder').addEventListener('change', updatePreview);

document.getElementById('saveInvoice').addEventListener('click', () => {
  const d = readForm();
  if (!d.clientId) { showToast('Please add a client first.', 'error'); return; }
  if (!d.items.length) { showToast('Add at least one line item.', 'error'); return; }

  if (editingId) {
    invoices = invoices.map(i => i.id === editingId ? { ...i, ...d } : i);
  } else {
    invoices.push({ id: Date.now(), ...d });
  }
  saveInvoices();
  showToast(`Invoice ${d.number} saved.`);
  showView('invoices');
});

document.getElementById('backToInvoices').addEventListener('click', () => showView('invoices'));
document.getElementById('newInvoiceBtn').addEventListener('click', openBuilder);
document.getElementById('printBtn').addEventListener('click', () => window.print());

/* ============ NAVIGATION ============ */
function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
  document.getElementById('view-' + name).classList.remove('hidden');

  const navKey = name === 'builder' ? 'invoices' : name;
  document.querySelectorAll('.nav-item').forEach(n => {
    const active = n.dataset.view === navKey;
    n.classList.toggle('active', active);
    n.classList.toggle('text-slate-400', !active);
    n.classList.toggle('text-emerald-400', active);
  });

  if (name === 'invoices') renderInvoices();
  if (name === 'dashboard') updateDashboard();
  if (name === 'settings') fillSettingsForm();
  lucide.createIcons();
}

document.querySelectorAll('[data-view]').forEach(btn => {
  btn.addEventListener('click', () => {
    showView(btn.dataset.view);
    if (window.innerWidth < 768) closeSidebar();
  });
});

document.getElementById('globalSearch').addEventListener('input', e => {
  document.getElementById('clientSearch').value = e.target.value;
  showView('clients');
  renderClients();
});

/* ============ NOTIFICATIONS ============ */
document.getElementById('notifBtn').addEventListener('click', () => {
  showToast('No new notifications right now.');
});

/* ============ 3D TILT ============ */
document.addEventListener('mousemove', e => {
  const card = e.target.closest('.tilt');
  if (!card) return;
  const rect = card.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  card.style.transform = `perspective(900px) rotateX(${((y / rect.height) - 0.5) * -8}deg) rotateY(${((x / rect.width) - 0.5) * 8}deg)`;
  card.style.setProperty('--mx', x + 'px');
  card.style.setProperty('--my', y + 'px');
});

document.addEventListener('mouseout', e => {
  const card = e.target.closest('.tilt');
  if (card && !card.contains(e.relatedTarget)) card.style.transform = '';
});

/* ============ CHART ============ */
const canvas = document.getElementById('revenueChart');
const ctx = canvas.getContext('2d');
const gradient = ctx.createLinearGradient(0, 0, 0, 300);
gradient.addColorStop(0, 'rgba(16, 185, 129, 0.95)');
gradient.addColorStop(1, 'rgba(6, 182, 212, 0.15)');

new Chart(canvas, {
  type: 'bar',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Revenue',
      data: [4200, 5800, 4900, 7200, 6800, 9100],
      backgroundColor: gradient,
      borderRadius: 8,
      borderSkipped: false,
      maxBarThickness: 48
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        borderColor: '#10b981',
        borderWidth: 1,
        padding: 12,
        callbacks: { label: c => ' ' + money(c.parsed.y) }
      }
    },
    scales: {
      x: { ticks: { color: '#64748b' }, grid: { display: false } },
      y: { ticks: { color: '#64748b', callback: v => money(v) }, grid: { color: 'rgba(148,163,184,0.08)' } }
    }
  }
});

/* ============ INIT ============ */
applyBranding();
fillSettingsForm();
lucide.createIcons();
renderClients();
renderInvoices();
