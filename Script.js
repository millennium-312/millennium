const products = [
  {
    id: 1,
    name: "Сыворотка для лица с ниацинамидом",
    category: "Красота",
    price: 441,
    oldPrice: 902,
    rating: 4.8,
    icon: "🧴"
  },
  {
    id: 2,
    name: "Туалетная вода мужская",
    category: "Красота",
    price: 842,
    oldPrice: 1159,
    rating: 4.7,
    icon: "🌿"
  },
  {
    id: 3,
    name: "Худи оверсайз с капюшоном",
    category: "Одежда",
    price: 3024,
    oldPrice: 7000,
    rating: 4.9,
    icon: "🧥"
  },
  {
    id: 4,
    name: "Классическая сумка",
    category: "Аксессуары",
    price: 1890,
    oldPrice: 2790,
    rating: 4.6,
    icon: "👜"
  },
  {
    id: 5,
    name: "Настольная лампа",
    category: "Дом",
    price: 1290,
    oldPrice: 1990,
    rating: 4.8,
    icon: "💡"
  },
  {
    id: 6,
    name: "Увлажняющий крем",
    category: "Красота",
    price: 690,
    oldPrice: 990,
    rating: 4.9,
    icon: "🧴"
  },
  {
    id: 7,
    name: "Базовая футболка",
    category: "Одежда",
    price: 990,
    oldPrice: 1490,
    rating: 4.7,
    icon: "👕"
  },
  {
    id: 8,
    name: "Кошелёк компактный",
    category: "Аксессуары",
    price: 1190,
    oldPrice: 1790,
    rating: 4.8,
    icon: "👛"
  }
];


let cart = JSON.parse(localStorage.getItem("millenniumCart")) || [];
let favorites = JSON.parse(localStorage.getItem("millenniumFavorites")) || [];
let orders = JSON.parse(localStorage.getItem("millenniumOrders")) || [];


/* =========================
   NAVIGATION
========================= */

