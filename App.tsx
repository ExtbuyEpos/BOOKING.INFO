
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { Order, OrderStatus, User, PaymentStatus, OrderItem, OrderHistoryEntry, AdminLogEntry } from './types';
import { getOrders, saveOrder, getOrdersByPin, deleteOrder, getOrderById, getAdminLogs, saveAdminLog, getUsers, saveUser, deleteUser, authenticateUser, isUsernameUnique, getUniqueCustomers, getOrdersByPhoneAndPin } from './store/orderStore';
import { generateOrderId, getStatusAdvice } from './services/geminiService';
import { StatusBadge } from './components/StatusBadge';

// --- TRANSLATIONS ---
const translations = {
  en: {
    dashboard: "Operations Center",
    login: "Authenticate",
    pinEntry: "Access PIN",
    securePortal: "Zahratalsawsen Boutique Management",
    welcome: "Welcome back",
    newOrder: "New Booking Order",
    totalOrders: "Dress Volume",
    activeProcessing: "In Preparation",
    totalValue: "Boutique Revenue",
    recentOrders: "Garment Records",
    identity: "Client",
    financials: "Payment",
    lifecycle: "Phase",
    actions: "Manage",
    noOrders: "No active garments in queue.",
    searchPlaceholder: "Search ID or Client Name...",
    exitInspection: "Close File",
    orderSpecifics: "Booking Details",
    payment: "Balance Status",
    communication: "WhatsApp / Contact",
    logistics: "Pick-up / Delivery",
    manifest: "Garments & Details",
    grandTotal: "Total Billing",
    operationalLogs: "Booking Timeline",
    neuralInsight: "Boutique AI Advisor",
    stateControl: "Update Progress",
    securityProtocol: "Boutique Security",
    delete: "Remove",
    confirmDelete: "Wipe this booking record from history?",
    newDeployment: "Create New Booking",
    clientName: "Client Full Name",
    phone: "Contact Number",
    address: "Delivery Location",
    creditStatus: "Initial Deposit Status",
    inventory: "Dress Items & Media",
    add: "Add Garment",
    launch: "Finalize Booking",
    currency: "OMR",
    statusNotePlaceholder: "Add notes (e.g. Dress ready for fitting, Stitching complete)...",
    updateStatus: "Apply Phase",
    historyDetails: "Log Entry",
    timestamp: "Time",
    performer: "Manager/Staff",
    shareOrder: "Share Booking",
    linkCopied: "Link Copied!",
    trackYourOrder: "Track Your Order",
    invalidPin: "Incorrect ID/PIN. Try again.",
    settings: "Settings",
    paid: "Fully Paid",
    unpaid: "Deposit Pending",
    itemName: "Garment Type",
    itemPrice: "Work Price",
    linkExpired: "Booking Finalized",
    linkExpiredMsg: "This garment order is completed and collected. Access is now restricted.",
    insufficientPerms: "Admin Clearance Required",
    loginId: "Staff ID",
    password: "Password / PIN",
    customers: "Client Database",
    roles: "Staff Control",
    lastSeen: "Last Order",
    ordersCount: "Total Outfits",
    staffCount: "Staff Members",
    statsOverview: "Studio Performance",
    daily: "Today",
    weekly: "This Week",
    monthly: "This Month",
    total: "Total Revenue",
    pending: "Processing",
    completed: "Ready",
    received: "Delivered",
    filteredTitle: "Segment Analysis",
    backToDashboard: "Return to Hub",
    backToLogin: "Home Screen",
    close: "Close",
    whatsappShare: "Share via WhatsApp",
    trackingTitle: "Order Tracking",
    orderNotFound: "Order not found in our studio records.",
    currentStatus: "Current Status",
    manageStaff: "Manage Staff",
    roleAdmin: "Administrator (Full Control)",
    roleStaff: "Staff (Edit Orders)",
    roleViewer: "Viewer (Read-only)",
    permissions: "Permissions",
    viewOnly: "View-only access",
    fullEdit: "Full management access",
    addStaff: "Add Staff Member",
    yourOtherBookings: "Your Other Bookings",
    viewBooking: "View",
    garment: "Garment",
    newActivity: "New Activity",
    profile: "Client Profile",
    lifetimeSpent: "Lifetime Volume",
    memberSince: "Client Since",
    loyaltyLevel: "Boutique Status",
    loyaltyGold: "Gold Member",
    loyaltySilver: "Silver Member",
    loyaltyPlatinum: "Platinum Member",
    viewAllOrders: "All Bookings",
    customerProfile: "Customer Record",
    totalSpend: "Total Investment",
    askAI: "Ask AI for Next Step"
  },
  ar: {
    dashboard: "مركز العمليات",
    login: "المصادقة",
    pinEntry: "الرمز السري",
    securePortal: "إدارة بوتيك Zahratalsawsen",
    welcome: "مرحباً بك",
    newOrder: "طلب حجز جديد",
    totalOrders: "حجم الملابس",
    activeProcessing: "قيد التحضير",
    totalValue: "إيرادات البوتيك",
    recentOrders: "سجلات الملابس",
    identity: "العميل",
    financials: "الدفع",
    lifecycle: "المرحلة",
    actions: "إدارة",
    noOrders: "لا توجد ملابس في الانتظار.",
    searchPlaceholder: "ابحث بالرقم أو الاسم...",
    exitInspection: "إغلاق الملف",
    orderSpecifics: "تفاصيل الحجز",
    payment: "حالة الرصيد",
    communication: "واتساب / اتصال",
    logistics: "الاستلام / التوصيل",
    manifest: "الملابس والتفاصيل",
    grandTotal: "إجمالي الفاتورة",
    operationalLogs: "الجدول الزمني للحجز",
    neuralInsight: "مستشار الذكاء الاصطناعي",
    stateControl: "تحديث التقدم",
    securityProtocol: "أمن البوتيك",
    delete: "إزالة",
    confirmDelete: "حذف سجل الحجز هذا من السجل؟",
    newDeployment: "إنشاء حجز جديد",
    clientName: "اسم العميل بالكامل",
    phone: "رقم التواصل",
    address: "موقع التوصيل",
    creditStatus: "حالة العربون الأولي",
    inventory: "أصناف الملابس والوسائط",
    add: "إضافة قطعة",
    launch: "تأكيد الحجز",
    currency: "ر.ع.",
    statusNotePlaceholder: "إضافة ملاحظات (مثلاً: الفستان جاهز للقياس)...",
    updateStatus: "تطبيق المرحلة",
    historyDetails: "مدخل السجل",
    timestamp: "الوقت",
    performer: "المدير / الموظف",
    shareOrder: "مشاركة الحجز",
    linkCopied: "تم نسخ الرابط!",
    trackYourOrder: "تتبع طلبك",
    invalidPin: "المعرف أو الرمز خاطئ.",
    settings: "الإعدادات",
    paid: "مدفوع بالكامل",
    unpaid: "العربون معلق",
    itemName: "نوع الملابس",
    itemPrice: "سعر العمل",
    linkExpired: "اكتمل الحجز",
    linkExpiredMsg: "تم تسليم طلب الملابس هذا واكتماله. الدخول مقيد الآن.",
    insufficientPerms: "مطلوب تصريح إداري",
    loginId: "معرف الموظف",
    password: "كلمة المرور / الرمز",
    customers: "قاعدة بيانات العملاء",
    roles: "إدارة الموظفين",
    lastSeen: "آخر طلب",
    ordersCount: "إجمالي الأطقم",
    staffCount: "أعضاء الفريق",
    statsOverview: "أداء الاستوديو",
    daily: "اليوم",
    weekly: "هذا الأسبوع",
    monthly: "هذا الشهر",
    total: "إجمالي الإيرادات",
    pending: "قيد المعالجة",
    completed: "جاهز",
    received: "تم التسليم",
    filteredTitle: "تحليل القطاع",
    backToDashboard: "العودة للمركز",
    backToLogin: "الشاشة الرئيسية",
    close: "إغلاق",
    whatsappShare: "مشاركة عبر واتساب",
    trackingTitle: "تتبع الطلب",
    orderNotFound: "الطلب غير موجود في سجلات الاستوديو لدينا.",
    currentStatus: "الحالة الحالية",
    manageStaff: "إدارة الموظفين",
    roleAdmin: "مدير (تحكم كامل)",
    roleStaff: "موظف (تعديل الطلبات)",
    roleViewer: "مشاهد (قراءة فقط)",
    permissions: "الصلاحيات",
    viewOnly: "وصول للقراءة فقط",
    fullEdit: "وصول كامل للإدارة",
    addStaff: "إضافة عضو جديد",
    yourOtherBookings: "حجوزاتك الأخرى",
    viewBooking: "عرض",
    garment: "قطعة",
    newActivity: "نشاط جديد",
    profile: "ملف العميل",
    lifetimeSpent: "إجمالي المشتريات",
    memberSince: "عميل منذ",
    loyaltyLevel: "فئة العميل",
    loyaltyGold: "عضو ذهبي",
    loyaltySilver: "عضو فضي",
    loyaltyPlatinum: "عضو بلاتيني",
    viewAllOrders: "جميع الحجوزات",
    customerProfile: "سجل العميل",
    totalSpend: "إجمالي الاستثمار",
    askAI: "اطلب من الذكاء الاصطناعي الخطوة التالية"
  }
};

