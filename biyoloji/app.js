/* =========================================================
   Biyoloji Soru Oyunu
   - Local çalışır (no module)
   - Yanlış olunca doğruyu işaretlemeden "Sonraki" açılmaz
   - Test sorularında şıklar random karışır (doğru index güncellenir)
   - Konu Paketi: mix_all => tüm sistemlerden karışık
   - Test bitince Sonuç Tablosu modalı açılır
   ========================================================= */

const el = (id) => document.getElementById(id);

const state = {
  pack: null,
  type: null,
  count: null,

  questions: [],
  idx: 0,

  correct: 0,
  wrong: 0,

  lockedUntilCorrect: false,
  wrongLog: [],
  wrongTagCounts: {}
};

// ---------- UI refs ----------
const selPack = el("selPack");
const selType = el("selType");
const chipCount = el("chipCount");
const btnStart = el("btnStart");
const btnNext = el("btnNext");
const btnReset = el("btnReset");
const btnWrong = el("btnWrong");

const gameWrap = el("game");
const qIndex = el("qIndex");
const qTotal = el("qTotal");
const progFill = el("progFill");

const sCorrect = el("sCorrect");
const sWrong = el("sWrong");
const sNet = el("sNet");
const sPct = el("sPct");

const qTag = el("qTag");
const qTypeTag = el("qTypeTag");
const qText = el("qText");
const choices = el("choices");
const feedback = el("feedback");

const imgWrap = el("imgWrap");
const qImg = el("qImg");

// Wrong modal
const modal = el("modal");
const btnCloseModal = el("btnCloseModal");
const wrongList = el("wrongList");

// Result modal
const resultModal = el("resultModal");
const btnCloseResult = el("btnCloseResult");
const btnPlayAgain = el("btnPlayAgain");
const resultBody = el("resultBody");

// ---------- Helpers ----------
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

function computeStats() {
  const net = state.correct - state.wrong * 0.25;
  const answered = state.correct + state.wrong;
  const pct = answered === 0 ? 0 : Math.round((state.correct / answered) * 100);
  return { net, pct, answered };
}

function setFeedback(text, kind) {
  feedback.textContent = text || "";
  feedback.classList.remove("good", "bad");
  if (kind === "good") feedback.classList.add("good");
  if (kind === "bad") feedback.classList.add("bad");
}

function updateScoreUI() {
  const { net, pct } = computeStats();
  sCorrect.textContent = String(state.correct);
  sWrong.textContent = String(state.wrong);
  sNet.textContent = String(net.toFixed(2));
  sPct.textContent = String(pct);
}

function updateProgressUI() {
  qIndex.textContent = String(state.idx + 1);
  qTotal.textContent = String(state.questions.length);
  const pct = ((state.idx + 1) / state.questions.length) * 100;
  progFill.style.width = `${clamp(pct, 0, 100)}%`;
}

function canStart() {
  return Boolean(state.pack && state.type && state.count);
}
function reflectStartButton() {
  btnStart.disabled = !canStart();
}

// ---------- ✅ Test şıklarını random karıştır + doğru index güncelle ----------
function normalizeTestQuestion(q) {
  const correctText = q.choices[q.answerIndex];
  const newChoices = shuffle(q.choices);
  const newAnswerIndex = newChoices.findIndex(c => c === correctText);

  return {
    ...q,
    kind: "test",
    choices: newChoices,
    answerIndex: newAnswerIndex,
  };
}

