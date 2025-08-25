let cart = [];

// Produktdatabas
const products = {
  hoodie: {
    name: "Stone Island Sweatshirt",
    price: 599,
    description: "En snygg och bekväm sweatshirt i hög kvalitet från Stone Island. Perfekt för vardag och stilrena outfits.",
    image: "23988843_54152634_1000.webp"
  },
  jacket: {
    name: "North Face Jacka",
    price: 999,
    description: "En robust jacka i streetwear-stil från The North Face. Perfekt för att sticka ut med en edgy look.",
    image: "the-north-face-whiton-3l-jacket-regnjacka.jpg"
  }
};

// --- LocalStorage helpers ---
function loadCart() {
  const savedCart = localStorage.getItem("cart");
  if (savedCart) { cart = JSON.parse(savedCart); }
  updateCart();
}
function saveCart() { localStorage.setItem("cart", JSON.stringify(cart)); }
function clearCart(onCheckoutPage = false) {
  cart = []; saveCart(); updateCart();
  if (onCheckoutPage) {
    const checkoutList = document.getElementById("checkout-cart-list");
    const checkoutTotal = document.getElementById("checkout-total");
    if (checkoutList) checkoutList.innerHTML = "";
    if (checkoutTotal) checkoutTotal.textContent = "Totalt: 0 kr";
  }
}

// --- Cart actions ---
function addToCart(productId, size, qty = 1, imageElement = null) {
  const p = products[productId]; if (!p) return;

  const existing = cart.find(i => i.id === productId && i.size === size);
  if (existing) { existing.qty += qty; }
  else {
    cart.push({ id: productId, name: p.name, price: p.price, image: p.image, size, qty });
  }
  saveCart(); updateCart();

  // Animation på ikon + badge
  const cartIcon = document.querySelector(".cart-icon");
  const cartCount = document.getElementById("cart-count");
  if (cartIcon) { cartIcon.classList.add("animate"); setTimeout(()=>cartIcon.classList.remove("animate"), 500); }
  if (cartCount) { cartCount.classList.add("animate"); setTimeout(()=>cartCount.classList.remove("animate"), 500); }

  // Flygande bild
  if (imageElement && cartIcon) { flyToCart(imageElement, cartIcon); }

  // Popup
  showAddedPopup(`${p.name} lades till i kundvagnen`);
}

// --- Flygande bild ---
function flyToCart(imageElement, cartIcon) {
  const imgClone = imageElement.cloneNode(true);
  const rect = imageElement.getBoundingClientRect();
  imgClone.style.position = "fixed";
  imgClone.style.left = rect.left + "px";
  imgClone.style.top  = rect.top  + "px";
  imgClone.style.width  = rect.width  + "px";
  imgClone.style.height = rect.height + "px";
  imgClone.style.transition = "all 0.8s ease";
  imgClone.style.zIndex = 2000;
  document.body.appendChild(imgClone);

  const cartRect = cartIcon.getBoundingClientRect();
  setTimeout(() => {
    imgClone.style.left = cartRect.left + "px";
    imgClone.style.top  = cartRect.top  + "px";
    imgClone.style.width = "20px";
    imgClone.style.height = "20px";
    imgClone.style.opacity = "0.5";
  }, 50);

  setTimeout(() => { document.body.removeChild(imgClone); }, 900);
}

// --- Popup ---
function showAddedPopup(message) {
  const popup = document.createElement("div");
  popup.className = "added-popup";
  popup.textContent = message;
  document.body.appendChild(popup);

  setTimeout(() => popup.classList.add("show"), 10);
  setTimeout(() => {
    popup.classList.remove("show");
    setTimeout(() => popup.remove(), 400);
  }, 2000);
}

