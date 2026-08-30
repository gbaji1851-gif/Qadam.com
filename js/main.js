// ============================================================
// QADAM — shared site behaviour
// ============================================================

document.addEventListener('DOMContentLoaded', function () {

  // ---- Mobile nav toggle -----------------------------------
  var menuToggle = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
      var expanded = mobileNav.classList.contains('open');
      menuToggle.setAttribute('aria-expanded', expanded);
    });
  }

  // ---- Wishlist heart toggle --------------------------------
  document.querySelectorAll('.product-wish').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      btn.classList.toggle('active');
      var svg = btn.querySelector('svg');
      if (svg) {
        svg.setAttribute('fill', btn.classList.contains('active') ? 'currentColor' : 'none');
        svg.style.color = btn.classList.contains('active') ? '#CE9A8E' : 'currentColor';
      }
      showToast(btn.classList.contains('active') ? 'Added to wishlist' : 'Removed from wishlist');
    });
  });

  // ---- Add to cart buttons (demo only) ----------------------
  document.querySelectorAll('[data-add-to-cart]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      showToast('Added to your bag');
      var count = document.querySelector('.cart-count');
      if (count) {
        count.textContent = (parseInt(count.textContent || '0', 10) + 1).toString();
      }
    });
  });

  // ---- Size pill selector -------------------------------------
  document.querySelectorAll('.size-grid').forEach(function (group) {
    group.querySelectorAll('.size-pill').forEach(function (pill) {
      pill.addEventListener('click', function () {
        group.querySelectorAll('.size-pill').forEach(function (p) { p.classList.remove('active'); });
        pill.classList.add('active');
      });
    });
  });

  // ---- Color pill selector -------------------------------------
  document.querySelectorAll('.color-grid').forEach(function (group) {
    group.querySelectorAll('.color-pill').forEach(function (pill) {
      pill.addEventListener('click', function () {
        group.querySelectorAll('.color-pill').forEach(function (p) { p.classList.remove('active'); });
        pill.classList.add('active');
      });
    });
  });

  // ---- Quantity stepper -----------------------------------------
  document.querySelectorAll('.qty-stepper').forEach(function (stepper) {
    var span = stepper.querySelector('span');
    var minus = stepper.querySelector('[data-qty-minus]');
    var plus = stepper.querySelector('[data-qty-plus]');
    if (!span) return;
    minus && minus.addEventListener('click', function () {
      var v = Math.max(1, parseInt(span.textContent, 10) - 1);
      span.textContent = v;
    });
    plus && plus.addEventListener('click', function () {
      var v = Math.min(10, parseInt(span.textContent, 10) + 1);
      span.textContent = v;
    });
  });

  // ---- Product gallery thumbnails --------------------------------
  var thumbs = document.querySelectorAll('.pd-thumbs button');
  var mainImg = document.querySelector('.pd-gallery-main img');
  thumbs.forEach(function (t) {
    t.addEventListener('click', function () {
      thumbs.forEach(function (x) { x.classList.remove('active'); });
      t.classList.add('active');
      var src = t.getAttribute('data-full');
      if (src && mainImg) mainImg.setAttribute('src', src);
    });
  });

  // ---- Accordion (product detail info) ---------------------------
  document.querySelectorAll('.accordion-item button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.accordion-item');
      var wasOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.accordion-item').forEach(function (i) {
        i.classList.remove('open');
      });
      if (!wasOpen) item.classList.add('open');
    });
  });

  // ---- Newsletter + contact form (demo submit) --------------------
  document.querySelectorAll('form[data-demo-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      showToast('Thanks! We will get back to you soon.');
      form.reset();
    });
  });

  // ---- Toast helper -------------------------------------------------
  function showToast(msg) {
    var toast = document.querySelector('.toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () {
      toast.classList.remove('show');
    }, 2200);
  }

  // ---- Reveal-on-scroll for cards -----------------------------------
  var revealTargets = document.querySelectorAll('.product-card, .cat-card, .review-card, .value-card');
  if ('IntersectionObserver' in window && revealTargets.length) {
    revealTargets.forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(16px)';
      el.style.transition = 'opacity 500ms ease, transform 500ms ease';
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach(function (el) { io.observe(el); });
  }

});