// ---------- Bank (demo) ----------
const BANK = {
  sinir: {
    label: "Sinir Sistemi",
    test: [
      { text: "Miyelin kılıfın temel etkisi hangisidir?", choices: ["Sinaps sayısını azaltır", "İletim hızını artırır", "Hormon salgılatır", "ATP üretimini durdurur"], answerIndex: 1, tag: "Sinir Sistemi" },
      { text: "Refleks yayında uyarının değerlendirildiği bölüm en çok hangisidir?", choices: ["Ara nöron", "Duyu nöronu", "Motor nöron", "Reseptör"], answerIndex: 0, tag: "Refleks" },
      { text: "Sinapsta kimyasal iletimi sağlayan temel maddeler hangisidir?", choices: ["Nörotransmiterler", "Vitaminler", "Lipaz enzimleri", "Nükleotitler"], answerIndex: 0, tag: "Sinaps" },
      { text: "Nöronda uyarıyı en çok alan yapı hangisidir?", choices: ["Akson", "Dendrit", "Miyelin kılıf", "Ranvier boğumu"], answerIndex: 1, tag: "Nöron Yapısı" },
      { text: "Nöronda uyarının hücre gövdesinden uzaklaştırılarak taşındığı bölüm hangisidir?", choices: ["Dendrit", "Akson", "Çekirdek", "Ribozom"], answerIndex: 1, tag: "Nöron Yapısı" },
      { text: "Miyelin kılıfı periferik sinir sisteminde oluşturan glia hücresi hangisidir?", choices: ["Astrosit", "Schwann hücresi", "Oligodendrosit", "Mikroglia"], answerIndex: 1, tag: "Glia" },
      { text: "Merkezi sinir sisteminde miyelin kılıfı oluşturan hücre hangisidir?", choices: ["Schwann hücresi", "Oligodendrosit", "Mikroglia", "Ependim"], answerIndex: 1, tag: "Glia" },
      { text: "Miyelinli nöronda uyarının sıçrayarak iletilmesini sağlayan yapı hangisidir?", choices: ["Sinaptik aralık", "Ranvier boğumu", "Dendrit", "Nükleolus"], answerIndex: 1, tag: "Miyelin" },
      { text: "Dinlenim halinde nöron zarının içinin negatif olmasının temel nedeni hangisidir?", choices: ["K+ dışarı pompalanması", "Na+/K+ pompası ve iyon dağılımı", "Ca2+ girişinin artması", "Cl- çıkışının artması"], answerIndex: 1, tag: "Dinlenim Potansiyeli" },
      { text: "Aksiyon potansiyelinin yükselme (depolarizasyon) fazında temel olay hangisidir?", choices: ["K+ kanalları açılır, K+ dışarı çıkar", "Na+ kanalları açılır, Na+ içeri girer", "Cl- içeri girer", "Pompa durur, ATP biter"], answerIndex: 1, tag: "Aksiyon Potansiyeli" },
      { text: "Repolarizasyon fazında temel olarak hangi iyon hareketi gerçekleşir?", choices: ["Na+ içeri girer", "K+ dışarı çıkar", "Ca2+ dışarı çıkar", "Cl- dışarı çıkar"], answerIndex: 1, tag: "Aksiyon Potansiyeli" },
      { text: "Uyarının tek yönde iletilmesini sağlayan en önemli neden hangisidir?", choices: ["Tüm kanallar aynı anda kapanır", "Refrakter (inatçı) dönem", "Dendritlerin kısa olması", "Miyelinin yalıtım yapması"], answerIndex: 1, tag: "Refrakter" },
      { text: "Eşik değer aşıldığında aksiyon potansiyelinin hep aynı büyüklükte oluşması hangi ilkeyle açıklanır?", choices: ["Kısmi yanıt", "Ya hep ya hiç", "Negatif geri bildirim", "İndüksiyon"], answerIndex: 1, tag: "Ya Hep Ya Hiç" },
      { text: "Sinapsta kimyasal iletimde sinaptik keseciklerden salınan maddeler hangisidir?", choices: ["Hormon", "Nörotransmiter", "Antikor", "Hemoglobin"], answerIndex: 1, tag: "Sinaps" },
      { text: "Sinaptik aralıkta nörotransmiterlerin bağlandığı yapı hangisidir?", choices: ["Enzim", "Reseptör", "Ribozom", "DNA"], answerIndex: 1, tag: "Sinaps" },
      { text: "Sinapsta uyarının kimyasal iletimle aktarılmasını sağlayan olayın adı hangisidir?", choices: ["Difüzyon", "Eksositoz", "Endositoz", "Osmos"], answerIndex: 1, tag: "Sinaps" },
      { text: "Sinapslarda iletimin çoğunlukla tek yönlü olmasının temel nedeni hangisidir?", choices: ["Aksonun kısa olması", "Nörotransmiterin sadece presinaptik uçta bulunması", "Miyelin varlığı", "Dendritlerin dallanması"], answerIndex: 1, tag: "Sinaps" },
      { text: "Refleks yayında reseptörden gelen uyarıyı omuriliğe taşıyan nöron hangisidir?", choices: ["Motor nöron", "Duyu nöronu", "Ara nöron", "Glia"], answerIndex: 1, tag: "Refleks" },
      { text: "Refleks yayında omurilikte bağlantıyı sağlayan nöron hangisidir?", choices: ["Duyu nöronu", "Ara nöron", "Motor nöron", "Schwann"], answerIndex: 1, tag: "Refleks" },
      { text: "Refleks yayında kas/bez gibi tepki organına uyarıyı götüren nöron hangisidir?", choices: ["Ara nöron", "Motor nöron", "Duyu nöronu", "Ependim"], answerIndex: 1, tag: "Refleks" },
      { text: "Omuriliğin görevlerinden biri aşağıdakilerden hangisidir?", choices: ["Görme merkezini yönetmek", "Reflekslerin merkezidir", "Hormon salgılamak", "Kan yapımı"], answerIndex: 1, tag: "Omurilik" },
      { text: "Beyin kabuğunda (korteks) en çok hangi işlevler yürütülür?", choices: ["Solunum ritmi", "Bilinçli hareket ve düşünme", "Kalp atımı", "Tükürük salgısı"], answerIndex: 1, tag: "Beyin" },
      { text: "Beyincik (serebellum) ile en ilişkili işlev hangisidir?", choices: ["Görme", "Denge ve kas koordinasyonu", "İdrar oluşumu", "Hormon salınımı"], answerIndex: 1, tag: "Beyincik" },
      { text: "Omurilik soğanı (medulla oblongata) en çok hangi yaşamsal faaliyeti düzenler?", choices: ["Hafıza", "Solunum ve dolaşım", "Tat alma", "İşitme"], answerIndex: 1, tag: "Omurilik Soğanı" },
      { text: "Hipotalamusun görevlerinden biri aşağıdakilerden hangisidir?", choices: ["Miyelin üretmek", "Vücut ısısı ve su dengesi gibi homeostazi", "Kas kasılmasını başlatmak", "Eritrosit üretimi"], answerIndex: 1, tag: "Hipotalamus" },
      { text: "Talamusun temel görevi aşağıdakilerden hangisidir?", choices: ["İdrar miktarını ayarlamak", "Duyu impulslarının beyin kabuğuna iletiminde ara istasyon", "Kaslara ATP sağlamak", "Safra üretmek"], answerIndex: 1, tag: "Talamus" },
      { text: "Otonom sinir sistemi aşağıdaki hangi iki kola ayrılır?", choices: ["Sempatik–Somatik", "Sempatik–Parasempatik", "Merkezi–Çevresel", "Duyu–Motor"], answerIndex: 1, tag: "Otonom" },
      { text: "Sempatik sistemin etkilerinden biri aşağıdakilerden hangisidir?", choices: ["Sindirim hızını artırır", "Kalp atışını hızlandırır", "Göz bebeğini daraltır", "Tükürüğü artırır"], answerIndex: 1, tag: "Sempatik" },
      { text: "Parasempatik sistemin etkilerinden biri aşağıdakilerden hangisidir?", choices: ["Kalp atışını hızlandırır", "Sindirim faaliyetlerini artırır", "Bronşları genişletir", "Adrenalin salgısını artırır"], answerIndex: 1, tag: "Parasempatik" },
      { text: "Somatik sinir sistemi en çok hangi yapıları kontrol eder?", choices: ["Düz kas", "İskelet kası", "Kalp kası", "Endokrin bez"], answerIndex: 1, tag: "Somatik" },
      { text: "Merkezi sinir sistemi hangi yapılardan oluşur?", choices: ["Beyin ve omurilik", "Sinirler ve ganglionlar", "Reseptörler ve efektörler", "Duyu organları"], answerIndex: 0, tag: "MSS" },
      { text: "Çevresel sinir sistemi hangi yapılardan oluşur?", choices: ["Beyin ve omurilik", "Beyincik ve talamus", "Sinirler ve ganglionlar", "Omurilik soğanı ve pons"], answerIndex: 2, tag: "ÇSS" },
      { text: "BOS (beyin omurilik sıvısı) ile ilgili doğru ifade hangisidir?", choices: ["Sadece kaslarda bulunur", "Darbeleri sönümleyip MSS’yi korur", "Kan şekeri üretir", "Sindirim enzimi taşır"], answerIndex: 1, tag: "BOS" },
      { text: "BOS’u üreten temel yapı hangisidir?", choices: ["Alveoller", "Koroid pleksus", "Lenf düğümü", "Pankreas"], answerIndex: 1, tag: "BOS" },
      { text: "Beyin zarlarından (meninks) en dışta olan hangisidir?", choices: ["Pia mater", "Dura mater", "Arachnoid", "Perikard"], answerIndex: 1, tag: "Meninks" },
      { text: "Beyin zarlarından en içte olan hangisidir?", choices: ["Pia mater", "Dura mater", "Arachnoid", "Plevra"], answerIndex: 0, tag: "Meninks" },
      { text: "Kan-beyin bariyerinin temel önemi nedir?", choices: ["İdrarı filtreler", "Zararlı maddelere karşı beyni korur", "Kasları miyelinler", "Hormonları üretir"], answerIndex: 1, tag: "BBB" },
      { text: "Glia hücreleriyle ilgili doğru ifade hangisidir?", choices: ["Uyarıyı iletir, aksiyon potansiyeli oluşturur", "Nöronları destekler ve korur", "Hemoglobin taşır", "Kas kasılmasını başlatır"], answerIndex: 1, tag: "Glia" },
      { text: "Mikroglia hücrelerinin temel görevi hangisidir?", choices: ["Miyelin yapmak", "Fagositozla savunma", "BOS üretmek", "Hormon salgılamak"], answerIndex: 1, tag: "Glia" },
      { text: "Ependim hücreleri daha çok hangi yapıyla ilişkilidir?", choices: ["BOS’un dolaşımı ve boşlukların döşenmesi", "Kas lifleri", "Kıkırdak", "Alveoller"], answerIndex: 0, tag: "Glia" },
      { text: "Aşağıdakilerden hangisi kimyasal sinapsın elektriksel sinapstan farkıdır?", choices: ["Her zaman çift yönlüdür", "Nörotransmiter kullanır", "Gecikme yoktur", "İyon kanalı bağlantısı vardır"], answerIndex: 1, tag: "Sinaps" },
      { text: "Elektriksel sinapsın avantajı olarak hangisi söylenebilir?", choices: ["Yavaş iletim", "Hızlı ve genellikle senkron iletim", "Nörotransmiter zorunluluğu", "Tek yönlü iletim"], answerIndex: 1, tag: "Sinaps" },
      { text: "Uyarı şiddeti arttıkça nöronda genellikle ne artar?", choices: ["Aksiyon potansiyeli genliği", "İmpuls frekansı (sayısı)", "Miyelin kalınlığı", "Dendrit sayısı"], answerIndex: 1, tag: "Frekans" },
      { text: "Mutlak refrakter dönemde nöronda ne olur?", choices: ["Daha güçlü uyarıyla impuls oluşur", "Hiçbir uyarı impuls oluşturamaz", "Miyelin kopar", "Nörotransmiter artar"], answerIndex: 1, tag: "Refrakter" },
      { text: "Göreceli refrakter dönemde ne beklenir?", choices: ["Hiç impuls oluşmaz", "Normalden daha güçlü uyarı ile impuls oluşabilir", "Zar geçirgenliği sabit", "Na+ kanalları hiç açılmaz"], answerIndex: 1, tag: "Refrakter" },
      { text: "Sinaptik gecikmenin temel nedeni hangisidir?", choices: ["Aksonun kısa olması", "Nörotransmiterin salınım/bağlanma süreçleri", "Ranvier boğumları", "Miyelin kılıf"], answerIndex: 1, tag: "Sinaptik Gecikme" },
      { text: "Aşağıdakilerden hangisi periferik sinirlerde miyelin hasarıyla daha çok ilişkilidir?", choices: ["Parkinson", "Guillain-Barré", "Skorbüt", "Hemofili"], answerIndex: 1, tag: "Hastalık" },
      { text: "MSS’de miyelin hasarıyla daha çok ilişkilendirilen hastalık hangisidir?", choices: ["Multiple Skleroz (MS)", "Ülser", "Astım", "Anemi"], answerIndex: 0, tag: "Hastalık" },
      { text: "Beynin sağ yarım küresi genellikle hangi işlevlerle daha çok ilişkilidir?", choices: ["Dil-matematik", "Görsel-uzamsal algı", "Kan basıncı", "İdrar kontrolü"], answerIndex: 1, tag: "Yarımküre" },
      { text: "Beynin sol yarım küresi genellikle hangi işlevlerle daha çok ilişkilidir?", choices: ["Ritim ve müzik", "Dil ve analitik işlemler", "Denge", "Solunum"], answerIndex: 1, tag: "Yarımküre" },
      { text: "Frontal lob ile en çok ilişkili işlev hangisidir?", choices: ["Görme", "Planlama ve istemli hareket", "İşitme", "Denge"], answerIndex: 1, tag: "Loblar" },
      { text: "Oksipital lob ile en çok ilişkili işlev hangisidir?", choices: ["Görme", "İşitme", "Koku", "Tat"], answerIndex: 0, tag: "Loblar" },
      { text: "Temporal lob ile en çok ilişkili işlev hangisidir?", choices: ["İşitme", "Görme", "Denge", "Omurilik refleksi"], answerIndex: 0, tag: "Loblar" },
      { text: "Parietal lob ile en çok ilişkili işlev hangisidir?", choices: ["Dokunma ve vücut duyuları", "Solunum ritmi", "Kalp atımı", "Safra üretimi"], answerIndex: 0, tag: "Loblar" },
      { text: "Pons (Varol köprüsü) için en uygun ifade hangisidir?", choices: ["Sadece hafıza merkezi", "Beyin bölgeleri arasında bağlantı ve solunumda rol", "İdrar üretim merkezi", "Görme merkezi"], answerIndex: 1, tag: "Pons" },
      { text: "Orta beyin (mesensefalon) ile en çok ilişkili refleks hangisidir?", choices: ["Diz kapağı", "Göz bebeği ışık refleksi", "Kusma", "Yutma"], answerIndex: 1, tag: "Orta Beyin" },
      { text: "Beyin sapı genel olarak hangi yapılardan oluşur?", choices: ["Beyincik + korteks", "Orta beyin + pons + omurilik soğanı", "Talamus + hipotalamus", "Omurilik + periferik sinirler"], answerIndex: 1, tag: "Beyin Sapı" },
      { text: "Limbik sistem ile en çok ilişkili süreç hangisidir?", choices: ["Duygular ve motivasyon", "Kan filtrasyonu", "Safra üretimi", "Kalsiyum depolama"], answerIndex: 0, tag: "Limbik" },
      { text: "Hipokampus ile en çok ilişkili işlev hangisidir?", choices: ["Yeni anı oluşumu", "Kalp ritmi", "Görme", "Kas kasılması"], answerIndex: 0, tag: "Hipokampus" },
      { text: "Amigdala ile en çok ilişkili duygu hangisidir?", choices: ["Korku", "Açlık", "Susuzluk", "İdrar yapma"], answerIndex: 0, tag: "Amigdala" },
      { text: "Koku duyusunun talamusa uğramadan kortekse iletilmesi hangi açıdan önemlidir?", choices: ["Koku reflekslerini azaltır", "Koku-bellek/duygu ilişkisini güçlendirebilir", "Görmeyi artırır", "Dengeyi bozar"], answerIndex: 1, tag: "Koku" },
      { text: "Bir sinir lifinde iletim hızını artıran faktör hangisidir?", choices: ["Çapın küçülmesi", "Miyelin varlığı ve çapın artması", "Na+ pompalarının durması", "Dendritin uzaması"], answerIndex: 1, tag: "İletim Hızı" },
      { text: "Miyelinsiz lifte iletim nasıl gerçekleşir?", choices: ["Sıçrayarak", "Zar boyunca sürekli", "Sadece sinapsta", "Sadece dendritte"], answerIndex: 1, tag: "İletim" },
      { text: "Bir nöronda impuls, hücrenin hangi bölümünden başlatılmaya daha yatkındır?", choices: ["Dendrit ucu", "Akson tepeciği", "Çekirdek", "Miyelin kılıf"], answerIndex: 1, tag: "Akson Tepeciği" },
      { text: "EPSP kavramı aşağıdakilerden hangisini ifade eder?", choices: ["İnhibitör (baskılayıcı) sinaptik potansiyel", "Uyarıcı postsinaptik potansiyel", "Aksiyon potansiyeli genliği", "Dinlenim potansiyeli"], answerIndex: 1, tag: "EPSP" },
      { text: "IPSP kavramı aşağıdakilerden hangisini ifade eder?", choices: ["Uyarıcı postsinaptik potansiyel", "İnhibitör postsinaptik potansiyel", "Na+ girişinin artması", "Miyelin oluşumu"], answerIndex: 1, tag: "IPSP" },
      { text: "Uzamsal (spatial) toplama neyi anlatır?", choices: ["Tek sinapsın art arda uyarılması", "Birden fazla sinapsın aynı anda etkisi", "İmpulsun yavaşlaması", "Miyelinin kalınlaşması"], answerIndex: 1, tag: "Toplama" },
      { text: "Zamansal (temporal) toplama neyi anlatır?", choices: ["Farklı sinapsların aynı anda uyarısı", "Aynı sinapsın kısa aralıklarla tekrar uyarısı", "Dendrit sayısının artması", "BOS’un artması"], answerIndex: 1, tag: "Toplama" },
      { text: "Aşağıdakilerden hangisi bir nöronun enerji ihtiyacı ile en ilişkili organeldir?", choices: ["Mitokondri", "Lizozom", "Golgi", "Sentriyol"], answerIndex: 0, tag: "Enerji" },
      { text: "Nöronlar bölünme yeteneğini büyük ölçüde neden kaybeder?", choices: ["DNA yoktur", "Yüksek özelleşme ve hücre döngüsünden çıkma", "Mitokondri yoktur", "Ribozom yoktur"], answerIndex: 1, tag: "Nöron" },
      { text: "Duyu nöronlarının hücre gövdeleri genellikle nerede bulunur?", choices: ["Beyin kabuğu", "Arka kök ganglionu", "Omurilik soğanı", "Beyincik"], answerIndex: 1, tag: "Ganglion" },
      { text: "Omurilikte gri madde genel olarak neyi içerir?", choices: ["Miyelinli akson demetleri", "Nöron gövdeleri ve sinapslar", "Sadece bağ doku", "Sadece kan damarları"], answerIndex: 1, tag: "Gri-Beyaz" },
      { text: "Omurilikte beyaz madde genel olarak neyi içerir?", choices: ["Nöron gövdeleri", "Miyelinli aksonlar", "Sadece sinaptik aralık", "Ribozom yoğunluğu"], answerIndex: 1, tag: "Gri-Beyaz" },
      { text: "Akson uçlarında Ca2+ girişinin artması en çok hangi olayı tetikler?", choices: ["Dinlenim potansiyeli", "Nörotransmiter salınımı", "Miyelin sentezi", "DNA replikasyonu"], answerIndex: 1, tag: "Ca2+" },
      { text: "Aşağıdakilerden hangisi sinir dokusunda destek hücresidir?", choices: ["Nöron", "Astrosit", "Eritrosit", "Trombosit"], answerIndex: 1, tag: "Glia" },
      { text: "Astrositlerin görevlerinden biri aşağıdakilerden hangisidir?", choices: ["Kas kasılması", "Kan-beyin bariyerine katkı", "Safra üretimi", "İdrar oluşumu"], answerIndex: 1, tag: "Astrosit" },
      { text: "Omurilikten çıkan ön kök lifleri genel olarak hangi nöronları taşır?", choices: ["Duyu", "Motor", "Ara", "Glia"], answerIndex: 1, tag: "Kökler" },
      { text: "Omurilikten çıkan arka kök lifleri genel olarak hangi nöronları taşır?", choices: ["Motor", "Duyu", "Ara", "Ependim"], answerIndex: 1, tag: "Kökler" },
      { text: "Aşağıdakilerden hangisi reflekslerin hızlı olmasının temel nedenidir?", choices: ["Beyinde değerlendirilmesi", "Omurilikte kısa yol izlenmesi", "Hormonlarla yönetilmesi", "Lenf ile taşınması"], answerIndex: 1, tag: "Refleks" },
      { text: "Uyarının algılandığı yapı (reseptör) için doğru örnek hangisidir?", choices: ["Kas", "Deri dokunma reseptörü", "Akson", "Meninks"], answerIndex: 1, tag: "Reseptör" },
      { text: "Efektör organ için doğru örnek hangisidir?", choices: ["Reseptör", "İskelet kası", "Duyu nöronu", "Ganglion"], answerIndex: 1, tag: "Efektör" },
      { text: "Bir sinirin kesilmesi sonucu ilk beklenen durum hangisidir?", choices: ["Tüm hormonlar artar", "İlgili bölgede duyu/motor iletim bozulur", "BOS artar", "Kan şekeri düşer"], answerIndex: 1, tag: "Sinir Kesisi" },
      { text: "Beyin yarım kürelerini birbirine bağlayan yapı hangisidir?", choices: ["Hipokampus", "Korpus kallozum", "Talamus", "Pons"], answerIndex: 1, tag: "Bağlantı" },
      { text: "Beynin kıvrımlı yapısı (girintili çıkıntılı) ne sağlar?", choices: ["Kemiği kalınlaştırır", "Yüzey alanını artırır", "BOS’u azaltır", "Kasları güçlendirir"], answerIndex: 1, tag: "Korteks" },
      { text: "Sinir sisteminde “uyarıcı” bir nörotransmitere örnek olarak en uygun seçenek hangisidir?", choices: ["Asetilkolin", "Hemoglobin", "Keratin", "Glikojen"], answerIndex: 0, tag: "Nörotransmiter" },
      { text: "Sinir sisteminde “baskılayıcı” iletime örnek nörotransmiter hangisidir?", choices: ["GABA", "İnsülin", "Safra", "Tiroksin"], answerIndex: 0, tag: "Nörotransmiter" },
      { text: "MSS’deki boşlukların ve omurilik kanalının döşenmesinde görevli glia hangisidir?", choices: ["Ependim", "Mikroglia", "Astrosit", "Schwann"], answerIndex: 0, tag: "Glia" },
      { text: "BOS’un dolaştığı boşlukların adı hangisidir?", choices: ["Alveol", "Ventrikül", "Glomerül", "Sinüs"], answerIndex: 1, tag: "Ventrikül" },
      { text: "Nöron zarında “dinlenimde” daha çok hangi iyon içeride fazladır?", choices: ["Na+", "K+", "Ca2+", "Cl-"], answerIndex: 1, tag: "İyon Dağılımı" },
      { text: "Nöron zarında “dinlenimde” daha çok hangi iyon dışarıda fazladır?", choices: ["K+", "Na+", "Protein-", "Fosfat"], answerIndex: 1, tag: "İyon Dağılımı" },
      { text: "Sinir sisteminde iletimin yavaşlamasına yol açabilecek durum hangisidir?", choices: ["Miyelin artışı", "Akson çapının azalması", "Ranvier boğumu varlığı", "Na+ kanal sayısının artması"], answerIndex: 1, tag: "İletim Hızı" },
      { text: "Refleks yayı ‘tek sinapslı’ ise omurilikte hangi nöron bulunmaz?", choices: ["Motor nöron", "Ara nöron", "Duyu nöronu", "Reseptör"], answerIndex: 1, tag: "Monosinaptik" },
      { text: "Diz kapağı refleksi (patellar refleks) genelde hangi tipe örnektir?", choices: ["Polisinaptik", "Monosinaptik", "Endokrin refleks", "Koşullu refleks"], answerIndex: 1, tag: "Monosinaptik" },
      { text: "Koşullu refleksler ile ilgili doğru ifade hangisidir?", choices: ["Doğuştandır", "Öğrenme ile kazanılabilir", "Sadece omurilikte oluşur", "Hormonlarla yönetilir"], answerIndex: 1, tag: "Koşullu Refleks" },
      { text: "Serebrum (büyük beyin) hangi iki ana bölümden oluşur?", choices: ["Beyincik-Omurilik", "Sağ ve sol yarımküre", "Pons-Talamus", "Hipotalamus-Hipokampus"], answerIndex: 1, tag: "Büyük Beyin" },
      { text: "Büyük beynin dış kısmındaki gri maddeye ne ad verilir?", choices: ["Medulla", "Korteks", "Pons", "Ganglion"], answerIndex: 1, tag: "Korteks" },
      { text: "Omurilik soğanında bulunan merkezlerden biri hangisidir?", choices: ["Görme", "Yutma-kusma gibi refleks merkezleri", "Düşünme", "Tat"], answerIndex: 1, tag: "Medulla" },
      { text: "Sempatik sistem aktifken beklenen değişim hangisidir?", choices: ["Göz bebeği daralır", "Bronşlar genişleyebilir", "Sindirim artar", "Tükürük artar"], answerIndex: 1, tag: "Sempatik" },
      { text: "Parasempatik sistem aktifken beklenen değişim hangisidir?", choices: ["Kalp atışı hızlanır", "Sindirim hareketleri artar", "Kan şekeri artar", "Göz bebeği büyür"], answerIndex: 1, tag: "Parasempatik" },
      { text: "Nöronlarda impuls iletiminde ‘saltatory conduction’ hangi yapıda görülür?", choices: ["Miyelinsiz akson", "Miyelinli akson", "Dendrit", "Sinaptik aralık"], answerIndex: 1, tag: "Saltatory" },
      { text: "Bir nöronda impuls iletimi sırasında Na+/K+ pompasının temel görevi hangisidir?", choices: ["Aksiyon potansiyelini başlatmak", "İyon dengesini uzun vadede sürdürmek", "Nörotransmitteri üretmek", "Miyelini yapmak"], answerIndex: 1, tag: "Pompa" },
      { text: "Sinaptik aralıkta nörotransmiterin parçalanması/geri alınması neden önemlidir?", choices: ["İletimi sonsuza kadar sürdürmek için", "Uyarının sonlandırılması ve kontrol", "Miyelin üretmek", "BOS’u artırmak"], answerIndex: 1, tag: "Sinaps" },
      { text: "Aşağıdakilerden hangisi periferik sinir sisteminde ‘ganglion’ kavramına en uygundur?", choices: ["Nöron gövdeleri kümesi", "Miyelin kılıf", "BOS boşluğu", "Korteks kıvrımı"], answerIndex: 0, tag: "Ganglion" },
      { text: "Omurilikte kesit alındığında ‘kelebek’ şeklinde görülen bölge hangisidir?", choices: ["Beyaz madde", "Gri madde", "Meninks", "BOS"], answerIndex: 1, tag: "Gri-Beyaz" },
      { text: "Bir nöronda membran potansiyelini en hızlı değiştiren olay hangisidir?", choices: ["Protein sentezi", "İyon kanallarının açılıp kapanması", "Mitokondri bölünmesi", "Golgi salgısı"], answerIndex: 1, tag: "Membran" },
      { text: "Duyu organlarından gelen impulsların büyük kısmının beyin kabuğuna iletilmesinde ara durak hangisidir?", choices: ["Pons", "Talamus", "Beyincik", "Hipokampus"], answerIndex: 1, tag: "Talamus" },
      { text: "Vücut ısısı düzenlenmesinde en etkili beyin bölümü hangisidir?", choices: ["Beyincik", "Hipotalamus", "Oksipital lob", "Pons"], answerIndex: 1, tag: "Hipotalamus" },
      { text: "Aşağıdakilerden hangisi nöronların ortak özelliğidir?", choices: ["Kloroplast bulundurur", "Uyarılabilir ve iletebilir", "Hücre çeperi vardır", "Hemoglobin taşır"], answerIndex: 1, tag: "Genel" },
      { text: "İmpuls iletiminde ‘eşik’ kavramı en çok neyi ifade eder?", choices: ["Miyelin kalınlığını", "Aksiyon potansiyeli başlatacak minimum uyarı", "Sinaps sayısını", "BOS basıncını"], answerIndex: 1, tag: "Eşik" },
      { text: "Aşağıdakilerden hangisi sinir sisteminin ‘koruyucu’ yapılarındandır?", choices: ["Meninks", "Alveol", "Villus", "Nefron"], answerIndex: 0, tag: "Korunma" },
      { text: "Beyin ve omurilikte darbeyi azaltan sıvı hangisidir?", choices: ["Lenf", "BOS", "Safra", "İdrar"], answerIndex: 1, tag: "BOS" },
      { text: "Beyin omurilik sıvısının dolaşımında hangisi rol alabilir?", choices: ["Ependim hücreleri", "Eritrosit", "Trombosit", "Kas lifleri"], answerIndex: 0, tag: "BOS" },
      { text: "Bir sinapsta postsinaptik nöronda uyarı oluşması için hangisi gereklidir?", choices: ["Nörotransmiterin reseptöre bağlanması", "Miyelin kopması", "BOS azalması", "DNA’nın açılması"], answerIndex: 0, tag: "Sinaps" },
      { text: "Aşağıdakilerden hangisi çevresel sinir sistemine örnektir?", choices: ["Beyin", "Omurilik", "Spinal sinirler", "Talamus"], answerIndex: 2, tag: "ÇSS" },
      { text: "Aşağıdakilerden hangisi merkezi sinir sistemine örnektir?", choices: ["Kranial sinir", "Ganglion", "Omurilik", "Schwann hücresi"], answerIndex: 2, tag: "MSS" },
      { text: "İskelet kaslarının bilinçli kontrolü hangi sinir sistemi kısmına aittir?", choices: ["Otonom", "Somatik", "Endokrin", "Lenfatik"], answerIndex: 1, tag: "Somatik" },
      { text: "İç organların çalışmasını düzenleyen sistem hangisidir?", choices: ["Somatik", "Otonom", "İskelet", "Sindirim"], answerIndex: 1, tag: "Otonom" },
      { text: "Nöronlar arasında bilgi aktarımının gerçekleştiği bölgeye ne ad verilir?", choices: ["Nefron", "Sinaps", "Villus", "Alveol"], answerIndex: 1, tag: "Sinaps" },
      { text: "Nörotransmiterlerin sinaptik aralıktan uzaklaştırılmasına örnek mekanizma hangisidir?", choices: ["Geri alım (reuptake)", "Fotosentez", "Fermantasyon", "Glomerüler filtrasyon"], answerIndex: 0, tag: "Sinaps" },
      { text: "Aşağıdakilerden hangisi nöronlarda impuls iletiminde hız farkına en çok yol açar?", choices: ["Çekirdek şekli", "Akson çapı ve miyelin", "Ribozom sayısı", "Golgi büyüklüğü"], answerIndex: 1, tag: "İletim Hızı" },
      { text: "Nöronların hasar gördüğünde yenilenmesinin zor olmasının nedeni hangisidir?", choices: ["Mitokondri yoktur", "Bölünme yeteneklerinin sınırlı olması", "DNA yoktur", "Zarları yoktur"], answerIndex: 1, tag: "Nöron" },
      { text: "Bir uyarıdan sonra nöronun kısa süre uyarılamamasına ne denir?", choices: ["Eşik", "Refrakter dönem", "Toplama", "Homeostazi"], answerIndex: 1, tag: "Refrakter" },
      { text: "Aşağıdakilerden hangisi “duyu nöronu” için doğru örnektir?", choices: ["Kası uyaran nöron", "Deriden omuriliğe impuls taşıyan nöron", "Omurilikte ara bağlantı nöronu", "Schwann hücresi"], answerIndex: 1, tag: "Duyu Nöronu" },
      { text: "Aşağıdakilerden hangisi “motor nöron” için doğru örnektir?", choices: ["Deriden beyne impuls taşıyan", "Omurilikten kasa impuls taşıyan", "Ganglion hücresi", "Astrosit"], answerIndex: 1, tag: "Motor Nöron" },
      { text: "Sinir sisteminde ‘iletim hızı’ artırmak için en mantıklı uyarlama hangisidir?", choices: ["Miyelin oluşumu", "Dendritin kısalması", "Çekirdeğin büyümesi", "Lizozom artışı"], answerIndex: 0, tag: "İletim Hızı" },
      { text: "Bir nöronda uyarının iletimi sırasında zarın içi kısa süreliğine pozitif olmasının nedeni hangisidir?", choices: ["K+ çıkışı", "Na+ girişi", "Cl- çıkışı", "Protein sentezi"], answerIndex: 1, tag: "Depolarizasyon" },
      { text: "İmpulsun oluştuğu ve ilerlediği olaylar temel olarak hangi yapıda gerçekleşir?", choices: ["Hücre duvarı", "Hücre zarı", "Nükleus", "Kromozom"], answerIndex: 1, tag: "Zar" },
      { text: "Aşağıdakilerden hangisi “beyin sapı” içinde yer alır?", choices: ["Beyincik", "Omurilik soğanı", "Oksipital lob", "Korpus kallozum"], answerIndex: 1, tag: "Beyin Sapı" },
      { text: "Beyinciğin hasarında aşağıdakilerden hangisi en belirgin bozulur?", choices: ["Denge ve koordinasyon", "İdrar üretimi", "Kan pıhtılaşması", "Görme keskinliği"], answerIndex: 0, tag: "Beyincik" },
      { text: "Omurilik soğanı hasarında en kritik risk hangisidir?", choices: ["Saç dökülmesi", "Solunum-dolaşımın bozulması", "Diş çürüğü", "Kemik kırığı"], answerIndex: 1, tag: "Medulla" },
      { text: "Sempatik sistem baskınken sindirim sisteminde beklenen durum hangisidir?", choices: ["Artar", "Azalır", "Değişmez", "İkiye katlanır"], answerIndex: 1, tag: "Sempatik" },
      { text: "Parasempatik sistem baskınken kalpte beklenen durum hangisidir?", choices: ["Hızlanır", "Yavaşlar", "Durur", "Değişmez"], answerIndex: 1, tag: "Parasempatik" },
      { text: "Sinir sisteminde ‘uyarıcı’ sinapsın etkisi aşağıdakilerden hangisidir?", choices: ["Zarı hiperpolarize eder", "Eşik değere yaklaştırır", "Pompayı durdurur", "Miyelini eritir"], answerIndex: 1, tag: "Uyarıcı" },
      { text: "Sinir sisteminde ‘baskılayıcı’ sinapsın etkisi aşağıdakilerden hangisidir?", choices: ["Eşiğe yaklaştırır", "Zarı hiperpolarize ederek eşiğe uzaklaştırır", "Mitokondriyi artırır", "BOS’u artırır"], answerIndex: 1, tag: "Baskılayıcı" },
      { text: "Omuriliğin ön boynuzunda daha çok hangi nöron gövdeleri bulunur?", choices: ["Motor nöron", "Duyu nöronu", "Schwann", "Ependim"], answerIndex: 0, tag: "Omurilik" },
      { text: "Omuriliğin arka boynuzunda daha çok hangi nöronlarla ilişki kurulur?", choices: ["Motor", "Duyu", "Kas", "Kıkırdak"], answerIndex: 1, tag: "Omurilik" },
      { text: "Beyin yarımküreleri arasında iletişimi sağlayan yapı hangisidir?", choices: ["Pons", "Korpus kallozum", "Hipotalamus", "Beyincik"], answerIndex: 1, tag: "Bağlantı" },
      { text: "Sinir sisteminde impuls iletimi ile hormon taşınması arasındaki temel fark hangisidir?", choices: ["İmpuls hızlıdır, hormon daha yavaştır", "Hormon sadece sinirlerde taşınır", "İmpuls kanda taşınır", "İkisi de aynı hızdadır"], answerIndex: 0, tag: "Karşılaştırma" },
      { text: "Nöron zarında “hiperpolarizasyon” genellikle neyi ifade eder?", choices: ["Zarın içinin daha pozitif olması", "Zarın içinin daha negatif olması", "Miyelinin artması", "BOS’un artması"], answerIndex: 1, tag: "Hiperpolarizasyon" },
      { text: "Bir sinapsta postsinaptik hücrede IPSP oluşması hangi etkiyi doğurur?", choices: ["Uyarıyı kolaylaştırır", "Uyarıyı zorlaştırır", "İletimi hızlandırır", "Miyelin üretir"], answerIndex: 1, tag: "IPSP" },
      { text: "Sinir sisteminde ‘eşik’ aşılamazsa ne olur?", choices: ["Aksiyon potansiyeli oluşmaz", "Aksiyon potansiyeli daha büyük olur", "Nörotransmiter artar", "Miyelin kalınlaşır"], answerIndex: 0, tag: "Eşik" },
      { text: "Bir nöronda impuls iletiminin kesintiye uğraması için en kritik yapı hasarı hangisidir?", choices: ["Çekirdeğin şekli", "Hücre zarındaki iyon kanalları", "Ribozom sayısı", "Golgi kesecikleri"], answerIndex: 1, tag: "İyon Kanalları" },
      { text: "Sinir sisteminde ‘plastisite’ kavramı en çok neyi ifade eder?", choices: ["Kemik esnekliği", "Sinaptik bağlantıların değişebilmesi", "Kan pıhtılaşması", "BOS üretimi"], answerIndex: 1, tag: "Plastisite" },
      { text: "Öğrenme ile sinaps sayısının artması hangi kavramla daha çok ilişkilidir?", choices: ["Plastisite", "Filtrasyon", "Osmoregülasyon", "Fermantasyon"], answerIndex: 0, tag: "Plastisite" },
      { text: "Bir nöronun “iletkenliği” ile en direkt ilişkili yapı hangisidir?", choices: ["Kromozom", "Akson", "Lizozom", "Koful"], answerIndex: 1, tag: "Akson" },
      { text: "Bir impulsun sinapstan geçişi neden akson içi iletime göre daha yavaştır?", choices: ["Miyelin yoktur", "Kimyasal basamaklar ve difüzyon olduğu için", "Na+ kanalı yoktur", "Refrakter olmaz"], answerIndex: 1, tag: "Sinaptik Gecikme" },
      { text: "Aşağıdakilerden hangisi ‘merkezi sinir sistemi’ içinde yer almaz?", choices: ["Beyin", "Omurilik", "Spinal sinir", "Beyincik"], answerIndex: 2, tag: "MSS" },
      { text: "Aşağıdakilerden hangisi ‘çevresel sinir sistemi’ içinde yer alır?", choices: ["Talamus", "Hipotalamus", "Kranial sinirler", "Beyincik"], answerIndex: 2, tag: "ÇSS" },
    ],
    dogruyanlis: [
      { text: "Aksiyon potansiyelinde önce Na⁺ kanalları açılıp Na⁺ hücre içine girer.", answerBool: true, tag: "Uyarı İletimi" },
      { text: "Sinapsta iletim her zaman çift yönlüdür.", answerBool: false, tag: "Sinaps" },
      { text: "Miyelinli nöronlarda impuls iletimi Ranvier boğumları arasında sıçrayarak ilerler.", answerBool: true, tag: "Miyelin" },
      { text: "Dinlenim potansiyelinde hücre içi, hücre dışına göre daha pozitiftir.", answerBool: false, tag: "Dinlenim" },
      { text: "Depolarizasyon sırasında Na+ kanallarının açılmasıyla Na+ hücre içine girer.", answerBool: true, tag: "AP" },
      { text: "Repolarizasyon sırasında K+ kanallarının açılmasıyla K+ hücre içine girer.", answerBool: false, tag: "AP" },
      { text: "Kimyasal sinapsta iletim çoğunlukla tek yönlüdür.", answerBool: true, tag: "Sinaps" },
      { text: "Schwann hücreleri merkezi sinir sisteminde miyelin oluşturur.", answerBool: false, tag: "Glia" },
      { text: "Oligodendrositler merkezi sinir sisteminde miyelin oluşturur.", answerBool: true, tag: "Glia" },
      { text: "Omurilik reflekslerin merkezidir.", answerBool: true, tag: "Omurilik" },
      { text: "Beyincik denge ve kas koordinasyonunda görev alır.", answerBool: true, tag: "Beyincik" },
      { text: "Omurilik soğanı solunum ve dolaşımın düzenlenmesinde kritik rol oynar.", answerBool: true, tag: "Medulla" },
      { text: "Sempatik sistem sindirimi artırır, kalp atışını yavaşlatır.", answerBool: false, tag: "Otonom" },
      { text: "Parasempatik sistem dinlenme halinde sindirim faaliyetlerini artırabilir.", answerBool: true, tag: "Otonom" }
    ],
  },

  endokrin: {
    label: "Endokrin Sistem",
    test: [
      { text: "Kan şekerini düşüren hormon hangisidir?", choices: ["Glukagon", "İnsülin", "Adrenalin", "Tiroksin"], answerIndex: 1, tag: "Endokrin" },
      { text: "ADH artarsa aşağıdakilerden hangisi artar?", choices: ["İdrar miktarı", "Su geri emilimi", "Terleme", "Kan pH’ı"], answerIndex: 1, tag: "Hipofiz" },
      { text: "Tiroit hormonlarının temel etkisi en çok hangisidir?", choices: ["Metabolizma hızını ayarlama", "Kanı pıhtılaştırma", "Antikor üretme", "Kas kasılmasını başlatma"], answerIndex: 0, tag: "Tiroit" },
      { text: "Endokrin bezlerin temel farkı aşağıdakilerden hangisidir?", choices: ["Salgılarını kanal ile taşırlar", "Salgılarını kana verirler", "Sadece sinirle uyarılırlar", "Sadece sindirimde görev alırlar"], answerIndex: 1, tag: "Temel Kavram" },
      { text: "Hormonların hedef hücreyi seçmesindeki temel etken hangisidir?", choices: ["Hormonun rengi", "Hedef hücrede reseptör bulunması", "Kanın pH’ı", "Hormonun kana karışma hızı"], answerIndex: 1, tag: "Reseptör" },
      { text: "Steroid yapılı hormonların reseptörü genellikle nerededir?", choices: ["Hücre zarı", "Sitoplazma/çekirdek", "Lizozom", "Ribozom"], answerIndex: 1, tag: "Steroid Hormon" },
      { text: "Protein/peptit hormonlar genellikle nasıl etki eder?", choices: ["DNA’ya doğrudan bağlanarak", "Hücre zarından geçip çekirdeğe girerek", "Hücre zarı reseptörü ve ikinci haberciyle", "Mitokondriyi eritir"], answerIndex: 2, tag: "Peptit Hormon" },
      { text: "İkinci haberci (second messenger) sistemine örnek en uygun seçenek hangisidir?", choices: ["cAMP", "DNA polimeraz", "Hemoglobin", "Safra tuzu"], answerIndex: 0, tag: "İkinci Haberci" },
      { text: "Hipofizin ön lobundan salgılanan hormon hangisidir?", choices: ["ADH", "Oksitosin", "TSH", "Melatonin"], answerIndex: 2, tag: "Hipofiz Ön Lob" },
      { text: "Hipofizin arka lobunun görevi en iyi nasıl açıklanır?", choices: ["Hormon üretir", "Hipotalamustan gelen hormonları depolayıp salar", "İnsülin üretir", "Tiroksin üretir"], answerIndex: 1, tag: "Hipofiz Arka Lob" },
      { text: "ADH’nin temel etkisi hangisidir?", choices: ["Kanın pıhtılaşmasını artırmak", "Böbrekte su geri emilimini artırmak", "Kan şekerini yükseltmek", "Kalsiyumu kemikten çekmek"], answerIndex: 1, tag: "ADH" },
      { text: "Oksitosin ile ilgili doğru ifade hangisidir?", choices: ["Rahim kasılmalarını ve süt salınımını artırabilir", "Kan şekerini düşürür", "Metabolizmayı yavaşlatır", "Kalsiyumu düşürür"], answerIndex: 0, tag: "Oksitosin" },
      { text: "Prolaktinin temel görevi hangisidir?", choices: ["Süt üretimini artırmak", "Su geri emilimini azaltmak", "Kan basıncını düşürmek", "Glukozu karaciğerde depolamak"], answerIndex: 0, tag: "Prolaktin" },
      { text: "TSH artışı en çok hangi bezi uyarır?", choices: ["Pankreas", "Tiroit", "Böbreküstü kabuk", "Testis"], answerIndex: 1, tag: "TSH" },
      { text: "ACTH artışı en çok hangi yapıyı uyarır?", choices: ["Böbreküstü kabuk", "Böbreküstü öz", "Paratiroit", "Timus"], answerIndex: 0, tag: "ACTH" },
      { text: "FSH için en uygun görev hangisidir?", choices: ["Tiroit hormonlarını üretmek", "Gamet oluşumunu desteklemek", "Kalsiyumu düşürmek", "Su geri emilimini artırmak"], answerIndex: 1, tag: "FSH" },
      { text: "LH ile ilgili doğru seçenek hangisidir?", choices: ["Ovulasyonu tetikleyebilir", "Melatonin salgılar", "Kan şekerini düşürür", "Böbrekte suyu tutar"], answerIndex: 0, tag: "LH" },
      { text: "Büyüme hormonu (GH) için doğru ifade hangisidir?", choices: ["Sadece bebeklikte etkilidir", "Protein sentezi ve büyümeyi destekleyebilir", "Sadece böbreği çalıştırır", "Kanın pıhtılaşmasını sağlar"], answerIndex: 1, tag: "GH" },
      { text: "Tiroit bezinin ürettiği hormonlar hangileridir?", choices: ["T3-T4", "İnsülin-Glukagon", "Aldosteron-Kortizol", "FSH-LH"], answerIndex: 0, tag: "Tiroit" },
      { text: "Tiroksinin (T4) en temel etkisi hangisidir?", choices: ["Metabolizma hızını artırmak", "Kan şekerini düşürmek", "Kalsiyumu düşürmek", "Su geri emilimini azaltmak"], answerIndex: 0, tag: "Tiroit" },
      { text: "Kalsitonin için doğru ifade hangisidir?", choices: ["Kan kalsiyumunu yükseltir", "Kan kalsiyumunu düşürmeye yardım eder", "Kan şekerini yükseltir", "Süt üretimini artırır"], answerIndex: 1, tag: "Kalsitonin" },
      { text: "Parathormon (PTH) genel olarak hangi etkiyi yapar?", choices: ["Kan kalsiyumunu yükseltir", "Kan kalsiyumunu düşürür", "Kan glukozunu düşürür", "Kan basıncını düşürür"], answerIndex: 0, tag: "Paratiroit" },
      { text: "İyot eksikliği ile en ilişkili durum hangisidir?", choices: ["Guatr", "Diyabet tip 1", "Akromegali", "Addison"], answerIndex: 0, tag: "Tiroit Bozukluk" },
      { text: "Pankreasın endokrin kısmı için doğru isim hangisidir?", choices: ["Alveol", "Langerhans adacıkları", "Nefron", "Villus"], answerIndex: 1, tag: "Pankreas" },
      { text: "İnsülinin temel görevi hangisidir?", choices: ["Kan şekerini düşürmek", "Kan şekerini yükseltmek", "Kalsiyumu artırmak", "Su geri emilimini azaltmak"], answerIndex: 0, tag: "İnsülin" },
      { text: "Glukagonun temel görevi hangisidir?", choices: ["Kan şekerini düşürmek", "Kan şekerini yükseltmek", "Kalsiyumu düşürmek", "Kas kasılmasını durdurmak"], answerIndex: 1, tag: "Glukagon" },
      { text: "İnsülinin hedef dokuda glukoz alımını artırmasına en uygun örnek hangisidir?", choices: ["GLUT taşıyıcılarının membrana taşınması", "DNA’nın denatüre olması", "Hemoglobinin parçalanması", "Safra salgısının artması"], answerIndex: 0, tag: "İnsülin Mekanizma" },
      { text: "Kan şekeri yükseldiğinde normalde hangi hormon artar?", choices: ["Glukagon", "İnsülin", "ADH", "PTH"], answerIndex: 1, tag: "Homeostazi" },
      { text: "Diyabet tip 1’in temel nedeni hangisidir?", choices: ["İnsülin direnci", "Beta hücre kaybı/insülin eksikliği", "Tiroksin fazlalığı", "PTH fazlalığı"], answerIndex: 1, tag: "Diyabet" },
      { text: "Diyabet tip 2’de temel problem çoğunlukla hangisidir?", choices: ["İnsülin direnci", "Tam insülin yokluğu", "ADH eksikliği", "Kalsitonin eksikliği"], answerIndex: 0, tag: "Diyabet" },
      { text: "Hipoglisemi için en uygun tanım hangisidir?", choices: ["Kanın glukozunun düşmesi", "Kanın glukozunun aşırı yükselmesi", "Kanın kalsiyumunun artması", "Kanın sodyumunun artması"], answerIndex: 0, tag: "Glukoz" },
      { text: "Glukagon karaciğerde en çok hangi olayı artırır?", choices: ["Glikojen yıkımı", "Glikojen sentezi", "Protein sentezi", "Yağ emilimi"], answerIndex: 0, tag: "Glukagon" },
      { text: "İnsülin karaciğerde en çok hangi olayı destekler?", choices: ["Glikojen sentezi", "Glikojen yıkımı", "Glikoz oluşumu (glukoneogenez)", "Adrenalin sentezi"], answerIndex: 0, tag: "İnsülin" },
      { text: "Böbreküstü bezinin iki ana bölümü hangileridir?", choices: ["Korteks ve medulla", "Talamus ve hipotalamus", "Atria ve ventrikül", "Kabuk ve öz yoktur"], answerIndex: 0, tag: "Böbreküstü" },
      { text: "Böbreküstü medulladan salgılanan hormonlar hangileridir?", choices: ["Adrenalin-Noradrenalin", "Kortizol-Aldosteron", "T3-T4", "FSH-LH"], answerIndex: 0, tag: "Adrenal Medulla" },
      { text: "Adrenalinin etkilerinden biri hangisidir?", choices: ["Kalp atışını artırmak", "Sindirim hareketlerini artırmak", "Kan şekerini düşürmek", "Göz bebeğini daraltmak"], answerIndex: 0, tag: "Adrenalin" },
      { text: "Böbreküstü korteksten salgılanan hormonlara örnek hangisidir?", choices: ["Kortizol", "Melatonin", "ADH", "Oksitosin"], answerIndex: 0, tag: "Adrenal Korteks" },
      { text: "Aldosteronun temel etkisi hangisidir?", choices: ["Na+ geri emilimini artırıp su tutulumuna katkı", "Kan kalsiyumunu düşürmek", "Kan şekerini düşürmek", "Süt üretimini artırmak"], answerIndex: 0, tag: "Aldosteron" },
      { text: "Kortizolün temel etkilerinden biri hangisidir?", choices: ["Stres yanıtını desteklemek ve glukozu artırma eğilimi", "Kan şekerini kesin düşürmek", "Kalsiyumu düşürmek", "İdrarı artırmak"], answerIndex: 0, tag: "Kortizol" },
      { text: "Addison hastalığı en çok hangisiyle ilişkilidir?", choices: ["Adrenal korteks yetmezliği", "Tiroit fazlalığı", "İnsülin fazlalığı", "ADH fazlalığı"], answerIndex: 0, tag: "Addison" },
      { text: "Cushing sendromu en çok hangisiyle ilişkilidir?", choices: ["Kortizol fazlalığı", "Kortizol eksikliği", "PTH eksikliği", "İnsülin eksikliği"], answerIndex: 0, tag: "Cushing" },
      { text: "Feokromositoma en çok hangi bölge/hormonla ilişkilidir?", choices: ["Adrenal medulla-katekolamin", "Tiroit-T4", "Pankreas-insülin", "Paratiroit-PTH"], answerIndex: 0, tag: "Feokromositoma" },
      { text: "Sempatik uyarı ile adrenal medullanın salgıladığı hormon grubu hangisidir?", choices: ["Katekolaminler", "Steroidler", "Peptitler", "Prostaglandinler"], answerIndex: 0, tag: "Katekolamin" },
      { text: "Melatonin hormonu nereden salgılanır?", choices: ["Epifiz bezi", "Tiroit", "Pankreas", "Timus"], answerIndex: 0, tag: "Epifiz" },
      { text: "Melatoninin en belirgin etkisi hangisidir?", choices: ["Sirkadiyen ritmi düzenleme", "Kan şekerini düşürme", "Kalsiyumu artırma", "Su geri emilimini artırma"], answerIndex: 0, tag: "Melatonin" },
      { text: "Timus bezi ile en ilişkili hormon/işlev hangisidir?", choices: ["T lenfosit olgunlaşması (timosin vb.)", "Kan şekeri ayarı", "Metabolizma hızı", "Su dengesi"], answerIndex: 0, tag: "Timus" },
      { text: "Eritropoetin (EPO) nereden salgılanır?", choices: ["Böbrek", "Mide", "Tiroit", "Hipofiz arka lob"], answerIndex: 0, tag: "EPO" },
      { text: "EPO’nun temel etkisi hangisidir?", choices: ["Eritrosit üretimini artırmak", "Kalsiyumu düşürmek", "Kan şekerini düşürmek", "Uyku getirmek"], answerIndex: 0, tag: "EPO" },
      { text: "Antidiüretik hormon eksikliğiyle ilişkili tablo hangisidir?", choices: ["Diabetes insipidus", "Diyabet tip 2", "Guatr", "Cushing"], answerIndex: 0, tag: "ADH Bozukluk" },
      { text: "Diabetes insipidus’ta beklenen durum hangisidir?", choices: ["Çok idrar-çok susama", "Hipoglisemi", "Kalsiyum artışı", "Kan basıncı aşırı artışı"], answerIndex: 0, tag: "ADH Bozukluk" },
      { text: "Negatif geri bildirim (feedback) için en uygun örnek hangisidir?", choices: ["T3/T4 artınca TSH’nin azalması", "Doğumda oksitosinin artarak kasılmayı artırması", "Kanın pıhtılaşması", "Kasın yorulması"], answerIndex: 0, tag: "Feedback" },
      { text: "Pozitif geri bildirim için en uygun örnek hangisidir?", choices: ["Tiroksin artınca TSH azalması", "Oksitosin artınca kasılmanın artması", "İnsülin artınca glukoz düşmesi", "ADH artınca su tutulması"], answerIndex: 1, tag: "Feedback" },
      { text: "Hormonların etki süresi genellikle sinirsel iletime göre nasıldır?", choices: ["Daha yavaş başlar daha uzun sürer", "Daha hızlı başlar daha kısa sürer", "Aynıdır", "Sinirsel iletim daha yavaştır"], answerIndex: 0, tag: "Karşılaştırma" },
      { text: "Hormonlar genellikle hangi yolla taşınır?", choices: ["Lenf", "Kan", "Sinir aksonu", "Safra kanalı"], answerIndex: 1, tag: "Taşıma" },
      { text: "Steroid hormonlar kanda çoğunlukla nasıl taşınır?", choices: ["Serbest çözünerek", "Taşıyıcı proteinlere bağlı", "Sadece lenfle", "Kanal sistemiyle"], answerIndex: 1, tag: "Steroid Taşıma" },
      { text: "Peptit hormonlar kanda genellikle nasıl bulunur?", choices: ["Taşıyıcı proteine bağlı zorunlu", "Çoğu serbest çözünmüş halde", "Sadece alyuvar içinde", "Sadece yağ dokuda"], answerIndex: 1, tag: "Peptit Taşıma" },
      { text: "Hedef hücrede gen ifadesini daha doğrudan değiştirme ihtimali yüksek hormon grubu hangisidir?", choices: ["Steroid hormonlar", "Peptit hormonlar", "Katekolaminler", "Hepsi kesin aynı"], answerIndex: 0, tag: "Gen Etkisi" },
      { text: "İnsülin hangi hücrelerden salgılanır?", choices: ["Alfa hücre", "Beta hücre", "Delta hücre", "Oksifil hücre"], answerIndex: 1, tag: "Pankreas Hücreleri" },
      { text: "Glukagon hangi hücrelerden salgılanır?", choices: ["Beta", "Alfa", "Delta", "Schwann"], answerIndex: 1, tag: "Pankreas Hücreleri" },
      { text: "Somatostatin (pankreas) için en uygun ifade hangisidir?", choices: ["Sindirim enzimidir", "İnsülin ve glukagon salgısını baskılayabilir", "Kalsiyumu yükseltir", "Süt salınımını artırır"], answerIndex: 1, tag: "Somatostatin" },
      { text: "Tiroit hormon sentezinde en kritik element hangisidir?", choices: ["Fe", "I", "Na", "K"], answerIndex: 1, tag: "İyot" },
      { text: "Hipertiroidide beklenen durumlardan biri hangisidir?", choices: ["Metabolizma yavaşlar", "Metabolizma hızlanır", "Bradikardi artar", "Üşüme artar"], answerIndex: 1, tag: "Hipertiroidi" },
      { text: "Hipotiroidide beklenen durumlardan biri hangisidir?", choices: ["Kilo kaybı ve terleme artışı", "Soğuğa hassasiyet ve yavaş metabolizma", "Kalp atışının artması", "Göz bebeğinin büyümesi"], answerIndex: 1, tag: "Hipotiroidi" },
      { text: "Hipotalamus-hipofiz-tiroid ekseni hangi sırayla çalışır?", choices: ["TSH→TRH→T3/T4", "TRH→TSH→T3/T4", "T3/T4→TRH→TSH", "TRH→T3/T4→TSH"], answerIndex: 1, tag: "Eksen" },
      { text: "Hipotalamus-hipofiz-adrenal ekseni hangi hormonlarla özetlenir?", choices: ["TRH-TSH-Kortizol", "CRH-ACTH-Kortizol", "GnRH-LH-T3", "ADH-TSH-Kalsitonin"], answerIndex: 1, tag: "Eksen" },
      { text: "GnRH hipotalamustan salgılanırsa hipofiz ön lobdan en çok hangileri artar?", choices: ["TSH ve ACTH", "FSH ve LH", "ADH ve oksitosin", "T3 ve T4"], answerIndex: 1, tag: "GnRH" },
      { text: "Adrenalin hangi hormon sınıfına girer?", choices: ["Steroid", "Katekolamin", "Peptit", "Eikosanoid"], answerIndex: 1, tag: "Sınıflandırma" },
      { text: "Kortizol hangi hormon sınıfına girer?", choices: ["Steroid", "Katekolamin", "Peptit", "Aminoasit türevi (tiroit gibi)"], answerIndex: 0, tag: "Sınıflandırma" },
      { text: "T3/T4 hangi hormon sınıfına en yakındır?", choices: ["Peptit", "Aminoasit türevi", "Steroid", "Glikoprotein"], answerIndex: 1, tag: "Sınıflandırma" },
      { text: "Hormonların 'tropik' olması ne demektir?", choices: ["Hedefi başka bez olan hormon", "Sadece kası uyaran hormon", "Sadece glukozu düşüren hormon", "Sadece kemikte çalışan hormon"], answerIndex: 0, tag: "Tropik" },
      { text: "TSH hangi tip hormona örnektir?", choices: ["Tropik", "Yerel (parakrin)", "Nörotransmiter", "Enzim"], answerIndex: 0, tag: "Tropik" },
      { text: "Aldosteron artarsa beklenen değişim hangisidir?", choices: ["Na+ kaybı artar", "Na+ tutulumu artar", "Kanın hacmi azalır", "Kan basıncı düşer"], answerIndex: 1, tag: "Aldosteron" },
      { text: "Aldosteron artışı genelde hangi sistemle ilişkilidir?", choices: ["RAAS", "Koagülasyon", "Fotosentez", "Glikoliz"], answerIndex: 0, tag: "RAAS" },
      { text: "Renin nereden salgılanır?", choices: ["Böbrek jukstaglomerüler hücreleri", "Tiroit", "Pankreas beta", "Hipofiz arka lob"], answerIndex: 0, tag: "RAAS" },
      { text: "Anjiyotensin II’nin etkilerinden biri hangisidir?", choices: ["Damarları genişletmek", "Aldosteronu artırmak ve vazokonstriksiyon", "Kan şekerini düşürmek", "Kalsiyumu düşürmek"], answerIndex: 1, tag: "RAAS" },
      { text: "Hormonların etkisinin sona ermesine katkı sağlayan olay hangisidir?", choices: ["Reseptörün kaybolması", "Hormonun yıkımı/geri alımı", "Kanın durması", "DNA’nın kopması"], answerIndex: 1, tag: "Sonlandırma" },
      { text: "Down-regulation neyi ifade eder?", choices: ["Reseptör sayısının artması", "Reseptör sayısının azalması", "Hormon sentezinin artması", "Kanın pH’ının artması"], answerIndex: 1, tag: "Reseptör Ayarı" },
      { text: "Up-regulation neyi ifade eder?", choices: ["Reseptör sayısının artması", "Reseptör sayısının azalması", "Hormonun kana karışmaması", "İdrarın artması"], answerIndex: 0, tag: "Reseptör Ayarı" },
      { text: "Hücre içine girip reseptöre bağlanan hormonlar genelde hangi etkiyi başlatır?", choices: ["İyon kanalı açıp kapama", "Transkripsiyon değişikliği", "Sinaps iletimi", "Pıhtılaşma"], answerIndex: 1, tag: "Steroid Etki" },
      { text: "Kalsiyum-fosfor dengesinde temel ikili hormonlar hangileridir?", choices: ["İnsülin-glukagon", "PTH-kalsitonin", "TSH-ACTH", "ADH-oksitosin"], answerIndex: 1, tag: "Kalsiyum" },
      { text: "PTH artınca böbrekte hangisi artma eğilimindedir?", choices: ["Kalsiyum geri emilimi", "Kalsiyum atılımı", "Su atılımı kesin artar", "Na+ atılımı kesin artar"], answerIndex: 0, tag: "PTH" },
      { text: "Kalsitonin artınca beklenen eğilim hangisidir?", choices: ["Kandan kemiğe kalsiyum geçişini destekleme", "Kalsiyumu kandan çekip artırma", "Glukozu yükseltme", "ADH’yi artırma"], answerIndex: 0, tag: "Kalsitonin" },
      { text: "D vitamini (kalsitriol) endokrin gibi davranarak en çok neyi artırır?", choices: ["Bağırsakta kalsiyum emilimi", "Kan şekerinin düşmesi", "Su atılımı", "T3 sentezi"], answerIndex: 0, tag: "D Vitamini" },
      { text: "Stres anında kan glukozunu artırma eğilimi olan hormon hangisidir?", choices: ["Kortizol", "İnsülin", "Kalsitonin", "Prolaktin"], answerIndex: 0, tag: "Stres" },
      { text: "Adrenalin artışında hangisi beklenir?", choices: ["Glikojen yıkımının artması", "Glikojen sentezinin artması", "Kan basıncının düşmesi", "Bronşların daralması"], answerIndex: 0, tag: "Adrenalin" },
      { text: "Tiroid hormon fazlalığında hangisi artma eğilimindedir?", choices: ["Bazal metabolizma hızı", "Kilo alma", "Soğuğa tolerans", "Bradikardi"], answerIndex: 0, tag: "Hipertiroidi" },
      { text: "Tiroid hormon azlığında hangisi artma eğilimindedir?", choices: ["Soğuğa hassasiyet", "Terleme artışı", "Taşikardi", "Kilo kaybı"], answerIndex: 0, tag: "Hipotiroidi" },
      { text: "Graves hastalığı genelde hangi durumla ilişkilidir?", choices: ["Otoimmün hipertiroidi", "Otoimmün hipotiroidi", "ADH eksikliği", "PTH eksikliği"], answerIndex: 0, tag: "Graves" },
      { text: "Hashimoto tiroiditi genelde hangi durumla ilişkilidir?", choices: ["Otoimmün hipotiroidi", "Otoimmün hipertiroidi", "Kortizol fazlalığı", "Adrenalin fazlalığı"], answerIndex: 0, tag: "Hashimoto" },
      { text: "İnsülin reseptörü çoğunlukla hangi tip reseptördür?", choices: ["G protein bağlı", "Tirozin kinaz reseptörü", "Nükleer reseptör", "Ligand kapılı Cl- kanalı"], answerIndex: 1, tag: "Reseptör Tipi" },
      { text: "cAMP ikinci haberci yolunu en çok hangi reseptör tipi tetikler?", choices: ["Nükleer reseptör", "G protein bağlı reseptör", "Tirozin kinaz reseptör", "Mitokondri reseptörü"], answerIndex: 1, tag: "Reseptör Tipi" },
      { text: "Hormonların etkisi neden 'doz' ile değişebilir?", choices: ["Reseptör doygunluğu ve yanıt şiddeti", "DNA renk değişimi", "Kanın pıhtılaşması", "Sinapsların yok olması"], answerIndex: 0, tag: "Doz-Yanıt" },
      { text: "Parakrin iletişime örnek hangisidir?", choices: ["Hormonun kana verilip uzak hedefe gitmesi", "Yakın hücrelere yerel etki", "Sinir aksonu ile iletim", "İdrarla taşınma"], answerIndex: 1, tag: "İletişim Türleri" },
      { text: "Otokrin iletişim ne demektir?", choices: ["Sinyalin aynı hücreyi etkilemesi", "Sinyalin uzak organa gitmesi", "Sinyalin sinirle taşınması", "Sinyalin hiç etkisi olmaması"], answerIndex: 0, tag: "İletişim Türleri" },
      { text: "Endokrin iletişim ne demektir?", choices: ["Yerel etki", "Salgının kana verilip uzak hedefe gitmesi", "Sadece sinirsel iletim", "Sadece hücre içi etki"], answerIndex: 1, tag: "İletişim Türleri" },
      { text: "Kortizol uzun vadede hangi metabolik eğilimi destekler?", choices: ["Glikoneogenez artışı", "Glikoz alımı artışı", "Hipoglisemi", "Kalsiyum emilimi artışı zorunlu"], answerIndex: 0, tag: "Kortizol" },
      { text: "Aldosteron artışıyla birlikte hangisi artma eğilimindedir?", choices: ["K+ atılımı", "K+ tutulumu", "Na+ atılımı", "Su kaybı"], answerIndex: 0, tag: "Aldosteron" },
      { text: "Hormonların bir kısmının pulsatil (atımlı) salınmasının önemi hangisidir?", choices: ["Reseptör duyarlılığını koruyabilir", "Kanı pıhtılaştırır", "İdrarı artırır", "Kasları felç eder"], answerIndex: 0, tag: "Salgılama" },
      { text: "Prostaglandinler için en uygun ifade hangisidir?", choices: ["Yerel etki gösterebilen lipid türevleri", "Sadece tiroid hormonu", "Sadece pankreas hormonu", "Sadece steroid taşıyıcısı"], answerIndex: 0, tag: "Eikosanoid" },
      { text: "Büyüme hormonunun aşırılığında (çocuk) hangi durum görülebilir?", choices: ["Cücelik", "Devlik (gigantizm)", "Guatr", "Addison"], answerIndex: 1, tag: "GH Bozukluk" },
      { text: "Büyüme hormonunun aşırılığında (erişkin) hangi durum görülebilir?", choices: ["Akromegali", "Devlik", "Kretinizm", "Hipoglisemi"], answerIndex: 0, tag: "GH Bozukluk" },
      { text: "Büyüme hormonunun yetersizliğinde (çocuk) hangi durum görülebilir?", choices: ["Cücelik", "Akromegali", "Cushing", "Graves"], answerIndex: 0, tag: "GH Bozukluk" },
      { text: "Somatotropin (GH) etkisini büyük ölçüde hangi aracıyla da gösterebilir?", choices: ["IGF-1 (somatomedin)", "EPO", "T3", "PTH"], answerIndex: 0, tag: "IGF-1" },
      { text: "Hormonların çoğunun etkisi neden 'hedef dokuya özgüdür'?", choices: ["Kanda seçici filtre vardır", "Reseptör dağılımı farklıdır", "Hormonlar sadece aynı organa gider", "Kanın sıcaklığı sabittir"], answerIndex: 1, tag: "Reseptör" },
      { text: "Hormon salgısını artıran uyaranlara en uygun örnek hangisidir?", choices: ["Kan glukozunun yükselmesi → insülin", "Kan glukozunun düşmesi → insülin", "Kalsiyum düşmesi → kalsitonin", "Su artması → ADH"], answerIndex: 0, tag: "Homeostazi" },
      { text: "Kan kalsiyumu düştüğünde hangi hormon artma eğilimindedir?", choices: ["Kalsitonin", "PTH", "İnsülin", "TSH"], answerIndex: 1, tag: "Kalsiyum" },
      { text: "Kan kalsiyumu yükseldiğinde hangi hormon artma eğilimindedir?", choices: ["PTH", "Kalsitonin", "ADH", "Glukagon"], answerIndex: 1, tag: "Kalsiyum" },
      { text: "Steroid hormonların sentezlendiği temel molekül hangisidir?", choices: ["Kolesterol", "Glikojen", "DNA", "Laktik asit"], answerIndex: 0, tag: "Steroid Köken" },
    ],
    dogruyanlis: [
      { text: "Glukagon karaciğerde glikojen yıkımını artırabilir.", answerBool: true, tag: "Pankreas" },
      { text: "Tiroksin azlığında metabolizma hızı genelde artar.", answerBool: false, tag: "Tiroit" },
      { text: "Hipofiz arka lob hormon üretmez, hipotalamustan gelen hormonları depolayıp salar.", answerBool: true, tag: "Hipofiz" },
      { text: "İnsülin genellikle kan şekerini artırma eğilimindedir.", answerBool: false, tag: "İnsülin" },
      { text: "PTH kan kalsiyumunu düşürmeye yardım eder.", answerBool: false, tag: "PTH" },
      { text: "T3/T4 artınca genelde TSH azalır (negatif geri bildirim).", answerBool: true, tag: "Feedback" }
    ],
  },

  duyu: {
    label: "Duyu Organları",
    test: [
      { text: "Gözde ışığın algılandığı tabaka hangisidir?", choices: ["Kornea", "Retina", "İris", "Mercek"], answerIndex: 1, tag: "Göz" },
      { text: "Kulakta denge ile en çok ilişkili yapı hangisidir?", choices: ["Salyangoz", "Yarım daire kanalları", "Kulak zarı", "Östaki borusu"], answerIndex: 1, tag: "Kulak" },
      { text: "Tat tomurcukları en yoğun olarak nerede bulunur?", choices: ["Diş eti", "Dil papillaları", "Yutak", "Burun epiteli"], answerIndex: 1, tag: "Tat" },
      { text: "Gözde ışığın kırılmasının en fazla olduğu yapı hangisidir?", choices: ["Mercek", "Kornea", "Retina", "İris"], answerIndex: 1, tag: "Göz-Optik" },
      { text: "Göz bebeğinin çapını ayarlayan yapı hangisidir?", choices: ["Retina", "İris", "Koroid", "Sklera"], answerIndex: 1, tag: "Göz-İris" },
      { text: "Gözde görme reseptörlerinin bulunduğu tabaka hangisidir?", choices: ["Sklera", "Retina", "Koroid", "Kornea"], answerIndex: 1, tag: "Göz-Retina" },
      { text: "Sarı benek (fovea) ile ilgili doğru ifade hangisidir?", choices: ["Kör noktanın olduğu yer", "Görme keskinliğinin en yüksek olduğu yer", "Gözde ışığı en çok kıran yer", "Göz bebeğini oluşturan yer"], answerIndex: 1, tag: "Göz-Sarı Benek" },
      { text: "Kör noktanın oluşma nedeni hangisidir?", choices: ["Merceğin opaklaşması", "Görme sinirinin çıktığı yerde reseptör olmaması", "Kornea hasarı", "İrisin pigment kaybı"], answerIndex: 1, tag: "Göz-Kör Nokta" },
      { text: "Çubuk (rod) hücrelerinin temel özelliği hangisidir?", choices: ["Renkli görme", "Loş ışıkta görme", "En net görme", "Göz bebeğini ayarlama"], answerIndex: 1, tag: "Göz-Çubuk" },
      { text: "Koni (cone) hücreleri en çok hangi işleve katkı sağlar?", choices: ["Gece görmesi", "Renkli ve ayrıntılı görme", "Gözyaşı üretimi", "Göz tansiyonu ayarı"], answerIndex: 1, tag: "Göz-Koni" },
      { text: "Renk körlüğünün temel nedeni aşağıdakilerden hangisidir?", choices: ["Çubuk hücre eksikliği", "Koni hücre veya pigment bozukluğu", "Göz bebeğinin dar olması", "Kornea kalınlığı"], answerIndex: 1, tag: "Göz-Renk" },
      { text: "Gözde odaklanmayı (akomodasyon) sağlayan temel yapı hangisidir?", choices: ["Sklera", "Mercek ve kirpiksi kas", "Koroid", "Retina"], answerIndex: 1, tag: "Göz-Akomodasyon" },
      { text: "Yakına bakarken merceğin şekli nasıl değişir?", choices: ["İncelir", "Kalınlaşır", "Tam düzleşir", "Saydamlığını kaybeder"], answerIndex: 1, tag: "Göz-Akomodasyon" },
      { text: "Miyop (uzağı görememe) için en uygun açıklama hangisidir?", choices: ["Görüntü retinanın arkasına düşer", "Görüntü retinanın önüne düşer", "Kornea hiç kırmaz", "Retina ışığa duyarsızdır"], answerIndex: 1, tag: "Göz-Kusur" },
      { text: "Hipermetrop (yakını görememe) için en uygun açıklama hangisidir?", choices: ["Görüntü retinanın önüne düşer", "Görüntü retinanın arkasına düşer", "Göz bebeği daralır", "Kör nokta büyür"], answerIndex: 1, tag: "Göz-Kusur" },
      { text: "Miyopluk hangi mercek ile düzeltilir?", choices: ["İnce kenarlı (yakınsak)", "Kalın kenarlı (ıraksak)", "Silindirik", "Renkli filtre"], answerIndex: 1, tag: "Göz-Düzeltme" },
      { text: "Hipermetropluk hangi mercek ile düzeltilir?", choices: ["Kalın kenarlı (ıraksak)", "İnce kenarlı (yakınsak)", "Polarize", "Prizma"], answerIndex: 1, tag: "Göz-Düzeltme" },
      { text: "Astigmatizmanın temel nedeni hangisidir?", choices: ["Göz merceğinin hiç esnememesi", "Kornea/mercek eğriliğinin düzensiz olması", "Retinanın yırtılması", "Göz bebeğinin büyümesi"], answerIndex: 1, tag: "Göz-Kusur" },
      { text: "Presbiyopi (yaşa bağlı yakını görememe) en çok hangi durumla ilişkilidir?", choices: ["Merceğin esnekliğinin azalması", "İrisin pigment kaybı", "Koroidin incelmesi", "Retinanın kalınlaşması"], answerIndex: 0, tag: "Göz-Kusur" },
      { text: "Katarakt için en uygun tanım hangisidir?", choices: ["Merceğin saydamlığını yitirmesi", "Retina yırtılması", "Göz bebeğinin büyümemesi", "Göz kaslarının zayıflaması"], answerIndex: 0, tag: "Göz-Hastalık" },
      { text: "Glokom (göz tansiyonu) en çok hangi durumla ilişkilidir?", choices: ["Göz içi basıncının artması", "Koni hücrelerinin artması", "Göz bebeğinin küçülmesi", "Gözyaşı üretiminin artması"], answerIndex: 0, tag: "Göz-Hastalık" },
      { text: "Gözde göz içi sıvısının (aköz hümör) temel görevi hangisidir?", choices: ["Işığı üretmek", "Beslenme ve basınca katkı", "Renk algısını sağlamak", "Görme sinirini oluşturmak"], answerIndex: 1, tag: "Göz-Sıvılar" },
      { text: "Camsı cisim (vitreus) en çok hangi işleve katkı sağlar?", choices: ["Göz küresinin şeklini koruma", "Işık kırmanın çoğunu yapma", "Göz bebeğini ayarlama", "Renk algısını sağlama"], answerIndex: 0, tag: "Göz-Sıvılar" },
      { text: "Gözde en dıştaki sert tabaka hangisidir?", choices: ["Koroid", "Sklera", "Retina", "İris"], answerIndex: 1, tag: "Göz-Tabakalar" },
      { text: "Koroid tabakasının temel özelliği hangisidir?", choices: ["Reseptör hücreleri taşır", "Damar ve pigmentçe zengindir", "Saydamdır ve ışığı kırar", "Göz bebeğini oluşturur"], answerIndex: 1, tag: "Göz-Tabakalar" },
      { text: "Göz kırpma refleksi hangi tip korunma mekanizmasına örnektir?", choices: ["Koşullu refleks", "Doğuştan refleks", "Endokrin kontrol", "Bilinçli davranış"], answerIndex: 1, tag: "Refleks" },
      { text: "Işık refleksinde göz bebeğinin küçülmesine ne denir?", choices: ["Midriyazis", "Miyozis", "Akomodasyon", "Astigmatizma"], answerIndex: 1, tag: "Göz-Refleks" },
      { text: "Kulak zarı hangi bölümler arasındadır?", choices: ["Dış kulak-orta kulak", "Orta kulak-iç kulak", "Dış kulak-iç kulak", "Koklea-yarım daire kanalları"], answerIndex: 0, tag: "Kulak-Dış/Orta" },
      { text: "Orta kulaktaki kemikçikler sırasıyla hangileridir?", choices: ["Çekiç-örs-üzengi", "Örs-çekiç-üzengi", "Üzengi-örs-çekiç", "Çekiç-üzengi-örs"], answerIndex: 0, tag: "Kulak-Kemikçikler" },
      { text: "Orta kulağın basıncını dengeleyen yapı hangisidir?", choices: ["Salyangoz", "Östaki borusu", "Yarım daire kanalları", "Korti organı"], answerIndex: 1, tag: "Kulak-Östaki" },
      { text: "Ses titreşimlerini sinir impulsuna dönüştüren yapı hangisidir?", choices: ["Kulak kepçesi", "Korti organı", "Östaki borusu", "Kulak zarı"], answerIndex: 1, tag: "Kulak-İşitme" },
      { text: "İşitme reseptörleri (tüy hücreleri) hangi yapıda bulunur?", choices: ["Yarım daire kanalları", "Koklea (salyangoz)", "Östaki borusu", "Kulak kepçesi"], answerIndex: 1, tag: "Kulak-İşitme" },
      { text: "İç kulakta denge ile en çok ilişkili yapı hangisidir?", choices: ["Koklea", "Yarım daire kanalları", "Kulak zarı", "Örs"], answerIndex: 1, tag: "Kulak-Denge" },
      { text: "Yarım daire kanalları en çok hangi hareketi algılar?", choices: ["Doğrusal hızlanma", "Başın açısal (dönme) hareketleri", "Ses şiddeti", "Tat duyusu"], answerIndex: 1, tag: "Kulak-Denge" },
      { text: "Utrikulus ve sakkulus (tulumcuk-kesecik) en çok neyi algılar?", choices: ["Açısal hızlanma", "Doğrusal hızlanma ve yerçekimi", "Ses dalgaları", "Koku molekülleri"], answerIndex: 1, tag: "Kulak-Denge" },
      { text: "İç kulakta reseptörlerin bulunduğu sıvı sistemiyle ilgili doğru ifade hangisidir?", choices: ["Endolenf yalnız dış kulakta bulunur", "Endolenf/iç, perilenf/dış boşluklarla ilişkilidir", "Perilenf sadece kanda bulunur", "Sıvılar işitmede rol oynamaz"], answerIndex: 1, tag: "Kulak-Sıvılar" },
      { text: "Kulak kepçesinin temel görevi hangisidir?", choices: ["Impuls üretmek", "Ses dalgalarını toplamak", "Basıncı dengelemek", "Dengeyi sağlamak"], answerIndex: 1, tag: "Kulak-Dış" },
      { text: "Orta kulak kemikçiklerinin temel etkisi hangisidir?", choices: ["Işığı kırmak", "Ses titreşimlerini güçlendirmek/iletmek", "Koku algılamak", "Tat algılamak"], answerIndex: 1, tag: "Kulak-Orta" },
      { text: "Üzengi kemiği titreşimi hangi yapıya aktarır?", choices: ["Kulak zarı", "Oval pencere", "Östaki borusu", "Kulak kepçesi"], answerIndex: 1, tag: "Kulak-Orta" },
      { text: "İşitmede frekans (ince-kalın ses) ayrımı en çok hangi yapıda gerçekleşir?", choices: ["Kulak kepçesi", "Baziler membran (koklea)", "Östaki borusu", "Kulak zarı"], answerIndex: 1, tag: "Kulak-Frekans" },
      { text: "Gürültüye uzun süre maruz kalma en çok hangi yapıya zarar verebilir?", choices: ["Korti organındaki tüy hücreleri", "Östaki borusu", "Kulak kepçesi", "Üzengi kemiği"], answerIndex: 0, tag: "Kulak-Sağlık" },
      { text: "Orta kulak iltihabında (otitis media) en olası sorun hangisidir?", choices: ["Denge reseptörleri artar", "Ses iletimi bozulabilir", "Koku duyusu artar", "Göz bebeği büyür"], answerIndex: 1, tag: "Kulak-Sağlık" },
      { text: "Koku reseptörleri en çok nerede bulunur?", choices: ["Dilin ucunda", "Burun boşluğundaki koku epiteli", "Kulak zarında", "Göz merceğinde"], answerIndex: 1, tag: "Koku" },
      { text: "Koku algısında reseptörler hangi tip uyaranı algılar?", choices: ["Işık", "Kimyasal moleküller", "Basınç", "Ses"], answerIndex: 1, tag: "Koku" },
      { text: "Koku duyusunun hızlı alışması (adaptasyon) neyi açıklar?", choices: ["Kokuyu hiç algılamama", "Sürekli kokuda algının azalması", "Ses şiddetinin artması", "Görme keskinliğinin artması"], answerIndex: 1, tag: "Koku-Adaptasyon" },
      { text: "Koku sinyalleri beynin hangi alanlarıyla daha güçlü ilişkilendirilebilir?", choices: ["Lenf düğümleri", "Limbik sistem (duygu-bellek)", "Böbrek", "Karaciğer"], answerIndex: 1, tag: "Koku-Bellek" },
      { text: "Koku duyusunun tat duyusunu etkilemesinin temel nedeni hangisidir?", choices: ["Tat tomurcuğu yok olur", "Koku ve tat birlikte lezzet algısı oluşturur", "Koku sadece görmeyi etkiler", "Tat sinirleri kesilir"], answerIndex: 1, tag: "Koku-Tat" },
      { text: "Tat tomurcukları en çok hangi yapıda bulunur?", choices: ["Diş minesinde", "Dil papillalarında", "Özofagusta", "Retinada"], answerIndex: 1, tag: "Tat" },
      { text: "Aşağıdakilerden hangisi temel tatlardan biridir?", choices: ["Metal", "Umami", "Kömür", "Asitlik dışı"], answerIndex: 1, tag: "Tat" },
      { text: "Tat duyusu reseptörleri hangi tiptir?", choices: ["Fotoreseptör", "Kemoreseptör", "Termoreseptör", "Proprioseptör"], answerIndex: 1, tag: "Tat-Kemoreseptör" },
      { text: "Tat algısının azalmasına en çok hangisi neden olabilir?", choices: ["Burun tıkanıklığı", "Gözlük takmak", "Kulağın çınlaması", "Kas yorgunluğu"], answerIndex: 0, tag: "Tat-Koku" },
      { text: "Dil yüzeyindeki papillalarla ilgili doğru ifade hangisidir?", choices: ["Tat tomurcuğu içermez", "Bazıları tat tomurcuğu taşır", "Sadece kemiktir", "Sadece sinir dokudur"], answerIndex: 1, tag: "Tat-Papilla" },
      { text: "Ağız kuruluğu tat algısını neden azaltabilir?", choices: ["Tükürük tat maddelerini çözemez", "Tükürük ışığı kırar", "Tükürük ses iletir", "Tükürük koku reseptörüdür"], answerIndex: 0, tag: "Tat-Tükürük" },
      { text: "Deri ile ilgili temel doğru hangisidir?", choices: ["Sadece koruyucudur", "Çok sayıda duyu reseptörü içerir", "Sadece kemikten oluşur", "Sadece kas içerir"], answerIndex: 1, tag: "Deri" },
      { text: "Aşağıdakilerden hangisi dokunma ile ilgili reseptörlere örnektir?", choices: ["Çubuk hücre", "Meissner cisimciği", "Korti organı", "Koku epiteli"], answerIndex: 1, tag: "Deri-Dokunma" },
      { text: "Deride basınç/titreşim algısında en çok hangisi rol alır?", choices: ["Paccini cisimciği", "Koni hücresi", "Üzengi", "Sarı benek"], answerIndex: 0, tag: "Deri-Basınç" },
      { text: "Deride sıcak-soğuk algısı hangi reseptör tipiyle ilişkilidir?", choices: ["Fotoreseptör", "Termoreseptör", "Kemoreseptör", "Baroreseptör"], answerIndex: 1, tag: "Deri-Isı" },
      { text: "Ağrı algısında en çok hangi reseptörler rol alır?", choices: ["Koni hücreleri", "Serbest sinir uçları", "Korti tüy hücreleri", "Tat tomurcuğu"], answerIndex: 1, tag: "Deri-Ağrı" },
      { text: "Deri rengi (melanin) ile ilgili en uygun ifade hangisidir?", choices: ["Sadece deride su tutar", "UV’ye karşı korumada rol alır", "Ses dalgasını iletir", "Tat algısını artırır"], answerIndex: 1, tag: "Deri-Melanin" },
      { text: "Ter bezlerinin temel görevi hangisidir?", choices: ["Koku algılamak", "Vücut ısısının düzenlenmesine yardım", "Işığı kırmak", "Kanı pıhtılaştırmak"], answerIndex: 1, tag: "Deri-Ter" },
      { text: "Kılcal damarların derideki rolü için en uygun seçenek hangisidir?", choices: ["Işığı kırmak", "Isı kaybı/korunmasına katkı (vazodilatasyon-vazokonstriksiyon)", "Ses iletmek", "Tat maddesini çözmek"], answerIndex: 1, tag: "Deri-Isı" },
      { text: "Duyu reseptörlerinin ortak yaptığı temel işlem hangisidir?", choices: ["Protein sentezini durdurmak", "Uyaranı sinir impulsuna dönüştürmek", "Kanı filtrelemek", "Safra üretmek"], answerIndex: 1, tag: "Fizyoloji-Transdüksiyon" },
      { text: "Reseptör potansiyeli için doğru ifade hangisidir?", choices: ["Ya hep ya hiçtir", "Şiddete bağlı dereceli değişebilir", "Sadece kaslarda olur", "Her zaman aynı büyüklüktedir"], answerIndex: 1, tag: "Fizyoloji-Reseptör Pot." },
      { text: "Aksiyon potansiyeli için doğru ifade hangisidir?", choices: ["Derecelidir", "Ya hep ya hiç kuralına uyar", "Sadece kemikte oluşur", "Sadece retinada oluşur"], answerIndex: 1, tag: "Fizyoloji-AP" },
      { text: "Uyaran şiddeti arttıkça sinir sisteminde genelde ne artar?", choices: ["Aksiyon potansiyeli genliği", "İmpuls frekansı", "Miyelin rengi", "Kör nokta sayısı"], answerIndex: 1, tag: "Fizyoloji-Frekans" },
      { text: "Adaptasyon kavramı en iyi hangi durumu açıklar?", choices: ["Uyaranın hiç oluşmaması", "Sürekli uyaranla reseptör duyarlılığının azalması", "Gözün merceğinin büyümesi", "Kulağın kemikçiklerinin çoğalması"], answerIndex: 1, tag: "Fizyoloji-Adaptasyon" },
      { text: "Duyu nöronlarının hücre gövdeleri çoğunlukla nerede bulunur?", choices: ["Kas liflerinde", "Ganglionlarda", "Alveollerde", "Glomerüllerde"], answerIndex: 1, tag: "Fizyoloji-Ganglion" },
      { text: "Özel duyulara örnek hangisidir?", choices: ["Kan basıncı", "Görme", "Kan şekeri", "Kan pH’ı"], answerIndex: 1, tag: "Özel Duyu" },
      { text: "Genel duyulara örnek hangisidir?", choices: ["Görme", "İşitme", "Dokunma", "Koku"], answerIndex: 2, tag: "Genel Duyu" },
      { text: "Göz merceği hangi yapı tarafından asılı tutulur?", choices: ["Kirpiksi bağlar (zonula lifleri)", "Görme siniri", "Koroid damarları", "Gözyaşı kanalı"], answerIndex: 0, tag: "Göz-Anatomi" },
      { text: "Kirpiksi kas kasıldığında mercek ne yapar?", choices: ["İncelir", "Kalınlaşır", "Saydamlığını kaybeder", "Retinaya yapışır"], answerIndex: 1, tag: "Göz-Akomodasyon" },
      { text: "Gözyaşı bezinin temel görevi hangisidir?", choices: ["Işığı kırmak", "Gözü nemlendirmek ve temizlemek", "Renk algılamak", "Göz içi basıncını artırmak"], answerIndex: 1, tag: "Göz-Gözyaşı" },
      { text: "Görme siniri hangi tabakadan çıkan liflerle oluşur?", choices: ["Kornea", "Retina ganglion hücreleri", "Sklera", "İris"], answerIndex: 1, tag: "Göz-Sinir" },
      { text: "Retinanın görevi en doğru nasıl özetlenir?", choices: ["Ses titreşimi üretmek", "Işığı elektriksel sinyale çevirmek", "Basıncı dengelemek", "Koku molekülü yakalamak"], answerIndex: 1, tag: "Göz-Retina" },
      { text: "Loş ışıkta görme azalmasının nedeni en uygun hangisidir?", choices: ["Koni hücreleri çalışmaz", "Çubuk hücreleri düşük ışığa duyarlıdır ama renk algılamaz", "İris yok olur", "Kornea ışığı hiç kırmaz"], answerIndex: 1, tag: "Göz-Çubuk" },
      { text: "Parlak ışıkta daha net ve renkli görmenin temel nedeni hangisidir?", choices: ["Çubukların artması", "Konilerin etkinleşmesi", "BOS artışı", "Östaki borusunun açılması"], answerIndex: 1, tag: "Göz-Koni" },
      { text: "Gözde ışığın retinaya düşmesini sağlayan optik sistemin ana parçaları hangileridir?", choices: ["Kornea ve mercek", "İris ve retina", "Sklera ve koroid", "Gözyaşı ve vitrus"], answerIndex: 0, tag: "Göz-Optik" },
      { text: "Sesin kokleada algılanmaya başlaması için titreşim hangi pencereyi hareket ettirir?", choices: ["Yuvarlak pencere", "Oval pencere", "Göz bebeği", "Kör nokta"], answerIndex: 1, tag: "Kulak-İşitme" },
      { text: "Yuvarlak pencerenin temel görevi hangisidir?", choices: ["Basıncı dengeleyerek sıvı hareketini kolaylaştırmak", "Ses toplamak", "Dengeyi sağlamak", "Koku algılamak"], answerIndex: 0, tag: "Kulak-İşitme" },
      { text: "Denge reseptörleri hangi yapılarla daha çok ilişkilidir?", choices: ["Korti organı", "Yarım daire kanalları ve utrikulus/sakkulus", "Örs-çekiç", "Kulak kepçesi"], answerIndex: 1, tag: "Kulak-Denge" },
      { text: "Östaki borusunun tıkanması en çok neyi bozar?", choices: ["Orta kulak basınç dengesi", "Retina uyarımı", "Tat algısı", "Deri terlemesi"], answerIndex: 0, tag: "Kulak-Östaki" },
      { text: "Kulakta işitme kaybının 'iletim tipi' olmasına en uygun örnek hangisidir?", choices: ["Kulak zarı hasarı", "Korti tüy hücresi ölümü", "İşitme siniri hasarı", "Beyin korteksi hasarı"], answerIndex: 0, tag: "Kulak-İşitme Kaybı" },
      { text: "Kulakta 'sinirsel tipi' işitme kaybına en uygun örnek hangisidir?", choices: ["Kulak kiri", "Östaki tıkanması", "Korti organı tüy hücre hasarı", "Kulak zarı delinmesi"], answerIndex: 2, tag: "Kulak-İşitme Kaybı" },
      { text: "Tat tomurcukları uyarıldığında oluşan sinyal hangi tiptir?", choices: ["Fotokimyasal", "Kimyasal → sinirsel impuls", "Mekanik → ışık", "Elektrik → koku"], answerIndex: 1, tag: "Tat-Fizyoloji" },
      { text: "Koku alma sırasında moleküllerin algılanması için hangisi gerekir?", choices: ["Moleküllerin mukusta çözünmesi", "Moleküllerin mercekte toplanması", "Moleküllerin kulak zarına çarpması", "Moleküllerin skleraya bağlanması"], answerIndex: 0, tag: "Koku" },
      { text: "Koku duyusunun hızlı adaptasyonu hangi durumla sonuçlanabilir?", choices: ["Bir süre sonra kokuyu az hissetme", "Renk körlüğü", "İşitme artışı", "Terleme durması"], answerIndex: 0, tag: "Koku-Adaptasyon" },
      { text: "Umami tadı en çok hangi besinlerle ilişkilidir?", choices: ["Saf şeker", "Protein/amino asit (glutamat) içeriği yüksek gıdalar", "Saf su", "Tuzsuz gıdalar"], answerIndex: 1, tag: "Tat-Umami" },
      { text: "Meissner cisimciği daha çok hangi duyuyla ilişkilidir?", choices: ["Hafif dokunma", "Ağır basınç", "Koku", "İşitme"], answerIndex: 0, tag: "Deri-Reseptör" },
      { text: "Paccini cisimciği daha çok hangi duyuyla ilişkilidir?", choices: ["Hafif dokunma", "Derin basınç/titreşim", "Tat", "Renk"], answerIndex: 1, tag: "Deri-Reseptör" },
      { text: "Merkel diskleri en çok hangi duyuyla ilişkilidir?", choices: ["Basınç ve doku algısı", "Koku", "İşitme", "Görme"], answerIndex: 0, tag: "Deri-Reseptör" },
      { text: "Ruffini cisimciği en çok hangi duyuyla ilişkilidir?", choices: ["Derinin gerilmesi", "Renk algısı", "Ses şiddeti", "Tat"], answerIndex: 0, tag: "Deri-Reseptör" },
      { text: "Termoregülasyonda terleme artışı genelde neyi sağlar?", choices: ["Isı kaybını artırır", "Isı kaybını azaltır", "Kalsiyumu artırır", "Kan şekerini düşürür"], answerIndex: 0, tag: "Deri-Isı" },
      { text: "Soğukta deride vazokonstriksiyonun amacı hangisidir?", choices: ["Isı kaybını azaltmak", "Isı kaybını artırmak", "Dengeyi artırmak", "Tat algısını artırmak"], answerIndex: 0, tag: "Deri-Isı" },
      { text: "Sıcakta deride vazodilatasyonun amacı hangisidir?", choices: ["Isı kaybını artırmak", "Isı kaybını azaltmak", "Koku algısını azaltmak", "Görmeyi netleştirmek"], answerIndex: 0, tag: "Deri-Isı" },
      { text: "Uyarının beyne iletilmesinde ortak yol hangisidir?", choices: ["Hormonlarla taşınma", "Duyu nöronlarıyla impuls iletimi", "Lenfle taşınma", "Safrayla taşınma"], answerIndex: 1, tag: "Fizyoloji" },
      { text: "Duyu organlarında reseptörlerin seçici olması neye bağlıdır?", choices: ["Her reseptörün her uyaranı algılaması", "Uyaran tipine uygun reseptör yapısı", "Kanın rengine", "Kasların gücüne"], answerIndex: 1, tag: "Fizyoloji" },
      { text: "Görme ve işitmenin ortak yönü hangisidir?", choices: ["İkisi de kemoreseptördür", "İkisi de uyarıyı sinirsel impulsa çevirir", "İkisi de sadece deride olur", "İkisi de hormonla taşınır"], answerIndex: 1, tag: "Karşılaştırma" },
      { text: "Tat ve koku duyularının ortak reseptör tipi hangisidir?", choices: ["Fotoreseptör", "Kemoreseptör", "Termoreseptör", "Mekanoreseptör"], answerIndex: 1, tag: "Karşılaştırma" },
      { text: "Dokunma ve işitmenin ortak reseptör tipi hangisidir?", choices: ["Kemoreseptör", "Mekanoreseptör", "Fotoreseptör", "Osmoreseptör"], answerIndex: 1, tag: "Karşılaştırma" },
      { text: "Gözde ışığın retinaya ulaşmasını engelleyen en olası durum hangisidir?", choices: ["Kornea saydamlığı azalması", "Skleranın kalınlaşması", "Koroidin damarlaşması", "Retinanın reseptör artışı"], answerIndex: 0, tag: "Göz-Sağlık" },
      { text: "Göz kapağının refleks olarak kapanması hangi amaçla olur?", choices: ["İşitmeyi artırmak", "Gözü yabancı cisim/ışığa karşı korumak", "Koku algısını artırmak", "Dengeyi sağlamak"], answerIndex: 1, tag: "Göz-Korunma" },
      { text: "Dış kulakta ses dalgasını kulak zarına yönlendiren yapı hangisidir?", choices: ["Kulak kepçesi ve kulak yolu", "Koklea", "Östaki borusu", "Yarım daire kanalları"], answerIndex: 0, tag: "Kulak-Dış" },
      { text: "İç kulakta denge bilgisinin beyne iletilmesi hangi sinirle olur?", choices: ["Görme siniri", "İşitme-denge siniri (vestibulokoklear)", "Koku siniri", "Tat siniri"], answerIndex: 1, tag: "Kulak-Sinir" },
      { text: "Kulakta denge bozukluğu en çok hangi belirtiyi yapar?", choices: ["Baş dönmesi", "Renk körlüğü", "Tat kaybı", "Ciltte morarma"], answerIndex: 0, tag: "Kulak-Denge" },
      { text: "Dilde tat algısında en kritik şey hangisidir?", choices: ["Işığın şiddeti", "Tat maddesinin çözünmesi ve reseptöre bağlanması", "Basıncın artması", "Ses dalgası"], answerIndex: 1, tag: "Tat" },
      { text: "Koku duyusunda reseptörlerin bulunduğu bölgenin zarar görmesi en çok neye yol açar?", choices: ["Tat artışı", "Koku kaybı/azalması", "Görme artışı", "İşitme artışı"], answerIndex: 1, tag: "Koku" },
      { text: "Deride ağrı duyusunun hızlı iletiminde hangi lifler daha çok rol oynar?", choices: ["Kalın miyelinli lifler", "İnce miyelinsiz lifler", "Sadece hormonlar", "Sadece kan damarları"], answerIndex: 0, tag: "Deri-Ağrı" },
      { text: "Deride yavaş, künt ağrıda hangi lif tipi daha çok rol oynar?", choices: ["Kalın miyelinli", "İnce miyelinsiz", "Fotoreseptör", "Kemoreseptör"], answerIndex: 1, tag: "Deri-Ağrı" },
      { text: "Duyu organlarında 'eşik' kavramı neyi ifade eder?", choices: ["Algılanabilecek minimum uyaran şiddeti", "Maksimum ses", "Maksimum ışık", "Tatların sayısı"], answerIndex: 0, tag: "Fizyoloji-Eşik" },
      { text: "Gözde görüntü hangi tip mercek sistemiyle retinaya düşürülür?", choices: ["Yakınsak sistem", "Iraksak sistem", "Prizma", "Polarize filtre"], answerIndex: 0, tag: "Göz-Optik" },
      { text: "Gözde görüntünün retinaya ters düşmesi neyi gerektirir?", choices: ["Beynin yorumlayarak düz algılamasını", "Görüntünün hiç algılanmamasını", "Renk körlüğünü", "Kulak denge bozukluğunu"], answerIndex: 0, tag: "Göz-Beyin" },
      { text: "Kulakta sesin elektriksel sinyale çevrildiği yer hangisidir?", choices: ["Kulak yolu", "Korti organı", "Örs", "Östaki"], answerIndex: 1, tag: "Kulak-İşitme" },
      { text: "Kokleada hasar en çok hangi duyuyu etkiler?", choices: ["Denge", "İşitme", "Tat", "Dokunma"], answerIndex: 1, tag: "Kulak-Koklea" },
      { text: "Yarım daire kanallarında hasar en çok hangi duyuyu etkiler?", choices: ["İşitme", "Denge", "Tat", "Koku"], answerIndex: 1, tag: "Kulak-Denge" },
      { text: "Tat tomurcuğu hasarı en çok hangi duyuyu etkiler?", choices: ["Görme", "Tat", "İşitme", "Denge"], answerIndex: 1, tag: "Tat" },
      { text: "Koku epiteli hasarı en çok hangi duyuyu etkiler?", choices: ["Koku", "Görme", "Basınç", "Denge"], answerIndex: 0, tag: "Koku" },
      { text: "Paccini cisimciği hangi uyaranı algılar?", choices: ["Işık", "Titreşim/derin basınç", "Kimyasal", "Tat"], answerIndex: 1, tag: "Deri-Reseptör" },
      { text: "Fotoreseptörler hangi duyu organına aittir?", choices: ["Kulak", "Göz", "Deri", "Dil"], answerIndex: 1, tag: "Göz" },
      { text: "Kemoreseptörler en çok hangi duyu organlarında bulunur?", choices: ["Göz-kulak", "Tat-koku", "Deri-göz", "Kulak-deri"], answerIndex: 1, tag: "Kemoreseptör" },
    ],
    dogruyanlis: [
      { text: "İris, göz bebeğinin çapını ayarlayarak göze giren ışık miktarını düzenler.", answerBool: true, tag: "Göz" },
      { text: "Östaki borusu, orta kulak basıncını dengelemeye yardım eder.", answerBool: true, tag: "Kulak" },
      { text: "Kornea, gözde ışığın kırılmasına en fazla katkı sağlayan yapılardan biridir.", answerBool: true, tag: "Göz" },
      { text: "Kör noktada fotoreseptör bulunmadığı için görüntü oluşmaz.", answerBool: true, tag: "Göz" },
      { text: "Miyoplukta görüntü retinanın arkasına düşer.", answerBool: false, tag: "Göz" },
      { text: "Korti organı denge reseptörlerini içerir.", answerBool: false, tag: "Kulak" },
      { text: "Tat ve koku duyuları kemoreseptörlerle çalışır.", answerBool: true, tag: "Tat-Koku" },
      { text: "Serbest sinir uçları ağrı duyusunun algılanmasında rol alır.", answerBool: true, tag: "Deri" },
      { text: "Paccini cisimciği hafif dokunmayı algılar.", answerBool: false, tag: "Deri" }
    ],
  },

  destek_hareket: {
    label: "Destek ve Hareket Sistemi",
    test: [
      { text: "Kemiklerde boyuna uzamayı sağlayan yapı hangisidir?", choices: ["Kıkırdak doku (epifiz plağı)", "Sert kemik doku", "Tendon", "Periost"], answerIndex: 0, tag: "İskelet" },
      { text: "Kasların kemiğe bağlanmasını sağlayan yapı hangisidir?", choices: ["Ligament", "Tendon", "Kıkırdak", "Fasya"], answerIndex: 1, tag: "Kas" },
      { text: "Eklem sıvısının temel görevi hangisidir?", choices: ["Oksijen taşımak", "Sürtünmeyi azaltmak", "Hormon taşımak", "Sinir iletmek"], answerIndex: 1, tag: "Eklem" },
      { text: "Destek ve hareket sisteminin temel bileşenleri hangileridir?", choices: ["Kemik-kas-eklem", "Akciğer-kalp-damar", "Böbrek-karaciğer-mide", "Beyin-omurilik-sinir"], answerIndex: 0, tag: "Genel" },
      { text: "Kemik dokunun temel görevi hangisidir?", choices: ["Hormon üretmek", "Destek sağlamak ve organları korumak", "Besinleri emmek", "Görme sağlamak"], answerIndex: 1, tag: "Kemik-Genel" },
      { text: "Kemiğe sertlik kazandıran temel mineral hangisidir?", choices: ["Sodyum", "Kalsiyum fosfat", "Demir", "İyot"], answerIndex: 1, tag: "Kemik-Mineral" },
      { text: "Kemiğe esneklik kazandıran organik madde hangisidir?", choices: ["Kollajen (ossein)", "Glikojen", "Hemoglobin", "Keratin"], answerIndex: 0, tag: "Kemik-Organik" },
      { text: "Kemik yapımından (osteogenez) sorumlu hücre hangisidir?", choices: ["Osteoklast", "Osteoblast", "Kondrosit", "Eritrosit"], answerIndex: 1, tag: "Kemik-Hücre" },
      { text: "Kemik yıkımından sorumlu hücre hangisidir?", choices: ["Osteoblast", "Osteoklast", "Miyosit", "Nöron"], answerIndex: 1, tag: "Kemik-Hücre" },
      { text: "Kemik dokuda olgun kemik hücresine ne denir?", choices: ["Osteosit", "Kondrosit", "Fibroblast", "Makrofaj"], answerIndex: 0, tag: "Kemik-Hücre" },
      { text: "Uzun kemiklerin dışını saran zar hangisidir?", choices: ["Periost", "Perikard", "Plevra", "Meninges"], answerIndex: 0, tag: "Kemik-Periost" },
      { text: "Periostun en önemli işlevlerinden biri hangisidir?", choices: ["Kas kasılmasını başlatmak", "Kemiğin beslenmesi ve onarımı", "Kanı filtrelemek", "Hormon salgılamak"], answerIndex: 1, tag: "Kemik-Periost" },
      { text: "Kemik iliğinin temel görevlerinden biri hangisidir?", choices: ["Safra üretmek", "Kan hücresi üretmek", "İdrar oluşturmak", "Sinir impulsu iletmek"], answerIndex: 1, tag: "Kemik-İlik" },
      { text: "Sarı kemik iliğiyle ilgili doğru ifade hangisidir?", choices: ["Kan hücresi üretimi fazladır", "Yağ depolama fazladır", "Sadece kafatasında bulunur", "Kıkırdak üretir"], answerIndex: 1, tag: "Kemik-İlik" },
      { text: "Kırmızı kemik iliğiyle ilgili doğru ifade hangisidir?", choices: ["Yağ depolar", "Kan hücresi üretimi yapar", "Sadece uzun kemiklerin ortasında bulunur", "Kas liflerinden oluşur"], answerIndex: 1, tag: "Kemik-İlik" },
      { text: "Havers kanalı sistemi en çok hangi kemik türünde belirgindir?", choices: ["Süngerimsi kemik", "Sıkı (kompakt) kemik", "Kıkırdak", "Tendon"], answerIndex: 1, tag: "Kemik-Yapı" },
      { text: "Süngerimsi kemik dokunun en belirgin özelliği hangisidir?", choices: ["Tamamen doludur", "Boşluklu/Trabeküllü yapı", "Havers sistemi yoktur", "Kollajen içermez"], answerIndex: 1, tag: "Kemik-Yapı" },
      { text: "Uzun kemiklerde ekleme yakın uç kısma ne denir?", choices: ["Diafiz", "Epifiz", "Periost", "Medulla"], answerIndex: 1, tag: "Kemik-Anatomi" },
      { text: "Uzun kemiklerde gövde kısmına ne denir?", choices: ["Epifiz", "Diafiz", "Metafiz", "Kıkırdak"], answerIndex: 1, tag: "Kemik-Anatomi" },
      { text: "Kemiklerin boyuna uzamasında görevli yapı hangisidir?", choices: ["Epifiz plağı (büyüme kıkırdağı)", "Periost", "Tendon", "Bağ"], answerIndex: 0, tag: "Kemik-Büyüme" },
      { text: "Kemiklerin enine (kalınlaşarak) büyümesinde en etkili yapı hangisidir?", choices: ["Periost", "Epifiz plağı", "Menisküs", "Disk"], answerIndex: 0, tag: "Kemik-Büyüme" },
      { text: "Kırık iyileşmesinde ilk oluşan geçici bağ dokusu/kıkırdak benzeri yapı hangisidir?", choices: ["Kallus", "Sinovya", "Havers", "Miyofibril"], answerIndex: 0, tag: "Kemik-Onarım" },
      { text: "Kemiğin onarım hızını artıran faktörlerden biri hangisidir?", choices: ["Dolaşımın iyi olması", "Hareketsizliğin hiç olmaması", "Kalsiyumun hiç alınmaması", "Periostun yokluğu"], answerIndex: 0, tag: "Kemik-Onarım" },
      { text: "Kıkırdak dokunun temel özelliği hangisidir?", choices: ["Damarlanması çok iyidir", "Esnek destek sağlar, damarlanması sınırlıdır", "Kemikten daha serttir", "Sinir hücresi taşır"], answerIndex: 1, tag: "Kıkırdak" },
      { text: "Kıkırdak hücresine ne ad verilir?", choices: ["Osteosit", "Kondrosit", "Eritrosit", "Nöron"], answerIndex: 1, tag: "Kıkırdak" },
      { text: "Eklem yüzeylerinde bulunan kıkırdak tipi hangisidir?", choices: ["Hiyalin kıkırdak", "Elastik kıkırdak", "Fibröz kıkırdak", "Kemik doku"], answerIndex: 0, tag: "Kıkırdak" },
      { text: "Kulak kepçesinde bulunan kıkırdak tipi hangisidir?", choices: ["Hiyalin", "Elastik", "Fibröz", "Sıkı kemik"], answerIndex: 1, tag: "Kıkırdak" },
      { text: "Omurlar arası disklerde bulunan kıkırdak tipi hangisidir?", choices: ["Elastik", "Fibröz", "Hiyalin", "Süngerimsi kemik"], answerIndex: 1, tag: "Kıkırdak" },
      { text: "Kasların kemiğe bağlandığı yapı hangisidir?", choices: ["Bağ (ligament)", "Tendon", "Kıkırdak", "Menisküs"], answerIndex: 1, tag: "Kas-Tendon" },
      { text: "Kemiklerin birbirine bağlandığı yapı hangisidir?", choices: ["Tendon", "Bağ (ligament)", "Fasya", "Miyelin"], answerIndex: 1, tag: "Eklem-Bağ" },
      { text: "İskelet kası hangi kontrol altındadır?", choices: ["İstemli", "İstemsiz", "Otonom", "Endokrin"], answerIndex: 0, tag: "Kas-Tip" },
      { text: "Düz kasların kontrolü genellikle nasıldır?", choices: ["İstemli", "İstemsiz", "Sadece refleks", "Sadece bilinçli"], answerIndex: 1, tag: "Kas-Tip" },
      { text: "Kalp kası ile ilgili doğru ifade hangisidir?", choices: ["İstemlidir", "Çizgili ama istemsizdir", "Çizgisiz ve istemlidir", "Kıkırdak içerir"], answerIndex: 1, tag: "Kas-Tip" },
      { text: "İskelet kasında kasılmayı başlatan iyon hangisidir?", choices: ["Na+", "Ca2+", "Cl-", "I-"], answerIndex: 1, tag: "Kas-Fizyoloji" },
      { text: "İskelet kasında ince filamentin temel proteini hangisidir?", choices: ["Miyozin", "Aktin", "Keratin", "Elastin"], answerIndex: 1, tag: "Kas-Sarkomer" },
      { text: "İskelet kasında kalın filamentin temel proteini hangisidir?", choices: ["Aktin", "Miyozin", "Kollajen", "Fibrin"], answerIndex: 1, tag: "Kas-Sarkomer" },
      { text: "Tropomiyozin-troponin kompleksi hangi filamentte bulunur?", choices: ["Kalın", "İnce", "Her ikisi", "Hiçbiri"], answerIndex: 1, tag: "Kas-Sarkomer" },
      { text: "Kas kasılmasında ATP en doğrudan hangi işlem için gerekir?", choices: ["Miyozinin aktinden ayrılması", "Kalsiyumun artması", "Oksijenin bağlanması", "Glikojenin depolanması"], answerIndex: 0, tag: "Kas-ATP" },
      { text: "Sarkomerin kısalması sırasında hangi bant daralır?", choices: ["A bandı", "I bandı", "A bandı genişler", "Hiçbiri değişmez"], answerIndex: 1, tag: "Kas-Sarkomer" },
      { text: "Kas kasılmasında A bandının uzunluğu genelde nasıl değişir?", choices: ["Kısalır", "Değişmez", "Uzar", "Tam kaybolur"], answerIndex: 1, tag: "Kas-Sarkomer" },
      { text: "Kas kasılmasında H bandı genelde nasıl değişir?", choices: ["Genişler", "Daralır", "Değişmez", "Uzar"], answerIndex: 1, tag: "Kas-Sarkomer" },
      { text: "Kas kasılmasında Z çizgileri arası mesafe nasıl değişir?", choices: ["Artar", "Azalır", "Değişmez", "Kemiğe dönüşür"], answerIndex: 1, tag: "Kas-Sarkomer" },
      { text: "Kas kasılmasında kayma iplikçik (sliding filament) teorisi neyi açıklar?", choices: ["Kemik büyümesi", "Aktin ve miyozinin birbirinin üzerinden kayması", "Sinir iletimi", "Hormon salgısı"], answerIndex: 1, tag: "Kas-Teori" },
      { text: "İskelet kasında sinir-kas birleşim yerine ne ad verilir?", choices: ["Sinaps", "Nöromüsküler kavşak", "Ganglion", "Koroid"], answerIndex: 1, tag: "Kas-Sinir" },
      { text: "Nöromüsküler kavşakta salınan temel nörotransmiter hangisidir?", choices: ["Dopamin", "Asetilkolin", "Serotonin", "GABA"], answerIndex: 1, tag: "Kas-Sinir" },
      { text: "Kasın gevşemesi için Ca2+ hangi yapıya geri pompalanır?", choices: ["Mitokondri", "Sarkoplazmik retikulum", "Golgi", "Lizozom"], answerIndex: 1, tag: "Kas-Fizyoloji" },
      { text: "Kas lifine uyarının yayılmasını sağlayan yapılar hangileridir?", choices: ["T-tübüller", "Havers kanalı", "Alveoller", "Villuslar"], answerIndex: 0, tag: "Kas-Fizyoloji" },
      { text: "Kasın kasılma gücünü artıran durumlardan biri hangisidir?", choices: ["Motor ünite sayısının artması (daha çok lifin devreye girmesi)", "ATP’nin bitmesi", "Ca2+’un hiç salınmaması", "Sinir iletiminin durması"], answerIndex: 0, tag: "Kas-Güç" },
      { text: "Motor ünite nedir?", choices: ["Bir kemik parçası", "Bir motor nöron ve uyardığı kas lifleri", "Bir tendon ve bağ", "Bir eklem boşluğu"], answerIndex: 1, tag: "Kas-Motor Ünite" },
      { text: "Hassas hareket gerektiren kaslarda motor ünite nasıl olur?", choices: ["Büyük (çok lifli)", "Küçük (az lifli)", "Hiç olmaz", "Sadece kalpte olur"], answerIndex: 1, tag: "Kas-Motor Ünite" },
      { text: "Kasın yorulmasında (fatigue) en olası etkenlerden biri hangisidir?", choices: ["Enerji kaynaklarının azalması ve metabolit birikimi", "Kemiğin uzaması", "Sinovya artışı", "Kıkırdağın kemikleşmesi"], answerIndex: 0, tag: "Kas-Yorgunluk" },
      { text: "Laktik asit birikimi daha çok hangi koşulda artar?", choices: ["Aerobik solunum", "Anaerobik koşullar", "Fotosentez", "Protein sentezi"], answerIndex: 1, tag: "Kas-Enerji" },
      { text: "Kas hücresinde oksijen depolayan pigment hangisidir?", choices: ["Hemoglobin", "Miyoglobin", "Melanin", "Keratin"], answerIndex: 1, tag: "Kas-Miyoglobin" },
      { text: "Kaslarda hızlı enerji için depolanan molekül hangisidir?", choices: ["Glikojen", "DNA", "Safra", "Üre"], answerIndex: 0, tag: "Kas-Enerji" },
      { text: "Kreatin fosfatın görevi hangisidir?", choices: ["Uzun süreli enerji deposu", "Hızlı ATP yenileme tamponu", "Kalsiyum depolama", "Kas lifini uzatma"], answerIndex: 1, tag: "Kas-Enerji" },
      { text: "Aerobik solunum kas için ne sağlar?", choices: ["Daha az ATP", "Daha fazla ATP", "Hiç ATP", "Sadece laktik asit"], answerIndex: 1, tag: "Kas-Enerji" },
      { text: "Kas kasılmasında 'ısınma' (warm-up) neden yararlı olabilir?", choices: ["Eklem sıvısını azaltır", "Kas ve bağ dokunun esnekliğini artırabilir", "Kalsiyumu bitirir", "Kemiği eritir"], answerIndex: 1, tag: "Spor" },
      { text: "Kas kramplarının olası nedenlerinden biri hangisidir?", choices: ["Elektrolit dengesizliği", "Kemiğin uzaması", "Tendonun kemikleşmesi", "Göz merceğinin kalınlaşması"], answerIndex: 0, tag: "Kas-Kramp" },
      { text: "Eklem (joint) için en doğru ifade hangisidir?", choices: ["Kemiklerin birleşim noktası", "Kasın bağlandığı yer", "Sinirin çıktığı yer", "Kıkırdağın büyüdüğü yer"], answerIndex: 0, tag: "Eklem" },
      { text: "Oynamaz eklemlere örnek hangisidir?", choices: ["Diz", "Kalça", "Kafatası sütürleri", "Dirsek"], answerIndex: 2, tag: "Eklem-Tip" },
      { text: "Yarı oynar eklemlere örnek hangisidir?", choices: ["Omurlar arası", "Omuz", "Diz", "Parmak"], answerIndex: 0, tag: "Eklem-Tip" },
      { text: "Oynar eklemlerde hareketi kolaylaştıran sıvı hangisidir?", choices: ["BOS", "Sinovya", "Safra", "İdrar"], answerIndex: 1, tag: "Eklem-Sıvı" },
      { text: "Menisküs en çok hangi eklemde bulunur?", choices: ["Diz", "Dirsek", "Kafatası", "Çene"], answerIndex: 0, tag: "Eklem-Menisküs" },
      { text: "Burkulma (sprain) en çok hangi yapının zorlanmasıdır?", choices: ["Tendon", "Ligament (bağ)", "Kas lifi", "Kemik iliği"], answerIndex: 1, tag: "Sakatlık" },
      { text: "Zorlanma/gerilme (strain) en çok hangi yapıyla ilişkilidir?", choices: ["Tendon/kas", "Ligament", "Kıkırdak", "Kemik zarı"], answerIndex: 0, tag: "Sakatlık" },
      { text: "Çıkık (dislokasyon) için en uygun tanım hangisidir?", choices: ["Kemik kırılması", "Eklem yüzlerinin yer değiştirmesi", "Kasın yırtılması", "Kıkırdağın kemikleşmesi"], answerIndex: 1, tag: "Sakatlık" },
      { text: "Kırık (fraktür) için en uygun tanım hangisidir?", choices: ["Kasın kopması", "Kemiğin bütünlüğünün bozulması", "Bağın gerilmesi", "Sinovyanın artması"], answerIndex: 1, tag: "Sakatlık" },
      { text: "Osteoporoz için en uygun ifade hangisidir?", choices: ["Kemik yoğunluğunun azalması", "Kemik yoğunluğunun artması", "Kıkırdak yoğunluğunun artması", "Kasın aşırı büyümesi"], answerIndex: 0, tag: "Kemik-Hastalık" },
      { text: "Osteomalazi/raşitizm en çok hangi durumla ilişkilidir?", choices: ["D vitamini eksikliği", "A vitamini fazlalığı", "Demir fazlalığı", "İyot fazlalığı"], answerIndex: 0, tag: "Kemik-Hastalık" },
      { text: "D vitamini kemik sağlığına nasıl katkı verir?", choices: ["Kalsiyum emilimini artırmaya yardım eder", "Kalsiyumu tamamen yok eder", "Kas ATP’sini bitirir", "Sinovya üretir"], answerIndex: 0, tag: "Kemik-D Vit" },
      { text: "Kalsitonin kemiği genel olarak nasıl etkiler?", choices: ["Kemik yıkımını artırır", "Kemik yıkımını azaltmaya eğilimlidir", "Kas kasılmasını başlatır", "Kıkırdağı yok eder"], answerIndex: 1, tag: "Hormon-Kemik" },
      { text: "Parathormon (PTH) kemiği genel olarak nasıl etkiler?", choices: ["Kandan kemiğe kalsiyum depolar", "Kemiği yıkıma yönlendirip kana kalsiyum kazandırabilir", "Kas lifini büyütür", "Sinovya üretir"], answerIndex: 1, tag: "Hormon-Kemik" },
      { text: "Kalsiyumun büyük kısmı vücutta nerede depolanır?", choices: ["Karaciğer", "Kemikler", "Böbrekler", "Akciğer"], answerIndex: 1, tag: "Kemik-Mineral" },
      { text: "Tendonun yapısında en fazla bulunan lif tipi hangisidir?", choices: ["Kollajen", "Aktin", "Miyozin", "Keratin"], answerIndex: 0, tag: "Tendon" },
      { text: "Ligamentler genel olarak ne sağlar?", choices: ["Kemiği kasa bağlar", "Eklem stabilitesini artırır", "Kan üretir", "Hormon üretir"], answerIndex: 1, tag: "Ligament" },
      { text: "Kıkırdağın kendini yenilemesinin yavaş olmasının temel nedeni hangisidir?", choices: ["Damarlanmanın sınırlı olması", "Çok fazla sinir içermesi", "Çok fazla kas içermesi", "Havers kanalı olması"], answerIndex: 0, tag: "Kıkırdak" },
      { text: "Kas lifinde en çok bulunan enerji organeli hangisidir?", choices: ["Mitokondri", "Lizozom", "Sentriyol", "Kloroplast"], answerIndex: 0, tag: "Kas-Metabolizma" },
      { text: "Kasın dinlenme halindeki tonusunun korunmasına en çok hangi sistem katkı verir?", choices: ["Somatik sinir sistemi refleksleri", "Sindirim sistemi", "Üriner sistem", "Lenf sistemi"], answerIndex: 0, tag: "Kas-Tonus" },
      { text: "Antagonist kas ilişkisi için en uygun örnek hangisidir?", choices: ["Biseps-triseps", "Diafram-kalp", "Deltoid-koroid", "Gastroknemius-kıkırdak"], answerIndex: 0, tag: "Kas-Antagonist" },
      { text: "Kas kasılırken karşıt kasın gevşemesine ne denir?", choices: ["Koordinasyon", "Karşılıklı inhibisyon", "Osmoregülasyon", "Filtrasyon"], answerIndex: 1, tag: "Kas-Kontrol" },
      { text: "Kas-iskelet sistemi yaralanmalarında RICE protokolündeki 'I' neyi ifade eder?", choices: ["Isı", "Ice (buz)", "Injection", "İlaç"], answerIndex: 1, tag: "İlk Yardım" },
      { text: "Eklem kıkırdağının aşınmasıyla ilişkilendirilen yaygın durum hangisidir?", choices: ["Osteoartrit", "Bronşit", "Siroz", "Anemi"], answerIndex: 0, tag: "Eklem-Hastalık" },
      { text: "Romatoid artrit için en uygun ifade hangisidir?", choices: ["Bakteriyel safra hastalığı", "Otoimmün eklem iltihabı", "Kemik büyümesi", "Kas hipertrofisi"], answerIndex: 1, tag: "Eklem-Hastalık" },
      { text: "Kemiğe kan sağlayan damarlar en çok hangi tabakayla ilişkilidir?", choices: ["Periost", "Retina", "Alveol", "Villus"], answerIndex: 0, tag: "Kemik-Dolaşım" },
      { text: "İskelet kasının mikroskobik fonksiyonel birimi hangisidir?", choices: ["Nefron", "Sarkomer", "Alveol", "Villus"], answerIndex: 1, tag: "Kas-Sarkomer" },
      { text: "Kas kasılmasında aktin üzerindeki bağlanma bölgelerini açığa çıkaran olay hangisidir?", choices: ["Ca2+’un troponine bağlanması", "Na+’un merceğe girmesi", "Kollajenin çözünmesi", "Sinovyanın artması"], answerIndex: 0, tag: "Kas-Fizyoloji" },
      { text: "Kas gevşemesinde Ca2+ azalmasının sonucu ne olur?", choices: ["Aktin-miyozin bağları kolaylaşır", "Tropomiyozin tekrar bağlanma bölgelerini kapatır", "Kemiğin uzaması hızlanır", "Kıkırdak sertleşir"], answerIndex: 1, tag: "Kas-Fizyoloji" },
      { text: "Kas kasılmasında çapraz köprü döngüsünün başlaması için ilk şart hangisidir?", choices: ["ATP’nin bağlanması", "Ca2+’un bağlanma bölgelerini açması", "Kollajen artması", "Sinovya azalması"], answerIndex: 1, tag: "Kas-Çapraz Köprü" },
      { text: "Kas lifinde SR (sarkoplazmik retikulum) ne işe yarar?", choices: ["Protein üretir", "Ca2+ depolar ve salar", "Kıkırdak üretir", "Kan hücresi üretir"], answerIndex: 1, tag: "Kas-SR" },
      { text: "İskelet kasında çok çekirdekli olmanın avantajı hangisi olabilir?", choices: ["Protein sentez kapasitesini artırmak", "Ses iletmek", "Koku algılamak", "Işık kırmak"], answerIndex: 0, tag: "Kas-Yapı" },
      { text: "Hızlı kasılan (fast-twitch) lifler genelde hangi özellikte olur?", choices: ["Yüksek dayanıklılık", "Çabuk yorulma, yüksek güç", "Tamamen oksijensiz yaşama", "Kıkırdak üretme"], answerIndex: 1, tag: "Kas-Lif Tipi" },
      { text: "Yavaş kasılan (slow-twitch) lifler genelde hangi özellikte olur?", choices: ["Çabuk yorulur", "Dayanıklılık yüksek, oksidatif", "Hiç mitokondri yok", "Sadece anaerobik"], answerIndex: 1, tag: "Kas-Lif Tipi" },
      { text: "Kas hipertrofisi en iyi nasıl açıklanır?", choices: ["Kas hücre sayısının artması", "Kas liflerinin hacimce büyümesi", "Kıkırdağın kemikleşmesi", "Sinovyanın azalması"], answerIndex: 1, tag: "Kas-Hipertrofi" },
      { text: "Kas atrofisi en iyi nasıl açıklanır?", choices: ["Kas liflerinin küçülmesi", "Kas liflerinin çoğalması", "Kemik yoğunluğunun artması", "Kıkırdak yoğunluğunun artması"], answerIndex: 0, tag: "Kas-Atrofi" },
      { text: "Hareketsizlik osteoporoz riskini neden artırabilir?", choices: ["Kemik üzerine yük azalır, yapım azalabilir", "Kalsiyum emilimi artar", "Periost kalınlaşır", "Kıkırdak damar kazanır"], answerIndex: 0, tag: "Kemik-Yük" },
      { text: "Wolff yasası genel olarak neyi ifade eder?", choices: ["Kemik, uygulanan yüke göre yeniden şekillenebilir", "Kas sadece hormonla çalışır", "Kıkırdak damarlanır", "Tendon kemik üretir"], answerIndex: 0, tag: "Kemik-Uyum" },
      { text: "Sinovyal eklemlerde eklem kapsülünün iç yüzünü döşeyen yapı hangisidir?", choices: ["Sinovyal zar", "Periost", "Sklera", "Retina"], answerIndex: 0, tag: "Eklem-Sinovya" },
      { text: "Sinovya sıvısının temel işlevi hangisidir?", choices: ["Sürtünmeyi azaltmak ve beslemek", "Ses iletmek", "Işık kırmak", "Kan üretmek"], answerIndex: 0, tag: "Eklem-Sinovya" },
      { text: "Kas-kemik bağlantısında kuvvetin kemiğe aktarılmasını sağlayan yapı hangisidir?", choices: ["Ligament", "Tendon", "Menisküs", "Disk"], answerIndex: 1, tag: "Kas-Tendon" },
      { text: "Kalsiyum eksikliğinde kemiklerde en olası sonuç hangisidir?", choices: ["Mineralizasyon azalabilir", "Kas lifleri çoğalır", "Kıkırdak damarlanır", "Sinovya artar"], answerIndex: 0, tag: "Kemik-Mineral" },
      { text: "Kas kasılmasında sinirsel uyarı kesilirse en olası durum hangisidir?", choices: ["Kas kasılamaz/gevşer", "Kemik uzar", "Kıkırdak büyür", "Sinovya katılaşır"], answerIndex: 0, tag: "Kas-Sinir" },
      { text: "Tetani (sürekli kasılma) hangi iyon dengesizliğiyle daha çok ilişkilidir?", choices: ["Hipokalsemi", "Hipernatremi", "Hiperglisemi", "Hiperkalemi"], answerIndex: 0, tag: "Kas-Ca2+" },
      { text: "Kas kasılmasında ATP üretim yolları içinde en hızlı ama en kısa süreli olan hangisidir?", choices: ["Kreatin fosfat sistemi", "Aerobik solunum", "Yağ oksidasyonu", "Protein katabolizması"], answerIndex: 0, tag: "Kas-Enerji" },
      { text: "Kasların çalışmasıyla ısı üretimi artar; bu durum vücutta neye katkı sağlar?", choices: ["Termoregülasyon", "Fotosentez", "Filtrasyon", "Osmos"], answerIndex: 0, tag: "Kas-Isı" },
      { text: "İskelet sisteminin mineral deposu olması hangi mineraller için özellikle önemlidir?", choices: ["Ca ve P", "Fe ve I", "Na ve Cl", "K ve Mg"], answerIndex: 0, tag: "Kemik-Mineral" },
      { text: "Kemiklerin sınıflandırılmasında 'kısa kemik'e örnek hangisidir?", choices: ["Femur", "El bilek kemikleri", "Kaburga", "Kafatası"], answerIndex: 1, tag: "Kemik-Tür" },
      { text: "Yassı kemiklere örnek hangisidir?", choices: ["Omur", "Kaburga", "Parmak", "Humerus"], answerIndex: 1, tag: "Kemik-Tür" },
      { text: "Uzun kemiklere örnek hangisidir?", choices: ["Kaburga", "Femur", "Kafatası", "Omur"], answerIndex: 1, tag: "Kemik-Tür" },
      { text: "Düz kas ile iskelet kasının temel farklarından biri hangisidir?", choices: ["Düz kas çizgili değildir", "İskelet kası istemsizdir", "Düz kas istemlidir", "İskelet kasında Ca2+ yoktur"], answerIndex: 0, tag: "Kas-Karşılaştırma" },
      { text: "Kalp kasında bulunan özelliklerden biri hangisidir?", choices: ["Ara diskler", "Havers kanalı", "Epifiz plağı", "Sinovya"], answerIndex: 0, tag: "Kas-Kalp" },
      { text: "İskelet kasında kasılma için gerekli düzenleyici proteinler hangileridir?", choices: ["Troponin-tropomiyozin", "Hemoglobin-miyoglobin", "Kollajen-elastin", "DNA-RNA"], answerIndex: 0, tag: "Kas-Sarkomer" },
      { text: "Kas kasılmasında sinirden kasa uyarı taşınırken hangi yapı zorunludur?", choices: ["Nöromüsküler kavşak", "Havers kanalı", "Menisküs", "Periost"], answerIndex: 0, tag: "Kas-Sinir" },
      { text: "Kas kasılmasında asetilkolin reseptörleri nerede bulunur?", choices: ["Kas hücre zarı (motor uç plak)", "Kemik iliği", "Kıkırdak matriksi", "Sinovyal sıvı"], answerIndex: 0, tag: "Kas-Sinir" },
    ],
    dogruyanlis: [
      { text: "Ligamentler kemiği kemiğe bağlar.", answerBool: true, tag: "Bağ" },
      { text: "Tendonlar kası kemiğe bağlar.", answerBool: true, tag: "Tendon" },
      { text: "Osteoblast kemik yapımında, osteoklast kemik yıkımında görev alır.", answerBool: true, tag: "Kemik" },
      { text: "Periost kemiğin onarımında ve beslenmesinde rol oynar.", answerBool: true, tag: "Kemik" },
      { text: "Tendon kemikleri birbirine bağlayan yapıdır.", answerBool: false, tag: "Bağlantılar" },
      { text: "Ligamentler eklem stabilitesine katkı sağlar.", answerBool: true, tag: "Bağlantılar" },
      { text: "Kas kasılmasında Ca2+ troponine bağlanarak aktin üzerindeki bağlanma bölgelerini açığa çıkarır.", answerBool: true, tag: "Kas" }
    ],
  },

  sindirim: {
    label: "Sindirim Sistemi",
    test: [
      { text: "Safra için aşağıdakilerden hangisi doğrudur?", choices: ["Enzimdir", "Yağları fiziksel olarak parçalar", "Midede üretilir", "Protein sindirir"], answerIndex: 1, tag: "Safra" },
      { text: "Emilimin en fazla olduğu bölüm hangisidir?", choices: ["Mide", "İnce bağırsak", "Kalın bağırsak", "Yemek borusu"], answerIndex: 1, tag: "Emilim" },
      { text: "Protein sindirimi en erken hangi organda başlar?", choices: ["Ağız", "Mide", "İnce bağırsak", "Kalın bağırsak"], answerIndex: 1, tag: "Protein" },
      { text:"Sindirim sisteminin temel amacı hangisidir?",choices:["Besinleri depolamak","Besinleri hücrelerin kullanabileceği hale getirmek","Oksijen taşımak","Atıkları solunumla uzaklaştırmak"],answerIndex:1,tag:"Genel"},
      { text:"Sindirim sistemi hem mekanik hem kimyasal sindirimin başladığı organ hangisidir?",choices:["Mide","Ağız","İnce bağırsak","Yemek borusu"],answerIndex:1,tag:"Ağız"},
      { text:"Ağızda karbonhidrat sindirimini başlatan enzim hangisidir?",choices:["Pepsin","Amilaz","Lipaz","Tripsin"],answerIndex:1,tag:"Ağız"},
      { text:"Tükürükte bulunan amilaz enzimi en çok hangi besini sindirir?",choices:["Protein","Yağ","Nişasta","Vitamin"],answerIndex:2,tag:"Ağız"},
      { text:"Ağızda mekanik sindirimi sağlayan temel yapı hangisidir?",choices:["Dil","Dişler","Tükürük bezleri","Yutak"],answerIndex:1,tag:"Ağız"},
      { text:"Yutma sırasında soluk borusuna besin kaçmasını engelleyen yapı hangisidir?",choices:["Gırtlak","Epiglot","Yutak","Damak"],answerIndex:1,tag:"Yutak"},
      { text:"Yemek borusunda gerçekleşen hareket tipi hangisidir?",choices:["Difüzyon","Peristaltik hareket","Segmentasyon","Aktif taşıma"],answerIndex:1,tag:"Yemek Borusu"},
      { text:"Yemek borusunda sindirimle ilgili doğru ifade hangisidir?",choices:["Kimyasal sindirim olur","Mekanik sindirim olur","Sindirim olmaz","Yağ sindirimi başlar"],answerIndex:2,tag:"Yemek Borusu"},
      { text:"Mide özsuyunda bulunan ve protein sindirimini başlatan enzim hangisidir?",choices:["Tripsin","Pepsin","Amilaz","Lipaz"],answerIndex:1,tag:"Mide"},
      { text:"Pepsin enzimi hangi ortamda en iyi çalışır?",choices:["Bazik","Nötr","Asidik","Alkali"],answerIndex:2,tag:"Mide"},
      { text:"Mide asiditesinden (HCl) sorumlu temel görev hangisidir?",choices:["Yağ sindirimi","Proteinleri denatüre etmek ve mikropları öldürmek","Safra üretmek","Vitamin emilimi"],answerIndex:1,tag:"Mide"},
      { text:"Mide duvarını asitten koruyan yapı hangisidir?",choices:["Mukus","Safra","Lipaz","Tripsin"],answerIndex:0,tag:"Mide"},
      { text:"Mide kimyasal sindirim olarak en çok hangi besini sindirir?",choices:["Karbonhidrat","Yağ","Protein","Vitamin"],answerIndex:2,tag:"Mide"},
      { text:"Midenin ince bağırsağa açılan kısmındaki kaslı yapı hangisidir?",choices:["Kardia","Pilor","Sfinkter","Kolon"],answerIndex:1,tag:"Mide"},
      { text:"İnce bağırsağın ilk bölümü hangisidir?",choices:["İleum","Jejunum","Duodenum","Kolon"],answerIndex:2,tag:"İnce Bağırsak"},
      { text:"Safra sıvısı ince bağırsağın hangi bölümüne dökülür?",choices:["İleum","Jejunum","Duodenum","Kolon"],answerIndex:2,tag:"Safra"},
      { text:"Safranın temel görevi hangisidir?",choices:["Protein sindirmek","Yağları mekanik olarak küçük parçalara ayırmak","Karbonhidrat sindirmek","Enzim salgılamak"],answerIndex:1,tag:"Safra"},
      { text:"Safra ile ilgili doğru ifade hangisidir?",choices:["Enzim içerir","Asidiktir","Baziktir ve enzim içermez","Protein sindirir"],answerIndex:2,tag:"Safra"},
      { text:"Safra hangi organda üretilir?",choices:["Pankreas","Safra kesesi","Karaciğer","Mide"],answerIndex:2,tag:"Safra"},
      { text:"Safra kesesinin temel görevi hangisidir?",choices:["Safra üretmek","Safrayı depolamak","Yağ sindirmek","Enzim üretmek"],answerIndex:1,tag:"Safra"},
      { text:"Pankreasın sindirimle ilgili görevi hangisidir?",choices:["Safra üretmek","Sindirim enzimleri üretmek","Vitamin emmek","Mukus salgılamak"],answerIndex:1,tag:"Pankreas"},
      { text:"Pankreastan salgılanan ve protein sindiriminde görev alan enzim hangisidir?",choices:["Amilaz","Tripsin","Lipaz","Maltaz"],answerIndex:1,tag:"Pankreas"},
      { text:"Pankreastan salgılanan ve yağ sindiriminde görev alan enzim hangisidir?",choices:["Pepsin","Amilaz","Lipaz","Laktaz"],answerIndex:2,tag:"Pankreas"},
      { text:"Pankreas özsuyu ile ilgili doğru ifade hangisidir?",choices:["Asidiktir","Baziktir","Nötrdür","Enzim içermez"],answerIndex:1,tag:"Pankreas"},
      { text:"İnce bağırsakta kimyasal sindirimi tamamlanan besinler hangileridir?",choices:["Sadece protein","Protein ve yağ","Karbonhidrat, protein ve yağ","Vitamin ve mineral"],answerIndex:2,tag:"İnce Bağırsak"},
      { text:"İnce bağırsakta emilimi artıran yapı hangisidir?",choices:["Villus ve mikrovillus","Peristaltik kaslar","Mukus","Sfinkter"],answerIndex:0,tag:"İnce Bağırsak"},
      { text:"Villusların temel görevi hangisidir?",choices:["Sindirim yapmak","Emilim yüzeyini artırmak","Enzim üretmek","Asit salgılamak"],answerIndex:1,tag:"İnce Bağırsak"},
      { text:"Yağ asitleri ve gliserol ince bağırsakta hangi yapıya geçer?",choices:["Kan kılcalları","Lenf kılcalları","Safra kanalı","Kapı toplardamarı"],answerIndex:1,tag:"Emilim"},
      { text:"Glikoz ve amino asitler ince bağırsakta nereye emilir?",choices:["Lenf","Kan kılcalları","Safra","Mide"],answerIndex:1,tag:"Emilim"},
      { text:"İnce bağırsakta emilen glikoz ilk olarak hangi organa gider?",choices:["Kalp","Karaciğer","Böbrek","Akciğer"],answerIndex:1,tag:"Emilim"},
      { text:"Kalın bağırsağın temel görevi hangisidir?",choices:["Kimyasal sindirim","Protein sindirimi","Su ve mineral emilimi","Enzim üretimi"],answerIndex:2,tag:"Kalın Bağırsak"},
      { text:"Kalın bağırsakta yaşayan bakterilerin temel katkısı hangisidir?",choices:["Protein sindirimi","K vitamini üretimi","Yağ sindirimi","Asit üretimi"],answerIndex:1,tag:"Kalın Bağırsak"},
      { text:"Dışkının geçici olarak depolandığı yapı hangisidir?",choices:["Kolon","Rektum","Anüs","İleum"],answerIndex:1,tag:"Kalın Bağırsak"},
      { text:"Anüs hangi tip kas kontrolüne sahiptir?",choices:["Sadece istemsiz","Sadece istemli","Hem istemli hem istemsiz","Hiçbiri"],answerIndex:2,tag:"Kalın Bağırsak"},
      { text:"Sindirim kanalında en uzun bölüm hangisidir?",choices:["Mide","Kalın bağırsak","İnce bağırsak","Yemek borusu"],answerIndex:2,tag:"Genel"},
      { text:"Sindirim enzimlerinin çoğunun çalıştığı ana organ hangisidir?",choices:["Mide","Ağız","İnce bağırsak","Kalın bağırsak"],answerIndex:2,tag:"Genel"},
      { text:"Aşağıdakilerden hangisi sindirim enzimi değildir?",choices:["Pepsin","Amilaz","Safra","Tripsin"],answerIndex:2,tag:"Genel"},
      { text:"Vitaminlerin sindirime uğramadan emilmesi neyi gösterir?",choices:["Kimyasal sindirim zorunludur","Vitaminler monomerdir","Vitaminler enerji verir","Vitaminler yağdır"],answerIndex:1,tag:"Vitamin"},
      { text:"Minerallerin emilimi için hangisi doğrudur?",choices:["Sindirilir","Doğrudan emilir","Enzim gerekir","Safra gerekir"],answerIndex:1,tag:"Mineral"},
      { text:"Selüloz neden insanlarda sindirilemez?",choices:["Asidik olduğu için","Enzim yokluğu","Yağ yapılı olduğu için","Midede parçalandığı için"],answerIndex:1,tag:"Lif"},
      { text:"Lifli besinlerin sindirim sistemine katkısı hangisidir?",choices:["Enzim üretmek","Peristaltik hareketi artırmak","Asit üretmek","Protein sindirmek"],answerIndex:1,tag:"Lif"},
      { text:"Sindirim sisteminin düzenlenmesinde hangi sistem birlikte çalışır?",choices:["Solunum","Sinir ve endokrin","Boşaltım","Lenf"],answerIndex:1,tag:"Kontrol"},
      { text:"Gastrin hormonu hangi organla ilişkilidir?",choices:["İnce bağırsak","Mide","Pankreas","Karaciğer"],answerIndex:1,tag:"Hormon"},
      { text:"Sekretin hormonu hangi salgıyı artırır?",choices:["Mide asidi","Pankreas özsuyu","Safra üretimi","Tükürük"],answerIndex:1,tag:"Hormon"},
      { text:"Kolesistokinin (CCK) hangi yapıyı uyarır?",choices:["Mide","Safra kesesi","Yemek borusu","Kalın bağırsak"],answerIndex:1,tag:"Hormon"},
      { text:"Sindirimde en fazla enerji harcayan olay hangisidir?",choices:["Emilim","Peristaltik hareket","Kimyasal sindirim","Difüzyon"],answerIndex:2,tag:"Enerji"},
      { text:"Mide boşalmasını yavaşlatan faktörlerden biri hangisidir?",choices:["Karbonhidrat","Protein","Yağ","Vitamin"],answerIndex:2,tag:"Mide"},
      { text:"Sindirim kanalında pH’ın en düşük olduğu yer hangisidir?",choices:["Ağız","Mide","İnce bağırsak","Kalın bağırsak"],answerIndex:1,tag:"pH"},
      { text:"Sindirim kanalında pH’ın en bazik olduğu yer hangisidir?",choices:["Mide","Ağız","İnce bağırsak","Yemek borusu"],answerIndex:2,tag:"pH"},
      { text:"Sindirim enzimleri genel olarak hangi yapıdadır?",choices:["Lipit","Protein","Karbonhidrat","Vitamin"],answerIndex:1,tag:"Enzim"},
      { text:"Sindirim sisteminde mekanik sindirim olmayan organ hangisidir?",choices:["Ağız","Mide","İnce bağırsak","Yemek borusu"],answerIndex:2,tag:"Mekanik"},
      { text:"Sindirim sistemi hastalıklarından reflü en çok hangi durumla ilişkilidir?",choices:["Pilor bozukluğu","Alt özofagus sfinkterinin gevşemesi","Safra kesesi taşı","Kalın bağırsak tıkanması"],answerIndex:1,tag:"Hastalık"},
      { text:"Ülser en çok hangi organda görülür?",choices:["Ağız","Mide","İnce bağırsak","Kalın bağırsak"],answerIndex:1,tag:"Hastalık"},
      { text:"İshalde en temel problem hangisidir?",choices:["Protein sindirimi","Su emiliminin azalması","Yağ sindirimi","Enzim üretimi"],answerIndex:1,tag:"Hastalık"},
      { text:"Kabızlıkta temel sorun hangisidir?",choices:["Hızlı peristaltik hareket","Su emiliminin artması","Enzim eksikliği","Safra fazlalığı"],answerIndex:1,tag:"Hastalık"},
      { text:"Sindirim sisteminin bağışıklıkla ilişkili yapılarından biri hangisidir?",choices:["Bademcik","Peyer plakları","Adenoid","Timus"],answerIndex:1,tag:"Bağışıklık"},
      { text:"Sindirim sisteminde emilim yüzeyinin fazla olmasının temel avantajı hangisidir?",choices:["Sindirim hızını düşürmek","Emilimi artırmak","Asit üretmek","Kas kasılmasını artırmak"],answerIndex:1,tag:"Genel"},
      { text:"Aşağıdakilerden hangisi ince bağırsakta üretilen enzimlerden biridir?",choices:["Maltaz","Pepsin","Tripsin","Lipaz"],answerIndex:0,tag:"İnce Bağırsak"},
      { text:"Maltaz enzimi hangi besini parçalar?",choices:["Laktoz","Maltoz","Sükroz","Nişasta"],answerIndex:1,tag:"İnce Bağırsak"},
      { text:"Laktaz eksikliğinde görülen durum hangisidir?",choices:["Çölyak","Laktoz intoleransı","Ülser","Reflü"],answerIndex:1,tag:"Hastalık"},
      { text:"Çölyak hastalığında sorunlu madde hangisidir?",choices:["Laktoz","Gluten","Nişasta","Yağ"],answerIndex:1,tag:"Hastalık"},
      { text:"Sindirim sisteminde protein sindirimi ilk nerede başlar?",choices:["Ağız","Mide","İnce bağırsak","Kalın bağırsak"],answerIndex:1,tag:"Protein"},
      { text:"Sindirim sisteminde yağ sindirimi en çok nerede gerçekleşir?",choices:["Ağız","Mide","İnce bağırsak","Kalın bağırsak"],answerIndex:2,tag:"Yağ"},
      { text:"Karbonhidrat sindirimi nerede tamamlanır?",choices:["Ağız","Mide","İnce bağırsak","Kalın bağırsak"],answerIndex:2,tag:"Karbonhidrat"},
      { text:"Sindirim sisteminin çalışmasını hızlandıran sinir sistemi hangisidir?",choices:["Sempatik","Parasempatik","Somatik","Merkezi"],answerIndex:1,tag:"Kontrol"},
      { text:"Stresli durumda sindirimin yavaşlamasının nedeni hangisidir?",choices:["Parasempatik etkinlik","Sempatik etkinlik","Hormon yokluğu","Enzim fazlalığı"],answerIndex:1,tag:"Kontrol"},
      { text:"Sindirim sisteminde peristaltik hareketi sağlayan yapı hangisidir?",choices:["Düz kaslar","İskelet kasları","Kalp kası","Bağ dokusu"],answerIndex:0,tag:"Hareket"},
      { text:"Sindirim sisteminde suyun büyük kısmı nerede emilir?",choices:["İnce bağırsak","Kalın bağırsak","Mide","Yemek borusu"],answerIndex:0,tag:"Emilim"},
      { text:"Kalın bağırsakta su emilimi artarsa dışkı nasıl olur?",choices:["Sulu","Yumuşak","Sert","Asidik"],answerIndex:2,tag:"Kalın Bağırsak"},
      { text:"Sindirim sisteminin en son bölümü hangisidir?",choices:["Rektum","Anüs","Kolon","İleum"],answerIndex:1,tag:"Genel"},
      { text:"Sindirim sisteminde homeostazın korunması neden önemlidir?",choices:["Enerji üretimi için","Besin dengesini sağlamak için","Kas kasılması için","Görme için"],answerIndex:1,tag:"Genel"}
    ],
    dogruyanlis: [
      { text: "Pankreas enzimleri ince bağırsağa dökülür.", answerBool: true, tag: "Pankreas" },
      { text: "Kalın bağırsakta en çok glikoz emilir.", answerBool: false, tag: "Kalın Bağırsak" },
      { text:"Safra enzim içermez ancak yağ sindirimine yardımcı olur.",answerBool:true,tag:"Safra"},
      { text:"Protein sindirimi ağızda başlar.",answerBool:false,tag:"Protein"},
      { text:"İnce bağırsak sindirim ve emilimin en yoğun olduğu organdır.",answerBool:true,tag:"İnce Bağırsak"},
      { text:"Kalın bağırsakta vitamin emilimi hiç olmaz.",answerBool:false,tag:"Kalın Bağırsak"},
      { text:"Parasempatik sinir sistemi sindirimi destekler.",answerBool:true,tag:"Kontrol"}
    ],
  },

  dolasim_bagisiklik: {
    label: "Dolaşım ve Bağışıklık Sistemi",
    test: [
      { text: "Kılcal damarların en temel özelliği hangisidir?", choices: ["Kapakçık bulundurur", "Madde alışverişinin olduğu damardır", "Kalpten kanı uzaklaştırır", "Basıncı en yüksektir"], answerIndex: 1, tag: "Dolaşım" },
      { text: "Akyuvarların temel görevi hangisidir?", choices: ["Oksijen taşımak", "Bağışıklık savunması", "Pıhtı oluşturmak", "Hormon üretmek"], answerIndex: 1, tag: "Bağışıklık" },
      { text: "Antikor üretimiyle en çok hangi hücre tipi ilişkilidir?", choices: ["B lenfosit", "Eritrosit", "Trombosit", "Nöron"], answerIndex: 0, tag: "Antikor" },
      { text:"Dolaşım sisteminin temel görevi hangisidir?",choices:["Besinleri sindirmek","Madde taşınmasını sağlamak","Hormon üretmek","İdrar oluşturmak"],answerIndex:1,tag:"Genel"},
      { text:"Kalbin temel görevi hangisidir?",choices:["Kanı filtrelemek","Kanı pompalamak","Oksijen üretmek","Lenf üretmek"],answerIndex:1,tag:"Kalp"},
      { text:"İnsanda kalp kaç odacıktan oluşur?",choices:["2","3","4","5"],answerIndex:2,tag:"Kalp"},
      { text:"Kalbin üst odacıklarına ne ad verilir?",choices:["Ventrikül","Atriyum","Aort","Kapak"],answerIndex:1,tag:"Kalp"},
      { text:"Kalbin alt odacıklarına ne ad verilir?",choices:["Atriyum","Ventrikül","Ven","Aort"],answerIndex:1,tag:"Kalp"},
      { text:"Kalbin sağ tarafı genel olarak hangi kanı taşır?",choices:["Oksijenli","Oksijensiz","Karışık","Lenf"],answerIndex:1,tag:"Kalp"},
      { text:"Kalbin sol tarafı genel olarak hangi kanı taşır?",choices:["Oksijensiz","Oksijenli","Lenf","Karışık"],answerIndex:1,tag:"Kalp"},
      { text:"Kalpte kanın tek yönlü akmasını sağlayan yapı hangisidir?",choices:["Kas","Kapakçık","Damar","Sinir"],answerIndex:1,tag:"Kalp"},
      { text:"Kalpten çıkan en büyük atardamar hangisidir?",choices:["Pulmoner arter","Aort","Vena kava","Kapı toplardamarı"],answerIndex:1,tag:"Damar"},
      { text:"Akciğere kan götüren damar hangisidir?",choices:["Pulmoner ven","Pulmoner arter","Aort","Koroner"],answerIndex:1,tag:"Damar"},
      { text:"Akciğerden kalbe oksijenli kan getiren damar hangisidir?",choices:["Pulmoner arter","Pulmoner ven","Aort","Vena kava"],answerIndex:1,tag:"Damar"},
      { text:"Küçük dolaşımın temel amacı hangisidir?",choices:["Besin taşımak","Kanı oksijenlendirmek","Atık taşımak","Bağışıklık sağlamak"],answerIndex:1,tag:"Dolaşım"},
      { text:"Büyük dolaşımın temel amacı hangisidir?",choices:["Akciğeri beslemek","Dokulara oksijen ve besin taşımak","Lenf üretmek","Kanı filtrelemek"],answerIndex:1,tag:"Dolaşım"},
      { text:"Atardamarlarla ilgili doğru ifade hangisidir?",choices:["Kanı kalbe getirir","Kanı kalpten götürür","Kapakçık içerir","Düşük basınçlıdır"],answerIndex:1,tag:"Damar"},
      { text:"Toplardamarlarla ilgili doğru ifade hangisidir?",choices:["Kalpten çıkar","Kapakçık içerir","Yüksek basınçlıdır","Oksijenlidir"],answerIndex:1,tag:"Damar"},
      { text:"Kılcal damarların temel özelliği hangisidir?",choices:["Kalın duvarlı","Madde alışverişi yapılır","Kapakçıklıdır","Yüksek basınçlı"],answerIndex:1,tag:"Damar"},
      { text:"Kan basıncının en yüksek olduğu damar hangisidir?",choices:["Toplardamar","Kılcal damar","Atardamar","Lenf"],answerIndex:2,tag:"Damar"},
      { text:"Kan basıncının en düşük olduğu damar hangisidir?",choices:["Atardamar","Kılcal damar","Toplardamar","Aort"],answerIndex:2,tag:"Damar"},
      { text:"Kanın sıvı kısmına ne ad verilir?",choices:["Serum","Plazma","Lenf","Fibrin"],answerIndex:1,tag:"Kan"},
      { text:"Alyuvarların (eritrosit) temel görevi hangisidir?",choices:["Savunma","Pıhtılaşma","Oksijen taşıma","Hormon üretme"],answerIndex:2,tag:"Kan"},
      { text:"Akyuvarların (lökosit) temel görevi hangisidir?",choices:["Oksijen taşıma","Savunma","Pıhtılaşma","Besin taşıma"],answerIndex:1,tag:"Kan"},
      { text:"Trombositlerin temel görevi hangisidir?",choices:["Savunma","Pıhtılaşma","Oksijen taşıma","Besin taşıma"],answerIndex:1,tag:"Kan"},
      { text:"Hemoglobin hangi hücrede bulunur?",choices:["Akyuvar","Alyuvar","Trombosit","Lenfosit"],answerIndex:1,tag:"Kan"},
      { text:"Kan gruplarını belirleyen yapı hangisidir?",choices:["Plazma proteinleri","Alyuvar zarındaki antijenler","Akyuvarlar","Trombositler"],answerIndex:1,tag:"Kan"},
      { text:"AB kan grubuna sahip bireyin plazmasında hangi antikorlar bulunur?",choices:["Anti-A","Anti-B","Anti-A ve Anti-B","Hiçbiri"],answerIndex:3,tag:"Kan"},
      { text:"0 kan grubuna sahip birey için doğru ifade hangisidir?",choices:["Evrensel alıcı","Evrensel verici","Sadece AB’ye verir","Hiç kan veremez"],answerIndex:1,tag:"Kan"},
      { text:"Rh uyuşmazlığı hangi durumda sorun oluşturur?",choices:["Anne Rh+, bebek Rh+","Anne Rh-, bebek Rh+","Anne Rh+, bebek Rh-","Anne Rh-, bebek Rh-"],answerIndex:1,tag:"Kan"},
      { text:"Kan pıhtılaşmasında görev alan vitamin hangisidir?",choices:["A","B","C","K"],answerIndex:3,tag:"Kan"},
      { text:"Fibrinojen hangi olayda fibrine dönüşür?",choices:["Savunma","Pıhtılaşma","Solunum","Sindirim"],answerIndex:1,tag:"Kan"},
      { text:"Lenf sisteminin temel görevi hangisidir?",choices:["Oksijen taşımak","Bağışıklık ve sıvı dengesini sağlamak","Hormon üretmek","İdrar oluşturmak"],answerIndex:1,tag:"Lenf"},
      { text:"Lenf kılcallarının başlangıcı hangi boşluklardan sıvı toplar?",choices:["Damar içi","Hücreler arası","Akciğer","Böbrek"],answerIndex:1,tag:"Lenf"},
      { text:"Lenf düğümlerinin temel görevi hangisidir?",choices:["Kan üretmek","Mikroorganizmaları süzmek","Hormon salgılamak","Safra üretmek"],answerIndex:1,tag:"Lenf"},
      { text:"Bademcikler hangi sistemle ilişkilidir?",choices:["Solunum","Bağışıklık","Sindirim","Boşaltım"],answerIndex:1,tag:"Bağışıklık"},
      { text:"Dalak için doğru ifade hangisidir?",choices:["Hormon üretir","Kan hücrelerini parçalar ve depolar","Safra üretir","İdrar oluşturur"],answerIndex:1,tag:"Bağışıklık"},
      { text:"Timus bezi en çok hangi hücrelerin olgunlaşmasını sağlar?",choices:["B lenfosit","T lenfosit","Eritrosit","Trombosit"],answerIndex:1,tag:"Bağışıklık"},
      { text:"Bağışıklık sisteminde özgül savunmayı sağlayan hücreler hangileridir?",choices:["Nötrofil","Lenfosit","Monosit","Eritrosit"],answerIndex:1,tag:"Bağışıklık"},
      { text:"Antikor üreten hücre hangisidir?",choices:["T lenfosit","B lenfosit","Nötrofil","Makrofaj"],answerIndex:1,tag:"Bağışıklık"},
      { text:"Aşıların temel amacı hangisidir?",choices:["Hastalık oluşturmak","Pasif bağışıklık sağlamak","Aktif bağışıklık sağlamak","Antibiyotik üretmek"],answerIndex:2,tag:"Bağışıklık"},
      { text:"Hastalığı geçirerek kazanılan bağışıklık hangisidir?",choices:["Pasif","Doğal aktif","Yapay pasif","Doğal pasif"],answerIndex:1,tag:"Bağışıklık"},
      { text:"Anne sütüyle bebeğe geçen antikorlar hangi bağışıklık türüne girer?",choices:["Doğal pasif","Doğal aktif","Yapay aktif","Yapay pasif"],answerIndex:0,tag:"Bağışıklık"},
      { text:"Antijen için en uygun tanım hangisidir?",choices:["Savunma hücresi","Bağışıklık tepkisi oluşturan madde","Antikor","Lenf düğümü"],answerIndex:1,tag:"Bağışıklık"},
      { text:"Alerji hangi bağışıklık tepkisinin sonucudur?",choices:["Yetersiz","Aşırı","Hiç olmayan","Pasif"],answerIndex:1,tag:"Bağışıklık"},
      { text:"Otoimmün hastalıklarda temel sorun hangisidir?",choices:["Mikrop eksikliği","Vücudun kendi hücrelerine saldırması","Alerjen fazlalığı","Antikor üretilememesi"],answerIndex:1,tag:"Bağışıklık"},
      { text:"İltihap (yangı) hangi savunma hattına aittir?",choices:["Birincil","İkincil","Üçüncül","Hücresel"],answerIndex:1,tag:"Bağışıklık"},
      { text:"Fagositoz yapan hücre hangisidir?",choices:["Alyuvar","Makrofaj","B lenfosit","Trombosit"],answerIndex:1,tag:"Bağışıklık"},
      { text:"Ateşin bağışıklık açısından faydası hangisidir?",choices:["Mikropların çoğalmasını zorlaştırmak","Antikorları yok etmek","Kanı pıhtılaştırmak","Oksijen taşımak"],answerIndex:0,tag:"Bağışıklık"},
      { text:"Dolaşım sistemi ile bağışıklık sistemi arasındaki ortak yapı hangisidir?",choices:["Lenf","Alveol","Nefron","Villus"],answerIndex:0,tag:"Genel"},
      { text:"Kan dokunun pH’ını dengelemede hangi sistemle birlikte çalışır?",choices:["Sindirim","Solunum","Boşaltım","Bağışıklık"],answerIndex:1,tag:"Genel"},
      { text:"Egzersiz sırasında kalp atım hızının artmasının temel nedeni hangisidir?",choices:["Oksijen ihtiyacının artması","Kan basıncının düşmesi","Lenf üretimi","Hormon eksikliği"],answerIndex:0,tag:"Kalp"},
      { text:"Yüksek tansiyon en çok hangi damarları zorlar?",choices:["Toplardamar","Kılcal","Atardamar","Lenf"],answerIndex:2,tag:"Damar"},
      { text:"Anemi hangi durumla ilişkilidir?",choices:["Akyuvar fazlalığı","Alyuvar veya hemoglobin azlığı","Trombosit fazlalığı","Lenf artışı"],answerIndex:1,tag:"Kan"},
      { text:"AIDS hastalığında en çok zarar gören hücre hangisidir?",choices:["B lenfosit","T lenfosit","Eritrosit","Trombosit"],answerIndex:1,tag:"Bağışıklık"},
      { text:"HIV virüsü bağışıklık sistemini nasıl zayıflatır?",choices:["Antikor üretimini artırır","T yardımcı hücrelerini yok eder","Alyuvarları parçalar","Trombositleri artırır"],answerIndex:1,tag:"Bağışıklık"},
      { text:"Kalp kası hangi kas tipine girer?",choices:["Düz","Çizgili istemli","Çizgili istemsiz","İskelet"],answerIndex:2,tag:"Kalp"},
      { text:"Kalp kasında bulunan ve kasların senkron çalışmasını sağlayan yapı hangisidir?",choices:["Kapakçık","Ara disk","Sarkomer","Miyelin"],answerIndex:1,tag:"Kalp"},
      { text:"Lenf damarlarında kan damarlarından farklı olarak hangi özellik bulunur?",choices:["Kapakçık yoktur","Tek yönlü akış vardır","Yüksek basınç","Alyuvar taşır"],answerIndex:1,tag:"Lenf"},
      { text:"Bağışıklık hafızası hangi hücrelerle ilişkilidir?",choices:["Nötrofil","Hafıza lenfositleri","Eritrosit","Makrofaj"],answerIndex:1,tag:"Bağışıklık"},
      { text:"Dolaşım sisteminin çalışması doğrudan hangi sistemle ilişkilidir?",choices:["Solunum","Sindirim","Boşaltım","Sinir"],answerIndex:0,tag:"Genel"},
      { text:"Kanın akış hızının en yavaş olduğu damar hangisidir?",choices:["Atardamar","Toplardamar","Kılcal damar","Aort"],answerIndex:2,tag:"Damar"},
      { text:"Bağışıklık sistemi zayıf bireylerde hangi durum daha sık görülür?",choices:["Hipertansiyon","Enfeksiyon","Anemi","Trombosit artışı"],answerIndex:1,tag:"Bağışıklık"}
    ],
    dogruyanlis: [
      { text: "Toplardamarlarda kanın geri kaçmasını engelleyen kapakçıklar bulunabilir.", answerBool: true, tag: "Damar" },
      { text: "Aort, oksijenli kanı vücuda taşır.", answerBool: true, tag: "Kalp" },
      { text:"Atardamarlar kalpten çıkan kanı taşır.",answerBool:true,tag:"Damar"},
      { text:"Pulmoner arter oksijenli kan taşır.",answerBool:false,tag:"Damar"},
      { text:"Akyuvarlar bağışıklıkta görev alır.",answerBool:true,tag:"Kan"},
      { text:"Aşılar pasif bağışıklık sağlar.",answerBool:false,tag:"Bağışıklık"},
      { text:"Lenf sistemi vücut savunmasına katkı sağlar.",answerBool:true,tag:"Lenf"}
    ],
  },

  uriner: {
    label: "Üriner Sistem",
    test: [
      { text:"Nefronda süzülme (filtrasyon) nerede gerçekleşir?", choices: ["Henle kulpu", "Bowman kapsülü", "Toplayıcı kanal", "Üreter"], answerIndex: 1, tag: "Üriner" },
      { text:"ADH artarsa idrar miktarı ne olur?", choices: ["Artar", "Azalır", "Değişmez", "Sıfırlanır"], answerIndex: 1, tag: "Su Dengesi" },
      { text:"Üre büyük oranda hangi organda oluşur?", choices: ["Böbrek", "Karaciğer", "Kalp", "Akciğer"], answerIndex: 1, tag: "Üre" },
      { text:"Üriner sistemin temel görevi hangisidir?",choices:["Oksijen taşımak","Kanın süzülmesi ve atıkların idrarla uzaklaştırılması","Safra üretmek","Besinleri sindirmek"],answerIndex:1,tag:"Genel"},
      { text:"İdrarın oluştuğu temel organ hangisidir?",choices:["Karaciğer","Böbrek","Pankreas","Dalak"],answerIndex:1,tag:"Genel"},
      { text:"Böbreğin fonksiyonel birimi hangisidir?",choices:["Alveol","Nefron","Nöron","Villus"],answerIndex:1,tag:"Nefron"},
      { text:"Glomerulus hangi yapının içinde bulunur?",choices:["Toplayıcı kanal","Bowman kapsülü","Üreter","Mesane"],answerIndex:1,tag:"Nefron"},
      { text:"Glomerulus ile Bowman kapsülünün birlikte oluşturduğu yapıya ne denir?",choices:["Henle kulpu","Malpighi cisimciği (renal cisimcik)","Piramid","Pelvis"],answerIndex:1,tag:"Nefron"},
      { text:"Böbrekte süzülme (filtrasyon) en temel olarak nerede gerçekleşir?",choices:["Distal tüp","Glomerulus-Bowman bölgesi","Toplayıcı kanal","Üreter"],answerIndex:1,tag:"Süzülme"},
      { text:"İdrar oluşum basamaklarının doğru sıralaması hangisidir?",choices:["Geri emilim-salgılama-süzülme","Süzülme-geri emilim-salgılama","Salgılama-süzülme-geri emilim","Süzülme-salgılama-geri emilim"],answerIndex:1,tag:"Basamak"},
      { text:"Süzülme basamağında kan basıncı azalırsa ne olur?",choices:["Süzülme artar","Süzülme azalır","Geri emilim durur","İdrar kesin artar"],answerIndex:1,tag:"Süzülme"},
      { text:"Süzülme sonucu Bowman kapsülüne geçen sıvıya ne ad verilir?",choices:["İdrar","Primer idrar (filtrat)","Kan plazması","Lenf"],answerIndex:1,tag:"Süzülme"},
      { text:"Normal koşulda Bowman kapsülüne geçmeyen yapı hangisidir?",choices:["Glikoz","Üre","Amino asit","Alyuvar"],answerIndex:3,tag:"Süzülme"},
      { text:"Glomerulus kılcalları ile ilgili doğru ifade hangisidir?",choices:["Basıncı düşüktür","Basıncı yüksektir","Kapakçıklıdır","Lenf taşır"],answerIndex:1,tag:"Süzülme"},
      { text:"Böbrek korteksinde bulunan nefron bölümü hangisidir?",choices:["Glomerulus ve Bowman kapsülü","Henle kulpunun alt kısmı","Toplayıcı kanalın tamamı","Üreter"],answerIndex:0,tag:"Anatomi"},
      { text:"Böbrek medullasında belirgin bulunan yapı hangisidir?",choices:["Glomerulus","Henle kulpu","Bowman kapsülü","Afferent arteriyol"],answerIndex:1,tag:"Anatomi"},
      { text:"İdrarın toplandığı böbrek bölümü hangisidir?",choices:["Korteks","Medulla","Havuzcuk (pelvis renalis)","Kapsül"],answerIndex:2,tag:"Anatomi"},
      { text:"Böbrekten mesaneye idrar taşıyan yapı hangisidir?",choices:["Üretra","Üreter","Toplayıcı kanal","Vaz deferens"],answerIndex:1,tag:"Anatomi"},
      { text:"Mesaneden dışarı idrarı taşıyan kanal hangisidir?",choices:["Üreter","Üretra","Nefron","Pelvis"],answerIndex:1,tag:"Anatomi"},
      { text:"Geri emilimin en fazla olduğu nefron bölümü hangisidir?",choices:["Proksimal tüp","Distal tüp","Toplayıcı kanal","Bowman kapsülü"],answerIndex:0,tag:"Geri Emilim"},
      { text:"Proksimal tüpte yoğun geri emilen maddelerden biri hangisidir?",choices:["Protein","Alyuvar","Glikoz","Trombosit"],answerIndex:2,tag:"Geri Emilim"},
      { text:"Sağlıklı bireyde glikozun idrarda görülmemesinin temel nedeni hangisidir?",choices:["Süzülmez","Tamamen geri emilir","Toplayıcı kanalda parçalanır","Üreterde depolanır"],answerIndex:1,tag:"Geri Emilim"},
      { text:"İdrarda glikoz görülmesi (glikozüri) en çok hangi durumla ilişkilidir?",choices:["Hipotiroidi","Diyabet (şeker hastalığı)","Anemi","Astım"],answerIndex:1,tag:"Klinik"},
      { text:"Salgılama (sekresyon) olayının temel amacı hangisidir?",choices:["Faydalı maddeleri kana katmak","Bazı maddeleri kandan tüpe aktarıp atımı artırmak","Kanın oksijenini artırmak","Kan basıncını düşürmek"],answerIndex:1,tag:"Salgılama"},
      { text:"H+ iyonlarının tüplere salgılanması en çok hangi dengeyi düzenler?",choices:["Isı dengesi","Asit-baz dengesi","Kan şekeri","Kalsiyum dengesi"],answerIndex:1,tag:"Asit-Baz"},
      { text:"Böbreklerin pH düzenlemesinde en önemli iki mekanizma hangisidir?",choices:["Glikoz geri emilimi ve filtrasyon","H+ salgılama ve HCO3- geri emilimi","Üre üretimi ve protein sentezi","Kalsitonin ve tiroksin"],answerIndex:1,tag:"Asit-Baz"},
      { text:"Üre esas olarak nerede üretilir?",choices:["Böbrek","Karaciğer","Akciğer","Dalak"],answerIndex:1,tag:"Azotlu Atık"},
      { text:"Üriner sistemin attığı azotlu atıklardan biri hangisidir?",choices:["Glikojen","Üre","Hemoglobin","Klorofil"],answerIndex:1,tag:"Azotlu Atık"},
      { text:"Ürik asit artışıyla ilişkilendirilen hastalık hangisidir?",choices:["Gastrit","Gut","Reflü","Bronşit"],answerIndex:1,tag:"Klinik"},
      { text:"İdrarın ana bileşeni hangisidir?",choices:["Protein","Su","Glikoz","Yağ"],answerIndex:1,tag:"İdrar"},
      { text:"İdrarın sarı rengini veren pigment hangisidir?",choices:["Melanin","Ürobilin","Hemoglobin","Keratohiyalin"],answerIndex:1,tag:"İdrar"},
      { text:"ADH hormonunun temel etkisi hangisidir?",choices:["Süzülmeyi artırır","Su geri emilimini artırır","Glikoz salgılatır","Üre üretir"],answerIndex:1,tag:"Hormon"},
      { text:"ADH en çok nefronun hangi kısmında etkilidir?",choices:["Bowman kapsülü","Toplayıcı kanal","Afferent arteriyol","Glomerulus"],answerIndex:1,tag:"Hormon"},
      { text:"ADH salgısı arttığında idrar miktarı nasıl değişir?",choices:["Artar","Azalır","Değişmez","Sıfırlanır"],answerIndex:1,tag:"Hormon"},
      { text:"ADH salgısı azaldığında beklenen durum hangisidir?",choices:["Az idrar, koyu","Çok idrar, açık renk","Proteinüri","Kanda glikoz düşer"],answerIndex:1,tag:"Hormon"},
      { text:"Aldosteron hormonunun temel etkisi hangisidir?",choices:["Na+ geri emilimini artırır","Glikoz geri emilimini azaltır","HCO3- salgılatır","Üre üretimini artırır"],answerIndex:0,tag:"Hormon"},
      { text:"Aldosteron artışı en çok hangi sonucu doğurur?",choices:["Sodyum ve su tutulumu artar","Su geri emilimi azalır","Kanda kalsiyum düşer","İdrarda protein artar"],answerIndex:0,tag:"Hormon"},
      { text:"Renin-anjiyotensin sistemi genel olarak neyi artırmaya yöneliktir?",choices:["Kan basıncını artırma","Kan şekerini düşürme","Oksijen üretme","Alyuvar yıkımı"],answerIndex:0,tag:"Düzenleme"},
      { text:"Böbrekler kan basıncını düzenlemede hangi mekanizma ile rol alır?",choices:["Safra salgılayarak","Renin salgılayarak","İnsülin salgılayarak","Trombosit üreterek"],answerIndex:1,tag:"Düzenleme"},
      { text:"Eritropoietin (EPO) hangi organ tarafından salgılanır?",choices:["Böbrek","Karaciğer","Pankreas","Dalak"],answerIndex:0,tag:"EPO"},
      { text:"Eritropoietin (EPO) temel olarak neyi artırır?",choices:["Alyuvar üretimi","Akyuvar üretimi","Trombosit yıkımı","Üre üretimi"],answerIndex:0,tag:"EPO"},
      { text:"Böbreklerde D vitamini hangi forma dönüştürülür (genel bilgi)?",choices:["İnaktif forma","Aktif forma","Glikojene","Hemoglobine"],answerIndex:1,tag:"D Vit"},
      { text:"Henle kulpunun temel işlevi hangisidir?",choices:["Filtrasyon","İdrarı yoğunlaştırma mekanizmasına katkı","Protein sindirimi","Oksijen taşıma"],answerIndex:1,tag:"Henle"},
      { text:"Henle kulpunun inen kolu için doğru ifade hangisidir?",choices:["Suya geçirgenliği düşüktür","Suya geçirgendir","Na+ geri emilimi yoktur","Hiçbir madde geçmez"],answerIndex:1,tag:"Henle"},
      { text:"Henle kulpunun çıkan kolu için daha uygun ifade hangisidir?",choices:["Suya geçirgendir","Suya geçirgen değildir, tuz taşır","Glikoz taşır","Alyuvar taşır"],answerIndex:1,tag:"Henle"},
      { text:"Böbreklerde karşı akım mekanizmasının amacı hangisidir?",choices:["İdrarı seyreltmek","İdrarı yoğunlaştırmak","Glikoz üretmek","Protein sentezlemek"],answerIndex:1,tag:"Karşı Akım"},
      { text:"Su tüketimi azalırsa vücut hangi hormona daha çok başvurur?",choices:["İnsülin","ADH","Tiroksin","Gastrin"],answerIndex:1,tag:"Hormon"},
      { text:"Fazla su alımında genel olarak idrar nasıl olur?",choices:["Az ve koyu","Çok ve açık renkli","Kanlı","Proteinli"],answerIndex:1,tag:"İdrar"},
      { text:"Dehidrasyon (susuz kalma) durumunda beklenen hangisidir?",choices:["ADH azalır, idrar artar","ADH artar, idrar azalır","Aldosteron sıfırlanır","Glikoz süzülmez"],answerIndex:1,tag:"Denge"},
      { text:"Böbreklerin homeostazdaki görevlerinden biri hangisidir?",choices:["Vücut ısısını üretmek","Su-tuz dengesini düzenlemek","Görme sağlamak","Kas kasılmasını başlatmak"],answerIndex:1,tag:"Homeostaz"},
      { text:"Böbreklerde geri emilimin seçici olmasının amacı hangisidir?",choices:["Her şeyi atmak","Gerekli maddeleri geri kazanmak","Sadece protein atmak","Sadece su atmak"],answerIndex:1,tag:"Geri Emilim"},
      { text:"Proteinlerin idrarda görülmesi (proteinüri) genelde hangi sorunla ilişkilidir?",choices:["Glomerulus filtrasyon bariyerinin bozulması","Üreter daralması","Mesanenin büyümesi","Karaciğer yetmezliği"],answerIndex:0,tag:"Klinik"},
      { text:"Kanlı idrar (hematüri) için olası sebeplerden biri hangisidir?",choices:["Böbrek taşı/iltihap","Vitamin eksikliği","Kıkırdak yırtığı","Göz tansiyonu"],answerIndex:0,tag:"Klinik"},
      { text:"Böbrek taşı oluşumunu artırabilecek durumlardan biri hangisidir?",choices:["Yeterli su içmek","Az su içmek","Dengeli tuz","Düzenli egzersiz"],answerIndex:1,tag:"Klinik"},
      { text:"Böbrek taşı hangi belirtiyle sık görülür?",choices:["Göğüs ağrısı","Şiddetli yan ağrısı (kolik)","Öksürük","Görme bozukluğu"],answerIndex:1,tag:"Klinik"},
      { text:"Sistitte (mesane iltihabı) en sık görülen bulgu hangisidir?",choices:["Sık idrara çıkma ve yanma","İshal","Baş dönmesi","Göz kızarıklığı"],answerIndex:0,tag:"Klinik"},
      { text:"Üretrit en çok hangi yapının iltihabıdır?",choices:["Üreter","Üretra","Nefron","Glomerulus"],answerIndex:1,tag:"Klinik"},
      { text:"Nefrit genel olarak neyi ifade eder?",choices:["Böbrek iltihabı","Karaciğer iltihabı","Akciğer iltihabı","Mide iltihabı"],answerIndex:0,tag:"Klinik"},
      { text:"Böbrek yetmezliğinde beklenen temel sonuçlardan biri hangisidir?",choices:["Atıkların kanda birikmesi","Oksijen üretiminin artması","Sindirim hızlanması","Kas hipertrofisi"],answerIndex:0,tag:"Klinik"},
      { text:"Diyaliz işleminin temel amacı hangisidir?",choices:["Kanı yapay olarak süzmek","Kemiği güçlendirmek","Hormon üretmek","Kas onarmak"],answerIndex:0,tag:"Diyaliz"},
      { text:"Hemodiyalizde süzülen sıvı temel olarak hangisidir?",choices:["Lenf","Kan","Safra","İdrar"],answerIndex:1,tag:"Diyaliz"},
      { text:"Periton diyalizi hangi zarı kullanır?",choices:["Periton","Plevra","Perikard","Meninges"],answerIndex:0,tag:"Diyaliz"},
      { text:"Böbrek naklinin temel amacı hangisidir?",choices:["Mesaneyi büyütmek","Kaybolan böbrek fonksiyonunu geri kazandırmak","Karaciğeri küçültmek","Oksijen üretmek"],answerIndex:1,tag:"Tedavi"},
      { text:"Bowman kapsülüne geçen filtratta normalde bulunması beklenen madde hangisidir?",choices:["Alyuvar","Protein","Üre","Trombosit"],answerIndex:2,tag:"Süzülme"},
      { text:"Bowman kapsülünden normalde geçmesi beklenmeyen madde hangisidir?",choices:["Glikoz","Vitamin","Büyük plazma proteinleri","Mineral iyonları"],answerIndex:2,tag:"Süzülme"},
      { text:"Böbreklerde afferent arteriyolün çapı artarsa süzülme nasıl etkilenir?",choices:["Azalır","Artar","Değişmez","Durur"],answerIndex:1,tag:"Süzülme"},
      { text:"Böbreklerde efferent arteriyolün hafif daralması genelde süzülmeyi nasıl etkiler?",choices:["Artırabilir","Azaltır","Etki etmez","İdrarı sıfırlar"],answerIndex:0,tag:"Süzülme"},
      { text:"Vücudun su dengesini algılamada en kritik parametre hangisidir?",choices:["Kan pıhtısı","Osmolarite","Hemoglobin","Safra"],answerIndex:1,tag:"Denge"},
      { text:"Osmolarite arttığında (kan yoğunluğu artınca) ADH nasıl değişir?",choices:["Azalır","Artar","Sıfırlanır","Rastgele"],answerIndex:1,tag:"Hormon"},
      { text:"Böbreklerde su geri emilimi arttığında idrarın özelliği nasıl olur?",choices:["Daha seyreltik","Daha yoğun","Kanlı","Proteinli"],answerIndex:1,tag:"İdrar"},
      { text:"Üriner sistemin idrar depolama organı hangisidir?",choices:["Üreter","Mesane","Üretra","Korteks"],answerIndex:1,tag:"Anatomi"},
      { text:"Mesane doldukça idrar yapma refleksi hangi sistemle ilişkilidir?",choices:["Sindirim","Sinir sistemi","Solunum","İskelet"],answerIndex:1,tag:"Refleks"},
      { text:"İdrar yapma refleksinde istemli kontrol hangi kasla ilişkilidir?",choices:["Dış sfinkter (iskelet kası)", "Kalp kası", "Düz kas", "Damar kası"],answerIndex:0,tag:"Refleks"},
      { text:"İç sfinkter daha çok hangi kas tipindedir?",choices:["İskelet kası","Düz kas","Kalp kası","Bağ doku"],answerIndex:1,tag:"Refleks"},
      { text:"Üreterlerde idrarı mesaneye taşıyan hareket hangisidir?",choices:["Peristaltik","Difüzyon","Osmos","Aktif pompa"],answerIndex:0,tag:"Hareket"},
      { text:"Böbreklerin vücuttaki en önemli kimyasal dengesine katkılarından biri hangisidir?",choices:["pH düzenleme","Melanin üretimi","Görme sinyali","Kas protein sentezi"],answerIndex:0,tag:"Homeostaz"},
      { text:"Böbrekte glomerulus basıncını artıran yapı farkı hangisidir?",choices:["Afferent geniş, efferent dar olması","Efferent geniş, afferent dar olması","İkisi aynı","Damar yok"],answerIndex:0,tag:"Süzülme"},
      { text:"Nefronda geri emilimle ilgili doğru ifade hangisidir?",choices:["Her madde geri emilir","Seçici olarak gerekli maddeler geri emilir","Sadece protein geri emilir","Sadece üre geri emilir"],answerIndex:1,tag:"Geri Emilim"},
      { text:"Üre ile ilgili doğru ifade hangisidir?",choices:["Tamamen geri emilir","Tamamen salgılanır","Bir kısmı geri emilebilir","Süzülmez"],answerIndex:2,tag:"Azotlu Atık"},
      { text:"Kreatininle ilgili doğru ifade hangisidir?",choices:["Böbrek fonksiyon göstergesi olabilir","Safra pigmentidir","Vitamin türüdür","Hormon üretir"],answerIndex:0,tag:"Klinik"},
      { text:"İdrar tahlilinde yoğunluk (dansite) artışı genelde neyi gösterebilir?",choices:["Aşırı su tüketimi","Dehidrasyon/ADH artışı","Glomerulus yırtığı","Lenf artışı"],answerIndex:1,tag:"Klinik"},
      { text:"İdrar oluşumunda suyun en çok geri emildiği yerlerden biri hangisidir?",choices:["Proksimal tüp","Bowman kapsülü","Üreter","Mesane"],answerIndex:0,tag:"Geri Emilim"},
      { text:"Glomerulus süzülme zarının seçiciliğini sağlayan yapılardan biri hangisidir?",choices:["Kılcal endotel + bazal membran","Kas sarkomeri","Miyelin","Kıkırdak"],answerIndex:0,tag:"Süzülme"},
      { text:"Kan basıncı aşırı düşerse böbrekler neyi artırarak telafi etmeye çalışabilir?",choices:["Renin salgısını","Safra salgısını","İnsülini","Tükürüğü"],answerIndex:0,tag:"Düzenleme"},
      { text:"Böbreklerde juxtaglomerular aparat en çok hangi işle ilişkilidir?",choices:["Renin salgısı ve GFR düzenleme","Protein sindirimi","Lenf üretimi","Aşı üretimi"],answerIndex:0,tag:"Düzenleme"},
      { text:"GFR (glomerüler filtrasyon hızı) en iyi neyi ifade eder?",choices:["İdrarın rengi","Böbreğin süzme kapasitesi","Mesane hacmi","Üreter uzunluğu"],answerIndex:1,tag:"Süzülme"},
      { text:"Aşağıdakilerden hangisi böbreklerin görevlerinden biri değildir?",choices:["Kanı süzmek","Hormonlara katkı sağlamak (EPO/renin)","Safra üretmek","Asit-baz dengesine katkı"],answerIndex:2,tag:"Genel"},
      { text:"İdrar miktarının aşırı artmasına ne denir?",choices:["Oligüri","Poliüri","Anüri","Hematuri"],answerIndex:1,tag:"Klinik"},
      { text:"İdrar miktarının azalmasına ne denir?",choices:["Poliüri","Oligüri","Glikozüri","Proteinüri"],answerIndex:1,tag:"Klinik"},
      { text:"İdrarın tamamen kesilmesine ne denir?",choices:["Anüri","Poliüri","Oligüri","Pyüri"],answerIndex:0,tag:"Klinik"},
      { text:"İdrarda iltihap hücresi/püy görülmesine ne denir?",choices:["Hematüri","Pyüri","Proteinüri","Ketonüri"],answerIndex:1,tag:"Klinik"},
      { text:"Keton cisimlerinin idrarda artması en çok hangi durumda görülebilir?",choices:["Aşırı karbonhidrat alımı","Uzun açlık/ketozis","Yüksek su tüketimi","Alerji"],answerIndex:1,tag:"Klinik"},
      { text:"Böbrek taşı riskini azaltmak için en temel öneri hangisidir?",choices:["Az su içmek","Bol su içmek","Tuzu artırmak","Hareketsizlik"],answerIndex:1,tag:"Korunma"},
      { text:"Üriner sistemde idrarın tek yönlü ilerlemesine yardımcı olabilecek durum hangisidir?",choices:["Peristaltik hareket","Osmos","Fotosentez","Koagülasyon"],answerIndex:0,tag:"Hareket"},
      { text:"Böbreklerin anatomik olarak korunduğu yapı hangisidir?",choices:["Kaburga kafesi (alt kaburgalar)","Kafatası","Pelvis kemiği","Köprücük kemiği"],answerIndex:0,tag:"Anatomi"},
      { text:"Böbreklerin arka karın bölgesinde (retroperitoneal) bulunması neyi ifade eder?",choices:["Periton boşluğunun içinde","Peritonun arkasında","Göğüs boşluğunda","Kafatasında"],answerIndex:1,tag:"Anatomi"},
      { text:"Böbreklerin ürettiği idrarın ilk toplandığı küçük yapılar hangileridir?",choices:["Nefronun toplayıcı kanalları","Üretra","Mesane duvarı","Glomerulus"],answerIndex:0,tag:"Anatomi"},
      { text:"Toplayıcı kanallardan sonra idrarın ilerlediği yapı hangisidir?",choices:["Glomerulus","Böbrek havuzcuğu (pelvis)","Proksimal tüp","Distal tüp"],answerIndex:1,tag:"Anatomi"},
      { text:"Distal tüpün önemli özelliklerinden biri hangisidir?",choices:["Hiç düzenlenmez","Hormonlarla (aldosteron) ayarlanabilir","Sadece protein taşır","Sadece alyuvar taşır"],answerIndex:1,tag:"Distal"},
      { text:"Su geri emiliminin hormonla en fazla ayarlanabildiği yer hangisidir?",choices:["Proksimal tüp","Toplayıcı kanal","Bowman kapsülü","Üreter"],answerIndex:1,tag:"Hormon"},
      { text:"Böbreklerin kanı süzmesi sırasında enerji harcayan olay hangisidir?",choices:["Filtrasyon","Geri emilimde aktif taşıma","Difüzyon","Osmos"],answerIndex:1,tag:"Enerji"},
      { text:"Böbreklerde Na+ geri emilimi artarsa su genelde ne yapar?",choices:["Takip etmez","Osmotik olarak takip eder","Yok olur","Kana geçemez"],answerIndex:1,tag:"Denge"},
      { text:"Hipertansiyon uzun vadede böbreklerde neye yol açabilir?",choices:["GFR düşüşü/hasar","GFR kesin artış","İdrar renginin sabitlenmesi","Üre üretiminin durması"],answerIndex:0,tag:"Klinik"},
      { text:"Diüretikler genel olarak ne yapar?",choices:["İdrar miktarını azaltır","İdrar miktarını artırır","Glikozu sıfırlar","Protein üretir"],answerIndex:1,tag:"İlaç"},
      { text:"Diüretiklerin kan basıncını düşürmeye katkısı hangi mekanizmayla olur?",choices:["Kan hacmini azaltmak","Oksijeni artırmak","Kas gücünü artırmak","Safra üretmek"],answerIndex:0,tag:"İlaç"},
      { text:"Böbreklerin sıvı kaybında öncelikli hedefi hangisidir?",choices:["İdrarı artırmak","Su tutmak","Üre üretmek","Glikoz salgılamak"],answerIndex:1,tag:"Denge"},
      { text:"Üriner sistemin çalışması bozulursa en hızlı etkilenen denge hangisi olabilir?",choices:["Su-tuz ve asit-baz dengesi","Görme dengesi","İşitme dengesi","Kıkırdak dengesi"],answerIndex:0,tag:"Homeostaz"},
      { text:"İdrar yaparken ağrı/yanma en çok hangi durumu düşündürür?",choices:["Üriner enfeksiyon","Kırık","Anemi","Astım"],answerIndex:0,tag:"Klinik"},
      { text:"Nefron sayısının azalması (böbrek kaybı) vücutta en çok neyi zorlar?",choices:["Süzme kapasitesini","Görme keskinliğini","Kas sarkomerini","Tat reseptörünü"],answerIndex:0,tag:"Klinik"},
      { text:"Üriner sistemle ilgili 'homeostaz' kavramına en uygun örnek hangisidir?",choices:["Kan pH’ını düzenlemek","Melanin üretmek","Ses iletmek","Işık kırmak"],answerIndex:0,tag:"Homeostaz"},
      { text:"Böbreklerde kanın süzülme basamağı hangi kuvvetle gerçekleşir?",choices:["Glomerulus hidrostatik basıncı","Kas kasılması","Yerçekimi tek başına","Fotosentez"],answerIndex:0,tag:"Süzülme"},
      { text:"Böbreklerde süzülmeyi azaltan durumlardan biri hangisidir?",choices:["Afferent daralma","Efferent daralma (hafif)","Kan basıncı artışı","Plazma protein azalması"],answerIndex:0,tag:"Süzülme"},
      { text:"Üriner sistemin çalışmasında geri emilim olmazsa ne olur?",choices:["İdrar çok artar, yararlı maddeler kaybolur","İdrar azalır","Hiç idrar oluşmaz","Sadece protein atılır"],answerIndex:0,tag:"Geri Emilim"},
      { text:"Böbreklerin vücuttaki sıvı-iyon dengesini sağlama görevine en uygun örnek hangisidir?",choices:["Na+ dengesini ayarlamak","Göz bebeğini ayarlamak","Ses dalgasını yükseltmek","Kıkırdağı büyütmek"],answerIndex:0,tag:"Denge"},
      { text:"Üriner sistemde enfeksiyonların daha sık görüldüğü yapı genel olarak hangisidir?",choices:["Üretra (özellikle kısa olduğunda)","Glomerulus","Henle kulpu","Bowman kapsülü"],answerIndex:0,tag:"Klinik"},
      { text:"Böbreklerin görevlerinden biri olan 'detoks' ile ilgili doğru ifade hangisidir?",choices:["Tüm toksinleri böbrek üretir","Bazı atıkları süzüp uzaklaştırır","Sadece vitamin üretir","Sadece oksijen taşır"],answerIndex:1,tag:"Genel"},
      { text:"Üriner sistemde idrarı depolayan yapının duvarı hangi kas tipinden zengindir?",choices:["Düz kas","İskelet kası","Kalp kası","Bağ doku"],answerIndex:0,tag:"Mesane"},
      { text:"Mesaneyi boşaltan kas tabakasına ne ad verilir?",choices:["Detrusor","Diyafram","Biseps","Koroid"],answerIndex:0,tag:"Mesane"},
      { text:"Üriner sistemde 'sfinkter' yapılarının görevi hangisidir?",choices:["Kanı süzmek","İdrarın kontrolünü sağlamak","Üre üretmek","Glikoz üretmek"],answerIndex:1,tag:"Kontrol"},
      { text:"Böbreklerin EPO salgısı azalırsa en olası sonuç hangisidir?",choices:["Anemi eğilimi","Hipertansiyon kesin artar","Glikozüri","Ketonüri"],answerIndex:0,tag:"EPO"},
      { text:"Üriner sistemde geri emilim ve salgılama olayları en çok hangi yapıda gerçekleşir?",choices:["Üreter","Nefron tüpleri","Mesane","Üretra"],answerIndex:1,tag:"Nefron"},
      { text:"Üriner sistemde idrarın dışarı atılması hangi olayın sonucudur?",choices:["Sadece istemsiz refleks","İstemli kontrol + refleks birlikte","Sadece hormonal","Sadece dolaşım"],answerIndex:1,tag:"Refleks"},
      { text:"Böbreklerde filtrasyon bariyerinin bozulmasıyla ilk akla gelen bulgu hangisidir?",choices:["Proteinüri","Safra artışı","Öksürük","Görme bozukluğu"],answerIndex:0,tag:"Klinik"},
      { text:"Üriner sistemde en temel 'atık' madde örneği hangisidir?",choices:["Glikoz","Üre","Nişasta","Yağ asidi"],answerIndex:1,tag:"Azotlu Atık"},
      { text:"Üriner sistemin çalışması bozulursa kanda hangi durum görülebilir?",choices:["Üre/kreatinin artışı","Oksijen artışı","Safra azalması","Glikojen artışı"],answerIndex:0,tag:"Klinik"},
      { text:"İdrarın yoğunlaştırılması en çok hangi koşulda önem kazanır?",choices:["Su azlığında","Su fazlalığında","Protein fazlalığında","Vitamin fazlalığında"],answerIndex:0,tag:"Denge"},
      { text:"Üriner sistemle ilgili 'osmoregülasyon' en iyi neyi anlatır?",choices:["Su ve iyon dengesinin ayarlanması","Kan pıhtılaşması","Kas kasılması","Koku algısı"],answerIndex:0,tag:"Denge"},
      { text:"Böbreklerin süzme işi bozulursa vücutta ödem neden artabilir?",choices:["Su-tuz tutulumu artabilir","Kas proteini artar","Göz basıncı düşer","Kıkırdak sertleşir"],answerIndex:0,tag:"Klinik"},
      { text:"Toplayıcı kanalda su geri emilimi artarsa idrarın hacmi nasıl değişir?",choices:["Azalır","Artar","Değişmez","Önce artar sonra sıfır olur"],answerIndex:0,tag:"İdrar"},
      { text:"Üriner sistemde en temel düzenleyici hormon-olay eşleşmesi hangisidir?",choices:["ADH-su geri emilimi","İnsülin-protein filtrasyonu","Gastrin-sodyum atımı","Tiroksin-üre üretimi"],answerIndex:0,tag:"Hormon"},
      { text:"Üriner sistemin temel yapıları doğru sıralamada hangisidir?",choices:["Böbrek-üreter-mesane-üretra","Mesane-böbrek-üretra-üreter","Üretra-mesane-üreter-böbrek","Böbrek-mesane-üreter-üretra"],answerIndex:0,tag:"Anatomi"},
      { text:"Üriner sistemde filtrasyonun seçici olmasını sağlayan etkenlerden biri hangisidir?",choices:["Molekül büyüklüğü ve yük","Ses şiddeti","Işık kırılması","Koku yoğunluğu"],answerIndex:0,tag:"Süzülme"},
      { text:"Böbreklerde su geri emilimini azaltan bir durum aşağıdakilerden hangisi olabilir?",choices:["ADH azalması","ADH artması","Aldosteron artması","Renin artması"],answerIndex:0,tag:"Hormon"},
      { text:"İdrar oluşumunda geri emilim olmasaydı en kritik kayıp hangisi olurdu?",choices:["Glikoz ve su kaybı","Üre kaybı","Kreatinin kaybı","H+ kaybı"],answerIndex:0,tag:"Geri Emilim"},
      { text:"Üriner sistemin pH düzenlemesinde HCO3- ile ilgili doğru ifade hangisidir?",choices:["Geri emilerek kana kazandırılabilir","Süzülmez","Sadece idrarla atılır","Protein yapılıdır"],answerIndex:0,tag:"Asit-Baz"},
      { text:"Üriner sistem için en doğru genel ifade hangisidir?",choices:["Sadece idrar depolar","Süzme, geri emilim ve denge sağlar","Sadece hormon üretir","Sadece kan yapar"],answerIndex:1,tag:"Genel"},
    ],
        dogruyanlis: [
      { text:"Böbrekler kanın pH dengesine katkı sağlar.", answerBool: true, tag: "Homeostazi" },
      { text:"Glomerulus süzülmesinde büyük plazma proteinleri normalde Bowman kapsülüne geçmez.",answerBool:true,tag:"Süzülme"},
      { text:"ADH artışı idrar miktarını artırır.",answerBool:false,tag:"Hormon"},
      { text:"Aldosteron sodyum geri emilimini artırarak su tutulmasına katkı sağlayabilir.",answerBool:true,tag:"Hormon"},
      { text:"Glikoz normalde tamamen atılır ve idrarda bol bulunur.",answerBool:false,tag:"Geri Emilim"},
      { text:"Böbrekler EPO salgılayarak alyuvar üretimini destekleyebilir.",answerBool:true,tag:"EPO"}
    ]
  },

  ureme:{
    label:"Üreme Sistemi",
    test:[
      {text:"İnsanda erkek üreme hücresi nerede üretilir?",choices:["Epididimis","Testis","Prostat","Üretra"],answerIndex:1,tag:"Erkek Üreme"},
      {text:"Sperm hücrelerinin olgunlaştığı yapı hangisidir?",choices:["Testis","Prostat","Epididimis","Seminal vezikül"],answerIndex:2,tag:"Erkek Üreme"},
      {text:"Dişi üreme hücresi olan yumurta nerede üretilir?",choices:["Rahim","Yumurta kanalı","Yumurtalık (ovaryum)","Vajina"],answerIndex:2,tag:"Dişi Üreme"},
      {text:"Döllenme genellikle dişi üreme sisteminin hangi bölümünde gerçekleşir?",choices:["Rahim","Yumurta kanalı (fallop tüpü)","Vajina","Yumurtalık"],answerIndex:1,tag:"Döllenme"},
      {text:"Testosteron hormonunun temel görevi hangisidir?",choices:["Yumurta üretimini sağlamak","Erkek ikincil eşeysel özelliklerini oluşturmak","Süt salgısını başlatmak","Adet döngüsünü düzenlemek"],answerIndex:1,tag:"Hormon"},
      {text:"İnsanda sperm üretiminin gerçekleştiği yapı hangisidir?",choices:["Epididimis","Testis","Prostat","Üretra"],answerIndex:1,tag:"Erkek Üreme"},
      {text:"Sperm hücrelerinin olgunlaşıp depolandığı yapı hangisidir?",choices:["Seminal vezikül","Epididimis","Cowper bezi","Vezikula"],answerIndex:1,tag:"Erkek Üreme"},
      {text:"Spermin vücut dışına atılmasında görev alan kanal hangisidir?",choices:["Üreter","Üretra","Fallop tüpü","Yumurta kanalı"],answerIndex:1,tag:"Erkek Üreme"},
      {text:"Erkekte testislerin vücut dışında bulunmasının temel nedeni hangisidir?",choices:["Besin depolamak","Sperm üretimi için daha düşük sıcaklık sağlamak","Hormon üretimini artırmak","Kan dolaşımını hızlandırmak"],answerIndex:1,tag:"Erkek Üreme"},
      {text:"Testosteron hormonu nereden salgılanır?",choices:["Seminal vezikül","Testis (Leydig hücreleri)","Hipofiz","Prostat"],answerIndex:1,tag:"Hormon"},
      {text:"FSH hormonu erkek üremede en çok hangi olayı uyarır?",choices:["Sperm üretimi (Sertoli hücreleri üzerinden)","Erektil doku gelişimi","Prostat salgısı","Spermin üretraya taşınması"],answerIndex:0,tag:"Hormon"},
      {text:"LH hormonu (erkekte ICSH) temel olarak neyi uyarır?",choices:["Testosteron salgısını","Spermin taşınmasını","Epididimis kasılmasını","Prostatın büyümesini"],answerIndex:0,tag:"Hormon"},
      {text:"Spermin yapısında bulunan ve hareketi sağlayan yapı hangisidir?",choices:["Akrozom","Kuyruk (kamçı)","Baş","Boyun"],answerIndex:1,tag:"Sperm"},
      {text:"Spermin yumurta zarlarını delmesine yardım eden enzimleri taşıyan yapı hangisidir?",choices:["Mitokondri","Akrozom","Ribozom","Sentrozom"],answerIndex:1,tag:"Sperm"},
      {text:"Sperm hücresinde mitokondrilerin yoğun bulunduğu bölge hangisidir?",choices:["Baş","Boyun/orta parça","Kuyruk ucu","Akrozom"],answerIndex:1,tag:"Sperm"},
      {text:"Seminal vezikül salgısının temel katkısı hangisidir?",choices:["Spermi asitleştirmek","Sperme enerji veren fruktoz sağlamak","Spermi pıhtılaştırmak","Spermi hareketten alıkoymak"],answerIndex:1,tag:"Erkek Üreme"},
      {text:"Prostat salgısı için en uygun ifade hangisidir?",choices:["Spermi asidik yapar","Spermin hareketini ve canlılığını destekleyen sıvı ekler","Sperm üretir","Testosteron üretir"],answerIndex:1,tag:"Erkek Üreme"},
      {text:"Cowper (bulbourethral) bezlerinin görevi hangisidir?",choices:["Sperm üretmek","Üretrayı kayganlaştıran ve asidi nötralize eden salgı yapmak","Testosteron üretmek","Yumurta üretmek"],answerIndex:1,tag:"Erkek Üreme"},
      {text:"Dişi üreme hücresi (yumurta) nerede üretilir?",choices:["Rahim","Yumurtalık (ovaryum)","Vajina","Yumurta kanalı"],answerIndex:1,tag:"Dişi Üreme"},
      {text:"Dişide yumurtanın ovaryumdan atılmasına ne ad verilir?",choices:["Menopoz","Ovulasyon","Döllenme","İmplantasyon"],answerIndex:1,tag:"Dişi Üreme"},
      {text:"Ovulasyon çoğu döngüde yaklaşık hangi gün gerçekleşir?",choices:["1. gün","7. gün","14. gün","28. gün"],answerIndex:2,tag:"Dişi Üreme"},
      {text:"Döllenme genellikle nerede gerçekleşir?",choices:["Rahim","Yumurta kanalı (fallop tüpü)","Vajina","Serviks"],answerIndex:1,tag:"Döllenme"},
      {text:"Zigotun rahim duvarına tutunmasına ne ad verilir?",choices:["Ovulasyon","İmplantasyon","Menstruasyon","Gametogenez"],answerIndex:1,tag:"Gebelik"},
      {text:"Embriyonun rahme tutunmasını kolaylaştıran yapı hangisidir?",choices:["Endometrium","Miyometrium","Serviks","Vajina"],answerIndex:0,tag:"Gebelik"},
      {text:"Dişide östrojen hormonunun temel etkilerinden biri hangisidir?",choices:["Süt üretimini başlatır","Endometriumun kalınlaşmasını destekler ve ikincil eşeysel özellikleri oluşturur","Sperm üretimini artırır","Kan pıhtılaşmasını azaltır"],answerIndex:1,tag:"Hormon"},
      {text:"Progesteron hormonunun temel görevi hangisidir?",choices:["Ovulasyonu başlatmak","Gebeliği sürdürmek ve endometriumu korumak","Sperm üretmek","Testosteronu artırmak"],answerIndex:1,tag:"Hormon"},
      {text:"Dişide FSH hormonu neyi uyarır?",choices:["Folikül gelişimi","Süt salgısı","Doğum kasılmaları","Plasenta oluşumu"],answerIndex:0,tag:"Hormon"},
      {text:"Dişide LH artışı neyi tetikler?",choices:["Menstruasyonu","Ovulasyonu","Süt salgısını","Menopozu"],answerIndex:1,tag:"Hormon"},
      {text:"Korpus luteum (sarı cisim) ne üretir?",choices:["Testosteron","Progesteron ağırlıklı hormon","İnsülin","Adrenalin"],answerIndex:1,tag:"Hormon"},
      {text:"Menstruasyon (adet) hangi durumda gerçekleşir?",choices:["Progesteron/östrojen düşüşünde endometriumun dökülmesiyle","LH artışıyla","FSH düşüşüyle","Spermin üretimiyle"],answerIndex:0,tag:"Döngü"},
      {text:"Dişide endometriumun en kalın olduğu dönem hangisidir?",choices:["Menstruasyon","Foliküler dönem","Luteal dönem","Ovulasyon anı"],answerIndex:2,tag:"Döngü"},
      {text:"Serviks için doğru ifade hangisidir?",choices:["Yumurtanın üretildiği yer","Rahim ağzı","Spermin üretildiği yer","Döllenmenin olduğu yer"],answerIndex:1,tag:"Dişi Üreme"},
      {text:"Vajinanın temel görevlerinden biri hangisidir?",choices:["Yumurta üretmek","Doğum kanalı olmak ve spermi karşılamak","Hormon üretmek","Zigotu beslemek"],answerIndex:1,tag:"Dişi Üreme"},
      {text:"Embriyonun beslenmesi ve atık alışverişinde temel yapı hangisidir?",choices:["Plasenta","Yumurtalık","Prostat","Epididimis"],answerIndex:0,tag:"Gebelik"},
      {text:"Plasentadan anne-bebek kanı normalde nasıl ilişkilidir?",choices:["Tamamen karışır","Karışmaz, madde alışverişi zar üzerinden olur","Sadece doğumda karışır","Hiç temas etmez"],answerIndex:1,tag:"Gebelik"},
      {text:"Göbek kordonunda normalde kaç damar bulunur?",choices:["1","2","3","4"],answerIndex:2,tag:"Gebelik"},
      {text:"Amniyon sıvısının görevlerinden biri hangisidir?",choices:["Embriyoyu darbelerden korumak","Sperm üretmek","Testosteron taşımak","Yumurtayı üretmek"],answerIndex:0,tag:"Gebelik"},
      {text:"Sperm üretimi sürecine ne ad verilir?",choices:["Oogenez","Spermatogenez","Gametogenez","Ovulasyon"],answerIndex:1,tag:"Erkek Üreme"},
      {text:"Yumurta oluşumu sürecine ne ad verilir?",choices:["Spermatogenez","Oogenez","Fertilizasyon","İmplantasyon"],answerIndex:1,tag:"Dişi Üreme"},
      {text:"Spermatogenezde birincil spermatositin mayoz sonunda oluşturacağı sperm sayısı kaçtır?",choices:["1","2","4","8"],answerIndex:2,tag:"Erkek Üreme"},
      {text:"Oogenezde mayoz sonucunda fonksiyonel gamet sayısı genelde kaçtır?",choices:["1","2","4","8"],answerIndex:0,tag:"Dişi Üreme"},
      {text:"Oogenezde kutup hücrelerinin oluşmasının temel nedeni hangisidir?",choices:["Daha çok sperm üretmek","Sitoplazmayı tek yumurtada toplamak","Hormon üretmek","Döllenmeyi engellemek"],answerIndex:1,tag:"Dişi Üreme"},
      {text:"Mayozun temel amacı hangisidir?",choices:["Hücre sayısını artırmak","Kromozom sayısını yarıya indirmek ve çeşitlilik sağlamak","Protein üretmek","Kan basıncını artırmak"],answerIndex:1,tag:"Genel"},
      {text:"Sperm hücresi kaç kromozom taşır?",choices:["23","46","92","44"],answerIndex:0,tag:"Genel"},
      {text:"Yumurta hücresi kaç kromozom taşır?",choices:["46","23","92","44"],answerIndex:1,tag:"Genel"},
      {text:"Döllenme sonucu zigot kaç kromozomlu olur?",choices:["23","46","69","92"],answerIndex:1,tag:"Genel"},
      {text:"İkiz gebeliklerden tek yumurta ikizleri nasıl oluşur?",choices:["İki farklı yumurtanın döllenmesi","Bir zigotun ikiye ayrılması","İki spermin bir yumurtayı döllemesi","Korpus luteumun bölünmesi"],answerIndex:1,tag:"Gebelik"},
      {text:"Çift yumurta ikizleri nasıl oluşur?",choices:["Tek zigotun bölünmesi","İki farklı yumurtanın iki farklı spermle döllenmesi","Bir spermin iki yumurtayı döllemesi","Plasentanın bölünmesi"],answerIndex:1,tag:"Gebelik"},
      {text:"Dişide menopoz genel olarak neyi ifade eder?",choices:["Ovulasyonun artması","Yumurtalık faaliyetlerinin azalması/bitmesi ve adet döngüsünün sonlanması","Testosteronun artması","Sperm üretiminin başlaması"],answerIndex:1,tag:"Dişi Üreme"},
      {text:"Ergenlik döneminde üreme sistemini başlatan ana merkez hangisidir?",choices:["Böbrek","Hipotalamus-hipofiz ekseni","Pankreas","Karaciğer"],answerIndex:1,tag:"Hormon"},
      {text:"Hipotalamustan salgılanıp hipofizi uyaran hormon hangisidir?",choices:["FSH","GnRH","LH","ADH"],answerIndex:1,tag:"Hormon"},
      {text:"LH ve FSH hormonlarını salgılayan bez hangisidir?",choices:["Tiroid","Hipofiz (ön lob)","Böbrek üstü","Pankreas"],answerIndex:1,tag:"Hormon"},
      {text:"Dişide döngünün ilk gününde gerçekleşen olay hangisidir?",choices:["Ovulasyon","Menstruasyonun başlaması","İmplantasyon","Doğum"],answerIndex:1,tag:"Döngü"},
      {text:"Dişide foliküler dönemde baskın hormon artışı genelde hangisidir?",choices:["Progesteron","Östrojen","Testosteron","ADH"],answerIndex:1,tag:"Döngü"},
      {text:"Dişide luteal dönemde baskın hormon hangisidir?",choices:["Östrojen","Progesteron","FSH","LH"],answerIndex:1,tag:"Döngü"},
      {text:"Doğum kasılmalarını artıran hormon hangisidir?",choices:["Oksitosin","İnsülin","Glukagon","Tiroksin"],answerIndex:0,tag:"Gebelik"},
      {text:"Süt üretimini başlatan hormon hangisidir?",choices:["Prolaktin","Oksitosin","FSH","LH"],answerIndex:0,tag:"Gebelik"},
      {text:"Sütün dışarı atılmasını (süt salınımı) sağlayan hormon hangisidir?",choices:["Oksitosin","Prolaktin","Progesteron","Testosteron"],answerIndex:0,tag:"Gebelik"},
      {text:"Rahmin kas tabakasına ne ad verilir?",choices:["Endometrium","Miyometrium","Perimetrium","Serviks"],answerIndex:1,tag:"Dişi Üreme"},
      {text:"Rahmin iç tabakasına ne ad verilir?",choices:["Miyometrium","Endometrium","Koroid","Amniyon"],answerIndex:1,tag:"Dişi Üreme"},
      {text:"Sperm hücrelerinde genetik çeşitliliğin temel nedeni hangisidir?",choices:["Mitoz","Mayoz ve crossing-over","Osmos","Difüzyon"],answerIndex:1,tag:"Genel"},
      {text:"Dişi üreme hücresinde döllenme engeli sağlayan mekanizmalardan biri hangisidir?",choices:["Polispermi engeli (zona reaksiyonu)","Hemoglobin","Safra","Lenf"],answerIndex:0,tag:"Döllenme"},
      {text:"Polispermi (bir yumurtaya birden fazla sperm girmesi) neden istenmez?",choices:["Zigotun kromozom sayısını bozacağı için","Sperm sayısını azaltacağı için","Progesteronu düşüreceği için","Ovulasyonu artıracağı için"],answerIndex:0,tag:"Döllenme"},
      {text:"Sperm üretimi hangi yaş döneminde başlar?",choices:["Doğumdan önce","Ergenlikle","Menopozda","Yaşlılıkta"],answerIndex:1,tag:"Erkek Üreme"},
      {text:"Oogenez (yumurta oluşumu) ile ilgili doğru ifade hangisidir?",choices:["Yaşam boyu sürekli aynı hızda sürer","Sınırlı sayıda yumurta ile başlar ve zamanla azalır","Sadece erkeklerde olur","Epididimiste gerçekleşir"],answerIndex:1,tag:"Dişi Üreme"},
      {text:"Spermin taşınmasında testisten üretraya uzanan ana kanal hangisidir?",choices:["Vaz deferens (sperm kanalı)","Üreter","Fallop tüpü","Rahim"],answerIndex:0,tag:"Erkek Üreme"},
      {text:"Semen (meni) sıvısı neyin birleşimidir?",choices:["Sadece sperm","Sperm + yardımcı bez salgıları","Sadece prostat salgısı","Sadece seminal vezikül"],answerIndex:1,tag:"Erkek Üreme"},
      {text:"Meninin bazik olmasının temel avantajı hangisidir?",choices:["Spermi öldürmek","Vajinanın asidik ortamında spermi korumak","Yumurtayı parçalamak","Rahmi küçültmek"],answerIndex:1,tag:"Erkek Üreme"},
      {text:"Dişide yumurtayı yakalayan ve rahme taşıyan yapı hangisidir?",choices:["Üretra","Yumurta kanalı","Prostat","Epididimis"],answerIndex:1,tag:"Dişi Üreme"},
      {text:"Gebeliğin erken döneminde progesteron kaynağı olarak önemli yapı hangisidir?",choices:["Korpus luteum","Prostat","Epididimis","Testis"],answerIndex:0,tag:"Gebelik"},
      {text:"Gebeliğin ilerleyen döneminde progesteron/östrojenin önemli kaynağı hangisidir?",choices:["Plasenta","Serviks","Üretra","Mesane"],answerIndex:0,tag:"Gebelik"},
      {text:"Dişide adet döngüsünün temel kontrol merkezi hangisidir?",choices:["Böbrek","Hipotalamus-hipofiz-yumurtalık ekseni","Karaciğer","Pankreas"],answerIndex:1,tag:"Döngü"},
      {text:"Erkekte sperm üretimi sürekli iken dişide yumurtlama dönemsel olmasının nedeni hangisidir?",choices:["Dişide gamet sayısının sınırlı olması","Erkekte hormon bulunmaması","Dişide testis olmaması","Erkekte rahim olmaması"],answerIndex:0,tag:"Genel"},
      {text:"Embriyonun ilk bölünmeleri (segmentasyon) hangi bölünme tipidir?",choices:["Mayoz","Mitoz","Eşeysiz","Amitoz"],answerIndex:1,tag:"Gebelik"},
      {text:"Doğumda rahim kasılmalarını başlatan/artan uyarılardan biri hangisidir?",choices:["Serviks gerilimi","Mide asidi","Üre artışı","Tükürük salgısı"],answerIndex:0,tag:"Gebelik"},
      {text:"İmplantasyon için uygun ortamı sağlayan hormon hangisidir?",choices:["Progesteron","FSH","LH","ADH"],answerIndex:0,tag:"Gebelik"},
      {text:"Döllenme sonucu oluşan hücre hangisidir?",choices:["Gamet","Zigot","Embriyo","Fetüs"],answerIndex:1,tag:"Döllenme"},
      {text:"Embriyo hangi döneme kadar bu adla anılır (genel bilgi)?",choices:["8. haftaya kadar","20. haftaya kadar","Doğuma kadar","1. güne kadar"],answerIndex:0,tag:"Gebelik"},
      {text:"Fetüs dönemi genel olarak ne zaman başlar?",choices:["İlk gün","8. hafta sonrası","Doğumdan sonra","Menopozda"],answerIndex:1,tag:"Gebelik"},
      {text:"Dişide yumurtlamadan sonra folikülün dönüşerek oluşturduğu yapı hangisidir?",choices:["Korpus luteum","Endometrium","Serviks","Amniyon"],answerIndex:0,tag:"Dişi Üreme"},
      {text:"Erkekte spermin üretildiği tüplerin adı hangisidir?",choices:["Seminifer tübüller","Henle kulpu","Alveol","Nefron"],answerIndex:0,tag:"Erkek Üreme"},
      {text:"Sertoli hücrelerinin temel görevi hangisidir?",choices:["Spermleri desteklemek ve beslemek","Testosteron üretmek","Meniyi asitleştirmek","Yumurtayı üretmek"],answerIndex:0,tag:"Erkek Üreme"},
      {text:"Dişide folikül gelişimi sırasında baskın hormon hangisidir?",choices:["FSH","ADH","Tiroksin","İnsülin"],answerIndex:0,tag:"Hormon"},
      {text:"Dişide LH dalgası gerçekleşmezse en olası sonuç hangisidir?",choices:["Ovulasyon gerçekleşmez","Menstruasyon artar","Süt salgısı artar","Sperm üretimi artar"],answerIndex:0,tag:"Hormon"},
      {text:"Üreme sisteminin sağlıklı çalışması için gerekli olan temel süreç hangisidir?",choices:["Gamet üretimi","Fotosentez","Koagülasyon","Nöron iletimi"],answerIndex:0,tag:"Genel"},
      {text:"Dişide yumurtanın üretimi ve olgunlaşması hangi organda olur?",choices:["Rahim","Yumurtalık","Serviks","Vajina"],answerIndex:1,tag:"Dişi Üreme"},
      {text:"Erkekte spermin taşınma yolu doğru sıralama hangisidir?",choices:["Testis→Epididimis→Vaz deferens→Üretra","Testis→Üretra→Epididimis→Vaz deferens","Epididimis→Testis→Üretra→Vaz deferens","Üretra→Testis→Epididimis→Vaz deferens"],answerIndex:0,tag:"Erkek Üreme"},
      {text:"Dişide yumurtanın taşınma yolu doğru sıralama hangisidir?",choices:["Yumurtalık→Rahim→Yumurta kanalı→Vajina","Yumurtalık→Yumurta kanalı→Rahim","Rahim→Yumurtalık→Yumurta kanalı","Yumurta kanalı→Yumurtalık→Rahim"],answerIndex:1,tag:"Dişi Üreme"},
      {text:"Dişi üreme döngüsünde endometriumun dökülmesi hangi evredir?",choices:["Luteal","Menstrüel","Foliküler","Ovulasyon"],answerIndex:1,tag:"Döngü"},
      {text:"Embriyonun uterusa (rahme) ulaşması genellikle döllenmeden kaç gün sonra olur (genel bilgi)?",choices:["1 gün","3-5 gün","14 gün","30 gün"],answerIndex:1,tag:"Gebelik"},
      {text:"Plasentadan geçebilen maddeler için doğru örnek hangisidir?",choices:["Alyuvarlar kolayca geçer","Oksijen ve glikoz geçebilir","Büyük proteinler hep geçer","Kromozomlar geçer"],answerIndex:1,tag:"Gebelik"},
      {text:"Rh uyuşmazlığı temel olarak hangi durumda sorun oluşturabilir?",choices:["Anne Rh- bebek Rh+","Anne Rh+ bebek Rh-","Anne Rh+ bebek Rh+","Anne Rh- bebek Rh-"],answerIndex:0,tag:"Gebelik"},
      {text:"Doğum kontrol yöntemlerinden biri olan kondomun temel etkisi hangisidir?",choices:["Hormonu artırır","Spermin yumurtaya ulaşmasını engeller","Ovulasyonu artırır","Rahmi küçültür"],answerIndex:1,tag:"Üreme Sağlığı"},
      {text:"Doğum kontrol hapları temel olarak hangi mekanizmayla çalışır?",choices:["Sperm üretimini artırır","Ovulasyonu baskılar","Döllenmeyi hızlandırır","Zigotu büyütür"],answerIndex:1,tag:"Üreme Sağlığı"},
      {text:"Spiral (RİA) temel olarak nereyi etkileyerek gebeliği önler?",choices:["Rahim içini","Testisi","Epididimisi","Prostatı"],answerIndex:0,tag:"Üreme Sağlığı"},
      {text:"Vazektomi hangi yapının bağlanmasıdır?",choices:["Üreter","Vaz deferens","Üretra","Fallop tüpü"],answerIndex:1,tag:"Üreme Sağlığı"},
      {text:"Tüplerin bağlanması (tubal ligasyon) hangi yapıyla ilişkilidir?",choices:["Yumurtalık","Yumurta kanalı","Rahim","Vajina"],answerIndex:1,tag:"Üreme Sağlığı"},
      {text:"Cinsel yolla bulaşan enfeksiyonlara karşı korunmada en etkili bariyer yöntemi hangisidir?",choices:["Diyet","Kondom","Spor","Vitamin"],answerIndex:1,tag:"Üreme Sağlığı"},
      {text:"Üreme sisteminde gametlerin birleşmesiyle oluşan genetik sonuç hangisidir?",choices:["Kromozom sayısı yarıya iner","Kromozom sayısı diploide döner","DNA kaybolur","Protein oluşmaz"],answerIndex:1,tag:"Genel"},
      {text:"Erkekte inhibin hormonunu kim salgılar?",choices:["Sertoli hücreleri","Leydig hücreleri","Prostat","Hipotalamus"],answerIndex:0,tag:"Hormon"},
      {text:"İnhibinin temel görevi hangisidir?",choices:["FSH’ı baskılamak","LH’ı artırmak","Progesteronu düşürmek","ADH’ı artırmak"],answerIndex:0,tag:"Hormon"},
      {text:"Dişide inhibin hangi hormon üzerinde baskılayıcı etki yapabilir?",choices:["FSH","ADH","Oksitosin","Prolaktin"],answerIndex:0,tag:"Hormon"},
      {text:"Ovulasyondan sonra progesteron yükselmesinin temel etkisi hangisidir?",choices:["Endometriumu dökmek","Endometriumu gebeliğe hazırlamak","Spermi öldürmek","FSH’ı artırmak"],answerIndex:1,tag:"Döngü"},
      {text:"Dişide östrojenin LH dalgasını tetiklemesi neye örnektir?",choices:["Negatif geri bildirim","Pozitif geri bildirim","Rastgele etki","Sinirsel refleks"],answerIndex:1,tag:"Döngü"},
      {text:"Gebelik testi genellikle hangi hormonu saptar?",choices:["hCG","FSH","LH","ADH"],answerIndex:0,tag:"Gebelik"},
      {text:"hCG hormonunun erken gebelikte temel işlevi hangisidir?",choices:["Korpus luteumu canlı tutmak","Sperm üretmek","Süt salgısını başlatmak","Menstruasyonu artırmak"],answerIndex:0,tag:"Gebelik"},
      {text:"Erkekte ereksiyonla ilgili damar olayı için en uygun ifade hangisidir?",choices:["Damarlar büzülür, kan azalır","Damarlar genişler, kan artar","Lenf artar, kan azalır","Kılcallar kapanır"],answerIndex:1,tag:"Üreme Sağlığı"},
      {text:"İnsanlarda cinsiyet kromozomları hangi eşleşmeyle gösterilebilir?",choices:["XX-XY","AA-BB","DD-RR","MM-NN"],answerIndex:0,tag:"Genel"},
      {text:"Dişinin cinsiyet kromozomu dizilimi hangisidir?",choices:["XY","XX","YY","XO"],answerIndex:1,tag:"Genel"},
      {text:"Erkeğin cinsiyet kromozomu dizilimi hangisidir?",choices:["XX","XY","YY","XO"],answerIndex:1,tag:"Genel"},
      {text:"Bebeğin cinsiyetini belirleyen kromozomu hangi gamet taşır?",choices:["Yumurta","Sperm","Rahim","Plasenta"],answerIndex:1,tag:"Genel"},
      {text:"Y kromozomunu taşıyan sperm yumurtayı döller ise sonuç hangisidir?",choices:["XX","XY","X0","YY"],answerIndex:1,tag:"Genel"},
      {text:"Dişide ovulasyon gerçekleştiğinde yumurta hangi hücre evresindedir (genel bilgi)?",choices:["Primer oosit profaz I","Sekonder oosit metafaz II","Zigot","Blastokist"],answerIndex:1,tag:"Dişi Üreme"},
      {text:"İnsanlarda gebelik süresi yaklaşık kaç haftadır?",choices:["20","30","40","52"],answerIndex:2,tag:"Gebelik"},
      {text:"Doğumda ilk etapta görülen olaylardan biri hangisidir?",choices:["Serviksin açılması","Korpus luteumun büyümesi","FSH artışı","Testosteron artışı"],answerIndex:0,tag:"Gebelik"},
      {text:"Doğum sırasında amniyon kesesinin açılması halk arasında ne diye bilinir?",choices:["Yumurtlama","Suların gelmesi","Menopoz","Döllenme"],answerIndex:1,tag:"Gebelik"},
      {text:"Üreme sistemiyle ilgili doğru ifade hangisidir?",choices:["Sperm üretimi mayozla olur","Zigot haploiddir","Yumurta 46 kromozom taşır","Döllenme rahimde olur"],answerIndex:0,tag:"Genel"},
      {text:"İnsanda döllenme olayı genel olarak hangi amaçla gerçekleşir?",choices:["Kromozom sayısını azaltmak","Yeni birey oluşumunu başlatmak ve kromozom sayısını 2n yapmak","Protein sindirmek","Oksijen üretmek"],answerIndex:1,tag:"Genel"},
      {text:"Spermin yumurtaya ulaşması için dişide geçmesi gereken ilk ana bölge hangisidir?",choices:["Rahim","Vajina","Yumurta kanalı","Ovaryum"],answerIndex:1,tag:"Dişi Üreme"},
      {text:"Rahimde bebeğin geliştiği bölge için en doğru ifade hangisidir?",choices:["Endometrium boşluğu","Rahim boşluğu (uterus)","Serviks kanalı","Vajina"],answerIndex:1,tag:"Gebelik"},
      {text:"Dişide adet döngüsünde döllenme olmazsa progesteron düşmesi neye yol açar?",choices:["Ovulasyon artar","Endometrium dökülür","hCG artar","Plasenta oluşur"],answerIndex:1,tag:"Döngü"},
      {text:"Üreme sağlığında düzenli kontrolün amacı hangisidir?",choices:["Döngüyü bozmak","Hastalıkları erken fark etmek","Sperm üretimini durdurmak","Testosteronu sıfırlamak"],answerIndex:1,tag:"Üreme Sağlığı"}
    ],
    dogruyanlis:[
      {text:"Testosteron hormonu sadece kadınlarda salgılanır.",answerBool:false,tag:"Hormon"},
      {text:"Döllenme genellikle yumurta kanalında gerçekleşir.",answerBool:true,tag:"Döllenme"},
      {text:"Spermin akrozom kısmında yumurtayı delmeye yarayan enzimler bulunur.",answerBool:true,tag:"Sperm"},
      {text:"Progesteron, endometriumu gebeliğe hazırlar ve korur.",answerBool:true,tag:"Hormon"},
      {text:"RH uyuşmazlığında riskli durum anne Rh+ bebek Rh- olmasıdır.",answerBool:false,tag:"Gebelik"},
      {text:"FSH hormonu erkeklerde sperm üretimini destekleyebilir.",answerBool:true,tag:"Hormon"}
    ]
  }
};

