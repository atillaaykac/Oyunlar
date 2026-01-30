// =====================
// AYT Edebiyat Oyunu (v8.7)
// + Kategori: Önemli Karakterler (Karışık)
// + Kategori: Unvanlar/Lakaplar (Karışık)
// + Kategori: Edebiyatta İlk'ler (Karışık)  <-- PDF s.14-15
// + Doğru şık: A/B/C/D EŞİT + RANDOM (pattern yok)
// + Sonuç analizi:
//   - Karışıkta: dönem bazlı
//   - Dönem seçilirse: yazar bazlı
//   - Önemli Karakterler: karakter bazlı
//   - Unvanlar/Lakaplar: kişi bazlı
//   - Edebiyatta İlk'ler: "ilk" başlığı bazlı
// =====================

const T = { ROMAN:"roman", HIKAYE:"hikaye", TIYATRO:"tiyatro", SIIR:"siir" };
const QK = {
  WORK_TO_AUTHOR:"work_to_author",
  AUTHOR_TO_WORK:"author_to_work",
  CHAR_TO_WORK:"char_to_work",
  WORK_TO_CHAR:"work_to_char",
  TITLE_TO_PERSON:"title_to_person",
  PERSON_TO_TITLE:"person_to_title",
  FIRST_TO_ANSWER:"first_to_answer",
  ANSWER_TO_FIRST:"answer_to_first",
};

