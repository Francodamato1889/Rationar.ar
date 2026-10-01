(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function(s,c){return (c||document).querySelector(s)};
  var $$ = function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};

  var header = $('#top'), bar = $('#progress');
  function onScroll(){
    var y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
    header.classList.toggle('scrolled', y > 10);
    bar.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
    procUpdate();
  }

  var burger = $('#burger'), menu = $('#menu');
  burger.addEventListener('click', function(){
    var open = burger.getAttribute('aria-expanded') !== 'true';
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    menu.classList.toggle('open', open);
  });
  $$('#menu a').forEach(function(a){ a.addEventListener('click', function(){ burger.setAttribute('aria-expanded','false'); menu.classList.remove('open'); }); });

  var navLinks = $$('#menu a:not(.btn)');
  var spy = new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ navLinks.forEach(function(a){ a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id); }); } });
  }, {rootMargin:'-45% 0px -50% 0px'});
  ['inicio','servicios','automatizaciones','nosotros','contacto'].forEach(function(id){ var el = document.getElementById(id); if(el) spy.observe(el); });

  var rot = $('#rot'), words = $$('#rot span'), wi = 0;
  function fitRot(){ rot.style.width = words[wi].offsetWidth + 'px'; }
  fitRot();
  if(document.fonts) document.fonts.ready.then(fitRot);
  if(!reduce) setInterval(function(){
    var cur = words[wi]; cur.classList.remove('on'); cur.classList.add('out');
    wi = (wi + 1) % words.length;
    var nx = words[wi]; nx.classList.remove('out'); void nx.offsetWidth; nx.classList.add('on');
    fitRot();
    setTimeout(function(){ cur.classList.remove('out'); }, 650);
  }, 2400);

  var hub = $('#hub'), hubSvg = $('#hubSvg');
  if(!reduce && matchMedia('(pointer:fine)').matches){
    hub.addEventListener('pointermove', function(e){
      var r = hub.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      hubSvg.style.transform = 'rotateX(' + (-y * 10) + 'deg) rotateY(' + (x * 10) + 'deg) translate(' + (x * 10) + 'px,' + (y * 10) + 'px)';
    });
    hub.addEventListener('pointerleave', function(){ hubSvg.style.transform = ''; });
    hub.style.perspective = '900px';
  }

  var chatTimers = [];
  function playChat(panel){
    chatTimers.forEach(clearTimeout); chatTimers = [];
    var chat = panel.querySelector('[data-chat]'); if(!chat) return;
    var msgs = $$('.m', chat), typing = $('.typing', chat);
    msgs.forEach(function(m){ m.classList.remove('show'); });
    if(reduce){ msgs.forEach(function(m){ m.classList.add('show'); }); return; }
    var t = 300;
    msgs.forEach(function(m){
      if(m.classList.contains('b')){
        chatTimers.push(setTimeout(function(){ m.parentNode.insertBefore(typing, m); typing.classList.add('show'); }, t));
        t += 1100;
        chatTimers.push(setTimeout(function(){ typing.classList.remove('show'); m.classList.add('show'); }, t));
      } else {
        chatTimers.push(setTimeout(function(){ m.classList.add('show'); }, t));
      }
      t += 900;
    });
  }

  var tabs = $$('.tab'), panels = $$('.panel');
  function select(i, focus){
    tabs.forEach(function(t,k){ var on = k === i; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; });
    panels.forEach(function(p,k){ p.classList.toggle('on', k === i); });
    if(focus) tabs[i].focus();
    playChat(panels[i]);
  }
  tabs.forEach(function(t,i){
    t.addEventListener('click', function(){ select(i); });
    t.addEventListener('keydown', function(e){
      if(e.key === 'ArrowDown' || e.key === 'ArrowRight'){ e.preventDefault(); select((i + 1) % tabs.length, true); }
      if(e.key === 'ArrowUp' || e.key === 'ArrowLeft'){ e.preventDefault(); select((i - 1 + tabs.length) % tabs.length, true); }
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); select(i); }
    });
  });

  var scenarios = [
    [['Llega una consulta','Por tu web, WhatsApp o Instagram.'],['La IA la entiende','Detecta qué busca y si es un buen cliente.'],['Se carga en tu CRM','Con nombre, contacto y lo que pidió.'],['Seguimiento automático','Respuesta al cliente y aviso a tu equipo.']],
    [['Llega una factura','Por e-mail, en PDF o foto.'],['La IA lee los datos','Proveedor, fecha, importes e impuestos.'],['Se registra en el sistema','Directo a tu ERP o planilla.'],['Todo archivado','Y un aviso si algo no cierra.']],
    [['Tus datos de siempre','Ventas, stock o turnos en Excel o Sheets.'],['Se procesan solos','Cruce, limpieza y cálculos cada día.'],['Tablero actualizado','Números claros, sin armar nada a mano.'],['Resumen en tu mail','Cada lunes, listo para decidir.']]
  ];
  var steps = $$('#flow .step'), flow = $('#flow'), scenBtns = $$('.scen button'), litI = 0, litTimer;
  function renderScen(s, animate){
    function fill(){ steps.forEach(function(st,k){ $('h3',st).textContent = scenarios[s][k][0]; $('p',st).textContent = scenarios[s][k][1]; }); flow.classList.remove('swap'); }
    if(animate && !reduce){ flow.classList.add('swap'); setTimeout(fill, 280); } else fill();
    scenBtns.forEach(function(b,k){ b.setAttribute('aria-pressed', k === s); });
  }
  scenBtns.forEach(function(b,k){ b.addEventListener('click', function(){ renderScen(k, true); }); });
  renderScen(0, false);
  if(!reduce){ litTimer = setInterval(function(){ steps.forEach(function(st,k){ st.classList.toggle('lit', k === litI); }); litI = (litI + 1) % steps.length; }, 900); }

  var proc = $('#proc'), fillEl = $('#procFill'), psteps = $$('.pstep');
  function procUpdate(){
    var r = proc.getBoundingClientRect(), p = Math.min(1, Math.max(0, (innerHeight * .75 - r.top) / (r.height + innerHeight * .2)));
    fillEl.style.transform = 'scaleX(' + p + ')';
    psteps.forEach(function(s,k){ s.classList.toggle('done', p >= (k / psteps.length) + .02); });
  }

  var rv = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); rv.unobserve(e.target); } }); }, {threshold:.15});
  $$('.reveal').forEach(function(el){ rv.observe(el); });

  var stageObs = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ var on = $('.panel.on'); if(on) playChat(on); stageObs.disconnect(); } }); }, {threshold:.4});
  stageObs.observe($('.stage'));

  var WA_NUMBER = '5493416054994';
  var form = $('#form'), sent = $('#sent');
  var rules = {'f-name':function(v){return v.trim().length > 1}, 'f-mail':function(v){return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())}, 'f-svc':function(v){return v !== ''}, 'f-msg':function(v){return v.trim().length > 4}};
  Object.keys(rules).forEach(function(id){ var el = document.getElementById(id); el.addEventListener('input', function(){ el.parentNode.classList.remove('invalid'); }); el.addEventListener('change', function(){ el.parentNode.classList.remove('invalid'); }); });
  form.addEventListener('submit', function(e){
    e.preventDefault(); var first = null;
    Object.keys(rules).forEach(function(id){ var el = document.getElementById(id), ok = rules[id](el.value); el.parentNode.classList.toggle('invalid', !ok); el.setAttribute('aria-invalid', !ok); if(!ok && !first) first = el; });
    if(first){ first.focus(); sent.classList.remove('show'); return; }
    var val = function(id){ return document.getElementById(id).value.trim(); };
    var text = 'Hola, Rational Integrations. Les escribo desde la web.\n\n' +
      '*Nombre:* ' + val('f-name') + '\n' +
      '*E-mail:* ' + val('f-mail') + '\n' +
      '*Servicio:* ' + val('f-svc') + '\n\n' +
      '*Mensaje:* ' + val('f-msg');
    var url = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text);
    if(!window.open(url, '_blank', 'noopener')) location.href = url;
    form.reset(); sent.classList.add('show');
  });

  $('#year').textContent = new Date().getFullYear();
  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', procUpdate);
  onScroll();
})();
