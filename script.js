// ==========================================
// DEFAULT DATA (Pehli dafa load hone par)
// ==========================================
const defaultCategories = [
    { id: "all", name: "All" },
    { id: "bbq", name: "BBQ" },
    { id: "karahi", name: "Karahi" },
    { id: "fastfood", name: "Fast Food" },
    { id: "drinks", name: "Drinks" },
    { id: "dessert", name: "Dessert" }
];

const defaultItems = [
    { id: 1, name: "Chicken Tikka", price: 450, category: "bbq", image: "images/chicken-tikka.jpg" },
    { id: 2, name: "Seekh Kabab", price: 350, category: "bbq", image: "images/seekh-kabab.jpg" },
    { id: 3, name: "Malai Boti", price: 500, category: "bbq", image: "images/malai-boti.jpg" },
    { id: 4, name: "Chicken Boti", price: 480, category: "bbq", image: "images/chicken-boti.jpg" },
    { id: 5, name: "Chicken Karahi (Half)", price: 1200, category: "karahi", image: "images/chicken-karahi.jpg" },
    { id: 6, name: "Chicken Karahi (Full)", price: 2200, category: "karahi", image: "images/chicken-karahi.jpg" },
    { id: 7, name: "Mutton Karahi", price: 2800, category: "karahi", image: "images/mutton-karahi.jpg" },
    { id: 8, name: "Nihari", price: 600, category: "karahi", image: "images/nihari.jpg" },
    { id: 9, name: "Zinger Burger", price: 350, category: "fastfood", image: "images/zinger-burger.jpg" },
    { id: 10, name: "Beef Burger", price: 400, category: "fastfood", image: "images/beef-burger.jpg" },
    { id: 11, name: "Pizza (Small)", price: 800, category: "fastfood", image: "images/pizza.jpg" },
    { id: 12, name: "French Fries", price: 200, category: "fastfood", image: "images/fries.jpg" },
    { id: 13, name: "Cold Drink", price: 100, category: "drinks", image: "images/cold-drink.jpg" },
    { id: 14, name: "Fresh Juice", price: 180, category: "drinks", image: "images/juice.jpg" },
    { id: 15, name: "Lassi", price: 150, category: "drinks", image: "images/lassi.jpg" },
    { id: 16, name: "Tea", price: 60, category: "drinks", image: "images/tea.jpg" },
    { id: 17, name: "Gulab Jamun", price: 120, category: "dessert", image: "images/gulab-jamun.jpg" },
    { id: 18, name: "Kheer", price: 150, category: "dessert", image: "images/kheer.jpg" },
    { id: 19, name: "Ice Cream", price: 200, category: "dessert", image: "images/ice-cream.jpg" },
    { id: 20, name: "Gajar Halwa", price: 180, category: "dessert", image: "images/gajar-halwa.jpg" }
];

// ==========================================
// STATE - localStorage se load karo ya default
// ==========================================
let categories = JSON.parse(localStorage.getItem("pos_categories")) || [...defaultCategories];
let menuItems = JSON.parse(localStorage.getItem("pos_items")) || [...defaultItems];
let cart = [];
let currentCategory = "all";
let editingItemId = null;

// ==========================================
// SAVE HELPERS
// ==========================================
function saveToStorage() {
    localStorage.setItem("pos_categories", JSON.stringify(categories));
    localStorage.setItem("pos_items", JSON.stringify(menuItems));
}

// ==========================================
// DATE & TIME
// ==========================================
function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'short', year: 'numeric', month: 'short', 
        day: 'numeric', hour: '2-digit', minute: '2-digit' 
    };
    document.getElementById('dateTime').textContent = now.toLocaleString('en-PK', options);
}
setInterval(updateDateTime, 1000);
updateDateTime();

