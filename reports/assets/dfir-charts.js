(function () {
  if (!window.Chart || document.getElementById('rh-dfir-charts')) return;
  var st = document.getElementById('rh-dfir-charts-init') || document.createElement('script');
  st.id = 'rh-dfir-charts-init';

  Chart.register(window.ChartDataLabels);

  var INK = '#F2F5FF', MUTED = '#B5B0A8', GRID = 'rgba(126,167,255,0.14)',
      TIMELINE = '#7EA7FF', BARS = '#2C6BFF', BARS_HOVER = '#C4A882';

  var JOURNEY = [
    { step: 1, title: 'Your device', body: 'splits the message into small packets, each with header info showing where it came from and where it is going.' },
    { step: 2, title: 'Radio waves', body: 'on Wi-Fi the packets leave as radio waves to the router; on mobile data they go to a nearby cell tower.' },
    { step: 3, title: 'Router and modem', body: 'the router manages the home network; the modem converts the signals for the provider\u2019s cables.' },
    { step: 4, title: 'ISP network', body: 'the provider picks the most efficient route for the packets over coaxial or fiber cables.' },
    { step: 5, title: 'Regional hubs', body: 'large data centers exchange traffic between networks and connect to the internet backbone.' },
    { step: 6, title: 'Submarine cables', body: 'for cross-continent data, the backbone includes huge cables on the ocean floor; data travels as light pulses in glass fibers.' },
    { step: 7, title: 'Destination', body: 'the packets are re-assembled in the correct order and the recipient\u2019s device shows the message.' }
  ];

  var TIMELINE_EVENTS = [
    { year: 1969, event: 'ARPANET sends its first message from one network to another.' },
    { year: 1970, event: 'The ARPANET network is established.' },
    { year: 1971, event: 'Ray Tomlinson develops the standard email address format.' },
    { year: 1973, event: 'ARPANET makes its first trans-Atlantic connection.' },
    { year: 1974, event: 'TCP and IP are introduced.' },
    { year: 1977, event: 'Dennis Hayes and Dale Heatherington develop the first PC modem.' },
    { year: 1978, event: 'Gary Thuerk sends the first spam message.' },
    { year: 1984, event: 'DNS is created; John Postel introduces first top-level domains (.com, .org, .gov, .edu, .mil).' },
    { year: 1989, event: 'AOL is launched.' },
    { year: 1991, event: 'Tim Berners-Lee\u2019s World Wide Web goes live.' },
    { year: 1993, event: 'The first web browser, Mosaic, is invented.' },
    { year: 1994, event: 'WebCrawler (first search engine) goes live; Netscape launches.' },
    { year: 1995, event: 'Amazon and eBay (AuctionWeb) go live.' },
    { year: 1996, event: 'Hotmail becomes the first free, web-based email provider.' },
    { year: 1997, event: 'Wireless internet (Wi-Fi) is introduced.' },
    { year: 2001, event: 'Wikipedia goes live.' },
    { year: 2004, event: 'Facebook goes live.' },
    { year: 2005, event: 'YouTube goes live.' }
  ];

  var COUNTRIES = [
    ['USA', 23], ['China', 9], ['Germany', 6], ['Britain', 5], ['Brazil', 4],
    ['Spain', 4], ['France', 3], ['Italy', 3], ['Turkey', 3], ['Poland', 3],
    ['India', 3], ['Russia', 2], ['Canada', 2], ['South Korea', 2], ['Taiwan', 2],
    ['Japan', 2], ['Mexico', 2], ['Argentina', 1], ['Australia', 1], ['Israel', 1]
  ].sort(function (a, b) { return b[1] - a[1]; });

  var GROWTH = [{ year: 2005, users: 1.0 }, { year: 2023, users: 5.4 }];

  var TAXONOMY = {
    root: { label: 'Cybercrime', x: 0, y: 0 },
    branches: [
      { label: 'Cyber-dependent crime', x: 1, y: -2, children: [
        { label: 'Hacking', x: 2, y: -3 }, { label: 'DDoS attacks', x: 2, y: -2 }, { label: 'Malware', x: 2, y: -1 }
      ] },
      { label: 'Cyber-enabled crime', x: 1, y: 0, children: [
        { label: 'Online fraud', x: 2, y: -0.5 }, { label: 'Phishing', x: 2, y: 0 }, { label: 'Digital piracy', x: 2, y: 0.5 }, { label: 'Cyberbullying', x: 2, y: 1 }
      ] },
      { label: 'Wall\u2019s four categories', x: 1, y: 2, children: [
        { label: 'Cyber trespass', x: 2, y: 1.5 }, { label: 'Cyber deception / theft', x: 2, y: 2 },
        { label: 'Cyber pornography / obscenity', x: 2, y: 2.5 }, { label: 'Cyber violence', x: 2, y: 3 }
      ] }
    ]
  };

  var ROUTINE = [
    { label: 'Motivated offender', role: 'motivated offender', x: 0, y: 1.6 },
    { label: 'Suitable target', role: 'suitable target', x: -1.5, y: -0.8 },
    { label: 'Capable guardian', role: 'capable guardian (absent)', x: 1.5, y: -0.8 },
    { label: 'Crime happens', role: 'result', x: 0, y: -0.2 }
  ];

  function wrapText(str, maxChars) {
    var words = str.split(/\s+/), lines = [], line = '', i;
    for (i = 0; i < words.length; i++) {
      var w = words[i];
      if ((line + ' ' + w).trim().length > maxChars && line) { lines.push(line.trim()); line = w; }
      else { line = (line + ' ' + w).trim(); }
    }
    if (line) lines.push(line.trim());
    return lines;
  }

  function tooltip(label) {
    return { displayColors: false, padding: 12, titleFont: { weight: 'bold' },
      callbacks: { label: function (ctx) { return wrapText(String(label(ctx.raw)), 64); } } };
  }

  function diagramBase() {
    return { responsive: true, maintainAspectRatio: false, animation: false,
      plugins: { legend: { display: false },
        tooltip: { displayColors: false, padding: 12, titleFont: { weight: 'bold' } } },
      scales: { x: { border: { display: false }, grid: { display: false }, ticks: { display: false }, title: { display: false } },
        y: { border: { display: false }, grid: { display: false }, ticks: { display: false }, title: { display: false } } } };
  }

  function buildJourney() {
    var pts = JOURNEY.map(function (s) { return { x: s.step, y: 0, title: s.title, body: s.body }; });
    return { type: 'scatter', data: { datasets: [{ label: 'Message journey', data: pts, showLine: true, tension: 0.1,
      borderColor: 'rgba(126,167,255,0.7)', borderWidth: 2.5, pointBackgroundColor: TIMELINE,
      pointBorderColor: INK, pointBorderWidth: 2, pointRadius: 8, pointHoverRadius: 12, pointHoverBackgroundColor: BARS_HOVER }] },
      options: Object.assign(diagramBase(), { plugins: Object.assign(diagramBase().plugins, {
        tooltip: Object.assign(diagramBase().plugins.tooltip, {
          callbacks: { title: function (items) { return items.length ? items[0].raw.title : ''; },
            label: function (ctx) { return wrapText(ctx.raw.body, 60); } } }),
        datalabels: { formatter: function (v) { return v.title; }, anchor: 'center', align: 'top', offset: 12,
          color: INK, font: { size: 11, weight: '600' } } }),
        scales: Object.assign(diagramBase().scales, { x: Object.assign(diagramBase().scales.x, { min: 0.6, max: 7.4 }),
          y: Object.assign(diagramBase().scales.y, { min: -0.9, max: 0.9, grid: { color: GRID } }) }) }) };
  }

  function buildTimeline() {
    return { type: 'scatter', data: { datasets: [{ label: 'Internet milestones',
      data: TIMELINE_EVENTS.map(function (e) { return { x: e.year, y: 1, event: e.event }; }), showLine: true, tension: 0,
      borderColor: 'rgba(126,167,255,0.55)', borderWidth: 2, pointBackgroundColor: TIMELINE,
      pointBorderColor: INK, pointBorderWidth: 2, pointRadius: 7, pointHoverRadius: 11, pointHoverBackgroundColor: BARS_HOVER }] },
      options: { responsive: true, maintainAspectRatio: false, animation: false,
        plugins: { legend: { display: false },
          tooltip: { displayColors: false, padding: 12, titleFont: { weight: 'bold' },
            callbacks: { title: function (i) { return i.length ? String(i[0].parsed.x) : ''; },
              label: function (ctx) { return wrapText(ctx.raw.event, 64); } } },
          datalabels: { formatter: function (v) { return String(v.x); }, anchor: 'center',
            align: function (ctx) { return ctx.dataIndex % 2 === 0 ? 'top' : 'bottom'; }, offset: 10,
            color: TIMELINE, font: { size: 10, weight: '600' } } },
        scales: { x: { type: 'linear', min: 1968, max: 2006, title: { display: true, text: 'Year', color: MUTED },
            grid: { color: GRID }, ticks: { stepSize: 4, precision: 0, color: MUTED } },
          y: { min: 0, max: 2, border: { display: false }, grid: { color: GRID }, ticks: { display: false }, title: { display: false } } } } };
  }

  function buildTaxonomy() {
    var nodes = [TAXONOMY.root].concat(TAXONOMY.branches.map(function (b) { return { x: b.x, y: b.y, label: b.label }; }));
    var branches = TAXONOMY.branches;
    branches.forEach(function (b) {
      b.children.forEach(function (c) { nodes.push({ x: c.x, y: c.y, label: c.label }); });
    });
    var edges = branches.map(function (b) { return [{ x: TAXONOMY.root.x, y: TAXONOMY.root.y }, { x: b.x, y: b.y }]; });
    branches.forEach(function (b) {
      b.children.forEach(function (c) { edges.push([{ x: b.x, y: b.y }, { x: c.x, y: c.y }]); });
    });
    var edgeSets = edges.map(function (e) { return { label: '', data: e, showLine: true, tension: 0,
      borderColor: 'rgba(126,167,255,0.45)', borderWidth: 2, pointRadius: 0, pointHoverRadius: 0, fill: false,
      datalabels: { display: false } }; });
    return { type: 'scatter', data: { datasets: edgeSets.concat([{ label: 'Cybercrime categories', data: nodes,
      pointBackgroundColor: TIMELINE, pointBorderColor: INK, pointBorderWidth: 2, pointRadius: 7,
      pointHoverRadius: 10, pointHoverBackgroundColor: BARS_HOVER }]) },
      options: Object.assign(diagramBase(), { plugins: Object.assign(diagramBase().plugins, {
        tooltip: Object.assign(diagramBase().plugins.tooltip, {
          callbacks: { title: function (i) { return i.length ? i[0].raw.label : ''; }, label: function () { return ''; } } }),
        datalabels: { formatter: function (v) { return v.label || ''; }, anchor: 'center', align: 'end', offset: 8,
          color: INK, font: { size: 10.5, weight: '500' } } }),
        scales: Object.assign(diagramBase().scales, { x: Object.assign(diagramBase().scales.x, { min: -0.6, max: 2.7 }),
          y: Object.assign(diagramBase().scales.y, { min: -3.6, max: 3.6 }) }) }) };
  }

  function buildRoutine() {
    var off = ROUTINE[0], tar = ROUTINE[1], gua = ROUTINE[2], crime = ROUTINE[3];
    var edges = [[off, crime], [tar, crime], [gua, crime]].map(function (e) {
      return { label: '', data: [{ x: e[0].x, y: e[0].y }, { x: e[1].x, y: e[1].y }], showLine: true, tension: 0,
        borderColor: 'rgba(126,167,255,0.5)', borderWidth: 2, pointRadius: 0, pointHoverRadius: 0, fill: false,
        datalabels: { display: false } };
    });
    return { type: 'scatter', data: { datasets: edges.concat([{ label: 'Routine activity theory',
      data: ROUTINE.map(function (n) { return { x: n.x, y: n.y, label: n.label, role: n.role }; }),
      pointBackgroundColor: function (ctx) { return ctx.dataIndex === 3 ? BARS_HOVER : TIMELINE; },
      pointBorderColor: INK, pointBorderWidth: 2, pointRadius: 9, pointHoverRadius: 13 }]) },
      options: Object.assign(diagramBase(), { plugins: Object.assign(diagramBase().plugins, {
        tooltip: Object.assign(diagramBase().plugins.tooltip, {
          callbacks: { title: function (i) { return i.length ? i[0].raw.label : ''; },
            label: function (ctx) { return ctx.raw.role; } } }),
        datalabels: { formatter: function (v) { return v.label || ''; }, anchor: 'center',
          align: function (ctx) { return ctx.dataIndex === 3 ? 'center' : 'end'; }, offset: 8,
          color: INK, font: { size: 11, weight: '600' } } }),
        scales: Object.assign(diagramBase().scales, { x: Object.assign(diagramBase().scales.x, { min: -2.3, max: 2.3 }),
          y: Object.assign(diagramBase().scales.y, { min: -1.8, max: 2.2 }) }) }) };
  }

  function buildGrowth() {
    return { type: 'bar', data: { labels: GROWTH.map(function (d) { return String(d.year); }),
      datasets: [{ label: 'Internet users (billions)', data: GROWTH.map(function (d) { return d.users; }),
        backgroundColor: 'rgba(44,107,255,0.85)', hoverBackgroundColor: BARS_HOVER, borderRadius: 8, maxBarThickness: 90 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false },
        tooltip: { displayColors: false, callbacks: { label: function (ctx) { return ctx.parsed.y + ' billion users'; } } },
        datalabels: { formatter: function (v) { return v + 'bn'; }, anchor: 'end', align: 'end', offset: 4,
          color: BARS, font: { size: 13, weight: 'bold' } } },
        scales: { x: { title: { display: true, text: 'Year', color: MUTED }, grid: { display: false }, ticks: { color: MUTED } },
          y: { beginAtZero: true, max: 6, title: { display: true, text: 'People online (billions)', color: MUTED },
            grid: { color: GRID }, ticks: { stepSize: 1, color: MUTED } } } } };
  }

  function buildCountry() {
    return { type: 'bar', data: { labels: COUNTRIES.map(function (c) { return c[0]; }),
      datasets: [{ label: 'Share of internet users', data: COUNTRIES.map(function (c) { return c[1]; }),
        backgroundColor: 'rgba(44,107,255,0.85)', hoverBackgroundColor: BARS_HOVER, borderRadius: 6, maxBarThickness: 42 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false },
        tooltip: { displayColors: false, callbacks: { label: function (ctx) { return ctx.label + ': ' + ctx.parsed.y + '%'; } } },
        datalabels: { formatter: function (v) { return v + '%'; }, anchor: 'end', align: 'end', offset: 2,
          color: BARS, font: { size: 11, weight: 'bold' } } },
        scales: { x: { title: { display: true, text: 'Country', color: MUTED }, grid: { display: false },
            ticks: { maxRotation: 60, minRotation: 45, font: { size: 10 }, color: MUTED } },
          y: { min: 0, max: 25, title: { display: true, text: 'Share of internet users (%)', color: MUTED },
            grid: { color: GRID }, ticks: { stepSize: 5, callback: function (v) { return v + '%'; }, color: MUTED } } } } };
  }

  var BUILD = { journey: buildJourney, timeline: buildTimeline, taxonomy: buildTaxonomy,
                routine: buildRoutine, growth: buildGrowth, country: buildCountry };

  function init() {
    var canvases = document.querySelectorAll('canvas[data-chart]');
    Array.prototype.forEach.call(canvases, function (cv) {
      var type = cv.getAttribute('data-chart');
      if (window.Chart && cv.getContext && !cv._rh) {
        try {
          cv._rh = new Chart(cv, BUILD[type]());
          var parent = cv.closest('.figure');
          if (parent) { cv.style.width = '100%'; cv.style.height = '100%'; }
        } catch (e) {
          console.error('chart init failed [' + type + ']', e && e.message, e && e.stack);
        }
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