// ========== DB (Yazar-Eser) ==========
const DB = {
  halk: [
    { author:"Yunus Emre", works:[{title:"Divan",type:T.SIIR},{title:"Risaletü'n-Nushiyye",type:T.SIIR},{title:"İlahiler",type:T.SIIR}]},
    { author:"Karacaoğlan", works:[{title:"Koşmalar",type:T.SIIR},{title:"Güzellemeler",type:T.SIIR},{title:"Varsağılar",type:T.SIIR}]},
    { author:"Pir Sultan Abdal", works:[{title:"Deyişler",type:T.SIIR},{title:"Nefesler",type:T.SIIR},{title:"Şiirler",type:T.SIIR}]},
    { author:"Dadaloğlu", works:[{title:"Koçaklamalar",type:T.SIIR},{title:"Ferman padişahın",type:T.SIIR},{title:"Avşar Elleri",type:T.SIIR}]},
    { author:"Aşık Veysel", works:[{title:"Kara Toprak",type:T.SIIR},{title:"Uzun İnce Bir Yoldayım",type:T.SIIR},{title:"Dostlar Beni Hatırlasın",type:T.SIIR}]},
    { author:"Köroğlu", works:[{title:"Koçaklamalar",type:T.SIIR},{title:"Türküler",type:T.SIIR},{title:"Kırat",type:T.SIIR}]},
    { author:"Kaygusuz Abdal", works:[{title:"Gevhername",type:T.SIIR},{title:"Dolapname",type:T.SIIR},{title:"Budalaname",type:T.SIIR},{title:"Gülistan",type:T.SIIR}]},
    { author:"Hacı Bektaşı Veli", works:[{title:"Makalat",type:T.SIIR}]},
    { author:"Eşrefoğlu Rumi", works:[{title:"Müzekkin Nüfus",type:T.SIIR}]},
    { author:"Kayıkçı Kul Mustafa", works: [{title:"Genç Osman",type:T.SIIR}]},
    { author:"Aşık Ömer", works:[{title:"Şairname",tpye:T.SIIR}]},
  ],
  divan: [
    { author:"Fuzuli", works:[{title:"Leyla vü Mecnun",type:T.SIIR},{title:"Su Kasidesi",type:T.SIIR},{title:"Hadikatü's-Süeda",type:T.SIIR},{title:"Şikayetname",type:T.SIIR},{title:"Beng-ü Bade",type:T.SIIR}]},
    { author:"Baki", works:[{title:"Kanuni Mersiyesi",type:T.SIIR},{title:"Divan",type:T.SIIR},{title:"Kasideler",type:T.SIIR}]},
    { author:"Nedim", works:[{title:"Divan",type:T.SIIR},{title:"Şarkılar",type:T.SIIR},{title:"Gazeller",type:T.SIIR}]},
    { author:"Nef'i", works:[{title:"Siham-ı Kaza",type:T.SIIR},{title:"Divan",type:T.SIIR},{title:"Kasideler",type:T.SIIR}]},
    { author:"Şeyh Galip", works:[{title:"Hüsn ü Aşk",type:T.SIIR},{title:"Divan",type:T.SIIR},{title:"Şarkılar",type:T.SIIR}]},
    { author:"Nabi", works:[{title:"Hayriyye",type:T.SIIR},{title:"Hayrabad",type:T.SIIR},{title:"Divan",type:T.SIIR}]},
    { author:"Hoca Dehhani", works:[{title:"Selçukle Şehnamesi",type:T.SIIR}]},
    { author:"Mevlana", works:[{title:"Divan-ı Kebir",type:T.SIIR},{title:"Mektubat",type:T.SIIR},{title:"Mesnevi",type:T.SIIR}]},
    { author:"Ahmedi", works:[{title:"İskendername",type:T.SIIR},{title:"Cemşid-ü Hurşit",type:T.SIIR},{title:"Esrarname",type:T.SIIR}]},
    { author:"Şeyhi", works:[{title:"Harname",type:T.SIIR},{title:"Hüsrev-ü Şirin",type:T.SIIR}]},
    { author:"Gülşehri", works:[{title:"Mantıku-t Tayr",type:T.SIIR},{title:"Felekname",type:T.SIIR}]},
    { author:"Ali Şir Nevai", works:[{title:"Muhakemetü-l Lügateyn",type:T.SIIR},{title:"Mecalisü-n Nefais",type:T.SIIR}]},
    { author:"Taşlıcalı Yahya", works:[{title:"Şehzade Mustafa Mersiyesi",type:T.SIIR}]},
    { author:"Süleyman Çelebi", works:[{title:"Vesiletü-n Necat",type:T.SIIR}]},
    { author:"Ahmed-i Dai", works:[{title:"Çengname",type:T.SIIR},{title:"Camasbname",type:T.SIIR}]},
    { author:"Şeyhülislam Yahya", works:[{title:"Sakiname",type:T.SIIR}]},
    { author:"Enderunlu Vasıf", works:[{title:"Zenanname",type:T.SIIR}]},
    { author:"Keçecizade İzzet Molla", works:[{title:"Mihnet Keşan",type:T.SIIR}]},
    { author:"Seydi Ali Reis", works:[{title:"Mir-atü-l Memalik",type:T.SIIR}]},
    { author:"Piri Reis", works:[{title:"Kitab-ı Bahriye",type:T.SIIR}]},
    { author:"Katip Çelebi", works:[{title:"Keşfü-z Zunun",type:T.SIIR},{title:"Cihannüma",type:T.SIIR}]},
    { author:"Evliya Çelebi", works:[{title:"Seyahatname",type:T.SIIR}]},
    { author:"Sultan Veled", works:[{title:"Rebabname",type:T.SIIR},{title:"İntihaname",type:T.SIIR},{title:"İptidaname",type:T.SIIR},{title:"Maarif",type:T.SIIR}]},
    { author:"Şeyyad Hamza", works:[{title:"Yusuf-u Züleyha",type:T.SIIR}]},
  ],
  tanzimat: [
    { author:"Şinasi", works:[{title:"Şair Evlenmesi",type:T.TIYATRO},{title:"Durub-i Emsal-i Osmaniye",type:T.SIIR},{title:"Müntehabat-ı Eş-ar",type:T.SIIR},{title:"Tercüme-i Manzume",type:T.SIIR}]},
    { author:"Namık Kemal", works:[{title:"İntibah",type:T.ROMAN},{title:"Cezmi",type:T.ROMAN},{title:"Vatan Yahut Silistre",type:T.TIYATRO},{title:"Akif Bey",type:T.TIYATRO},{title:"Zavallı Çocuk",type:T.TIYATRO},{title:"Gülnihal",type:T.TIYATRO},{title:"Hürriyet Kasidesi",type:T.SIIR},{title:"Vaveyla",type:T.SIIR}]},
    { author:"Ziya Paşa", works:[{title:"Terkib-i Bend",type:T.SIIR},{title:"Terci-i Bend",type:T.SIIR},{title:"Harabat",type:T.SIIR},{title:"Zafername",type:T.SIIR}]},
    { author:"Recaizade Mahmut Ekrem", works:[{title:"Araba Sevdası",type:T.ROMAN},{title:"Zemzeme",type:T.SIIR}]},
    { author:"Ahmet Mithat Efendi", works:[{title:"Felatun Bey ile Rakım Efendi",type:T.ROMAN},{title:"Hasan Mellah",type:T.ROMAN},{title:"Letaif-i Rivayat",type:T.HIKAYE}]},
    { author:"Samipaşazade Sezai", works:[{title:"Sergüzeşt",type:T.ROMAN},{title:"Küçük Şeyler",type:T.HIKAYE}]},
    { author:"Nabizade Nazım", works:[{title:"Karabibik",type:T.ROMAN},{title:"Zehra",type:T.ROMAN}]},
    { author:"Şemsettin Sami", works:[{title:"Taaşşuk-ı Talat ve Fitnat",type:T.ROMAN}]},
    { author:"Ahmet Vefik Paşa", works:[{title:"Zor Nikâh",type:T.TIYATRO},{title:"Zoraki Tabip",type:T.TIYATRO}]},
    { author:"Abdülhak Hamit Tarhan", works:[{title:"Makber",type:T.SIIR},{title:"Eşber",type:T.TIYATRO},{title:"Nesteren",type:T.TIYATRO},{title:"Sahra",type:T.SIIR},{title:"Validem",type:T.SIIR}]},
    { author:"Muallim Naci", works:[{title:"Ateşpare",type:T.SIIR},{title:"Firuzan",type:T.SIIR},{title:"Köylü Kızların Şarkısı",type:T.SIIR},{title:"Demdeme",type:T.SIIR}]},
    { author:"Sami Paşazade Sezai", works:[{title:"Sergüzeşt",type:T.ROMAN},{title:"Küçük Şeyler",type:T.ROMAN}]},
    { author:"Nabizade Nazım", works:[{title:"Zavallı Kız",type:T.HİKAYE},{title:"Karabibik",type:T.ROMAN}]},
  ],
  servetifun: [
    { author:"Halit Ziya Uşaklıgil", works:[{title:"Mai ve Siyah",type:T.ROMAN},{title:"Aşk-ı Memnu",type:T.ROMAN},{title:"Kırık Hayatlar",type:T.ROMAN},{title:"Nemide",type:T.ROMAN},{title:"Sefile",type:T.ROMAN}]},
    { author:"Mehmet Rauf", works:[{title:"Eylül",type:T.ROMAN},{title:"Bir Aşkın Tarihi",type:T.ROMAN},{title:"Genç Kız Kalbi",type:T.ROMAN}]},
    { author:"Tevfik Fikret", works:[{title:"Rübab-ı Şikeste",type:T.SIIR},{title:"Haluk'un Defteri",type:T.SIIR},{title:"Şermin",type:T.SIIR},{title:"Sis",type:T.SIIR},{title:"Doksan Beşe Doğru",type:T.SIIR},{title:"Tarih-i Kadim",type:T.SIIR}]},
    { author:"Cenap Şahabettin", works:[{title:"Elhan-ı Şita",type:T.SIIR},{title:"Hac Yolunda",type:T.SIIR},{title:"Körebe",type:T.TİYATRO},{title:"Tamat",type:T.SIIR}]},
    { author:"Hüseyin Rahmi Gürpınar", works:[{title:"Şıpsevdi",type:T.ROMAN},{title:"Mürebbiye",type:T.ROMAN},{title:"Kuyruklu Yıldız Altında Bir İzdivaç",type:T.ROMAN}]},
    { author:"Hüseyin Cahit Yalçın", works:[{title:"Nadide",type:T.ROMAN},{title:"Hayal İçinde",type:T.ROMAN}]},
    { author:"Ahmet Hikmet Müftüoğlu", works:[{title:"Haristan ve Gülistan",type:T.HIKAYE}]},
  ],
  fecriat: [
    { author:"Ahmet Haşim", works:[{title:"Göl Saatleri",type:T.SIIR},{title:"Piyale",type:T.SIIR},{title:"Bize Göre",type:T.SIIR},{title:"Merdiven",type:T.SIIR}]},
    { author:"Emin Bülent Serdaroğlu", works:[{title:"Kin",type:T.SIIR}]},
    { author:"Refik Halit Karay", works:[{title:"Memleket Hikayeleri",type:T.HIKAYE},{title:"Gurbet Hikayeleri",type:T.HIKAYE},{title:"İstanbul'un İç Yüzü",type:T.ROMAN}]},
    { author:"Celal Sahir Erozan", works:[{title:"Beyaz Gölgeler",type:T.SIIR},{title:"Kardeş Sesi",type:T.SIIR},{title:"Buhran",type:T.SIIR}]},
    { author:"Şahabettin Süleyman", works:[{title:"Çıkmaz Sokak",type:T.TIYATRO},{title:"Fırtına",type:T.TIYATRO},{title:"Kırık Mahfaza",type:T.TIYATRO}]},
    { author:"Cemil Süleyman", works:[{title:"Siyah Gözler",type:T.ROMAN}]},
    { author:"Tahsin Nahit", works:[{title:"Ruh-i Bi-Kayd",type:T.ROMAN}]},
  ],
  milli: [
    { author:"Ömer Seyfettin", works:[{title:"Kaşağı",type:T.HIKAYE},{title:"Falaka",type:T.HIKAYE},{title:"Beyaz Lale",type:T.HIKAYE},{title:"Pembe İncili Kaftan",type:T.HIKAYE}]},
    { author:"Mehmet Akif Ersoy", works:[{title:"Safahat",type:T.SIIR},{title:"Çanakkale Şehitlerine",type:T.SIIR},{title:"İstiklal Marşı",type:T.SIIR}]},
    { author:"Ziya Gökalp", works:[{title:"Kızıl Elma",type:T.SIIR},{title:"Altın Işık",type:T.SIIR},{title:"Türkçülüğün Esasları",type:T.SIIR}]},
    { author:"Halide Edip Adıvar", works:[{title:"Ateşten Gömlek",type:T.ROMAN},{title:"Sinekli Bakkal",type:T.ROMAN},{title:"Handan",type:T.ROMAN}]},
    { author:"Yakup Kadri Karaosmanoğlu", works:[{title:"Kiralık Konak",type:T.ROMAN},{title:"Yaban",type:T.ROMAN},{title:"Ankara",type:T.ROMAN},{title:"Sodom ve Gomore",type:T.ROMAN}]},
    { author:"Ahmet Hikmet Müftüoğlu", works:[{title:"Gönül Hanım",type:T.ROMAN}]},
    { author:"Mehmet Emin Yurdakul", works:[{title:"Türkçe Şiirler",type:T.SIIR},{title:"Türk Sazı",type:T.SIIR},{title:"Ey Türk Uyan",type:T.SIIR},{title:"Tan Sesleri",type:T.SIIR},{title:"Ordunun Detanı",type:T.SIIR}]},
    { author:"Ali Canip Yöntem", works:[{title:"Geçtiğim Yol",type:T.SIIR}]},
    { author:"Yahya Kemal Beyatlı", works:[{title:"Eski Şiirin Rüzgarıyla",type:T.SIIR},{title:"Kendi Gök Kubbemiz",type:T.SIIR},{title:"Aziz İstanbul",type:T.HIKAYE},{title:"Siste Söyleyiş",type:T.SIIR},{title:"Ok",type:T.SIIR}]},
    { author:"Faruk Nafiz Çamlıbel", works:[{title:"Şarkın Sultanları",type:T.SIIR},{title:"Çoban Çeşmesi",type:T.SIIR},{title:"Han Duvarları",type:T.SIIR}]},
    { author:"Halit Fahri Ozansoy", works:[{title:"Aruza Veda",type:T.TIYATRO},{title:"Baykuş",type:T.TIYATRO},{title:"Edebiyatçılar Geçiyor",type:T.HIKAYE}]},
    { author:"Enis Behiç Koryürek", works:[{title:"Gemiciler",type:T.SIIR}]},
    { author:"Yusuf Ziya Ortaç", works:[{title:"Akından Akına",type:T.SIIR},{title:"Cenk Ufukları",type:T.SIIR}]},
    { author:"Orhan Seyfi Orhon", works:[{title:"Fırtına ve Kar",type:T.SIIR},{title:"O Beyaz Bir Kuştu",type:T.SIIR},{title:"Peri Kızı ile Çobanın Hikayesi",type:T.HIKAYE}]},
  ],
  cumhuriyet: [
    { author:"Reşat Nuri Güntekin", works:[{title:"Çalıkuşu",type:T.ROMAN},{title:"Yaprak Dökümü",type:T.ROMAN},{title:"Yeşil Gece",type:T.ROMAN},{title:"Acımak",type:T.ROMAN}]},
    { author:"Sabahattin Ali", works:[{title:"Kuyucaklı Yusuf",type:T.ROMAN},{title:"Kürk Mantolu Madonna",type:T.ROMAN},{title:"Değirmen",type:T.HIKAYE},{title:"Yeni Dünya",type:T.HIKAYE}]},
    { author:"Ahmet Hamdi Tanpınar", works:[{title:"Huzur",type:T.ROMAN},{title:"Saatleri Ayarlama Enstitüsü",type:T.ROMAN},{title:"Beş Şehir",type:T.SIIR}]},
    { author:"Sait Faik Abasıyanık", works:[{title:"Semaver",type:T.HIKAYE},{title:"Lüzumsuz Adam",type:T.HIKAYE},{title:"Havada Bulut",type:T.HIKAYE}]},
    { author:"Nazım Hikmet", works:[{title:"Memleketimden İnsan Manzaraları",type:T.SIIR},{title:"Kuvâyi Milliye Destanı",type:T.SIIR}]},
    { author:"Necip Fazıl Kısakürek", works:[{title:"Çile",type:T.SIIR},{title:"Kaldırımlar",type:T.SIIR},{title:"Bir Adam Yaratmak",type:T.TIYATRO}]},
    { author:"Haldun Taner", works:[{title:"Keşanlı Ali Destanı",type:T.TIYATRO},{title:"Gözlerimi Kaparım Vazifemi Yaparım",type:T.TIYATRO},{title:"Şişhane'ye Yağmur Yağıyordu",type:T.HIKAYE}]},
    { author:"Yaşar Kemal", works:[{title:"İnce Memed",type:T.ROMAN},{title:"Yer Demir Gök Bakır",type:T.ROMAN}]},
    { author:"Kemal Tahir", works:[{title:"Devlet Ana",type:T.ROMAN},{title:"Esir Şehrin İnsanları",type:T.ROMAN}]},
    { author:"Tarık Buğra", works:[{title:"Küçük Ağa",type:T.ROMAN}]},
    { author:"Oğuz Atay", works:[{title:"Tutunamayanlar",type:T.ROMAN},{title:"Tehlikeli Oyunlar",type:T.ROMAN},{title:"Korkuyu Beklerken",type:T.HIKAYE}]},
    { author:"Orhan Veli Kanık", works:[{title:"Garip",type:T.SIIR}]},
    { author:"Cahit Sıtkı Tarancı", works:[{title:"Otuz Beş Yaş",type:T.SIIR}]},
    { author:"Ahmet Kutsi Tecer", works:[{title:"Köşebaşı",type:T.TIYATRO},{title:"Orada Bir Köy Var Uzakta",type:T.SIIR},{title:"Koçyiğit Köroğlu",type:T.TIYATRO}]},
    { author:"Ahmet Muhip Dıranas", works:[{title:"Serenad",type:T.SIIR},{title:"Fahriye Abla",type:T.SIIR},{title:"Olvido",type:T.SIIR},{title:"Kar",type:T.SIIR}]},
    { author:"Fazıl Hüsnü Dağlarca", works:[{title:"Üç Şehitler Destanı",type:T.SIIR},{title:"Çocuk ve Allah",type:T.SIIR},{title:"Havaya Çizilen Dünya",type:T.SIIR}]},
    { author:"Ziya Osman Saba", works:[{title:"Sebil ve Güvercinler",type:T.SIIR},{title:"Mesut İnsanlar Fotoğrafhanesi",type:T.HIKAYE}]},
    { author:"Rıfat Ilgaz", works:[{title:"Hababam Sınıfı",type:T.ROMAN},{title:"Karartma Geceleri",type:T.ROMAN},{title:"Don Kişot İstanbulda",type:T.HIKAYE}]},
    { author:"Can Yücel", works:[{title:"Yazma",type:T.SIIR},{title:"Sevgi Duvarı",type:T.SIIR}]},
    { author:"Ahmed Arif", works:[{title:"Hasretinden Prangalar Eskittim",type:T.SIIR}]},
    { author:"Orhan Şaik Gökyay", works:[{title:"Bu Vatan Kimin",type:T.SIIR}]},
    { author:"Arif Nihat Asya", works:[{title:"Bir Bayrak Rüzgar Bekliyor",type:T.SIIR},{title:"Dualar ve Aminler",type:T.SIIR},{title:"Bayrak",type:T.SIIR}]},
    { author:"Kemalettin Kamu", works:[{title:"Gurbet",type:T.SIIR},{title:"Bingöl Çobanları",type:T.SIIR}]},
    { author:"Ömer Bedrettin Uşaklı", works:[{title:"Deniz Sarhoşları",type:T.SIIR}]},
    { author:"Melih Cevdet Anday", works:[{title:"Rahatı Kaçan Ağaç",type:T.SIIR},{title:"Telgrafhane",type:T.SIIR},{title:"Kolları Bağlı Odysseus",type:T.SIIR},{title:"Garip",type:T.SIIR},{title:"Mikado-nun Çöpleri",type:T.TIYATRO}]},
    { author:"Oktay Rıfat Horozcu", works:[{title:"Perçemli Sokak",type:T.SIIR}]},
    { author:"Cahit Külebi", works:[{title:"Adamın Biri",type:T.SIIR},{title:"Yeşeren Otlar",type:T.SIIR}]},
    { author:"Behçet Necatigil", works:[{title:"Kapalı Çarşı",type:T.SIIR}]},
    { author:"Özdemir Asaf", works:[{title:"Lavinia",type:T.SIIR},{title:"Yalnızlık Paylaşılmaz",type:T.SIIR},{title:"Dünya Kaçtı Gözüme",type:T.SIIR}]},
    { author:"Cemal Süreyya", works:[{title:"Üvercinka",type:T.SIIR},{title:"Göçebe",type:T.SIIR},{title:"Sevda Sözleri",type:T.SIIR}]},
    { author:"Turgut Uyar", works:[{title:"Dünyanın En Güzel Arabistanı",type:T.SIIR},{title:"Kayayı Delen İncir",type:T.SIIR},{title:"Tütünler Islak",type:T.SIIR}]},
    { author:"Edip Cansever", works:[{title:"Yerçekimli Karanfil",type:T.SIIR},{title:"İkindi Üstü",type:T.SIIR},{title:"Umutsuzlar Parkı",type:T.SIIR}]},
    { author:"Ece Ayhan", works:[{title:"Kınar Hanımın Denizleri",type:T.SIIR},{title:"Bakışsız Bir Kedi Kara",type:T.SIIR},{title:"Yort Savul",type:T.SIIR}]},
    { author:"İlhan Berk", works:[{title:"Güneşi Yakanların Selamı",type:T.SIIR},{title:"Galile Denizi",type:T.SIIR},{title:"Saint Antoine-in Güvercinleri",type:T.SIIR}]},
    { author:"Ülkü Tamer", works:[{title:"İçime Çektiğim Hava Değil Gökyüzüdür",type:T.SIIR},{title:"Konuşma",type:T.SIIR}]},
    { author:"Attila İlhan", works:[{title:"Duvar",type:T.SIIR},{title:"Sisler Bulvarı",type:T.SIIR},{title:"Ben Sana Mecburum",type:T.SIIR},{title:"Elde Var Hüzün",type:T.SIIR}]},
    { author:"Sezai Karakoç", works:[{title:"Mona Rosa",type:T.SIIR},{title:"Hızırla Kırk Saat",type:T.SIIR},{title:"Gül Muştusu",type:T.SIIR},{title:"Gün Doğmadan",type:T.SIIR}]},
    { author:"Cahit Zarifoğlu", works:[{title:"İşaret Çocukları",type:T.SIIR},{title:"Yedi Güzel Adam",type:T.SIIR}]},
    { author:"İsmet Özel", works:[{title:"Celladıma Gülümserken",type:T.SIIR},{title:"Amentü",type:T.SIIR}]},
    { author:"Ataol Behramoğlu", works:[{title:"Bir Ermeni General",type:T.SIIR}]},
    { author:"Refik Durbaş", works:[{title:"Kuş Tufanı",type:T.SIIR},{title:"Çırak Aranıyor",type:T.SIIR}]},
    { author:"Gülten Akın", works:[{title:"Rüzgar Saati",type:T.SIIR},{title:"Maraşın ve Ökkeşin Destanı",type:T.SIIR}]},
    { author:"Neşet Ertaş", works:[{title:"Gönül Dağı",type:T.SIIR},{title:"Zahidem",type:T.SIIR},{title:"Kesik Çayır",type:T.SIIR}]},
    { author:"Mahzuni Şerif", works:[{title:"İşte Gidiyorum Çeşmi Siyahım",type:T.SIIR},{title:"Domdom Kurşunu",type:T.SIIR},{title:"Yuh Yuh",type:T.SIIR}]},
    { author:"Sevinç Çokum", works:[{title:"Hilal Görününce",type:T.ROMAN},{title:"Zor",type:T.ROMAN}]},
    { author:"Memduh Şevket Esendal", works:[{title:"Otlakçı",type:T.HIKAYE},{title:"Mendil Altında",type:T.HIKAYE},{title:"Ayaşlı ile Kiracılar",type:T.HIKAYE}]},
    { author:"Selim İleri", works:[{title:"Her Gece Bodrum",type:T.ROMAN},{title:"Cumartesi Yalnızlığı",type:T.HIKAYE},{title:"Pastırma Yazı",type:T.HIKAYE}]},
    { author:"Mustafa Kutlu", works:[{title:"Ortadaki Adam",type:T.HIKAYE},{title:"Yokuşa Akan Sular",type:T.HIKAYE},{title:"Arka Kapak Yazıları",type:T.HIKAYE},{title:"Uzun Hikaye",type:T.SIIR}]},
    { author:"Orhan Kemal", works:[{title:"Bereketli Topraklar Üzerinde",type:T.ROMAN},{title:"Murtaza",type:T.ROMAN},{title:"Baba Evi",type:T.ROMAN},{title:"Ekmek Kavgası",type:T.ROMAN}]},
    { author:"Aziz Nesin", works:[{title:"Yaşar Ne-Yaşar Ne-Yaşamaz",type:T.ROMAN},{title:"Zübük",type:T.ROMAN}]},
    { author:"Necati Cumalı", works:[{title:"Tütün Zamanı",type:T.ROMAN},{title:"Acı Tütün",type:T.ROMAN},{title:"Boş Beşik",type:T.TIYATRO},{title:"Susuz Yaz",type:T.TIYATRO}]},
    { author:"Cevat Şakir Kabaağaçlı", works:[{title:"Aganta Burina Burinata",type:T.ROMAN},{title:"Turgut Reis",type:T.ROMAN}]},
    { author:"Samim Kocagöz", works:[{title:"Kalpaklılar",type:T.ROMAN},{title:"Doludizgin",type:T.ROMAN},{title:"Sam Amca",type:T.HIKAYE}]},
    { author:"Kemal Bilbaşar", works:[{title:"Cemo",type:T.ROMAN},{title:"Memo",type:T.ROMAN},{title:"Pembe Kurt",type:T.HIKAYE}]},
    { author:"Bilge Karasu", works:[{title:"Troyada Ölüm Var",type:T.HIKAYE},{title:"Göçmüş Kediler Bahçesi",type:T.HIKAYE},{title:"Gece",type:T.ROMAN}]},
    { author:"Yusuf Atılgan", works:[{title:"Aylak Adam",type:T.ROMAN},{title:"Anayurt Oteli",type:T.ROMAN},{title:"Bodur Minareden Öte",type:T.HIKAYE}]},
  ],
};

