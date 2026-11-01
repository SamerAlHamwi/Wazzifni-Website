// Seeker / employer switch — every [data-audience] control and [data-audience-panel] stays in sync,
// so choosing "employer" in the hero also shows the employer steps further down.
export class Audience {
  constructor() {
    this.current = 'seeker';

    document.addEventListener('click', (e) => {
      const tab = e.target.closest('[data-audience]');
      if (tab) {
        this.set(tab.dataset.audience);
        return;
      }
      const link = e.target.closest('[data-audience-link]');
      if (link) this.set(link.dataset.audienceLink);
    });

    // Arrow keys move between tabs within a tablist
    document.querySelectorAll('[role="tablist"]').forEach(list => {
      list.addEventListener('keydown', (e) => {
        if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
        const tabs = [...list.querySelectorAll('[role="tab"]')];
        const i = tabs.indexOf(document.activeElement);
        if (i < 0) return;
        const next = tabs[(i + 1) % tabs.length];
        next.focus();
        next.click();
      });
    });
  }

  set(audience) {
    if (!audience) return;
    this.current = audience;
    document.querySelectorAll('[data-audience]').forEach(tab => {
      const on = tab.dataset.audience === audience;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
    });
    document.querySelectorAll('[data-audience-panel]').forEach(panel => {
      panel.hidden = panel.dataset.audiencePanel !== audience;
    });
    document.querySelectorAll('.audience-switch').forEach(sw => {
      sw.dataset.active = audience;
    });
  }
}
