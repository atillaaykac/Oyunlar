/* audio.js
   - stay.mp3 dosyasını arka planda döngüde çalar
   - Autoplay kısıtları nedeniyle ilk kullanıcı etkileşiminde (tıklama/tuş) başlatmaya çalışır
   - Ses aç/kapat + volume slider
   - Ayarları localStorage'da saklar
*/
(function () {
  const audio = document.getElementById("bgm");
  const btnMute = document.getElementById("btnMute");
  const vol = document.getElementById("volSlider");

  if (!audio || !btnMute || !vol) return;

  const LS_MUTED = "bioquiz_bgm_muted";
  const LS_VOL = "bioquiz_bgm_volume";

  // Load settings
  const savedMuted = localStorage.getItem(LS_MUTED);
  const savedVol = localStorage.getItem(LS_VOL);

  if (savedVol !== null) {
    const v = Math.min(1, Math.max(0, parseFloat(savedVol)));
    if (!Number.isNaN(v)) audio.volume = v;
  } else {
    audio.volume = parseFloat(vol.value) || 0.4;
  }
  vol.value = String(audio.volume);

  audio.muted = (savedMuted === "1"); // default false
  syncUI();

  // Try to start on first user gesture (autoplay policy safe)
  let started = false;
  async function tryStart() {
    if (started) return;
    started = true;
    try {
      if (!audio.muted) await audio.play();
    } catch (e) {
      // Eğer tarayıcı engellerse, kullanıcı butona basınca yeniden denenecek
      started = false;
    }
  }

  // First interaction triggers tryStart
  window.addEventListener("pointerdown", tryStart, { once: true });
  window.addEventListener("keydown", tryStart, { once: true });

  btnMute.addEventListener("click", async () => {
    audio.muted = !audio.muted;
    localStorage.setItem(LS_MUTED, audio.muted ? "1" : "0");
    syncUI();

    // unmute olduysa çalmaya çalış
    if (!audio.muted) {
      try { await audio.play(); } catch (_) {}
    }
  });

  vol.addEventListener("input", async () => {
    const v = Math.min(1, Math.max(0, parseFloat(vol.value)));
    audio.volume = Number.isFinite(v) ? v : 0.4;
    localStorage.setItem(LS_VOL, String(audio.volume));

    // Ses açma niyeti: slider oynandıysa mute kapansın
    if (audio.muted && audio.volume > 0) {
      audio.muted = false;
      localStorage.setItem(LS_MUTED, "0");
      syncUI();
      try { await audio.play(); } catch (_) {}
    }
  });

  function syncUI() {
    if (audio.muted || audio.volume === 0) {
      btnMute.textContent = "🔇";
      btnMute.classList.add("isMuted");
      btnMute.title = "Sesi aç";
      btnMute.setAttribute("aria-label", "Sesi aç");
    } else {
      btnMute.textContent = "🔊";
      btnMute.classList.remove("isMuted");
      btnMute.title = "Sesi kapat";
      btnMute.setAttribute("aria-label", "Sesi kapat");
    }
  }
})();