// ========== ÖNEMLİ KARAKTERLER ==========
const IMPORTANT_CHARACTERS = [
  { work:"Araba Sevdası", character:"Bihruz Bey", author:"Recaizade Mahmut Ekrem" },
  { work:"Aşk-ı Memnu", character:"Behlül", author:"Halit Ziya Uşaklıgil" },
  { work:"Aşk-ı Memnu", character:"Bihter", author:"Halit Ziya Uşaklıgil" },
  { work:"Bir Sürgün", character:"Doktor Hikmet", author:"Yakup Kadri Karaosmanoğlu" },
  { work:"Cevdet Bey ve Oğulları", character:"Ömer", author:"Orhan Pamuk" },
  { work:"Efruz Bey", character:"Efruz Bey", author:"Ömer Seyfettin" },
  { work:"Fatih-Harbiye", character:"Macit", author:"Peyami Safa" },
  { work:"Fatih-Harbiye", character:"Neriman", author:"Peyami Safa" },
  { work:"Felatun Bey ile Rakım Efendi", character:"Felatun Bey", author:"Ahmet Mithat Efendi" },
  { work:"Jön Türk", character:"Ceylan", author:"Ahmet Mithat Efendi" },
  { work:"Kiralık Konak", character:"Cemil", author:"Yakup Kadri Karaosmanoğlu" },
  { work:"Kiralık Konak", character:"Faik", author:"Yakup Kadri Karaosmanoğlu" },
  { work:"Kiralık Konak", character:"Seniha", author:"Yakup Kadri Karaosmanoğlu" },
  { work:"Kiralık Konak", character:"Servet Bey", author:"Yakup Kadri Karaosmanoğlu" },
  { work:"Mahşer", character:"Alaaddin Bey", author:"Peyami Safa" },
  { work:"Mahşer", character:"Mahir Bey", author:"Peyami Safa" },
  { work:"Mahşer", character:"Muazzez", author:"Peyami Safa" },
  { work:"Mürebbiye", character:"Dehri Efendi", author:"Hüseyin Rahmi Gürpınar" },
  { work:"Panorama", character:"Nedim", author:"Yakup Kadri Karaosmanoğlu" },
  { work:"Panorama", character:"Semra", author:"Yakup Kadri Karaosmanoğlu" },
  { work:"Panorama", character:"Sevim", author:"Yakup Kadri Karaosmanoğlu" },
  { work:"Paris'te Bir Türk", character:"Senai", author:"Ahmet Mithat Efendi" },
  { work:"Sodom ve Gomore", character:"Leyla", author:"Yakup Kadri Karaosmanoğlu" },
  { work:"Sodom ve Gomore", character:"Sami Bey", author:"Yakup Kadri Karaosmanoğlu" },
  { work:"Sözde Kızlar", character:"Behçet", author:"Peyami Safa" },
  { work:"Şık", character:"Şatırzade Şöhret Bey", author:"Hüseyin Rahmi Gürpınar" },
  { work:"Şıpsevdi", character:"Meftun", author:"Hüseyin Rahmi Gürpınar" },
  { work:"Yaprak Dökümü", character:"Leyla", author:"Reşat Nuri Güntekin" },
  { work:"Yaprak Dökümü", character:"Necla", author:"Reşat Nuri Güntekin" },
];

