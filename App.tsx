
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { Order, OrderStatus, User, PaymentStatus, OrderItem, AdminLogEntry, Language, Theme, AdditionalFees } from './types';
import { 
  getOrders, saveOrder, deleteOrder, getOrderById, 
  getAdminLogs, saveAdminLog, getUsers, saveUser, 
  deleteUser, authenticateUser, isUsernameUnique, 
  getUniqueCustomers, getOrdersByPhoneAndPin,
  getVatRate, saveVatRate
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
    unpaid: 'Unpaid Orders',
    paid: 'Paid Orders',
    delivery: 'Delivery Fee',
    alteration: 'Alteration Fee',
    cutting: 'Cutting Fee',
    invoice: 'Invoice',
    print: 'Print Invoice',
    share: 'Share Invoice',
    subtotal: 'Subtotal',
    additionalFees: 'Additional Fees',
    date: 'Date',
    time: 'Time',
    boutique: 'Zahrat Al Sawsen Boutique',
    uploadImage: 'Upload Photo',
    paymentStatus: 'Payment Status',
    markAsPaid: 'Mark as Paid',
    markAsUnpaid: 'Mark as Unpaid',
    vatSetup: 'VAT Configuration',
    vatLabel: 'VAT Percentage (%)',
    vatAmount: 'VAT Amount',
    editMode: 'Enable Editing',
    saveChanges: 'Save Changes',
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
    unpaid: 'طلبات غير مدفوعة',
    paid: 'طلبات مدفوعة',
    delivery: 'رسوم التوصيل',
    alteration: 'رسوم التعديل',
    cutting: 'رسوم القص',
    invoice: 'الفاتورة',
    print: 'طباعة الفاتورة',
    share: 'مشاركة الفاتورة',
    subtotal: 'المجموع الفرعي',
    additionalFees: 'رسوم إضافية',
    date: 'التاريخ',
    time: 'الوقت',
    boutique: 'زهرة السوسن بوتيك',
    uploadImage: 'رفع صورة',
    paymentStatus: 'حالة الدفع',
    markAsPaid: 'تحديد كمدفوع',
    markAsUnpaid: 'تحديد كغير مدفوع',
    vatSetup: 'إعداد الضريبة (VAT)',
    vatLabel: 'نسبة الضريبة (%)',
    vatAmount: 'مبلغ الضريبة',
    editMode: 'تفعيل التعديل',
    saveChanges: 'حفظ التغييرات',
  }
};

// --- SHARED UI COMPONENTS ---

