# DEMOxSHOP - Source Code เว็บไซต์ดิจิทัลมาร์เก็ตเพลส

โปรเจกต์ต้นแบบซอร์สโค้ด (Full Source Code) ของเว็บไซต์ร้านค้าดิจิทัล **DEMOxSHOP** (อ้างอิงจาก https://www.demoxshop.com/?page=home)
พัฒนาด้วยเทคโนโลยีระดับมืออาชีพ พร้อมระบบหน้าบ้านและหลังบ้านครบวงจร

---

## 🛠️ Stack & Technology

- **Frontend / Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Language**: TypeScript & JavaScript
- **Styling**: Tailwind CSS, Vanilla CSS Glassmorphism & Cyberpunk Neon Theme
- **Icons**: Lucide React
- **Sound Effects**: Web Audio API Mechanical Keyboard Switch Synthesizer (เปิด/ปิดเสียงได้)
- **Backend / Runtime**: Node.js & Next.js API Routes (RESTful endpoints)

---

## 🚀 ฟีเจอร์หลักของระบบ (Features)

1. **หน้าหลัก (Homepage - `/`)**:
   - ประกาศและโปรโมชั่นด้านบน (Announcement Ticker)
   - แบนเนอร์ไซเบอร์พังค์เคลื่อนไหวระดับ 4K
   - วิดเจ็ตชุมชน Discord แสดงสถานะจำนวนสมาชิกออนไลน์
   - สินค้ายอดนิยม 3 อันดับ (Best Sellers Carousel) พร้อมระบบ Autoplay
   - หมวดหมู่สินค้า: FIVEM PROJECT, CHEAT GAME, SOFTWARE & TOOLS, DISCORD SERVICES
   - ระบบแจ้งเตือนคำสั่งซื้อล่าสุดแบบเรียลไทม์ (Live Purchase Ticker)
   - คลังสินค้าพร้อมตัวกรอง ค้นหา และปุ่ม "ซื้อเลย"

2. **ระบบสั่งซื้อสินค้า (Checkout & Delivery - `/orders`)**:
   - หน้าต่างสั่งซื้อ (Buy Modal) เลือกแพ็กเกจ (1 วัน, 7 วัน, 30 วัน, ถาวร)
   - ช่องใส่โค้ดส่วนลด (เช่น `ARXSTORE` รับส่วนลด 10%)
   - หักยอดเงินจาก Wallet ในระบบ และจัดส่งคีย์ทันที (Instant Key Delivery)
   - ระบบคัดลอก License Key อัตโนมัติในคลิกเดียว พร้อมลิงก์ดาวน์โหลดและคู่มือ
   - ระบบแจ้งเคลมประกันสินค้า (Warranty Claim)

3. **ระบบตรวจสอบสถานะบริการ (Service Status - `/status`)**:
   - แดชบอร์ดตรวจสอบสถานะเซิร์ฟเวอร์แบบเรียลไทม์
   - แสดงเปอร์เซ็นต์ความพร้อมใช้งาน (Uptime %) และ Response Time (ms)
   - สถานะ 3 ระดับ: `ONLINE` (ใช้งานได้ปกติ), `UPDATING` (กำลังอัปเดต), `MAINTENANCE` (ปิดปรับปรุง)
   - ค้นหาและกรองสถานะตามหมวดหมู่ได้

4. **ระบบรีเซ็ต HWID อัตโนมัติ (Reset HWID - `/reset-hwid`)**:
   - รีเซ็ตการผูกอุปกรณ์ (Hardware ID) เมื่อผู้ใช้ย้ายเครื่องหรือลง Windows ใหม่
   - ระบบสะสมรอบรีเซ็ต: ครบ 5 ครั้ง รับสิทธิ์รีเซ็ตฟรี 1 ครั้ง
   - ตรวจสอบสิทธิ์ฟรีอัตโนมัติ หรือชำระค่าบริการ ฿50
   - ประวัติการรีเซ็ต HWID พร้อมสถานะ

5. **ระบบเติมเงิน (Topup Wallet - `/topup`)**:
   - **ซองอั่งเปา TrueMoney Wallet**: วางลิงก์ซองของขวัญ ดึงเงินเข้าบัญชีทันที ค่าธรรมเนียม 0% พร้อมโบนัสพิเศษ 5%
   - **โอนผ่านบัญชีธนาคาร / PromptPay**: แสดงเลขบัญชีและชื่อบัญชี พร้อมระบบอัปโหลดสลิปและสแกนสลิปอัจฉริยะ (OCR Verification)
   - ประวัติการเติมเงินแบบเรียลไทม์

6. **ระบบจัดการหลังบ้าน (Admin Panel - `/admin`)**:
   - กราฟและสถิติยอดขายรวม คำสั่งซื้อ และจำนวนสมาชิก
   - เพิ่ม/แก้ไข/ลบ สินค้า แพ็กเกจ และราคา
   - ควบคุมและสลับสถานะบริการ (Toggle Online/Updating/Maintenance) ทันที
   - อนุมัติและตรวจสอบสลิปการเติมเงิน
   - ดูประวัติคำสั่งซื้อและบันทึกการรีเซ็ต HWID ทั้งหมด

7. **ระบบบัญชีและการเข้าสู่ระบบ (Auth & Demo Accounts)**:
   - สมาชิกทั่วไป: `demouser` (มีเครดิตทดลอง ฿1,250.00)
   - ผู้ดูแลระบบ: `demoadmin` (สิทธิ์ Admin Panel ดูแลทั้งระบบ)
   - สลับบัญชีทดสอบได้ทันทีในคลิกเดียวผ่านเมนูโปรไฟล์

8. **ความเป็นส่วนตัวและ PDPA (`/privacy`)**:
   - แถบ Cookie Consent ด้านล่างตามมาตรฐาน PDPA พ.ศ. 2562
   - หน้านโยบายความเป็นส่วนตัวและสิทธิของเจ้าของข้อมูล

---

## 💻 วิธีการรันโปรเจกต์ (Getting Started)

### 1. ติดตั้ง Dependencies (ถ้ายังไม่ได้ติดตั้ง):
```bash
npm install
```

### 2. รันในโหมด Development Server:
```bash
npm run dev
```
เปิดเบราว์เซอร์ไปที่ [http://localhost:3000](http://localhost:3000)

### 3. ตรวจสอบและสร้าง Production Build:
```bash
npm run build
npm run start
```

---

## 📁 โครงสร้างโปรเจกต์ (Project Directory)

```
├── public/
│   └── images/              # รูปภาพสินค้าและแบนเนอร์
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── page.tsx         # หน้าแรก (Home)
│   │   ├── layout.tsx       # Root Layout & Theme
│   │   ├── globals.css      # Custom Cyber Theme & Fonts
│   │   ├── store/page.tsx   # หน้าร้านค้า (Store Catalog)
│   │   ├── status/page.tsx  # หน้าสถานะบริการ (Status)
│   │   ├── reset-hwid/      # หน้ารีเซ็ต HWID (Reset HWID)
│   │   ├── topup/page.tsx   # หน้าเติมเงิน (Topup)
│   │   ├── orders/page.tsx  # หน้าประวัติคำสั่งซื้อ (Orders)
│   │   ├── privacy/page.tsx # หน้านโยบาย PDPA (Privacy)
│   │   ├── admin/page.tsx   # แผงควบคุมแอดมิน (Admin Panel)
│   │   └── api/             # Backend API Routes
│   │       ├── products/
│   │       ├── categories/
│   │       ├── status/
│   │       ├── topup/
│   │       ├── orders/
│   │       ├── hwid/
│   │       └── auth/
│   ├── components/          # Reusable Components
│   │   ├── layout/          # Navbar, Footer
│   │   ├── home/            # HeroSection, PopularCarousel, ProductGrid
│   │   ├── modals/          # BuyModal, AuthModal
│   │   └── common/          # ToastContainer, AnnouncementBar, CookieConsent
│   ├── context/
│   │   └── StoreContext.tsx # Context & State Management
│   ├── lib/
│   │   ├── data.ts          # Mock Database & Seed Data
│   │   └── sound.ts         # Mechanical Keyboard Sound FX
│   └── types/
│       └── index.ts         # TypeScript Interfaces
```