// ========== UNVANLAR / LAKAPLAR ==========
const TITLES_NICKNAMES = [
  { title:"Ağıtlar Şairi", person:"Recaizade Mahmut Ekrem" },
  { title:"Aka Gündüz", person:"Enis Avni" },
  { title:"Ali Ekaptanoğlu", person:"Attilâ İlhan" },
  { title:"Ali Kadir", person:"A. Kadir (İbrahim Abdülkadir Meriçboyu)" },
  { title:"Anadolu Şairi", person:"Ömer Bedrettin Uşaklı" },
  { title:"Ankaralı Aşık Ömer", person:"Behçet Kemal Çağlar" },
  { title:"Avni", person:"Fatih Sultan Mehmet" },
  { title:"Bayrak Şairi", person:"Arif Nihat Asya" },
  { title:"Bozkırın Tezenesi", person:"Neşet Ertaş" },
  { title:"Cemalettin Mahfi", person:"Kemal Tahir" },
  { title:"Çamdevrinen", person:"Faruk Nafiz Çamlıbel" },
  { title:"Çimdik", person:"Yusuf Ziya Ortaç" },
  { title:"Destan Şairi", person:"Fazıl Hüsnü Dağlarca" },
  { title:"Evler Şairi", person:"Behçet Necatigil" },
  { title:"Filozof Rıza", person:"Rıza Tevfik Bölükbaşı" },
  { title:"Gurbet Şairi", person:"Kemalettin Kamu" },
  { title:"Hacı Kalfa", person:"Katip Çelebi" },
  { title:"Halikarnas Balıkçısı", person:"Cevat Şakir Kabaağaçlı" },
  { title:"Han Duvarları Şairi", person:"Faruk Nafiz Çamlıbel" },
  { title:"Hiciv Üstadı", person:"Nef'i" },
  { title:"Hürriyet Şairi", person:"Namık Kemal" },
  { title:"Izdırap Şairi", person:"Fuzuli" },
  { title:"İstanbul Şairi", person:"Yahya Kemal Beyatlı" },
  { title:"Kaldırımlar Şairi", person:"Necip Fazıl Kısakürek" },
  { title:"Kirpi", person:"Refik Halit Karay" },
  { title:"Lale Devri Şairi", person:"Nedim" },
  { title:"Milli Şair / Türk Şairi", person:"Mehmet Emin Yurdakul" },

  { title:"Mistik Şair", person:"Necip Fazıl Kısakürek" },
  { title:"Muhibbi", person:"Kanuni Sultan Süleyman" },
  { title:"Orhan Kemal", person:"Mehmet Reşit Öğütçü" },
  { title:"Otuz Beş Yaş Şairi", person:"Cahit Sıtkı Tarancı" },
  { title:"Ölüm Şairi", person:"Cahit Sıtkı Tarancı" },
  { title:"Selimi", person:"Yavuz Sultan Selim" },
  { title:"Server Bedi", person:"Peyami Safa" },
  { title:"Sokağı Edebiyata Taşıyan Romancı", person:"Hüseyin Rahmi Gürpınar" },
  { title:"Sokağı Şiire Taşıyan Şair", person:"Orhan Veli Kanık" },
  { title:"Şair-i Azam", person:"Abdülhak Hamit Tarhan" },
  { title:"Taşlama Ustası", person:"Seyrani" },
  { title:"Tezatlar Şairi", person:"Abdülhak Hamit Tarhan" },
  { title:"Türk Tiyatrosunun Shakespeare'i", person:"Recep Bilginer" },
  { title:"Milli Şair / Vatan Şairi", person:"Mehmet Âkif Ersoy" },
  { title:"Üstat", person:"Recaizade Mahmut Ekrem" },
  { title:"Vatan Şairi", person:"Namık Kemal" },
  { title:"Yazı Makinesi", person:"Ahmet Mithat Efendi" },
  { title:"Zevk-Eğlence Şairi", person:"Nedim" },
];

// ========== EDEBİYATTA İLK'LER (PDF s.14-15) ==========
const LITERATURE_FIRSTS = [
  { first:"İlk Resmi Gazete", answer:"Takvim-i Vekayi (1831)" },
  { first:"İlk Yarı Resmi Gazete", answer:"Ceride-i Havadis (1840)" },
  { first:"İlk Özel Gazete", answer:"Tercüman-ı Ahvâl (1860, Şinasi + Agâh Efendi)" },
  { first:"İlk Mizahi Gazete", answer:"Diyojen (Teodor Kasap)" },
  { first:"İlk Türkçe Dergi", answer:"Mecmua-i Fünûn (1862)" },
  { first:"İlk Resimli Dergi", answer:"Mir'at" },
  { first:"İlk Türkçe Ekonomi Dergisi", answer:"Takvim-i Ticaret" },
  { first:"İlk Makale", answer:"Tercüman-ı Ahvâl Mukaddimesi (Şinasi)" },
  { first:"İlk Şiir Çevirisi", answer:"Tercüme-i Manzûme (Şinasi)" },
  { first:"İlk Fabl Çevirileri Yapan", answer:"Şinasi" },
  { first:"İlk Atasözleri Derlemesi", answer:"Durûb-ı Emsâl-i Osmâniye (Şinasi)" },
  { first:"İlk Noktalama İşaretlerini Kullanan", answer:"Şinasi" },
  { first:"İlk Roman Çevirisi", answer:"Telemak (Yusuf Kâmil Paşa)" },
  { first:"İlk Yerli Roman", answer:"Taaşşuk-ı Talat ve Fitnat (Şemsettin Sami)" },
  { first:"İlk Edebî Roman", answer:"İntibah (Namık Kemal)" },
  { first:"İlk Tarihî Roman", answer:"Cezmi (Namık Kemal)" },
  { first:"İlk Realist Özellikler Taşıyan Roman", answer:"Sergüzeşt (Samipaşazade Sezai)" },
  { first:"İlk Batılı Anlamda Realist Roman", answer:"Araba Sevdası (Recaizade Mahmut Ekrem)" },
  { first:"İlk Köy Romanı", answer:"Karabibik (Nabizade Nazım)" },
  { first:"İlk Psikolojik Roman Denemesi", answer:"Zehra (Nabizade Nazım)" },
  { first:"İlk Tezli Roman Denemesi", answer:"Zehra (Nabizade Nazım)" },
  { first:"İlk Polisiye Roman", answer:"Esrâr-ı Cinâyât (Ahmet Mithat Efendi)" },
  { first:"İlk Kadın Romancı", answer:"Fatma Aliye Hanım" },
  { first:"İlk Hikâye Denemesi", answer:"Müsameretnâme (Emin Nihat)" },
  { first:"İlk Yerli Hikâye", answer:"Letaif-i Rivâyât (Ahmet Mithat Efendi)" },
  { first:"İlk Batılı Anlamda Hikâye", answer:"Küçük Şeyler (Sami Paşazade Sezai)" },
  { first:"İlk Modern Tiyatro", answer:"Şair Evlenmesi (Şinasi)" },
  { first:"İlk Dram Denemesi", answer:"Hikâye-i İbrahim Paşa Be İbrahim-i Gülşenî (Hayrullah Efendi)" },
  { first:"İlk Epik Tiyatro", answer:"Keşanlı Ali Destanı (Haldun Taner)" },
  { first:"İlk Absürd Tiyatro", answer:"Canlı Maymun Lokantası (Güngör Dilmen)" },
  { first:"İlk Sahnelenen Tiyatro", answer:"Vatan Yahut Silistre (Namık Kemal)" },

  { first:"İlk Manzum Tiyatro", answer:"Sergüzeşt-i Perviz (Ali Haydar Bey)" },
  { first:"Aruzla Yazılan İlk Tiyatro", answer:"Eşber (Abdülhak Hamit Tarhan)" },
  { first:"Heceyle Yazılan İlk Tiyatro", answer:"Nesteren (Abdülhak Hamit Tarhan)" },
  { first:"İlk Pastoral Şiir", answer:"Sahra (Abdülhak Hamit Tarhan)" },
  { first:"İlk Uyaksız Şiir", answer:"Validem (Abdülhak Hamit Tarhan)" },
  { first:"İlk Köy Şiiri", answer:"Köylü Kızların Şarkısı (Muallim Naci)" },
  { first:"İlk Antoloji", answer:"Harabat (Ziya Paşa)" },
  { first:"İlk Batılı Anlamda Günlük", answer:"Seyahat Jurnali (Direktör Ali Bey)" },
  { first:"İlk Mizahi Sözlük", answer:"Lehçetü'l-Hakâyık (Direktör Ali Bey)" },
  { first:"Batılı Anlamda Mizahın İlk Örneği", answer:"Av'avanâme (Ethem Pertev Paşa)" },
  { first:"İlk Eleştiri Yazısı", answer:"Lisân-ı Osmânî'nin Edebiyat Hakkında Bazı Mülâhazâtı Şâmildir (Namık Kemal)" },
  { first:"İlk Eleştiri Kitabı", answer:"Tahrib-i Harabat (Namık Kemal)" },
  { first:"İlk Mülakat", answer:"Rüya (Ziya Paşa)" },
  { first:"İç Monolog Tarzında Yazılan İlk Roman", answer:"Bir Düğün Gecesi (Adalet Ağaoğlu)" },
  { first:"Yanlış Batılılaşmayı İşleyen İlk Roman", answer:"Felatun Bey ile Rakım Efendi (Ahmet Mithat Efendi)" },
  { first:"Kurtuluş Savaşı'nı Doğrudan İşleyen İlk Roman", answer:"Ateşten Gömlek (Halide Edip Adıvar)" },
  { first:"İlk Postmodern Roman", answer:"Tutunamayanlar (Oğuz Atay)" },
];

// ----- UI -----
const $ = (id) => document.getElementById(id);
const screens = { home:$("screen-home"), how:$("screen-how"), game:$("screen-game"), result:$("screen-result") };

const btnStart = $("btnStart");
const btnHow = $("btnHow");
const btnBackHome1 = $("btnBackHome1");
const btnBackHome2 = $("btnBackHome2");
const btnPlayAgain = $("btnPlayAgain");
const btnQuit = $("btnQuit");
const btnNext = $("btnNext");
const btnClearLb = $("btnClearLb");
const btnSound = $("btnSound");

const categoryEl = $("category");
const genreRowEl = $("genreRow");
const genreEl = $("genre");
const questionCountEl = $("questionCount");
const minutesEl = $("minutes");
const nicknameEl = $("nickname");
const nickHelpEl = $("nickHelp");

const bestSuccessEl = $("bestSuccess");
const totalGamesEl = $("totalGames");
const leaderboardEl = $("leaderboard");

const qIndexEl = $("qIndex");
const qTotalEl = $("qTotal");
const successEl = $("success");
const timeEl = $("time");
const qTagEl = $("qTag");
const questionEl = $("question");
const choicesEl = $("choices");
const feedbackEl = $("feedback");

const authorPanelEl = $("authorPanel");
const authorImgEl = $("authorImg");
const authorNameEl = $("authorName");
const authorHintEl = $("authorHint");

const resScoreEl = $("resScore");
const resCorrectEl = $("resCorrect");
const resWrongEl = $("resWrong");
const resEmptyEl = $("resEmpty");

const mistakeAnalysisEl = $("mistakeAnalysis"); // yoksa sadece render edilmez