// ==========================================
// RENDER SIDEBAR CATEGORIES
// ==========================================
function renderSidebar() {
    const container = document.getElementById('sidebarCategories');
    container.innerHTML = '';

    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'sidebar-cat-btn' + (cat.id === currentCategory ? ' active' : '');
        btn.onclick = () => filterCategory(cat.id);

        // "All" ko delete nahi kar sakte
        const deleteBtn = cat.id === "all" ? '' : 
            `<span class="cat-delete-btn" onclick="event.stopPropagation(); deleteCategory('${cat.id}')">×</span>`;

        btn.innerHTML = `<span>${cat.name}</span>${deleteBtn}`;
        container.appendChild(btn);
    });
}

// ==========================================
// FILTER BY CATEGORY
// ==========================================
function filterCategory(categoryId) {
    currentCategory = categoryId;
    renderSidebar();
    renderMenu();
}

// ==========================================
// RENDER MENU
// ==========================================
function renderMenu() {
    const grid = document.getElementById('menuGrid');
    const query = document.getElementById('searchInput').value.toLowerCase();
    
    // Filter logic
    let items = menuItems;
    if (currentCategory !== "all") {
        items = items.filter(i => i.category === currentCategory);
    }
    if (query) {
        items = items.filter(i => i.name.toLowerCase().includes(query));
    }

    // Title update
    const catObj = categories.find(c => c.id === currentCategory);
    document.getElementById('currentCategoryTitle').textContent = 
        (catObj ? catObj.name : "All") + " Items";
    document.getElementById('itemCount').textContent = items.length + " items";

    grid.innerHTML = '';

    if (items.length === 0) {
        grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;padding:40px;color:#999;">Koi item nahi mila. "Add New Item" se add karen.</p>';
        return;
    }

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'menu-card';

        // Card par click = cart mein add
        card.onclick = () => addToCart(item.id);

        card.innerHTML = `
            <div class="card-actions">
                <button class="btn-edit" onclick="event.stopPropagation(); openItemModal(${item.id})">✏️</button>
                <button class="btn-delete" onclick="event.stopPropagation(); deleteItem(${item.id})">🗑️</button>
            </div>
            <img src="${item.image}" alt="${item.name}" 
                 onerror="this.outerHTML='<div class=\\'image-placeholder\\'>[ IMAGE ]<br><small>${item.name}</small></div>'">
            <div class="card-info">
                <h3>${item.name}</h3>
                <p class="price">Rs. ${item.price}</p>
            </div>
        `;
        grid.appendChild(card);
    });
}

// ==========================================
// SEARCH
// ==========================================
function searchItems() {
    renderMenu();
}

// ==========================================
// ITEM MODAL - OPEN / CLOSE
// ==========================================
function openItemModal(editId = null) {
    editingItemId = editId;
    const modal = document.getElementById('itemModal');
    const title = document.getElementById('itemModalTitle');
    const nameInput = document.getElementById('itemName');
    const priceInput = document.getElementById('itemPrice');
    const imageInput = document.getElementById('itemImage');
    const catSelect = document.getElementById('itemCategory');

    // Category dropdown bharao (All ko chhor kar)
    catSelect.innerHTML = '';
    categories.filter(c => c.id !== "all").forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.id;
        opt.textContent = cat.name;
        catSelect.appendChild(opt);
    });

    if (editId) {
        // Edit mode
        title.textContent = "✏️ Edit Item";
        const item = menuItems.find(i => i.id === editId);
        nameInput.value = item.name;
        priceInput.value = item.price;
        imageInput.value = item.image;
        catSelect.value = item.category;
    } else {
        // Add mode
        title.textContent = "➕ Add New Item";
        nameInput.value = '';
        priceInput.value = '';
        imageInput.value = '';
        if (catSelect.options.length > 0) {
            catSelect.selectedIndex = 0;
        }
    }

    modal.classList.add('active');
    nameInput.focus();
}

function closeItemModal() {
    document.getElementById('itemModal').classList.remove('active');
    editingItemId = null;
}

