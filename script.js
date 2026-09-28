// Fecha del evento: 17 de octubre de 2026, 20:30 h (hora local del visitante)
const EVENT_DATE = new Date('2026-10-17T20:30:00');

const EVENT = {
  title: 'XV Años de Luzmery Naiara',
  location: 'Club de Retirados Militares (Toledo)',
  description: '¡Te espero para celebrar mis XV años!',
  start: '20261017T203000',
  end: '20261018T040000',
};

let countdownTimer;

function updateCountdown() {
  const now = new Date();
  const diff = EVENT_DATE - now;

  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  if (diff <= 0) {
    document.getElementById('countdown-grid').hidden = true;
    document.getElementById('countdown-fin').hidden = false;
    clearInterval(countdownTimer);
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  daysEl.textContent = String(days).padStart(2, '0');
  hoursEl.textContent = String(hours).padStart(2, '0');
  minutesEl.textContent = String(minutes).padStart(2, '0');
  secondsEl.textContent = String(seconds).padStart(2, '0');
}

updateCountdown();
countdownTimer = setInterval(updateCountdown, 1000);

// Agregar al calendario (iPhone / Outlook) con un archivo .ics
const icsButton = document.getElementById('ics-download');

if (icsButton) {
  icsButton.addEventListener('click', () => {
    const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//XV Luzmery Naiara//ES',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      'UID:xv-luzmery-naiara-20261017@invitacion',
      `DTSTAMP:${stamp}`,
      `DTSTART:${EVENT.start}`,
      `DTEND:${EVENT.end}`,
      `SUMMARY:${EVENT.title}`,
      `LOCATION:${EVENT.location}`,
      `DESCRIPTION:${EVENT.description}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'xv-luzmery-naiara.ics';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
}

// Copiar el número de cuenta de regalos
const copiarCuenta = document.getElementById('copiar-cuenta');

if (copiarCuenta) {
  const etiqueta = copiarCuenta.querySelector('span');

  // Alternativa para navegadores sin API de portapapeles (o cuando esta falla)
  const copiarConCampo = (texto) => {
    const campo = document.createElement('textarea');
    campo.value = texto;
    campo.setAttribute('readonly', '');
    campo.style.position = 'fixed';
    campo.style.opacity = '0';
    document.body.appendChild(campo);
    campo.select();
    const ok = document.execCommand('copy');
    campo.remove();
    return ok ? Promise.resolve() : Promise.reject(new Error('No se pudo copiar'));
  };

  const copiarTexto = (texto) => {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(texto).catch(() => copiarConCampo(texto));
    }
    return copiarConCampo(texto);
  };

  copiarCuenta.addEventListener('click', () => {
    copiarTexto(copiarCuenta.dataset.copy).then(() => {
      etiqueta.textContent = '¡Copiado!';
      copiarCuenta.classList.add('is-copiado');
      setTimeout(() => {
        etiqueta.textContent = 'Copiar número';
        copiarCuenta.classList.remove('is-copiado');
      }, 2000);
    }).catch(() => {});
  });
}

// Música de fondo
const musicToggle = document.getElementById('music-toggle');
const bgMusic = document.getElementById('bg-music');

if (musicToggle && bgMusic) {
  let userPaused = false;

  const setPlayingState = (isPlaying) => {
    musicToggle.classList.toggle('is-playing', isPlaying);
    musicToggle.setAttribute('aria-pressed', String(isPlaying));
    musicToggle.setAttribute(
      'aria-label',
      isPlaying ? 'Pausar música de fondo' : 'Reproducir música de fondo'
    );
  };

  musicToggle.addEventListener('click', () => {
    if (bgMusic.paused) {
      bgMusic.play().catch(() => {});
      userPaused = false;
    } else {
      bgMusic.pause();
      userPaused = true;
    }
  });

  bgMusic.addEventListener('play', () => setPlayingState(true));
  bgMusic.addEventListener('pause', () => setPlayingState(false));

  // Los navegadores bloquean el autoplay con sonido: se reproduce
  // automáticamente en la primera interacción del visitante con la página.
  const tryAutoplayOnce = (event) => {
    // El propio botón ya maneja su clic; sin esto la música se pausaba y reanudaba.
    if (musicToggle.contains(event.target)) return;
    if (!userPaused && bgMusic.paused) {
      bgMusic.play().catch(() => {});
    }
    document.removeEventListener('click', tryAutoplayOnce);
    document.removeEventListener('touchstart', tryAutoplayOnce);
  };
  document.addEventListener('click', tryAutoplayOnce);
  document.addEventListener('touchstart', tryAutoplayOnce, { passive: true });
}

// Portada con sobre: al tocarlo se abre, suena la música y aparece la invitación
const sobreIntro = document.getElementById('sobre-intro');
const sobreBtn = document.getElementById('sobre-btn');

if (sobreIntro && sobreBtn) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  sobreBtn.addEventListener('click', () => {
    if (sobreIntro.classList.contains('is-opening')) return;
    sobreIntro.classList.add('is-opening');

    // Se inicia dentro del toque para que iOS y Android permitan el sonido
    if (bgMusic && bgMusic.paused) bgMusic.play().catch(() => {});

    // La tarjeta termina de subir a los ~1,7 s; se deja ~2,6 s para leer el mensaje
    const tiempoLectura = reducedMotion ? 2500 : 4300;

    setTimeout(() => {
      window.scrollTo(0, 0);
      sobreIntro.classList.add('is-open');
      document.body.classList.remove('con-sobre');
    }, tiempoLectura);

    setTimeout(() => sobreIntro.remove(), tiempoLectura + 1000);
  });
}

// Animación de aparición al hacer scroll (escalonada entre elementos hermanos)
const revealElements = document.querySelectorAll('.reveal');

revealElements.forEach((el) => {
  const siblings = Array.from(el.parentElement.children).filter((child) => child.classList.contains('reveal'));
  const index = siblings.indexOf(el);
  if (index > 0) el.style.setProperty('--d', `${Math.min(index, 5) * 0.08}s`);
});

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );
  revealElements.forEach((el) => observer.observe(el));
} else {
  revealElements.forEach((el) => el.classList.add('is-visible'));
}

// Destellos plateados animados en el hero
const sparkleCanvas = document.querySelector('.hero-sparkle');
if (sparkleCanvas) {
  const ctx = sparkleCanvas.getContext('2d');
  const hero = sparkleCanvas.parentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let dots = [];

  const resize = () => {
    sparkleCanvas.width = hero.clientWidth;
    sparkleCanvas.height = hero.clientHeight;
    const count = Math.floor((sparkleCanvas.width * sparkleCanvas.height) / 12000);
    dots = Array.from({ length: count }, () => ({
      x: Math.random() * sparkleCanvas.width,
      y: Math.random() * sparkleCanvas.height,
      r: Math.random() * 1.4 + 0.4,
      baseAlpha: Math.random() * 0.5 + 0.2,
      phase: Math.random() * Math.PI * 2,
    }));
  };

  const draw = (t) => {
    ctx.clearRect(0, 0, sparkleCanvas.width, sparkleCanvas.height);
    dots.forEach((d) => {
      const twinkle = reducedMotion ? d.baseAlpha : d.baseAlpha + Math.sin(t / 1200 + d.phase) * 0.3;
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,255,255,${Math.max(0, Math.min(1, twinkle)).toFixed(3)})`;
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    });
    if (!reducedMotion) requestAnimationFrame(draw);
  };

  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(draw);
}
