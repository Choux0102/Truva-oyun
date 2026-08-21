# ⚔️ Kuralsız Oyun Masası (Battle Line Arena)

Gerçek zamanlı çok oyunculu (P1 vs P2), 9 cepheli, 60 birlik kartı ve 10 taktik kartı içeren stratejik kart ve masa oyunu.

---

## 🚀 Projeyi GitHub'dan İndirip Çalıştırma

### 1. Gereksinimler
- [Node.js](https://nodejs.org/) (v18 veya üzeri önerilir)
- Git

### 2. Kurulum
Projeyi klonlayın ve bağımlılıkları yükleyin:

```bash
git clone https://github.com/KULLANICI_ADINIZ/REPO_ADINIZ.git
cd REPO_ADINIZ
npm install
```

### 3. Geliştirme Modunda Başlatma
```bash
npm run dev
```
Uygulama `http://localhost:3000` adresinde çalışacaktır.

### 4. Canlı (Production) Derleme ve Başlatma
```bash
npm run build
npm start
```

---

## 🎮 İki Farklı Bilgisayardan Oynama Yöntemleri

### Yöntem A: İnternet Üzerinden Ücretsiz Yayınlama (En Kolay & En İyisi)
Oyunu GitHub'a yükledikten sonra ücretsiz bir barındırma servisine bağlayarak dünyanın her yerindeki arkadaşlarınızla oynayabilirsiniz:

1. **Render.com / Railway.app / Fly.io** üzerinde ücretsiz bir hesap açın.
2. **New Web Service** seçeneğine tıklayıp bu GitHub deposunu bağlayın.
3. Ayarları şu şekilde bırakın:
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
4. Size verilen canlı URL'ye (örn. `https://oyununuz.onrender.com`) girin.
5. Ekranın üst kısmındaki **"Rakibi Davet Et"** butonuna basarak kopyalanan davet linkini diğer bilgisayardaki arkadaşınıza gönderin.

---

### Yöntem B: Aynı Wi-Fi / Yerel Ağdaki İki Bilgisayardan Oynama
İki bilgisayar da aynı modeme/ağa bağlıysa hiçbir internet sunucusuna gerek kalmadan doğrudan oynayabilirsiniz:

1. **1. Bilgisayarda (Sunucu olan):**
   - Terminali açıp `npm run dev` veya `npm start` komutunu çalıştırın.
   - 1. Bilgisayarın yerel IP adresini öğrenin (Windows için `ipconfig`, Mac/Linux için `ifconfig` veya `ip a` komutuyla `IPv4 Address`, örn: `192.168.1.45`).
   - 1. Bilgisayarda tarayıcıdan `http://localhost:3000` adresine girin.
2. **2. Bilgisayarda (Oyuncu 2):**
   - Tarayıcısını açıp `http://192.168.1.45:3000/?room=ARENA-1&role=p2` adresine girin.
3. Otomatik olarak aynı odaya bağlanacak ve karşılıklı hamleler anlık olarak senkronize olacaktır.

---

### Yöntem C: Ngrok / LocalTunnel ile Hızlı Paylaşım
1. Bilgisayarınızda `npm run dev` çalışırken:
2. Terminalden `npx ngrok http 3000` komutunu çalıştırın.
3. Size verilen `https://xxx.ngrok-free.app` linkini arkadaşınıza atın.

---

## 🛡️ Güvenlik ve Gizlilik Özellikleri (Fog of War)
- **Gizli El Koruması:** Rakibinizin elindeki kartların içeriği (değeri ve rengi) sunucu katmanında sansürlenir.
- **Sürükleme & Yetki Kısıtı:** Oyuncular yalnızca kendi ellerindeki veya masadaki kendi taraflarındaki kartları oynayabilir; rakip eldeki kartlar kilitlidir.
- **Kesintisiz Senkronizasyon:** Hem WebSocket canlı soket bağlantısı hem de bağlantı kopmalarına karşı otomatik REST yedekleme mekanizması devrededir.

---

## 📜 Lisans & Yapı
- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion
- **Backend:** Node.js, Express, WebSocket (ws)
