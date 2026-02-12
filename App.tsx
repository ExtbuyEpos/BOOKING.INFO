
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { Order, OrderStatus, User, PaymentStatus, OrderItem, OrderHistoryEntry, AdminLogEntry } from './types';
import { getOrders, saveOrder, getOrdersByPin, deleteOrder, getOrderById, getAdminLogs, saveAdminLog, getUsers, saveUser, deleteUser, authenticateUser, isUsernameUnique, getUniqueCustomers, getOrdersByPhoneAndPin } from './store/orderStore';
import { generateOrderId, getStatusAdvice } from './services/geminiService';
import { StatusBadge } from './components/StatusBadge';

// --- TRANSLATIONS ---
const translations = {
  en: {
    dashboard: "Operations",
    login: "Authenticate",
    pinEntry: "Access PIN",
    securePortal: "Zahratalsawsen Boutique Management",
    welcome: "Welcome back",
    newOrder: "Create Booking",
    totalOrders: "Dress Volume",
    activeProcessing: "In Prep",
    totalValue: "Revenue",
    recentOrders: "Recent Records",
    identity: "Client",
    financials: "Payment",
    lifecycle: "Phase",
    actions: "Manage",
    noOrders: "No active garments found.",
    searchPlaceholder: "Search ID or Name...",
    exitInspection: "Close",
    orderSpecifics: "Booking Details",
    payment: "Balance",
    communication: "Contact",
    logistics: "Logistics",
    manifest: "Garments",
    grandTotal: "Total Bill",
    operationalLogs: "Timeline",
    neuralInsight: "Boutique AI Advisor",
    stateControl: "Status Control",
    securityProtocol: "Security",
    delete: "Remove",
    confirmDelete: "Wipe this record?",
    newDeployment: "New Booking",
    clientName: "Client Name",
    phone: "Contact No.",
    address: "Location",
    creditStatus: "Payment Mode",
    inventory: "Dress Items",
    add: "Add",
    launch: "Finalize",
    currency: "OMR",
    statusNotePlaceholder: "Log specific notes...",
    updateStatus: "Apply Status",
    historyDetails: "Log",
    timestamp: "Time",
    performer: "Staff",
    shareOrder: "Share",
    linkCopied: "Copied!",
    trackYourOrder: "Track Order",
    invalidPin: "Invalid credentials.",
    settings: "Settings",
    paid: "Paid",
    unpaid: "Pending",
    itemName: "Type",
    itemPrice: "Price",
    linkExpired: "Finalized",
    linkExpiredMsg: "Access restricted.",
    insufficientPerms: "No Access",
    loginId: "Staff ID",
    password: "PIN",
    customers: "Clients",
    roles: "Staff",
    lastSeen: "Last Visit",
    ordersCount: "Bookings",
    staffCount: "Team",
    statsOverview: "Performance",
    daily: "Today",
    weekly: "Weekly",
    monthly: "Monthly",
    total: "Total",
    pending: "Process",
    completed: "Ready",
    received: "Delivered",
    filteredTitle: "Search Results",
    backToDashboard: "Dashboard",
    backToLogin: "Home",
    close: "Close",
    whatsappShare: "WhatsApp",
    trackingTitle: "Tracking",
    orderNotFound: "Record Not Found",
    currentStatus: "Phase",
    manageStaff: "Staff Hub",
    roleAdmin: "Admin",
    roleStaff: "Staff",
    roleViewer: "Viewer",
    permissions: "Access",
    viewOnly: "Read Only",
    fullEdit: "Full Access",
    addStaff: "Add Staff",
    yourOtherBookings: "Other Orders",
    viewBooking: "Open",
    garment: "Garment",
    newActivity: "New Activity",
    profile: "Profile",
    lifetimeSpent: "Total Spent",
    memberSince: "Client Since",
    loyaltyLevel: "Status",
    loyaltyGold: "Gold",
    loyaltySilver: "Silver",
    loyaltyPlatinum: "Platinum",
    viewAllOrders: "History",
    customerProfile: "Client File",
    totalSpend: "Revenue",
    askAI: "Consult AI"
  },
  ar: {
    dashboard: "العمليات",
    login: "دخول",
    pinEntry: "الرمز",
    securePortal: "إدارة بوتيك زهرة السوسن",
    welcome: "مرحباً بك",
    newOrder: "حجز جديد",
    totalOrders: "حجم الطلبات",
    activeProcessing: "قيد التنفيذ",
    totalValue: "الإيرادات",
    recentOrders: "أحدث السجلات",
    identity: "العميل",
    financials: "الدفع",
    lifecycle: "المرحلة",
    actions: "إدارة",
    noOrders: "لا يوجد سجلات.",
    searchPlaceholder: "بحث عن رقم أو اسم...",
    exitInspection: "إغلاق",
    orderSpecifics: "تفاصيل الحجز",
    payment: "الرصيد",
    communication: "التواصل",
    logistics: "الخدمات اللوجستية",
    manifest: "القطع",
    grandTotal: "الإجمالي",
    operationalLogs: "التسلسل الزمني",
    neuralInsight: "مستشار الذكاء الاصطناعي",
    stateControl: "تحديث الحالة",
    securityProtocol: "الأمن",
    delete: "حذف",
    confirmDelete: "حذف السجل؟",
    newDeployment: "حجز جديد",
    clientName: "اسم العميل",
    phone: "رقم الهاتف",
    address: "الموقع",
    creditStatus: "طريقة الدفع",
    inventory: "الأصناف",
    add: "إضافة",
    launch: "تأكيد",
    currency: "ر.ع.",
    statusNotePlaceholder: "إضافة ملاحظات...",
    updateStatus: "تحديث",
    historyDetails: "السجل",
    timestamp: "الوقت",
    performer: "الموظف",
    shareOrder: "مشاركة",
    linkCopied: "تم النسخ!",
    trackYourOrder: "تتبع الطلب",
    invalidPin: "بيانات خاطئة",
    settings: "الإعدادات",
    paid: "مدفوع",
    unpaid: "معلق",
    itemName: "النوع",
    itemPrice: "السعر",
    linkExpired: "مكتمل",
    linkExpiredMsg: "الوصول مقيد.",
    insufficientPerms: "لا يوجد صلاحية",
    loginId: "المعرف",
    password: "الرمز",
    customers: "العملاء",
    roles: "الموظفين",
    lastSeen: "آخر زيارة",
    ordersCount: "الحجوزات",
    staffCount: "الفريق",
    statsOverview: "الأداء",
    daily: "اليوم",
    weekly: "الأسبوع",
    monthly: "الشهر",
    total: "الإجمالي",
    pending: "معالجة",
    completed: "جاهز",
    received: "تم التسليم",
    filteredTitle: "نتائج البحث",
    backToDashboard: "الرئيسية",
    backToLogin: "البداية",
    close: "إغلاق",
    whatsappShare: "واتساب",
    trackingTitle: "تتبع",
    orderNotFound: "غير موجود",
    currentStatus: "المرحلة",
    manageStaff: "مركز الموظفين",
    roleAdmin: "مدير",
    roleStaff: "موظف",
    roleViewer: "مشاهد",
    permissions: "الصلاحيات",
    viewOnly: "للقراءة فقط",
    fullEdit: "تحكم كامل",
    addStaff: "إضافة موظف",
    yourOtherBookings: "حجوزات أخرى",
    viewBooking: "فتح",
    garment: "القطعة",
    newActivity: "نشاط جديد",
    profile: "الملف الشخصي",
    lifetimeSpent: "إجمالي الإنفاق",
    memberSince: "عضو منذ",
    loyaltyLevel: "الفئة",
    loyaltyGold: "ذهبي",
    loyaltySilver: "فضي",
    loyaltyPlatinum: "بلاتيني",
    viewAllOrders: "السجل",
    customerProfile: "ملف العميل",
    totalSpend: "الإيرادات",
    askAI: "استشارة الذكاء الاصطناعي"
  }
};