const PACK_KEYS = Object.keys(BANK);

// ---------- Build Questions ----------
function buildQuestions(packKey, typeKey, count) {
  if (packKey === "mix_all") {
    return buildMixedAll(typeKey, count);
  }
  const pack = BANK[packKey];
  if (!pack) return [];


  let pool = [];
  if (typeKey === "test") {
    pool = (pack.test || []).map(normalizeTestQuestion);
  } else if (typeKey === "dogruyanlis") {
    pool = (pack.dogruyanlis || []).map(q => ({ ...q, kind: "dogruyanlis" }));
  } else {
    const a = (pack.test || []).map(normalizeTestQuestion);
    const b = (pack.dogruyanlis || []).map(q => ({ ...q, kind: "dogruyanlis" }));
    pool = a.concat(b);
  }

  return shuffle(pool).slice(0, Math.min(count, pool.length));
}

function buildMixedAll(typeKey, count) {
  // tüm paketlerden havuz
  let pool = [];
  for (const key of PACK_KEYS) {
    const pack = BANK[key];
    if (!pack) continue;

    if (typeKey === "test") {
      pool = pool.concat((pack.test || []).map(normalizeTestQuestion));
    } else if (typeKey === "dogruyanlis") {
      pool = pool.concat((pack.dogruyanlis || []).map(q => ({ ...q, kind: "dogruyanlis" })));
    } else {
      pool = pool
        .concat((pack.test || []).map(normalizeTestQuestion))
        .concat((pack.dogruyanlis || []).map(q => ({ ...q, kind: "dogruyanlis" })));
    }
  }
  pool = shuffle(pool);
  return pool.slice(0, Math.min(count, pool.length));
}

