const products = [
  {
    id: 1,
    name: "Сыворотка для лица",
    description: "Осветляющая сыворотка с ниацинамидом",
    price: 441,
    category: "beauty",
    icon: "🧴"
  },
  {
    id: 2,
    name: "Парфюм Millennium",
    description: "Свежий мужской аромат 100 мл",
    price: 1290,
    category: "beauty",
    icon: "🧪"
  },
  {
    id: 3,
    name: "Худи Oversize",
    description: "Мягкое худи свободного кроя",
    price: 3024,
    category: "clothes",
    icon: "👕"
  },
  {
    id: 4,
    name: "Кроссовки Urban",
    description: "Повседневная модель для города",
    price: 4590,
    category: "clothes",
    icon: "👟"
  },
  {
    id: 5,
    name: "Наушники Pro",
    description: "Беспроводные наушники с шумоподавлением",
    price: 3890,
    category: "electronics",
    icon: "🎧"
  },
  {
    id: 6,
    name: "Смарт-часы",
    description: "Мониторинг активности и уведомления",
    price: 5190,
    category: "electronics",
    icon: "⌚"
  },
  {
    id: 7,
    name: "Настольная лампа",
    description: "Минималистичная LED-лампа",
    price: 1490,
    category: "home",
    icon: "💡"
  },
  {
    id: 8,
    name: "Органайзер",
    description: "Компактный органайзер для дома",
    price: 790,
    category: "home",
    icon: "📦"
  }
];


let cart = JSON.parse(localStorage.getItem("millenniumCart")) || [];

let orders = JSON.parse(localStorage.getItem("millenniumOrders")) || [];

let currentCategory = "all";


function saveCart() {
  localStorage.setItem(
    "millenniumCart",
    JSON.stringify(cart)
  );

  updateCartCount();
}


function saveOrders() {
  localStorage.setItem(
    "millenniumOrders",
    JSON.stringify(orders)
  );
}


function money(number) {
  return number.toLocaleString("ru-RU") + " ₽";
}


function updateCartCount() {

  const count = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  document.getElementById("cartCount").textContent = count;

  document.getElementById("navCartCount").textContent = count;
}


function showPage(pageName) {

  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  const page = document.getElementById(pageName);

  if (!page) return;

  page.classList.add("active");

  document.querySelectorAll(".bottom-nav button").forEach(button => {
    button.classList.remove("active");
  });

  const navButton = document.querySelector(
    `.bottom-nav button[data-page="${pageName}"]`
  );

  if (navButton) {
    navButton.classList.add("active");
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  if (pageName === "catalog") {
    renderCatalog();
  }

  if (pageName === "cart") {
    renderCart();
  }

  if (pageName === "checkout") {
    renderCheckout();
  }

  if (pageName === "orders") {
    renderOrders();
  }
}


function productHTML(product) {

  return `
    <article class="product">

      <div class="product-image">
        ${product.icon}
      </div>

      <div class="product-info">

        <div class="product-category">
          ${categoryName(product.category)}
        </div>

        <h3>${product.name}</h3>

        <p class="product-description">
          ${product.description}
        </p>

        <div class="price-row">

          <span class="price">
            ${money(product.price)}
          </span>

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


function categoryName(category) {

  const names = {
    beauty: "Красота",
    clothes: "Одежда",
    electronics: "Техника",
    home: "Дом"
  };

  return names[category] || "Товар";
}


function renderHome() {

  const container =
    document.getElementById("homeProducts");

  container.innerHTML =
    products
      .slice(0, 4)
      .map(productHTML)
      .join("");
}


function renderCatalog() {

  const container =
    document.getElementById("catalogProducts");

  const search =
    document
      .getElementById("searchInput")
      .value
      .toLowerCase()
      .trim();

  let filtered = products.filter(product => {

    const categoryMatch =
      currentCategory === "all" ||
      product.category === currentCategory;

    const searchMatch =
      product.name
        .toLowerCase()
        .includes(search) ||
      product.description
        .toLowerCase()
        .includes(search);

    return categoryMatch && searchMatch;
  });


  if (!filtered.length) {

    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⌕</div>
        <h2>Ничего не найдено</h2>
        <p>Попробуйте изменить запрос.</p>
      </div>
    `;

    return;
  }


  container.innerHTML =
    filtered
      .map(productHTML)
      .join("");
}


function filterCategory(category, button) {

  currentCategory = category;

  document.querySelectorAll(".category").forEach(item => {
    item.classList.remove("active");
  });

  button.classList.add("active");

  renderCatalog();
}


function addToCart(productId) {

  const product =
    products.find(item => item.id === productId);

  if (!product) return;


  const existing =
    cart.find(item => item.id === productId);


  if (existing) {
    existing.quantity++;
  } else {

    cart.push({
      id: product.id,
      quantity: 1
    });

  }


  saveCart();

  showToast(
    `${product.name} добавлен в корзину`
  );
}


function removeFromCart(productId) {

  cart =
    cart.filter(item => item.id !== productId);

  saveCart();

  renderCart();
}


function changeQuantity(productId, change) {

  const item =
    cart.find(item => item.id === productId);

  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  saveCart();

  renderCart();
}


