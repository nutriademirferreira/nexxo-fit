/* ==========================================================================
   NEXXO — Lista de equipe cinética
   Port em JS puro (sem React, sem framer-motion, sem build).
   Renderiza em qualquer <div data-nexxo-team></div>.

   PARA TROCAR AS FOTOS: mexa só no array NEXXO_TEAM abaixo.
   `image: null` mostra um bloco com as iniciais em vez de foto quebrada.
   ========================================================================== */

(function () {
  'use strict';

  var NEXXO_TEAM = [
    {
      name: 'Ademir Ferreira',
      role: 'Nutricionista',
      desc: 'plano alimentar, condutas e ajuste de protocolo',
      image: null
    },
    {
      name: 'Murilo Massimetti',
      role: 'Personal Trainer',
      desc: 'plano de treino, progressão de carga e execução',
      image: null
    },
    {
      name: null, // <- nome da psicóloga
      role: 'Psicóloga',
      desc: 'comportamento alimentar e o que trava fora do prato',
      image: null
    },
    {
      name: null, // <- nome do médico
      role: 'Médico',
      desc: 'exames, medicação e conduta clínica',
      image: null
    },
    {
      name: 'Karina',
      role: 'Time de suporte',
      desc: 'dúvidas do dia a dia no grupo',
      image: null
    }
  ];

  var MOBILE_MAX = 767;

  /* ---------- helpers ---------- */

  function isMobile() {
    return window.matchMedia('(max-width: ' + MOBILE_MAX + 'px)').matches;
  }

  function initials(member) {
    var source = member.name || member.role || '';
    return source
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(function (w) { return w.charAt(0).toUpperCase(); })
      .join('');
  }

  // headline = nome quando existe; senão o cargo assume o lugar
  function headline(member) {
    return member.name || member.role;
  }

  function el(tag, className, html) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (html != null) node.innerHTML = html;
    return node;
  }

  function figure(member, caption) {
    var fig = el('div', 'nxt-figure');
    if (member.image) {
      var img = document.createElement('img');
      img.src = member.image;
      img.alt = headline(member);
      img.loading = 'lazy';
      // se a foto falhar, cai no bloco de iniciais em vez de ícone quebrado
      img.onerror = function () {
        img.remove();
        fig.insertBefore(el('div', 'nxt-fallback', initials(member)), fig.firstChild);
      };
      fig.appendChild(img);
    } else {
      fig.appendChild(el('div', 'nxt-fallback', initials(member)));
    }
    if (caption) fig.appendChild(el('div', 'nxt-cap', caption));
    return fig;
  }

  var ICON_ARROW =
    '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7"/><path d="M8 7h9v9"/></svg>';
  var ICON_PLUS =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>';
  var ICON_MINUS =
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M5 12h14"/></svg>';

  /* ---------- instância ---------- */

  function build(root) {
    root.classList.add('nxt');
    root.innerHTML = '';

    var list = el('div', 'nxt-list');
    var rows = [];
    var activeIndex = null;

    NEXXO_TEAM.forEach(function (member, i) {
      var row = el('button', 'nxt-row');
      row.type = 'button';
      row.setAttribute('aria-expanded', 'false');

      var inner = el('div', 'nxt-row-inner');

      var head = el('div', 'nxt-head');
      head.appendChild(el('span', 'nxt-idx', '0' + (i + 1)));
      head.appendChild(el('span', 'nxt-name', headline(member)));

      var meta = el('div', 'nxt-meta');
      var roleWrap = el('div', 'nxt-role');
      // quando o nome já é o headline, o cargo não se repete embaixo
      roleWrap.textContent = member.name ? member.role : '';
      roleWrap.appendChild(el('span', 'nxt-desc', member.desc));
      meta.appendChild(roleWrap);

      var toggle = el('span', 'nxt-toggle', ICON_PLUS);
      var arrow = el('span', 'nxt-arrow', ICON_ARROW);
      meta.appendChild(toggle);
      meta.appendChild(arrow);

      inner.appendChild(head);
      inner.appendChild(meta);
      row.appendChild(inner);

      var panel = el('div', 'nxt-panel');
      var panelInner = el('div', 'nxt-panel-inner');
      panelInner.appendChild(figure(member, member.role));
      panel.appendChild(panelInner);
      row.appendChild(panel);

      list.appendChild(row);
      rows.push({ row: row, panel: panel, panelInner: panelInner, toggle: toggle, member: member });
    });

    root.appendChild(list);

    /* cartão flutuante — um por instância, preso ao cursor */
    var float = el('div', 'nxt-float');
    var floatInner = el('div', 'nxt-float-inner');
    var floatFig = el('div', 'nxt-figure');
    floatInner.appendChild(floatFig);
    float.appendChild(floatInner);
    document.body.appendChild(float);

    function renderFloat(member) {
      floatFig.innerHTML = '';
      var f = figure(member, null);
      // reaproveita o conteúdo, mantendo o contêiner com as medidas do cartão
      while (f.firstChild) floatFig.appendChild(f.firstChild);
      var live = el('div', 'nxt-live');
      live.appendChild(el('span', 'nxt-dot'));
      live.appendChild(el('span', null, member.role));
      floatFig.appendChild(live);
    }

    /* ---------- estado ---------- */

    function setActive(index) {
      if (activeIndex === index) return;
      activeIndex = index;
      var mobile = isMobile();

      rows.forEach(function (r, i) {
        var active = i === index;
        r.row.classList.toggle('is-active', active);
        r.row.classList.toggle('is-dimmed', index !== null && !active);
        r.row.setAttribute('aria-expanded', active ? 'true' : 'false');
        r.toggle.innerHTML = active ? ICON_MINUS : ICON_PLUS;

        if (mobile) {
          // altura explícita para animar; volta a auto ao terminar
          r.panel.style.height = active ? r.panelInner.offsetHeight + 'px' : '0px';
        } else {
          r.panel.style.height = '';
        }
      });

      if (!mobile && index !== null) {
        renderFloat(rows[index].member);
        float.classList.add('is-visible');
      } else {
        float.classList.remove('is-visible');
      }
    }

    /* ---------- eventos ---------- */

    rows.forEach(function (r, i) {
      r.row.addEventListener('mouseenter', function () {
        if (!isMobile()) setActive(i);
      });
      r.row.addEventListener('mouseleave', function () {
        if (!isMobile()) setActive(null);
      });
      r.row.addEventListener('click', function () {
        if (isMobile()) setActive(activeIndex === i ? null : i);
      });
      r.row.addEventListener('focus', function () {
        if (!isMobile()) setActive(i);
      });
    });

    root.addEventListener('mouseleave', function () {
      if (!isMobile()) setActive(null);
    });

    window.addEventListener('resize', function () {
      setActive(null);
      float.classList.remove('is-visible');
    });

    return { float: float };
  }

  /* ---------- física de mola do cursor (compartilhada) ---------- */

  function startCursorSpring(floats) {
    var targetX = 0, targetY = 0;
    var x = 0, y = 0, vx = 0, vy = 0;
    // calibrado por simulação: assenta em ~0.47s com 7px de overshoot.
    // damping mais alto (0.72) dava 167px de overshoot — o cartão chicoteava.
    var STIFFNESS = 0.12, DAMPING = 0.60;
    var running = false;

    // offset pra o cartão não cobrir o texto que está sendo lido
    var OFFSET_X = 26, OFFSET_Y = 24;

    document.addEventListener('mousemove', function (e) {
      targetX = e.clientX + OFFSET_X;
      targetY = e.clientY + OFFSET_Y;
      if (!running) { running = true; requestAnimationFrame(tick); }
    }, { passive: true });

    function anyVisible() {
      for (var i = 0; i < floats.length; i++) {
        if (floats[i].classList.contains('is-visible')) return true;
      }
      return false;
    }

    function tick() {
      vx = (vx + (targetX - x) * STIFFNESS) * DAMPING;
      vy = (vy + (targetY - y) * STIFFNESS) * DAMPING;
      x += vx;
      y += vy;

      var t = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      for (var i = 0; i < floats.length; i++) floats[i].style.transform = t;

      // nenhum cartão à vista e a mola já assentou: para de queimar frame
      var settled = Math.abs(vx) < 0.05 && Math.abs(vy) < 0.05;
      if (settled && !anyVisible()) { running = false; return; }

      requestAnimationFrame(tick);
    }
  }

  /* ---------- boot ---------- */

  function init() {
    var roots = document.querySelectorAll('[data-nexxo-team]');
    if (!roots.length) return;
    var floats = [];
    Array.prototype.forEach.call(roots, function (root) {
      floats.push(build(root).float);
    });
    startCursorSpring(floats);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