// ---------- Render ----------
function renderQuestion() {
  const q = state.questions[state.idx];
  if (!q) return;

  state.lockedUntilCorrect = false;
  btnNext.disabled = true;
  setFeedback("", null);

  qTag.textContent = q.tag || "—";
  qTypeTag.textContent = q.kind === "test" ? "TEST" : "DOĞRU/YANLIŞ";
  qText.textContent = q.text;

  if (q.img) {
    imgWrap.classList.remove("hidden");
    qImg.src = q.img;
  } else {
    imgWrap.classList.add("hidden");
    qImg.removeAttribute("src");
  }

  choices.innerHTML = "";
  if (q.kind === "test") renderTestChoices(q);
  else renderDYChoices(q);

  updateProgressUI();
  updateScoreUI();
}

function renderTestChoices(q) {
  const letters = ["A", "B", "C", "D", "E"];
  q.choices.forEach((c, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice";
    btn.dataset.index = String(i);
    btn.innerHTML = `<span class="letter">${letters[i] || "?"}</span>${escapeHtml(c)}`;
    btn.addEventListener("click", () => onAnswerTest(q, i, btn));
    choices.appendChild(btn);
  });
}

function renderDYChoices(q) {
  const opts = [
    { label: "Doğru", val: true },
    { label: "Yanlış", val: false },
  ];
  opts.forEach((o) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choice";
    btn.dataset.val = String(o.val);
    btn.innerHTML = `<span class="letter">${o.label[0]}</span>${o.label}`;
    btn.addEventListener("click", () => onAnswerDY(q, o.val, btn));
    choices.appendChild(btn);
  });
}