type Language = 'en' | 'ar';
type Theme = 'light' | 'dark';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// --- SHARED COMPONENTS ---

const ImagePreviewModal: React.FC<{ imageUrl: string; onClose: () => void; lang: Language }> = ({ imageUrl, onClose, lang }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl animate-fade" onClick={onClose}>
      <button className="absolute top-8 right-8 w-14 h-14 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-rose-500 hover:text-white transition-soft z-10 border border-white/10" onClick={onClose}>
        <i className="fas fa-times text-xl"></i>
      </button>
      <div className="relative w-full h-full flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
        <img src={imageUrl} className="max-w-full max-h-full object-contain rounded-2xl shadow-[0_0_100px_rgba(217,119,6,0.2)] animate-entry ring-4 ring-white/5" alt="Preview" />
      </div>
    </div>
  );
};

const Navigation: React.FC<{ user: User; onLogout: () => void; lang: Language; setLang: (l: Language) => void; theme: Theme; setTheme: (t: Theme) => void }> = ({ user, onLogout, lang, setLang, theme, setTheme }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const t = translations[lang];

  return (
    <nav className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 h-24 flex items-center shadow-sm transition-all duration-500">
      <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-yellow-400 rounded-xl flex items-center justify-center shadow-xl shadow-amber-900/20 group-hover:scale-110 group-hover:rotate-6 transition-soft duration-500">
              <i className="fas fa-spa text-black text-xl"></i>
            </div>
            <span className="font-black text-slate-900 dark:text-white tracking-tighter text-2xl hidden lg:block">Zahratalsawsen<span className="text-amber-600">Boutique</span></span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Link to="/" className={`px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-soft ${location.pathname === '/' ? 'bg-amber-50 dark:bg-amber-900/40 text-amber-600 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>{t.dashboard}</Link>
            {(user.role === 'admin' || user.role === 'staff' || user.role === 'viewer') && (
              <Link to="/customers" className={`px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-soft ${location.pathname === '/customers' ? 'bg-amber-50 dark:bg-amber-900/40 text-amber-600 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>{t.customers}</Link>
            )}
            {user.role === 'admin' && (
              <Link to="/settings" className={`px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-soft ${location.pathname === '/settings' ? 'bg-amber-50 dark:bg-amber-900/40 text-amber-600 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>{t.settings}</Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
             <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-amber-600 hover:text-black transition-soft text-[9px] font-black uppercase tracking-tighter">{lang === 'en' ? 'AR' : 'EN'}</button>
             <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-amber-600 hover:text-black transition-soft">
               <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'} text-xs`}></i>
             </button>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden md:block"></div>
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-black text-slate-900 dark:text-white leading-none mb-1 group-hover:text-amber-600 transition-colors">{user.name}</span>
              <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/20 rounded-md">{user.role}</span>
            </div>
            <button onClick={(e) => { e.stopPropagation(); onLogout(); }} className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-soft flex items-center justify-center shadow-sm active:scale-90"><i className="fas fa-power-off text-sm"></i></button>
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
      className={`bg-white dark:bg-slate-900/60 p-6 rounded-[1.75rem] border shadow-sm transition-all duration-700 card-hover group relative overflow-hidden ${to ? 'cursor-pointer' : ''} ${showBadge ? 'border-amber-500/50 ring-4 ring-amber-500/5' : 'border-slate-100 dark:border-slate-800'}`}
    >
      <div className={`absolute -right-4 -bottom-4 text-6xl opacity-[0.04] dark:opacity-[0.08] group-hover:scale-125 group-hover:rotate-12 transition-soft ${color}`}>
        <i className={`fas ${icon}`}></i>
      </div>
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.25em]">{label}</span>
          <div className="relative">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-amber-50 dark:bg-amber-900/20 text-amber-600 shadow-sm group-hover:scale-110 transition-soft`}>
              <i className={`fas ${icon} text-xs`}></i>
            </div>
            {showBadge && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border-2 border-white dark:border-slate-900"></span>
              </span>
            )}
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-1">{value}</h4>
            {showBadge && badgeLabel && (
              <span className="text-[7px] font-black text-white bg-amber-600 px-2 py-0.5 rounded-full animate-bounce shadow-lg shadow-amber-900/20 uppercase tracking-tighter">
                {badgeLabel}
              </span>
            )}
          </div>
          {subValue && <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700"></span> {subValue}
          </p>}
        </div>
      </div>
    </div>
  );
};

// --- PAGES ---

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

  if (orders.length === 0) return <div className="p-20 text-center font-black text-slate-400 uppercase tracking-widest dark:text-slate-600">{t.orderNotFound}</div>;

  const clientName = orders[0].customerName;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-fade" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="mb-12 flex flex-col md:flex-row justify-between items-end gap-8 animate-entry">
        <div>
          <button onClick={() => navigate(-1)} className="mb-6 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl font-black text-[9px] uppercase tracking-widest text-slate-400 hover:text-amber-600 transition-soft shadow-sm">
            <i className={`fas ${lang === 'ar' ? 'fa-arrow-right' : 'fa-arrow-left'} mr-2`}></i> {t.backToDashboard}
          </button>
          <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-3">{clientName}</h2>
          <div className="flex items-center gap-4 text-slate-400 font-bold uppercase text-[9px] tracking-[0.4em]">
            <div className="w-10 h-1 bg-amber-600 rounded-full"></div> <span>{t.customerProfile}</span>
          </div>
        </div>
        <div className="w-full md:w-auto p-8 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-amber-500 dark:to-yellow-400 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
          <i className="fas fa-spa absolute -right-4 -bottom-4 text-8xl opacity-10 text-white dark:text-black group-hover:scale-125 transition-soft"></i>
          <div className="relative z-10">
             <span className="text-[8px] font-black text-white/50 dark:text-black/50 uppercase tracking-[0.4em] mb-2 block">{t.loyaltyLevel}</span>
             <h3 className="text-2xl font-black text-white dark:text-black tracking-tighter">{stats.level}</h3>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 animate-entry stagger-1">
        <StatCard label={t.totalSpend} value={`${stats.totalSpent.toFixed(2)} ${t.currency}`} icon="fa-coins" color="text-amber-600" />
        <StatCard label={t.ordersCount} value={stats.count} icon="fa-shopping-bag" color="text-amber-600" />
        <StatCard label={t.memberSince} value={stats.since} icon="fa-calendar-day" color="text-amber-600" />
      </div>

      <div className="bg-white dark:bg-slate-900/60 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden animate-entry stagger-2">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">{t.viewAllOrders}</h3>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead className="text-slate-300 text-[9px] font-black uppercase tracking-[0.4em] border-b border-slate-50 dark:border-slate-800">
              <tr>
                <th className="px-8 py-6">{t.garment}</th>
                <th className="px-8 py-6">{t.financials}</th>
                <th className="px-8 py-6">{t.lifecycle}</th>
                <th className={`px-8 py-6 ${lang === 'ar' ? 'text-left' : 'text-right'}`}>{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {orders.map((order, i) => {
                const firstImg = order.items.find(it => it.imageUrl)?.imageUrl;
                return (
                  <tr key={order.id} className="group hover:bg-amber-50/20 dark:hover:bg-amber-900/10 transition-soft cursor-pointer" onClick={() => navigate(`/order/${order.id}`)}>
                    <td className="px-8 py-8">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm transition-soft">
                          {firstImg ? <img src={firstImg} className="w-full h-full object-cover" alt={order.id} /> : <i className="fas fa-spa text-slate-300"></i>}
                        </div>
                        <div>
                          <div className="font-black text-slate-900 dark:text-white text-lg tracking-tighter group-hover:text-amber-600 transition-colors">{order.id}</div>
                          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex flex-col">
                        <span className={`text-[7px] font-black px-2 py-0.5 rounded-md w-fit mb-2 uppercase tracking-widest ${order.paymentStatus === PaymentStatus.PAID ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>{order.paymentStatus}</span>
                        <span className="font-black text-slate-900 dark:text-white text-base tracking-tighter">{order.totalAmount.toFixed(2)} {t.currency}</span>
                      </div>
                    </td>
                    <td className="px-8 py-8"><StatusBadge status={order.orderStatus} /></td>
                    <td className={`px-8 py-8 ${lang === 'ar' ? 'text-left' : 'text-right'}`}>
                       <i className={`fas ${lang === 'ar' ? 'fa-chevron-left' : 'fa-chevron-right'} text-slate-200 group-hover:text-amber-600 group-hover:translate-x-1 transition-soft`}></i>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const TrackingPage: React.FC<{ lang: Language }> = ({ lang }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const t = translations[lang];

  useEffect(() => {
    if (id) {
      const found = getOrderById(id);
      if (found) {
        setOrder(found);
        const related = getOrdersByPhoneAndPin(found.customerPhone, found.customerPin);
        setAllOrders(related);
      } else {
        setOrder(null);
      }
    }
    setLoading(false);
  }, [id]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-amber-500 font-black tracking-widest">LOADING...</div>;
  if (!order) return <div className="min-h-screen bg-black flex items-center justify-center text-white p-10 text-center"><h2 className="text-2xl font-black">{t.orderNotFound}</h2></div>;

  const otherOrders = allOrders.filter(o => o.id !== order.id);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black py-12 px-6" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-3xl mx-auto space-y-10">
        <header className="text-center animate-entry">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-600 to-yellow-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <i className="fas fa-spa text-black text-2xl"></i>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-2 italic">Zahratalsawsen Boutique</h1>
          <p className="text-amber-600 font-black uppercase text-[10px] tracking-[0.4em]">{t.trackingTitle}</p>
        </header>

        <div className="bg-white dark:bg-slate-900/60 p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl animate-entry stagger-1">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
            <div>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Order ID</span>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-widest">{order.id}</h2>
            </div>
            <StatusBadge status={order.orderStatus} />
          </div>

          <div className="space-y-8">
            <h3 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.4em] border-b border-slate-100 dark:border-slate-800 pb-4">{t.manifest}</h3>
            {order.items.map(item => (
              <div key={item.id} className="flex items-center gap-6 p-4 bg-slate-50 dark:bg-black/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                <button onClick={() => item.imageUrl && setPreviewImg(item.imageUrl)} className="w-20 h-20 rounded-xl overflow-hidden bg-white dark:bg-slate-900 flex items-center justify-center border border-slate-100 dark:border-slate-800 shadow-sm hover:scale-105 transition-soft">
                  {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.itemName} /> : <i className="fas fa-spa text-slate-200"></i>}
                </button>
                <div className="flex-1">
                  <h4 className="font-black text-slate-900 dark:text-white text-lg">{item.itemName}</h4>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Qty: {item.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 space-y-8">
            <h3 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.4em] border-b border-slate-100 dark:border-slate-800 pb-4">{t.operationalLogs}</h3>
            <div className="space-y-8 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
              {order.history.map((log, i) => (
                <div key={i} className="relative pl-10">
                  <div className={`absolute left-0 top-0 w-6 h-6 rounded-full border-4 border-white dark:border-slate-900 shadow-md ${i === 0 ? 'bg-amber-600 animate-pulse' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-black text-slate-900 dark:text-white text-sm">{log.status}</span>
                    <span className="text-[8px] font-black text-slate-400 uppercase">{new Date(log.timestamp).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-500 text-xs italic">"{log.note || 'Processing in boutique.'}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {otherOrders.length > 0 && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-xl animate-entry stagger-2">
            <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] mb-8">{t.yourOtherBookings}</h3>
            <div className="grid grid-cols-1 gap-4">
              {otherOrders.map(o => (
                <div key={o.id} className="flex items-center justify-between p-6 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/[0.08] transition-soft group">
                  <div className="flex items-center gap-5">
                    <div className="w-10 h-10 bg-amber-600/20 text-amber-500 rounded-lg flex items-center justify-center font-black text-xs">{o.id.slice(-2)}</div>
                    <div>
                      <h4 className="font-black text-white tracking-tight">{o.id}</h4>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{new Date(o.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <StatusBadge status={o.orderStatus} />
                    <button onClick={() => navigate(`/track/${o.id}`)} className="px-4 py-2 bg-amber-600 text-black rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-amber-500 transition-soft active:scale-95">{t.viewBooking}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {previewImg && <ImagePreviewModal imageUrl={previewImg} onClose={() => setPreviewImg(null)} lang={lang} />}
    </div>
  );
};

const SettingsPage: React.FC<{ user: User; lang: Language }> = ({ user, lang }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState<{ name: string; username: string; pin: string; role: User['role'] }>({ name: '', username: '', pin: '', role: 'staff' });
  const [error, setError] = useState('');
  const t = translations[lang];

  useEffect(() => { setUsers(getUsers()); }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isUsernameUnique(formData.username)) {
      setError("Username already taken.");
      return;
    }
    const newUser: User = { id: `user-${Date.now()}`, ...formData, createdAt: new Date().toISOString() };
    saveUser(newUser);
    setUsers(getUsers());
    setShowCreate(false);
    setFormData({ name: '', username: '', pin: '', role: 'staff' });
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-16 animate-fade" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="mb-12 flex flex-col sm:flex-row justify-between items-end gap-8 animate-entry">
        <div>
          <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-3">{t.settings}</h2>
          <div className="flex items-center gap-4 text-slate-400 font-bold uppercase text-[9px] tracking-[0.4em]">
            <div className="w-10 h-1 bg-amber-600 rounded-full"></div> <span>{t.manageStaff}</span>
          </div>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="w-full sm:w-auto bg-slate-900 dark:bg-amber-500 text-white dark:text-black px-8 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-amber-600 transition-soft shadow-lg active:scale-95 flex items-center justify-center gap-3">
          <i className={`fas ${showCreate ? 'fa-times' : 'fa-plus'}`}></i>
          {showCreate ? t.close : t.addStaff}
        </button>
      </header>

      {showCreate && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-amber-100 dark:border-amber-900 shadow-xl mb-12 animate-entry">
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
            <div className="space-y-2">
              <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest px-1">Legal Name</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-transparent focus:border-amber-500 outline-none font-bold shadow-inner dark:text-white" placeholder="Staff Name" />
            </div>
            <div className="space-y-2">
              <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest px-1">Identity Tag</label>
              <input required type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-transparent focus:border-amber-500 outline-none font-bold shadow-inner dark:text-white" placeholder="Login ID" />
            </div>
            <div className="space-y-2">
              <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest px-1">Access PIN</label>
              <input required type="text" value={formData.pin} onChange={e => setFormData({...formData, pin: e.target.value})} className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-transparent focus:border-amber-500 outline-none font-bold shadow-inner dark:text-white" placeholder="Security Token" />
            </div>
            <div className="flex gap-3">
              <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as User['role']})} className="flex-1 px-5 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-transparent focus:border-amber-500 outline-none font-black uppercase text-[9px] shadow-sm cursor-pointer dark:text-white">
                <option value="viewer">{t.roleViewer}</option>
                <option value="staff">{t.roleStaff}</option>
                <option value="admin">{t.roleAdmin}</option>
              </select>
              <button type="submit" className="px-8 py-3 bg-amber-600 text-black rounded-xl font-black uppercase text-[9px] tracking-widest shadow-lg active:scale-95 transition-soft">Provision</button>
            </div>
          </form>
          {error && <p className="text-rose-500 text-[8px] font-black mt-4 uppercase text-center tracking-[0.3em] bg-rose-50 dark:bg-rose-900/20 py-2 rounded-lg">{error}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-entry stagger-1">
        {users.map((u, i) => (
          <div key={u.id} className="bg-white dark:bg-slate-900/60 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-soft card-hover animate-entry group" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="flex justify-between items-start mb-6">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl shadow-lg group-hover:rotate-12 transition-soft ${u.role === 'admin' ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-black' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600'}`}>
                <i className={`fas ${u.role === 'admin' ? 'fa-shield-halved' : u.role === 'viewer' ? 'fa-eye' : 'fa-user-gear'}`}></i>
              </div>
              <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] ${u.role === 'admin' ? 'bg-amber-600 text-white' : u.role === 'viewer' ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' : 'bg-amber-50 dark:bg-amber-900/10 text-amber-500'}`}>{u.role}</span>
            </div>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter mb-3 group-hover:text-amber-600 transition-colors">{u.name}</h4>
            
            <div className="space-y-4 mb-6">
              <div className="space-y-2 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between text-[10px]"><span className="text-slate-400 font-black uppercase text-[7px] tracking-[0.3em]">Identity Tag</span><span className="font-black text-slate-800 dark:text-slate-200">@{u.username}</span></div>
                <div className="flex justify-between text-[10px]"><span className="text-slate-400 font-black uppercase text-[7px] tracking-[0.3em]">Security Token</span><span className="font-black text-amber-500">****</span></div>
              </div>
              <div className="p-3 bg-amber-50/30 dark:bg-amber-900/10 rounded-xl border border-amber-100/30">
                <p className="text-[7px] font-black text-amber-600 uppercase tracking-[0.3em] mb-1">{t.permissions}</p>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  {u.role === 'viewer' ? t.viewOnly : t.fullEdit}
                </p>
              </div>
            </div>

            {u.id !== user.id && (
              <button onClick={() => { if(deleteUser(u.id)) setUsers(getUsers()); }} className="w-full py-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 text-rose-500 font-black uppercase text-[8px] tracking-widest hover:bg-rose-500 hover:text-white transition-soft active:scale-95">Decommission Staff</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const FilteredOrdersPage: React.FC<{ user: User; lang: Language }> = ({ user, lang }) => {
  const { type, value } = useParams<{ type: string; value: string }>();
  const navigate = useNavigate();
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const t = translations[lang];
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!user) return;
    const all = (user.role === 'admin' || user.role === 'staff' || user.role === 'viewer') ? getOrders() : getOrdersByPhoneAndPin(user.username, user.pin);
    const now = new Date();
    
    let filtered = all;
    if (type === 'status') {
      if (value === 'pending') {
        filtered = all.filter(o => o.orderStatus === OrderStatus.IN_SHOP || o.orderStatus === OrderStatus.READY_TO_PICKUP);
      } else {
        filtered = all.filter(o => o.orderStatus === value);
      }
    } else if (type === 'range') {
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOf7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const startOf30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      if (value === 'daily') filtered = all.filter(o => new Date(o.createdAt) >= startOfToday);
      else if (value === 'weekly') filtered = all.filter(o => new Date(o.createdAt) >= startOf7Days);
      else if (value === 'monthly') filtered = all.filter(o => new Date(o.createdAt) >= startOf30Days);
    }
    
    setOrders(filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }, [type, value, user]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-fade" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="animate-entry">
          <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-3">{t.filteredTitle}</h2>
          <div className="flex items-center gap-4 text-slate-400 font-bold uppercase text-[9px] tracking-[0.4em]">
            <div className="w-10 h-1 bg-amber-600 rounded-full"></div> <span>{value?.replace('-', ' ')} Studio Operations</span>
          </div>
        </div>
        <button onClick={() => navigate('/')} className="px-6 py-3.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl font-black text-[9px] uppercase trackingest text-slate-400 hover:text-amber-600 dark:hover:text-amber-500 hover:border-amber-600 transition-soft shadow-sm active:scale-95">
          <i className={`fas ${lang === 'ar' ? 'fa-arrow-right' : 'fa-arrow-left'} mr-2`}></i> {t.backToDashboard}
        </button>
      </header>

      <div className="bg-white dark:bg-slate-900/60 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden animate-entry stagger-1">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead className="text-slate-300 text-[9px] font-black uppercase tracking-[0.4em] border-b border-slate-50 dark:border-slate-800">
              <tr>
                <th className="px-8 py-6">{t.garment}</th>
                <th className="px-8 py-6">{t.identity}</th>
                <th className="px-8 py-6">{t.financials}</th>
                <th className="px-8 py-6">{t.lifecycle}</th>
                <th className={`px-8 py-6 ${lang === 'ar' ? 'text-left' : 'text-right'}`}>{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {orders.length === 0 ? (
                <tr><td colSpan={5} className="px-8 py-32 text-center"><p className="font-black text-xl tracking-tighter opacity-20 uppercase tracking-[0.2em] text-slate-400">{t.noOrders}</p></td></tr>
              ) : (
                orders.map((order, i) => {
                  const firstImg = order.items.find(it => it.imageUrl)?.imageUrl;
                  return (
                    <tr key={order.id} className="group hover:bg-amber-50/20 dark:hover:bg-amber-900/10 transition-soft cursor-pointer animate-entry" style={{ animationDelay: `${i * 0.05}s` }} onClick={() => navigate(`/order/${order.id}`)}>
                      <td className="px-8 py-8">
                        <div 
                          onClick={(e) => { e.stopPropagation(); firstImg && setPreviewImg(firstImg); }}
                          className={`w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm transition-soft ${firstImg ? 'hover:scale-110 cursor-zoom-in' : ''}`}
                        >
                          {firstImg ? <img src={firstImg} className="w-full h-full object-cover" alt={order.id} /> : <i className="fas fa-spa text-slate-300 dark:text-slate-600"></i>}
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex items-center gap-6">
                          <div className="w-10 h-10 bg-slate-900 dark:bg-amber-500 text-white dark:text-black rounded-lg flex items-center justify-center font-black text-[10px] group-hover:scale-110 transition-soft">{order.id.slice(-2)}</div>
                          <div>
                            <div className="font-black text-slate-900 dark:text-white text-lg tracking-tighter group-hover:text-amber-600 transition-colors">{order.id}</div>
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{order.customerName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex flex-col">
                          <span className={`text-[7px] font-black px-2 py-0.5 rounded-md w-fit mb-2 shadow-sm uppercase tracking-widest ${order.paymentStatus === PaymentStatus.PAID ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>{order.paymentStatus}</span>
                          <span className="font-black text-slate-900 dark:text-white text-base tracking-tighter">{order.totalAmount.toFixed(2)} {t.currency}</span>
                        </div>
                      </td>
                      <td className="px-8 py-8"><StatusBadge status={order.orderStatus} /></td>
                      <td className={`px-8 py-8 ${lang === 'ar' ? 'text-left' : 'text-right'}`}>
                         <i className={`fas ${lang === 'ar' ? 'fa-chevron-left' : 'fa-chevron-right'} text-slate-200 group-hover:text-amber-600 group-hover:translate-x-1 transition-soft`}></i>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {previewImg && <ImagePreviewModal imageUrl={previewImg} onClose={() => setPreviewImg(null)} lang={lang} />}
    </div>
  );
};

interface CustomerData {
  name: string;
  phone: string;
  pin: string;
  orderCount: number;
  lastOrder: string;
}

const CustomerListPage: React.FC<{ user: User; lang: Language }> = ({ user, lang }) => {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const navigate = useNavigate();
  const t = translations[lang];

  useEffect(() => {
    setCustomers(getUniqueCustomers().sort((a, b) => new Date(b.lastOrder).getTime() - new Date(a.lastOrder).getTime()));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-fade" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="mb-12 animate-entry">
        <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-3">{t.customers}</h2>
        <div className="flex items-center gap-4 text-slate-400 font-bold uppercase text-[9px] tracking-[0.4em]">
          <div className="w-10 h-1 bg-amber-600 rounded-full"></div> <span>Boutique Client Registry</span>
        </div>
      </header>

      <div className="bg-white dark:bg-slate-900/60 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden animate-entry stagger-1">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead className="text-slate-300 text-[9px] font-black uppercase tracking-[0.4em] border-b border-slate-50 dark:border-slate-800">
              <tr>
                <th className="px-8 py-6">Client Identity</th>
                <th className="px-8 py-6">{t.communication}</th>
                <th className="px-8 py-6">{t.ordersCount}</th>
                <th className="px-8 py-6">{t.lastSeen}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {customers.map((c, i) => (
                <tr key={i} className="hover:bg-amber-50/10 dark:hover:bg-amber-900/10 transition-soft animate-entry group cursor-pointer" style={{ animationDelay: `${i * 0.05}s` }} onClick={() => navigate(`/customer/${c.phone}`)}>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-slate-900 dark:bg-amber-500 text-white dark:text-black rounded-xl flex items-center justify-center font-black text-base group-hover:scale-110 transition-soft">{c.name.charAt(0)}</div>
                      <span className="font-black text-xl text-slate-900 dark:text-white tracking-tighter group-hover:text-amber-600 transition-colors">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-black text-amber-600 text-base tracking-tight">{c.phone}</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">PIN SECURED: {c.pin}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg font-black text-slate-700 dark:text-slate-300 text-[10px] border border-slate-200 dark:border-slate-700">{c.orderCount}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-slate-500 dark:text-slate-400 font-bold text-xs">{new Date(c.lastOrder).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- MODAL: CREATE ORDER ---

const CreateOrderModal: React.FC<{ user: User; lang: Language; onClose: () => void }> = ({ user, lang, onClose }) => {
  const t = translations[lang];
  const [loading, setLoading] = useState(false);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    customerPin: '',
    paymentStatus: PaymentStatus.UNPAID
  });
  const [items, setItems] = useState<OrderItem[]>([]);
  const [newItem, setNewItem] = useState<{ name: string; price: string; quantity: string; imageUrl?: string }>({ 
    name: '', price: '', quantity: '1' 
  });

  const handleAddItem = () => {
    if (!newItem.name || !newItem.price) return;
    const item: OrderItem = {
      id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      itemName: newItem.name,
      price: parseFloat(newItem.price),
      quantity: parseInt(newItem.quantity),
      imageUrl: newItem.imageUrl
    };
    setItems([...items, item]);
    setNewItem({ name: '', price: '', quantity: '1', imageUrl: undefined });
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const base64 = await fileToBase64(e.target.files[0]);
      setNewItem({ ...newItem, imageUrl: base64 });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setLoading(true);
    
    try {
      const id = await generateOrderId();
      const totalAmount = items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
      
      const newOrder: Order = {
        id,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerAddress: formData.customerAddress,
        customerPin: formData.customerPin,
        items,
        totalAmount,
        paymentStatus: formData.paymentStatus,
        orderStatus: OrderStatus.CREATED,
        createdAt: new Date().toISOString(),
        history: [{
          status: OrderStatus.CREATED,
          timestamp: new Date().toISOString(),
          updatedBy: user.name,
          note: "New booking record initiated in boutique database."
        }]
      };
      
      saveOrder(newOrder);
      saveAdminLog({
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        adminName: user.name,
        action: "New Booking Order",
        details: `Order ${id} for ${formData.customerName}`,
        orderId: id
      });
      
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-10 overflow-y-auto bg-black/80 backdrop-blur-xl animate-fade">
        <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden relative animate-entry transition-colors duration-500">
          <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-rose-50 dark:hover:bg-rose-900/40 hover:text-rose-500 transition-soft active:scale-90 z-10"><i className="fas fa-times text-lg"></i></button>
          
          <form onSubmit={handleSubmit} className="p-8 sm:p-14 space-y-12">
            <header>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">{t.newDeployment}</h2>
              <div className="w-12 h-1 bg-amber-600 rounded-full"></div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest px-2">{t.clientName}</label>
                  <input required type="text" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-transparent focus:border-amber-500 outline-none font-bold shadow-inner dark:text-white dark:border-slate-700" placeholder="Ex: Sarah Khan" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest px-2">{t.phone}</label>
                  <input required type="text" value={formData.customerPhone} onChange={e => setFormData({...formData, customerPhone: e.target.value})} className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-transparent focus:border-amber-500 outline-none font-bold shadow-inner dark:text-white dark:border-slate-700" placeholder="+968 0000 0000" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest px-2">{t.address}</label>
                  <textarea value={formData.customerAddress} onChange={e => setFormData({...formData, customerAddress: e.target.value})} className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-transparent focus:border-amber-500 outline-none font-bold shadow-inner h-20 resize-none dark:text-white dark:border-slate-700" placeholder="Delivery details..." />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest px-2">{t.pinEntry}</label>
                  <input required type="password" value={formData.customerPin} onChange={e => setFormData({...formData, customerPin: e.target.value})} className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-transparent focus:border-amber-500 outline-none font-black text-center text-2xl tracking-[0.6em] shadow-inner dark:text-white dark:border-slate-700" placeholder="••••" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest px-2">{t.creditStatus}</label>
                  <select value={formData.paymentStatus} onChange={e => setFormData({...formData, paymentStatus: e.target.value as PaymentStatus})} className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-transparent focus:border-amber-500 outline-none font-black uppercase text-[9px] shadow-sm cursor-pointer dark:text-white dark:border-slate-700">
                    <option value={PaymentStatus.UNPAID}>{t.unpaid}</option>
                    <option value={PaymentStatus.PAID}>{t.paid}</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-[0.4em] flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-amber-600 text-black flex items-center justify-center shadow-md"><i className="fas fa-boxes-stacked"></i></div> 
                Booking Items
              </h3>
              
              <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-6 transition-all">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                  <div className="sm:col-span-5 space-y-2">
                    <label className="block text-[7px] font-black text-slate-400 uppercase tracking-widest px-2">{t.itemName}</label>
                    <input type="text" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-slate-900 rounded-lg border border-transparent focus:border-amber-500 outline-none font-bold dark:text-white" placeholder="Abaya / Suit / Dress" />
                  </div>
                  <div className="sm:col-span-3 space-y-2">
                    <label className="block text-[7px] font-black text-slate-400 uppercase tracking-widest px-2">{t.itemPrice}</label>
                    <input type="number" step="0.1" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-slate-900 rounded-lg border border-transparent focus:border-amber-500 outline-none font-bold dark:text-white" />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <label className="block text-[7px] font-black text-slate-400 uppercase tracking-widest px-2 text-center">Sketch</label>
                    <div className="relative group/camera">
                      <label className="w-full h-10 bg-white dark:bg-slate-900 rounded-lg border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center cursor-pointer hover:border-amber-500 transition-soft overflow-hidden">
                          {newItem.imageUrl ? (
                            <img src={newItem.imageUrl} className="w-full h-full object-cover group-hover/camera:opacity-50" alt="New Item Preview" />
                          ) : (
                            <i className="fas fa-camera text-slate-300"></i>
                          )}
                          <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      </label>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <button type="button" onClick={handleAddItem} className="w-full bg-amber-600 text-black h-10 rounded-lg font-black uppercase text-[8px] tracking-widest hover:bg-amber-700 transition-soft active:scale-95">{t.add}</button>
                  </div>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {items.map(item => (
                    <div key={item.id} className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-700 flex justify-between items-center group animate-entry">
                      <div className="flex items-center gap-4">
                        <button 
                          type="button"
                          onClick={() => item.imageUrl && setPreviewImg(item.imageUrl)}
                          className={`w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center border border-slate-100 dark:border-slate-700 ${item.imageUrl ? 'cursor-zoom-in' : 'cursor-default'}`}
                        >
                          {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.itemName} /> : <i className="fas fa-spa text-slate-200"></i>}
                        </button>
                        <div>
                          <p className="font-black text-slate-900 dark:text-white tracking-tight text-base">{item.itemName}</p>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-5">
                        <span className="font-black text-amber-600 text-sm">{item.price.toFixed(2)} {t.currency}</span>
                        <button type="button" onClick={() => handleRemoveItem(item.id)} className="w-8 h-8 rounded-lg bg-rose-50 text-rose-300 hover:text-rose-500 hover:bg-rose-100 transition-soft"><i className="fas fa-trash-alt text-xs"></i></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button disabled={items.length === 0 || loading} type="submit" className="w-full bg-slate-900 dark:bg-amber-500 text-white dark:text-black py-5 rounded-2xl font-black uppercase tracking-[0.4em] text-base hover:bg-amber-600 dark:hover:bg-amber-400 transition-soft shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group">
              {loading ? <i className="fas fa-circle-notch fa-spin text-xl"></i> : (
                <span className="flex items-center justify-center gap-4">
                  {t.launch}
                  <i className="fas fa-rocket group-hover:translate-x-1 transition-soft"></i>
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
      {previewImg && <ImagePreviewModal imageUrl={previewImg} onClose={() => setPreviewImg(null)} lang={lang} />}
    </>
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
    if (foundUser) {
      onLogin(foundUser);
    } else {
      setError(t.invalidPin);
      setPin('');
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = ((clientX - left) / width - 0.5) * 20;
    const y = ((clientY - top) / height - 0.5) * -20;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6 bg-black relative overflow-hidden perspective-1000" 
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Live 3D Floating Background Elements */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-600/10 rounded-full blur-[120px] animate-pulse pointer-events-none"
        style={{ transform: `translate(${tilt.x * 2}px, ${tilt.y * 2}px)` }}
      ></div>
      <div 
        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-yellow-400/5 rounded-full blur-[120px] animate-pulse pointer-events-none delay-1000"
        style={{ transform: `translate(${tilt.x * -1}px, ${tilt.y * -1}px)` }}
      ></div>

      <div className="absolute top-8 right-8 z-10 flex gap-3">
        <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} className="px-5 py-2.5 bg-white/5 backdrop-blur-3xl border border-white/10 text-white rounded-lg font-black text-[9px] uppercase tracking-[0.2em] hover:bg-amber-600/20 hover:border-amber-500/50 transition-soft">
          {lang === 'en' ? 'Arabic System' : 'النظام الإنجليزي'}
        </button>
      </div>

      {/* 3D Tilting Card */}
      <div 
        className="bg-white/[0.04] backdrop-blur-[40px] p-10 sm:p-14 rounded-[3rem] border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] w-full max-w-md relative group animate-fade transition-transform duration-200 ease-out preserve-3d"
        style={{ transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)` }}
      >
        <div className="text-center mb-10 translate-z-10">
          <div className="w-24 h-24 bg-gradient-to-br from-amber-600 to-yellow-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_20px_40px_rgba(217,119,6,0.4)] animate-float">
            <i className="fas fa-spa text-black text-4xl"></i>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2 italic">Zahratalsawsen</h1>
          <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-600/40 to-transparent mb-2"></div>
          <p className="text-amber-500 font-black uppercase tracking-[0.4em] text-[10px]">{t.securePortal}</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6 translate-z-20">
          <div className="space-y-5">
            <div className="group relative">
              <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-4 group-focus-within:text-amber-400 transition-colors">{t.loginId}</label>
              <input 
                type="text" 
                autoFocus 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                className="w-full px-6 py-4 rounded-xl border border-white/5 bg-white/5 text-white focus:border-amber-50/10 focus:bg-white/10 outline-none transition-soft font-bold text-base placeholder:text-slate-700" 
                placeholder="ID / PHONE / NAME" 
                required 
              />
            </div>
            <div className="group relative">
              <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-4 group-focus-within:text-amber-400 transition-colors">{t.password}</label>
              <input 
                type="password" 
                value={pin} 
                onChange={(e) => setPin(e.target.value)} 
                className="w-full px-6 py-4 rounded-xl border border-white/5 bg-white/5 text-white text-center text-xl tracking-[0.2em] focus:border-amber-50/10 focus:bg-white/10 outline-none transition-soft placeholder:text-slate-700" 
                placeholder="••••" 
                required 
              />
            </div>
          </div>
          
          {error && <div className="bg-rose-500/10 border border-rose-500/20 py-3 rounded-xl animate-shake"><p className="text-rose-400 text-[9px] text-center font-black uppercase tracking-[0.2em]">{error}</p></div>}
          
          <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-black font-black py-5 rounded-xl shadow-lg transition-soft active:scale-95 text-base uppercase tracking-[0.3em]">
            Authorize Access
          </button>
        </form>
      </div>
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
      if (o) {
        refreshAdvice(o.orderStatus);
      }
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

  const handleWhatsAppShare = () => {
    const trackingUrl = `${window.location.origin}${window.location.pathname}#/track/${order?.id}`;
    const text = `Hello ${order?.customerName}, you can track your booking status here: ${trackingUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const canEdit = user.role === 'admin' || user.role === 'staff';

  if (!order) return <div className="p-20 text-center font-black text-slate-400 uppercase tracking-widest">{t.noOrders}</div>;

  return (
    <>
      <div className="max-w-7xl mx-auto px-6 py-12 animate-fade" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <header className="mb-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl font-black text-[9px] uppercase tracking-widest text-slate-400 hover:text-amber-600 dark:hover:text-amber-500 transition-soft shadow-sm">
              <i className={`fas ${lang === 'ar' ? 'fa-arrow-right' : 'fa-arrow-left'} mr-2`}></i> {t.backToDashboard}
            </button>
            <div className="flex items-center gap-2">
              <button onClick={handleShare} className={`px-5 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-soft border flex items-center gap-3 ${copied ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800 hover:border-amber-50'}`}>
                <i className={`fas ${copied ? 'fa-check' : 'fa-link'}`}></i>
                {copied ? t.linkCopied : t.shareOrder}
              </button>
              <button onClick={handleWhatsAppShare} className="w-12 h-11 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-emerald-600 transition-soft">
                <i className="fab fa-whatsapp text-xl"></i>
              </button>
            </div>
          </div>
          <StatusBadge status={order.orderStatus} />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {/* AI Advice Prominent Box */}
            <section className="bg-slate-900 dark:bg-amber-500 p-8 rounded-[2.5rem] shadow-2xl animate-entry relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 text-8xl text-white dark:text-black group-hover:scale-125 transition-soft">
                <i className="fas fa-brain"></i>
              </div>
              <div className="relative z-10 flex flex-col sm:flex-row items-center gap-8">
                <div className="w-20 h-20 bg-amber-600 dark:bg-black rounded-2xl flex items-center justify-center shrink-0 shadow-xl">
                  <i className="fas fa-robot text-white dark:text-amber-500 text-3xl"></i>
                </div>
                <div className="flex-1 text-center sm:text-left">
                   <h3 className="text-[10px] font-black text-amber-400 dark:text-black/60 uppercase tracking-[0.4em] mb-3">{t.neuralInsight}</h3>
                   <div className="min-h-[60px] flex items-center justify-center sm:justify-start">
                     {loadingAdvice ? (
                        <div className="flex items-center gap-3">
                          <i className="fas fa-circle-notch fa-spin text-white dark:text-black"></i>
                          <span className="text-white/50 dark:text-black/50 font-bold uppercase text-[10px] tracking-widest animate-pulse">Analyzing studio workflow...</span>
                        </div>
                     ) : (
                        <p className="text-white dark:text-black text-xl font-black italic leading-tight tracking-tight">"{advice || 'Consulting boutique database...'}"</p>
                     )}
                   </div>
                </div>
                {canEdit && (
                  <button onClick={() => refreshAdvice(order.orderStatus)} disabled={loadingAdvice} className="shrink-0 bg-white/10 dark:bg-black/10 hover:bg-white/20 dark:hover:bg-black/20 text-white dark:text-black px-6 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest transition-soft border border-white/5 dark:border-black/5 flex items-center gap-3 group/ai">
                    <i className={`fas fa-sparkles ${loadingAdvice ? 'fa-spin' : 'group-hover/ai:rotate-12 transition-transform'}`}></i>
                    {t.askAI}
                  </button>
                )}
              </div>
            </section>

            <section className="bg-white dark:bg-slate-900/60 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm animate-entry stagger-1">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8">{t.manifest}</h3>
              <div className="space-y-6">
                {order.items.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 transition-soft hover:shadow-md">
                    <div className="flex items-center gap-6">
                      <button 
                        onClick={() => item.imageUrl && setPreviewImg(item.imageUrl)}
                        className={`w-16 h-16 bg-white dark:bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-slate-100 dark:border-slate-800 shadow-sm hover:scale-105 transition-soft ${item.imageUrl ? 'cursor-zoom-in' : 'cursor-default'}`}
                      >
                        {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.itemName} /> : <i className="fas fa-spa text-slate-200 text-2xl"></i>}
                      </button>
                      <div>
                        <h4 className="font-black text-slate-900 dark:text-white text-xl tracking-tighter">{item.itemName}</h4>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Quantity: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-black text-amber-600 text-lg">{item.price.toFixed(2)} {t.currency}</span>
                  </div>
                ))}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <span className="font-black text-slate-900 dark:text-white text-2xl tracking-tighter">{t.grandTotal}</span>
                  <span className="font-black text-amber-600 text-3xl tracking-tighter">{order.totalAmount.toFixed(2)} {t.currency}</span>
                </div>
              </div>
            </section>

            <section className="bg-white dark:bg-slate-900/60 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm animate-entry stagger-2">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8">{t.operationalLogs}</h3>
              <div className="space-y-8">
                {order.history.map((entry, i) => (
                  <div key={i} className="relative pl-10 border-l-2 border-amber-50 dark:border-amber-900/30 last:border-0 pb-8">
                    <div className="absolute -left-[11px] top-0 w-5 h-5 bg-white dark:bg-slate-900 border-4 border-amber-600 rounded-full shadow-lg shadow-amber-100 dark:shadow-none"></div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-black text-slate-900 dark:text-white text-sm tracking-tight">{entry.status}</span>
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{new Date(entry.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-2">{entry.note}</p>
                    <span className="text-[8px] font-black text-amber-500 uppercase tracking-[0.2em] px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 rounded-md">{entry.updatedBy}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-10">
            {canEdit && (
              <section className="bg-white dark:bg-slate-900/60 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm animate-entry">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8">{t.stateControl}</h3>
                <div className="grid grid-cols-1 gap-3 mb-6">
                  {Object.values(OrderStatus).map(status => (
                    <button 
                      key={status}
                      disabled={order.orderStatus === status || updating}
                      onClick={() => handleUpdateStatus(status)}
                      className={`py-3 rounded-xl font-black uppercase text-[9px] tracking-widest transition-soft active:scale-95 border ${order.orderStatus === status ? 'bg-amber-600 text-white border-amber-600 opacity-50 cursor-not-allowed' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700 hover:border-amber-600 dark:hover:border-amber-500'}`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
                <textarea 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-4 text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 text-xs outline-none focus:border-amber-500 h-24 resize-none transition-colors"
                  placeholder={t.statusNotePlaceholder}
                />
              </section>
            )}

            <section className="bg-white dark:bg-slate-900/60 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm animate-entry stagger-3">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8">{t.orderSpecifics}</h3>
              <div className="space-y-6">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">{t.identity}</span>
                  <span className="font-black text-slate-900 dark:text-white text-lg tracking-tight hover:text-amber-600 cursor-pointer" onClick={() => navigate(`/customer/${order.customerPhone}`)}>{order.customerName}</span>
                  <span className="text-amber-600 font-bold text-sm">{order.customerPhone}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">{t.logistics}</span>
                  <span className="text-slate-500 dark:text-slate-400 text-xs font-bold leading-relaxed">{order.customerAddress || 'No address provided'}</span>
                </div>
                <div className="pt-6 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{t.payment}</span>
                  <span className={`px-3 py-1 rounded-lg font-black text-[9px] uppercase tracking-widest ${order.paymentStatus === PaymentStatus.PAID ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>{order.paymentStatus}</span>
                </div>
              </div>
            </section>

            {user.role === 'admin' && (
              <button 
                onClick={() => { if(window.confirm(t.confirmDelete)) { deleteOrder(order.id); navigate('/'); } }}
                className="w-full py-5 rounded-2xl bg-rose-50 dark:bg-rose-900/20 text-rose-500 font-black uppercase text-[10px] tracking-[0.3em] hover:bg-rose-500 hover:text-white transition-soft shadow-sm"
              >
                <i className="fas fa-trash-alt mr-3"></i> {t.delete}
              </button>
            )}
          </div>
        </div>
      </div>
      {previewImg && <ImagePreviewModal imageUrl={previewImg} onClose={() => setPreviewImg(null)} lang={lang} />}
    </>
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
      let all: Order[] = [];
      if (user.role === 'admin' || user.role === 'staff' || user.role === 'viewer') {
        all = getOrders();
      } else if (user.role === 'customer') {
        all = getOrdersByPhoneAndPin(user.username, user.pin);
      }
      
      const sorted = all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      if (prevOrderCountRef.current > 0 && sorted.length > prevOrderCountRef.current) {
        setHasNewOrder(true);
      }
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

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(search.toLowerCase()) || 
    o.customerName.toLowerCase().includes(search.toLowerCase())
  );

  const canCreate = user.role === 'admin' || user.role === 'staff';

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-fade" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="mb-12 flex flex-col md:flex-row justify-between items-end gap-8 animate-entry">
        <div className="flex-1">
          <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-3">{t.welcome}, {user.name.split(' ')[0]}</h2>
          <div className="flex items-center gap-4 text-slate-400 font-bold uppercase text-[9px] tracking-[0.4em]">
            <div className="w-10 h-1 bg-amber-600 rounded-full"></div> <span>{user.role === 'customer' ? t.profile : t.dashboard}</span>
          </div>
        </div>
        
        {user.role === 'customer' && (
          <div className="w-full md:w-auto flex items-center gap-6 p-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-[2rem] shadow-sm animate-entry transition-colors">
            <div className="w-12 h-12 bg-amber-600 text-white rounded-xl flex items-center justify-center text-xl shadow-lg">
              <i className="fas fa-gem"></i>
            </div>
            <div>
              <span className="text-[8px] font-black text-amber-600 uppercase tracking-[0.3em] mb-1 block">{t.loyaltyLevel}</span>
              <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{stats.level}</span>
            </div>
          </div>
        )}

        {canCreate && (
          <button onClick={() => setShowCreate(true)} className="w-full md:w-auto bg-slate-900 dark:bg-amber-500 text-white dark:text-black px-10 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm hover:bg-amber-600 transition-soft shadow-2xl shadow-amber-900/20 active:scale-95 flex items-center justify-center gap-4">
            <i className="fas fa-plus text-xs"></i> {t.newOrder}
          </button>
        )}
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 animate-entry stagger-1">
        <StatCard to="/filtered/range/total" label={user.role === 'customer' ? t.ordersCount : t.totalOrders} value={stats.total} icon="fa-scroll" color="text-slate-900 dark:text-amber-500" showBadge={hasNewOrder} badgeLabel={t.newActivity} />
        <StatCard to="/filtered/status/pending" label={t.activeProcessing} value={stats.pending} icon="fa-spa" color="text-amber-600" />
        <StatCard to="/filtered/status/Completed" label={t.completed} value={stats.completed} icon="fa-circle-check" color="text-emerald-600" />
        <StatCard label={user.role === 'customer' ? t.lifetimeSpent : t.totalValue} value={`${stats.revenue.toFixed(2)} ${t.currency}`} icon="fa-vault" color="text-amber-600" />
      </div>

      <div className="bg-white dark:bg-slate-900/60 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden animate-entry stagger-2 transition-colors">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-6">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">{user.role === 'customer' ? t.viewAllOrders : t.recentOrders}</h3>
          {user.role !== 'customer' && (
            <div className="relative w-full sm:w-96 group">
              <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors"></i>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.searchPlaceholder} className="w-full pl-12 pr-6 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-amber-500/20 transition-all dark:text-white" />
            </div>
          )}
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead className="text-slate-300 text-[9px] font-black uppercase tracking-[0.4em] border-b border-slate-50 dark:border-slate-800">
              <tr>
                <th className="px-8 py-6">{t.garment}</th>
                {user.role !== 'customer' && <th className="px-8 py-6">{t.identity}</th>}
                <th className="px-8 py-6">{t.financials}</th>
                <th className="px-8 py-6">{t.lifecycle}</th>
                <th className={`px-8 py-6 ${lang === 'ar' ? 'text-left' : 'text-right'}`}>{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredOrders.length === 0 ? (
                <tr><td colSpan={user.role === 'customer' ? 4 : 5} className="px-8 py-32 text-center"><p className="font-black text-xl tracking-tighter opacity-20 uppercase tracking-[0.2em] text-slate-400">{t.noOrders}</p></td></tr>
              ) : (
                filteredOrders.map((order, i) => {
                  const firstImg = order.items.find(it => it.imageUrl)?.imageUrl;
                  return (
                    <tr key={order.id} className="group hover:bg-amber-50/20 dark:hover:bg-amber-900/10 transition-soft cursor-pointer animate-entry" style={{ animationDelay: `${i * 0.05}s` }} onClick={() => navigate(`/order/${order.id}`)}>
                      <td className="px-8 py-8">
                        <div 
                          onClick={(e) => { e.stopPropagation(); firstImg && setPreviewImg(firstImg); }}
                          className={`w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm transition-soft ${firstImg ? 'hover:scale-110 cursor-zoom-in' : ''}`}
                        >
                          {firstImg ? <img src={firstImg} className="w-full h-full object-cover" alt={order.id} /> : <i className="fas fa-spa text-slate-300 dark:text-slate-600"></i>}
                        </div>
                      </td>
                      {user.role !== 'customer' && (
                        <td className="px-8 py-8">
                          <div className="flex items-center gap-6">
                            <div className="w-10 h-10 bg-slate-900 dark:bg-amber-500 text-white dark:text-black rounded-lg flex items-center justify-center font-black text-[10px] group-hover:scale-110 transition-soft shadow-md">{order.id.slice(-2)}</div>
                            <div>
                              <div className="font-black text-slate-900 dark:text-white text-lg tracking-tighter group-hover:text-amber-600 transition-colors">{order.id}</div>
                              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{order.customerName}</div>
                            </div>
                          </div>
                        </td>
                      )}
                      <td className="px-8 py-8">
                        <div className="flex flex-col">
                          <span className={`text-[7px] font-black px-2 py-0.5 rounded-md w-fit mb-2 shadow-sm uppercase tracking-widest ${order.paymentStatus === PaymentStatus.PAID ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>{order.paymentStatus}</span>
                          <span className="font-black text-slate-900 dark:text-white text-base tracking-tighter">{order.totalAmount.toFixed(2)} {t.currency}</span>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                         <div title={order.orderStatus}>
                            <StatusBadge status={order.orderStatus} />
                         </div>
                      </td>
                      <td className={`px-8 py-8 ${lang === 'ar' ? 'text-left' : 'text-right'}`}>
                         <div className="flex items-center justify-end gap-3">
                           <i className={`fas ${lang === 'ar' ? 'fa-chevron-left' : 'fa-chevron-right'} text-slate-200 group-hover:text-amber-600 group-hover:translate-x-1 transition-soft`}></i>
                         </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {showCreate && <CreateOrderModal user={user} lang={lang} onClose={() => setShowCreate(false)} />}
      {previewImg && <ImagePreviewModal imageUrl={previewImg} onClose={() => setPreviewImg(null)} lang={lang} />}
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('zs_session_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [lang, setLang] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('zs_theme');
    return (saved as Theme) || 'dark';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.body.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('zs_theme', theme);
  }, [theme]);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('zs_session_user', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('zs_session_user');
  };

  return (
    <Router>
      <div className={`min-h-screen transition-colors duration-500 ${theme === 'dark' ? 'dark bg-black text-white' : 'bg-slate-50 text-slate-900'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        {user && <Navigation user={user} onLogout={handleLogout} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} />}
        <Routes>
          <Route path="/track/:id" element={<TrackingPage lang={lang} />} />
          <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage onLogin={handleLogin} lang={lang} setLang={setLang} theme={theme} />} />
          <Route path="/" element={user ? <Dashboard user={user} lang={lang} /> : <Navigate to="/login" />} />
          <Route path="/customers" element={user && (user.role === 'admin' || user.role === 'staff' || user.role === 'viewer') ? <CustomerListPage user={user} lang={lang} /> : <Navigate to="/login" />} />
          <Route path="/customer/:phone" element={user && (user.role === 'admin' || user.role === 'staff' || user.role === 'viewer') ? <CustomerProfilePage user={user} lang={lang} /> : <Navigate to="/login" />} />
          <Route path="/settings" element={user && user.role === 'admin' ? <SettingsPage user={user} lang={lang} /> : <Navigate to="/login" />} />
          <Route path="/filtered/:type/:value" element={user ? <FilteredOrdersPage user={user} lang={lang} /> : <Navigate to="/login" />} />
          <Route path="/order/:id" element={user ? <OrderDetailsPage user={user} lang={lang} /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