// ----- Labels -----
const CATEGORY_LABEL = {
  halk:"Halk",
  divan:"Divan",
  tanzimat:"Tanzimat",
  servetifun:"Servet-i Fünun",
  fecriat:"Fecr-i Ati",
  milli:"Milli",
  cumhuriyet:"Cumhuriyet",
  karisik:"Genel Karışık",
  onemli_karakterler:"Önemli Karakterler",
  unvanlar_lakaplar:"Unvanlar/Lakaplar",
  edebiyatta_ilkler:"Edebiyatta İlk'ler",
};
const GENRE_LABEL = {
  roman:"Roman", hikaye:"Hikaye", tiyatro:"Tiyatro", siir:"Şiir",
  mix_roman:"Karışık Roman", mix_hikaye:"Karışık Hikaye", mix_tiyatro:"Karışık Tiyatro", mix_siir:"Karışık Şiir",
  mix_all:"Hepsi Karışık",
  period_mix:"Karışık",
  char_mix:"Karışık",
  title_mix:"Karışık",
  first_mix:"Karışık",
};

// ----- State -----
let state = {
  settings: { category:"karisik", genreMode:"mix_all", count:20, minutes:8, nickname:"" },
  questions: [],
  index: 0,
  firstTryCorrect: 0,
  firstTryWrong: 0,
  firstTryMarked: [],
  solved: [],
  timer: null,
  endsAt: 0,
  recentWorks: [],
  soundEnabled: true,
  _lastMel: 0,
  mistakesByTag: {},
};

// ----- Utils -----
function show(screenName){
  Object.values(screens).forEach(s => s.classList.add("hidden"));
  screens[screenName].classList.remove("hidden");
}
function shuffle(arr){
  const a=[...arr];
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}
function clamp(n,min,max){ return Math.max(min, Math.min(max,n)); }
function formatTime(ms){
  const total=Math.max(0, Math.floor(ms/1000));
  const m=String(Math.floor(total/60)).padStart(2,"0");
  const s=String(total%60).padStart(2,"0");
  return `${m}:${s}`;
}
function normalizeNick(s){ return (s||"").trim(); }
function isNickValid(s){
  const nick=normalizeNick(s);
  return nick.length>=3 && nick.length<=15;
}
function refreshStartButton(){
  const ok=isNickValid(nicknameEl.value);
  btnStart.disabled=!ok;
  nickHelpEl.style.color = ok ? "rgba(61,220,151,.85)" : "rgba(233,239,255,.55)";
}
function escapeHtml(str){
  return String(str).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
    .replaceAll('"',"&quot;").replaceAll("'","&#039;");
}
function uniq(arr){ return [...new Set(arr)]; }

// ====== Doğru şık: EŞİT + RANDOM ======
let slotBag = [];
function refillSlotBag(){ slotBag = shuffle([0,1,2,3]); }
function nextCorrectSlot(){
  if(slotBag.length===0) refillSlotBag();
  return slotBag.pop();
}
function buildOptionsWithFixedCorrect(correctValue, wrongValues, targetIndex){
  const wrongs = shuffle([...wrongValues]).slice(0,3);
  if(wrongs.length < 3) return null;
  const opts = new Array(4);
  opts[targetIndex] = correctValue;
  let wi = 0;
  for(let i=0;i<4;i++){
    if(i===targetIndex) continue;
    opts[i] = wrongs[wi++];
  }
  return opts;
}
// =====================================

function allItems(){ return Object.values(DB).flat(); }
function getPoolByCategory(cat){ return cat==="karisik" ? allItems() : (DB[cat] || allItems()); }
function allWorks(items){
  const out=[];
  for(const a of items) for(const w of a.works) out.push({ title:w.title, type:w.type, author:a.author });
  return out;
}
function uniqueAuthors(items){ return [...new Set(items.map(x=>x.author))]; }
function availableTypesInCategory(cat){
  const items=getPoolByCategory(cat);
  const types=new Set();
  for(const a of items) for(const w of a.works) types.add(w.type);
  return [...types];
}

function pushRecentWork(key){
  state.recentWorks.push(key);
  if(state.recentWorks.length>10) state.recentWorks.shift();
}
function isInRecent(key){ return state.recentWorks.includes(key); }

function calcSuccessPercent(){
  const total=state.questions.length;
  return total ? clamp(Math.round((state.firstTryCorrect/total)*100),0,100) : 0;
}
function updateSuccessUI(){ successEl.textContent=String(calcSuccessPercent()); }

// ----- Leaderboard -----
const LB_KEY="ayt_leaderboard_v1";
function loadLeaderboard(){ try{ return JSON.parse(localStorage.getItem(LB_KEY)||"[]"); }catch{ return []; } }
function saveLeaderboard(list){ localStorage.setItem(LB_KEY, JSON.stringify(list)); }
function addLeaderboardEntry(entry){
  const list=loadLeaderboard();
  list.push(entry);
  list.sort((a,b)=>{
    if(b.success!==a.success) return b.success-a.success;
    if(a.minutes!==b.minutes) return a.minutes-b.minutes;
    return b.count-a.count;
  });
  saveLeaderboard(list.slice(0,30));
  renderLeaderboard();
}
function renderLeaderboard(){
  const list=loadLeaderboard();
  if(list.length===0){
    leaderboardEl.innerHTML = `
      <div class="lbRow">
        <div class="lbRank">—</div>
        <div class="lbMain">
          <div class="lbNick">Henüz kayıt yok</div>
          <div class="lbMeta">İlk oyunu bitiren buraya düşer.</div>
        </div>
        <div class="lbScore">—</div>
      </div>`;
    return;
  }
  leaderboardEl.innerHTML = list.map((x,idx)=>{
    const meta = `${x.categoryLabel} • ${x.genreLabel} • ${x.count}s • ${x.minutes}dk`;
    return `
      <div class="lbRow">
        <div class="lbRank">#${idx+1}</div>
        <div class="lbMain">
          <div class="lbNick">${escapeHtml(x.nick)}</div>
          <div class="lbMeta">${escapeHtml(meta)}</div>
        </div>
        <div class="lbScore">${x.success}%</div>
      </div>`;
  }).join("");
}
function clearLeaderboard(){ localStorage.removeItem(LB_KEY); renderLeaderboard(); }

// ----- Stats -----
function loadStats(){
  const best=Number(localStorage.getItem("ayt_best_success")||"0");
  const games=Number(localStorage.getItem("ayt_games")||"0");
  bestSuccessEl.textContent=`${best}%`;
  totalGamesEl.textContent=games;
}

// ----- Kategori seçeneklerini HTML’e dokunmadan ekle -----
function ensureExtraCategories(){
  if(!categoryEl) return;

  const need = [
    { value:"onemli_karakterler", text:"Önemli Karakterler" },
    { value:"unvanlar_lakaplar", text:"Unvanlar/Lakaplar" },
    { value:"edebiyatta_ilkler", text:"Edebiyatta İlk'ler" },
  ];

  for(const n of need){
    const exists = [...categoryEl.querySelectorAll("option")].some(o=>o.value===n.value);
    if(!exists){
      const op=document.createElement("option");
      op.value=n.value;
      op.textContent=n.text;
      categoryEl.appendChild(op);
    }
  }
}

// ----- Genre dropdown -----
function setGenreOptions(){
  const cat = categoryEl.value;

  genreEl.innerHTML = "";
  genreRowEl.classList.add("hidden");

  if(cat === "onemli_karakterler"){
    const op=document.createElement("option");
    op.value="char_mix";
    op.textContent="Karışık";
    genreEl.appendChild(op);
    genreEl.value="char_mix";
    genreRowEl.classList.remove("hidden");
    return;
  }

  if(cat === "unvanlar_lakaplar"){
    const op=document.createElement("option");
    op.value="title_mix";
    op.textContent="Karışık";
    genreEl.appendChild(op);
    genreEl.value="title_mix";
    genreRowEl.classList.remove("hidden");
    return;
  }

  if(cat === "edebiyatta_ilkler"){
    const op=document.createElement("option");
    op.value="first_mix";
    op.textContent="Karışık";
    genreEl.appendChild(op);
    genreEl.value="first_mix";
    genreRowEl.classList.remove("hidden");
    return;
  }

  if(cat === "karisik"){
    const opts=[
      {value:"mix_roman", label:GENRE_LABEL.mix_roman},
      {value:"mix_hikaye", label:GENRE_LABEL.mix_hikaye},
      {value:"mix_tiyatro", label:GENRE_LABEL.mix_tiyatro},
      {value:"mix_siir", label:GENRE_LABEL.mix_siir},
      {value:"mix_all", label:GENRE_LABEL.mix_all},
    ];
    for(const o of opts){
      const op=document.createElement("option");
      op.value=o.value; op.textContent=o.label;
      genreEl.appendChild(op);
    }
    genreEl.value="mix_all";
    genreRowEl.classList.remove("hidden");
    return;
  }

  const noPeriodMix = (cat==="halk" || cat==="divan");
  const types = availableTypesInCategory(cat);
  const order=[T.ROMAN,T.HIKAYE,T.TIYATRO,T.SIIR];
  const toShow=order.filter(t=>types.includes(t));

  if(toShow.length===0){
    genreRowEl.classList.add("hidden");
    return;
  }

  if(!noPeriodMix){
    const opMix=document.createElement("option");
    opMix.value="period_mix";
    opMix.textContent="Karışık";
    genreEl.appendChild(opMix);
  }

  for(const t of toShow){
    const op=document.createElement("option");
    op.value=t;
    op.textContent=GENRE_LABEL[t];
    genreEl.appendChild(op);
  }

  genreEl.value = (!noPeriodMix) ? "period_mix" : toShow[0];
  genreRowEl.classList.remove("hidden");
}

// ----- Filtering -----
function filterItemsByGenre(items, genreType){
  const out=[];
  for(const a of items){
    const works=a.works.filter(w=>w.type===genreType);
    if(works.length>0) out.push({ author:a.author, works });
  }
  return out;
}
function getItemsBySelectedFilters(){
  const cat = state.settings.category;
  const gm = state.settings.genreMode;

  if(cat==="onemli_karakterler") return null;
  if(cat==="unvanlar_lakaplar") return null;
  if(cat==="edebiyatta_ilkler") return null;

  if(cat==="karisik"){
    const all = allItems();
    if(gm==="mix_all") return all;
    const map={ mix_roman:T.ROMAN, mix_hikaye:T.HIKAYE, mix_tiyatro:T.TIYATRO, mix_siir:T.SIIR };
    return filterItemsByGenre(all, map[gm]);
  }

  const items=getPoolByCategory(cat);
  if(gm==="period_mix") return items;
  return filterItemsByGenre(items, gm);
}

// ====== Analiz için: yazar -> dönem etiketi ======
function buildPeriodByAuthor(){
  const periodByAuthor = new Map();
  for (const [periodKey, arr] of Object.entries(DB)) {
    for (const it of arr) {
      if (!periodByAuthor.has(it.author)) periodByAuthor.set(it.author, CATEGORY_LABEL[periodKey] || periodKey);
    }
  }
  return periodByAuthor;
}