function lockChoices() {
  Array.from(choices.querySelectorAll(".choice")).forEach(b => {
    b.classList.add("disabled");
    b.disabled = true;
  });
}

function logWrong(q, type, userAnswer, correctAnswer) {
  // 1) tag sayacı
  const t = q.tag || "Etiket Yok";
  state.wrongTagCounts[t] = (state.wrongTagCounts[t] || 0) + 1;

  // 2) yanlışlarım listesi
  state.wrongLog.push({
    qText: q.text,
    type: type,
    tag: t,
    pack: state.pack || "—",
    userAnswer: userAnswer,
    correctAnswer: correctAnswer
  });
}


// ---------- Answer Logic ----------
function onAnswerTest(q, chosenIndex, chosenBtn) {
  if (state.lockedUntilCorrect) {
    if (chosenIndex === q.answerIndex) {
      chosenBtn.classList.add("correct");
      setFeedback("Doğruyu buldun. Devam edebilirsin.", "good");
      btnNext.disabled = false;
      state.lockedUntilCorrect = false;
      lockChoices();
    } else {
      setFeedback("Yanlış. Doğruyu işaretlemeden geçemezsin.", "bad");
    }
    return;
  }

  const allBtns = Array.from(choices.querySelectorAll(".choice"));

  if (chosenIndex === q.answerIndex) {
    chosenBtn.classList.add("correct");
    setFeedback("Doğru!", "good");
    state.correct += 1;
    lockChoices();
    btnNext.disabled = false;
  } else {
    chosenBtn.classList.add("wrong");
    setFeedback("Yanlış. Şimdi doğruyu işaretle, sonra devam edeceksin.", "bad");
    state.wrong += 1;

    const correctBtn = allBtns[q.answerIndex];
    if (correctBtn) correctBtn.classList.add("correct");

    // hem analiz hem "Yanlışlarım"
    logWrong(q, "Test", q.choices[chosenIndex], q.choices[q.answerIndex]);

    state.lockedUntilCorrect = true;
    btnNext.disabled = true;
  }

  updateScoreUI();
}