function getCartProducts() {

  return cart.map(item => {

    const product =
      products.find(product => product.id === item.id);

    return {
      ...product,
      quantity: item.quantity
    };

  });
}


function getSubtotal() {

  return getCartProducts()
    .reduce(
      (sum, item) =>
        sum + item.price * item.quantity,
      0
    );
}


function renderCart() {

  const container =
    document.getElementById("cartContent");

  if (!cart.length) {

    container.innerHTML = `
      <div class="empty-state">

        <div class="empty-icon">🛒</div>

        <h2>Корзина пуста</h2>

        <p>
          Добавьте товары из каталога
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


  const items =
    getCartProducts();


  const itemsHTML =
    items.map(item => `

      <div class="cart-item">

        <div class="cart-image">
          ${item.icon}
        </div>

        <div>

          <h3>${item.name}</h3>

          <p>${money(item.price)}</p>

          <div class="quantity">

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

        </div>

        <strong>
          ${money(item.price * item.quantity)}
        </strong>

      </div>

    `).join("");


  const subtotal = getSubtotal();


  container.innerHTML = `

    <div class="cart-layout">

      <div>
        ${itemsHTML}
      </div>

      <aside class="cart-summary">

        <h2>Итого</h2>

        <div class="summary-line">
          <span>Товары</span>
          <strong>${money(subtotal)}</strong>
        </div>

        <div class="summary-line">
          <span>Доставка</span>
          <strong class="free">Бесплатно</strong>
        </div>

        <div class="summary-total">
          <span>Всего</span>
          <strong>${money(subtotal)}</strong>
        </div>

        <br>

        <button
          class="primary-btn full"
          onclick="showPage('checkout')"
        >
          Оформить заказ
        </button>

      </aside>

    </div>
  `;
}


function renderCheckout() {

  const items =
    getCartProducts();

  const container =
    document.getElementById("checkoutItems");

  const subtotal =
    getSubtotal();


  if (!items.length) {

    showPage("cart");

    return;
  }


  container.innerHTML =
    items.map(item => `

      <div class="checkout-product">

        <span>
          ${item.name} × ${item.quantity}
        </span>

        <strong>
          ${money(item.price * item.quantity)}
        </strong>

      </div>

    `).join("");


  document.getElementById(
    "checkoutSubtotal"
  ).textContent = money(subtotal);


  document.getElementById(
    "checkoutTotal"
  ).textContent = money(subtotal);


  const date =
    new Date();

  date.setDate(
    date.getDate() + 2
  );


  document.getElementById(
    "deliveryDate"
  ).textContent =
    date.toLocaleDateString(
      "ru-RU",
      {
        day: "numeric",
        month: "long"
      }
    );
}


function placeOrder() {

  if (!cart.length) {
    showToast("Корзина пуста");
    return;
  }


  const name =
    document
      .getElementById("customerName")
      .value
      .trim();


  const phone =
    document
      .getElementById("customerPhone")
      .value
      .trim();


  if (!name || !phone) {

    showToast(
      "Заполните имя и телефон"
    );

    return;
  }


  const payment =
    document.querySelector(
      'input[name="payment"]:checked'
    ).value;


  const subtotal =
    getSubtotal();


  const order = {

    id:
      "MM-" +
      Math.floor(
        100000 + Math.random() * 900000
      ),

    date:
      new Date().toLocaleDateString("ru-RU"),

    total:
      subtotal,

    status:
      "Заказ оформлен",

    delivery:
      "Послезавтра",

    payment:
      payment

  };


  orders.unshift(order);

  saveOrders();


  cart = [];

  saveCart();


  showToast(
    "Заказ успешно оформлен"
  );


  setTimeout(() => {
    showPage("orders");
  }, 700);
}


function renderOrders() {

  const container =
    document.getElementById("ordersContent");


  if (!orders.length) {

    container.innerHTML = `
      <div class="empty-state">

        <div class="empty-icon">▤</div>

        <h2>Заказов пока нет</h2>

        <p>
          После покупки здесь появится информация о доставке.
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


  container.innerHTML =
    orders.map(order => `

      <div class="order-card">

        <div class="order-top">

          <span class="order-number">
            ${order.id}
          </span>

          <span class="order-status">
            ● ${order.status}
          </span>

        </div>

        <h3>
          ${money(order.total)}
        </h3>

        <p>
          Оформлен: ${order.date}
        </p>

        <p>
          Доставка: ${order.delivery}
        </p>

      </div>

    `).join("");
}


function showSettings() {

  document
    .getElementById("settingsBox")
    .classList.toggle("open");
}


function saveSettings() {

  showToast(
    "Настройки сохранены"
  );

}


function openSearch() {

  showPage("catalog");

  setTimeout(() => {

    document
      .getElementById("searchInput")
      .focus();

  }, 300);
}


function showToast(message) {

  const toast =
    document.getElementById("toast");

  toast.textContent = message;

  toast.classList.add("show");


  setTimeout(() => {

    toast.classList.remove("show");

  }, 2200);
}


document.addEventListener(
  "DOMContentLoaded",
  () => {

    renderHome();

    updateCartCount();

    renderCatalog();

    showPage("home");

  }
);
