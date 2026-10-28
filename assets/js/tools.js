/* 4Wheels.com — calculators and lookups. Every tool is a [data-tool] block; results recompute on input. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- currency & number formatting ---------- */
  var CUR_KEY = "4w-currency";
  function getCur() { try { return localStorage.getItem(CUR_KEY) || "USD"; } catch (e) { return "USD"; } }
  function setCur(c) { try { localStorage.setItem(CUR_KEY, c); } catch (e) {} }
  function money(v, dp) {
    if (!isFinite(v)) return "—";
    var c = getCur();
    try { return new Intl.NumberFormat(c === "INR" ? "en-IN" : "en-US", { style: "currency", currency: c, maximumFractionDigits: dp == null ? 0 : dp, minimumFractionDigits: dp == null ? 0 : dp }).format(v); }
    catch (e) { return "$" + Math.round(v).toLocaleString(); }
  }
  function n(v, dp) { if (!isFinite(v)) return "—"; return Number(v).toLocaleString("en-US", { maximumFractionDigits: dp == null ? 0 : dp, minimumFractionDigits: dp == null ? 0 : dp }); }
  function val(root, name, dflt) {
    var el = root.querySelector("[name=" + name + "]");
    if (!el) return dflt == null ? 0 : dflt;
    if (el.type === "checkbox") return el.checked;
    var v = parseFloat(String(el.value).replace(/[^0-9.\-]/g, ""));
    return isFinite(v) ? v : (dflt == null ? 0 : dflt);
  }
  function str(root, name) { var el = root.querySelector("[name=" + name + "]"); return el ? el.value : ""; }
  function out(root, key, text) { $$("[data-o=" + key + "]", root).forEach(function (el) { el.textContent = text; }); }
  function html(root, key, h) { $$("[data-o=" + key + "]", root).forEach(function (el) { el.innerHTML = h; }); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  /* ---------- finance maths ---------- */
  function pmt(P, apr, months) {
    if (months <= 0) return 0;
    var r = apr / 100 / 12;
    if (r === 0) return P / months;
    return P * r / (1 - Math.pow(1 + r, -months));
  }
  function pv(payment, apr, months) {
    var r = apr / 100 / 12;
    if (r === 0) return payment * months;
    return payment * (1 - Math.pow(1 + r, -months)) / r;
  }
  function balanceAfter(P, apr, months, k) {
    var r = apr / 100 / 12, p = pmt(P, apr, months);
    if (k >= months) return 0;
    if (r === 0) return P - p * k;
    return P * Math.pow(1 + r, k) - p * (Math.pow(1 + r, k) - 1) / r;
  }
  function splitBar(root, key, parts) {
    var total = parts.reduce(function (a, p) { return a + Math.max(0, p.v); }, 0) || 1;
    html(root, key, parts.map(function (p) { return '<span style="width:' + (Math.max(0, p.v) / total * 100).toFixed(2) + '%;background:' + p.c + '" title="' + esc(p.l) + '"></span>'; }).join(""));
  }
  var C = { a: "#F5B700", b: "#4FB286", c: "#8FB8DE", d: "#E07A5F", e: "#C3B1E1", f: "#9AA7A3", g: "#F2CC8F" };

  /* ---------- tool implementations ---------- */
  var TOOLS = {};

  TOOLS.payment = function (root) {
    var price = val(root, "price"), down = val(root, "down"), trade = val(root, "trade"), owed = val(root, "owed"),
      tax = val(root, "tax"), fees = val(root, "fees"), apr = val(root, "apr"), term = val(root, "term", 60);
    var taxAmt = Math.max(0, price - trade) * tax / 100;
    var financed = Math.max(0, price + fees + taxAmt - down - trade + owed);
    var m = pmt(financed, apr, term), total = m * term, interest = total - financed;
    out(root, "monthly", money(m, 2));
    out(root, "sub", "for " + term + " months at " + n(apr, 2) + "% APR");
    out(root, "financed", money(financed));
    out(root, "interest", money(interest));
    out(root, "total", money(total));
    out(root, "taxamt", money(taxAmt));
    out(root, "otd", money(price + taxAmt + fees));
    splitBar(root, "bar", [{ v: financed, c: C.b, l: "Principal" }, { v: interest, c: C.a, l: "Interest" }]);
    var rows = "", bal = financed, r = apr / 100 / 12;
    for (var y = 1; y <= Math.ceil(term / 12); y++) {
      var pi = 0, ii = 0;
      for (var k = 0; k < 12 && (y - 1) * 12 + k < term; k++) { var it = bal * r; var pr = m - it; ii += it; pi += pr; bal = Math.max(0, bal - pr); }
      rows += "<tr><td>Year " + y + '</td><td class="n">' + money(pi) + '</td><td class="n">' + money(ii) + '</td><td class="n">' + money(bal) + "</td></tr>";
    }
    html(root, "amort", rows);
    var longer = term < 84 ? pmt(financed, apr, term + 12) * (term + 12) - financed : null;
    out(root, "tip", longer !== null ? "Stretching to " + (term + 12) + " months would lower the payment to " + money(pmt(financed, apr, term + 12), 2) + " but raise total interest to " + money(longer) + "." : "84 months is the longest common term; interest costs climb fast at this length.");
  };

  TOOLS.afford = function (root) {
    var income = val(root, "income"), flex = str(root, "mode") === "flex", ins = val(root, "insurance"), fuel = val(root, "fuel"),
      apr = val(root, "apr"), downPct = val(root, "downpct", 20);
    var pct = flex ? 0.15 : 0.10, term = flex ? 60 : 48;
    var budget = income / 12 * pct, maxPay = Math.max(0, budget - ins - fuel);
    var loan = pv(maxPay, apr, term), price = downPct >= 100 ? 0 : loan / (1 - downPct / 100), down = price * downPct / 100;
    out(root, "price", money(price));
    out(root, "sub", (flex ? "Flexible" : "Classic 20/4/10") + " guideline, " + term + "-month loan at " + n(apr, 2) + "% APR");
    out(root, "budget", money(budget, 0) + " / mo");
    out(root, "maxpay", money(maxPay, 0) + " / mo");
    out(root, "loan", money(loan));
    out(root, "down", money(down));
    out(root, "term", term + " months");
    out(root, "verdict", maxPay <= 0 ? "Insurance and fuel already use up the whole budget at this income. Lower running costs or raise the percentage." : "Shop for an out-the-door price at or under " + money(price) + " and put about " + money(down) + " down.");
  };

  TOOLS.lease = function (root) {
    var months = val(root, "months", 36), due = val(root, "due"), monthly = val(root, "monthly"), dispo = val(root, "dispo");
    var price = val(root, "price"), down = val(root, "down"), apr = val(root, "apr"), term = val(root, "term", 60), resalePct = val(root, "resale", 55);
    var leaseCost = due + monthly * months + dispo;
    var P = Math.max(0, price - down), p = pmt(P, apr, term), paid = p * Math.min(months, term), bal = balanceAfter(P, apr, term, months), resale = price * resalePct / 100;
    var buyCost = down + paid + bal - resale;
    var diff = leaseCost - buyCost;
    out(root, "leasecost", money(leaseCost));
    out(root, "buycost", money(buyCost));
    out(root, "buypay", money(p, 2) + " / mo");
    out(root, "balance", money(bal));
    out(root, "resaleval", money(resale));
    out(root, "headline", money(Math.abs(diff)));
    out(root, "sub", diff > 0 ? "cheaper to buy over " + months + " months" : diff < 0 ? "cheaper to lease over " + months + " months" : "no difference over " + months + " months");
    out(root, "verdict", diff > 0 ? "Buying wins by " + money(diff) + " — and you keep a car worth about " + money(resale) + " with " + money(bal) + " left on the loan." : "Leasing wins by " + money(-diff) + " over this window, assuming you stay within the mileage allowance.");
    splitBar(root, "bar", [{ v: leaseCost, c: C.c, l: "Lease" }, { v: Math.max(0, buyCost), c: C.b, l: "Buy" }]);
  };

  TOOLS.tco = function (root) {
    var price = val(root, "price"), years = val(root, "years", 5), rate = val(root, "deprate", 15) / 100, miles = val(root, "miles"), mpg = val(root, "mpg", 30),
      fuelP = val(root, "fuelprice"), ins = val(root, "insurance"), maint = val(root, "maint"), fees = val(root, "fees"), apr = val(root, "apr"), down = val(root, "down"), term = val(root, "term", 60);
    var endVal = price * Math.pow(1 - rate, years), dep = price - endVal;
    var fuel = mpg > 0 ? miles / mpg * fuelP * years : 0, insT = ins * years, feesT = fees * years, maintT = 0;
    for (var y = 0; y < years; y++) maintT += maint * Math.pow(1.1, y);
    var P = Math.max(0, price - down), months = Math.min(term, years * 12), p = pmt(P, apr, term);
    var interest = p * months - (P - balanceAfter(P, apr, term, months));
    var total = dep + fuel + insT + maintT + feesT + Math.max(0, interest);
    out(root, "total", money(total));
    out(root, "sub", "over " + years + " years and " + n(miles * years) + " miles");
    out(root, "peryear", money(total / years));
    out(root, "permonth", money(total / years / 12));
    out(root, "permile", money(miles > 0 ? total / (miles * years) : NaN, 2));
    out(root, "dep", money(dep)); out(root, "fuel", money(fuel)); out(root, "ins", money(insT)); out(root, "maint", money(maintT)); out(root, "fees", money(feesT)); out(root, "interest", money(Math.max(0, interest)));
    out(root, "endval", money(endVal));
    splitBar(root, "bar", [{ v: dep, c: C.a, l: "Depreciation" }, { v: fuel, c: C.d, l: "Fuel" }, { v: insT, c: C.c, l: "Insurance" }, { v: maintT, c: C.b, l: "Maintenance" }, { v: feesT, c: C.e, l: "Fees" }, { v: interest, c: C.g, l: "Interest" }]);
  };

  TOOLS.fuel = function (root) {
    var dist = val(root, "distance"), unit = str(root, "unit") || "mi", eff = val(root, "eff"), effUnit = str(root, "effunit") || "mpg", price = val(root, "price"),
      round = val(root, "round"), people = Math.max(1, val(root, "people", 1));
    if (round) dist *= 2;
    var cost, used, usedUnit;
    if (effUnit === "mpg") { var miles = unit === "km" ? dist * 0.621371 : dist; used = eff > 0 ? miles / eff : 0; usedUnit = "gallons"; }
    else { var km = unit === "mi" ? dist * 1.609344 : dist; used = km * eff / 100; usedUnit = "litres"; }
    cost = used * price;
    out(root, "cost", money(cost, 2));
    out(root, "sub", n(dist, 0) + " " + unit + (round ? " round trip" : " one way"));
    out(root, "used", n(used, 1) + " " + usedUnit);
    out(root, "per", money(cost / people, 2));
    out(root, "perdist", money(dist > 0 ? cost / dist : NaN, 3) + " per " + unit);
    $$("[data-price-unit]", root).forEach(function (el) { el.textContent = effUnit === "mpg" ? "per gallon" : "per litre"; });
  };

  TOOLS.ev = function (root) {
    var miles = val(root, "miles"), mpg = val(root, "mpg", 30), gas = val(root, "gasprice"), kwh = val(root, "kwh", 30), home = val(root, "home"), pub = val(root, "public"),
      pubPct = Math.min(100, Math.max(0, val(root, "pubpct", 20))), maintSave = val(root, "maint"), premium = val(root, "premium");
    var gasCost = mpg > 0 ? miles / mpg * gas : 0;
    var blended = (100 - pubPct) / 100 * home + pubPct / 100 * pub;
    var evCost = miles * kwh / 100 * blended;
    var save = gasCost - evCost + maintSave;
    var payback = save > 0 ? premium / save : Infinity;
    var co2 = mpg > 0 ? miles / mpg * 8.887 / 1000 : 0;
    out(root, "save", money(save));
    out(root, "sub", "estimated yearly savings driving electric");
    out(root, "gascost", money(gasCost)); out(root, "evcost", money(evCost)); out(root, "blended", money(blended, 3) + " per kWh");
    out(root, "five", money(save * 5));
    out(root, "payback", premium <= 0 ? "Immediate" : isFinite(payback) ? n(payback, 1) + " years" : "Never at these numbers");
    out(root, "co2", n(co2, 1) + " tonnes CO₂ a year");
    splitBar(root, "bar", [{ v: gasCost, c: C.d, l: "Gas" }, { v: evCost, c: C.b, l: "Electricity" }]);
  };

  TOOLS.refi = function (root) {
    var bal = val(root, "balance"), cur = val(root, "curapr"), left = val(root, "left", 48), nw = val(root, "newapr"), term = val(root, "newterm", 48), fees = val(root, "fees"), roll = val(root, "roll");
    var curP = pmt(bal, cur, left), newPrin = bal + (roll ? fees : 0), newP = pmt(newPrin, nw, term);
    var curTotal = curP * left, newTotal = newP * term + (roll ? 0 : fees);
    var net = curTotal - newTotal;
    out(root, "save", money(net));
    out(root, "sub", net >= 0 ? "total saved over the life of the loan" : "extra cost over the life of the loan");
    out(root, "curpay", money(curP, 2)); out(root, "newpay", money(newP, 2));
    out(root, "change", (newP <= curP ? "−" : "+") + money(Math.abs(curP - newP), 2) + " / mo");
    out(root, "curtotal", money(curTotal)); out(root, "newtotal", money(newTotal));
    var msg;
    if (net > 0 && term <= left) msg = "Refinancing pays off: lower rate, no longer term.";
    else if (net > 0) msg = "You save overall, but the term is longer — check the total, not just the payment.";
    else if (newP < curP) msg = "The payment drops, but only because the loan is longer. You'd pay " + money(-net) + " more in total.";
    else msg = "At these numbers, refinancing costs more than keeping your current loan.";
    out(root, "verdict", msg);
  };

  TOOLS.depr = function (root) {
    var price = val(root, "price"), type = str(root, "type") || "mainstream", years = Math.max(1, Math.min(15, val(root, "years", 5))), miles = val(root, "miles", 12000), cond = str(root, "condition") || "good";
    var R = { mainstream: [0.18, 0.12], luxury: [0.24, 0.15], truck: [0.15, 0.10], ev: [0.25, 0.14] }[type] || [0.18, 0.12];
    var extra = Math.max(0, (miles - 12000) / 5000) * 0.015;
    var adj = { excellent: 1.05, good: 1, fair: 0.9 }[cond] || 1;
    var v = price, rows = "";
    for (var y = 1; y <= years; y++) {
      var rate = Math.min(0.6, (y === 1 ? R[0] : R[1]) + extra);
      v = v * (1 - rate);
      rows += "<tr><td>Year " + y + '</td><td class="n">' + money(v * adj) + '</td><td class="n">' + n((1 - v * adj / price) * 100, 0) + "%</td></tr>";
    }
    var fin = v * adj;
    out(root, "value", money(fin));
    out(root, "sub", "estimated value after " + years + (years === 1 ? " year" : " years"));
    out(root, "loss", money(price - fin));
    out(root, "kept", n(price > 0 ? fin / price * 100 : 0, 0) + "% of the original price");
    out(root, "peryear", money((price - fin) / years));
    html(root, "table", rows);
  };

  function parseTire(s) {
    s = String(s || "").toUpperCase().replace(/\s+/g, "");
    var m = s.match(/^(?:P|LT|ST|T)?(\d{3})\/(\d{2,3})(?:Z?R|D|B|-)?(\d{2}(?:\.\d)?)/);
    if (m) {
      var w = +m[1], a = +m[2], rim = +m[3], side = w * a / 100, dia = 2 * side + rim * 25.4;
      return { width: w, side: side, dia: dia, rim: rim };
    }
    m = s.match(/^(\d{2}(?:\.\d+)?)X(\d{1,2}(?:\.\d+)?)(?:R|-)?(\d{2}(?:\.\d)?)/);
    if (m) {
      var D = +m[1] * 25.4, W = +m[2] * 25.4, r = +m[3];
      return { width: W, side: (D - r * 25.4) / 2, dia: D, rim: r };
    }
    return null;
  }
  TOOLS.tire = function (root) {
    var a = parseTire(str(root, "size1")), b = parseTire(str(root, "size2")), speed = val(root, "speed", 60);
    $$("[name=size1],[name=size2]", root).forEach(function (f) { f.setAttribute("aria-invalid", parseTire(f.value) ? "false" : "true"); });
    if (!a || !b) { out(root, "diff", "—"); out(root, "sub", "Enter two sizes like 265/70R17 or 35x12.50R17"); html(root, "table", ""); return; }
    function row(label, x, y, f, u) { return "<tr><td>" + label + '</td><td class="n">' + f(x) + u + '</td><td class="n">' + f(y) + u + '</td><td class="n">' + (y - x >= 0 ? "+" : "") + f(y - x) + u + "</td></tr>"; }
    var mm = function (v) { return n(v, 1); }, inch = function (v) { return n(v / 25.4, 2); };
    var ca = Math.PI * a.dia, cb = Math.PI * b.dia, ra = 1609344 / ca, rb = 1609344 / cb;
    var pct = (b.dia - a.dia) / a.dia * 100, actual = speed * b.dia / a.dia;
    var t = row("Overall diameter", a.dia, b.dia, inch, " in") + row("Overall diameter", a.dia, b.dia, mm, " mm") + row("Section width", a.width, b.width, inch, " in") + row("Sidewall height", a.side, b.side, inch, " in") + row("Circumference", ca, cb, inch, " in") + row("Revolutions per mile", ra, rb, function (v) { return n(v, 0); }, "") + row("Rim diameter", a.rim * 25.4, b.rim * 25.4, inch, " in");
    html(root, "table", t);
    out(root, "diff", (pct >= 0 ? "+" : "") + n(pct, 2) + "%");
    out(root, "sub", "change in overall diameter");
    out(root, "speedo", "At an indicated " + n(speed) + ", you'd really be doing " + n(actual, 1) + ".");
    out(root, "verdict", Math.abs(pct) <= 3 ? "Within about ±3% — usually fine without recalibration. Still confirm clearance and load rating." : "More than 3% off — expect speedometer, odometer and possibly ABS/transmission effects. Plan to recalibrate and check clearance.");
  };

  /* VIN */
  var TRANS = { A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9, S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9 };
  var WTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
  function vinCheck(v) {
    var sum = 0;
    for (var i = 0; i < 17; i++) { var ch = v[i], d = /\d/.test(ch) ? +ch : TRANS[ch]; if (d == null) return null; sum += d * WTS[i]; }
    var c = sum % 11; return c === 10 ? "X" : String(c);
  }
  function initVin(root) {
    var input = $("[name=vin]", root), count = $("[data-o=count]", root), form = $("form", root), box = $("[data-o=results]", root), status = $("[data-o=status]", root);
    function clean() { input.value = input.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 17); count.textContent = input.value.length + " of 17 characters"; }
    input.addEventListener("input", clean);
    var pre = new URLSearchParams(location.search).get("vin"); if (pre) { input.value = pre; }
    clean();
    form.addEventListener("submit", function (e) {
      e.preventDefault(); clean();
      var v = input.value;
      if (v.length !== 17) { status.textContent = "A VIN has exactly 17 characters. You've entered " + v.length + "."; return; }
      if (/[IOQ]/.test(v)) { status.textContent = "VINs never use the letters I, O or Q — check for a 1 or 0."; return; }
      var cd = vinCheck(v), checkMsg = cd === v[8] ? "Check digit valid." : "Check digit doesn't match (expected " + cd + "). That's normal for some non-North-American vehicles; otherwise re-check the VIN.";
      status.textContent = "Looking up " + v + "…";
      box.innerHTML = "";
      fetch("https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/" + encodeURIComponent(v) + "?format=json")
        .then(function (r) { return r.json(); })
        .then(function (j) {
          var d = (j.Results || [])[0] || {};
          var F = [["Model year", d.ModelYear], ["Make", d.Make], ["Model", d.Model], ["Trim", [d.Trim, d.Series].filter(Boolean).join(" ")], ["Body", d.BodyClass], ["Vehicle type", d.VehicleType], ["Drive", d.DriveType], ["Engine", [d.DisplacementL ? n(+d.DisplacementL, 1) + " L" : "", d.EngineCylinders ? d.EngineCylinders + "-cyl" : "", d.EngineHP ? d.EngineHP + " hp" : ""].filter(Boolean).join(", ")], ["Fuel", [d.FuelTypePrimary, d.ElectrificationLevel].filter(Boolean).join(" / ")], ["Transmission", d.TransmissionStyle], ["Doors", d.Doors], ["Assembly plant", [d.PlantCity, d.PlantState, d.PlantCountry].filter(Boolean).join(", ")], ["Manufacturer", d.Manufacturer]];
          var rows = F.filter(function (f) { return f[1] && String(f[1]).trim() && f[1] !== "Not Applicable"; }).map(function (f) { return "<li><span>" + esc(f[0]) + "</span><b>" + esc(f[1]) + "</b></li>"; }).join("");
          if (!d.Make) { status.textContent = "No match found for that VIN. " + checkMsg; return; }
          status.textContent = checkMsg;
          box.innerHTML = '<ul class="kv">' + rows + "</ul>" +
            '<a class="btn btn-go" href="recall-check.html?year=' + encodeURIComponent(d.ModelYear || "") + "&make=" + encodeURIComponent(d.Make || "") + "&model=" + encodeURIComponent(d.Model || "") + '">Check recalls for this car</a>' +
            '<p class="calc-note">Thinking of selling it? <a href="../get-matched.html?need=sell&year=' + encodeURIComponent(d.ModelYear || "") + "&make=" + encodeURIComponent(d.Make || "") + "&model=" + encodeURIComponent(d.Model || "") + '">Get offers for this ' + esc(d.Make || "car") + "</a>. Decoded with NHTSA's public vPIC database.</p>";
        })
        .catch(function () {
          status.textContent = "The NHTSA decoder didn't respond from this page. " + checkMsg;
          box.innerHTML = '<a class="btn btn-go" href="https://vpic.nhtsa.dot.gov/decoder/Decoder?VIN=' + encodeURIComponent(v) + '" target="_blank" rel="noopener">Decode on NHTSA\'s site</a>';
        });
    });
  }

  /* Recalls */
  function initRecall(root) {
    var form = $("form", root), status = $("[data-o=status]", root), box = $("[data-o=results]", root), list = $("#model-list");
    var p = new URLSearchParams(location.search);
    ["year", "make", "model"].forEach(function (k) {
      var v = p.get(k), f = form.querySelector("[name=" + k + "]");
      if (!v || !f) return;
      if (f.tagName === "SELECT") {
        var opt = Array.prototype.filter.call(f.options, function (o) { return o.value.toLowerCase() === v.toLowerCase(); })[0];
        if (!opt) { opt = document.createElement("option"); opt.value = v; opt.textContent = v; f.appendChild(opt); }
        f.value = opt.value;
      } else { f.value = v; }
    });
    function suggest() {
      var y = form.year.value, mk = form.make.value.trim();
      if (!y || !mk || !list) return;
      fetch("https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/" + encodeURIComponent(mk) + "/modelyear/" + encodeURIComponent(y) + "?format=json")
        .then(function (r) { return r.json(); })
        .then(function (j) { list.innerHTML = (j.Results || []).map(function (m) { return '<option value="' + esc(m.Model_Name) + '">'; }).join(""); })
        .catch(function () {});
    }
    form.year.addEventListener("change", suggest); form.make.addEventListener("change", suggest);
    function run() {
      var y = form.year.value, mk = form.make.value.trim(), md = form.model.value.trim();
      if (!y || !mk || !md) { status.textContent = "Choose a year, make and model."; return; }
      status.textContent = "Searching NHTSA recall records…"; box.innerHTML = "";
      fetch("https://api.nhtsa.gov/recalls/recallsByVehicle?make=" + encodeURIComponent(mk) + "&model=" + encodeURIComponent(md) + "&modelYear=" + encodeURIComponent(y))
        .then(function (r) { return r.json(); })
        .then(function (j) {
          var res = j.results || j.Results || [];
          if (!res.length) { status.textContent = "No recalls found for a " + y + " " + mk + " " + md + ". Check the spelling of the model, then confirm with a VIN search at nhtsa.gov/recalls."; return; }
          status.textContent = res.length + (res.length === 1 ? " recall campaign" : " recall campaigns") + " found for the " + y + " " + mk + " " + md + ".";
          box.innerHTML = '<ul class="result-list">' + res.map(function (x) {
            return "<li><strong>" + esc(x.Component || "Component") + "</strong><span>Campaign " + esc(x.NHTSACampaignNumber || "") + (x.ReportReceivedDate ? ", reported " + esc(x.ReportReceivedDate) : "") + "</span><details><summary>Details</summary><p>" + esc(x.Summary || "") + "</p>" + (x.Consequence ? "<p><b>Risk:</b> " + esc(x.Consequence) + "</p>" : "") + (x.Remedy ? "<p><b>Remedy:</b> " + esc(x.Remedy) + "</p>" : "") + "</details></li>";
          }).join("") + "</ul>";
        })
        .catch(function () {
          status.textContent = "NHTSA's recall service didn't respond from this page. Open the official results instead:";
          box.innerHTML = '<a class="btn btn-go" href="https://www.nhtsa.gov/recalls" target="_blank" rel="noopener">Search recalls on NHTSA</a>' +
            '<p class="calc-note"><a href="https://api.nhtsa.gov/recalls/recallsByVehicle?make=' + encodeURIComponent(mk) + "&model=" + encodeURIComponent(md) + "&modelYear=" + encodeURIComponent(y) + '" target="_blank" rel="noopener">View the raw NHTSA recall data for this vehicle</a></p>';
        });
    }
    form.addEventListener("submit", function (e) { e.preventDefault(); run(); });
    if (p.get("year") && p.get("make") && p.get("model")) run();
  }

  /* Maintenance planner */
  TOOLS.maint = function (root) {
    var odo = val(root, "odometer"), per = Math.max(1000, val(root, "peryear", 12000)), power = str(root, "power") || "gas", severe = str(root, "conditions") === "severe", oil = val(root, "oil", 7500), age = val(root, "age", 3);
    var f = severe ? 2 / 3 : 1;
    var items = [
      ["Oil and filter change", oil, ["gas", "hybrid", "diesel"]],
      ["Tire rotation", 6000, ["gas", "hybrid", "diesel", "ev"]],
      ["Brake inspection", 12000, ["gas", "hybrid", "diesel", "ev"]],
      ["Cabin air filter", 15000, ["gas", "hybrid", "diesel", "ev"]],
      ["Engine air filter", 20000, ["gas", "hybrid", "diesel"]],
      ["Fuel filter", 30000, ["diesel"]],
      ["Brake fluid flush", 36000, ["gas", "hybrid", "diesel", "ev"]],
      ["Transmission fluid service", 60000, ["gas", "hybrid", "diesel"]],
      ["Coolant replacement", 90000, ["gas", "hybrid", "diesel"]],
      ["Battery/thermal coolant check (per manual)", 50000, ["ev"]],
      ["Spark plugs", 100000, ["gas", "hybrid"]]
    ];
    var rows = [], horizon = odo + per;
    items.forEach(function (it) {
      if (it[2].indexOf(power) < 0) return;
      var iv = Math.round(it[1] * f / 500) * 500;
      var next = Math.ceil((odo + 1) / iv) * iv;
      var months = Math.max(0, Math.round((next - odo) / per * 12));
      rows.push({ name: it[0], at: next, months: months, iv: iv, soon: next <= horizon });
    });
    rows.sort(function (a, b) { return a.at - b.at; });
    var timeItems = [["Wiper blades", "Every 6–12 months"], ["12-volt battery test", age >= 3 ? "Now, then yearly" : "Yearly from year 3"]];
    var due = rows.filter(function (r) { return r.soon; });
    out(root, "count", String(due.length + 1));
    out(root, "sub", "services due in the next 12 months (" + n(odo) + " → " + n(horizon) + " miles)");
    html(root, "table", rows.map(function (r) { return "<tr" + (r.soon ? ' class="soon"' : "") + "><td>" + esc(r.name) + (r.soon ? " <span class=\"tag\">Next 12 months</span>" : "") + '</td><td class="n">' + n(r.at) + ' mi</td><td class="n">' + (r.months === 0 ? "Now" : "~" + r.months + " mo") + '</td><td class="n">every ' + n(r.iv) + "</td></tr>"; }).join("") +
      timeItems.map(function (t) { return "<tr><td>" + esc(t[0]) + '</td><td class="n" colspan="3">' + esc(t[1]) + "</td></tr>"; }).join(""));
    html(root, "list", due.map(function (r) { return "<li><span>" + esc(r.name) + "</span><b>" + n(r.at) + " mi</b></li>"; }).join("") + "<li><span>Wiper blades</span><b>6–12 mo</b></li>");
    var oilField = root.querySelector("[data-oil]"); if (oilField) oilField.hidden = power === "ev";
  };

  /* ---------- wiring ---------- */
  $$("[data-tool]").forEach(function (root) {
    var name = root.getAttribute("data-tool");
    if (name === "vin") return initVin(root);
    if (name === "recall") return initRecall(root);
    var fn = TOOLS[name]; if (!fn) return;
    var run = function () { try { fn(root); } catch (e) { if (window.console) console.warn(e); } };
    $$("input,select", root).forEach(function (el) { el.addEventListener("input", run); el.addEventListener("change", run); });
    $$(".seg", root).forEach(function (seg) {
      var target = root.querySelector("[name=" + seg.getAttribute("data-for") + "]");
      $$("button", seg).forEach(function (b) {
        b.addEventListener("click", function () {
          $$("button", seg).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
          if (target) { target.value = b.getAttribute("data-v"); target.dispatchEvent(new Event("change")); }
        });
      });
    });
    $$("input[type=range]", root).forEach(function (r) {
      var o = root.querySelector("output[for=" + r.id + "]");
      var upd = function () { if (o) o.textContent = r.value + (r.getAttribute("data-suffix") || ""); };
      r.addEventListener("input", upd); upd();
    });
    run();
    root.addEventListener("currency", run);
  });

  $$("select[data-currency]").forEach(function (s) {
    s.value = getCur();
    s.addEventListener("change", function () {
      setCur(s.value);
      $$("select[data-currency]").forEach(function (o) { o.value = s.value; });
      $$("[data-tool]").forEach(function (r) { r.dispatchEvent(new Event("currency")); });
    });
  });
})();