function onAnswerDY(q, chosenVal, chosenBtn) {
  if (state.lockedUntilCorrect) {
    if (chosenVal === q.answerBool) {
      chosenBtn.classList.add("correct");
      setFeedback("Doğruyu buldun. Devam edebilirsin.", "good");
      btnNext.disabled = false;
      state.lockedUntilCorrect = false;
      lockChoices();
    } else {
      setFeedback("Yanlış. Doğruyu işaretlemeden geçemezsin.", "bad");
    }
    return;
  }

  const allBtns = Array.from(choices.querySelectorAll(".choice"));
  const correctVal = q.answerBool;

  if (chosenVal === correctVal) {
    chosenBtn.classList.add("correct");
    setFeedback("Doğru!", "good");
    state.correct += 1;
    lockChoices();
    btnNext.disabled = false;
  } else {
    chosenBtn.classList.add("wrong");
    setFeedback("Yanlış. Şimdi doğruyu işaretle, sonra devam edeceksin.", "bad");
    state.wrong += 1;

    const correctBtn = allBtns.find(b => (b.dataset.val === String(correctVal)));
    if (correctBtn) correctBtn.classList.add("correct");

    // hem analiz hem "Yanlışlarım"
    logWrong(
      q,
      "Doğru/Yanlış",
      chosenVal ? "Doğru" : "Yanlış",
      correctVal ? "Doğru" : "Yanlış"
    );

    state.lockedUntilCorrect = true;
    btnNext.disabled = true;
  }

  updateScoreUI();
}