// ====== Önemli Karakter soruları ======
function buildCharacterQuestions(count){
  const pool = IMPORTANT_CHARACTERS;
  if(!pool || pool.length < 12) return { ok:false, msg:"Önemli Karakterler havuzu küçük görünüyor." };

  const works = uniq(pool.map(x=>x.work));
  const chars = uniq(pool.map(x=>x.character));

  const byWork = new Map();
  const byChar = new Map();
  for(const x of pool){
    if(!byWork.has(x.work)) byWork.set(x.work, []);
    byWork.get(x.work).push(x);

    if(!byChar.has(x.character)) byChar.set(x.character, []);
    byChar.get(x.character).push(x);
  }

  const tag = `${CATEGORY_LABEL.onemli_karakterler} • ${GENRE_LABEL.char_mix}`;
  state.recentWorks = [];
  const qs = [];

  for(let i=0;i<count;i++){
    const pick = Math.random() < 0.5; // true => char->work
    let q=null, tries=0;

    while(!q && tries<120){
      tries++;
      const correctSlot = nextCorrectSlot();

      if(pick){
        const c = chars[Math.floor(Math.random()*chars.length)];
        const entries = byChar.get(c) || [];
        if(entries.length===0) continue;
        if(isInRecent("C:"+c)) continue;

        const correct = entries[Math.floor(Math.random()*entries.length)];
        const correctWork = correct.work;

        const wrongWorks = shuffle(works.filter(w=>w!==correctWork)).slice(0,3);
        const arranged = buildOptionsWithFixedCorrect(correctWork, wrongWorks, correctSlot);
        if(!arranged) continue;

        q = {
          kind: QK.CHAR_TO_WORK,
          tag,
          prompt: `“${c}” aşağıdaki eserlerden hangisinin önemli bir karakteridir?`,
          options: arranged.map(t=>({label:t,value:t})),
          correctIndex: correctSlot,
          correctAuthors: null,
          authorToShow: null,
          recentKey: "C:"+c,
          analysisKey: c,
          periodLabel: "Genel",
        };
      } else {
        const w = works[Math.floor(Math.random()*works.length)];
        const entries = byWork.get(w) || [];
        if(entries.length===0) continue;
        if(isInRecent("W:"+w)) continue;

        const correct = entries[Math.floor(Math.random()*entries.length)];
        const correctChar = correct.character;

        const wrongChars = shuffle(chars.filter(c=>c!==correctChar)).slice(0,3);
        const arranged = buildOptionsWithFixedCorrect(correctChar, wrongChars, correctSlot);
        if(!arranged) continue;

        q = {
          kind: QK.WORK_TO_CHAR,
          tag,
          prompt: `“${w}” adlı eserin önemli karakterlerinden biri aşağıdakilerden hangisidir?`,
          options: arranged.map(t=>({label:t,value:t})),
          correctIndex: correctSlot,
          correctAuthors: null,
          authorToShow: null,
          recentKey: "W:"+w,
          analysisKey: correctChar,
          periodLabel: "Genel",
        };
      }
    }

    if(!q){
      const fallback = pool[Math.floor(Math.random()*pool.length)];
      const correctSlot = nextCorrectSlot();
      const wrongWorks = shuffle(works.filter(w=>w!==fallback.work)).slice(0,3);
      const arranged = buildOptionsWithFixedCorrect(fallback.work, wrongWorks, correctSlot) || shuffle([fallback.work, ...wrongWorks]).slice(0,4);

      q = {
        kind: QK.CHAR_TO_WORK,
        tag,
        prompt: `“${fallback.character}” aşağıdaki eserlerden hangisinin önemli bir karakteridir?`,
        options: arranged.map(t=>({label:t,value:t})),
        correctIndex: correctSlot,
        correctAuthors: null,
        authorToShow: null,
        recentKey: "C:"+fallback.character,
        analysisKey: fallback.character,
        periodLabel: "Genel",
      };
    }

    pushRecentWork(q.recentKey);
    qs.push(q);
  }

  return { ok:true, questions:qs };
}

// ====== Unvan/Lakap soruları ======
function buildTitleQuestions(count){
  const pool = TITLES_NICKNAMES;
  if(!pool || pool.length < 12) return { ok:false, msg:"Unvanlar/Lakaplar havuzu küçük görünüyor." };

  const titles = uniq(pool.map(x=>x.title));
  const persons = uniq(pool.map(x=>x.person));

  const byTitle = new Map();
  const byPerson = new Map();
  for(const x of pool){
    if(!byTitle.has(x.title)) byTitle.set(x.title, []);
    byTitle.get(x.title).push(x);

    if(!byPerson.has(x.person)) byPerson.set(x.person, []);
    byPerson.get(x.person).push(x);
  }

  const tag = `${CATEGORY_LABEL.unvanlar_lakaplar} • ${GENRE_LABEL.title_mix}`;
  state.recentWorks = [];
  const qs = [];

  for(let i=0;i<count;i++){
    const pick = Math.random() < 0.5; // true => title->person
    let q=null, tries=0;

    while(!q && tries<120){
      tries++;
      const correctSlot = nextCorrectSlot();

      if(pick){
        const t = titles[Math.floor(Math.random()*titles.length)];
        const entries = byTitle.get(t) || [];
        if(entries.length===0) continue;
        if(isInRecent("T:"+t)) continue;

        const correct = entries[Math.floor(Math.random()*entries.length)];
        const correctPerson = correct.person;

        const wrongPersons = shuffle(persons.filter(p=>p!==correctPerson)).slice(0,3);
        const arranged = buildOptionsWithFixedCorrect(correctPerson, wrongPersons, correctSlot);
        if(!arranged) continue;

        q = {
          kind: QK.TITLE_TO_PERSON,
          tag,
          prompt: `“${t}” unvanı/lakabı kime aittir?`,
          options: arranged.map(v=>({label:v,value:v})),
          correctIndex: correctSlot,
          correctAuthors: null,
          authorToShow: null,
          recentKey: "T:"+t,
          analysisKey: correctPerson,
          periodLabel: "Genel",
        };
      } else {
        const p = persons[Math.floor(Math.random()*persons.length)];
        const entries = byPerson.get(p) || [];
        if(entries.length===0) continue;
        if(isInRecent("P:"+p)) continue;

        const correct = entries[Math.floor(Math.random()*entries.length)];
        const correctTitle = correct.title;

        const wrongTitles = shuffle(titles.filter(t=>t!==correctTitle)).slice(0,3);
        const arranged = buildOptionsWithFixedCorrect(correctTitle, wrongTitles, correctSlot);
        if(!arranged) continue;

        q = {
          kind: QK.PERSON_TO_TITLE,
          tag,
          prompt: `“${p}” için kullanılan unvan/lakap hangisidir?`,
          options: arranged.map(v=>({label:v,value:v})),
          correctIndex: correctSlot,
          correctAuthors: null,
          authorToShow: null,
          recentKey: "P:"+p,
          analysisKey: p,
          periodLabel: "Genel",
        };
      }
    }

    if(!q){
      const fallback = pool[Math.floor(Math.random()*pool.length)];
      const correctSlot = nextCorrectSlot();
      const wrongPersons = shuffle(persons.filter(p=>p!==fallback.person)).slice(0,3);
      const arranged = buildOptionsWithFixedCorrect(fallback.person, wrongPersons, correctSlot) || shuffle([fallback.person, ...wrongPersons]).slice(0,4);

      q = {
        kind: QK.TITLE_TO_PERSON,
        tag,
        prompt: `“${fallback.title}” unvanı/lakabı kime aittir?`,
        options: arranged.map(v=>({label:v,value:v})),
        correctIndex: correctSlot,
        correctAuthors: null,
        authorToShow: null,
        recentKey: "T:"+fallback.title,
        analysisKey: fallback.person,
        periodLabel: "Genel",
      };
    }

    pushRecentWork(q.recentKey);
    qs.push(q);
  }

  return { ok:true, questions:qs };
}

// ====== Edebiyatta İlk'ler soruları ======
function buildFirstQuestions(count){
  const pool = LITERATURE_FIRSTS;
  if(!pool || pool.length < 12) return { ok:false, msg:"Edebiyatta İlk'ler havuzu küçük görünüyor." };

  const firsts = uniq(pool.map(x=>x.first));
  const answers = uniq(pool.map(x=>x.answer));

  const byFirst = new Map();
  const byAnswer = new Map();
  for(const x of pool){
    if(!byFirst.has(x.first)) byFirst.set(x.first, []);
    byFirst.get(x.first).push(x);

    if(!byAnswer.has(x.answer)) byAnswer.set(x.answer, []);
    byAnswer.get(x.answer).push(x);
  }

  const tag = `${CATEGORY_LABEL.edebiyatta_ilkler} • ${GENRE_LABEL.first_mix}`;
  state.recentWorks = [];
  const qs = [];

  for(let i=0;i<count;i++){
    const pick = Math.random() < 0.5; // true => first -> answer
    let q=null, tries=0;

    while(!q && tries<120){
      tries++;
      const correctSlot = nextCorrectSlot();

      if(pick){
        const f = firsts[Math.floor(Math.random()*firsts.length)];
        const entries = byFirst.get(f) || [];
        if(entries.length===0) continue;
        if(isInRecent("F:"+f)) continue;

        const correct = entries[Math.floor(Math.random()*entries.length)];
        const correctAnswer = correct.answer;

        const wrongAnswers = shuffle(answers.filter(a=>a!==correctAnswer)).slice(0,3);
        const arranged = buildOptionsWithFixedCorrect(correctAnswer, wrongAnswers, correctSlot);
        if(!arranged) continue;

        q = {
          kind: QK.FIRST_TO_ANSWER,
          tag,
          prompt: `${f} hangisidir?`,
          options: arranged.map(v=>({label:v,value:v})),
          correctIndex: correctSlot,
          correctAuthors: null,
          authorToShow: null,
          recentKey: "F:"+f,
          analysisKey: f,        // analiz: hangi "ilk"te çok yanıldın
          periodLabel: "Genel",
        };
      } else {
        const a = answers[Math.floor(Math.random()*answers.length)];
        const entries = byAnswer.get(a) || [];
        if(entries.length===0) continue;
        if(isInRecent("A:"+a)) continue;

        const correct = entries[Math.floor(Math.random()*entries.length)];
        const correctFirst = correct.first;

        const wrongFirsts = shuffle(firsts.filter(f=>f!==correctFirst)).slice(0,3);
        const arranged = buildOptionsWithFixedCorrect(correctFirst, wrongFirsts, correctSlot);
        if(!arranged) continue;

        q = {
          kind: QK.ANSWER_TO_FIRST,
          tag,
          prompt: `“${a}” aşağıdakilerden hangisinin “ilk”idir?`,
          options: arranged.map(v=>({label:v,value:v})),
          correctIndex: correctSlot,
          correctAuthors: null,
          authorToShow: null,
          recentKey: "A:"+a,
          analysisKey: correctFirst,
          periodLabel: "Genel",
        };
      }
    }

    if(!q){
      const fallback = pool[Math.floor(Math.random()*pool.length)];
      const correctSlot = nextCorrectSlot();
      const wrongAnswers = shuffle(answers.filter(a=>a!==fallback.answer)).slice(0,3);
      const arranged = buildOptionsWithFixedCorrect(fallback.answer, wrongAnswers, correctSlot) || shuffle([fallback.answer, ...wrongAnswers]).slice(0,4);

      q = {
        kind: QK.FIRST_TO_ANSWER,
        tag,
        prompt: `${fallback.first} hangisidir?`,
        options: arranged.map(v=>({label:v,value:v})),
        correctIndex: correctSlot,
        correctAuthors: null,
        authorToShow: null,
        recentKey: "F:"+fallback.first,
        analysisKey: fallback.first,
        periodLabel: "Genel",
      };
    }

    pushRecentWork(q.recentKey);
    qs.push(q);
  }

  return { ok:true, questions:qs };
}

