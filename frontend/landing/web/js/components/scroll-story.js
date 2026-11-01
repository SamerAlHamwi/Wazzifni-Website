// Scroll-driven story: as the hero scrolls away, the Iraq map glides from beside the headline to the
// centre of the screen, grows and dims, and stays fixed as the page's background.
// Also shifts the page's ambient colour to the section in view.
const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;

export function setupAmbientTone() {
  const root = document.documentElement;
  const sections = [document.getElementById('top'), ...document.querySelectorAll('[data-tone]')].filter(Boolean);
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const tone = getComputedStyle(entry.target).getPropertyValue('--tone').trim() || '#00B6E7';
      root.style.setProperty('--ambient', tone);
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => observer.observe(s));
}

export function setupHeroScroll() {
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const hero = document.querySelector('.hero');
  const holder = hero?.querySelector('.hero-visual');
  const map = holder?.querySelector('.hero-map');
  if (!hero || !map) return;

  const mm = gsap.matchMedia();

  mm.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
    // Keep the hero's layout while the map moves into a fixed layer at the start of <body>,
    // so every later section paints above it
    holder.style.minHeight = `${holder.offsetHeight}px`;
    const layer = document.createElement('div');
    layer.className = 'map-layer';
    layer.setAttribute('aria-hidden', 'true');
    document.body.prepend(layer);
    layer.appendChild(map);

    // Where the map sits beside the headline when the page is at the top
    // (the map is capped at 560px and centred in its column)
    let base = {};
    const measure = () => {
      const r = holder.getBoundingClientRect();
      const width = Math.min(r.width, 560);
      const left = r.left + (r.width - width) / 2;
      const top = r.top + window.scrollY;
      map.style.width = `${width}px`;
      base = { top, left, width, height: map.offsetHeight };
      gsap.set(layer, { top, left, width });
    };
    measure();

    const target = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const scale = Math.min((vh * 1.05) / base.height, (vw * 0.9) / base.width);
      return {
        x: vw / 2 - (base.left + base.width / 2),
        y: vh / 2 + 32 - (base.top + base.height / 2),
        scale,
      };
    };

    const labels = map.querySelectorAll('.hq-label, .map-card, .map-legend, .node-label');
    let tl = null;
    const build = () => {
    tl = gsap.timeline({
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        // Finish while the hero is still partly visible, so the map has settled before the stats arrive
        end: 'bottom 40%',
        scrub: 0.8,
        invalidateOnRefresh: true,
        onRefreshInit: measure,
        onUpdate: (self) => layer.classList.toggle('is-background', self.progress > 0.5),
      },
    });

    // Explicit start values, so building this while the intros are still running can't capture
    // half-faded states
    tl.fromTo(hero.querySelector('.hero-copy'), { opacity: 1, y: 0 }, { opacity: 0, y: -60, duration: 0.6, ease: 'power1.in', immediateRender: false }, 0)
      .fromTo(labels, { opacity: 1 }, { opacity: 0, duration: 0.35, immediateRender: false }, 0)
      .to(layer, {
        x: () => target().x,
        y: () => target().y,
        scale: () => target().scale,
        opacity: 0.16,
        duration: 1,
        ease: 'power2.inOut',
      }, 0);

    // Jump straight to the current scroll position (e.g. after a refresh part-way down the page)
    const st = tl.scrollTrigger;
    st.refresh();
    tl.progress(st.progress);
    layer.classList.toggle('is-background', st.progress > 0.5);
    };

    // Built right away so the map follows the scroll even while the intros are playing
    let cancelled = false;
    build();

    return () => {
      // Put the map back in the hero if the layout switches to mobile
      cancelled = true;
      if (tl) { tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill(); }
      gsap.set(layer, { clearProps: 'all' });
      holder.style.minHeight = '';
      map.style.width = '';
      holder.appendChild(map);
      layer.remove();
    };
  });

  // Phones and tablets: the map is the page's fixed background from the start, behind the hero text,
  // rather than a block that fills the first screen
  mm.add('(max-width: 900px)', () => {
    const layer = document.createElement('div');
    layer.className = 'map-layer map-layer--mobile is-background';
    layer.setAttribute('aria-hidden', 'true');
    document.body.prepend(layer);
    layer.appendChild(map);
    holder.hidden = true;

    // Dims a little further once the hero has scrolled away
    let tween = null;
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // On the map itself, so it doesn't fight the boot fade on the layer
      tween = gsap.fromTo(map, { opacity: 1 }, {
        opacity: 0.5,
        ease: 'none',
        scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
      });
    }

    return () => {
      if (tween) { tween.scrollTrigger && tween.scrollTrigger.kill(); tween.kill(); }
      gsap.set([layer, map], { clearProps: 'opacity' });
      holder.hidden = false;
      holder.appendChild(map);
      layer.remove();
    };
  });
}