// ---------- Finish + Result Modal ----------
function finishGame() {
  lockChoices();
  btnNext.disabled = true;
  setFeedback("Bitti. Sonuçlar açılıyor…", "good");
  openResultModal();
}

function packLabel() {
  if (state.pack === "mix_all") return "Karışık (Tüm Sistemler)";
  return (BANK[state.pack] && BANK[state.pack].label) ? BANK[state.pack].label : "—";
}
function typeLabel() {
  if (state.type === "test") return "Test";
  if (state.type === "dogruyanlis") return "Doğru / Yanlış";
  return "Karışık";
}

function openResultModal() {
  const { net, pct, answered } = computeStats();
  const total = state.questions.length;

  // ----- Yanlış Analizi (tag bazlı) -----

  const tagCounts = state.wrongTagCounts || {};
  const totalWrong = Object.values(tagCounts).reduce((a,b)=>a+b,0);


  const tagRows = Object.entries(tagCounts)
    .sort((a,b) => b[1] - a[1])
    .map(([tag, n]) => {
      const p = totalWrong === 0 ? 0 : Math.round((n / totalWrong) * 100);
      return `<div><b>%${p}</b> ${escapeHtml(tag)} <span style="opacity:.7">(${n})</span></div>`;
    })
    .join("") || `<div>Yanlış yok. 🔥</div>`;

  const analysisHtml = `
    <div class="wrongItem">
      <div class="q">Yanlış Analizi</div>
      <div class="a">
        <div style="opacity:.75;margin-bottom:6px">Toplam yanlış: <b>${totalWrong}</b></div>
        ${tagRows}
      </div>
    </div>
  `;

  const html = `
    <div class="wrongItem">
      <div class="q">Özet</div>
      <div class="a">
        <b>Paket:</b> ${escapeHtml(packLabel())}<br/>
        <b>Soru Tipi:</b> ${escapeHtml(typeLabel())}<br/>
        <b>Toplam Soru:</b> ${total}<br/>
        <b>Cevaplanan:</b> ${answered}<br/>
      </div>
    </div>

    <div class="wrongItem">
      <div class="q">Skor Tablosu</div>
      <div class="a">
        <b>Doğru:</b> ${state.correct}<br/>
        <b>Yanlış:</b> ${state.wrong}<br/>
        <b>Net:</b> ${net.toFixed(2)}<br/>
        <b>Başarı:</b> %${pct}
      </div>
    </div>

    <div class="wrongItem">
      <div class="q">İpucu</div>
      <div class="a">İstersen “Yanlışlarım”dan hatalarını tek tek görebilirsin.</div>
    </div>

    ${analysisHtml}
  `;

  resultBody.innerHTML = html;
  resultModal.classList.remove("hidden");
}