// ----- Questions (Genel) -----
function buildQuestions(count){
  if(state.settings.category === "onemli_karakterler") return buildCharacterQuestions(count);
  if(state.settings.category === "unvanlar_lakaplar") return buildTitleQuestions(count);
  if(state.settings.category === "edebiyatta_ilkler") return buildFirstQuestions(count);

  const items=getItemsBySelectedFilters();
  const works=allWorks(items);
  const authors=uniqueAuthors(items);

  if(works.length<12 || authors.length<6){
    return { ok:false, msg:"Bu filtrede havuz küçük. Tür/Kategori değiştir veya Karışık seç." };
  }

  const periodByAuthor = buildPeriodByAuthor();
  state.recentWorks=[];

  const catLabel=CATEGORY_LABEL[state.settings.category]||"Genel";
  const genreLabel=GENRE_LABEL[state.settings.genreMode]||state.settings.genreMode||"";
  const tag=`${catLabel} • ${genreLabel}`;

  const titleToAuthors=new Map();
  for(const w of works){
    const arr=titleToAuthors.get(w.title)||[];
    arr.push(w.author);
    titleToAuthors.set(w.title, arr);
  }

  const authorToWorks=new Map();
  for(const it of items) authorToWorks.set(it.author, it.works.map(x=>x.title));

  const shuffledWorks=shuffle(works);
  const shuffledAuthors=shuffle([...authorToWorks.keys()]);
  let wPtr=0, aPtr=0;

  const qs=[];

  for(let i=0;i<count;i++){
    const pickA2W = (Math.random()<0.5);
    let q=null;
    let tries=0;

    while(!q && tries<150){
      tries++;
      const correctSlot = nextCorrectSlot();

      if(pickA2W){
        const a=shuffledAuthors[aPtr%shuffledAuthors.length]; aPtr++;
        const list=authorToWorks.get(a)||[];
        if(list.length===0) continue;

        const correctTitle=list[Math.floor(Math.random()*list.length)];
        if(isInRecent("W:"+correctTitle)) continue;

        const otherWorks=works.filter(x=>x.author!==a);
        const wrongTitles=shuffle(otherWorks).map(x=>x.title).filter(t=>t!==correctTitle).slice(0,3);
        if(wrongTitles.length<3) continue;

        const arranged = buildOptionsWithFixedCorrect(correctTitle, wrongTitles, correctSlot);
        if(!arranged) continue;

        q={
          kind:QK.AUTHOR_TO_WORK,
          tag,
          prompt:`${a} aşağıdakilerden hangisini yazmıştır?`,
          options:arranged.map(t=>({label:t,value:t})),
          correctIndex:correctSlot,
          correctAuthors:null,
          authorToShow:a,
          recentKey:"W:"+correctTitle,
          periodLabel: periodByAuthor.get(a) || (CATEGORY_LABEL[state.settings.category] || "Genel"),
        };
      } else {
        const target=shuffledWorks[wPtr%shuffledWorks.length]; wPtr++;
        const title=target.title;
        if(isInRecent("W:"+title)) continue;

        const correctAuthorsArr=[...new Set(titleToAuthors.get(title)||[])];
        if(correctAuthorsArr.length===0) continue;

        const shownCorrect=correctAuthorsArr[Math.floor(Math.random()*correctAuthorsArr.length)];
        const wrongPool=authors.filter(a=>!correctAuthorsArr.includes(a));
        const wrongs=shuffle(wrongPool).slice(0,3);
        if(wrongs.length<3) continue;

        const arranged = buildOptionsWithFixedCorrect(shownCorrect, wrongs, correctSlot);
        if(!arranged) continue;

        q={
          kind:QK.WORK_TO_AUTHOR,
          tag,
          prompt:`“${title}” adlı eser kime aittir?`,
          options:arranged.map(a=>({label:a,value:a})),
          correctIndex:correctSlot,
          correctAuthors:new Set(correctAuthorsArr),
          authorToShow:null,
          recentKey:"W:"+title,
          periodLabel: periodByAuthor.get(shownCorrect) || (CATEGORY_LABEL[state.settings.category] || "Genel"),
        };
      }
    }

    if(!q){
      const target=works[Math.floor(Math.random()*works.length)];
      const title=target.title;
      const correctAuthorsArr=[...new Set(titleToAuthors.get(title)||[target.author])];
      const shownCorrect = correctAuthorsArr[0];
      const wrongPool=authors.filter(a=>!correctAuthorsArr.includes(a));
      const wrongs=shuffle(wrongPool).slice(0,3);

      const correctSlot = nextCorrectSlot();
      const arranged = buildOptionsWithFixedCorrect(shownCorrect, wrongs, correctSlot) || shuffle([shownCorrect, ...wrongs]).slice(0,4);

      q={
        kind:QK.WORK_TO_AUTHOR,
        tag,
        prompt:`“${title}” adlı eser kime aittir?`,
        options:arranged.map(a=>({label:a,value:a})),
        correctIndex:correctSlot,
        correctAuthors:new Set(correctAuthorsArr),
        authorToShow:null,
        recentKey:"W:"+title,
        periodLabel: (CATEGORY_LABEL[state.settings.category] || "Genel"),
      };
    }

    pushRecentWork(q.recentKey);
    qs.push(q);
  }

  return { ok:true, questions:qs };
}

// ----- Author image -----
const authorImgCache=new Map();
async function fetchWikiThumb(lang,title){
  const url=`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replaceAll(" ","_"))}`;
  const res=await fetch(url,{mode:"cors"});
  if(!res.ok) return null;
  const data=await res.json();
  return data?.thumbnail?.source || null;
}
async function getAuthorImageUrl(authorName){
  if(authorImgCache.has(authorName)) return authorImgCache.get(authorName);
  let url=await fetchWikiThumb("tr", authorName);
  if(!url) url=await fetchWikiThumb("en", authorName);
  authorImgCache.set(authorName,url);
  return url;
}
async function setAuthorPanel(authorName){
  if(
    state.settings.category === "onemli_karakterler" ||
    state.settings.category === "unvanlar_lakaplar" ||
    state.settings.category === "edebiyatta_ilkler"
  ){
    authorPanelEl.classList.add("hidden");
    return;
  }

  if(!authorName){
    authorPanelEl.classList.add("hidden");
    return;
  }
  authorPanelEl.classList.remove("hidden");
  authorNameEl.textContent=authorName;
  authorImgEl.src="";
  authorHintEl.textContent="Fotoğraf aranıyor…";
  try{
    const url=await getAuthorImageUrl(authorName);
    if(url){
      authorImgEl.src=url;
      authorHintEl.textContent="Kaynak: Wikipedia/Wikimedia";
    }else{
      authorHintEl.textContent="Bu yazar için otomatik foto bulunamadı.";
    }
  }catch{
    authorHintEl.textContent="Fotoğraf yüklenemedi (bağlantı engeli olabilir).";
  }
}

// ----- SOUND -----
let audio={ ctx:null, master:null, bgGain:null };
function ensureAudio(){
  if(audio.ctx) return;
  const ctx=new (window.AudioContext||window.webkitAudioContext)();
  audio.ctx=ctx;
  audio.master=ctx.createGain();
  audio.master.gain.value=0.9;
  audio.master.connect(ctx.destination);
  audio.bgGain=ctx.createGain();
  audio.bgGain.gain.value=0.14;
  audio.bgGain.connect(audio.master);
}
let bgLoop={ timer:null, step:0 };

function startBackgroundLoop(){
  ensureAudio();
  const ctx=audio.ctx;
  if(ctx.state==="suspended") ctx.resume();
  if(bgLoop.timer) return;

  const tempo=68;
  const beat=60/tempo;
  const stepTime=beat/2;
  const totalSteps=16*8;

  const scale=[220.00,261.63,293.66,329.63,392.00,440.00,523.25,587.33];

  function playPad(rootFreq,time,dur){
    const o1=ctx.createOscillator();
    const o2=ctx.createOscillator();
    const g=ctx.createGain();
    const lp=ctx.createBiquadFilter();

    o1.type="sine";
    o2.type="triangle";
    o1.frequency.setValueAtTime(rootFreq,time);
    o2.frequency.setValueAtTime(rootFreq*1.5,time);

    lp.type="lowpass";
    lp.frequency.value=1100;

    g.gain.setValueAtTime(0.0001,time);
    g.gain.exponentialRampToValueAtTime(0.10,time+1.2);
    g.gain.exponentialRampToValueAtTime(0.0001,time+dur);

    o1.connect(lp); o2.connect(lp);
    lp.connect(g); g.connect(audio.bgGain);

    o1.start(time); o2.start(time);
    o1.stop(time+dur+0.1); o2.stop(time+dur+0.1);
  }

  function playMelody(freq,time){
    const o=ctx.createOscillator();
    const g=ctx.createGain();
    const lp=ctx.createBiquadFilter();

    o.type="triangle";
    o.frequency.setValueAtTime(freq,time);

    lp.type="lowpass";
    lp.frequency.value=2600;

    g.gain.setValueAtTime(0.0001,time);
    g.gain.exponentialRampToValueAtTime(0.08,time+0.03);
    g.gain.exponentialRampToValueAtTime(0.0001,time+stepTime*0.95);

    o.connect(lp); lp.connect(g); g.connect(audio.bgGain);
    o.start(time); o.stop(time+stepTime+0.05);
  }

  const padRoots=[220.00,174.61,261.63,196.00];

  function schedule(){
    if(!state.soundEnabled) return;
    const now=ctx.currentTime+0.08;

    if(bgLoop.step % 16 === 0){
      const idx=Math.floor((bgLoop.step/16) % padRoots.length);
      playPad(padRoots[idx], now, beat*8);
    }

    if(Math.random() > 0.40){
      const last=scale[state._lastMel] || scale[0];
      let pick=scale[Math.floor(Math.random()*scale.length)];
      if(Math.random() < 0.65){
        const near=scale.filter(f=>Math.abs(f-last)<=200);
        if(near.length) pick=near[Math.floor(Math.random()*near.length)];
      }
      state._lastMel = Math.max(0, scale.indexOf(pick));
      playMelody(pick, now);
    }

    bgLoop.step++;
    if(bgLoop.step>=totalSteps) bgLoop.step=0;
  }

  bgLoop.timer=setInterval(schedule, stepTime*1000);
}

