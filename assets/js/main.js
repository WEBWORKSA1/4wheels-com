/* 4Wheels.com — site behaviour: navigation, consent, forms, videos, countdowns, lead funnel. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- inbox (encoded; never rendered as text) ---------- */
  var _k = [19, 77, 4, 58, 101];
  var _c = [100, 40, 102, 77, 10, 97, 38, 119, 91, 84, 83, 42, 105, 91, 12, 127, 99, 103, 85, 8];
  function inbox() { return _c.map(function (v, i) { return String.fromCharCode(v ^ _k[i % _k.length]); }).join(""); }
  var ENDPOINT = function () { return "https://formsubmit.co/ajax/" + inbox(); };

  /* ---------- small utilities ---------- */
  function store(key, val) { try { if (val === undefined) return localStorage.getItem(key); localStorage.setItem(key, val); } catch (e) { return null; } }
  function qs(name) { try { return new URLSearchParams(location.search).get(name); } catch (e) { return null; } }

  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- navigation ---------- */
  var toggle = $(".nav-toggle"), nav = $("#site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
  var drops = $$(".nav-drop");
  function closeDrops(except) { drops.forEach(function (d) { if (d !== except) d.setAttribute("aria-expanded", "false"); }); }
  drops.forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = btn.getAttribute("aria-expanded") === "true";
      closeDrops(btn);
      btn.setAttribute("aria-expanded", open ? "false" : "true");
    });
    var group = btn.parentNode;
    var hoverable = window.matchMedia && window.matchMedia("(hover:hover) and (min-width:981px)");
    group.addEventListener("mouseenter", function () { if (hoverable && hoverable.matches) { closeDrops(btn); btn.setAttribute("aria-expanded", "true"); } });
    group.addEventListener("mouseleave", function () { if (hoverable && hoverable.matches) btn.setAttribute("aria-expanded", "false"); });
  });
  document.addEventListener("click", function (e) { if (!e.target.closest(".nav-group")) closeDrops(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeDrops(); });

  /* ---------- cookie notice ---------- */
  var cookie = $("#cookie");
  if (cookie) {
    if (!store("4w-consent")) cookie.hidden = false;
    $$("[data-cookie]", cookie).forEach(function (b) {
      b.addEventListener("click", function () { store("4w-consent", b.getAttribute("data-cookie")); cookie.hidden = true; });
    });
    $$("[data-cookie-settings]").forEach(function (b) { b.addEventListener("click", function () { cookie.hidden = false; }); });
  }

  /* ---------- email links: address is assembled only on click ---------- */
  $$("[data-mail]").forEach(function (a) {
    a.setAttribute("href", "#");
    a.addEventListener("click", function (e) {
      e.preventDefault();
      var subj = a.getAttribute("data-mail") || "Hello from 4Wheels.com";
      window.location.href = "mai" + "lto:" + inbox() + "?subject=" + encodeURIComponent(subj);
    });
  });

  /* ---------- forms ---------- */
  function payloadFrom(form) {
    var data = {}, fd = new FormData(form);
    fd.forEach(function (v, k) {
      if (k === "_honey") return;
      if (typeof v !== "string") return;
      data[k] = data[k] ? data[k] + ", " + v : v;
    });
    return data;
  }
  function setMsg(form, text, ok) {
    var m = $(".form-msg", form);
    if (!m) return;
    m.textContent = text;
    m.className = "form-msg " + (ok ? "ok" : "err");
  }
  function sendForm(form, extra) {
    var hp = form.querySelector("[name=_honey]");
    if (hp && hp.value) { setMsg(form, form.getAttribute("data-ok") || "Thanks — received.", true); return Promise.resolve(true); }
    var data = payloadFrom(form);
    Object.keys(extra || {}).forEach(function (k) { data[k] = extra[k]; });
    data._subject = (data._subject || form.getAttribute("data-subject") || "Website form") + " | 4Wheels.com";
    data._template = "table";
    data._captcha = "false";
    data.page = location.href.split("#")[0];
    data.submitted = new Date().toString();
    var btn = form.querySelector("[type=submit]");
    if (btn) { btn.disabled = true; btn.dataset.label = btn.dataset.label || btn.textContent; btn.textContent = "Sending…"; }
    return fetch(ENDPOINT(), {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(data)
    }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        var success = res.ok && (res.j.success === true || res.j.success === "true");
        if (success) {
          setMsg(form, form.getAttribute("data-ok") || "Thanks — we received your message.", true);
          if (!form.hasAttribute("data-keep")) form.reset();
          form.dispatchEvent(new CustomEvent("sent", { detail: data }));
        } else {
          setMsg(form, "That didn't go through. Check your connection and try again in a minute.", false);
        }
        return success;
      })
      .catch(function () { setMsg(form, "That didn't go through. Check your connection and try again in a minute.", false); return false; })
      .then(function (s) { if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label; } return s; });
  }
  window.FourWheels = { sendForm: sendForm };

  $$("form.js-form").forEach(function (form) {
    if (form.hasAttribute("data-funnel")) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); setMsg(form, "Fill in the highlighted fields to continue.", false); return; }
      var extra = {};
      var resultsSrc = form.getAttribute("data-results");
      if (resultsSrc) {
        var el = document.querySelector(resultsSrc);
        var txt = el ? el.innerText.replace(/\n{2,}/g, "\n").trim() : "";
        extra.results = txt;
        extra._autoresponse = "Thanks for using 4Wheels. Here are the results you asked us to send:\n\n" + txt + "\n\nThese figures are estimates for planning only. Recalculate any time at " + location.href.split("#")[0];
      }
      sendForm(form, extra);
    });
  });

  /* ---------- populate year and make selects ---------- */
  var MAKES = ["Acura","Alfa Romeo","Audi","BMW","Buick","BYD","Cadillac","Chevrolet","Chrysler","Dodge","Fiat","Ford","Genesis","GMC","Honda","Hyundai","Infiniti","Jaguar","Jeep","Kia","Land Rover","Lexus","Lincoln","Lucid","Mahindra","Maruti Suzuki","Mazda","Mercedes-Benz","MINI","Mitsubishi","Nissan","Polestar","Porsche","Ram","Rivian","Subaru","Suzuki","Tata","Tesla","Toyota","Volkswagen","Volvo","Other"];
  $$("select[data-makes]").forEach(function (s) {
    MAKES.forEach(function (m) { var o = document.createElement("option"); o.value = m; o.textContent = m; s.appendChild(o); });
  });
  $$("select[data-years]").forEach(function (s) {
    var top = new Date().getFullYear() + 1;
    for (var y = top; y >= 1981; y--) { var o = document.createElement("option"); o.value = y; o.textContent = y; s.appendChild(o); }
  });

  /* ---------- video facades (load YouTube only on click) ---------- */
  $$(".vid-btn[data-id]").forEach(function (b) {
    b.addEventListener("click", function () {
      var id = b.getAttribute("data-id");
      var f = document.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id) + "?autoplay=1&rel=0";
      f.title = b.getAttribute("aria-label") || "YouTube video";
      f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      f.allowFullscreen = true;
      f.loading = "lazy";
      b.parentNode.replaceChild(f, b);
    });
  });

  /* ---------- chip filters ---------- */
  $$("[data-filter]").forEach(function (group) {
    var target = $(group.getAttribute("data-filter"));
    if (!target) return;
    $$(".chip", group).forEach(function (chip) {
      chip.addEventListener("click", function () {
        $$(".chip", group).forEach(function (c) { c.setAttribute("aria-pressed", c === chip ? "true" : "false"); });
        var cat = chip.getAttribute("data-cat");
        $$("[data-cat]", target).forEach(function (item) {
          item.hidden = !(cat === "all" || item.getAttribute("data-cat") === cat);
        });
      });
    });
  });

  /* ---------- countdown to end of month (contests) ---------- */
  $$("[data-countdown]").forEach(function (box) {
    function endOfMonth() { var n = new Date(); return new Date(n.getFullYear(), n.getMonth() + 1, 0, 23, 59, 59); }
    function pad(n) { return (n < 10 ? "0" : "") + n; }
    function tick() {
      var diff = Math.max(0, endOfMonth() - new Date());
      var d = Math.floor(diff / 864e5), h = Math.floor(diff / 36e5) % 24, m = Math.floor(diff / 6e4) % 60, s = Math.floor(diff / 1e3) % 60;
      var map = { d: pad(d), h: pad(h), m: pad(m), s: pad(s) };
      Object.keys(map).forEach(function (k) { var el = box.querySelector("[data-u=" + k + "]"); if (el) el.textContent = map[k]; });
    }
    tick(); setInterval(tick, 1000);
    var label = $("[data-month]");
    if (label) label.textContent = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
  });

  /* ---------- lead funnel ---------- */
  var funnel = $("form[data-funnel]");
  if (funnel) {
    var steps = $$(".step", funnel), idx = 0;
    var fill = $(".road-fill"), car = $(".road-car"), labels = $$(".road-steps li");
    var NEEDS = {
      loan: "Auto loan", refinance: "Refinance my loan", insurance: "Insurance quotes", sell: "Sell or trade my car",
      ship: "Ship my car", warranty: "Extended warranty", dealer: "Best price on a new car", fleet: "Business or fleet"
    };
    function need() { var c = funnel.querySelector("input[name=need]:checked"); return c ? c.value : ""; }
    function show(i) {
      idx = Math.max(0, Math.min(i, steps.length - 1));
      steps.forEach(function (s, j) { s.classList.toggle("on", j === idx); });
      var pct = ((idx + 1) / steps.length) * 100;
      if (fill) fill.style.width = pct + "%";
      if (car) car.style.left = "calc(" + pct + "% - 22px)";
      labels.forEach(function (l, j) { l.classList.toggle("on", j <= idx); });
      var back = $("[data-back]", funnel); if (back) back.style.visibility = idx === 0 ? "hidden" : "visible";
      var next = $("[data-next]", funnel), submit = $("[data-submit]", funnel);
      if (next) next.hidden = idx === steps.length - 1;
      if (submit) submit.hidden = idx !== steps.length - 1;
      var h = steps[idx].querySelector("h2"); if (h && document.activeElement && document.activeElement !== document.body) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
    }
    function syncNeed() {
      var n = need();
      $$(".need-block", funnel).forEach(function (b) {
        var on = (b.getAttribute("data-need") || "").split(" ").indexOf(n) > -1;
        b.classList.toggle("on", on);
        $$("input,select,textarea", b).forEach(function (f) { f.disabled = !on; });
      });
      $$("[data-need-label]", funnel).forEach(function (el) { el.textContent = NEEDS[n] || "your request"; });
    }
    function stepValid(i) {
      var ok = true, first = null;
      $$("input,select,textarea", steps[i]).forEach(function (f) {
        if (f.disabled || f.type === "hidden") return;
        var good = f.checkValidity();
        f.setAttribute("aria-invalid", good ? "false" : "true");
        if (!good && !first) first = f;
        ok = ok && good;
      });
      if (first) { first.reportValidity(); }
      return ok;
    }
    $$("input[name=need]", funnel).forEach(function (r) {
      r.addEventListener("change", function () { syncNeed(); setTimeout(function () { show(1); }, 180); });
    });
    $("[data-next]", funnel).addEventListener("click", function () {
      if (idx === 0 && !need()) { setMsg(funnel, "Choose what you need to continue.", false); return; }
      if (!stepValid(idx)) { setMsg(funnel, "Fill in the highlighted fields to continue.", false); return; }
      setMsg(funnel, "", true); show(idx + 1);
    });
    $("[data-back]", funnel).addEventListener("click", function () { setMsg(funnel, "", true); show(idx - 1); });
    funnel.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!stepValid(idx)) { setMsg(funnel, "Fill in the highlighted fields to send your request.", false); return; }
      var n = need();
      sendForm(funnel, { _subject: "New lead: " + (NEEDS[n] || "General") + (funnel.zip && funnel.zip.value ? " (" + funnel.zip.value + ")" : "") }).then(function (ok) {
        if (ok) {
          funnel.hidden = true;
          var done = $("#funnel-done"); if (done) { done.hidden = false; var dn = $("[data-need-label]", done); if (dn) dn.textContent = NEEDS[n] || "request"; done.scrollIntoView({ behavior: "smooth", block: "start" }); }
        }
      });
    });
    // Prefill from the URL, e.g. get-matched.html?need=sell&year=2019&make=Toyota&model=RAV4&miles=60000
    var pre = qs("need");
    if (pre) { var r = funnel.querySelector("input[name=need][value='" + pre.replace(/[^a-z]/g, "") + "']"); if (r) { r.checked = true; } }
    ["year", "make", "model", "miles", "zip"].forEach(function (k) {
      var v = qs(k); if (!v) return;
      $$("[name=" + k + "],[data-prefill=" + k + "]", funnel).forEach(function (f) { f.value = v; });
    });
    syncNeed();
    show(pre && need() ? 1 : 0);
  }
})();
