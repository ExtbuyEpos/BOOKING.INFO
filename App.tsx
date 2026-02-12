
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link, useParams, useNavigate, useLocation } from 'react-router-dom';
// Fixed imports: Added AdminLogEntry, Language, Theme
import { Order, OrderStatus, User, PaymentStatus, OrderItem, AdminLogEntry, Language, Theme } from './types';
import { 
  getOrders, saveOrder, deleteOrder, getOrderById, 
  getAdminLogs, saveAdminLog, getUsers, saveUser, 
  deleteUser, authenticateUser, isUsernameUnique, 
  getUniqueCustomers, getOrdersByPhoneAndPin 
} from './store/orderStore';
import { generateOrderId, getStatusAdvice } from './services/geminiService';
import { StatusBadge } from './components/StatusBadge';

// --- TRANSLATIONS ---
const translations = {
  en: {
    dashboard: 'Dashboard',
    customers: 'Customers',
    settings: 'Settings',
    noOrders: 'No Bookings Found',
    garment: 'Garment',
    identity: 'Client',
    financials: 'Financials',
    lifecycle: 'Status',
    currency: 'OMR',
    newOrder: 'New Booking',
    customerInfo: 'Client Information',
    name: 'Full Name',
    phone: 'Phone Number',
    pinPlaceholder: 'Access PIN (4 digits)',
    address: 'Delivery Address',
    manifest: 'Items',
    itemName: 'Item Name',
    price: 'Price',
    save: 'Confirm & Save',
    cancel: 'Cancel',
    invalidPin: 'Invalid ID or PIN',
    securePortal: 'Secure Access Portal',
    loginId: 'Username / Phone / Order ID',
    password: 'PIN',
    welcome: 'Welcome Back',
    recentOrders: 'Recent Bookings',
    searchPlaceholder: 'Search by ID or Name...',
    backToDashboard: 'Return to Hub',
    neuralInsight: 'AI Assistant Insight',
    grandTotal: 'Total Payable',
    stateControl: 'Update Phase',
    statusNotePlaceholder: 'Add internal progress notes...',
    orderSpecifics: 'Booking Details',
    confirmDelete: 'Are you sure you want to delete this booking?',
    delete: 'Delete Booking',
    orderCount: 'Orders',
    lastOrder: 'Last Visit',
    status: 'Status',
    username: 'Username',
    pin: 'PIN',
    userManagement: 'System Users',
    adminLogs: 'System Activity Logs',
    history: 'Operational Timeline',
    updatedBy: 'Processed by',
    volume: 'Total Volume',
    pending: 'Pending Work',
    completed: 'Completed Orders',
    revenue: 'Revenue Analysis',
    totalRevenue: 'Total Revenue Generated',
    copyright: 'All Rights Reserved.',
    poweredBy: 'Powered by',
  },
  ar: {
    dashboard: 'لوحة التحكم',
    customers: 'العملاء',
    settings: 'الإعدادات',
    noOrders: 'لا توجد حجوزات',
    garment: 'القطعة',
    identity: 'العميل',
    financials: 'المالية',
    lifecycle: 'الحالة',
    currency: 'ر.ع.',
    newOrder: 'حجز جديد',
    customerInfo: 'بيانات العميل',
    name: 'الاسم الكامل',
    phone: 'رقم الهاتف',
    pinPlaceholder: 'رمز الوصول (4 أرقام)',
    address: 'عنوان التوصيل',
    manifest: 'الأصناف',
    itemName: 'اسم الصنف',
    price: 'السعر',
    save: 'تأكيد وحفظ',
    cancel: 'إلغاء',
    invalidPin: 'رمز الدخول أو المعرف غير صحيح',
    securePortal: 'بوابة الوصول الآمنة',
    loginId: 'اسم المستخدم / الهاتف / رقم الحجز',
    password: 'الرمز السري',
    welcome: 'مرحباً بك',
    recentOrders: 'الحجوزات الأخيرة',
    searchPlaceholder: 'بحث بالرقم أو الاسم...',
    backToDashboard: 'العودة للرئيسية',
    neuralInsight: 'رؤية المساعد الذكي',
    grandTotal: 'إجمالي المبلغ',
    stateControl: 'تحديث المرحلة',
    statusNotePlaceholder: 'إضافة ملاحظات التقدم الداخلية...',
    orderSpecifics: 'تفاصيل الحجز',
    confirmDelete: 'هل أنت متأكد من حذف هذا الحجز؟',
    delete: 'حذف الحجز',
    orderCount: 'الطلبات',
    lastOrder: 'آخر زيارة',
    status: 'الحالة',
    username: 'اسم المستخدم',
    pin: 'الرمز السري',
    userManagement: 'مستخدمي النظام',
    adminLogs: 'سجلات نشاط النظام',
    history: 'التسلسل الزمني للعمليات',
    updatedBy: 'بواسطة',
    volume: 'إجمالي الحجم',
    pending: 'العمل المعلق',
    completed: 'الطلبات المكتملة',
    revenue: 'تحليل الإيرادات',
    totalRevenue: 'إجمالي الإيرادات المحققة',
    copyright: 'جميع الحقوق محفوظة.',
    poweredBy: 'بدعم من',
  }
};