// ==========================================
// SAVE ITEM (Add ya Edit)
// ==========================================
function saveItem() {
    const name = document.getElementById('itemName').value.trim();
    const price = parseInt(document.getElementById('itemPrice').value);
    const category = document.getElementById('itemCategory').value;
    const image = document.getElementById('itemImage').value.trim() || "images/placeholder.jpg";

    if (!name) { alert("Item ka naam likhen!"); return; }
    if (!price || price <= 0) { alert("Sahi price likhen!"); return; }
    if (!category) { alert("Category select karen!"); return; }

    if (editingItemId) {
        // Edit
        const idx = menuItems.findIndex(i => i.id === editingItemId);
        menuItems[idx] = { ...menuItems[idx], name, price, category, image };
    } else {
        // Add new
        const newId = menuItems.length > 0 ? Math.max(...menuItems.map(i => i.id)) + 1 : 1;
        menuItems.push({ id: newId, name, price, category, image });
    }

    saveToStorage();
    renderMenu();
    closeItemModal();
}

// ==========================================
// DELETE ITEM
// ==========================================
function deleteItem(id) {
    const item = menuItems.find(i => i.id === id);
    if (!confirm(`"${item.name}" delete karna chahte hain?`)) return;

    menuItems = menuItems.filter(i => i.id !== id);
    cart = cart.filter(c => c.id !== id);
    saveToStorage();
    renderMenu();
    updateCart();
}

// ==========================================
// CATEGORY MODAL - OPEN / CLOSE
// ==========================================
function openCategoryModal() {
    document.getElementById('categoryName').value = '';
    document.getElementById('categoryModal').classList.add('active');
    document.getElementById('categoryName').focus();
}

function closeCategoryModal() {
    document.getElementById('categoryModal').classList.remove('active');
}

// ==========================================
// SAVE CATEGORY
// ==========================================
function saveCategory() {
    const name = document.getElementById('categoryName').value.trim();
    if (!name) { alert("Category ka naam likhen!"); return; }

    // Check duplicate
    if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
        alert("Ye category pehle se mojood hai!");
        return;
    }

    const id = "cat_" + Date.now(); // unique id
    categories.push({ id, name });

    saveToStorage();
    renderSidebar();
    closeCategoryModal();
}

// ==========================================
// DELETE CATEGORY
// ==========================================
function deleteCategory(id) {
    if (id === "all") return;

    const cat = categories.find(c => c.id === id);
    const itemsInCat = menuItems.filter(i => i.category === id).length;

    let msg = `"${cat.name}" category delete karni hai?`;
    if (itemsInCat > 0) {
        msg += `\n\n⚠️ Is category mein ${itemsInCat} items hain. Woh bhi delete ho jayenge!`;
    }

    if (!confirm(msg)) return;

    // Category + uske items hatao
    categories = categories.filter(c => c.id !== id);
    menuItems = menuItems.filter(i => i.category !== id);

    if (currentCategory === id) currentCategory = "all";

    saveToStorage();
    renderSidebar();
    renderMenu();
}

// ==========================================
// CART FUNCTIONS
// ==========================================
function addToCart(id) {
    const item = menuItems.find(m => m.id === id);
    const existing = cart.find(c => c.id === id);

    if (existing) {
        existing.qty++;
    } else {
        cart.push({ ...item, qty: 1 });
    }
    updateCart();
}