function closeResultModal() {
  resultModal.classList.add("hidden");
}

// ---------- Navigation ----------
function goNext() {
  if (btnNext.disabled) return;
  if (state.idx < state.questions.length - 1) {
    state.idx += 1;
    renderQuestion();
  } else {
    finishGame();
  }
}

// ---------- Wrong Modal ----------
function openWrongModal() {
  modal.classList.remove("hidden");
  renderWrongList();
}
function closeWrongModal() {
  modal.classList.add("hidden");
}
function renderWrongList() {
  wrongList.innerHTML = "";
  if (state.wrongLog.length === 0) {
    wrongList.innerHTML = `<div class="wrongItem"><div class="q">Henüz yanlış yok.</div><div class="a">Hatasız gidiyorsun.</div></div>`;
    return;
  }
  state.wrongLog.slice().reverse().forEach((w) => {
    const item = document.createElement("div");
    item.className = "wrongItem";
    item.innerHTML = `
      <div class="q">${escapeHtml(w.type)} • ${escapeHtml(w.qText)}</div>
      <div class="a">Senin cevabın: <b>${escapeHtml(w.userAnswer)}</b><br/>Doğru: <b>${escapeHtml(w.correctAnswer)}</b></div>
    `;
    wrongList.appendChild(item);
  });
}

// ---------- Reset ----------
function resetAll() {
  state.pack = null;
  state.type = null;
  state.count = null;

  state.questions = [];
  state.idx = 0;
  state.correct = 0;
  state.wrong = 0;
  state.lockedUntilCorrect = false;
  state.wrongLog = [];
  state.wrongTagCounts = {};

  selPack.value = "";
  selType.value = "";
  Array.from(chipCount.querySelectorAll(".chip")).forEach(c => c.classList.remove("active"));

  reflectStartButton();

  gameWrap.classList.add("hidden");
  setFeedback("", null);

  sCorrect.textContent = "0";
  sWrong.textContent = "0";
  sNet.textContent = "0";
  sPct.textContent = "0";

  qIndex.textContent = "0";
  qTotal.textContent = "0";
  progFill.style.width = "0%";

  closeResultModal();
  closeWrongModal();
}

function startGame() {
  const qs = buildQuestions(state.pack, state.type, state.count);
  if (!qs || qs.length === 0) {
    alert("Bu seçimde soru havuzu boş görünüyor.");
    return;
  }
  state.questions = qs;
  state.idx = 0;
  state.correct = 0;
  state.wrong = 0;
  state.lockedUntilCorrect = false;
  state.wrongLog = [];
  state.wrongTagCounts = {};

  gameWrap.classList.remove("hidden");
  renderQuestion();
}

// ---------- Events ----------
selPack.addEventListener("change", (e) => {
  state.pack = e.target.value;
  reflectStartButton();
});
selType.addEventListener("change", (e) => {
  state.type = e.target.value;
  reflectStartButton();
});
chipCount.addEventListener("click", (e) => {
  const btn = e.target.closest(".chip");
  if (!btn) return;
  const count = Number(btn.dataset.count);
  if (!count) return;

  state.count = count;
  Array.from(chipCount.querySelectorAll(".chip")).forEach(c => c.classList.remove("active"));
  btn.classList.add("active");

  reflectStartButton();
});
btnStart.addEventListener("click", startGame);
btnNext.addEventListener("click", goNext);
btnReset.addEventListener("click", resetAll);

btnWrong.addEventListener("click", openWrongModal);
btnCloseModal.addEventListener("click", closeWrongModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeWrongModal();
});

// Result modal events
btnCloseResult.addEventListener("click", closeResultModal);
btnPlayAgain.addEventListener("click", () => {
  closeResultModal();
  // aynı ayarlar duruyor, direkt yeniden başlat
  startGame();
});
resultModal.addEventListener("click", (e) => {
  if (e.target === resultModal) closeResultModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (!resultModal.classList.contains("hidden")) closeResultModal();
    if (!modal.classList.contains("hidden")) closeWrongModal();
  }
  if (e.key === "Enter" && !btnNext.disabled && modal.classList.contains("hidden") && resultModal.classList.contains("hidden")) {
    goNext();
  }
});

// ---------- Utils ----------
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// init
resetAll();