// --- SHARED UI COMPONENTS ---

const ImagePreviewModal: React.FC<{ imageUrl: string; onClose: () => void; lang: Language }> = ({ imageUrl, onClose, lang }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fade" onClick={onClose}>
      <button className="absolute top-6 right-6 text-white text-2xl hover:text-amber-500 transition-soft">
        <i className="fas fa-times"></i>
      </button>
      <img src={imageUrl} className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl animate-zoom" alt="Preview" onClick={(e) => e.stopPropagation()} />
    </div>
  );
};

const Navigation: React.FC<{ user: User; onLogout: () => void; lang: Language; setLang: (l: Language) => void; theme: Theme; setTheme: (t: Theme) => void }> = ({ user, onLogout, lang, setLang, theme, setTheme }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const t = translations[lang];

  return (
    <nav className="bg-white/90 dark:bg-black/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 sticky top-0 z-40 h-20 md:h-24 flex items-center shadow-sm transition-all duration-500">
      <div className="max-w-7xl mx-auto px-4 md:px-6 w-full flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-amber-600 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-soft">
            <i className="fas fa-spa text-black text-sm md:text-xl"></i>
          </div>
          <span className="font-black text-slate-900 dark:text-white tracking-tighter text-lg md:text-2xl hidden sm:block">Zahratalsawsen<span className="text-amber-600">Boutique</span></span>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden md:flex items-center gap-2 mr-4">
            <Link to="/" className={`px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-soft ${location.pathname === '/' ? 'bg-amber-50 dark:bg-white/5 text-amber-600' : 'text-slate-400'}`}>{t.dashboard}</Link>
            {user.role !== 'customer' && <Link to="/customers" className={`px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-soft ${location.pathname === '/customers' ? 'bg-amber-50 dark:bg-white/5 text-amber-600' : 'text-slate-400'}`}>{t.customers}</Link>}
            {user.role === 'admin' && <Link to="/settings" className={`px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-soft ${location.pathname === '/settings' ? 'bg-amber-50 dark:bg-white/5 text-amber-600' : 'text-slate-400'}`}>{t.settings}</Link>}
          </div>
          <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-amber-500 transition-soft text-[8px] font-black uppercase">{lang === 'en' ? 'AR' : 'EN'}</button>
          <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-amber-500 transition-soft">
            <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'} text-xs`}></i>
          </button>
          <button onClick={onLogout} className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-soft flex items-center justify-center"><i className="fas fa-power-off text-xs"></i></button>
        </div>
      </div>
    </nav>
  );
};

const Footer: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = translations[lang];
  const year = new Date().getFullYear();
  return (
    <footer className="w-full py-12 px-6 border-t border-slate-100 dark:border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-3 text-center">
        <div className="flex items-center gap-2 opacity-30 grayscale mb-2">
           <div className="w-6 h-6 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center">
             <i className="fas fa-spa text-[10px] text-white dark:text-black"></i>
           </div>
           <span className="font-black text-[10px] tracking-tighter dark:text-white uppercase">Zahratalsawsen</span>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
          © {year} Zahrat Al Sawsen. {t.copyright}
        </p>
        <p className="text-[8px] font-bold uppercase tracking-widest text-amber-600/60 transition-soft hover:text-amber-500 cursor-default">
          {t.poweredBy} Zahrat Al Sawsen
        </p>
      </div>
    </footer>
  );
};

