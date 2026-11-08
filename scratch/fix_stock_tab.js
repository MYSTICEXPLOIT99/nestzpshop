const fs = require('fs');
const path = require('path');

const filePath = path.resolve('src/app/admin/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/\r\n/g, '\n');

const startMarker = `                <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">แพ็กเกจที่สต็อกหมด</div>\n                <div className="text-sm sm:text-base font-bold text-amber-400 font-mono flex items-center gap-1.5">\n                  {outOfStockPackagesCount} <span className="text-[10px] text-slate-400 font-normal">แพ็ก</span>\n                   ) : (`;

const endMarker = `          {/* 4. Automatic System Notice (Compact) */}`;

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

console.log('startIndex:', startIndex, 'endIndex:', endIndex);

if (startIndex === -1 || endIndex === -1) {
  console.error('Could not find markers');
  process.exit(1);
}

const replacement = `                <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">แพ็กเกจที่สต็อกหมด</div>
                <div className="text-sm sm:text-base font-bold text-amber-400 font-mono flex items-center gap-1.5">
                  {outOfStockPackagesCount} <span className="text-[10px] text-slate-400 font-normal">แพ็ก</span>
                  {outOfStockPackagesCount > 0 && (
                    <span className="text-[8.5px] px-1 py-0.2 rounded bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30 animate-pulse">
                      ด่วน
                    </span>
                  )}
                </div>
                <div className="text-[9px] text-slate-400">ไม่มีของพร้อมส่ง</div>
              </div>
              <div className="w-5 h-5 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <ShieldAlert className="w-3 h-3" />
              </div>
            </div>

            <div className="p-2 sm:p-2.5 rounded-lg bg-slate-950/60 border border-cyan-500/30 flex items-center justify-between shadow-sm min-h-[54px] sm:min-h-[58px]">
              <div>
                <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">สินค้าทั้งหมด</div>
                <div className="text-sm sm:text-base font-bold text-cyan-400 font-mono">{products.length} <span className="text-[10px] text-slate-400 font-normal">รายการ</span></div>
                <div className="text-[9px] text-cyan-400/80">รวมทุกหมวดหมู่</div>
              </div>
              <div className="w-5 h-5 rounded-md bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Package className="w-3 h-3" />
              </div>
            </div>
          </div>

          {/* 2. Search & Category / Status Filters (Compact Bar) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-slate-950/80 p-1.5 sm:p-2 rounded-xl border border-white/10 shadow-md">
            {/* Category Pills */}
            <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setStockCatFilter('all')}
                className={\`px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer whitespace-nowrap \${
                  stockCatFilter === 'all'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-sm shadow-amber-500/20'
                    : 'bg-slate-900/90 text-slate-300 hover:text-white border border-white/10 hover:border-amber-500/30'
                }\`}
              >
                ทุกหมวดหมู่ ({products.length})
              </button>
              {categories.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setStockCatFilter(c.id)}
                  className={\`px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer whitespace-nowrap \${
                    stockCatFilter === c.id
                      ? 'bg-amber-500 text-slate-950 font-black shadow-sm shadow-amber-500/20'
                      : 'bg-slate-900/90 text-slate-300 hover:text-white border border-white/10 hover:border-amber-500/30'
                  }\`}
                >
                  {c.name} ({products.filter(p => p.categoryId === c.id).length})
                </button>
              ))}
            </div>

            {/* Status Switcher & Search */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
              {/* Status Filter */}
              <div className="flex items-center bg-slate-900 border border-white/10 rounded-lg p-0.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => setStockStatusFilter('all')}
                  className={\`px-2 py-0.5 rounded transition font-bold cursor-pointer \${
                    stockStatusFilter === 'all' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }\`}
                >
                  ทั้งหมด
                </button>
                <button
                  type="button"
                  onClick={() => setStockStatusFilter('in_stock')}
                  className={\`px-2 py-0.5 rounded transition font-bold cursor-pointer \${
                    stockStatusFilter === 'in_stock' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }\`}
                >
                  พร้อมส่ง
                </button>
                <button
                  type="button"
                  onClick={() => setStockStatusFilter('out_of_stock')}
                  className={\`px-2 py-0.5 rounded transition font-bold cursor-pointer \${
                    stockStatusFilter === 'out_of_stock' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'
                  }\`}
                >
                  ของหมด
                </button>
              </div>

              {/* Search Input */}
              <div className="relative w-full sm:w-44">
                <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="ค้นหาในคลัง..."
                  value={stockSearch}
                  onChange={e => setStockSearch(e.target.value)}
                  className="w-full pl-7 pr-6 py-1 bg-slate-900/90 border border-white/10 rounded-full text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
                {stockSearch && (
                  <button
                    type="button"
                    onClick={() => setStockSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-[10px] cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 3. Product Stock Inventory Cards (Compact Density) */}
          <div className="space-y-3">
            {filteredStockProducts.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-white/5">
                <Package className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <h4 className="text-white font-bold text-xs mb-0.5">ไม่พบสินค้าตามเงื่อนไขที่เลือก</h4>
                <p className="text-[10px] text-slate-400 mb-3">ลองปรับตัวกรองหมวดหมู่ หรือคำค้นหาใหม่</p>
                <button
                  type="button"
                  onClick={() => {
                    setStockSearch('');
                    setStockCatFilter('all');
                    setStockStatusFilter('all');
                  }}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold cursor-pointer"
                >
                  ล้างการค้นหา
                </button>
              </div>
            ) : (
              categories.map(cat => {
                const catProducts = filteredStockProducts.filter(p => p.categoryId === cat.id);
                if (catProducts.length === 0) return null;

                const totalCatAvail = catProducts.reduce((sum, p) => {
                  return sum + p.packages.reduce((acc, pkg) => {
                    const avail = pkg.stockItems ? pkg.stockItems.filter(s => !s.isUsed).length : pkg.stock;
                    return acc + (avail > 0 ? avail : 0);
                  }, 0);
                }, 0);

                return (
                  <div key={cat.id} className="space-y-2.5 bg-slate-950/60 p-3 sm:p-3.5 rounded-2xl border border-white/10 shadow-sm">
                    {/* Category Header Bar */}
                    <div className="flex items-center justify-between px-1 pb-1.5 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
                        <h3 className="text-xs sm:text-sm font-black text-white tracking-wide uppercase flex items-center gap-2">
                          <span>{cat.name}</span>
                          <span className="text-[10px] text-amber-300 font-bold font-mono bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
                            {catProducts.length} สินค้า
                          </span>
                        </h3>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        พร้อมส่งในหมวดหมู่นี้: <strong className="text-emerald-400 font-bold">{totalCatAvail} ชิ้น</strong>
                      </span>
                    </div>

                    {/* 2 Products per row (1 แถบ มี 2 สินค้า) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {catProducts.map(prod => {
                        const prodAvail = prod.packages.reduce((acc, pkg) => {
                          const avail = pkg.stockItems ? pkg.stockItems.filter(s => !s.isUsed).length : pkg.stock;
                          return acc + (avail > 0 ? avail : 0);
                        }, 0);
                        const prodSold = prod.packages.reduce((acc, pkg) => {
                          const sold = pkg.stockItems ? pkg.stockItems.filter(s => s.isUsed).length : 0;
                          return acc + sold;
                        }, 0);
                        const hasOutOfStock = prod.packages.some(pkg => {
                          const avail = pkg.stockItems ? pkg.stockItems.filter(s => !s.isUsed).length : pkg.stock;
                          return avail <= 0 || !pkg.inStock;
                        });

                        return (
                          <div
                            key={prod.id}
                            className="bg-slate-900/80 border border-white/10 hover:border-amber-500/40 rounded-xl p-2.5 sm:p-3 transition shadow-md flex flex-col justify-between space-y-2.5"
                          >
                            {/* Product Header Row */}
                            <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/5">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-950 border border-white/10 shrink-0">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={prod.image}
                                    alt={prod.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target = e.currentTarget;
                                      if (!target.src.includes('46ebc6a271269458ec9b.webp')) {
                                        target.src = '/catalog/imported/46ebc6a271269458ec9b.webp';
                                      }
                                    }}
                                  />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 truncate max-w-[120px]">
                                      {cat.name}
                                    </span>
                                    {prodAvail > 0 ? (
                                      hasOutOfStock ? (
                                        <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                          บางแพ็กหมด
                                        </span>
                                      ) : (
                                        <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                          พร้อมส่ง
                                        </span>
                                      )
                                    ) : (
                                      <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
                                        สต็อกหมด
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="text-xs font-black text-white mt-0.5 truncate">{prod.name}</h4>
                                  <div className="text-[10px] text-slate-400 font-mono">
                                    {prod.packages.length} แพ็ก · พร้อมส่ง <strong className={prodAvail > 0 ? 'text-emerald-400' : 'text-rose-400'}>{prodAvail} ชิ้น</strong> · ขาย {prodSold} ชิ้น
                                  </div>
                                </div>
                              </div>

                              {/* Direct Stock Action Button */}
                              <button
                                type="button"
                                onClick={() => openStockManager(prod)}
                                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10.5px] flex items-center gap-1 transition shadow-sm shadow-amber-500/20 cursor-pointer shrink-0"
                              >
                                <Key className="w-3 h-3" />
                                <span>จัดการคลังสินค้านี้</span>
                              </button>
                            </div>

                            {/* Packages Stock Breakdown Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {prod.packages.map(pkg => {
                                const stockItems = pkg.stockItems || [];
                                const availItems = stockItems.filter(s => !s.isUsed);
                                const soldItems = stockItems.filter(s => s.isUsed);
                                const availCount = stockItems.length > 0 ? availItems.length : pkg.stock;
                                const hasDownloadUrl = !!(prod.downloadUrl || (stockItems.some(s => s.downloadUrl)));

                                return (
                                  <div
                                    key={pkg.id}
                                    className={\`p-2 rounded-lg border transition flex flex-col justify-between \${
                                      availCount <= 0 || !pkg.inStock
                                        ? 'bg-rose-950/20 border-rose-500/30'
                                        : 'bg-slate-950/70 border-white/5 hover:border-cyan-500/30'
                                    }\`}
                                  >
                                    <div>
                                      <div className="flex items-center justify-between">
                                        <span className="font-bold text-white text-[11px] truncate">{pkg.duration}</span>
                                        <span className="font-mono text-cyan-400 text-[11px] font-bold">฿{pkg.price}</span>
                                      </div>

                                      <div className="mt-0.5 flex items-baseline justify-between">
                                        <div className="text-[8.5px] text-slate-400">สถานะสต็อก:</div>
                                        <div className={\`font-mono text-[11px] font-black \${
                                          availCount > 0 ? 'text-emerald-400' : 'text-rose-400'
                                        }\`}>
                                          {availCount > 0 ? \`\${availCount} ชิ้น\` : 'ของหมด (0)'}
                                        </div>
                                      </div>

                                      {/* Items Breakdown */}
                                      <div className="mt-1 pt-1 border-t border-white/5 space-y-0.5 text-[9px] text-slate-400">
                                        <div className="flex items-center justify-between">
                                          <span className="flex items-center gap-1">
                                            <Key className="w-2.5 h-2.5 text-amber-400" />
                                            <span>คีย์</span>
                                          </span>
                                          <span className="font-mono text-slate-300 font-bold">
                                            {stockItems.length > 0
                                              ? \`\${stockItems.length} (ขาย \${soldItems.length})\`
                                              : \`\${pkg.stock} พร้อมส่ง\`}
                                          </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                          <span className="flex items-center gap-1">
                                            <Download className="w-2.5 h-2.5 text-cyan-400" />
                                            <span>ลิงก์โหลด</span>
                                          </span>
                                          <span className={\`font-mono \${hasDownloadUrl ? 'text-emerald-400' : 'text-slate-500'}\`}>
                                            {hasDownloadUrl ? 'มีลิงก์' : 'ค่าเริ่มต้น'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Button group for this package */}
                                    <div className="mt-1.5 pt-1 border-t border-white/5 flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={() => openStockManager(prod, pkg.id)}
                                        className="flex-1 py-1 px-1.5 rounded bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/30 text-[9.5px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                                        title={\`จัดการคลังสต็อกของ \${pkg.name}\`}
                                      >
                                        <Key className="w-2.5 h-2.5" />
                                        <span>คลัง ({availCount})</span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          playClick();
                                          const randKey = 'ARX-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
                                          addStockItem(prod.id, pkg.id, {
                                            key: randKey,
                                            downloadUrl: prod.downloadUrl,
                                            fileName: prod.name.replace(/\\s+/g, '_') + '.zip',
                                            note: 'สุ่มเพิ่มด่วน'
                                          });
                                          playSuccess();
                                        }}
                                        className="py-1 px-1.5 rounded bg-emerald-500/15 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/30 text-[9.5px] font-bold transition flex items-center gap-0.5 cursor-pointer shrink-0"
                                        title="กดเพื่อสุ่มสร้างและเติม 1 คีย์เข้าสต็อกทันที"
                                      >
                                        <Zap className="w-2.5 h-2.5" />
                                        <span>+1</span>
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>\n\n`;

content = content.slice(0, startIndex) + replacement + content.slice(endIndex);
fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully fixed stock tab in admin/page.tsx');