function stopBackgroundLoop(){
  if(bgLoop.timer){
    clearInterval(bgLoop.timer);
    bgLoop.timer=null;
    bgLoop.step=0;
  }
}

function playSfx(type){
  if(!state.soundEnabled) return;
  ensureAudio();
  const ctx=audio.ctx;
  if(ctx.state==="suspended") ctx.resume();

  const o=ctx.createOscillator();
  const g=ctx.createGain();
  const f=ctx.createBiquadFilter();

  f.type="lowpass";
  f.frequency.value = type==="good" ? 1800 : 900;
  o.type = type==="good" ? "sine" : "square";
  o.frequency.value = type==="good" ? 880 : 140;

  const now=ctx.currentTime;
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(type==="good" ? 0.08 : 0.06, now+0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, now+0.65);

  o.connect(f); f.connect(g); g.connect(audio.master);
  o.start(now); o.stop(now+0.7);
}

// ----- Analysis render -----
function renderMistakeAnalysis(){
  if(!mistakeAnalysisEl) return;

  const totalWrong = state.firstTryWrong;
  const entries = Object.entries(state.mistakesByTag || {});

  if(!totalWrong || entries.length===0){
    mistakeAnalysisEl.innerHTML = `
      <div class="analysisTitle">Hata Analizi</div>
      <div class="analysisHint">İlk denemede yanlış yaptığın soru yok.</div>
    `;
    return;
  }

  const cat = state.settings.category;

  let title = "Yazar Bazlı Hata Analizi";
  if(cat === "karisik") title = "Dönem Bazlı Hata Analizi";
  if(cat === "onemli_karakterler") title = "Karakter Bazlı Hata Analizi";
  if(cat === "unvanlar_lakaplar") title = "Kişi Bazlı Hata Analizi";
  if(cat === "edebiyatta_ilkler") title = "“İlk” Başlığı Bazlı Hata Analizi";

  const rows = entries
    .map(([k,v]) => ({ key:k, val:v, pct: Math.round((v/totalWrong)*100) }))
    .sort((a,b) => b.val - a.val);

  mistakeAnalysisEl.innerHTML = `
    <div class="analysisTitle">${escapeHtml(title)}</div>
    ${rows.slice(0, 12).map(r => `
      <div class="analysisRow">
        <div class="analysisKey">${escapeHtml(r.key)}</div>
        <div class="analysisVal">%${r.pct}</div>
      </div>
    `).join("")}
    <div class="analysisHint">Yüzdeler, toplam yanlışlarının dağılımıdır (ilk deneme).</div>
  `;
}

// ----- Game flow -----
function startGame(){
  const nick=normalizeNick(nicknameEl.value);
  if(!isNickValid(nick)) return;

  slotBag = [];
  state.mistakesByTag = {};

  state.settings.nickname=nick;
  state.settings.category=categoryEl.value;
  state.settings.genreMode=genreEl.value;
  state.settings.count=Number(questionCountEl.value);
  state.settings.minutes=Number(minutesEl.value);

  const count=clamp(state.settings.count,1,100);
  const built=buildQuestions(count);
  if(!built.ok){ alert(built.msg); return; }

  state.questions=built.questions;
  state.index=0;
  state.firstTryCorrect=0;
  state.firstTryWrong=0;
  state.firstTryMarked=new Array(count).fill(null);
  state.solved=new Array(count).fill(false);

  qTotalEl.textContent=String(count);
  updateSuccessUI();

  const durationMs=state.settings.minutes*60*1000;
  state.endsAt=Date.now()+durationMs;
  if(state.timer) clearInterval(state.timer);
  state.timer=setInterval(tick, 250);
  tick();

  if(state.soundEnabled) startBackgroundLoop();

  renderQuestion();
  show("game");
}

function tick(){
  const left=state.endsAt-Date.now();
  timeEl.textContent=formatTime(left);
  if(left<=0) finishGame();
}

async function renderQuestion(){
  const q=state.questions[state.index];
  btnNext.disabled=true;

  qIndexEl.textContent=String(state.index+1);
  qTagEl.textContent=q.tag;
  questionEl.textContent=q.prompt;

  feedbackEl.textContent="";
  feedbackEl.className="feedback";

  if(q.kind===QK.AUTHOR_TO_WORK) await setAuthorPanel(q.authorToShow);
  else await setAuthorPanel(null);

  choicesEl.innerHTML="";
  q.options.forEach((opt,i)=>{
    const b=document.createElement("button");
    b.className="choice";
    b.textContent=`${String.fromCharCode(65+i)}) ${opt.label}`;
    b.addEventListener("click", ()=>choose(i));
    choicesEl.appendChild(b);
  });
}

function highlight(chosenIndex, correctIndex, correctAuthorsSet){
  const buttons=[...choicesEl.querySelectorAll("button.choice")];
  buttons.forEach(btn=>btn.classList.remove("wrong","correct"));

  if(typeof correctIndex === "number"){
    if(buttons[correctIndex]) buttons[correctIndex].classList.add("correct");
    if(chosenIndex !== correctIndex && buttons[chosenIndex]) buttons[chosenIndex].classList.add("wrong");
  }

  if(correctAuthorsSet){
    buttons.forEach((btn, idx)=>{
      const val=state.questions[state.index].options[idx].value;
      if(correctAuthorsSet.has(val)) btn.classList.add("correct");
    });
  }
}

function isCorrectAnswer(q, chosenIndex){
  if(typeof q.correctIndex === "number") return chosenIndex===q.correctIndex;
  const chosenVal=q.options[chosenIndex].value;
  return q.correctAuthors && q.correctAuthors.has(chosenVal);
}

function choose(i){
  const q=state.questions[state.index];
  const correct=isCorrectAnswer(q,i);

  if(state.firstTryMarked[state.index]===null){
    if(correct){
      state.firstTryCorrect += 1;
    } else {
      state.firstTryWrong += 1;

      const cat = state.settings.category;
      let key = "Genel";

      if(cat === "karisik"){
        key = q.periodLabel || "Genel";
      } else if(cat === "onemli_karakterler"){
        key = q.analysisKey || "Bilinmiyor";
      } else if(cat === "unvanlar_lakaplar"){
        key = q.analysisKey || "Bilinmiyor";
      } else if(cat === "edebiyatta_ilkler"){
        key = q.analysisKey || "Bilinmiyor";
      } else {
        // dönem seçiliyse yazar bazlı
        if(q.kind === QK.AUTHOR_TO_WORK) key = q.authorToShow || "Bilinmiyor";
        else key = q.options[q.correctIndex]?.value || "Bilinmiyor";
      }

      state.mistakesByTag[key] = (state.mistakesByTag[key] || 0) + 1;
    }

    state.firstTryMarked[state.index]=correct;
    updateSuccessUI();
  }

  highlight(i, q.correctIndex, q.correctAuthors || null);

  if(correct){
    playSfx("good");
    state.solved[state.index]=true;
    feedbackEl.textContent="Doğru! Sonraki soruya geçebilirsin.";
    feedbackEl.className="feedback good";
    [...choicesEl.querySelectorAll("button.choice")].forEach(btn=>btn.disabled=true);
    btnNext.disabled=false;
  } else {
    playSfx("bad");
    feedbackEl.textContent="Yanlış! Devam etmek için doğru şıkkı seç.";
    feedbackEl.className="feedback bad";
  }
}

function next(){
  if(!state.solved[state.index]) return;
  if(state.index < state.questions.length-1){
    state.index += 1;
    renderQuestion();
  } else {
    finishGame();
  }
}

function finishGame(){
  if(state.timer){ clearInterval(state.timer); state.timer=null; }
  stopBackgroundLoop();

  const total=state.questions.length;
  const tried=state.firstTryMarked.filter(v=>v!==null).length;
  const empty=total-tried;

  const finalSuccess=calcSuccessPercent();

  resScoreEl.textContent=`${finalSuccess}%`;
  resCorrectEl.textContent=String(state.firstTryCorrect);
  resWrongEl.textContent=String(state.firstTryWrong);
  resEmptyEl.textContent=String(empty);

  renderMistakeAnalysis();

  const best=Number(localStorage.getItem("ayt_best_success")||"0");
  const games=Number(localStorage.getItem("ayt_games")||"0")+1;
  localStorage.setItem("ayt_games", String(games));
  if(finalSuccess>best) localStorage.setItem("ayt_best_success", String(finalSuccess));

  addLeaderboardEntry({
    nick: state.settings.nickname,
    success: finalSuccess,
    count: state.settings.count,
    minutes: state.settings.minutes,
    categoryLabel: CATEGORY_LABEL[state.settings.category] || "Genel",
    genreLabel: GENRE_LABEL[state.settings.genreMode] || state.settings.genreMode,
    ts: Date.now(),
  });

  loadStats();
  show("result");
}

function quit(){ finishGame(); }

// ----- Events -----
btnStart.addEventListener("click", startGame);
btnHow.addEventListener("click", ()=>show("how"));
btnBackHome1.addEventListener("click", ()=>show("home"));
btnBackHome2.addEventListener("click", ()=>show("home"));
btnPlayAgain.addEventListener("click", startGame);
btnQuit.addEventListener("click", quit);
btnNext.addEventListener("click", next);

btnClearLb.addEventListener("click", ()=>{
  if(confirm("Bu cihazdaki sıralama silinsin mi?")) clearLeaderboard();
});

btnSound.addEventListener("click", ()=>{
  state.soundEnabled = !state.soundEnabled;
  btnSound.textContent = `Ses: ${state.soundEnabled ? "Açık" : "Kapalı"}`;
  if(!state.soundEnabled) stopBackgroundLoop();
  else if(!screens.game.classList.contains("hidden")) startBackgroundLoop();
});

categoryEl.addEventListener("change", ()=> setGenreOptions());
nicknameEl.addEventListener("input", refreshStartButton);

// ----- Init -----
ensureExtraCategories();
loadStats();
setGenreOptions();
renderLeaderboard();
refreshStartButton();
btnSound.textContent = `Ses: ${state.soundEnabled ? "Açık" : "Kapalı" }`;
show("home");
