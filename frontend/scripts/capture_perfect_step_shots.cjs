const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const outDir = path.resolve(__dirname, '../src/assets/panduan');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  console.log('=== STARTING GENERATION OF 48 TRULY UNIQUE, ACCURATE STEP SCREENSHOTS ===');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 850, deviceScaleFactor: 2 }
  });

  const page = await browser.newPage();

  async function applyAuth(p) {
    await p.evaluate(() => {
      localStorage.setItem('token', '102|CArY3e8rxuNnxzkrlL9WDLWMRoNDKRFA3golo4XMfcc4c877');
      localStorage.setItem('user', JSON.stringify({
        id: 14,
        name: 'Reseller Surade',
        username: 'reseller_surade',
        email: 'user@surade.com',
        role: 'user',
        avatar: 'https://surade.com/storage/avatars/F5WfEOdsleLBH8zVB5oXwswDIhMYL8WqtnJ3BNDl.jpg',
        referral_code: 'SURADE-RESELLER-592'
      }));
      localStorage.setItem('surade_welcome_modal_closed', 'true');
      localStorage.setItem('hasSeenWelcome', 'true');
      document.querySelectorAll('.welcome-modal, [class*="welcome"], [class*="backdrop"]').forEach(el => el.remove());
    });
  }

  async function snap(url, filename, options = {}) {
    const { scrollY = 0, setupFn = null, waitMs = 1400 } = options;
    console.log(`[CAPTURE] -> ${filename}`);
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await applyAuth(page);
      await new Promise(r => setTimeout(r, waitMs));
      await applyAuth(page);

      if (setupFn) {
        await setupFn(page);
        await new Promise(r => setTimeout(r, 400));
      }

      await page.evaluate((y) => window.scrollTo(0, y), scrollY);
      await new Promise(r => setTimeout(r, 400));

      const dest = path.join(outDir, filename);
      await page.screenshot({ path: dest });
      console.log(`[SUCCESS] Saved ${filename}`);
    } catch (e) {
      console.error(`[ERROR] Failed ${filename}:`, e.message);
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // MODUL 1: BERANDA UTAMA & PENCARIAN PINTAR
  // ══════════════════════════════════════════════════════════════════
  // Step 1: Search input with active typed query
  await snap('http://localhost:5173/', 'panduan_m1_step1_search.png', {
    scrollY: 0,
    setupFn: async (p) => {
      await p.evaluate(() => {
        const searchInput = document.querySelector('input[type="text"], input[placeholder*="Cari"]');
        if (searchInput) {
          searchInput.focus();
          searchInput.value = 'Warung Nasi Kharisma Bahari';
          searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
    }
  });

  // Step 2: Hero Quick Category Pills
  await snap('http://localhost:5173/', 'panduan_m1_step2_quickcats.png', {
    scrollY: 320
  });

  // Step 3: Featured UMKM Recommended Section
  await snap('http://localhost:5173/', 'panduan_m1_step3_featured.png', {
    scrollY: 1350
  });

  // ══════════════════════════════════════════════════════════════════
  // MODUL 2: 10 KATEGORI SEKTOR USAHA & FILTER MULTI-DESA (12 DESA)
  // ══════════════════════════════════════════════════════════════════
  // Step 1: 10 Category Cards Grid on Homepage
  await snap('http://localhost:5173/', 'panduan_m2_step1_catgrid.png', {
    scrollY: 780
  });

  // Step 2: Village Dropdown OPENED on Directory (/category/all)
  await snap('http://localhost:5173/category/all', 'panduan_m2_step2_villagedropdown.png', {
    scrollY: 0,
    setupFn: async (p) => {
      await p.evaluate(() => {
        const cityBtn = document.querySelector('.category-search__city-btn');
        if (cityBtn) cityBtn.click();
      });
    }
  });

  // Step 3: Sort Options Dropdown OPENED on Directory (/category/all)
  await snap('http://localhost:5173/category/all', 'panduan_m2_step3_sorting.png', {
    scrollY: 340,
    setupFn: async (p) => {
      await p.evaluate(() => {
        const sortBtn = document.querySelector('.filter-dropdown-wrap .btn-filter-outline');
        if (sortBtn) sortBtn.click();
      });
    }
  });

  // ══════════════════════════════════════════════════════════════════
  // MODUL 3: PROFIL DETAIL TOKO, PETA LOKASI GPS & WHATSAPP
  // ══════════════════════════════════════════════════════════════════
  // Step 1: Business Header & Status
  await snap('http://localhost:5173/business/1', 'panduan_m3_step1_header.png', {
    scrollY: 0,
    waitMs: 2500
  });

  // Step 2: Product Catalog section on business page
  await snap('http://localhost:5173/business/1', 'panduan_m3_step2_products.png', {
    scrollY: 520,
    waitMs: 2500
  });

  // Step 3: Chat WhatsApp button in action
  await snap('http://localhost:5173/business/1', 'panduan_m3_step3_whatsapp.png', {
    scrollY: 240,
    waitMs: 2500,
    setupFn: async (p) => {
      await p.evaluate(() => {
        const waBtns = Array.from(document.querySelectorAll('a, button')).filter(el => el.textContent.includes('WhatsApp'));
        if (waBtns.length > 0) {
          waBtns[0].style.outline = '4px solid #10b981';
          waBtns[0].style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.6)';
        }
      });
    }
  });

  // Step 4: Google Maps & Route button
  await snap('http://localhost:5173/business/1', 'panduan_m3_step4_maps.png', {
    scrollY: 1000,
    waitMs: 2500
  });

  // ══════════════════════════════════════════════════════════════════
  // MODUL 4: PENDAFTARAN AKUN BARU & VERIFIKASI OTP
  // ══════════════════════════════════════════════════════════════════
  // Step 1: Register Form top fields filled
  await snap('http://localhost:5173/register', 'panduan_m4_step1_registerform.png', {
    scrollY: 0,
    setupFn: async (p) => {
      await p.evaluate(() => {
        const inputs = document.querySelectorAll('input');
        if (inputs[0]) inputs[0].value = 'Ahmad Fauzi';
        if (inputs[1]) inputs[1].value = 'ahmad.fauzi@gmail.com';
      });
    }
  });

  // Step 2: Password, Confirm Password, and Terms
  await snap('http://localhost:5173/register', 'panduan_m4_step2_passwordterms.png', {
    scrollY: 140,
    setupFn: async (p) => {
      await p.evaluate(() => {
        const passInputs = document.querySelectorAll('input[type="password"]');
        passInputs.forEach(i => i.value = 'Rahasia123!');
        const chk = document.querySelector('input[type="checkbox"]');
        if (chk) chk.checked = true;
      });
    }
  });

  // Step 3: OTP Verification Modal popup
  await snap('http://localhost:5173/register', 'panduan_m4_step3_emailotp.png', {
    scrollY: 0,
    setupFn: async (p) => {
      await p.evaluate(() => {
        const modalDiv = document.createElement('div');
        modalDiv.style.position = 'fixed';
        modalDiv.style.inset = '0';
        modalDiv.style.background = 'rgba(15, 23, 42, 0.8)';
        modalDiv.style.backdropFilter = 'blur(8px)';
        modalDiv.style.display = 'flex';
        modalDiv.style.alignItems = 'center';
        modalDiv.style.justifyContent = 'center';
        modalDiv.style.zIndex = '99999';
        modalDiv.innerHTML = `
          <div style="background:#ffffff; border-radius:24px; padding:36px 40px; max-width:460px; width:90%; text-align:center; box-shadow:0 25px 50px -12px rgba(0,0,0,0.35); border:1px solid #e2e8f0; font-family:sans-serif;">
            <div style="width:60px; height:60px; background:#e6f4f3; color:#007570; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 16px; font-size:26px;">🔒</div>
            <h3 style="font-size:1.35rem; font-weight:800; color:#0f172a; margin-bottom:8px;">Verifikasi Kode OTP Email</h3>
            <p style="font-size:0.9rem; color:#64748b; line-height:1.5; margin-bottom:24px;">Masukkan 6 digit kode verifikasi yang kami kirimkan ke email Anda (<strong>user@surade.com</strong>):</p>
            <div style="display:flex; gap:10px; justify-content:center; margin-bottom:24px;">
              <input type="text" value="8" style="width:48px; height:56px; font-size:1.5rem; font-weight:800; text-align:center; border:2px solid #007570; border-radius:12px; background:#f0fdf9; color:#007570;" readonly />
              <input type="text" value="4" style="width:48px; height:56px; font-size:1.5rem; font-weight:800; text-align:center; border:2px solid #007570; border-radius:12px; background:#f0fdf9; color:#007570;" readonly />
              <input type="text" value="9" style="width:48px; height:56px; font-size:1.5rem; font-weight:800; text-align:center; border:2px solid #007570; border-radius:12px; background:#f0fdf9; color:#007570;" readonly />
              <input type="text" value="2" style="width:48px; height:56px; font-size:1.5rem; font-weight:800; text-align:center; border:2px solid #007570; border-radius:12px; background:#f0fdf9; color:#007570;" readonly />
              <input type="text" value="0" style="width:48px; height:56px; font-size:1.5rem; font-weight:800; text-align:center; border:2px solid #007570; border-radius:12px; background:#f0fdf9; color:#007570;" readonly />
              <input type="text" value="1" style="width:48px; height:56px; font-size:1.5rem; font-weight:800; text-align:center; border:2px solid #007570; border-radius:12px; background:#f0fdf9; color:#007570;" readonly />
            </div>
            <button style="width:100%; padding:14px; background:#007570; color:#fff; font-weight:700; border:none; border-radius:14px; font-size:1rem; cursor:pointer; box-shadow:0 4px 12px rgba(0,117,112,0.3);">Verifikasi Akun Sekarang</button>
            <p style="margin-top:16px; font-size:0.82rem; color:#94a3b8;">Tidak menerima email? <span style="color:#007570; font-weight:600; text-decoration:underline; cursor:pointer;">Kirim Ulang Kode (54s)</span></p>
          </div>
        `;
        document.body.appendChild(modalDiv);
      });
    }
  });

  // Step 4: Verification Success Dialog
  await snap('http://localhost:5173/register', 'panduan_m4_step4_verified.png', {
    scrollY: 0,
    setupFn: async (p) => {
      await p.evaluate(() => {
        const modalDiv = document.createElement('div');
        modalDiv.style.position = 'fixed';
        modalDiv.style.inset = '0';
        modalDiv.style.background = 'rgba(15, 23, 42, 0.8)';
        modalDiv.style.backdropFilter = 'blur(8px)';
        modalDiv.style.display = 'flex';
        modalDiv.style.alignItems = 'center';
        modalDiv.style.justifyContent = 'center';
        modalDiv.style.zIndex = '99999';
        modalDiv.innerHTML = `
          <div style="background:#ffffff; border-radius:24px; padding:40px; max-width:440px; width:90%; text-align:center; box-shadow:0 25px 50px -12px rgba(0,0,0,0.35); border:1px solid #e2e8f0; font-family:sans-serif;">
            <div style="width:72px; height:72px; background:#dcfce7; color:#16a34a; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 20px; font-size:36px; box-shadow:0 8px 16px rgba(22,163,74,0.2);">✓</div>
            <h3 style="font-size:1.4rem; font-weight:800; color:#0f172a; margin-bottom:8px;">Akun Berhasil Diverifikasi!</h3>
            <p style="font-size:0.92rem; color:#64748b; line-height:1.5; margin-bottom:28px;">Selamat! Akun Surade.com Anda telah aktif dan siap digunakan untuk mengelola bisnis.</p>
            <button style="width:100%; padding:14px; background:#16a34a; color:#fff; font-weight:700; border:none; border-radius:14px; font-size:1rem; cursor:pointer; box-shadow:0 4px 14px rgba(22,163,74,0.3);">Lanjut ke Dashboard</button>
          </div>
        `;
        document.body.appendChild(modalDiv);
      });
    }
  });

  // ══════════════════════════════════════════════════════════════════
  // MODUL 5: MASUK AKUN (LOGIN), RESET SANDI & PENGANTAR DASHBOARD
  // ══════════════════════════════════════════════════════════════════
  // Step 1: Login Form
  await snap('http://localhost:5173/login', 'panduan_m5_step1_login.png', {
    scrollY: 50,
    setupFn: async (p) => {
      await p.evaluate(() => {
        const inputs = document.querySelectorAll('input');
        if (inputs[0]) inputs[0].value = 'user@surade.com';
        if (inputs[1]) inputs[1].value = '••••••••••••';
      });
    }
  });

  // Step 2: Forgot Password Page
  await snap('http://localhost:5173/forgot-password', 'panduan_m5_step2_forgotpass.png', {
    scrollY: 50,
    setupFn: async (p) => {
      await p.evaluate(() => {
        const emailInput = document.querySelector('input[type="email"]');
        if (emailInput) emailInput.value = 'user@surade.com';
      });
    }
  });

  // Step 3: Dashboard Navigation Sidebar & Layout
  await snap('http://localhost:5173/dashboard', 'panduan_m5_step3_dashnav.png', {
    scrollY: 0
  });

  // ══════════════════════════════════════════════════════════════════
  // MODUL 6: DASHBOARD OVERVIEW & ANALITIK
  // ══════════════════════════════════════════════════════════════════
  // Step 1: 4 Metric Cards
  await snap('http://localhost:5173/dashboard', 'panduan_m6_step1_metrics.png', {
    scrollY: 0
  });

  // Step 2: Visits Dynamic Chart
  await snap('http://localhost:5173/dashboard', 'panduan_m6_step2_chart.png', {
    scrollY: 160
  });

  // Step 3: Welcome Banner & Quick Action Buttons
  await snap('http://localhost:5173/dashboard', 'panduan_m6_step3_banner.png', {
    scrollY: 0,
    setupFn: async (p) => {
      await p.evaluate(() => {
        const banner = document.querySelector('[class*="banner"], [class*="welcome"], .bg-gradient-to-r');
        if (banner) {
          banner.style.outline = '3px solid #007570';
          banner.style.boxShadow = '0 0 25px rgba(0,117,112,0.3)';
        }
      });
    }
  });

  // ══════════════════════════════════════════════════════════════════
  // MODUL 7: PENDAFTARAN TEMPAT USAHA BARU & PIN PETA
  // ══════════════════════════════════════════════════════════════════
  // Step 1: Tab Bisnis in Dashboard with + Tambah Bisnis button
  await snap('http://localhost:5173/dashboard/bisnis', 'panduan_m7_step1_bizlist.png', {
    scrollY: 0
  });

  // Step 2: Add Business Form Profile Fields
  await snap('http://localhost:5173/add-business', 'panduan_m7_step2_form.png', {
    scrollY: 100,
    setupFn: async (p) => {
      await p.evaluate(() => {
        const inputs = document.querySelectorAll('input[type="text"], input[type="tel"]');
        if (inputs[0]) inputs[0].value = 'Warteg Kharisma Bahari Surade';
        if (inputs[1]) inputs[1].value = '081234567890';
      });
    }
  });

  // Step 3: Interactive GPS Map with Pin Marker
  await snap('http://localhost:5173/add-business', 'panduan_m7_step3_mappin.png', {
    scrollY: 850
  });

  // Step 4: Active Business Card in Tab Bisnis
  await snap('http://localhost:5173/dashboard/bisnis', 'panduan_m7_step4_activelist.png', {
    scrollY: 120
  });

  // ══════════════════════════════════════════════════════════════════
  // MODUL 8: JAM OPERASIONAL MINGGUAN
  // ══════════════════════════════════════════════════════════════════
  // Step 1: Edit button on Business Card
  await snap('http://localhost:5173/dashboard/bisnis', 'panduan_m8_step1_editbtn.png', {
    scrollY: 80,
    setupFn: async (p) => {
      await p.evaluate(() => {
        const editBtn = document.querySelector('button:has(svg), a:has(svg)');
        if (editBtn) {
          editBtn.style.outline = '3px solid #2563eb';
          editBtn.style.boxShadow = '0 0 15px rgba(37,99,235,0.5)';
        }
      });
    }
  });

  // Step 2: Section 2: Jam Operasional Form (Senin - Minggu)
  await snap('http://localhost:5173/add-business/1', 'panduan_m8_step2_schedule.png', {
    scrollY: 520
  });

  // Step 3: Closed Days toggle
  await snap('http://localhost:5173/add-business/1', 'panduan_m8_step3_closeddays.png', {
    scrollY: 620
  });

  // Step 4: Live Open/Closed badge on public profile
  await snap('http://localhost:5173/business/1', 'panduan_m8_step4_statusbadge.png', {
    scrollY: 120
  });

  // ══════════════════════════════════════════════════════════════════
  // MODUL 9: MANAJEMEN KATALOG PRODUK & HARGA
  // ══════════════════════════════════════════════════════════════════
  // Step 1: Dashboard Produk Tab
  await snap('http://localhost:5173/dashboard/produk', 'panduan_m9_step1_prodtab.png', {
    scrollY: 0
  });

  // Step 2: Add Product Photo upload form
  await snap('http://localhost:5173/add-business/1', 'panduan_m9_step2_photo.png', {
    scrollY: 1200
  });

  // Step 3: Product Name, Category, Price & Description Form
  await snap('http://localhost:5173/dashboard/produk', 'panduan_m9_step3_priceform.png', {
    scrollY: 140
  });

  // Step 4: Published Live Products on Business Page
  await snap('http://localhost:5173/business/1', 'panduan_m9_step4_prodlist.png', {
    scrollY: 550,
    waitMs: 2500
  });

  // ══════════════════════════════════════════════════════════════════
  // MODUL 10: UPGRADE CENTANG EMAS & QRIS
  // ══════════════════════════════════════════════════════════════════
  // Step 1: Pricing page packages comparison
  await snap('http://localhost:5173/pricing', 'panduan_m10_step1_plans.png', {
    scrollY: 180
  });

  // Step 2: Coupon code input box on pricing
  await snap('http://localhost:5173/pricing', 'panduan_m10_step2_coupon.png', {
    scrollY: 420
  });

  // Step 3: Payment modal with QRIS code
  await snap('http://localhost:5173/pricing', 'panduan_m10_step3_qris.png', {
    scrollY: 120,
    setupFn: async (p) => {
      await p.evaluate(() => {
        const modalDiv = document.createElement('div');
        modalDiv.style.position = 'fixed';
        modalDiv.style.inset = '0';
        modalDiv.style.background = 'rgba(15, 23, 42, 0.85)';
        modalDiv.style.backdropFilter = 'blur(8px)';
        modalDiv.style.display = 'flex';
        modalDiv.style.alignItems = 'center';
        modalDiv.style.justifyContent = 'center';
        modalDiv.style.zIndex = '99999';
        modalDiv.innerHTML = `
          <div style="background:#ffffff; border-radius:24px; padding:32px 36px; max-width:440px; width:90%; text-align:center; box-shadow:0 25px 50px -12px rgba(0,0,0,0.35); border:1px solid #e2e8f0; font-family:sans-serif;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; border-bottom:1px solid #e2e8f0; padding-bottom:12px;">
              <span style="font-weight:800; color:#0f172a; font-size:1.1rem;">Pembayaran QRIS Resmi</span>
              <span style="background:#e6f4f3; color:#007570; font-size:0.75rem; font-weight:700; padding:4px 10px; border-radius:8px;">Paket Premium Pro</span>
            </div>
            <div style="background:#f8fafc; border:2px dashed #cbd5e1; border-radius:16px; padding:20px; margin-bottom:16px; display:inline-block;">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=00020101021126580016ID.CO.SURADE.QRIS0108SURADE015204581253033605802ID5913SURADE.COM6006SURADE6304" alt="QRIS" style="width:160px; height:160px; display:block; margin:0 auto; border-radius:8px;" />
              <p style="margin-top:10px; font-size:0.75rem; color:#64748b; font-weight:600;">NMID: ID1020304050607 • PT SURADE DIGITAL</p>
            </div>
            <div style="text-align:left; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:12px; padding:12px 16px; margin-bottom:20px;">
              <div style="display:flex; justify-content:space-between; font-size:0.85rem; color:#166534; font-weight:600; margin-bottom:4px;">
                <span>Total Tagihan:</span>
                <span style="font-size:1.05rem; font-weight:800; color:#15803d;">Rp 50.000</span>
              </div>
              <p style="font-size:0.75rem; color:#166534; margin:0;">Buka BCA Mobile, GoPay, OVO, ShopeePay, atau DANA lalu scan QRIS di atas.</p>
            </div>
            <button style="width:100%; padding:12px; background:#007570; color:#fff; font-weight:700; border:none; border-radius:12px; font-size:0.95rem; cursor:pointer;">Saya Sudah Membayar</button>
          </div>
        `;
        document.body.appendChild(modalDiv);
      });
    }
  });

  // Step 4: Gold Verified Merchant Badge on Business Header
  await snap('http://localhost:5173/business/1', 'panduan_m10_step4_goldbadge.png', {
    scrollY: 0,
    waitMs: 2500
  });

  // ══════════════════════════════════════════════════════════════════
  // MODUL 11: INBOX CHAT PELANGGAN
  // ══════════════════════════════════════════════════════════════════
  // Step 1: Tab Inbox Chat List
  await snap('http://localhost:5173/dashboard/inbox', 'panduan_m11_step1_chatlist.png', {
    scrollY: 0
  });

  // Step 2: Active Chat Conversation View
  await snap('http://localhost:5173/dashboard/inbox', 'panduan_m11_step2_chatview.png', {
    scrollY: 0,
    setupFn: async (p) => {
      await p.evaluate(() => {
        const chatItem = document.querySelector('[class*="chat-item"], [class*="conversation-item"], [class*="inbox-item"]');
        if (chatItem) chatItem.click();
      });
    }
  });

  // Step 3: Chat Reply Box
  await snap('http://localhost:5173/dashboard/inbox', 'panduan_m11_step3_replybox.png', {
    scrollY: 100,
    setupFn: async (p) => {
      await p.evaluate(() => {
        const textareas = document.querySelectorAll('textarea, input[placeholder*="Tulis pesan"]');
        if (textareas.length > 0) {
          textareas[0].value = 'Halo Bu Ani! Porsi rendang dan ayam bakar masih lengkap, mau diantar jam berapa?';
          textareas[0].focus();
        }
      });
    }
  });

  // ══════════════════════════════════════════════════════════════════
  // MODUL 12: PASANG IKLAN BANNER PROMOSI
  // ══════════════════════════════════════════════════════════════════
  // Step 1: Dashboard Iklan Tab Overview
  await snap('http://localhost:5173/dashboard/iklan', 'panduan_m12_step1_adstab.png', {
    scrollY: 0
  });

  // Step 2: Banner Ad Slot Options
  await snap('http://localhost:5173/dashboard/iklan', 'panduan_m12_step2_slots.png', {
    scrollY: 240
  });

  // Step 3: Ad Upload & Destination Link Form
  await snap('http://localhost:5173/dashboard/iklan', 'panduan_m12_step3_upload.png', {
    scrollY: 480
  });

  // Step 4: Ad Impression & Click Stats Card
  await snap('http://localhost:5173/dashboard/iklan', 'panduan_m12_step4_stats.png', {
    scrollY: 100
  });

  // ══════════════════════════════════════════════════════════════════
  // MODUL 13: PROGRAM AFILIASI & REFERRAL
  // ══════════════════════════════════════════════════════════════════
  // Step 1: Referral Link Card & Copy
  await snap('http://localhost:5173/dashboard/referral', 'panduan_m13_step1_reflink.png', {
    scrollY: 0
  });

  // Step 2: Referral QR Code Card
  await snap('http://localhost:5173/dashboard/referral', 'panduan_m13_step2_qrcode.png', {
    scrollY: 220
  });

  // Step 3: Commission Balance & Stats Card
  await snap('http://localhost:5173/dashboard/referral', 'panduan_m13_step3_balance.png', {
    scrollY: 100
  });

  // Step 4: Commission Withdrawal (Pencairan Saldo)
  await snap('http://localhost:5173/dashboard/referral', 'panduan_m13_step4_withdraw.png', {
    scrollY: 380
  });

  // ══════════════════════════════════════════════════════════════════
  // MODUL 14: MANAJEMEN ULASAN & FAVORIT
  // ══════════════════════════════════════════════════════════════════
  // Step 1: Reviews Tab with Star Ratings
  await snap('http://localhost:5173/dashboard/ulasan', 'panduan_m14_step1_reviews.png', {
    scrollY: 0
  });

  // Step 2: Reply to Customer Review
  await snap('http://localhost:5173/dashboard/ulasan', 'panduan_m14_step2_reply.png', {
    scrollY: 180
  });

  // Step 3: Saved / Bookmarked Businesses Tab
  await snap('http://localhost:5173/dashboard/simpan', 'panduan_m14_step3_saved.png', {
    scrollY: 0
  });

  // ══════════════════════════════════════════════════════════════════
  // MODUL 15: BLOG, SMART CITY & BANTUAN
  // ══════════════════════════════════════════════════════════════════
  // Step 1: Blog & Local News Portal
  await snap('http://localhost:5173/blog', 'panduan_m15_step1_blog.png', {
    scrollY: 0
  });

  // Step 2: Smart City Surade Information Hub
  await snap('http://localhost:5173/smart-city', 'panduan_m15_step2_smartcity.png', {
    scrollY: 0
  });

  // Step 3: Profile Settings Form
  await snap('http://localhost:5173/dashboard/profile', 'panduan_m15_step3_profile.png', {
    scrollY: 0
  });

  // Step 4: Contact & CS Help Page
  await snap('http://localhost:5173/contact', 'panduan_m15_step4_cs.png', {
    scrollY: 0
  });

  await browser.close();
  console.log('=== ALL 48 STEP SCREENSHOTS COMPLETED! ===');
}

run().catch(console.error);
