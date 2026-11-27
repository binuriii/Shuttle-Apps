const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));

export default {
  name: 'WhatMakesUsSpecial',

  data() {
    return {
      eyebrow: 'OUR CRAFT',
      title: 'What makes us special',
      intro:
        'We make fewer apps and put more care into each one. Here is what you will notice in every Shuttle app.',
      features: [
        {
          id: '01',
          area: 'a',
          title: 'Made only for iPhone',
          text: 'We focus on one kind of phone, so every Shuttle app looks and moves like the rest of your iPhone. There is nothing new to learn.',
        },
        {
          id: '02',
          area: 'b',
          title: 'One job, done well',
          text: 'Each Shuttle app is built around one clear purpose. No crowded menus and no features you will never use. Just the thing you came for.',
        },
        {
          id: '03',
          area: 'c',
          title: 'Smooth to the touch',
          text: 'Every tap and swipe answers instantly, with calm, gentle movement. Small details that make an app a pleasure to use.',
        },
        {
          id: '04',
          area: 'e',
          title: 'Works without signal',
          text: 'Where it makes sense, Shuttle apps keep working when you are offline and catch up quietly when you are back online.',
        },
        {
          id: '05',
          area: 'f',
          title: 'Easy for everyone',
          text: 'We check every Shuttle app with larger text, screen readers and high contrast, so more people can use it comfortably.',
        },
        {
          id: '06',
          area: 'g',
          title: 'We listen',
          text: 'We read your reviews and messages, and they help us decide what to improve next. Your feedback shapes every update.',
        },
      ],
    };
  },

  computed: {
    // Dotted hemisphere for the decorative tile
    dots() {
      const out = [];
      const rows = 11;
      for (let i = 0; i < rows; i++) {
        const lat = (i / (rows - 1)) * (Math.PI / 2) * 0.96;
        const count = Math.max(6, Math.round(26 * Math.cos(lat)));
        for (let j = 0; j < count; j++) {
          const lon = (j / count) * Math.PI * 2;
          const x = Math.cos(lat) * Math.sin(lon);
          const z = Math.cos(lat) * Math.cos(lon);
          if (z < -0.1) continue; // keep the front face only
          out.push({
            x: +(x * 80).toFixed(2),
            y: +(80 - Math.sin(lat) * 150).toFixed(2),
            r: +(0.8 + z * 1.4).toFixed(2),
          });
        }
      }
      return out;
    },
  },

  mounted() {
    this._raf = 0;
    this.updateScroll();
    window.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('resize', this.onScroll);
  },

  beforeUnmount() {
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onScroll);
    if (this._raf) cancelAnimationFrame(this._raf);
  },

  methods: {
    onScroll() {
      if (!this._raf) this._raf = requestAnimationFrame(this.updateScroll);
    },

    /* Scroll animation: sets --p (0 → 1) on the header and on every card.
       Each one animates as it travels up from the bottom of the screen,
       and it reverses when you scroll back up. */
    updateScroll() {
      this._raf = 0;
      const root = this.$refs.root;
      if (!root) return;
      const vh = window.innerHeight;

      const head = root.querySelector('.special-head');
      if (head) {
        const r = head.getBoundingClientRect();
        head.style.setProperty('--p', clamp((vh - r.top) / (vh * 0.5)).toFixed(3));
      }

      const panel = root.querySelector('.special-panel');
      if (!panel) return;
      const pr = panel.getBoundingClientRect();

      root.querySelectorAll('.special-card').forEach((card) => {
        const r = card.getBoundingClientRect();
        // cards further right start a little later, so each row ripples in
        const stagger = clamp((r.left - pr.left) / Math.max(pr.width, 1)) * 0.35;
        const p = clamp((vh - r.top) / (vh * 0.4) - stagger);
        card.style.setProperty('--p', p.toFixed(3));
      });
    },

    // Soft spotlight that follows the pointer inside each card
    onPointerMove(e) {
      const el = e.currentTarget;
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', e.clientX - r.left + 'px');
      el.style.setProperty('--my', e.clientY - r.top + 'px');
    },
  },
};