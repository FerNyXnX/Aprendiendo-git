// dist/js/main.js
(() => {
  const qs = (s, ctx = document) => ctx.querySelector(s);
  const qsa = (s, ctx = document) => [...ctx.querySelectorAll(s)];

  // Toggle menú móvil
  const header = qs('[data-header]');
  const nav = qs('.nav');
  const toggle = qs('[data-menu-toggle]');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('is-open');
    });
  }

  // Sticky header
  const onScroll = () => {
    if (window.scrollY > 8) header?.classList.add('is-sticky');
    else header?.classList.remove('is-sticky');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Scroll suave con corrección de header
  const OFFSET = 72;
  qsa('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = qs(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.pageYOffset - OFFSET;
      window.scrollTo({ top, behavior: 'smooth' });
      // Cierra menú en móvil
      if (nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        toggle?.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // IntersectionObserver para reveal
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  qsa('.reveal').forEach(el => observer.observe(el));

  // Acordeón: cerrar otros (opcional, detalles ya es accesible)
  const accordion = qs('[data-accordion]');
  if (accordion) {
    accordion.addEventListener('toggle', e => {
      const opened = e.target;
      if (opened.tagName.toLowerCase() !== 'details' || !opened.open) return;
      qsa('details', accordion).forEach(d => { if (d !== opened) d.open = false; });
    });
  }

  // Validación de formulario
  const form = qs('[data-form]');
  if (form) {
    const errorFor = input => input.closest('.form__field')?.querySelector('.form__error');

    const showError = (input, msg) => {
      const err = errorFor(input);
      if (!err) return;
      err.textContent = msg || '';
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    };

    form.addEventListener('submit', async e => {
      e.preventDefault();
      let valid = true;
      const inputs = qsa('input[required], textarea[required]', form);
      inputs.forEach(input => {
        if (!input.checkValidity()) {
          valid = false;
          showError(input, input.validationMessage);
        } else {
          showError(input, '');
        }
      });
      if (!valid) return;

      // Simular envío
      const btn = form.querySelector('button[type="submit"]');
      const success = form.querySelector('.form__success');
      btn.disabled = true; btn.textContent = 'Enviando...';
      try {
        await new Promise(r => setTimeout(r, 1000));
        success.hidden = false;
        form.reset();
      } catch (err) {
        alert('Ocurrió un error. Inténtalo de nuevo.');
      } finally {
        btn.disabled = false; btn.textContent = 'Enviar';
      }
    });

    form.addEventListener('input', e => {
      const target = e.target;
      if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
      if (target.checkValidity()) showError(target, '');
    });
  }
})();
