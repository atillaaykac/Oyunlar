/* ui.js
   Bu dosya sadece başlangıç ekranını doldurur:
   - Konu Paketleri (PACK_KEYS + BANK)
   - Soru tipi
   - Soru sayısı chip'leri
   app.js zaten click/change eventlerini bağlıyor.
*/
(function () {
  const $ = (id) => document.getElementById(id);

  const selPack = $("selPack");
  const selType = $("selType");
  const chipWrap = $("chipCount");

  function safeLabelForPack(key) {
    if (key === "mix_all") return "Karışık (Tüm Sistemler)";
    try {
      if (typeof BANK === "object" && BANK[key] && BANK[key].label) return BANK[key].label;
    } catch (_) {}
    return key;
  }

  function fillPacks() {
    if (!selPack) return;
    selPack.innerHTML = "";
    selPack.appendChild(new Option("Paket seç…", "", true, false));
    selPack.appendChild(new Option(safeLabelForPack("mix_all"), "mix_all"));

    try {
      if (Array.isArray(PACK_KEYS)) {
        PACK_KEYS.forEach((k) => selPack.appendChild(new Option(safeLabelForPack(k), k)));
      }
    } catch (_) {}
  }

  function fillTypes() {
    if (!selType) return;
    selType.innerHTML = "";
    selType.appendChild(new Option("Tip seç…", "", true, false));
    selType.appendChild(new Option("Test", "test"));
    selType.appendChild(new Option("Doğru / Yanlış", "dogruyanlis"));
    selType.appendChild(new Option("Karışık", "mixed"));
  }

  function fillCounts() {
    if (!chipWrap) return;
    chipWrap.innerHTML = "";
    [10, 25, 50, 75, 100].forEach((n) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.dataset.count = String(n);
      b.textContent = String(n);
      chipWrap.appendChild(b);
    });
  }

  function init() {
    fillPacks();
    fillTypes();
    fillCounts();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();