function updateCart() {
  const cartList  = document.getElementById("cart-list");
  const cartCount = document.getElementById("cart-count");
  const cartTotal = document.getElementById("cart-total");

  let total = 0, count = 0;
  if (cartList) cartList.innerHTML = "";

  cart.forEach((item, index) => {
    const lineTotal = item.price * (item.qty || 1);
    total += lineTotal; count += (item.qty || 1);

    if (cartList) {
      const li = document.createElement("li");
      li.className = "cart-item";
      li.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="cart-img" />
        <div class="cart-info">
          <p><strong>${item.name}</strong></p>
          <p>Storlek: ${item.size} x${item.qty}</p>
          <p>${lineTotal} kr</p>
        </div>
        <button class="remove-btn">❌</button>
      `;
      li.querySelector(".remove-btn").onclick = () => {
        cart.splice(index, 1); saveCart(); updateCart();
      };
      cartList.appendChild(li);
    }
  });

  if (cartCount) cartCount.textContent = count;
  if (cartTotal) cartTotal.textContent = `Totalt: ${total} kr`;
}

// --- Cart Drawer ---
function openCart()  { document.getElementById("cart").classList.remove("hidden"); document.getElementById("overlay").classList.remove("hidden"); document.body.classList.add("noscroll"); }
function closeCart() { document.getElementById("cart").classList.add("hidden");   document.getElementById("overlay").classList.add("hidden");   document.body.classList.remove("noscroll"); }
function toggleCart() { const isHidden = document.getElementById("cart").classList.contains("hidden"); isHidden ? openCart() : closeCart(); }

// --- Slideshow ---
let currentSlide = 0;
let slideInterval;

function renderFeaturedSlides() {
  const featured = document.getElementById("featured-slides");
  if (!featured) return;

  featured.innerHTML = "";

  Object.keys(products).forEach(id => {
    const p = products[id];
    const slide = document.createElement("div");
    slide.className = "slide";
    slide.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <div class="slide-content">
        <h2>${p.name}</h2>
        <p>${p.price} kr</p>
        <a href="product.html?id=${id}">Se mer</a>
      </div>
    `;
    featured.appendChild(slide);
  });

  updateSlidePosition();
  startSlideShow();
}

function updateSlidePosition() {
  const slides = document.querySelector(".slides");
  if (slides) {
    slides.style.transform = `translateX(-${currentSlide * 100}%)`;
  }
}

function nextSlide() {
  const total = document.querySelectorAll(".slide").length;
  currentSlide = (currentSlide + 1) % total;
  updateSlidePosition();
}

function prevSlide() {
  const total = document.querySelectorAll(".slide").length;
  currentSlide = (currentSlide - 1 + total) % total;
  updateSlidePosition();
}

function startSlideShow() {
  clearInterval(slideInterval);
  slideInterval = setInterval(nextSlide, 5000);
}

// --- Init ---
document.addEventListener("DOMContentLoaded", () => {
  loadCart();

  // Storleksknappar
  const sizeWrap = document.getElementById("size-options");
  if (sizeWrap) {
    const buttons = Array.from(sizeWrap.querySelectorAll(".size-btn"));
    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        buttons.forEach(b => { b.classList.remove("active","pop"); b.setAttribute("aria-pressed","false"); });
        void btn.offsetWidth;
        btn.classList.add("active","pop");
        btn.setAttribute("aria-pressed","true");
      });
      btn.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); btn.click(); }
      });
    });
  }

  // Checkout-knapp i sidomenyn
  const checkoutBtn = document.getElementById("checkout");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      if (!cart.length) alert("Din kundvagn är tom!");
      else window.location.href = "checkout.html";
    });
  }

  // Töm-knapp i sidomenyn
  const clearBtn = document.getElementById("clear-cart");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (confirm("Vill du tömma kundvagnen?")) clearCart(false);
    });
  }

  // Index: rendera produkter
  const productList = document.getElementById("product-list");
  if (productList) {
    productList.innerHTML = "";
    Object.keys(products).forEach(id => {
      const p = products[id];
      const link = document.createElement("a");
      link.href = `product.html?id=${id}`;
      link.className = "product-link";
      link.innerHTML = `
        <div class="product">
          <img src="${p.image}" alt="${p.name}" />
          <h3>${p.name}</h3>
          <p>${p.price} kr</p>
        </div>
      `;
      productList.appendChild(link);
    });
  }

  // Checkout: rendera orderöversikten
  const checkoutList = document.getElementById("checkout-cart-list");
  const checkoutTotal = document.getElementById("checkout-total");
  if (checkoutList && checkoutTotal) {
    checkoutList.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
      const line = item.price * (item.qty || 1);
      const li = document.createElement("li");
      li.className = "checkout-item";
      li.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="checkout-img" />
        <div class="checkout-info">
          <p><strong>${item.name}</strong></p>
          <p>Storlek: ${item.size}</p>
          <p>Antal: ${item.qty}</p>
          <p>Rad: ${line} kr</p>
        </div>
      `;
      checkoutList.appendChild(li);
      total += line;
    });

    checkoutTotal.textContent = `Totalt: ${total} kr`;

    const form = document.getElementById("checkout-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("name")?.value || "Kund";
        const email = document.getElementById("email")?.value || "";
        alert(`Tack för din beställning, ${name}!\n\nOrderbekräftelse skickas till ${email}.`);
        clearCart(true);
        window.location.href = "index.html";
      });
    }
  }

  // Start slideshow på index
  renderFeaturedSlides();
});

// Stäng kundvagn med Escape
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeCart(); });