const ResponsiveOrderList: React.FC<{ 
  orders: Order[]; 
  lang: Language; 
  onPreview: (url: string) => void;
  onNavigate: (id: string) => void;
  hideCustomerName?: boolean;
}> = ({ orders, lang, onPreview, onNavigate, hideCustomerName }) => {
  const t = translations[lang];
  if (orders.length === 0) return <div className="py-24 text-center font-black text-slate-300 dark:text-white/10 uppercase tracking-widest text-xs">{t.noOrders}</div>;

  return (
    <div className="w-full">
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] border-b border-slate-50 dark:border-white/5">
            <tr><th className="px-8 py-6">{t.garment}</th>{!hideCustomerName && <th className="px-8 py-6">{t.identity}</th>}<th className="px-8 py-6">{t.financials}</th><th className="px-8 py-6">{t.lifecycle}</th><th className="px-8 py-6"></th></tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-white/5">
            {orders.map(order => {
              const firstImg = order.items.find(it => it.imageUrl)?.imageUrl;
              return (
                <tr key={order.id} className="group hover:bg-slate-50 dark:hover:bg-white/[0.02] cursor-pointer transition-soft" onClick={() => onNavigate(order.id)}>
                  <td className="px-8 py-6">
                    <div onClick={(e) => { e.stopPropagation(); firstImg && onPreview(firstImg); }} className="w-14 h-14 bg-slate-100 dark:bg-white/5 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200 dark:border-white/10 hover:scale-105 transition-soft">
                      {firstImg ? <img src={firstImg} className="w-full h-full object-cover" alt="" /> : <i className="fas fa-spa text-slate-300 dark:text-slate-700"></i>}
                    </div>
                  </td>
                  {!hideCustomerName && <td className="px-8 py-6 font-black text-slate-900 dark:text-white tracking-tight">{order.customerName}</td>}
                  <td className="px-8 py-6">
                    <div className="font-black text-slate-900 dark:text-white">{order.totalAmount.toFixed(3)} {t.currency}</div>
                    <span className={`text-[8px] font-black uppercase ${order.paymentStatus === PaymentStatus.PAID ? 'text-emerald-500' : 'text-rose-500'}`}>{order.paymentStatus}</span>
                  </td>
                  <td className="px-8 py-6"><StatusBadge status={order.orderStatus} /></td>
                  <td className="px-8 py-6 text-right"><i className="fas fa-chevron-right text-slate-200 group-hover:text-amber-500 transition-soft"></i></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="md:hidden grid grid-cols-1 gap-4 p-4">
        {orders.map(order => {
           const firstImg = order.items.find(it => it.imageUrl)?.imageUrl;
           return (
             <div key={order.id} className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-3xl p-5 flex items-center gap-5 active:scale-95 transition-soft" onClick={() => onNavigate(order.id)}>
                <div className="w-16 h-16 shrink-0 bg-slate-100 dark:bg-white/5 rounded-2xl overflow-hidden border border-slate-100 dark:border-white/10 flex items-center justify-center">
                   {firstImg ? <img src={firstImg} className="w-full h-full object-cover" alt="" /> : <i className="fas fa-spa text-slate-300 dark:text-slate-700"></i>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-amber-600 font-black text-[10px] tracking-widest">{order.id}</span>
                    <span className="text-slate-900 dark:text-white font-black text-xs">{order.totalAmount.toFixed(3)} {t.currency}</span>
                  </div>
                  {!hideCustomerName && <div className="text-slate-900 dark:text-white font-black text-sm truncate">{order.customerName}</div>}
                  <div className="flex justify-between items-center mt-3">
                    <StatusBadge status={order.orderStatus} />
                    <span className={`text-[8px] font-black uppercase ${order.paymentStatus === PaymentStatus.PAID ? 'text-emerald-500' : 'text-rose-500'}`}>{order.paymentStatus}</span>
                  </div>
                </div>
             </div>
           );
        })}
      </div>
    </div>
  );
};

// --- PAGES & MODALS ---

const CreateOrderModal: React.FC<{ user: User; lang: Language; onClose: () => void }> = ({ user, lang, onClose }) => {
  const t = translations[lang];
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerPin, setCustomerPin] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

  const addItem = () => {
    if (newItemName && newItemPrice) {
      setItems([...items, { id: Date.now().toString(), itemName: newItemName, price: parseFloat(newItemPrice), quantity: 1 }]);
      setNewItemName('');
      setNewItemPrice('');
    }
  };

  const handleSave = async () => {
    if (!customerName || !customerPhone || items.length === 0) return;
    setLoading(true);
    const id = await generateOrderId();
    const totalAmount = items.reduce((acc, it) => acc + it.price, 0);
    const newOrder: Order = {
      id,
      customerName,
      customerPhone,
      customerPin: customerPin || '1234',
      customerAddress,
      items,
      totalAmount,
      paymentStatus: PaymentStatus.UNPAID,
      orderStatus: OrderStatus.CREATED,
      createdAt: new Date().toISOString(),
      history: [{ status: OrderStatus.CREATED, timestamp: new Date().toISOString(), updatedBy: user.name, note: 'Initial booking created.' }]
    };
    saveOrder(newOrder);
    saveAdminLog({ id: Date.now().toString(), timestamp: new Date().toISOString(), adminName: user.name, action: 'CREATE_ORDER', details: `Created order ${id}`, orderId: id });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-zoom" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center">
          <h2 className="text-xl font-black dark:text-white uppercase tracking-widest">{t.newOrder}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition-soft"><i className="fas fa-times text-xl"></i></button>
        </div>
        <div className="p-8 max-h-[70vh] overflow-y-auto space-y-8">
          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-amber-600 uppercase tracking-widest">{t.customerInfo}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder={t.name} value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 dark:text-white outline-none focus:ring-2 focus:ring-amber-500/20" />
              <input type="text" placeholder={t.phone} value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 dark:text-white outline-none focus:ring-2 focus:ring-amber-500/20" />
              <input type="text" placeholder={t.pinPlaceholder} value={customerPin} onChange={e => setCustomerPin(e.target.value)} className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 dark:text-white outline-none focus:ring-2 focus:ring-amber-500/20" maxLength={4} />
              <input type="text" placeholder={t.address} value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 dark:text-white outline-none focus:ring-2 focus:ring-amber-500/20" />
            </div>
          </section>
          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-amber-600 uppercase tracking-widest">{t.manifest}</h3>
            <div className="flex gap-2">
              <input type="text" placeholder={t.itemName} value={newItemName} onChange={e => setNewItemName(e.target.value)} className="flex-1 px-5 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 dark:text-white outline-none" />
              <input type="number" placeholder={t.price} value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} className="w-24 px-5 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 dark:text-white outline-none" />
              <button onClick={addItem} className="px-5 bg-slate-900 dark:bg-amber-600 text-white dark:text-black rounded-xl font-black uppercase text-[10px]"><i className="fas fa-plus"></i></button>
            </div>
            <div className="space-y-2">
              {items.map(it => (
                <div key={it.id} className="flex justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10">
                  <span className="font-bold dark:text-white">{it.itemName}</span>
                  <span className="font-black text-amber-600">{it.price.toFixed(3)} {t.currency}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
        <div className="p-8 border-t border-slate-100 dark:border-white/5 flex gap-4">
          <button disabled={loading} onClick={handleSave} className="flex-1 bg-amber-600 text-black py-4 rounded-2xl font-black uppercase text-xs shadow-lg active:scale-95 transition-soft disabled:opacity-50">
            {loading ? '...' : t.save}
          </button>
          <button onClick={onClose} className="px-8 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white py-4 rounded-2xl font-black uppercase text-xs transition-soft">
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
};

const LoginPage: React.FC<{ onLogin: (user: User) => void; lang: Language; setLang: (l: Language) => void; theme: Theme }> = ({ onLogin, lang, setLang, theme }) => {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const t = translations[lang];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const foundUser = authenticateUser(username, pin);
    if (foundUser) onLogin(foundUser);
    else { setError(t.invalidPin); setPin(''); }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = ((clientX - left) / width - 0.5) * 15;
    const y = ((clientY - top) / height - 0.5) * -15;
    setTilt({ x, y });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-black relative overflow-hidden perspective-1000" dir={lang === 'ar' ? 'rtl' : 'ltr'} onMouseMove={handleMouseMove} onMouseLeave={() => setTilt({ x: 0, y: 0 })}>
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-amber-600/10 rounded-full blur-[120px] animate-pulse pointer-events-none"></div>
      <div className="bg-white dark:bg-white/[0.02] backdrop-blur-3xl p-8 md:p-14 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-2xl w-full max-w-md transition-transform duration-200 ease-out preserve-3d" style={{ transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)` }}>
        <div className="text-center mb-10 translate-z-10">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-600 to-yellow-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl animate-float">
            <i className="fas fa-spa text-black text-3xl"></i>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-2 italic">Zahratalsawsen</h1>
          <p className="text-amber-500 font-black uppercase tracking-[0.4em] text-[8px] md:text-[10px]">{t.securePortal}</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6 translate-z-20">
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder={t.loginId} className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500/20 transition-soft font-bold" required />
          <input type="password" value={pin} onChange={e => setPin(e.target.value)} placeholder={t.password} className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white text-center text-xl tracking-[0.4em] outline-none focus:ring-2 focus:ring-amber-500/20 transition-soft font-bold" required />
          {error && <div className="text-rose-500 text-[10px] text-center font-black uppercase tracking-widest">{error}</div>}
          <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-black font-black py-4 rounded-2xl shadow-xl transition-soft active:scale-95 text-base uppercase tracking-widest">Authenticate Access</button>
        </form>
      </div>
    </div>
  );
};

const Dashboard: React.FC<{ user: User; lang: Language }> = ({ user, lang }) => {
  const navigate = useNavigate();
  const t = translations[lang];
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    const fetch = () => {
      let all = (user.role === 'admin' || user.role === 'staff' || user.role === 'viewer') ? getOrders() : getOrdersByPhoneAndPin(user.username, user.pin);
      setOrders(all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    };
    fetch();
    const it = setInterval(fetch, 5000);
    return () => clearInterval(it);
  }, [user]);

  const stats = useMemo(() => {
    const revenue = orders.reduce((acc, o) => acc + o.totalAmount, 0);
    const pending = orders.filter(o => o.orderStatus !== OrderStatus.COMPLETED && o.orderStatus !== OrderStatus.CUSTOMER_RECEIVED).length;
    const completed = orders.filter(o => o.orderStatus === OrderStatus.COMPLETED).length;
    return { revenue, pending, completed, total: orders.length };
  }, [orders]);

  const filtered = orders.filter(o => o.id.toLowerCase().includes(search.toLowerCase()) || o.customerName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12 animate-fade" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="mb-8 md:mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-2 italic">{t.welcome}, {user.name.split(' ')[0]}</h2>
          <div className="flex items-center gap-3 text-slate-400 font-bold uppercase text-[9px] tracking-[0.4em]">
            <div className="w-8 h-1 bg-amber-600 rounded-full"></div> <span>{t.dashboard}</span>
          </div>
        </div>
        {(user.role === 'admin' || user.role === 'staff') && (
          <button onClick={() => setShowCreate(true)} className="w-full md:w-auto bg-slate-900 dark:bg-amber-600 text-white dark:text-black px-8 py-4 rounded-2xl font-black uppercase text-xs shadow-xl active:scale-95 transition-soft flex items-center justify-center gap-2">
            <i className="fas fa-plus"></i> {t.newOrder}
          </button>
        )}
      </header>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard label="Volume" value={stats.total} icon="fa-scroll" color="text-amber-600" to="/filtered/analytics/volume" />
        <StatCard label="Pending" value={stats.pending} icon="fa-spa" color="text-amber-600" to="/filtered/analytics/pending" />
        <StatCard label="Completed" value={stats.completed} icon="fa-circle-check" color="text-emerald-600" to="/filtered/analytics/completed" />
        <StatCard label="Revenue" value={`${stats.revenue.toFixed(3)} ${t.currency}`} icon="fa-vault" color="text-amber-600" to="/filtered/analytics/revenue" />
      </div>

      <div className="bg-white dark:bg-white/[0.02] rounded-3xl md:rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden animate-entry">
        <div className="p-5 md:p-8 border-b border-slate-50 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] self-start">{t.recentOrders}</h3>
          <div className="relative w-full sm:w-80 group">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700 group-focus-within:text-amber-500 transition-colors"></i>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t.searchPlaceholder} className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-white/5 border-none rounded-2xl outline-none font-bold text-xs dark:text-white" />
          </div>
        </div>
        <ResponsiveOrderList orders={filtered} lang={lang} onPreview={setPreviewImg} onNavigate={id => navigate(`/order/${id}`)} />
      </div>
      {showCreate && <CreateOrderModal user={user} lang={lang} onClose={() => setShowCreate(false)} />}
      {previewImg && <ImagePreviewModal imageUrl={previewImg} onClose={() => setPreviewImg(null)} lang={lang} />}
    </div>
  );
};

const OrderDetailsPage: React.FC<{ user: User; lang: Language }> = ({ user, lang }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const t = translations[lang];
  const [order, setOrder] = useState<Order | undefined>(undefined);
  const [advice, setAdvice] = useState('');
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [note, setNote] = useState('');
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const o = getOrderById(id);
      setOrder(o);
      if (o) refreshAdvice(o.orderStatus);
    }
  }, [id]);

  const refreshAdvice = (status: string) => {
    setLoadingAdvice(true);
    getStatusAdvice(status).then(res => setAdvice(res)).finally(() => setLoadingAdvice(false));
  };

  const handleUpdate = async (next: OrderStatus) => {
    if (!order) return;
    setUpdating(true);
    const updated: Order = {
      ...order,
      orderStatus: next,
      history: [{ status: next, timestamp: new Date().toISOString(), updatedBy: user.name, note: note || `Phase update.` }, ...order.history]
    };
    saveOrder(updated);
    setOrder(updated);
    setNote('');
    setUpdating(false);
    refreshAdvice(next);
  };

  if (!order) return <div className="p-20 text-center font-black text-slate-400 uppercase">{t.noOrders}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12 animate-fade" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <button onClick={() => navigate(-1)} className="px-5 py-3 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl font-black text-[9px] uppercase tracking-widest text-slate-400 hover:text-amber-500 transition-soft">
           <i className={`fas ${lang === 'ar' ? 'fa-chevron-right' : 'fa-chevron-left'} mr-2`}></i> {t.backToDashboard}
        </button>
        <StatusBadge status={order.orderStatus} />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* AI Advisor Section */}
          <section className="bg-slate-900 dark:bg-amber-600 p-8 rounded-[2.5rem] shadow-2xl text-center md:text-left relative overflow-hidden group animate-entry">
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="w-20 h-20 bg-amber-600 dark:bg-black rounded-3xl flex items-center justify-center shrink-0 shadow-xl">
                 <i className="fas fa-robot text-white dark:text-amber-500 text-3xl"></i>
              </div>
              <div className="flex-1">
                 <h3 className="text-[10px] font-black text-amber-400 dark:text-black/60 uppercase tracking-[0.4em] mb-2">{t.neuralInsight}</h3>
                 <p className="text-white dark:text-black text-xl font-black italic">"{advice || 'Consulting database...'}"</p>
              </div>
            </div>
          </section>

          {/* Garment manifest */}
          <section className="bg-white dark:bg-white/[0.02] p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 animate-entry stagger-1">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8">{t.manifest}</h3>
             <div className="space-y-4">
               {order.items.map(it => (
                 <div key={it.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                    <div className="flex items-center gap-4">
                       <div onClick={() => it.imageUrl && setPreviewImg(it.imageUrl)} className="w-12 h-12 bg-white dark:bg-black rounded-xl overflow-hidden border border-slate-100 dark:border-white/10 flex items-center justify-center cursor-zoom-in">
                          {it.imageUrl ? <img src={it.imageUrl} className="w-full h-full object-cover" alt="" /> : <i className="fas fa-spa text-slate-300"></i>}
                       </div>
                       <span className="font-black text-slate-900 dark:text-white">{it.itemName}</span>
                    </div>
                    <span className="font-black text-amber-600">{it.price.toFixed(3)} {t.currency}</span>
                 </div>
               ))}
             </div>
             <div className="mt-8 pt-8 border-t border-slate-50 dark:border-white/5 flex justify-between items-center">
                <span className="font-black text-2xl tracking-tighter dark:text-white">{t.grandTotal}</span>
                <span className="font-black text-3xl text-amber-600">{order.totalAmount.toFixed(3)} {t.currency}</span>
             </div>
          </section>

          {/* Timeline Section */}
          <section className="bg-white dark:bg-white/[0.02] p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 animate-entry stagger-2">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10">{t.history}</h3>
             <div className="relative space-y-8 pl-6 border-l-2 border-slate-100 dark:border-white/5">
                {order.history.map((entry, idx) => (
                  <div key={idx} className="relative group">
                    <div className={`absolute -left-[33px] top-0 w-4 h-4 rounded-full border-4 border-white dark:border-black transition-colors ${idx === 0 ? 'bg-amber-600 scale-125' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                    <div className="bg-slate-50 dark:bg-white/5 p-5 rounded-2xl border border-transparent hover:border-amber-500/20 transition-soft">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <span className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-widest">{entry.status}</span>
                        <span className="text-[10px] text-slate-400 font-bold">{new Date(entry.timestamp).toLocaleString(lang === 'ar' ? 'ar-OM' : 'en-OM')}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <i className="fas fa-user-circle text-amber-600 text-xs opacity-60"></i>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">{t.updatedBy}: {entry.updatedBy}</span>
                      </div>
                      {entry.note && (
                        <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 italic">
                          "{entry.note}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
             </div>
          </section>
        </div>

        <div className="space-y-10">
          {(user.role === 'admin' || user.role === 'staff') && (
            <section className="bg-white dark:bg-white/[0.02] p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm animate-entry stagger-1">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6">{t.stateControl}</h3>
               <div className="grid grid-cols-1 gap-2 mb-6">
                 {Object.values(OrderStatus).map(s => (
                    <button key={s} disabled={order.orderStatus === s || updating} onClick={() => handleUpdate(s)} className={`py-3 rounded-2xl font-black uppercase text-[9px] tracking-widest transition-soft border ${order.orderStatus === s ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-50 dark:bg-white/5 text-slate-500 border-transparent hover:border-amber-600'}`}>
                      {s}
                    </button>
                 ))}
               </div>
               <textarea value={note} onChange={e => setNote(e.target.value)} placeholder={t.statusNotePlaceholder} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 text-xs dark:text-white outline-none focus:ring-2 focus:ring-amber-500/20 h-24 resize-none transition-soft" />
            </section>
          )}
          <section className="bg-white dark:bg-white/[0.02] p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 animate-entry stagger-2">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6">{t.orderSpecifics}</h3>
             <div className="space-y-4">
                <div><span className="text-[8px] font-black uppercase text-slate-400">{t.identity}</span><p className="font-black text-slate-900 dark:text-white text-lg">{order.customerName}</p></div>
                <div><span className="text-[8px] font-black uppercase text-slate-400">{t.phone}</span><p className="font-bold text-amber-600">{order.customerPhone}</p></div>
             </div>
          </section>
          {user.role === 'admin' && (
            <button onClick={() => { if(window.confirm(t.confirmDelete)) { deleteOrder(order.id); navigate('/'); } }} className="w-full py-5 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:bg-rose-500 hover:text-white transition-soft shadow-sm animate-entry stagger-3">
               {t.delete}
            </button>
          )}
        </div>
      </div>
      {previewImg && <ImagePreviewModal imageUrl={previewImg} onClose={() => setPreviewImg(null)} lang={lang} />}
    </div>
  );
};

const CustomerListPage: React.FC<{ user: User; lang: Language }> = ({ user, lang }) => {
  const navigate = useNavigate();
  const t = translations[lang];
  const customers = getUniqueCustomers();

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 animate-fade" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-8 italic">{t.customers}</h2>
      <div className="bg-white dark:bg-white/[0.02] rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden animate-entry">
        <table className="w-full text-left">
          <thead className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] border-b border-slate-50 dark:border-white/5">
            <tr><th className="px-8 py-6">{t.name}</th><th className="px-8 py-6">{t.phone}</th><th className="px-8 py-6">{t.orderCount}</th><th className="px-8 py-6">{t.lastOrder}</th><th className="px-8 py-6"></th></tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-white/5">
            {customers.map(c => (
              <tr key={c.phone} className="group hover:bg-slate-50 dark:hover:bg-white/[0.02] cursor-pointer transition-soft" onClick={() => navigate(`/customer/${c.phone}`)}>
                <td className="px-8 py-6 font-black text-slate-900 dark:text-white">{c.name}</td>
                <td className="px-8 py-6 text-amber-600 font-bold">{c.phone}</td>
                <td className="px-8 py-6 font-bold dark:text-white">{c.orderCount}</td>
                <td className="px-8 py-6 text-slate-400 text-xs">{new Date(c.lastOrder).toLocaleDateString()}</td>
                <td className="px-8 py-6 text-right"><i className="fas fa-chevron-right text-slate-200 group-hover:text-amber-500 transition-soft"></i></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const CustomerProfilePage: React.FC<{ user: User; lang: Language }> = ({ user, lang }) => {
  const { phone } = useParams<{ phone: string }>();
  const navigate = useNavigate();
  const t = translations[lang];
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const all = getOrders();
    setOrders(all.filter(o => o.customerPhone === phone));
  }, [phone]);

  const totalSpent = useMemo(() => orders.reduce((sum, o) => sum + o.totalAmount, 0), [orders]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 animate-fade" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <button onClick={() => navigate(-1)} className="mb-8 px-5 py-3 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl font-black text-[9px] uppercase tracking-widest text-slate-400 hover:text-amber-500 transition-soft">
        <i className={`fas ${lang === 'ar' ? 'fa-chevron-right' : 'fa-chevron-left'} mr-2`}></i> {t.backToDashboard}
      </button>
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic">{orders[0]?.customerName || t.customerInfo}</h2>
          <p className="text-amber-600 font-bold uppercase tracking-widest text-xs mt-2">{phone}</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Lifetime Volume</span>
          <span className="text-2xl font-black text-slate-900 dark:text-white">{totalSpent.toFixed(3)} {t.currency}</span>
        </div>
      </div>
      <div className="bg-white dark:bg-white/[0.02] rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden animate-entry">
        <ResponsiveOrderList orders={orders} lang={lang} onPreview={() => {}} onNavigate={id => navigate(`/order/${id}`)} hideCustomerName />
      </div>
    </div>
  );
};

const SettingsPage: React.FC<{ user: User; lang: Language }> = ({ user, lang }) => {
  const t = translations[lang];
  const [users, setUsers] = useState<User[]>([]);
  // Fixed: explicitly type logs state with AdminLogEntry
  const [logs, setLogs] = useState<AdminLogEntry[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'staff' | 'viewer'>('staff');

  useEffect(() => {
    setUsers(getUsers());
    setLogs(getAdminLogs());
  }, []);

  const handleAddUser = () => {
    if (!newUsername || !newPin || !newName) return;
    const u: User = { id: Date.now().toString(), name: newName, username: newUsername, pin: newPin, role: newRole as any, createdAt: new Date().toISOString() };
    if (saveUser(u)) {
      setUsers(getUsers());
      setShowAddUser(false);
      setNewUsername(''); setNewName(''); setNewPin('');
    } else {
      alert('Username must be unique');
    }
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm('Delete this user?')) {
      if (deleteUser(id)) setUsers(getUsers());
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 animate-fade" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-12 italic">{t.settings}</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <section className="bg-white dark:bg-white/[0.02] p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 animate-entry">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">{t.userManagement}</h3>
            <button onClick={() => setShowAddUser(true)} className="w-10 h-10 bg-amber-600 text-black rounded-xl flex items-center justify-center shadow-lg"><i className="fas fa-plus"></i></button>
          </div>
          {showAddUser && (
            <div className="mb-8 p-6 bg-slate-50 dark:bg-white/5 rounded-2xl space-y-4">
               <input type="text" placeholder={t.name} value={newName} onChange={e => setNewName(e.target.value)} className="w-full px-5 py-3 rounded-xl bg-white dark:bg-black border border-slate-100 dark:border-white/10 dark:text-white outline-none" />
               <input type="text" placeholder={t.username} value={newUsername} onChange={e => setNewUsername(e.target.value)} className="w-full px-5 py-3 rounded-xl bg-white dark:bg-black border border-slate-100 dark:border-white/10 dark:text-white outline-none" />
               <input type="text" placeholder={t.pin} value={newPin} onChange={e => setNewPin(e.target.value)} className="w-full px-5 py-3 rounded-xl bg-white dark:bg-black border border-slate-100 dark:border-white/10 dark:text-white outline-none" />
               <select value={newRole} onChange={e => setNewRole(e.target.value as any)} className="w-full px-5 py-3 rounded-xl bg-white dark:bg-black border border-slate-100 dark:border-white/10 dark:text-white outline-none">
                 <option value="staff">Staff</option>
                 <option value="admin">Admin</option>
                 <option value="viewer">Viewer</option>
               </select>
               <div className="flex gap-2">
                 <button onClick={handleAddUser} className="flex-1 bg-slate-900 dark:bg-amber-600 text-white dark:text-black py-3 rounded-xl font-black text-[10px] uppercase">{t.save}</button>
                 <button onClick={() => setShowAddUser(false)} className="px-6 bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-white py-3 rounded-xl font-black text-[10px] uppercase">{t.cancel}</button>
               </div>
            </div>
          )}
          <div className="space-y-4">
            {users.map(u => (
              <div key={u.id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 transition-soft hover:border-amber-500/20">
                <div>
                  <div className="font-black dark:text-white">{u.name} <span className="text-[8px] text-amber-600 ml-2 uppercase tracking-widest">{u.role}</span></div>
                  <div className="text-[10px] text-slate-400">@{u.username}</div>
                </div>
                {u.role !== 'admin' && <button onClick={() => handleDeleteUser(u.id)} className="text-rose-500 hover:scale-110 transition-soft"><i className="fas fa-trash"></i></button>}
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white dark:bg-white/[0.02] p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 animate-entry stagger-1">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8">{t.adminLogs}</h3>
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {logs.map(log => (
              <div key={log.id} className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-amber-600 font-black text-[8px] uppercase tracking-widest">{log.action}</span>
                  <span className="text-slate-400 text-[8px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-[10px] font-bold dark:text-white">{log.details}</p>
                <div className="text-[8px] text-slate-400 mt-2 uppercase">{log.adminName}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

const FilteredOrdersPage: React.FC<{ user: User; lang: Language }> = ({ user, lang }) => {
  const { type, value } = useParams<{ type: string; value: string }>();
  const navigate = useNavigate();
  const t = translations[lang];
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const all = getOrders();
    if (type === 'status') {
      setOrders(all.filter(o => o.orderStatus === value));
    } else if (type === 'analytics') {
      if (value === 'volume') setOrders(all);
      else if (value === 'pending') setOrders(all.filter(o => o.orderStatus !== OrderStatus.COMPLETED && o.orderStatus !== OrderStatus.CUSTOMER_RECEIVED));
      else if (value === 'completed') setOrders(all.filter(o => o.orderStatus === OrderStatus.COMPLETED));
      else if (value === 'revenue') setOrders(all);
    }
  }, [type, value]);

  const totalRevenue = useMemo(() => orders.reduce((sum, o) => sum + o.totalAmount, 0), [orders]);

  const pageTitle = useMemo(() => {
    if (type === 'analytics') {
      if (value === 'volume') return t.volume;
      if (value === 'pending') return t.pending;
      if (value === 'completed') return t.completed;
      if (value === 'revenue') return t.revenue;
    }
    return `${t.status}: ${value}`;
  }, [type, value, t]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 animate-fade" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
       <button onClick={() => navigate(-1)} className="mb-8 px-5 py-3 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl font-black text-[9px] uppercase tracking-widest text-slate-400 hover:text-amber-500 transition-soft">
        <i className={`fas ${lang === 'ar' ? 'fa-chevron-right' : 'fa-chevron-left'} mr-2`}></i> {t.backToDashboard}
      </button>
      
      <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter italic">{pageTitle}</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">Analytical Manifest</p>
        </div>
        {value === 'revenue' && (
          <div className="bg-amber-600 p-6 rounded-3xl shadow-xl min-w-[200px]">
            <span className="text-[8px] font-black text-black/60 uppercase tracking-widest block mb-1">{t.totalRevenue}</span>
            <span className="text-2xl font-black text-white">{totalRevenue.toFixed(3)} {t.currency}</span>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-white/[0.02] rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden animate-entry">
        <ResponsiveOrderList orders={orders} lang={lang} onPreview={() => {}} onNavigate={id => navigate(`/order/${id}`)} />
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string | number; icon: string; color: string; to?: string }> = ({ label, value, icon, color, to }) => {
  const Card = (
    <div className={`bg-white dark:bg-white/[0.02] p-6 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm transition-all duration-300 ${to ? 'hover:border-amber-500/30 hover:-translate-y-1 hover:shadow-lg group' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest group-hover:text-amber-500 transition-colors">{label}</span>
        <i className={`fas ${icon} ${color} opacity-40 group-hover:opacity-100 transition-all group-hover:scale-110`}></i>
      </div>
      <div className="text-xl font-black text-slate-900 dark:text-white truncate transition-all group-hover:tracking-tight">{value}</div>
    </div>
  );

  if (to) return <Link to={to}>{Card}</Link>;
  return Card;
};

// --- MAIN APP COMPONENT ---

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('zs_session_user');
    return saved ? JSON.parse(saved) : null;
  });
  // Fixed: use Language and Theme types correctly
  const [lang, setLang] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('zs_theme') as Theme) || 'dark');
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.body.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('zs_theme', theme);
  }, [theme]);

  const handleLogin = (u: User) => { setUser(u); localStorage.setItem('zs_session_user', JSON.stringify(u)); };
  const handleLogout = () => { setUser(null); localStorage.removeItem('zs_session_user'); };

  if (!user) return <LoginPage onLogin={handleLogin} lang={lang} setLang={setLang} theme={theme} />;

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme === 'dark' ? 'dark bg-black text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Navigation user={user} onLogout={handleLogout} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} />
      <div className="pb-24 md:pb-0 flex flex-col min-h-[calc(100vh-80px)] md:min-h-[calc(100vh-96px)]">
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard user={user} lang={lang} />} />
            <Route path="/order/:id" element={<OrderDetailsPage user={user} lang={lang} />} />
            <Route path="/customers" element={<CustomerListPage user={user} lang={lang} />} />
            <Route path="/customer/:phone" element={<CustomerProfilePage user={user} lang={lang} />} />
            <Route path="/settings" element={<SettingsPage user={user} lang={lang} />} />
            <Route path="/filtered/:type/:value" element={<FilteredOrdersPage user={user} lang={lang} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
        <Footer lang={lang} />
      </div>
      
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/5 z-40 flex items-center justify-around px-4">
        <Link to="/" className={`flex flex-col items-center gap-1 ${location.pathname === '/' ? 'text-amber-600' : 'text-slate-400'}`}>
          <i className="fas fa-home text-lg"></i>
          <span className="text-[8px] font-black uppercase">Home</span>
        </Link>
        {user.role !== 'customer' && (
          <Link to="/customers" className={`flex flex-col items-center gap-1 ${location.pathname.startsWith('/customer') ? 'text-amber-600' : 'text-slate-400'}`}>
            <i className="fas fa-users text-lg"></i>
            <span className="text-[8px] font-black uppercase">Clients</span>
          </Link>
        )}
        {user.role === 'admin' && (
          <Link to="/settings" className={`flex flex-col items-center gap-1 ${location.pathname === '/settings' ? 'text-amber-600' : 'text-slate-400'}`}>
            <i className="fas fa-cog text-lg"></i>
            <span className="text-[8px] font-black uppercase">Settings</span>
          </Link>
        )}
      </div>
    </div>
  );
};

const AppWrapper: React.FC = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;