function showPage(page) {

  document.querySelectorAll(".page").forEach(item => {
    item.classList.remove("active");
  });

  const target = document.getElementById(page);

  if (target) {
    target.classList.add("active");
  }

  document.querySelectorAll(".bottom-nav button").forEach(btn => {
    btn.classList.remove("active");
  });

  const nav = document.querySelector(
    `.bottom-nav button[data-page="${page}"]`
  );

  if (nav) {
    nav.classList.add("active");
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  if (page === "cart") {
    renderCart();
  }

  if (page === "catalog") {
    renderCatalog();
  }

  if (page === "favorites") {
    renderFavorites();
  }

  if (page === "checkout") {
    renderCheckout();
  }

  if (page === "orders") {
    renderOrders();
  }
}


/* =========================
   PRODUCTS
========================= */

function productHTML(product) {

  const isFavorite = favorites.includes(product.id);

  return `
    <article class="product-card">

      <button
        class="favorite-btn"
        onclick="toggleFavorite(${product.id})"
      >
        ${isFavorite ? "♥" : "♡"}
      </button>

      <div class="product-image">
        ${product.icon}
      </div>

      <div class="product-info">

        <div class="product-category">
          ${product.category}
        </div>

        <div class="product-name">
          ${product.name}
        </div>

        <div class="rating">
          ★ ${product.rating}
        </div>

        <div class="price-row">

          <div>
            <span class="price">
              ${formatPrice(product.price)} ₽
            </span>

            <span class="old-price">
              ${formatPrice(product.oldPrice)} ₽
            </span>
          </div>

          <button
            class="add-btn"
            onclick="addToCart(${product.id})"
          >
            +
          </button>

        </div>

      </div>

    </article>
  `;
}


function renderHome() {

  const container = document.getElementById("homeProducts");

  if (!container) return;

  container.innerHTML = products
    .slice(0, 6)
    .map(productHTML)
    .join("");
}


function renderCatalog(list = products) {

  const container = document.getElementById("catalogProducts");

  if (!container) return;

  if (!list.length) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-icon">🔎</div>
        <h2>Ничего не найдено</h2>
        <p>Попробуйте изменить категорию или поиск.</p>
      </div>
    `;

    return;
  }

  container.innerHTML = list
    .map(productHTML)
    .join("");
}


/* =========================
   SEARCH
========================= */

function searchProducts() {

  const input = document.getElementById("searchInput");

  if (!input) return;

  const query = input.value.toLowerCase().trim();

  const results = products.filter(product => {

    return (
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query)
    );

  });

  document.getElementById("searchResults").innerHTML =
    results.map(productHTML).join("");
}


/* =========================
   CATEGORY
========================= */

function filterCategory(category) {

  showPage("catalog");

  document.querySelectorAll(".chip").forEach(chip => {
    chip.classList.remove("active");
  });

  const productsToShow =
    category === "Все"
      ? products
      : products.filter(p => p.category === category);

  renderCatalog(productsToShow);
}


/* =========================
   CART
========================= */

function addToCart(id) {

  const product = products.find(p => p.id === id);

  if (!product) return;

  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({
      ...product,
      quantity: 1
    });
  }

  saveCart();

  updateCartCount();

  showToast("Товар добавлен в корзину");
}


function removeFromCart(id) {

  cart = cart.filter(item => item.id !== id);

  saveCart();

  renderCart();

  updateCartCount();
}


function changeQuantity(id, amount) {

  const item = cart.find(item => item.id === id);

  if (!item) return;

  item.quantity += amount;

  if (item.quantity <= 0) {
    removeFromCart(id);
    return;
  }

  saveCart();

  renderCart();

  updateCartCount();
}


function renderCart() {

  const container = document.getElementById("cartContent");

  if (!container) return;

  if (!cart.length) {

    container.innerHTML = `
      <div class="empty-state">

        <div class="empty-icon">🛒</div>

        <h2>Корзина пуста</h2>

        <p>
          Добавьте товары из каталога,
          чтобы оформить заказ.
        </p>

        <button
          class="primary-btn"
          onclick="showPage('catalog')"
        >
          Перейти в каталог
        </button>

      </div>
    `;

    return;
  }

  const itemsHTML = cart.map(item => {

    return `
      <div class="cart-item">

        <div class="cart-image">
          ${item.icon}
        </div>

        <div class="cart-details">

          <strong>${item.name}</strong>

          <small>${item.category}</small>

          <div class="cart-bottom">

            <div class="qty">

              <button
                onclick="changeQuantity(${item.id}, -1)"
              >
                −
              </button>

              <span>${item.quantity}</span>

              <button
                onclick="changeQuantity(${item.id}, 1)"
              >
                +
              </button>

            </div>

            <strong>
              ${formatPrice(item.price * item.quantity)} ₽
            </strong>

          </div>

        </div>

        <button
          onclick="removeFromCart(${item.id})"
          style="
            background:transparent;
            color:#777b87;
            font-size:18px;
          "
        >
          ×
        </button>

      </div>
    `;

  }).join("");


  const total = getCartTotal();

  container.innerHTML = `
    ${itemsHTML}

    <div class="cart-total">

      <div class="total-row">
        <span>Товары</span>
        <span>${formatPrice(total)} ₽</span>
      </div>

      <div class="total-row">
        <span>Доставка</span>
        <span style="color:#3ddc84">0 ₽</span>
      </div>

      <div class="total-row final">
        <span>Итого</span>
        <span>${formatPrice(total)} ₽</span>
      </div>

      <button
        class="primary-btn"
        onclick="showPage('checkout')"
      >
        Перейти к оформлению
      </button>

    </div>
  `;
}


function getCartTotal() {

  return cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
}


function saveCart() {

  localStorage.setItem(
    "millenniumCart",
    JSON.stringify(cart)
  );
}


function updateCartCount() {

  const count = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const badge = document.getElementById("cartCount");

  if (badge) {
    badge.textContent = count || "";
  }
}


/* =========================
   FAVORITES
========================= */

function toggleFavorite(id) {

  if (favorites.includes(id)) {

    favorites = favorites.filter(
      item => item !== id
    );

    showToast("Удалено из избранного");

  } else {

    favorites.push(id);

    showToast("Добавлено в избранное");
  }

  localStorage.setItem(
    "millenniumFavorites",
    JSON.stringify(favorites)
  );

  renderHome();
  renderCatalog();

  if (
    document
      .getElementById("favorites")
      .classList
      .contains("active")
  ) {
    renderFavorites();
  }
}


function renderFavorites() {

  const container =
    document.getElementById("favoritesContent");

  if (!container) return;

  const list = products.filter(
    product => favorites.includes(product.id)
  );

  if (!list.length) {

    container.innerHTML = `
      <div class="empty-state"
           style="grid-column:1/-1">

        <div class="empty-icon">♡</div>

        <h2>Избранное пусто</h2>

        <p>
          Нажимайте на сердечко,
          чтобы сохранить товар.
        </p>

        <button
          class="primary-btn"
          onclick="showPage('catalog')"
        >
          Открыть каталог
        </button>

      </div>
    `;

    return;
  }

  container.innerHTML =
    list.map(productHTML).join("");
}


/* =========================
   CHECKOUT
========================= */

function renderCheckout() {

  const container =
    document.getElementById("checkoutSummary");

  if (!container) return;

  if (!cart.length) {

    container.innerHTML = `
      <div class="empty-state">
        <h2>Корзина пуста</h2>
        <button
          class="primary-btn"
          onclick="showPage('catalog')"
        >
          Перейти в каталог
        </button>
      </div>
    `;

    return;
  }

  const total = getCartTotal();

  container.innerHTML = `
    <div class="cart-total">

      <div class="total-row">
        <span>Товаров</span>
        <span>${cart.length}</span>
      </div>

      <div class="total-row">
        <span>Доставка</span>
        <span style="color:#3ddc84">0 ₽</span>
      </div>

      <div class="total-row final">
        <span>К оплате</span>
        <span>${formatPrice(total)} ₽</span>
      </div>

      <button
        class="primary-btn"
        onclick="placeOrder()"
      >
        Подтвердить заказ · ${formatPrice(total)} ₽
      </button>

    </div>
  `;
}


/* =========================
   ORDER
========================= */

function placeOrder() {

  if (!cart.length) {
    showToast("Корзина пуста");
    return;
  }

  const name =
    document.getElementById("nameInput").value.trim();

  const phone =
    document.getElementById("phoneInput").value.trim();

  if (!name || !phone) {

    showToast("Заполните имя и телефон");

    return;
  }

  const order = {

    id:
      "M" +
      Date.now()
        .toString()
        .slice(-6),

    date:
      new Date()
        .toLocaleDateString("ru-RU"),

    status: "Принят",

    delivery:
      "Завтра, 12:00–18:00",

    total:
      getCartTotal(),

    items:
      cart.length

  };


  orders.push(order);

  localStorage.setItem(
    "millenniumOrders",
    JSON.stringify(orders)
  );


  cart = [];

  saveCart();

  updateCartCount();

  showToast("Заказ оформлен");

  setTimeout(() => {
    showPage("orders");
  }, 600);
}


function renderOrders() {

  const container =
    document.getElementById("ordersContent");

  if (!container) return;

  if (!orders.length) {

    container.innerHTML = `
      <div class="empty-state">

        <div class="empty-icon">📦</div>

        <h2>Заказов пока нет</h2>

        <p>
          После оформления здесь появится
          информация о доставке.
        </p>

        <button
          class="primary-btn"
          onclick="showPage('catalog')"
        >
          Перейти в каталог
        </button>

      </div>
    `;

    return;
  }


  container.innerHTML = orders
    .slice()
    .reverse()
    .map(order => `

      <div class="cart-total"
           style="text-align:left;margin-bottom:10px">

        <div style="
          display:flex;
          justify-content:space-between;
          margin-bottom:10px;
        ">
          <strong>Заказ #${order.id}</strong>

          <span style="color:#3ddc84">
            ${order.status}
          </span>
        </div>

        <p style="
          color:#9699a4;
          font-size:12px;
          margin-bottom:8px;
        ">
          ${order.date}
        </p>

        <p style="
          font-size:13px;
          margin-bottom:8px;
        ">
          📦 ${order.items} товар(а)
        </p>

        <p style="
          color:#9699a4;
          font-size:12px;
        ">
          🚚 Ожидаемая доставка:
          ${order.delivery}
        </p>

        <div style="
          border-top:1px solid #282b32;
          margin-top:12px;
          padding-top:12px;
          font-weight:800;
        ">
          ${formatPrice(order.total)} ₽
        </div>

      </div>

    `)
    .join("");

  document.getElementById("profileOrders").textContent =
    orders.length;
}


/* =========================
   FILTERS
========================= */

function openFilters() {

  document
    .getElementById("filterModal")
    .classList
    .add("show");
}


function closeFilters() {

  document
    .getElementById("filterModal")
    .classList
    .remove("show");
}


/* =========================
   PAYMENT
========================= */

document.addEventListener("click", event => {

  const payment =
    event.target.closest(".payment");

  if (!payment) return;

  document.querySelectorAll(".payment")
    .forEach(item => item.classList.remove("active"));

  payment.classList.add("active");
});


/* =========================
   HELPERS
========================= */

function formatPrice(number) {

  return new Intl.NumberFormat("ru-RU")
    .format(number);
}


function showToast(message) {

  const toast =
    document.getElementById("toast");

  toast.textContent = message;

  toast.classList.add("show");

  clearTimeout(window.toastTimer);

  window.toastTimer =
    setTimeout(() => {
      toast.classList.remove("show");
    }, 1800);
}


/* =========================
   START
========================= */

renderHome();
renderCatalog();
updateCartCount();
renderOrders();
renderFavorites();

showPage("home");
