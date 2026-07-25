document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('order-form');
  const year = document.getElementById('year');
  const cartBadge = document.getElementById('cartBadge');
  const floatingBadge = document.getElementById('floatingBadge');
  const cartItems = document.getElementById('cartItems');
  const cartEmpty = document.getElementById('cartEmpty');
  const cartFooter = document.getElementById('cartFooter');
  const cartTotal = document.getElementById('cartTotal');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');

  if (year) year.textContent = new Date().getFullYear();

  // --- EmailJS Init ---
  // Replace 'YOUR_PUBLIC_KEY' with your EmailJS public key
  emailjs.init('YOUR_PUBLIC_KEY');

  // --- Cart State ---
  let cart = JSON.parse(localStorage.getItem('crochet_cart') || '[]');

  function saveCart() {
    localStorage.setItem('crochet_cart', JSON.stringify(cart));
  }

  function getCount() {
    return cart.reduce((s, i) => s + i.qty, 0);
  }

  function getTotal() {
    return cart.reduce((s, i) => s + i.price * i.qty, 0);
  }

  function updateBadges() {
    const c = getCount();
    cartBadge.textContent = c;
    floatingBadge.textContent = c;
  }

  function updateButtonStates() {
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
      const name = btn.dataset.name;
      const inCart = cart.find(i => i.name === name);
      if (inCart) {
        btn.textContent = 'View cart';
        btn.classList.add('in-cart');
      } else {
        btn.textContent = 'Add to cart';
        btn.classList.remove('in-cart');
      }
    });
  }

  function renderCartItems() {
    if (cart.length === 0) {
      cartItems.innerHTML = '';
      cartEmpty.style.display = 'block';
      cartFooter.style.display = 'none';
      return;
    }
    cartEmpty.style.display = 'none';
    cartFooter.style.display = 'block';

    cartItems.innerHTML = cart.map((item, idx) => `
      <div class="cart-item">
        <img src="${item.img}" alt="${item.name}" />
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">$${item.price}</div>
          <div class="cart-item-qty">
            <button class="qty-btn" data-idx="${idx}" data-action="minus">-</button>
            <span>${item.qty}</span>
            <button class="qty-btn" data-idx="${idx}" data-action="plus">+</button>
          </div>
        </div>
        <button class="cart-item-remove" data-idx="${idx}">&times;</button>
      </div>
    `).join('');

    cartTotal.textContent = `$${getTotal()}`;

    cartItems.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        const action = btn.dataset.action;
        if (action === 'plus') cart[idx].qty++;
        if (action === 'minus') {
          cart[idx].qty--;
          if (cart[idx].qty <= 0) cart.splice(idx, 1);
        }
        saveCart();
        updateBadges();
        updateButtonStates();
        renderCartItems();
      });
    });

    cartItems.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        cart.splice(idx, 1);
        saveCart();
        updateBadges();
        updateButtonStates();
        renderCartItems();
      });
    });
  }

  function openCart() {
    renderCartItems();
    cartDrawer.classList.add('open');
    cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    cartDrawer.classList.remove('open');
    cartOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  // --- Add to Cart buttons ---
  document.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.name;
      const price = parseInt(btn.dataset.price);
      const img = btn.dataset.img;

      const existing = cart.find(i => i.name === name);
      if (existing) {
        openCart();
        return;
      }

      cart.push({ name, price, img, qty: 1 });
      saveCart();
      updateBadges();
      updateButtonStates();

      btn.textContent = 'View cart';
      btn.classList.add('in-cart');
    });
  });

  // --- Cart toggle ---
  document.getElementById('cartToggle').addEventListener('click', openCart);
  document.getElementById('floatingCart').addEventListener('click', openCart);
  document.getElementById('cartClose').addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);

  // --- Pay Now ---
  document.getElementById('payNowBtn').addEventListener('click', () => {
    const nameInput = document.getElementById('cartName');
    const phoneInput = document.getElementById('cartPhone');
    const addressInput = document.getElementById('cartAddress');
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const address = addressInput.value.trim();

    if (!name || !phone || !address) {
      alert('Please fill in your name, phone number, and address.');
      return;
    }

    const items = cart.map(i => `${i.name} x${i.qty} = $${i.price * i.qty}`).join('\n');
    const total = `$${getTotal()}`;
    const orderDetails = `Name: ${name}\nPhone: ${phone}\nAddress: ${address}\n\nItems:\n${items}\n\nTotal: ${total}\nPayment: Cash on Delivery`;

    // Send email via EmailJS
    // Replace 'YOUR_SERVICE_ID' and 'YOUR_TEMPLATE_ID' with your EmailJS values
    emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', {
      from_name: name,
      from_phone: phone,
      from_address: address,
      message: orderDetails,
      to_email: 'thakkarharsh829@gmail.com'
    }).then(() => {
      alert(`Thank you, ${name}! Your order has been sent to Harsh. He will contact you soon.`);
      cart = [];
      saveCart();
      updateBadges();
      updateButtonStates();
      closeCart();
      nameInput.value = '';
      phoneInput.value = '';
      addressInput.value = '';
    }).catch(() => {
      // Fallback: open email app
      const subject = encodeURIComponent(`New Order from ${name}`);
      const bodyEncoded = encodeURIComponent(orderDetails);
      window.open(`mailto:thakkarharsh829@gmail.com?subject=${subject}&body=${bodyEncoded}`);
      alert(`Thank you, ${name}! Your order has been sent. Harsh will contact you soon.`);
      cart = [];
      saveCart();
      updateBadges();
      updateButtonStates();
      closeCart();
    });
  });

  // --- Contact form removed (replaced with reviews) ---

  // --- Init ---
  updateBadges();
  updateButtonStates();

  // --- Star Rating ---
  const starSelect = document.getElementById('starSelect');
  let selectedStars = 0;
  if (starSelect) {
    starSelect.querySelectorAll('span').forEach(star => {
      star.addEventListener('click', () => {
        selectedStars = parseInt(star.dataset.star);
        starSelect.querySelectorAll('span').forEach(s => {
          s.classList.toggle('active', parseInt(s.dataset.star) <= selectedStars);
        });
      });
    });
  }

  // --- Review Form ---
  const reviewForm = document.getElementById('review-form');
  if (reviewForm) {
    reviewForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = reviewForm.elements.namedItem('name')?.value?.trim() || 'Someone';
      const review = reviewForm.elements.namedItem('review')?.value?.trim();
      const stars = '⭐'.repeat(selectedStars || 5);

      const grid = document.getElementById('reviewsGrid');
      const card = document.createElement('div');
      card.className = 'review-card';
      card.innerHTML = `
        <div class="review-stars">${stars}</div>
        <p>"${review}"</p>
        <span class="review-author">— ${name}</span>
      `;
      grid.prepend(card);

      alert(`Thank you, ${name}! Your review has been added.`);
      reviewForm.reset();
      selectedStars = 0;
      starSelect.querySelectorAll('span').forEach(s => s.classList.remove('active'));
    });
  }
});