type Language = 'en' | 'ar';
type Theme = 'light' | 'dark';

// --- SHARED COMPONENTS ---

// Fix: Implemented ImagePreviewModal component
const ImagePreviewModal: React.FC<{ imageUrl: string; onClose: () => void; lang: Language }> = ({ imageUrl, onClose, lang }) => {
  const t = translations[lang];
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/95 backdrop-blur-sm animate-fade" onClick={onClose}>
      <button onClick={onClose} className="absolute top-6 right-6 text-white text-2xl hover:text-amber-500 transition-soft">
        <i className="fas fa-times"></i>
      </button>
      <img src={imageUrl} className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl animate-zoom" alt="Preview" onClick={(e) => e.stopPropagation()} />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-white font-black text-[10px] uppercase tracking-widest">
        {t.close}
      </div>
    </div>
  );
};

// Fix: Implemented CreateOrderModal component
const CreateOrderModal: React.FC<{ user: User; lang: Language; onClose: () => void }> = ({ user, lang, onClose }) => {
  const t = translations[lang];
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerPin, setCustomerPin] = useState('');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(PaymentStatus.UNPAID);
  
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemImage, setNewItemImage] = useState('');

  useEffect(() => {
    setLoading(true);
    generateOrderId().then(id => {
      setOrderId(id);
      setLoading(false);
    });
  }, []);

  const handleAddItem = () => {
    if (!newItemName || !newItemPrice) return;
    const item: OrderItem = {
      id: Math.random().toString(36).substr(2, 9),
      itemName: newItemName,
      price: parseFloat(newItemPrice),
      quantity: 1,
      imageUrl: newItemImage
    };
    setItems([...items, item]);
    setNewItemName('');
    setNewItemPrice('');
    setNewItemImage('');
  };

  const handleCreate = () => {
    if (!customerName || !customerPhone || !customerPin || items.length === 0) return;
    const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const newOrder: Order = {
      id: orderId,
      customerName,
      customerPhone,
      customerAddress,
      customerPin,
      items,
      totalAmount,
      paymentStatus,
      orderStatus: OrderStatus.CREATED,
      createdAt: new Date().toISOString(),
      history: [{
        status: OrderStatus.CREATED,
        timestamp: new Date().toISOString(),
        updatedBy: user.name,
        note: 'New booking created.'
      }]
    };
    saveOrder(newOrder);
    saveAdminLog({
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      adminName: user.name,
      action: 'CREATED_ORDER',
      details: `Created order ${orderId} for ${customerName}`,
      orderId: orderId
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col animate-zoom" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{t.newDeployment}</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 flex items-center justify-center hover:text-rose-500 transition-soft">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">{t.identity}</h3>
              <div className="space-y-4">
                <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder={t.clientName} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500/20 text-sm font-bold" />
                <input type="text" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder={t.phone} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500/20 text-sm font-bold" />
                <input type="password" value={customerPin} onChange={e => setCustomerPin(e.target.value)} placeholder={t.pinEntry} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500/20 text-sm font-bold" />
              </div>
            </div>
            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">{t.inventory}</h3>
              <div className="flex flex-col gap-3">
                 <input type="text" value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder={t.itemName} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-sm font-bold" />
                 <div className="flex gap-2">
                   <input type="number" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} placeholder={t.itemPrice} className="flex-1 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-sm font-bold" />
                   <button onClick={handleAddItem} className="bg-amber-600 text-black px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest">{t.add}</button>
                 </div>
                 <input type="text" value={newItemImage} onChange={e => setNewItemImage(e.target.value)} placeholder="Image URL (Optional)" className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-sm font-bold" />
              </div>
              <div className="space-y-2">
                {items.map(it => (
                  <div key={it.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold">
                    <span>{it.itemName}</span>
                    <span className="text-amber-600">{it.price.toFixed(2)} {t.currency}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="p-8 border-t border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex justify-between items-center">
           <div className="flex flex-col">
             <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">ID: {loading ? 'Generating...' : orderId}</span>
             <div className="flex gap-4">
               <button onClick={() => setPaymentStatus(PaymentStatus.PAID)} className={`text-[8px] font-black uppercase tracking-widest ${paymentStatus === PaymentStatus.PAID ? 'text-emerald-500' : 'text-slate-400'}`}>{t.paid}</button>
               <button onClick={() => setPaymentStatus(PaymentStatus.UNPAID)} className={`text-[8px] font-black uppercase tracking-widest ${paymentStatus === PaymentStatus.UNPAID ? 'text-rose-500' : 'text-slate-400'}`}>{t.unpaid}</button>
             </div>
           </div>
           <button onClick={handleCreate} disabled={loading || !customerName || items.length === 0} className="bg-slate-900 dark:bg-amber-600 text-white dark:text-black px-10 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl hover:scale-105 transition-soft disabled:opacity-50">
             {t.launch}
           </button>
        </div>
      </div>
    </div>
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
  
  if (orders.length === 0) {
    return <div className="py-24 text-center font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest text-sm">{t.noOrders}</div>;
  }

  return (
    <div className="w-full">
      <div className="hidden md:block overflow-x-auto custom-scrollbar">
        <table className="w-full text-left">
          <thead className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="px-8 py-6">{t.garment}</th>
              {!hideCustomerName && <th className="px-8 py-6">{t.identity}</th>}
              <th className="px-8 py-6">{t.financials}</th>
              <th className="px-8 py-6">{t.lifecycle}</th>
              <th className="px-8 py-6"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-900">
            {orders.map(order => {
              const firstImg = order.items.find(it => it.imageUrl)?.imageUrl;
              return (
                <tr key={order.id} className="group hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer transition-soft" onClick={() => onNavigate(order.id)}>
                  <td className="px-8 py-6">
                    <div 
                      onClick={(e) => { e.stopPropagation(); firstImg && onPreview(firstImg); }}
                      className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-700 hover:scale-105 transition-soft shadow-sm"
                    >
                      {firstImg ? <img src={firstImg} className="w-full h-full object-cover" alt="" /> : <i className="fas fa-spa text-slate-300 dark:text-slate-600"></i>}
                    </div>
                  </td>
                  {!hideCustomerName && (
                    <td className="px-8 py-6">
                      <div className="font-black text-slate-900 dark:text-white tracking-tight">{order.customerName}</div>
                      <div className="text-[10px] text-amber-600 font-bold">{order.id}</div>
                    </td>
                  )}
                  <td className="px-8 py-6">
                    <div className="font-black text-slate-900 dark:text-white">{order.totalAmount.toFixed(2)} {t.currency}</div>
                    <span className={`text-[8px] font-black uppercase ${order.paymentStatus === PaymentStatus.PAID ? 'text-emerald-500' : 'text-rose-500'}`}>{order.paymentStatus}</span>
                  </td>
                  <td className="px-8 py-6"><StatusBadge status={order.orderStatus} /></td>
                  <td className="px-8 py-6 text-right">
                    <i className="fas fa-chevron-right text-slate-200 group-hover:text-amber-500 group-hover:translate-x-1 transition-soft"></i>
                  </td>
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
             <div key={order.id} className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 flex items-center gap-5 active:scale-95 transition-soft" onClick={() => onNavigate(order.id)}>
                <div className="w-16 h-16 shrink-0 bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center">
                   {firstImg ? <img src={firstImg} className="w-full h-full object-cover" alt="" /> : <i className="fas fa-spa text-slate-300"></i>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <span className="text-amber-600 font-black text-[10px] tracking-widest">{order.id}</span>
                    <span className="text-slate-900 dark:text-white font-black text-xs">{order.totalAmount.toFixed(2)} {t.currency}</span>
                  </div>
                  {!hideCustomerName && <div className="text-slate-900 dark:text-white font-black text-sm truncate mb-2">{order.customerName}</div>}
                  <div className="flex justify-between items-center mt-2">
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

const Navigation: React.FC<{ user: User; onLogout: () => void; lang: Language; setLang: (l: Language) => void; theme: Theme; setTheme: (t: Theme) => void }> = ({ user, onLogout, lang, setLang, theme, setTheme }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const t = translations[lang];

  return (
    <nav className="bg-white/90 dark:bg-black/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 h-20 md:h-24 flex items-center shadow-sm transition-all duration-500">
      <div className="max-w-7xl mx-auto px-4 md:px-6 w-full flex items-center justify-between">
        <div className="flex items-center gap-4 md:gap-10">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-amber-600 to-yellow-400 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-6 transition-soft">
              <i className="fas fa-spa text-black text-sm md:text-xl"></i>
            </div>
            <span className="font-black text-slate-900 dark:text-white tracking-tighter text-lg md:text-2xl hidden sm:block">Zahratalsawsen<span className="text-amber-600">Boutique</span></span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Link to="/" className={`px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-soft ${location.pathname === '/' ? 'bg-amber-50 dark:bg-amber-900/40 text-amber-600 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>{t.dashboard}</Link>
            {(user.role === 'admin' || user.role === 'staff' || user.role === 'viewer') && (
              <Link to="/customers" className={`px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-soft ${location.pathname === '/customers' ? 'bg-amber-50 dark:bg-amber-900/40 text-amber-600 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>{t.customers}</Link>
            )}
            {user.role === 'admin' && (
              <Link to="/settings" className={`px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-soft ${location.pathname === '/settings' ? 'bg-amber-50 dark:bg-amber-900/40 text-amber-600 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>{t.settings}</Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-1">
             <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-amber-600 hover:text-black transition-soft text-[8px] font-black uppercase tracking-tighter">{lang === 'en' ? 'AR' : 'EN'}</button>
             <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-amber-600 hover:text-black transition-soft">
               <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'} text-xs`}></i>
             </button>
          </div>
          <div className="h-6 md:h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
          <div className="flex items-center gap-2 md:gap-3 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-sm font-black text-slate-900 dark:text-white leading-none mb-1 group-hover:text-amber-600 transition-colors">{user.name}</span>
              <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/20 rounded-md">{user.role}</span>
            </div>
            <button onClick={(e) => { e.stopPropagation(); onLogout(); }} className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-soft flex items-center justify-center shadow-sm active:scale-90"><i className="fas fa-power-off text-sm"></i></button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const StatCard: React.FC<{ label: string; value: string | number; subValue?: string; icon: string; color: string; to?: string; showBadge?: boolean; badgeLabel?: string }> = ({ label, value, subValue, icon, color, to, showBadge, badgeLabel }) => {
  const navigate = useNavigate();
  return (
    <div 
      onClick={() => to && navigate(to)}
      className={`bg-white dark:bg-slate-900/60 p-4 md:p-6 rounded-3xl border shadow-sm transition-all duration-700 card-hover group relative overflow-hidden ${to ? 'cursor-pointer' : ''} ${showBadge ? 'border-amber-500/50 ring-4 ring-amber-500/5' : 'border-slate-100 dark:border-slate-800'}`}
    >
      <div className={`absolute -right-4 -bottom-4 text-5xl md:text-6xl opacity-[0.04] dark:opacity-[0.1] group-hover:scale-125 group-hover:rotate-12 transition-soft ${color}`}>
        <i className={`fas ${icon}`}></i>
      </div>
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-center justify-between mb-2 md:mb-4">
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</span>
          <div className="relative shrink-0">
            <div className={`w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center bg-amber-50 dark:bg-amber-900/20 text-amber-600 shadow-sm group-hover:scale-110 transition-soft`}>
              <i className={`fas ${icon} text-[10px] md:text-xs`}></i>
            </div>
            {showBadge && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 border-2 border-white dark:border-slate-900"></span>
              </span>
            )}
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-2 flex-wrap">
            <h4 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-1 truncate">{value}</h4>
            {showBadge && badgeLabel && (
              <span className="text-[7px] font-black text-white bg-amber-600 px-2 py-0.5 rounded-full shadow-lg animate-bounce uppercase shrink-0">
                {badgeLabel}
              </span>
            )}
          </div>
          {subValue && <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">
             {subValue}
          </p>}
        </div>
      </div>
    </div>
  );
};

// --- PAGES ---

// Fix: Implemented TrackingPage component
const TrackingPage: React.FC<{ lang: Language }> = ({ lang }) => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | undefined>(undefined);
  const t = translations[lang];

  useEffect(() => {
    if (id) setOrder(getOrderById(id));
  }, [id]);

  if (!order) return <div className="p-20 text-center font-black text-slate-400">{t.orderNotFound}</div>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl space-y-10">
        <div className="text-center">
           <div className="w-20 h-20 bg-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
             <i className="fas fa-search text-black text-3xl"></i>
           </div>
           <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-2 italic">{t.trackingTitle}</h2>
           <span className="text-amber-600 font-black tracking-widest text-xs uppercase">{order.id}</span>
        </div>
        
        <div className="flex flex-col items-center gap-6">
           <StatusBadge status={order.orderStatus} />
           <p className="text-center text-slate-500 dark:text-slate-400 text-sm font-bold leading-relaxed">{t.orderSpecifics}: {order.customerName}</p>
        </div>

        <div className="space-y-6 pt-10 border-t border-slate-50 dark:border-slate-800">
           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6">{t.operationalLogs}</h3>
           {order.history.map((entry, idx) => (
             <div key={idx} className="flex gap-6 relative group">
                {idx !== order.history.length - 1 && <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-slate-100 dark:bg-slate-800"></div>}
                <div className={`w-6 h-6 rounded-full border-4 border-white dark:border-slate-900 shrink-0 relative z-10 ${idx === 0 ? 'bg-amber-600 shadow-lg' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                <div>
                   <div className="text-xs font-black text-slate-900 dark:text-white mb-1 uppercase tracking-wider">{entry.status}</div>
                   <div className="text-[10px] text-slate-400 font-bold mb-2">{new Date(entry.timestamp).toLocaleString()}</div>
                   {entry.note && <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl italic">{entry.note}</p>}
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

// Fix: Implemented CustomerListPage component
const CustomerListPage: React.FC<{ user: User; lang: Language }> = ({ user, lang }) => {
  const navigate = useNavigate();
  const t = translations[lang];
  const customers = useMemo(() => getUniqueCustomers(), []);
  const [search, setSearch] = useState('');

  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 animate-fade" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-2 italic">{t.customers}</h2>
          <div className="flex items-center gap-3 text-slate-400 font-bold uppercase text-[9px] tracking-[0.4em]">
            <div className="w-8 h-1 bg-amber-600 rounded-full"></div> <span>{t.manageStaff}</span>
          </div>
        </div>
        <div className="relative w-80 group">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors"></i>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t.searchPlaceholder} className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none font-bold text-xs shadow-sm" />
        </div>
      </header>

      <div className="bg-white dark:bg-slate-900/60 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] border-b border-slate-50 dark:border-slate-800">
            <tr>
              <th className="px-8 py-6">{t.identity}</th>
              <th className="px-8 py-6">{t.ordersCount}</th>
              <th className="px-8 py-6">{t.lastSeen}</th>
              <th className="px-8 py-6"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-900">
            {filtered.map((c, idx) => (
              <tr key={idx} className="group hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-soft" onClick={() => navigate(`/customer/${c.phone}`)}>
                <td className="px-8 py-6">
                  <div className="font-black text-slate-900 dark:text-white">{c.name}</div>
                  <div className="text-[10px] text-slate-400 font-bold">{c.phone}</div>
                </td>
                <td className="px-8 py-6"><span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-full text-[10px] font-black">{c.orderCount}</span></td>
                <td className="px-8 py-6 text-slate-400 text-xs font-bold">{new Date(c.lastOrder).toLocaleDateString()}</td>
                <td className="px-8 py-6 text-right"><i className="fas fa-chevron-right text-slate-200 group-hover:text-amber-600 transition-soft"></i></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Fix: Implemented SettingsPage component
const SettingsPage: React.FC<{ user: User; lang: Language }> = ({ user, lang }) => {
  const t = translations[lang];
  const [users, setUsersList] = useState<User[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', username: '', pin: '', role: 'staff' as any });

  useEffect(() => { setUsersList(getUsers()); }, []);

  const handleAddStaff = () => {
    if (!newStaff.name || !newStaff.username || !newStaff.pin) return;
    const u: User = { id: Math.random().toString(36).substr(2, 9), ...newStaff, createdAt: new Date().toISOString() };
    if (saveUser(u)) {
      setUsersList(getUsers());
      setShowAdd(false);
      setNewStaff({ name: '', username: '', pin: '', role: 'staff' });
    }
  };

  const handleDeleteStaff = (id: string) => {
    if (window.confirm(t.confirmDelete)) {
      if (deleteUser(id)) setUsersList(getUsers());
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 animate-fade" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-2 italic">{t.manageStaff}</h2>
          <div className="flex items-center gap-3 text-slate-400 font-bold uppercase text-[9px] tracking-[0.4em]">
            <div className="w-8 h-1 bg-amber-600 rounded-full"></div> <span>{t.securityProtocol}</span>
          </div>
        </div>
        <button onClick={() => setShowAdd(true)} className="bg-slate-900 dark:bg-amber-600 text-white dark:text-black px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl transition-soft flex items-center gap-2">
           <i className="fas fa-plus"></i> {t.addStaff}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {users.map(u => (
          <div key={u.id} className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm relative group">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-amber-600 font-black text-lg">{u.name[0]}</div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white">{u.name}</h3>
                <span className="text-[8px] font-black uppercase tracking-widest text-amber-600">{u.role}</span>
              </div>
            </div>
            <div className="space-y-2 mb-8">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-slate-400">ID:</span>
                <span className="text-slate-900 dark:text-white">{u.username}</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-slate-400">PIN:</span>
                <span className="text-slate-900 dark:text-white">{u.pin}</span>
              </div>
            </div>
            {u.id !== user.id && (
               <button onClick={() => handleDeleteStaff(u.id)} className="w-full py-3 bg-rose-50 text-rose-500 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-soft">
                 {t.delete}
               </button>
            )}
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
           <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[2.5rem] w-full max-w-lg space-y-6">
              <h2 className="text-2xl font-black tracking-tighter">{t.addStaff}</h2>
              <div className="space-y-4">
                <input type="text" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} placeholder="Full Name" className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl outline-none font-bold text-sm" />
                <input type="text" value={newStaff.username} onChange={e => setNewStaff({...newStaff, username: e.target.value})} placeholder="Username" className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl outline-none font-bold text-sm" />
                <input type="text" value={newStaff.pin} onChange={e => setNewStaff({...newStaff, pin: e.target.value})} placeholder="PIN" className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl outline-none font-bold text-sm" />
                <select value={newStaff.role} onChange={e => setNewStaff({...newStaff, role: e.target.value as any})} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl outline-none font-bold text-sm">
                   <option value="staff">Staff</option>
                   <option value="admin">Admin</option>
                   <option value="viewer">Viewer</option>
                </select>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setShowAdd(false)} className="flex-1 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl font-black text-[10px] uppercase tracking-widest">{t.close}</button>
                <button onClick={handleAddStaff} className="flex-1 py-4 bg-amber-600 text-black rounded-2xl font-black text-[10px] uppercase tracking-widest">{t.add}</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

// Fix: Implemented FilteredOrdersPage component
const FilteredOrdersPage: React.FC<{ user: User; lang: Language }> = ({ user, lang }) => {
  const { type, value } = useParams<{ type: string, value: string }>();
  const navigate = useNavigate();
  const t = translations[lang];
  const [orders, setOrders] = useState<Order[]>([]);
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  useEffect(() => {
    let all = getOrders();
    if (type === 'status') {
      if (value === 'pending') {
        all = all.filter(o => o.orderStatus !== OrderStatus.COMPLETED && o.orderStatus !== OrderStatus.CUSTOMER_RECEIVED);
      } else {
        all = all.filter(o => o.orderStatus === value);
      }
    }
    setOrders(all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, [type, value]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 animate-fade" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
       <header className="mb-12">
          <button onClick={() => navigate(-1)} className="mb-6 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl font-black text-[9px] uppercase tracking-widest text-slate-400 hover:text-amber-600 transition-soft flex items-center gap-2">
            <i className={`fas ${lang === 'ar' ? 'fa-arrow-right' : 'fa-arrow-left'}`}></i> {t.backToDashboard}
          </button>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-2 italic">{t.filteredTitle}</h2>
          <div className="flex items-center gap-3 text-slate-400 font-bold uppercase text-[9px] tracking-[0.4em]">
            <div className="w-8 h-1 bg-amber-600 rounded-full"></div> <span>{value}</span>
          </div>
       </header>

       <div className="bg-white dark:bg-slate-900/60 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
         <ResponsiveOrderList orders={orders} lang={lang} onPreview={setPreviewImg} onNavigate={id => navigate(`/order/${id}`)} />
       </div>
       {previewImg && <ImagePreviewModal imageUrl={previewImg} onClose={() => setPreviewImg(null)} lang={lang} />}
    </div>
  );
};

const CustomerProfilePage: React.FC<{ user: User; lang: Language }> = ({ user, lang }) => {
  const { phone } = useParams<{ phone: string }>();
  const navigate = useNavigate();
  const t = translations[lang];
  const [orders, setOrders] = useState<Order[]>([]);
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  useEffect(() => {
    if (phone) {
      const allOrders = getOrders();
      const filtered = allOrders.filter(o => o.customerPhone === phone);
      setOrders(filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    }
  }, [phone]);

  const stats = useMemo(() => {
    const totalSpent = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const count = orders.length;
    const since = count > 0 ? new Date(orders[orders.length - 1].createdAt).toLocaleDateString() : 'N/A';
    
    let level = t.loyaltySilver;
    if (totalSpent > 1000) level = t.loyaltyPlatinum;
    else if (totalSpent > 500) level = t.loyaltyGold;

    return { totalSpent, count, since, level };
  }, [orders, t]);

  if (orders.length === 0) return <div className="p-10 text-center font-black text-slate-400 uppercase tracking-widest">{t.orderNotFound}</div>;

  const clientName = orders[0].customerName;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12 animate-fade" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="mb-8 md:mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 animate-entry">
        <div>
          <button onClick={() => navigate(-1)} className="mb-4 md:mb-6 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl font-black text-[9px] uppercase tracking-widest text-slate-400 hover:text-amber-600 transition-soft flex items-center gap-2">
            <i className={`fas ${lang === 'ar' ? 'fa-arrow-right' : 'fa-arrow-left'}`}></i> {t.backToDashboard}
          </button>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">{clientName}</h2>
          <div className="flex items-center gap-3 text-slate-400 font-bold uppercase text-[9px] tracking-[0.4em]">
            <div className="w-8 h-1 bg-amber-600 rounded-full"></div> <span>{t.customerProfile}</span>
          </div>
        </div>
        <div className="w-full md:w-auto p-6 md:p-8 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-amber-600 dark:to-yellow-500 rounded-3xl shadow-2xl relative overflow-hidden group">
          <i className="fas fa-spa absolute -right-4 -bottom-4 text-7xl opacity-10 text-white dark:text-black transition-soft"></i>
          <div className="relative z-10">
             <span className="text-[8px] font-black text-white/50 dark:text-black/50 uppercase tracking-[0.4em] mb-1 block">{t.loyaltyLevel}</span>
             <h3 className="text-xl md:text-2xl font-black text-white dark:text-black tracking-tighter">{stats.level}</h3>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 mb-12 animate-entry stagger-1">
        <StatCard label={t.totalSpend} value={`${stats.totalSpent.toFixed(2)} ${t.currency}`} icon="fa-coins" color="text-amber-600" />
        <StatCard label={t.ordersCount} value={stats.count} icon="fa-shopping-bag" color="text-amber-600" />
        <StatCard label={t.memberSince} value={stats.since} icon="fa-calendar-day" color="text-amber-600" />
      </div>

      <div className="bg-white dark:bg-slate-900/60 rounded-3xl md:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden animate-entry stagger-2">
        <div className="p-6 md:p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">{t.viewAllOrders}</h3>
        </div>
        <ResponsiveOrderList 
          orders={orders} 
          lang={lang} 
          onPreview={setPreviewImg} 
          onNavigate={(id) => navigate(`/order/${id}`)}
          hideCustomerName 
        />
      </div>
      {previewImg && <ImagePreviewModal imageUrl={previewImg} onClose={() => setPreviewImg(null)} lang={lang} />}
    </div>
  );
};

const OrderDetailsPage: React.FC<{ user: User; lang: Language }> = ({ user, lang }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const t = translations[lang];
  const [order, setOrder] = useState<Order | undefined>(undefined);
  const [advice, setAdvice] = useState<string>('');
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [note, setNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) {
      const o = getOrderById(id);
      setOrder(o);
      if (o) refreshAdvice(o.orderStatus);
    }
  }, [id]);

  const refreshAdvice = (status: string) => {
    setLoadingAdvice(true);
    getStatusAdvice(status).then(res => setAdvice(res || '')).finally(() => setLoadingAdvice(false));
  };

  const handleUpdateStatus = async (next: OrderStatus) => {
    if (!order) return;
    setUpdating(true);
    const updated: Order = {
      ...order,
      orderStatus: next,
      history: [
        {
          status: next,
          timestamp: new Date().toISOString(),
          updatedBy: user.name,
          note: note || `Transitioned to ${next} phase.`
        },
        ...order.history
      ]
    };
    saveOrder(updated);
    setOrder(updated);
    setNote('');
    setUpdating(false);
    refreshAdvice(next);
  };

  const handleShare = () => {
    const trackingUrl = `${window.location.origin}${window.location.pathname}#/track/${order?.id}`;
    navigator.clipboard.writeText(trackingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!order) return <div className="p-10 text-center font-black text-slate-400 uppercase tracking-widest">{t.noOrders}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12 animate-fade" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="mb-8 md:mb-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
          <button onClick={() => navigate(-1)} className="px-5 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-[9px] uppercase tracking-widest text-slate-400 hover:text-amber-600 transition-soft shadow-sm">
             {t.backToDashboard}
          </button>
          <button onClick={handleShare} className={`px-5 py-3 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-soft border flex items-center gap-3 ${copied ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800'}`}>
            <i className={`fas ${copied ? 'fa-check' : 'fa-link'}`}></i> {copied ? t.linkCopied : t.shareOrder}
          </button>
        </div>
        <StatusBadge status={order.orderStatus} />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
        <div className="lg:col-span-2 space-y-6 md:space-y-10">
          <section className="bg-slate-900 dark:bg-amber-600 p-6 md:p-10 rounded-3xl shadow-2xl animate-entry relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 text-8xl text-white dark:text-black hidden md:block"><i className="fas fa-brain"></i></div>
            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 md:gap-8 text-center sm:text-left">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-amber-600 dark:bg-black rounded-2xl flex items-center justify-center shrink-0 shadow-xl">
                <i className="fas fa-robot text-white dark:text-amber-500 text-2xl md:text-3xl"></i>
              </div>
              <div className="flex-1">
                 <h3 className="text-[9px] font-black text-amber-400 dark:text-black/60 uppercase tracking-[0.4em] mb-2">{t.neuralInsight}</h3>
                 <div className="min-h-[50px] flex items-center justify-center sm:justify-start">
                   {loadingAdvice ? <i className="fas fa-circle-notch fa-spin text-white dark:text-black"></i> : (
                      <p className="text-white dark:text-black text-lg md:text-xl font-black italic leading-tight tracking-tight">"{advice || 'Consulting database...'}"</p>
                   )}
                 </div>
              </div>
              <button onClick={() => refreshAdvice(order.orderStatus)} disabled={loadingAdvice} className="bg-white/10 dark:bg-black/10 text-white dark:text-black px-6 py-3 rounded-xl font-black uppercase text-[8px] tracking-widest transition-soft border border-white/5 flex items-center gap-2">
                <i className={`fas fa-sync ${loadingAdvice ? 'fa-spin' : ''}`}></i> {t.askAI}
              </button>
            </div>
          </section>

          <section className="bg-white dark:bg-slate-900/60 p-6 md:p-10 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm animate-entry stagger-1 transition-colors">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8">{t.manifest}</h3>
            <div className="space-y-4 md:space-y-6">
              {order.items.map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 md:p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 transition-soft">
                  <div className="flex items-center gap-4 md:gap-6">
                    <div onClick={() => item.imageUrl && setPreviewImg(item.imageUrl)} className="w-14 h-14 md:w-16 md:h-16 bg-white dark:bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-slate-100 dark:border-slate-800 shadow-sm cursor-zoom-in">
                      {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" alt="" /> : <i className="fas fa-spa text-slate-200"></i>}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white text-base md:text-xl tracking-tighter truncate max-w-[120px] md:max-w-none">{item.itemName}</h4>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-black text-amber-600 text-sm md:text-lg shrink-0">{item.price.toFixed(2)} {t.currency}</span>
                </div>
              ))}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <span className="font-black text-slate-900 dark:text-white text-xl md:text-2xl tracking-tighter">{t.grandTotal}</span>
                <span className="font-black text-amber-600 text-2xl md:text-3xl tracking-tighter">{order.totalAmount.toFixed(2)} {t.currency}</span>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6 md:space-y-10">
          <section className="bg-white dark:bg-slate-900/60 p-6 md:p-10 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm animate-entry transition-colors">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6 md:mb-8">{t.stateControl}</h3>
            <div className="grid grid-cols-1 gap-2.5 mb-6">
              {Object.values(OrderStatus).map(status => (
                <button 
                  key={status}
                  disabled={order.orderStatus === status || updating}
                  onClick={() => handleUpdateStatus(status)}
                  className={`py-3.5 rounded-2xl font-black uppercase text-[8px] md:text-[9px] tracking-widest transition-soft border ${order.orderStatus === status ? 'bg-amber-600 text-white border-amber-600 opacity-50' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-transparent'}`}
                >
                  {status}
                </button>
              ))}
            </div>
            <textarea 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 text-slate-900 dark:text-white text-xs outline-none focus:border-amber-500 h-24 resize-none transition-colors"
              placeholder={t.statusNotePlaceholder}
            />
          </section>

          <section className="bg-white dark:bg-slate-900/60 p-6 md:p-10 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm animate-entry transition-colors">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8">{t.orderSpecifics}</h3>
            <div className="space-y-6">
              <div>
                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest block mb-1">{t.identity}</span>
                <span className="font-black text-slate-900 dark:text-white text-lg tracking-tight hover:text-amber-600 cursor-pointer" onClick={() => navigate(`/customer/${order.customerPhone}`)}>{order.customerName}</span>
              </div>
              <div className="pt-6 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{t.payment}</span>
                <span className={`px-4 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-widest ${order.paymentStatus === PaymentStatus.PAID ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{order.paymentStatus}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
      {previewImg && <ImagePreviewModal imageUrl={previewImg} onClose={() => setPreviewImg(null)} lang={lang} />}
    </div>
  );
};

const Dashboard: React.FC<{ user: User; lang: Language }> = ({ user, lang }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [hasNewOrder, setHasNewOrder] = useState(false);
  const prevOrderCountRef = useRef<number>(0);
  const t = translations[lang];

  useEffect(() => {
    const fetchOrders = () => {
      let all = (user.role === 'admin' || user.role === 'staff' || user.role === 'viewer') ? getOrders() : getOrdersByPhoneAndPin(user.username, user.pin);
      const sorted = all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      if (prevOrderCountRef.current > 0 && sorted.length > prevOrderCountRef.current) setHasNewOrder(true);
      prevOrderCountRef.current = sorted.length;
      setOrders(sorted);
    };
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (hasNewOrder) {
      const timer = setTimeout(() => setHasNewOrder(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [hasNewOrder]);

  const stats = useMemo(() => {
    const revenue = orders.reduce((acc, o) => acc + o.totalAmount, 0);
    const pending = orders.filter(o => o.orderStatus !== OrderStatus.COMPLETED && o.orderStatus !== OrderStatus.CUSTOMER_RECEIVED).length;
    const completed = orders.filter(o => o.orderStatus === OrderStatus.COMPLETED).length;
    let level = t.loyaltySilver;
    if (revenue > 1000) level = t.loyaltyPlatinum;
    else if (revenue > 500) level = t.loyaltyGold;
    return { revenue, pending, completed, total: orders.length, level };
  }, [orders, t]);

  const filteredOrders = orders.filter(o => o.id.toLowerCase().includes(search.toLowerCase()) || o.customerName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12 animate-fade" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="mb-8 md:mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-8 animate-entry">
        <div className="flex-1">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-2 italic">{t.welcome}, {user.name.split(' ')[0]}</h2>
          <div className="flex items-center gap-3 text-slate-400 font-bold uppercase text-[9px] tracking-[0.4em]">
            <div className="w-8 h-1 bg-amber-600 rounded-full"></div> <span>{user.role === 'customer' ? t.profile : t.dashboard}</span>
          </div>
        </div>
        <div className="flex w-full md:w-auto gap-3 items-center">
          {user.role === 'customer' && (
            <div className="flex-1 md:flex-none flex items-center gap-4 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl shadow-sm transition-colors">
               <i className="fas fa-gem text-amber-600 text-xl"></i>
               <div>
                 <span className="text-[7px] font-black text-amber-600 uppercase block">{t.loyaltyLevel}</span>
                 <span className="text-sm font-black text-slate-900 dark:text-white">{stats.level}</span>
               </div>
            </div>
          )}
          {(user.role === 'admin' || user.role === 'staff') && (
            <button onClick={() => setShowCreate(true)} className="flex-1 md:flex-none bg-slate-900 dark:bg-amber-600 text-white dark:text-black px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs hover:bg-amber-600 transition-soft shadow-xl active:scale-95 flex items-center justify-center gap-3">
              <i className="fas fa-plus"></i> {t.newOrder}
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8 mb-10 md:mb-16 animate-entry stagger-1">
        <StatCard to="/filtered/range/total" label={t.totalOrders} value={stats.total} icon="fa-scroll" color="text-slate-900 dark:text-amber-500" showBadge={hasNewOrder} badgeLabel={t.newActivity} />
        <StatCard to="/filtered/status/pending" label={t.activeProcessing} value={stats.pending} icon="fa-spa" color="text-amber-600" />
        <StatCard to="/filtered/status/Completed" label={t.completed} value={stats.completed} icon="fa-circle-check" color="text-emerald-600" />
        <StatCard label={t.totalValue} value={`${stats.revenue.toFixed(2)} ${t.currency}`} icon="fa-vault" color="text-amber-600" />
      </div>

      <div className="bg-white dark:bg-slate-900/60 rounded-3xl md:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden animate-entry stagger-2 transition-colors">
        <div className="p-5 md:p-8 border-b border-slate-50 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] self-start">{t.recentOrders}</h3>
          <div className="relative w-full sm:w-80 md:w-96 group">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-amber-500 transition-colors"></i>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.searchPlaceholder} className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none font-bold text-xs focus:ring-2 focus:ring-amber-500/20 dark:text-white" />
          </div>
        </div>
        <ResponsiveOrderList orders={filteredOrders} lang={lang} onPreview={setPreviewImg} onNavigate={(id) => navigate(`/order/${id}`)} />
      </div>
      {showCreate && <CreateOrderModal user={user} lang={lang} onClose={() => setShowCreate(false)} />}
      {previewImg && <ImagePreviewModal imageUrl={previewImg} onClose={() => setPreviewImg(null)} lang={lang} />}
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
    setTilt({ x: ((clientX - left) / width - 0.5) * 15, y: ((clientY - top) / height - 0.5) * -15 });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-black relative overflow-hidden perspective-1000" onMouseMove={handleMouseMove} onMouseLeave={() => setTilt({ x: 0, y: 0 })} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="absolute top-[-15%] left-[-15%] w-[60%] h-[60%] bg-amber-600/10 rounded-full blur-[100px] pointer-events-none" style={{ transform: `translate(${tilt.x * 2}px, ${tilt.y * 2}px)` }}></div>
      <div className="bg-white/[0.03] backdrop-blur-[30px] p-8 md:p-14 rounded-[3rem] border border-white/5 shadow-2xl w-full max-w-md transition-transform duration-200 ease-out preserve-3d" style={{ transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)` }}>
        <div className="text-center mb-10 translate-z-10">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-600 to-yellow-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl animate-float">
            <i className="fas fa-spa text-black text-3xl"></i>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter mb-2 italic">Zahratalsawsen</h1>
          <p className="text-amber-500 font-black uppercase tracking-[0.4em] text-[8px] md:text-[10px]">{t.securePortal}</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6 translate-z-20">
          <div className="space-y-4">
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder={t.loginId} className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 text-white outline-none focus:bg-white/10 transition-soft font-bold placeholder:text-white/20" required />
            <input type="password" value={pin} onChange={e => setPin(e.target.value)} placeholder={t.password} className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/5 text-white text-center text-xl tracking-[0.4em] outline-none focus:bg-white/10 transition-soft placeholder:text-white/20" required />
          </div>
          {error && <div className="text-rose-400 text-[10px] text-center font-black uppercase tracking-widest">{error}</div>}
          <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-black font-black py-4 md:py-5 rounded-2xl shadow-xl transition-soft active:scale-95 text-sm md:text-base uppercase tracking-widest">
            Authorize Access
          </button>
        </form>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('zs_session_user');
    return saved ? JSON.parse(saved) : null;
  });
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

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme === 'dark' ? 'dark bg-black text-white' : 'bg-slate-50 text-slate-900'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {user && <Navigation user={user} onLogout={handleLogout} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} />}
      <Routes>
        <Route path="/track/:id" element={<TrackingPage lang={lang} />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage onLogin={handleLogin} lang={lang} setLang={setLang} theme={theme} />} />
        <Route path="/" element={user ? <Dashboard user={user} lang={lang} /> : <Navigate to="/login" />} />
        <Route path="/customers" element={user && user.role !== 'customer' ? <CustomerListPage user={user} lang={lang} /> : <Navigate to="/login" />} />
        <Route path="/customer/:phone" element={user && user.role !== 'customer' ? <CustomerProfilePage user={user} lang={lang} /> : <Navigate to="/login" />} />
        <Route path="/settings" element={user && user.role === 'admin' ? <SettingsPage user={user} lang={lang} /> : <Navigate to="/login" />} />
        <Route path="/filtered/:type/:value" element={user ? <FilteredOrdersPage user={user} lang={lang} /> : <Navigate to="/login" />} />
        <Route path="/order/:id" element={user ? <OrderDetailsPage user={user} lang={lang} /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      
      {user && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 z-40 flex items-center justify-around px-4">
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
      )}
    </div>
  );
};

const AppWrapper: React.FC = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;