const InvoicePage: React.FC<{ user: User; lang: Language }> = ({ user, lang }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const t = translations[lang];
  const [order, setOrder] = useState<Order | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);
  const [editedOrder, setEditedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const o = getOrderById(id || '');
    setOrder(o);
    if (o) setEditedOrder(JSON.parse(JSON.stringify(o)));
  }, [id]);

  if (!order || !editedOrder) return <div className="p-20 text-center font-black">{t.noOrders}</div>;

  const subtotal = editedOrder.items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const fees = editedOrder.additionalFees || { delivery: 0, alteration: 0, cutting: 0 };
  const createdAt = new Date(editedOrder.createdAt);

  // Real-time calculation helper
  const calculateTotals = (o: Order) => {
    const st = o.items.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const f = o.additionalFees || { delivery: 0, alteration: 0, cutting: 0 };
    const feeSum = f.delivery + f.alteration + f.cutting;
    const vat = (st + feeSum) * (o.vatRate / 100);
    o.vatAmount = vat;
    o.totalAmount = st + feeSum + vat;
  };

  const updateItem = (itemId: string, field: string, val: any) => {
    const next = { ...editedOrder };
    const idx = next.items.findIndex(it => it.id === itemId);
    if (idx >= 0) {
      (next.items[idx] as any)[field] = val;
      calculateTotals(next);
      setEditedOrder(next);
    }
  };

  const updateFee = (field: keyof AdditionalFees, val: number) => {
    const next = { ...editedOrder };
    if (!next.additionalFees) next.additionalFees = { delivery: 0, alteration: 0, cutting: 0 };
    next.additionalFees[field] = val;
    calculateTotals(next);
    setEditedOrder(next);
  };

  const handleSaveChanges = () => {
    saveOrder(editedOrder);
    setOrder(JSON.parse(JSON.stringify(editedOrder)));
    setIsEditing(false);
    saveAdminLog({ 
      id: Date.now().toString(), 
      timestamp: new Date().toISOString(), 
      adminName: user.name, 
      action: 'EDIT_INVOICE', 
      details: `Manually edited invoice ${editedOrder.id}`, 
      orderId: editedOrder.id 
    });
  };

  const handleShare = async () => {
    const text = `Invoice for ${order.customerName}\nOrder ID: ${order.id}\nTotal: ${order.totalAmount.toFixed(3)} OMR\nStatus: ${order.orderStatus}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Invoice Share', text, url: window.location.href });
      } catch (err) { console.error(err); }
    } else {
      alert('Sharing not supported on this browser. Please copy the URL.');
    }
  };

  const canEdit = user.role === 'admin' || user.role === 'staff';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black p-4 md:p-8 flex flex-col items-center print:bg-white print:p-0" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {canEdit && !isEditing && (
        <button onClick={() => setIsEditing(true)} className="mb-6 px-8 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest text-amber-600 hover:bg-amber-600 hover:text-black transition-soft print:hidden">
          <i className="fas fa-edit mr-2"></i> {t.editMode}
        </button>
      )}

      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-white/5 print:shadow-none print:border-none print:rounded-none animate-fade">
        <div className="p-10 border-b border-slate-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-amber-600 rounded-3xl flex items-center justify-center shadow-lg">
              <i className="fas fa-spa text-black text-2xl"></i>
            </div>
            <div>
              <h1 className="text-2xl font-black dark:text-white tracking-tighter">{t.boutique}</h1>
              <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.4em]">{t.invoice}</p>
            </div>
          </div>
          <div className="text-left md:text-right space-y-1">
            <div className="text-2xl font-black text-amber-600 tracking-widest">{order.id}</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.date}: {createdAt.toLocaleDateString(lang === 'ar' ? 'ar-OM' : 'en-OM')}</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.time}: {createdAt.toLocaleTimeString(lang === 'ar' ? 'ar-OM' : 'en-OM')}</div>
          </div>
        </div>

        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h3 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-4">{t.customerInfo}</h3>
            {isEditing ? (
              <div className="space-y-2">
                <input type="text" value={editedOrder.customerName} onChange={e => setEditedOrder({ ...editedOrder, customerName: e.target.value })} className="w-full bg-slate-50 dark:bg-black p-2 rounded-lg border border-slate-200 dark:border-white/10 dark:text-white text-sm" />
                <input type="text" value={editedOrder.customerPhone} onChange={e => setEditedOrder({ ...editedOrder, customerPhone: e.target.value })} className="w-full bg-slate-50 dark:bg-black p-2 rounded-lg border border-slate-200 dark:border-white/10 dark:text-white text-sm" />
                <textarea value={editedOrder.customerAddress} onChange={e => setEditedOrder({ ...editedOrder, customerAddress: e.target.value })} className="w-full bg-slate-50 dark:bg-black p-2 rounded-lg border border-slate-200 dark:border-white/10 dark:text-white text-xs h-16" />
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-lg font-black dark:text-white">{order.customerName}</p>
                <p className="font-bold text-slate-500">{order.customerPhone}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{order.customerAddress}</p>
              </div>
            )}
          </div>
          <div className="md:text-right">
            <h3 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-4">{t.lifecycle}</h3>
            <StatusBadge status={order.orderStatus} />
            <p className={`mt-4 text-[10px] font-black uppercase ${order.paymentStatus === PaymentStatus.PAID ? 'text-emerald-500' : 'text-rose-500'}`}>{order.paymentStatus}</p>
          </div>
        </div>

        <div className="p-10">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-50 dark:border-white/5">
                <th className="pb-4">{t.garment}</th>
                <th className="pb-4 text-center">Qty</th>
                <th className="pb-4 text-right">{t.price}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
              {(isEditing ? editedOrder : order).items.map((it) => (
                <tr key={it.id} className="text-sm">
                  <td className="py-6 font-black dark:text-white">
                    {isEditing ? (
                      <input type="text" value={it.itemName} onChange={e => updateItem(it.id, 'itemName', e.target.value)} className="bg-transparent border-b border-amber-600/30 outline-none w-full" />
                    ) : it.itemName}
                  </td>
                  <td className="py-6 text-center font-bold dark:text-slate-400">
                    {isEditing ? (
                      <input type="number" value={it.quantity} onChange={e => updateItem(it.id, 'quantity', parseInt(e.target.value))} className="bg-transparent border-b border-amber-600/30 outline-none w-12 text-center" />
                    ) : it.quantity}
                  </td>
                  <td className="py-6 text-right font-black text-slate-900 dark:text-white">
                    {isEditing ? (
                      <input type="number" step="0.001" value={it.price} onChange={e => updateItem(it.id, 'price', parseFloat(e.target.value))} className="bg-transparent border-b border-amber-600/30 outline-none w-20 text-right" />
                    ) : (it.price * it.quantity).toFixed(3)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-10 border-t border-slate-100 dark:border-white/5 pt-10 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-slate-500">
              <span>{t.subtotal}</span>
              <span>{subtotal.toFixed(3)} {t.currency}</span>
            </div>
            
            <div className="flex justify-between items-center text-xs font-bold text-slate-500">
              <span>{t.delivery}</span>
              {isEditing ? (
                 <input type="number" step="0.001" value={fees.delivery} onChange={e => updateFee('delivery', parseFloat(e.target.value))} className="bg-transparent border-b border-amber-600/30 outline-none w-20 text-right" />
              ) : <span>{fees.delivery.toFixed(3)} {t.currency}</span>}
            </div>

            <div className="flex justify-between items-center text-xs font-bold text-slate-500">
              <span>{t.alteration}</span>
              {isEditing ? (
                 <input type="number" step="0.001" value={fees.alteration} onChange={e => updateFee('alteration', parseFloat(e.target.value))} className="bg-transparent border-b border-amber-600/30 outline-none w-20 text-right" />
              ) : <span>{fees.alteration.toFixed(3)} {t.currency}</span>}
            </div>

            <div className="flex justify-between items-center text-xs font-bold text-slate-500">
              <span>{t.cutting}</span>
              {isEditing ? (
                 <input type="number" step="0.001" value={fees.cutting} onChange={e => updateFee('cutting', parseFloat(e.target.value))} className="bg-transparent border-b border-amber-600/30 outline-none w-20 text-right" />
              ) : <span>{fees.cutting.toFixed(3)} {t.currency}</span>}
            </div>

            <div className="flex justify-between items-center text-xs font-bold text-amber-600">
              <span>{t.vatAmount} ({(isEditing ? editedOrder : order).vatRate}%)</span>
              <span>{(isEditing ? editedOrder : order).vatAmount.toFixed(3)} {t.currency}</span>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-slate-50 dark:border-white/5">
              <span className="text-lg font-black dark:text-white tracking-tighter uppercase">{t.grandTotal}</span>
              <span className="text-3xl font-black text-amber-600">{(isEditing ? editedOrder : order).totalAmount.toFixed(3)} {t.currency}</span>
            </div>
          </div>
        </div>

        <div className="p-10 bg-slate-50 dark:bg-white/5 flex gap-4 print:hidden">
          {isEditing ? (
            <>
              <button onClick={handleSaveChanges} className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase text-xs shadow-xl transition-soft">
                <i className="fas fa-check mr-2"></i> {t.saveChanges}
              </button>
              <button onClick={() => { setEditedOrder(JSON.parse(JSON.stringify(order))); setIsEditing(false); }} className="px-8 bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-white py-4 rounded-2xl font-black uppercase text-xs transition-soft">
                {t.cancel}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => window.print()} className="flex-1 bg-slate-900 dark:bg-amber-600 text-white dark:text-black py-4 rounded-2xl font-black uppercase text-xs shadow-xl transition-soft">
                <i className="fas fa-print mr-2"></i> {t.print}
              </button>
              <button onClick={handleShare} className="flex-1 bg-amber-600 text-black py-4 rounded-2xl font-black uppercase text-xs shadow-xl transition-soft">
                <i className="fas fa-share-alt mr-2"></i> {t.share}
              </button>
              <button onClick={() => navigate(-1)} className="px-8 bg-white dark:bg-white/5 text-slate-500 dark:text-white py-4 rounded-2xl font-black uppercase text-xs transition-soft">
                {t.cancel}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

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
    <nav className="bg-white/90 dark:bg-black/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 sticky top-0 z-40 h-20 md:h-24 flex items-center shadow-sm transition-all duration-500 print:hidden">
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
    <footer className="w-full py-12 px-6 border-t border-slate-100 dark:border-white/5 mt-auto print:hidden">
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
  const currentVatRate = useMemo(() => getVatRate(), []);
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerPin, setCustomerPin] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemImage, setNewItemImage] = useState<string | null>(null);
  const [deliveryFee, setDeliveryFee] = useState('0');
  const [alterationFee, setAlterationFee] = useState('0');
  const [cuttingFee, setCuttingFee] = useState('0');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(PaymentStatus.UNPAID);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewItemImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addItem = () => {
    if (newItemName && newItemPrice) {
      setItems([...items, { 
        id: Date.now().toString(), 
        itemName: newItemName, 
        price: parseFloat(newItemPrice), 
        quantity: 1,
        imageUrl: newItemImage || undefined 
      }]);
      setNewItemName('');
      setNewItemPrice('');
      setNewItemImage(null);
    }
  };

  // Real-time breakdown
  const totals = useMemo(() => {
    const sub = items.reduce((acc, it) => acc + it.price * it.quantity, 0);
    const feeTotal = (parseFloat(deliveryFee) || 0) + (parseFloat(alterationFee) || 0) + (parseFloat(cuttingFee) || 0);
    const vatAmt = (sub + feeTotal) * (currentVatRate / 100);
    const total = sub + feeTotal + vatAmt;
    return { sub, feeTotal, vatAmt, total };
  }, [items, deliveryFee, alterationFee, cuttingFee, currentVatRate]);

  const handleSave = async () => {
    if (!customerName || !customerPhone || items.length === 0) return;
    setLoading(true);
    const id = await generateOrderId();
    
    const fees = {
      delivery: parseFloat(deliveryFee) || 0,
      alteration: parseFloat(alterationFee) || 0,
      cutting: parseFloat(cuttingFee) || 0,
    };

    const newOrder: Order = {
      id,
      customerName,
      customerPhone,
      customerPin: customerPin || '1234',
      customerAddress,
      items,
      totalAmount: totals.total,
      vatRate: currentVatRate,
      vatAmount: totals.vatAmt,
      additionalFees: fees,
      paymentStatus: paymentStatus,
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
        <div className="p-8 max-h-[70vh] overflow-y-auto space-y-8 no-scrollbar">
          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-amber-600 uppercase tracking-widest">{t.customerInfo}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder={t.name} value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 dark:text-white outline-none" />
              <input type="text" placeholder={t.phone} value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 dark:text-white outline-none" />
              <input type="text" placeholder={t.pinPlaceholder} value={customerPin} onChange={e => setCustomerPin(e.target.value)} className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 dark:text-white outline-none" maxLength={4} />
              <input type="text" placeholder={t.address} value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 dark:text-white outline-none" />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-amber-600 uppercase tracking-widest">{t.manifest}</h3>
            <div className="flex flex-col gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
              <div className="flex gap-2">
                <input type="text" placeholder={t.itemName} value={newItemName} onChange={e => setNewItemName(e.target.value)} className="flex-1 px-5 py-3 rounded-xl bg-white dark:bg-black border border-slate-100 dark:border-white/10 dark:text-white outline-none" />
                <input type="number" placeholder={t.price} value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} className="w-24 px-5 py-3 rounded-xl bg-white dark:bg-black border border-slate-100 dark:border-white/10 dark:text-white outline-none" />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-black border border-dashed border-slate-300 dark:border-white/20 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-amber-500 transition-soft">
                    <i className="fas fa-camera"></i> {t.uploadImage}
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                {newItemImage && <div className="w-12 h-12 rounded-xl overflow-hidden border border-amber-500 shrink-0"><img src={newItemImage} className="w-full h-full object-cover" /></div>}
                <button onClick={addItem} className="px-8 bg-slate-900 dark:bg-amber-600 text-white dark:text-black rounded-xl font-black uppercase text-[10px] h-11"><i className="fas fa-plus"></i></button>
              </div>
            </div>
            <div className="space-y-2">
              {items.map(it => (
                <div key={it.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10">
                  <div className="flex items-center gap-3">
                    {it.imageUrl && <img src={it.imageUrl} className="w-10 h-10 rounded-lg object-cover" />}
                    <span className="font-bold dark:text-white">{it.itemName}</span>
                  </div>
                  <span className="font-black text-amber-600">{it.price.toFixed(3)} {t.currency}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-amber-600 uppercase tracking-widest">{t.additionalFees}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input type="number" step="0.001" placeholder={t.delivery} value={deliveryFee} onChange={e => setDeliveryFee(e.target.value)} className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 dark:text-white outline-none" />
              <input type="number" step="0.001" placeholder={t.alteration} value={alterationFee} onChange={e => setAlterationFee(e.target.value)} className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 dark:text-white outline-none" />
              <input type="number" step="0.001" placeholder={t.cutting} value={cuttingFee} onChange={e => setCuttingFee(e.target.value)} className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 dark:text-white outline-none" />
            </div>
          </section>

          <div className="p-6 bg-slate-900 rounded-3xl space-y-2">
             <div className="flex justify-between text-[10px] font-black uppercase text-slate-400"><span>{t.subtotal} + Fees</span><span>{(totals.sub + totals.feeTotal).toFixed(3)}</span></div>
             <div className="flex justify-between text-[10px] font-black uppercase text-amber-500"><span>{t.vatAmount} ({currentVatRate}%)</span><span>{totals.vatAmt.toFixed(3)}</span></div>
             <div className="flex justify-between text-lg font-black text-white pt-2 border-t border-white/10"><span>{t.grandTotal}</span><span>{totals.total.toFixed(3)} {t.currency}</span></div>
          </div>
        </div>
        <div className="p-8 border-t border-slate-100 dark:border-white/5 flex gap-4">
          <button disabled={loading} onClick={handleSave} className="flex-1 bg-amber-600 text-black py-4 rounded-2xl font-black uppercase text-xs shadow-xl active:scale-95 transition-soft">
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
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-black relative overflow-hidden perspective-1000" dir={lang === 'ar' ? 'rtl' : 'ltr'} onMouseMove={handleMouseMove} onMouseLeave={() => setTilt({ x: 0, y: 0 })}>
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-amber-600/10 rounded-full blur-[120px] animate-pulse pointer-events-none"></div>
      
      <div className="flex-1 flex items-center justify-center p-6">
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
      <Footer lang={lang} />
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
    const unpaid = orders.filter(o => o.paymentStatus === PaymentStatus.UNPAID).length;
    return { revenue, pending, completed, total: orders.length, unpaid };
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
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
        <StatCard label={t.volume} value={stats.total} icon="fa-scroll" color="text-amber-600" to="/filtered/analytics/volume" />
        <StatCard label={t.pending} value={stats.pending} icon="fa-spa" color="text-amber-600" to="/filtered/analytics/pending" />
        <StatCard label={t.completed} value={stats.completed} icon="fa-circle-check" color="text-emerald-600" to="/filtered/analytics/completed" />
        <StatCard label={t.unpaid} value={stats.unpaid} icon="fa-hand-holding-dollar" color="text-rose-600" to="/filtered/analytics/unpaid" />
        <StatCard label={t.revenue} value={`${stats.revenue.toFixed(3)} ${t.currency}`} icon="fa-vault" color="text-amber-600" to="/filtered/analytics/revenue" />
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

const SettingsPage: React.FC<{ user: User; lang: Language }> = ({ user, lang }) => {
  const t = translations[lang];
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<AdminLogEntry[]>([]);
  const [vat, setVat] = useState(getVatRate().toString());
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'staff' | 'viewer'>('staff');

  useEffect(() => {
    setUsers(getUsers());
    setLogs(getAdminLogs());
  }, []);

  const handleVatSave = () => {
    saveVatRate(parseFloat(vat) || 0);
    alert('VAT Rate Saved');
  };

  const handleAddUser = () => {
    if (!newUsername || !newPin || !newName) return;
    const u: User = { id: Date.now().toString(), name: newName, username: newUsername, pin: newPin, role: newRole as any, createdAt: new Date().toISOString() };
    if (saveUser(u)) { setUsers(getUsers()); setShowAddUser(false); setNewUsername(''); setNewName(''); setNewPin(''); }
    else alert('Username must be unique');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 animate-fade" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-12 italic">{t.settings}</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <section className="bg-white dark:bg-white/[0.02] p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 space-y-8 animate-entry">
          <div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6">{t.vatSetup}</h3>
            <div className="flex gap-4">
              <input type="number" step="0.1" value={vat} onChange={e => setVat(e.target.value)} className="flex-1 bg-slate-50 dark:bg-black p-3 rounded-xl border border-slate-200 dark:border-white/10 dark:text-white outline-none" placeholder={t.vatLabel} />
              <button onClick={handleVatSave} className="px-8 bg-amber-600 text-black rounded-xl font-black uppercase text-[10px]">{t.save}</button>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">{t.userManagement}</h3>
              <button onClick={() => setShowAddUser(true)} className="w-10 h-10 bg-amber-600 text-black rounded-xl flex items-center justify-center"><i className="fas fa-plus"></i></button>
            </div>
            {showAddUser && (
              <div className="mb-8 p-6 bg-slate-50 dark:bg-white/5 rounded-2xl space-y-4">
                <input type="text" placeholder={t.name} value={newName} onChange={e => setNewName(e.target.value)} className="w-full p-3 rounded-xl bg-white dark:bg-black border border-slate-100 dark:border-white/10 dark:text-white outline-none" />
                <input type="text" placeholder={t.username} value={newUsername} onChange={e => setNewUsername(e.target.value)} className="w-full p-3 rounded-xl bg-white dark:bg-black border border-slate-100 dark:border-white/10 dark:text-white outline-none" />
                <input type="text" placeholder={t.pin} value={newPin} onChange={e => setNewPin(e.target.value)} className="w-full p-3 rounded-xl bg-white dark:bg-black border border-slate-100 dark:border-white/10 dark:text-white outline-none" />
                <select value={newRole} onChange={e => setNewRole(e.target.value as any)} className="w-full p-3 rounded-xl bg-white dark:bg-black border border-slate-100 dark:border-white/10 dark:text-white outline-none">
                  <option value="staff">Staff</option><option value="admin">Admin</option><option value="viewer">Viewer</option>
                </select>
                <div className="flex gap-2">
                  <button onClick={handleAddUser} className="flex-1 bg-slate-900 dark:bg-amber-600 text-white dark:text-black py-3 rounded-xl font-black text-[10px] uppercase">{t.save}</button>
                  <button onClick={() => setShowAddUser(false)} className="px-6 bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-white py-3 rounded-xl font-black text-[10px] uppercase">{t.cancel}</button>
                </div>
              </div>
            )}
            <div className="space-y-4">
              {users.map(u => (
                <div key={u.id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                  <div>
                    <div className="font-black dark:text-white">{u.name} <span className="text-[8px] text-amber-600 ml-2 uppercase tracking-widest">{u.role}</span></div>
                    <div className="text-[10px] text-slate-400">@{u.username}</div>
                  </div>
                  {u.role !== 'admin' && <button onClick={() => { if(window.confirm('Delete?')) deleteUser(u.id); setUsers(getUsers()); }} className="text-rose-500"><i className="fas fa-trash"></i></button>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-white/[0.02] p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 animate-entry stagger-1">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8">{t.adminLogs}</h3>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar no-scrollbar">
            {logs.map(log => (
              <div key={log.id} className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-amber-600 font-black text-[8px] uppercase tracking-widest">{log.action}</span>
                  <span className="text-slate-400 text-[8px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-[10px] font-bold dark:text-white">{log.details}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

// ... Rest of components (FilteredOrdersPage, OrderDetailsPage, etc.) remain largely same as before but ensuring they handle the updated Order types.
// Included OrderDetailsPage update here for complete functionality
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

  const togglePaymentStatus = () => {
    if (!order) return;
    const nextStatus = order.paymentStatus === PaymentStatus.PAID ? PaymentStatus.UNPAID : PaymentStatus.PAID;
    const updated: Order = {
      ...order,
      paymentStatus: nextStatus,
      history: [{ status: order.orderStatus, timestamp: new Date().toISOString(), updatedBy: user.name, note: `Payment status updated to ${nextStatus}` }, ...order.history]
    };
    saveOrder(updated);
    setOrder(updated);
  };

  if (!order) return <div className="p-20 text-center font-black text-slate-400 uppercase">{t.noOrders}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12 animate-fade" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <button onClick={() => navigate(-1)} className="px-5 py-3 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl font-black text-[9px] uppercase tracking-widest text-slate-400 hover:text-amber-500 transition-soft">
           <i className={`fas ${lang === 'ar' ? 'fa-chevron-right' : 'fa-chevron-left'} mr-2`}></i> {t.backToDashboard}
        </button>
        <div className="flex gap-2">
          <Link to={`/invoice/${order.id}`} className="px-5 py-3 bg-slate-900 dark:bg-amber-600 text-white dark:text-black rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-lg hover:scale-105 transition-soft">
             <i className="fas fa-file-invoice mr-2"></i> {t.invoice}
          </Link>
          <StatusBadge status={order.orderStatus} />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <section className="bg-slate-900 dark:bg-amber-600 p-8 rounded-[2.5rem] shadow-2xl text-center md:text-left flex items-center gap-8 group animate-entry">
            <div className="w-20 h-20 bg-amber-600 dark:bg-black rounded-3xl flex items-center justify-center shrink-0 shadow-xl"><i className="fas fa-robot text-white dark:text-amber-500 text-3xl"></i></div>
            <div className="flex-1">
               <h3 className="text-[10px] font-black text-amber-400 dark:text-black/60 uppercase tracking-[0.4em] mb-2">{t.neuralInsight}</h3>
               <p className="text-white dark:text-black text-xl font-black italic">"{advice || 'Consulting database...'}"</p>
            </div>
          </section>

          <section className="bg-white dark:bg-white/[0.02] p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 animate-entry stagger-1">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8">{t.manifest}</h3>
             <div className="space-y-4">
               {order.items.map(it => (
                 <div key={it.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                    <div className="flex items-center gap-4">
                       <div onClick={() => it.imageUrl && setPreviewImg(it.imageUrl)} className="w-12 h-12 bg-white dark:bg-black rounded-xl overflow-hidden flex items-center justify-center cursor-zoom-in group">
                          {it.imageUrl ? <img src={it.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-soft" /> : <i className="fas fa-spa text-slate-300"></i>}
                       </div>
                       <span className="font-black text-slate-900 dark:text-white">{it.itemName}</span>
                    </div>
                    <span className="font-black text-amber-600">{it.price.toFixed(3)} {t.currency}</span>
                 </div>
               ))}
               <div className="mt-6 pt-6 border-t border-slate-50 dark:border-white/5 space-y-2">
                 {order.additionalFees?.delivery! > 0 && <div className="flex justify-between text-xs text-slate-400"><span>{t.delivery}</span><span>{order.additionalFees?.delivery.toFixed(3)}</span></div>}
                 {order.additionalFees?.alteration! > 0 && <div className="flex justify-between text-xs text-slate-400"><span>{t.alteration}</span><span>{order.additionalFees?.alteration.toFixed(3)}</span></div>}
                 {order.additionalFees?.cutting! > 0 && <div className="flex justify-between text-xs text-slate-400"><span>{t.cutting}</span><span>{order.additionalFees?.cutting.toFixed(3)}</span></div>}
                 <div className="flex justify-between text-xs text-amber-600 font-bold"><span>VAT ({order.vatRate}%)</span><span>{order.vatAmount.toFixed(3)}</span></div>
               </div>
             </div>
             <div className="mt-8 pt-8 border-t border-slate-50 dark:border-white/5 flex justify-between items-center">
                <span className="font-black text-2xl tracking-tighter dark:text-white">{t.grandTotal}</span>
                <div className="text-right">
                  <span className="font-black text-3xl text-amber-600 block">{order.totalAmount.toFixed(3)} {t.currency}</span>
                  <button onClick={togglePaymentStatus} className={`mt-2 text-[8px] font-black uppercase px-3 py-1 rounded-full border transition-soft ${order.paymentStatus === PaymentStatus.PAID ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>{order.paymentStatus === PaymentStatus.PAID ? t.markAsUnpaid : t.markAsPaid}</button>
                </div>
             </div>
          </section>

          <section className="bg-white dark:bg-white/[0.02] p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 animate-entry stagger-2">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10">{t.history}</h3>
             <div className="relative space-y-8 pl-6 border-l-2 border-slate-100 dark:border-white/5">
                {order.history.map((entry, idx) => (
                  <div key={idx} className="relative group">
                    <div className={`absolute -left-[33px] top-0 w-4 h-4 rounded-full border-4 border-white dark:border-black transition-colors ${idx === 0 ? 'bg-amber-600 scale-125' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                    <div className="bg-slate-50 dark:bg-white/5 p-5 rounded-2xl border border-transparent hover:border-amber-500/20 transition-soft">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <span className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-widest">{entry.status}</span>
                        <span className="text-[10px] text-slate-400 font-bold">{new Date(entry.timestamp).toLocaleString()}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">{t.updatedBy}: {entry.updatedBy}</span>
                      {entry.note && <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 italic mt-1">"{entry.note}"</p>}
                    </div>
                  </div>
                ))}
             </div>
          </section>
        </div>

        <div className="space-y-10">
          {(user.role === 'admin' || user.role === 'staff') && (
            <section className="bg-white dark:bg-white/[0.02] p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 animate-entry stagger-1">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6">{t.stateControl}</h3>
               <div className="grid grid-cols-1 gap-2 mb-6">
                 {Object.values(OrderStatus).map(s => (
                    <button key={s} disabled={order.orderStatus === s || updating} onClick={() => handleUpdate(s)} className={`py-3 rounded-2xl font-black uppercase text-[9px] tracking-widest transition-soft border ${order.orderStatus === s ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-50 dark:bg-white/5 text-slate-500 border-transparent hover:border-amber-600'}`}>{s}</button>
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
                <div><span className="text-[8px] font-black uppercase text-slate-400">{t.date} & {t.time}</span><p className="font-bold text-slate-400 text-xs">{new Date(order.createdAt).toLocaleString()}</p></div>
             </div>
          </section>
        </div>
      </div>
      {previewImg && <ImagePreviewModal imageUrl={previewImg} onClose={() => setPreviewImg(null)} lang={lang} />}
    </div>
  );
};

// ... (CustomerListPage, CustomerProfilePage, FilteredOrdersPage, StatCard remain largely similar to prev versions)
// Included remaining components for completeness in final output

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
              <tr key={c.phone + c.pin} className="group hover:bg-slate-50 dark:hover:bg-white/[0.02] cursor-pointer transition-soft" onClick={() => navigate(`/customer/${c.phone}`)}>
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

const FilteredOrdersPage: React.FC<{ user: User; lang: Language }> = ({ user, lang }) => {
  const { type, value } = useParams<{ type: string; value: string }>();
  const navigate = useNavigate();
  const t = translations[lang];
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const all = getOrders();
    if (type === 'status') setOrders(all.filter(o => o.orderStatus === value));
    else if (type === 'analytics') {
      if (value === 'volume') setOrders(all);
      else if (value === 'pending') setOrders(all.filter(o => o.orderStatus !== OrderStatus.COMPLETED && o.orderStatus !== OrderStatus.CUSTOMER_RECEIVED));
      else if (value === 'completed') setOrders(all.filter(o => o.orderStatus === OrderStatus.COMPLETED));
      else if (value === 'revenue') setOrders(all);
      else if (value === 'unpaid') setOrders(all.filter(o => o.paymentStatus === PaymentStatus.UNPAID));
      else if (value === 'paid') setOrders(all.filter(o => o.paymentStatus === PaymentStatus.PAID));
    }
  }, [type, value]);

  const totalRevenue = useMemo(() => orders.reduce((sum, o) => sum + o.totalAmount, 0), [orders]);

  const pageTitle = useMemo(() => {
    if (type === 'analytics') {
      if (value === 'volume') return t.volume;
      if (value === 'pending') return t.pending;
      if (value === 'completed') return t.completed;
      if (value === 'revenue') return t.revenue;
      if (value === 'unpaid') return t.unpaid;
      if (value === 'paid') return t.paid;
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
        {(value === 'revenue' || value === 'unpaid' || value === 'paid') && (
          <div className="bg-amber-600 p-6 rounded-3xl shadow-xl min-w-[200px]">
            <span className="text-[8px] font-black text-black/60 uppercase tracking-widest block mb-1">
              {value === 'unpaid' ? 'Total Outstanding' : value === 'paid' ? 'Total Collected' : t.totalRevenue}
            </span>
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
    <div className={`min-h-screen transition-colors duration-500 flex flex-col ${theme === 'dark' ? 'dark bg-black text-white' : 'bg-slate-50 text-slate-900'}`}>
      <Navigation user={user} onLogout={handleLogout} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} />
      <div className="pb-24 md:pb-0 flex flex-col flex-1">
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard user={user} lang={lang} />} />
            <Route path="/order/:id" element={<OrderDetailsPage user={user} lang={lang} />} />
            <Route path="/customers" element={<CustomerListPage user={user} lang={lang} />} />
            <Route path="/customer/:phone" element={<CustomerProfilePage user={user} lang={lang} />} />
            <Route path="/settings" element={<SettingsPage user={user} lang={lang} />} />
            <Route path="/filtered/:type/:value" element={<FilteredOrdersPage user={user} lang={lang} />} />
            <Route path="/invoice/:id" element={<InvoicePage user={user} lang={lang} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
        <Footer lang={lang} />
      </div>
      
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/5 z-40 flex items-center justify-around px-4 print:hidden">
        <Link to="/" className={`flex flex-col items-center gap-1 ${location.pathname === '/' ? 'text-amber-600' : 'text-slate-400'}`}>
          <i className="fas fa-home text-lg"></i>
          <span className="text-[8px] font-black uppercase">Home</span>
        </Link>
        {user.role !== 'customer' && (
          <Link to="/customers" className={`flex flex-col items-center gap-1 ${location.pathname.startsWith('/customer') || location.pathname === '/customers' ? 'text-amber-600' : 'text-slate-400'}`}>
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