function updateCart() {
    const cartItemsDiv = document.getElementById('cartItems');
    
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p class="empty-cart">Cart khali hai</p>';
    } else {
        cartItemsDiv.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <span class="item-price">Rs. ${item.price} × ${item.qty} = Rs. ${item.price * item.qty}</span>
                </div>
                <div class="qty-controls">
                    <button onclick="changeQty(${item.id}, -1)">−</button>
                    <span>${item.qty}</span>
                    <button onclick="changeQty(${item.id}, 1)">+</button>
                    <button class="btn-remove" onclick="removeItem(${item.id})">×</button>
                </div>
            </div>
        `).join('');
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const tax = Math.round(subtotal * 0.05);
    const discount = parseInt(document.getElementById('discount').value) || 0;
    const total = subtotal + tax - discount;

    document.getElementById('subtotal').textContent = `Rs. ${subtotal}`;
    document.getElementById('tax').textContent = `Rs. ${tax}`;
    document.getElementById('total').textContent = `Rs. ${Math.max(0, total)}`;
}

function changeQty(id, change) {
    const item = cart.find(c => c.id === id);
    if (!item) return;
    item.qty += change;
    if (item.qty <= 0) cart = cart.filter(c => c.id !== id);
    updateCart();
}

function removeItem(id) {
    cart = cart.filter(c => c.id !== id);
    updateCart();
}

function clearCart() {
    if (cart.length === 0) return;
    if (confirm('Cart clear karna chahte hain?')) {
        cart = [];
        document.getElementById('discount').value = 0;
        updateCart();
    }
}

// ==========================================
// CHECKOUT
// ==========================================
function checkout() {
    if (cart.length === 0) {
        alert('Cart khali hai! Pehle items add karen.');
        return;
    }

    const customerName = document.getElementById('customerName').value || 'Walk-in Customer';
    const tableNo = document.getElementById('tableNo').value || 'N/A';
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const tax = Math.round(subtotal * 0.05);
    const discount = parseInt(document.getElementById('discount').value) || 0;
    const total = subtotal + tax - discount;
    const orderId = 'ORD-' + Date.now().toString().slice(-6);

    const receiptHTML = `
        <div style="text-align:center; margin-bottom:10px;">
            <strong>PAKISTANI RESTAURANT</strong><br>
            <small>Main Boulevard, Lahore</small><br>
            <small>Tel: 0300-1234567</small>
        </div>
        <hr>
        <div><strong>Order ID:</strong> ${orderId}</div>
        <div><strong>Customer:</strong> ${customerName}</div>
        <div><strong>Table:</strong> ${tableNo}</div>
        <div><strong>Date:</strong> ${new Date().toLocaleString('en-PK')}</div>
        <hr>
        ${cart.map(item => `
            <div style="display:flex; justify-content:space-between;">
                <span>${item.name} x${item.qty}</span>
                <span>Rs. ${item.price * item.qty}</span>
            </div>
        `).join('')}
        <hr>
        <div style="display:flex; justify-content:space-between;">
            <span>Subtotal:</span><span>Rs. ${subtotal}</span>
        </div>
        <div style="display:flex; justify-content:space-between;">
            <span>Tax (5%):</span><span>Rs. ${tax}</span>
        </div>
        <div style="display:flex; justify-content:space-between;">
            <span>Discount:</span><span>- Rs. ${discount}</span>
        </div>
        <hr>
        <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:15px;">
            <span>TOTAL:</span><span>Rs. ${total}</span>
        </div>
        <hr>
        <div style="text-align:center; margin-top:10px;">
            <small>Shukriya! Dobara tashreef laayen 🙏</small>
        </div>
    `;

    document.getElementById('receiptContent').innerHTML = receiptHTML;
    document.getElementById('receiptModal').classList.add('active');
}

function closeReceiptModal() {
    document.getElementById('receiptModal').classList.remove('active');
    cart = [];
    document.getElementById('discount').value = 0;
    document.getElementById('customerName').value = '';
    document.getElementById('tableNo').value = '';
    updateCart();
}

function printReceipt() {
    const content = document.getElementById('receiptContent').innerHTML;
    const printWindow = window.open('', '', 'width=400,height=600');
    printWindow.document.write(`
        <html><head><title>Receipt</title>
        <style>
            body { font-family: 'Courier New', monospace; font-size: 12px; padding: 10px; }
            hr { border: 1px dashed #999; }
        </style></head>
        <body>${content}</body></html>
    `);
    printWindow.document.close();
    printWindow.print();
}

function logout() {
    if (confirm('Logout karna chahte hain?')) location.reload();
}

// ==========================================
// INITIAL LOAD
// ==========================================
renderSidebar();
renderMenu();
updateCart();