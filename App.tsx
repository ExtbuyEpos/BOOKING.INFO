import React, { useState, useEffect, useRef, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { Order, OrderStatus, User, PaymentStatus, OrderItem, AdminLogEntry, Language, AdditionalFees } from './types';
import { 
  getOrders, saveOrder, deleteOrder, getOrderById, 
  getAdminLogs, saveAdminLog, getUsers, saveUser, 
  deleteUser, authenticateUser, isUsernameUnique, 
  getUniqueCustomers, getOrdersByPhoneAndPin,
  getVatRate, saveVatRate, getShopPhone, saveShopPhone
} from './store/orderStore';
import { generateOrderId, getStatusAdvice, draftWhatsAppMessage } from './services/geminiService';
import { StatusBadge } from './components/StatusBadge';

// --- BRAND ASSETS ---
const BOUTIQUE_LOGO_URL = "https://api.iconify.design/lucide:flower-2.svg?color=%23d97706";

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
    neuralInsight: 'Boutique Intelligence',
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
    share: 'Share Booking',
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
    editMode: 'Enable Edit Mode',
    saveChanges: 'Save Invoice Updates',
    qty: 'Qty',
    addVat: 'Include VAT',
    removeVat: 'Exclude VAT',
    vatPricingMode: 'VAT Pricing Mode',
    extraVat: 'Extra VAT',
    includedVat: 'Included in Price',
    sendWhatsApp: 'WhatsApp Invoice',
    qrCode: 'Scan QR Code',
    shopProfile: 'Shop Profile',
    shopPhone: 'Official Shop WhatsApp',
    qrScanMsg: 'Scan this code to view Digital Invoice',
    waLink: 'Link Admin Phone',
    waConnected: 'WhatsApp Linked',
    waNotConnected: 'WhatsApp Not Linked'
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
    neuralInsight: 'ذكاء البوتيك',
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
    share: 'مشاركة الحجز',
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
    editMode: 'تفعيل وضع التعديل',
    saveChanges: 'حفظ تحديثات الفاتورة',
    qty: 'الكمية',
    addVat: 'إضافة ضريبة',
    removeVat: 'إلغاء الضريبة',
    vatPricingMode: 'طريقة تسعير الضريبة',
    extraVat: 'ضريبة إضافية',
    includedVat: 'مشمولة في السعر',
    sendWhatsApp: 'فاتورة واتساب',
    qrCode: 'رمز QR',
    shopProfile: 'ملف المتجر',
    shopPhone: 'رقم واتساب المتجر الرسمي',
    qrScanMsg: 'امسح الرمز لعرض الفاتورة الرقمية',
    waLink: 'ربط هاتف المسؤول',
    waConnected: 'تم ربط واتساب',
    waNotConnected: 'واتساب غير مرتبط'
  }
};

// --- SHARED UI COMPONENTS ---

const QRModal: React.FC<{ url: string; onClose: () => void; lang: Language; title?: string }> = ({ url, onClose, lang, title }) => {
  const t = translations[lang];
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade" onClick={onClose}>
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl flex flex-col items-center gap-6 animate-zoom" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">{title || t.qrCode}</h3>
        <div className="w-64 h-64 bg-slate-100 rounded-3xl overflow-hidden p-4 border border-slate-100 flex items-center justify-center">
          <img src={qrUrl} className="w-full h-full" alt="QR Code" />
        </div>
        <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] text-center max-w-[200px] leading-relaxed">{t.qrScanMsg}</p>
        <button onClick={onClose} className="mt-4 px-8 py-3 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px] hover:bg-rose-50 hover:text-rose-500 transition-soft">{t.cancel}</button>
      </div>
    </div>
  );
};

const PaymentStatusBadge: React.FC<{ status: PaymentStatus; lang: Language }> = ({ status, lang }) => {
  const isPaid = status === PaymentStatus.PAID;
  return (
    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-wider border shadow-sm flex items-center gap-1.5 ${isPaid ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${isPaid ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
      {status}
    </span>
  );
};

const InvoicePage: React.FC<{ user: User; lang: Language }> = ({ user, lang }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const t = translations[lang];
  const [order, setOrder] = useState<Order | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);
  const [editedOrder, setEditedOrder] = useState<Order | null>(null);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    const o = getOrderById(id || '');
    if (o) {
      setOrder(o);
      setEditedOrder(JSON.parse(JSON.stringify(o)));
    }
  }, [id]);

  if (!order || !editedOrder) return <div className="p-20 text-center font-black text-slate-400 uppercase">{t.noOrders}</div>;

  const calculateTotals = (o: Order) => {
    const st = o.items.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const f = o.additionalFees || { delivery: 0, alteration: 0, cutting: 0 };
    const feeSum = (Number(f.delivery) || 0) + (Number(f.alteration) || 0) + (Number(f.cutting) || 0);
    
    if (!o.includeVat) {
      o.vatAmount = 0;
      o.totalAmount = st + feeSum;
    } else if (o.vatIncludedInPrice) {
      const gross = st + feeSum;
      const net = gross / (1 + o.vatRate / 100);
      o.vatAmount = gross - net;
      o.totalAmount = gross;
    } else {
      const net = st + feeSum;
      o.vatAmount = net * (o.vatRate / 100);
      o.totalAmount = net + o.vatAmount;
    }
  };

  const toggleVatPricingMode = () => {
    const next = { ...editedOrder };
    next.vatIncludedInPrice = !next.vatIncludedInPrice;
    calculateTotals(next);
    setEditedOrder(next);
  };

  const toggleVat = () => {
    const next = { ...editedOrder };
    next.includeVat = !next.includeVat;
    calculateTotals(next);
    setEditedOrder(next);
  };

  const updateItem = (itemId: string, field: keyof OrderItem, val: any) => {
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
    if (!editedOrder) return;
    saveOrder(editedOrder);
    setOrder(JSON.parse(JSON.stringify(editedOrder)));
    setIsEditing(false);
    saveAdminLog({ 
      id: Date.now().toString(), 
      timestamp: new Date().toISOString(), 
      adminName: user.name, 
      action: 'EDIT_INVOICE', 
      details: `Manually updated booking ${editedOrder.id} internals.`, 
      orderId: editedOrder.id 
    });
  };

  const handleShare = async () => {
    const text = `Invoice: ${t.boutique}\nID: ${order.id}\nClient: ${order.customerName}\nTotal: ${order.totalAmount.toFixed(3)} ${t.currency}\nStatus: ${order.orderStatus}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Order Invoice', text, url: window.location.href });
      } catch (err) { console.error(err); }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleWhatsAppShare = async () => {
    const aiMessage = await draftWhatsAppMessage(activeOrder, lang);
    const cleanPhone = activeOrder.customerPhone.replace(/\D/g, '');
    const defaultMsg = `Invoice from ${t.boutique}: ${window.location.href}`;
    const message = encodeURIComponent(aiMessage || defaultMsg);
    const url = `https://wa.me/${cleanPhone.startsWith('968') ? '' : '968'}${cleanPhone}?text=${message}`;
    window.open(url, '_blank');
  };

  const activeOrder = isEditing ? editedOrder : order;
  const subtotal = activeOrder.items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const fees = activeOrder.additionalFees || { delivery: 0, alteration: 0, cutting: 0 };
  const createdAt = new Date(activeOrder.createdAt);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex flex-col items-center print:bg-white print:p-0" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-4xl flex justify-between items-center mb-6 print:hidden">
         <button onClick={() => navigate(-1)} className="px-5 py-2.5 bg-white border border-slate-200 rounded-2xl font-black text-[9px] uppercase tracking-widest text-slate-400 hover:text-amber-500 transition-soft">
           <i className="fas fa-chevron-left mr-2"></i> {t.backToDashboard}
         </button>
         <div className="flex gap-2">
           <button onClick={() => setShowQR(true)} className="px-5 py-2.5 bg-white border border-slate-200 rounded-2xl font-black text-[9px] uppercase tracking-widest text-amber-600 hover:scale-105 transition-soft">
             <i className="fas fa-qrcode mr-2"></i> {t.qrCode}
           </button>
           {(user.role === 'admin' || user.role === 'staff') && !isEditing && (
             <button onClick={() => setIsEditing(true)} className="px-5 py-2.5 bg-amber-600/10 text-amber-600 border border-amber-600/30 rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-amber-600 hover:text-black transition-soft">
               <i className="fas fa-edit mr-2"></i> {t.editMode}
             </button>
           )}
         </div>
      </div>

      <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 print:shadow-none print:border-none print:rounded-none animate-fade relative">
        {activeOrder.paymentStatus === PaymentStatus.PAID && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-12 border-8 border-emerald-500/20 px-10 py-5 rounded-2xl pointer-events-none opacity-20">
            <span className="text-8xl font-black text-emerald-500 uppercase tracking-widest">PAID</span>
          </div>
        )}

        <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white border border-slate-100 rounded-full flex items-center justify-center shadow-sm p-2 overflow-hidden">
              <img src={BOUTIQUE_LOGO_URL} className="w-full h-full object-contain" alt="Logo" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tighter">{t.boutique}</h1>
              <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.4em]">{t.invoice}</p>
            </div>
          </div>
          <div className="text-left md:text-right space-y-1">
            <div className="text-2xl font-black text-amber-600 tracking-widest">{activeOrder.id}</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.date}: {createdAt.toLocaleDateString(lang === 'ar' ? 'ar-OM' : 'en-OM')}</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.time}: {createdAt.toLocaleTimeString(lang === 'ar' ? 'ar-OM' : 'en-OM')}</div>
          </div>
        </div>

        <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h3 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-4">{t.customerInfo}</h3>
            {isEditing ? (
              <div className="space-y-2">
                <input type="text" value={editedOrder!.customerName} onChange={e => setEditedOrder({ ...editedOrder!, customerName: e.target.value })} className="w-full bg-slate-50 p-2 rounded-lg border border-slate-200 text-slate-900 text-sm" placeholder={t.name} />
                <input type="text" value={editedOrder!.customerPhone} onChange={e => setEditedOrder({ ...editedOrder!, customerPhone: e.target.value })} className="w-full bg-slate-50 p-2 rounded-lg border border-slate-200 text-slate-900 text-sm" placeholder={t.phone} />
                <textarea value={editedOrder!.customerAddress} onChange={e => setEditedOrder({ ...editedOrder!, customerAddress: e.target.value })} className="w-full bg-slate-50 p-2 rounded-lg border border-slate-200 text-slate-900 text-xs h-16" placeholder={t.address} />
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-lg font-black text-slate-900">{order.customerName}</p>
                <p className="font-bold text-slate-500">{order.customerPhone}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{order.customerAddress}</p>
              </div>
            )}
          </div>
          <div className="md:text-right flex flex-col md:items-end">
            <h3 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-4">{t.lifecycle}</h3>
            <div className="flex flex-col gap-2">
              <StatusBadge status={activeOrder.orderStatus} />
              <div className="flex justify-end">
                <PaymentStatusBadge status={activeOrder.paymentStatus} lang={lang} />
              </div>
            </div>
          </div>
        </div>

        <div className="p-10">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-50">
                <th className="pb-4">{t.garment}</th>
                <th className="pb-4 text-center">{t.qty}</th>
                <th className="pb-4 text-right">{t.price}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {activeOrder.items.map((it) => (
                <tr key={it.id} className="text-sm">
                  <td className="py-6 font-black text-slate-900">
                    {isEditing ? (
                      <input type="text" value={it.itemName} onChange={e => updateItem(it.id, 'itemName', e.target.value)} className="bg-slate-50 border-b border-amber-600/30 outline-none w-full p-1 rounded" />
                    ) : it.itemName}
                  </td>
                  <td className="py-6 text-center font-bold text-slate-400">
                    {isEditing ? (
                      <input type="number" value={it.quantity} onChange={e => updateItem(it.id, 'quantity', parseInt(e.target.value) || 0)} className="bg-slate-50 border-b border-amber-600/30 outline-none w-12 text-center p-1 rounded" />
                    ) : it.quantity}
                  </td>
                  <td className="py-6 text-right font-black text-slate-900">
                    {isEditing ? (
                      <input type="number" step="0.001" value={it.price} onChange={e => updateItem(it.id, 'price', parseFloat(e.target.value) || 0)} className="bg-slate-50 border-b border-amber-600/30 outline-none w-24 text-right p-1 rounded" />
                    ) : (it.price * it.quantity).toFixed(3)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-10 border-t border-slate-100 pt-10 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-slate-500">
              <span>{t.subtotal}</span>
              <span>{subtotal.toFixed(3)} {t.currency}</span>
            </div>
            
            <div className="flex justify-between items-center text-xs font-bold text-slate-500">
              <span>{t.delivery}</span>
              {isEditing ? (
                 <input type="number" step="0.001" value={fees.delivery} onChange={e => updateFee('delivery', parseFloat(e.target.value) || 0)} className="bg-slate-50 border-b border-amber-600/30 outline-none w-24 text-right p-1 rounded" />
              ) : <span>{fees.delivery.toFixed(3)} {t.currency}</span>}
            </div>

            <div className="flex justify-between items-center text-xs font-bold text-slate-500">
              <span>{t.alteration}</span>
              {isEditing ? (
                 <input type="number" step="0.001" value={fees.alteration} onChange={e => updateFee('alteration', parseFloat(e.target.value) || 0)} className="bg-slate-50 border-b border-amber-600/30 outline-none w-24 text-right p-1 rounded" />
              ) : <span>{fees.alteration.toFixed(3)} {t.currency}</span>}
            </div>

            <div className="flex justify-between items-center text-xs font-bold text-slate-500">
              <span>{t.cutting}</span>
              {isEditing ? (
                 <input type="number" step="0.001" value={fees.cutting} onChange={e => updateFee('cutting', parseFloat(e.target.value) || 0)} className="bg-slate-50 border-b border-amber-600/30 outline-none w-24 text-right p-1 rounded" />
              ) : <span>{fees.cutting.toFixed(3)} {t.currency}</span>}
            </div>

            {activeOrder.includeVat ? (
              <div className="flex flex-col gap-2 p-3 bg-amber-500/5 rounded-xl border border-amber-500/10">
                <div className="flex justify-between items-center text-xs font-black text-amber-600">
                  <div className="flex items-center gap-2">
                    <span>{t.vatAmount} ({activeOrder.vatRate}%)</span>
                    <span className="text-[7px] bg-amber-600 text-black px-1.5 py-0.5 rounded font-black uppercase">
                      {activeOrder.vatIncludedInPrice ? t.includedVat : t.extraVat}
                    </span>
                  </div>
                  <span>{activeOrder.vatAmount.toFixed(3)} {t.currency}</span>
                </div>
                {isEditing && (
                  <div className="flex items-center justify-end gap-2 mt-1">
                    <button onClick={toggleVatPricingMode} className="text-[8px] font-black uppercase text-amber-600 border border-amber-300 px-2 py-0.5 rounded-full hover:bg-amber-600 hover:text-black transition-soft">
                      {t.vatPricingMode}: {activeOrder.vatIncludedInPrice ? t.extraVat : t.includedVat}
                    </button>
                    <button onClick={toggleVat} className="text-[8px] font-black uppercase text-rose-500 border border-rose-200 px-2 py-0.5 rounded-full hover:bg-rose-500 hover:text-white transition-soft">
                      {t.removeVat}
                    </button>
                  </div>
                )}
              </div>
            ) : isEditing && (
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                 <span className="text-[10px] font-black text-slate-400 uppercase italic">VAT Excluded</span>
                 <button onClick={toggleVat} className="text-[8px] font-black uppercase text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full hover:bg-emerald-600 hover:text-white transition-soft">{t.addVat}</button>
              </div>
            )}

            <div className="flex justify-between items-center pt-6 border-t-2 border-slate-100">
              <span className="text-xl font-black text-slate-900 tracking-tighter uppercase">{t.grandTotal}</span>
              <span className="text-4xl font-black text-amber-600 tracking-tighter">{activeOrder.totalAmount.toFixed(3)} <span className="text-sm">{t.currency}</span></span>
            </div>
          </div>
        </div>

        <div className="p-10 bg-slate-50 flex flex-wrap gap-4 print:hidden">
          {isEditing ? (
            <>
              <button onClick={handleSaveChanges} className="flex-1 min-w-[200px] bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-black uppercase text-xs shadow-xl active:scale-95 transition-soft">
                <i className="fas fa-check-circle mr-2"></i> {t.saveChanges}
              </button>
              <button onClick={() => { setEditedOrder(JSON.parse(JSON.stringify(order))); setIsEditing(false); }} className="px-8 bg-slate-200 text-slate-600 py-4 rounded-2xl font-black uppercase text-xs transition-soft">
                {t.cancel}
              </button>
            </>
          ) : (
            <>
              <button onClick={handleWhatsAppShare} className="flex-1 min-w-[140px] bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase text-xs shadow-xl hover:scale-105 active:scale-95 transition-soft">
                <i className="fab fa-whatsapp mr-2 text-lg"></i> {t.sendWhatsApp}
              </button>
              <button onClick={() => window.print()} className="flex-1 min-w-[140px] bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-xs shadow-xl hover:scale-105 active:scale-95 transition-soft">
                <i className="fas fa-print mr-2"></i> {t.print}
              </button>
              <button onClick={handleShare} className="flex-1 min-w-[140px] bg-white border border-slate-200 text-slate-900 py-4 rounded-2xl font-black uppercase text-xs shadow-sm hover:scale-105 active:scale-95 transition-soft">
                <i className="fas fa-share-alt mr-2 text-amber-600"></i> {t.share}
              </button>
              <button onClick={() => navigate(-1)} className="px-8 bg-slate-200 text-slate-500 py-4 rounded-2xl font-black uppercase text-xs transition-soft">
                {t.cancel}
              </button>
            </>
          )}
        </div>
      </div>
      {showQR && <QRModal url={window.location.href} onClose={() => setShowQR(false)} lang={lang} />}
    </div>
  );
};

// --- MODALS ---

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

// --- CORE LAYOUT COMPONENTS ---

const Navigation: React.FC<{ user: User; onLogout: () => void; lang: Language; setLang: (l: Language) => void }> = ({ user, onLogout, lang, setLang }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const t = translations[lang];

  return (
    <nav className="bg-white/90 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-40 h-20 md:h-24 flex items-center shadow-sm transition-all duration-500 print:hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6 w-full flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full overflow-hidden flex items-center justify-center shadow-md group-hover:scale-110 transition-soft border border-slate-100 p-1">
            <img src={BOUTIQUE_LOGO_URL} className="w-full h-full object-contain" alt="Logo" />
          </div>
          <span className="font-black text-slate-900 tracking-tighter text-lg md:text-2xl hidden sm:block">Zahratalsawsen<span className="text-amber-600">Boutique</span></span>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden md:flex items-center gap-2 mr-4">
            <Link to="/" className={`px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-soft ${location.pathname === '/' ? 'bg-amber-50 text-amber-600' : 'text-slate-400'}`}>{t.dashboard}</Link>
            {user.role !== 'customer' && <Link to="/customers" className={`px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-soft ${location.pathname === '/customers' ? 'bg-amber-50 text-amber-600' : 'text-slate-400'}`}>{t.customers}</Link>}
            {user.role === 'admin' && <Link to="/settings" className={`px-4 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-soft ${location.pathname === '/settings' ? 'bg-amber-50 text-amber-600' : 'text-slate-400'}`}>{t.settings}</Link>}
          </div>
          <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:text-amber-500 transition-soft text-[8px] font-black uppercase">{lang === 'en' ? 'AR' : 'EN'}</button>
          <button onClick={onLogout} className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-soft flex items-center justify-center"><i className="fas fa-power-off text-xs"></i></button>
        </div>
      </div>
    </nav>
  );
};

const Footer: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = translations[lang];
  const year = new Date().getFullYear();
  return (
    <footer className="w-full py-12 px-6 border-t border-slate-100 mt-auto print:hidden">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-3 text-center">
        <div className="flex items-center gap-2 opacity-30 grayscale mb-2">
           <div className="w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center p-1">
             <img src={BOUTIQUE_LOGO_URL} className="w-full h-full object-contain opacity-50" />
           </div>
           <span className="font-black text-[10px] tracking-tighter uppercase">Zahratalsawsen</span>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
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
  if (orders.length === 0) return <div className="py-24 text-center font-black text-slate-300 uppercase tracking-widest text-xs">{t.noOrders}</div>;

  return (
    <div className="w-full">
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left">
          <thead className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] border-b border-slate-50">
            <tr><th className="px-8 py-6">{t.garment}</th>{!hideCustomerName && <th className="px-8 py-6">{t.identity}</th>}<th className="px-8 py-6">{t.financials}</th><th className="px-8 py-6">{t.lifecycle}</th><th className="px-8 py-6"></th></tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {orders.map(order => {
              const firstImg = order.items.find(it => it.imageUrl)?.imageUrl;
              return (
                <tr key={order.id} className="group hover:bg-slate-50 cursor-pointer transition-soft" onClick={() => onNavigate(order.id)}>
                  <td className="px-8 py-6">
                    <div onClick={(e) => { e.stopPropagation(); firstImg && onPreview(firstImg); }} className="w-14 h-14 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200 hover:scale-105 transition-soft">
                      {firstImg ? <img src={firstImg} className="w-full h-full object-cover" alt="" /> : <i className="fas fa-spa text-slate-300"></i>}
                    </div>
                  </td>
                  {!hideCustomerName && <td className="px-8 py-6 font-black text-slate-900 tracking-tight">{order.customerName}</td>}
                  <td className="px-8 py-6">
                    <div className="font-black text-slate-900">{order.totalAmount.toFixed(3)} {t.currency}</div>
                    <div className="mt-1 flex">
                      <PaymentStatusBadge status={order.paymentStatus} lang={lang} />
                    </div>
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
             <div key={order.id} className="bg-white border border-slate-100 rounded-3xl p-5 flex items-center gap-5 active:scale-95 transition-soft" onClick={() => onNavigate(order.id)}>
                <div className="w-16 h-16 shrink-0 bg-slate-100 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center">
                   {firstImg ? <img src={firstImg} className="w-full h-full object-cover" alt="" /> : <i className="fas fa-spa text-slate-300"></i>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-amber-600 font-black text-[10px] tracking-widest">{order.id}</span>
                    <span className="text-slate-900 font-black text-xs">{order.totalAmount.toFixed(3)} {t.currency}</span>
                  </div>
                  {!hideCustomerName && <div className="text-slate-900 font-black text-sm truncate">{order.customerName}</div>}
                  <div className="flex justify-between items-center mt-3">
                    <StatusBadge status={order.orderStatus} />
                    <PaymentStatusBadge status={order.paymentStatus} lang={lang} />
                  </div>
                </div>
             </div>
           );
        })}
      </div>
    </div>
  );
};

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
  const [includeVat, setIncludeVat] = useState(true);
  const [vatIncludedInPrice, setVatIncludedInPrice] = useState(false);

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
        price: parseFloat(newItemPrice) || 0, 
        quantity: 1,
        imageUrl: newItemImage || undefined 
      }]);
      setNewItemName('');
      setNewItemPrice('');
      setNewItemImage(null);
    }
  };

  const totals = useMemo(() => {
    const sub = items.reduce((acc, it) => acc + it.price * it.quantity, 0);
    const feeTotal = (parseFloat(deliveryFee) || 0) + (parseFloat(alterationFee) || 0) + (parseFloat(cuttingFee) || 0);
    
    let vatAmt = 0;
    let total = sub + feeTotal;

    if (includeVat) {
      if (vatIncludedInPrice) {
        const gross = sub + feeTotal;
        const net = gross / (1 + currentVatRate / 100);
        vatAmt = gross - net;
        total = gross;
      } else {
        const net = sub + feeTotal;
        vatAmt = net * (currentVatRate / 100);
        total = net + vatAmt;
      }
    }
    return { sub, feeTotal, vatAmt, total };
  }, [items, deliveryFee, alterationFee, cuttingFee, currentVatRate, includeVat, vatIncludedInPrice]);

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
      id, customerName, customerPhone, customerPin: customerPin || '1234', customerAddress,
      items, totalAmount: totals.total, vatRate: currentVatRate, vatAmount: totals.vatAmt,
      includeVat, vatIncludedInPrice, additionalFees: fees,
      paymentStatus, orderStatus: OrderStatus.CREATED, createdAt: new Date().toISOString(),
      history: [{ status: OrderStatus.CREATED, timestamp: new Date().toISOString(), updatedBy: user.name, note: 'Initial booking created.' }]
    };
    saveOrder(newOrder);
    saveAdminLog({ id: Date.now().toString(), timestamp: new Date().toISOString(), adminName: user.name, action: 'CREATE_ORDER', details: `Created booking ${id} with VAT ${includeVat ? currentVatRate + '%' + (vatIncludedInPrice ? ' (Incl.)' : ' (Extra)') : 'Excluded'}`, orderId: id });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-zoom" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest">{t.newOrder}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition-soft"><i className="fas fa-times text-xl"></i></button>
        </div>
        <div className="p-8 max-h-[70vh] overflow-y-auto space-y-8 no-scrollbar">
          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-amber-600 uppercase tracking-widest">{t.customerInfo}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder={t.name} value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-900 outline-none" />
              <input type="text" placeholder={t.phone} value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-900 outline-none" />
              <input type="text" placeholder={t.pinPlaceholder} value={customerPin} onChange={e => setCustomerPin(e.target.value)} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-900 outline-none" maxLength={4} />
              <input type="text" placeholder={t.address} value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-900 outline-none" />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-amber-600 uppercase tracking-widest">{t.manifest}</h3>
            <div className="flex flex-col gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex gap-2">
                <input type="text" placeholder={t.itemName} value={newItemName} onChange={e => setNewItemName(e.target.value)} className="flex-1 px-5 py-3 rounded-xl bg-white border border-slate-100 text-slate-900 outline-none" />
                <input type="number" placeholder={t.price} value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} className="w-24 px-5 py-3 rounded-xl bg-white border border-slate-100 text-slate-900 outline-none" />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 px-5 py-3 bg-white border border-dashed border-slate-300 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-amber-500 transition-soft">
                    <i className="fas fa-camera"></i> {t.uploadImage}
                  </div>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                {newItemImage && <div className="w-12 h-12 rounded-xl overflow-hidden border border-amber-500 shrink-0"><img src={newItemImage} className="w-full h-full object-cover" /></div>}
                <button onClick={addItem} className="px-8 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] h-11"><i className="fas fa-plus"></i></button>
              </div>
            </div>
            <div className="space-y-2">
              {items.map(it => (
                <div key={it.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    {it.imageUrl && <img src={it.imageUrl} className="w-10 h-10 rounded-lg object-cover" />}
                    <span className="font-bold text-slate-900">{it.itemName}</span>
                  </div>
                  <span className="font-black text-amber-600">{it.price.toFixed(3)} {t.currency}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-amber-600 uppercase tracking-widest">{t.additionalFees}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input type="number" step="0.001" placeholder={t.delivery} value={deliveryFee} onChange={e => setDeliveryFee(e.target.value)} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-900 outline-none" />
              <input type="number" step="0.001" placeholder={t.alteration} value={alterationFee} onChange={e => setAlterationFee(e.target.value)} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-900 outline-none" />
              <input type="number" step="0.001" placeholder={t.cutting} value={cuttingFee} onChange={e => setCuttingFee(e.target.value)} className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-900 outline-none" />
            </div>
          </section>

          <div className="p-6 bg-slate-900 rounded-3xl space-y-3">
             <div className="flex justify-between text-[10px] font-black uppercase text-slate-400"><span>{t.subtotal} + {t.additionalFees}</span><span>{(totals.sub + totals.feeTotal).toFixed(3)}</span></div>
             <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className={`text-[10px] font-black uppercase ${includeVat ? 'text-amber-500' : 'text-slate-500'}`}>{t.vatAmount} ({currentVatRate}%)</span>
                  {includeVat && (
                    <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">
                      {vatIncludedInPrice ? t.includedVat : t.extraVat}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-black text-amber-500 text-sm">{totals.vatAmt.toFixed(3)}</span>
                  <div className="flex gap-1">
                    <button onClick={() => setIncludeVat(!includeVat)} className={`px-3 py-1 rounded-full text-[8px] font-black uppercase transition-soft border ${includeVat ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-rose-500/20 text-rose-400 border-rose-500/50'}`}>{includeVat ? 'VAT ON' : 'VAT OFF'}</button>
                    {includeVat && (
                      <button onClick={() => setVatIncludedInPrice(!vatIncludedInPrice)} className={`px-3 py-1 rounded-full text-[8px] font-black uppercase transition-soft border ${vatIncludedInPrice ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' : 'bg-slate-500/20 text-slate-400 border-slate-500/50'}`} title={t.vatPricingMode}>{vatIncludedInPrice ? 'Incl.' : 'Extra'}</button>
                    )}
                  </div>
                </div>
             </div>
             
             <div className="flex justify-between items-center pt-3 border-t border-white/10">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-slate-400">{t.paymentStatus}</span>
                  <span className={`text-[8px] font-black uppercase ${paymentStatus === PaymentStatus.PAID ? 'text-emerald-400' : 'text-rose-400'}`}>{paymentStatus}</span>
                </div>
                <button 
                  onClick={() => setPaymentStatus(paymentStatus === PaymentStatus.PAID ? PaymentStatus.UNPAID : PaymentStatus.PAID)}
                  className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase transition-soft border ${paymentStatus === PaymentStatus.PAID ? 'bg-emerald-50 text-white border-emerald-400 shadow-lg shadow-emerald-500/20' : 'bg-rose-50 text-white border-rose-400 shadow-lg shadow-rose-500/20'}`}
                >
                  <i className={`fas ${paymentStatus === PaymentStatus.PAID ? 'fa-check-circle' : 'fa-times-circle'} mr-2`}></i>
                  {paymentStatus === PaymentStatus.PAID ? t.markAsUnpaid : t.markAsPaid}
                </button>
             </div>

             <div className="flex justify-between text-xl font-black text-white pt-3 border-t border-white/10"><span>{t.grandTotal}</span><span>{totals.total.toFixed(3)} {t.currency}</span></div>
          </div>
        </div>
        <div className="p-8 border-t border-slate-100 flex gap-4">
          <button disabled={loading} onClick={handleSave} className="flex-1 bg-amber-600 text-black py-4 rounded-2xl font-black uppercase text-xs shadow-xl active:scale-95 transition-soft">{loading ? '...' : t.save}</button>
          <button onClick={onClose} className="px-8 bg-slate-100 text-slate-500 py-4 rounded-2xl font-black uppercase text-xs transition-soft">{t.cancel}</button>
        </div>
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
    const unpaid = orders.filter(o => o.paymentStatus === PaymentStatus.UNPAID).length;
    return { revenue, pending, completed, total: orders.length, unpaid };
  }, [orders]);

  const filtered = orders.filter(o => o.id.toLowerCase().includes(search.toLowerCase()) || o.customerName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12 animate-fade" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="mb-8 md:mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter mb-2 italic">{t.welcome}, {user.name.split(' ')[0]}</h2>
          <div className="flex items-center gap-3 text-slate-400 font-bold uppercase text-[9px] tracking-[0.4em]">
            <div className="w-8 h-1 bg-amber-600 rounded-full"></div> <span>{t.dashboard}</span>
          </div>
        </div>
        {(user.role === 'admin' || user.role === 'staff') && (
          <button onClick={() => setShowCreate(true)} className="w-full md:w-auto bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs shadow-xl active:scale-95 transition-soft flex items-center justify-center gap-2">
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
      <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden animate-entry">
        <div className="p-5 md:p-8 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] self-start">{t.recentOrders}</h3>
          <div className="relative w-full sm:w-80 group">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors"></i>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t.searchPlaceholder} className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl outline-none font-bold text-xs text-slate-900" />
          </div>
        </div>
        <ResponsiveOrderList orders={filtered} lang={lang} onPreview={setPreviewImg} onNavigate={id => navigate(`/order/${id}`)} />
      </div>
      {showCreate && <CreateOrderModal user={user} lang={lang} onClose={() => setShowCreate(false)} />}
      {previewImg && <ImagePreviewModal imageUrl={previewImg} onClose={() => setPreviewImg(null)} lang={lang} />}
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string | number; icon: string; color: string; to?: string }> = ({ label, value, icon, color, to }) => {
  const Card = (
    <div className={`bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm transition-all duration-300 ${to ? 'hover:border-amber-500/30 hover:-translate-y-1 hover:shadow-lg group' : ''}`}>
      <div className="flex justify-between items-start mb-5">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-amber-500 transition-colors">{label}</span>
        <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center transition-all group-hover:bg-amber-600/10`}>
          <i className={`fas ${icon} ${color} opacity-40 group-hover:opacity-100 transition-all group-hover:scale-110 text-sm`}></i>
        </div>
      </div>
      <div className="text-xl md:text-2xl font-black text-slate-900 truncate transition-all group-hover:tracking-tight tracking-tighter">{value}</div>
    </div>
  );
  if (to) return <Link to={to}>{Card}</Link>;
  return Card;
};

const SettingsPage: React.FC<{ user: User; lang: Language }> = ({ user, lang }) => {
  const t = translations[lang];
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<AdminLogEntry[]>([]);
  const [vat, setVat] = useState(getVatRate().toString());
  const [shopPh, setShopPh] = useState(getShopPhone());
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'staff' | 'viewer'>('staff');
  const [showWALinking, setShowWALinking] = useState(false);

  useEffect(() => { setUsers(getUsers()); setLogs(getAdminLogs()); }, []);
  
  const handleVatSave = () => {
    saveVatRate(parseFloat(vat) || 0); alert('Global VAT Rate Configuration Updated.');
    saveAdminLog({ id: Date.now().toString(), timestamp: new Date().toISOString(), adminName: user.name, action: 'UPDATE_SETTINGS', details: `Configured Global VAT rate to ${vat}%` });
  };

  const handleShopSave = () => {
    saveShopPhone(shopPh); alert('Official Shop WhatsApp Profile Updated.');
    saveAdminLog({ id: Date.now().toString(), timestamp: new Date().toISOString(), adminName: user.name, action: 'UPDATE_SHOP_PROFILE', details: `Official WhatsApp set to ${shopPh}` });
  };

  const handleAddUser = () => {
    if (!newUsername || !newPin || !newName) return;
    const u: User = { id: Date.now().toString(), name: newName, username: newUsername, pin: newPin, role: newRole as any, createdAt: new Date().toISOString() };
    if (saveUser(u)) { setUsers(getUsers()); setShowAddUser(false); setNewUsername(''); setNewName(''); setNewPin(''); } else alert('Username must be unique');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 animate-fade" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter mb-12 italic">{t.settings}</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 space-y-12 animate-entry">
          <div className="bg-emerald-600/5 p-8 rounded-3xl border border-emerald-600/20">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em]">{t.shopProfile}</h3>
              <div className="flex items-center gap-2">
                 <div className={`w-2 h-2 rounded-full ${shopPh ? 'bg-emerald-500 status-pulse' : 'bg-slate-300'}`}></div>
                 <span className="text-[8px] font-black uppercase text-slate-400">{shopPh ? t.waConnected : t.waNotConnected}</span>
              </div>
            </div>
            <div className="flex gap-4">
              <input type="text" value={shopPh} onChange={e => setShopPh(e.target.value)} className="flex-1 bg-white p-4 rounded-2xl border border-slate-200 text-slate-900 outline-none font-black" placeholder={t.shopPhone} />
              <button onClick={handleShopSave} className="px-8 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] shadow-lg shadow-emerald-600/20 transition-soft">{t.save}</button>
            </div>
            <div className="mt-6 flex flex-col md:flex-row items-center gap-6 p-6 bg-white border border-emerald-100 rounded-3xl">
               <div className="flex-1">
                  <h4 className="text-sm font-black text-slate-900 mb-1">{t.waLink}</h4>
                  <p className="text-[9px] text-slate-400 font-bold uppercase leading-relaxed tracking-wider">Sync your official phone with the hub to enable automated invoice broadcasts.</p>
                  <button onClick={() => setShowWALinking(true)} className="mt-4 text-[10px] font-black uppercase text-emerald-600 border border-emerald-600/30 px-6 py-2 rounded-xl hover:bg-emerald-600 hover:text-white transition-soft">Open Linking Terminal</button>
               </div>
               <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 border-dashed">
                  <i className="fab fa-whatsapp text-3xl text-emerald-600 opacity-40"></i>
               </div>
            </div>
          </div>
          <div className="bg-amber-600/5 p-8 rounded-3xl border border-amber-600/20">
            <h3 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.4em] mb-6">{t.vatSetup}</h3>
            <div className="flex gap-4">
              <input type="number" step="0.1" value={vat} onChange={e => setVat(e.target.value)} className="flex-1 bg-white p-4 rounded-2xl border border-slate-200 text-slate-900 outline-none font-black" placeholder={t.vatLabel} />
              <button onClick={handleVatSave} className="px-8 bg-amber-600 text-black rounded-2xl font-black uppercase text-[10px] shadow-lg shadow-amber-600/20 transition-soft">{t.save}</button>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">{t.userManagement}</h3>
              <button onClick={() => setShowAddUser(true)} className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg"><i className="fas fa-plus"></i></button>
            </div>
            {showAddUser && (
              <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4 animate-entry">
                <input type="text" placeholder={t.name} value={newName} onChange={e => setNewName(e.target.value)} className="w-full p-4 rounded-xl bg-white border border-slate-100 text-slate-900 outline-none" />
                <input type="text" placeholder={t.username} value={newUsername} onChange={e => setNewUsername(e.target.value)} className="w-full p-4 rounded-xl bg-white border border-slate-100 text-slate-900 outline-none" />
                <input type="text" placeholder={t.pin} value={newPin} onChange={e => setNewPin(e.target.value)} className="w-full p-4 rounded-xl bg-white border border-slate-100 text-slate-900 outline-none" />
                <select value={newRole} onChange={e => setNewRole(e.target.value as any)} className="w-full p-4 rounded-xl bg-white border border-slate-100 text-slate-900 outline-none font-bold uppercase text-xs">
                  <option value="staff">Staff</option><option value="admin">Admin</option><option value="viewer">Viewer</option>
                </select>
                <div className="flex gap-2 pt-2">
                  <button onClick={handleAddUser} className="flex-1 bg-amber-600 text-black py-4 rounded-xl font-black text-[10px] uppercase shadow-lg shadow-amber-600/10">{t.save}</button>
                  <button onClick={() => setShowAddUser(false)} className="px-8 bg-slate-200 text-slate-600 py-4 rounded-xl font-black text-[10px] uppercase">{t.cancel}</button>
                </div>
              </div>
            )}
            <div className="space-y-4">
              {users.map(u => (
                <div key={u.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-amber-500/20 transition-soft">
                  <div>
                    <div className="font-black text-slate-900 text-sm">{u.name} <span className="text-[8px] text-amber-600 ml-2 uppercase border border-amber-600/30 px-2 py-0.5 rounded-full">{u.role}</span></div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">@{u.username}</div>
                  </div>
                  {u.role !== 'admin' && <button onClick={() => { if(window.confirm('Delete this system user?')) { deleteUser(u.id); setUsers(getUsers()); } }} className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-soft"><i className="fas fa-trash-alt text-xs"></i></button>}
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 animate-entry stagger-1 h-fit">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8">{t.adminLogs}</h3>
          <div className="space-y-4 max-h-[700px] overflow-y-auto no-scrollbar">
            {logs.map(log => (
              <div key={log.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 group transition-soft hover:bg-white">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-amber-600 font-black text-[9px] uppercase tracking-widest">{log.action}</span>
                  <span className="text-slate-400 text-[8px] font-bold uppercase">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-[11px] font-bold text-slate-800 leading-relaxed italic">"{log.details}"</p>
                <div className="text-[8px] text-slate-400 mt-3 font-black uppercase border-t border-slate-100 pt-2">{log.adminName}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
      {showWALinking && <QRModal url="https://web.whatsapp.com" title={t.waLink} onClose={() => setShowWALinking(false)} lang={lang} />}
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
  const [showQR, setShowQR] = useState(false);

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

  const handleShare = async () => {
    if (!order) return;
    const shareUrl = `${window.location.origin}/#/order/${order.id}`;
    const text = `Booking Details: ${t.boutique}\nID: ${order.id}\nClient: ${order.customerName}\nTotal: ${order.totalAmount.toFixed(3)} ${t.currency}\nStatus: ${order.orderStatus}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Booking Details', text, url: shareUrl });
      } catch (err) { console.error(err); }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  const handleWhatsAppShare = async () => {
    if (!order) return;
    const aiMessage = await draftWhatsAppMessage(order, lang);
    const cleanPhone = order.customerPhone.replace(/\D/g, '');
    const defaultMsg = `Dear ${order.customerName}, your order #${order.id} from ${t.boutique} is currently ${order.orderStatus}. View invoice: ${window.location.origin}/#/invoice/${order.id}`;
    const message = encodeURIComponent(aiMessage || defaultMsg);
    const url = `https://wa.me/${cleanPhone.startsWith('968') ? '' : '968'}${cleanPhone}?text=${message}`;
    window.open(url, '_blank');
  };

  if (!order) return <div className="p-20 text-center font-black text-slate-400 uppercase tracking-widest">{t.noOrders}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12 animate-fade" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <button onClick={() => navigate(-1)} className="px-5 py-3 bg-white border border-slate-100 rounded-2xl font-black text-[9px] uppercase tracking-widest text-slate-400 hover:text-amber-500 transition-soft">
           <i className={`fas ${lang === 'ar' ? 'fa-chevron-right' : 'fa-chevron-left'} mr-2`}></i> {t.backToDashboard}
        </button>
        <div className="flex gap-2">
          <button onClick={() => setShowQR(true)} className="px-5 py-3 bg-white border border-slate-100 rounded-2xl font-black text-[9px] uppercase tracking-widest text-amber-600 hover:scale-105 transition-soft">
             <i className="fas fa-qrcode mr-2"></i> {t.qrCode}
          </button>
          <button onClick={handleWhatsAppShare} className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-emerald-600/10 hover:scale-105 active:scale-95 transition-soft">
             <i className="fab fa-whatsapp mr-2 text-lg"></i> {t.sendWhatsApp}
          </button>
          <button onClick={handleShare} className="px-6 py-3 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-sm hover:scale-105 active:scale-95 transition-soft">
             <i className="fas fa-share-alt mr-2 text-amber-600"></i> {t.share}
          </button>
          <Link to={`/invoice/${order.id}`} className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-lg shadow-amber-600/10 hover:scale-105 active:scale-95 transition-soft">
             <i className="fas fa-file-invoice mr-2"></i> {t.invoice}
          </Link>
          <StatusBadge status={order.orderStatus} />
        </div>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <section className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl flex items-center gap-8 group animate-entry relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 -mr-16 -mt-16 rounded-full blur-2xl"></div>
            <div className="w-20 h-20 bg-amber-600 rounded-3xl flex items-center justify-center shrink-0 shadow-xl relative z-10"><i className="fas fa-robot text-white text-3xl"></i></div>
            <div className="flex-1 relative z-10">
               <h3 className="text-[10px] font-black text-amber-400 uppercase tracking-[0.4em] mb-2">{t.neuralInsight}</h3>
               <p className="text-white text-xl font-black italic">"{advice || 'Consulting hub...'}"</p>
            </div>
          </section>
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 animate-entry stagger-1">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8">{t.manifest}</h3>
             <div className="space-y-4">
               {order.items.map(it => (
                 <div key={it.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-4">
                       <div onClick={() => it.imageUrl && setPreviewImg(it.imageUrl)} className="w-12 h-12 bg-white rounded-xl overflow-hidden border border-slate-100 flex items-center justify-center cursor-zoom-in group">
                          {it.imageUrl ? <img src={it.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-soft" /> : <i className="fas fa-spa text-slate-300"></i>}
                       </div>
                       <div>
                         <span className="font-black text-slate-900 text-sm block">{it.itemName}</span>
                         <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{t.qty}: {it.quantity}</span>
                       </div>
                    </div>
                    <span className="font-black text-amber-600">{(it.price * it.quantity).toFixed(3)} <span className="text-[10px]">{t.currency}</span></span>
                 </div>
               ))}
               <div className="mt-6 pt-6 border-t border-slate-50 space-y-2">
                 {order.additionalFees?.delivery! > 0 && <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 tracking-widest"><span>{t.delivery}</span><span>{order.additionalFees?.delivery.toFixed(3)}</span></div>}
                 {order.additionalFees?.alteration! > 0 && <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 tracking-widest"><span>{t.alteration}</span><span>{order.additionalFees?.alteration.toFixed(3)}</span></div>}
                 {order.additionalFees?.cutting! > 0 && <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 tracking-widest"><span>{t.cutting}</span><span>{order.additionalFees?.cutting.toFixed(3)}</span></div>}
                 {order.includeVat && (
                    <div className="flex justify-between text-[10px] font-black uppercase text-amber-600/60 tracking-widest pt-2">
                      <span>VAT ({order.vatRate}%) [{order.vatIncludedInPrice ? t.includedVat : t.extraVat}]</span>
                      <span>{order.vatAmount.toFixed(3)}</span>
                    </div>
                 )}
               </div>
             </div>
             <div className="mt-8 pt-8 border-t border-slate-100 flex justify-between items-center">
                <span className="font-black text-2xl tracking-tighter text-slate-900 uppercase">{t.grandTotal}</span>
                <div className="text-right flex flex-col items-end">
                  <span className="font-black text-4xl text-amber-600 block tracking-tighter">{order.totalAmount.toFixed(3)} <span className="text-sm font-black">{t.currency}</span></span>
                  <button onClick={togglePaymentStatus} className={`mt-3 text-[9px] font-black uppercase px-6 py-2.5 rounded-full border shadow-xl transition-soft flex items-center gap-2 ${order.paymentStatus === PaymentStatus.PAID ? 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500' : 'bg-rose-600 text-white border-rose-500 hover:bg-rose-500'}`}>
                    <i className={`fas ${order.paymentStatus === PaymentStatus.PAID ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                    {order.paymentStatus === PaymentStatus.PAID ? t.markAsUnpaid : t.markAsPaid}
                  </button>
                </div>
             </div>
          </section>
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 animate-entry stagger-2">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-10">{t.history}</h3>
             <div className="relative space-y-8 pl-6 border-l-2 border-slate-100">
                {order.history.map((entry, idx) => (
                  <div key={idx} className="relative group">
                    <div className={`absolute -left-[33px] top-0 w-4 h-4 rounded-full border-4 border-white transition-colors ${idx === 0 ? 'bg-amber-600 scale-125' : 'bg-slate-300'}`}></div>
                    <div className="bg-slate-50 p-5 rounded-2xl border border-transparent hover:border-amber-500/20 transition-soft">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <span className="font-black text-slate-900 text-[11px] uppercase tracking-[0.1em]">{entry.status}</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase">{new Date(entry.timestamp).toLocaleString()}</span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{t.updatedBy}: {entry.updatedBy}</span>
                      {entry.note && <p className="text-[11px] leading-relaxed text-slate-600 italic mt-2 border-l-2 border-amber-600/20 pl-3">"{entry.note}"</p>}
                    </div>
                  </div>
                ))}
             </div>
          </section>
        </div>
        <div className="space-y-10">
          {(user.role === 'admin' || user.role === 'staff') && (
            <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm animate-entry stagger-1">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6">{t.stateControl}</h3>
               <div className="grid grid-cols-1 gap-2 mb-6">
                 {Object.values(OrderStatus).map(s => (
                    <button key={s} disabled={order.orderStatus === s || updating} onClick={() => handleUpdate(s)} className={`py-3.5 rounded-2xl font-black uppercase text-[10px] transition-soft border ${order.orderStatus === s ? 'bg-amber-600 text-black border-amber-600' : 'bg-slate-50 text-slate-500 border-transparent hover:border-amber-600/50'}`}>{s}</button>
                 ))}
               </div>
               <textarea value={note} onChange={e => setNote(e.target.value)} placeholder={t.statusNotePlaceholder} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-900 outline-none h-28 resize-none" />
            </section>
          )}
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 animate-entry stagger-2">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-6">{t.orderSpecifics}</h3>
             <div className="space-y-6">
                <div><span className="text-[8px] font-black uppercase text-slate-400 tracking-widest block mb-1">{t.identity}</span><p className="font-black text-slate-900 text-lg tracking-tight">{order.customerName}</p></div>
                <div><span className="text-[8px] font-black uppercase text-slate-400 tracking-widest block mb-1">{t.phone}</span><p className="font-black text-amber-600 text-sm tracking-widest">{order.customerPhone}</p></div>
                <div><span className="text-[8px] font-black uppercase text-slate-400 tracking-widest block mb-1">{t.date} & {t.time}</span><p className="font-bold text-slate-400 text-xs uppercase">{new Date(order.createdAt).toLocaleString()}</p></div>
             </div>
          </section>
        </div>
      </div>
      {previewImg && <ImagePreviewModal imageUrl={previewImg} onClose={() => setPreviewImg(null)} lang={lang} />}
      {showQR && <QRModal url={`${window.location.origin}/#/invoice/${order.id}`} onClose={() => setShowQR(false)} lang={lang} />}
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
  const pageTitle = type === 'analytics' ? (value === 'revenue' ? t.revenue : (value === 'unpaid' ? t.unpaid : (value === 'paid' ? t.paid : value))) : value;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 animate-fade" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
       <button onClick={() => navigate(-1)} className="mb-8 px-5 py-3 bg-white border border-slate-100 rounded-2xl font-black text-[9px] uppercase tracking-widest text-slate-400 hover:text-amber-500 transition-soft"><i className="fas fa-chevron-left mr-2"></i> {t.backToDashboard}</button>
      <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div><h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter italic">{pageTitle}</h2></div>
        {(value === 'revenue' || value === 'unpaid' || value === 'paid') && (
          <div className="bg-amber-600 p-8 rounded-[2.5rem] shadow-xl shadow-amber-600/10 min-w-[240px]">
            <span className="text-[9px] font-black text-black/60 uppercase tracking-[0.3em] block mb-2">{t.totalRevenue}</span>
            <span className="text-3xl font-black text-white tracking-tighter">{totalRevenue.toFixed(3)} <span className="text-xs uppercase">{t.currency}</span></span>
          </div>
        )}
      </div>
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden animate-entry">
        <ResponsiveOrderList orders={orders} lang={lang} onPreview={() => {}} onNavigate={id => navigate(`/order/${id}`)} />
      </div>
    </div>
  );
};

const CustomerListPage: React.FC<{ user: User; lang: Language }> = ({ user, lang }) => {
  const navigate = useNavigate();
  const t = translations[lang];
  const customers = getUniqueCustomers();
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 animate-fade" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter mb-8 italic">{t.customers}</h2>
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden animate-entry">
        <table className="w-full text-left">
          <thead className="text-slate-400 text-[10px] font-black uppercase border-b border-slate-50">
            <tr><th className="px-8 py-6">{t.name}</th><th className="px-8 py-6">{t.phone}</th><th className="px-8 py-6">{t.orderCount}</th><th className="px-8 py-6">{t.lastOrder}</th><th className="px-8 py-6"></th></tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {customers.map(c => (
              <tr key={c.phone + c.pin} className="group hover:bg-slate-50 cursor-pointer transition-soft" onClick={() => navigate(`/customer/${c.phone}`)}>
                <td className="px-8 py-6 font-black text-slate-900">{c.name}</td>
                <td className="px-8 py-6 text-amber-600 font-bold tracking-widest">{c.phone}</td>
                <td className="px-8 py-6 font-black text-slate-900">{c.orderCount}</td>
                <td className="px-8 py-6 text-slate-400 text-xs font-bold">{new Date(c.lastOrder).toLocaleDateString()}</td>
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
  useEffect(() => { const all = getOrders(); setOrders(all.filter(o => o.customerPhone === phone)); }, [phone]);
  const totalSpent = useMemo(() => orders.reduce((sum, o) => sum + o.totalAmount, 0), [orders]);
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 animate-fade" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <button onClick={() => navigate(-1)} className="mb-8 px-5 py-3 bg-white border border-slate-100 rounded-2xl font-black text-[9px] uppercase tracking-widest text-slate-400 hover:text-amber-500 transition-soft"><i className="fas fa-chevron-left mr-2"></i> {t.backToDashboard}</button>
      <div className="mb-10 flex justify-between items-end">
        <div><h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter italic">{orders[0]?.customerName || t.customerInfo}</h2><p className="text-amber-600 font-black uppercase text-xs mt-3">{phone}</p></div>
        <div className="text-right"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Lifetime Volume</span><span className="text-3xl font-black text-slate-900 tracking-tighter">{totalSpent.toFixed(3)} <span className="text-sm font-black text-amber-600">{t.currency}</span></span></div>
      </div>
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden animate-entry">
        <ResponsiveOrderList orders={orders} lang={lang} onPreview={() => {}} onNavigate={id => navigate(`/order/${id}`)} hideCustomerName />
      </div>
    </div>
  );
};

const LoginPage: React.FC<{ onLogin: (u: User) => void; lang: Language; setLang: (l: Language) => void }> = ({ onLogin, lang, setLang }) => {
  const [id, setId] = useState(''); const [pin, setPin] = useState(''); const [error, setError] = useState(false); const t = translations[lang];
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); const u = authenticateUser(id, pin); if (u) onLogin(u); else { setError(true); setTimeout(() => setError(false), 2000); }
  };
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-600 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-600 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      </div>
      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-12 animate-fade">
          <div className="w-24 h-24 bg-white border border-white/20 rounded-full flex items-center justify-center shadow-2xl mb-6 overflow-hidden p-2">
            <img src={BOUTIQUE_LOGO_URL} className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter text-center">Zahrat Al Sawsen <span className="text-amber-600">Boutique</span></h1>
          <p className="text-[10px] font-black text-amber-600/60 uppercase tracking-[0.5em] mt-3">Smart Management Suite</p>
        </div>
        <form onSubmit={handleSubmit} className={`bg-white/10 backdrop-blur-3xl p-10 rounded-[2.5rem] border border-white/10 shadow-2xl space-y-6 ${error ? 'animate-shake' : ''}`}>
          <div className="flex justify-between items-center mb-4"><h2 className="text-white font-black text-xs uppercase tracking-widest">{t.securePortal}</h2><button type="button" onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} className="text-[10px] font-black text-amber-600 uppercase tracking-widest px-3 py-1 rounded-full border border-amber-600/30 transition-soft">{lang === 'en' ? 'AR' : 'EN'}</button></div>
          <div className="space-y-4">
            <input type="text" placeholder={t.loginId} value={id} onChange={e => setId(e.target.value)} className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-amber-500/20" />
            <input type="password" placeholder={t.password} value={pin} onChange={e => setPin(e.target.value)} className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-amber-500/20 tracking-widest" />
          </div>
          {error && <div className="text-center text-rose-500 text-[10px] font-black uppercase tracking-widest">{t.invalidPin}</div>}
          <button type="submit" className="w-full bg-amber-600 text-black font-black uppercase text-xs py-4 rounded-2xl shadow-xl active:scale-95 transition-soft">{t.welcome}</button>
        </form>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('zs_session_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [lang, setLang] = useState<Language>('en');
  const location = useLocation();
  const handleLogin = (u: User) => { setUser(u); localStorage.setItem('zs_session_user', JSON.stringify(u)); };
  const handleLogout = () => { setUser(null); localStorage.removeItem('zs_session_user'); };
  if (!user) return <LoginPage onLogin={handleLogin} lang={lang} setLang={setLang} />;
  return (
    <div className={`min-h-screen transition-colors duration-500 flex flex-col bg-slate-50 text-slate-900`}>
      <Navigation user={user} onLogout={handleLogout} lang={lang} setLang={setLang} />
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
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-xl border-t border-slate-200 z-40 flex items-center justify-around px-4 print:hidden">
        <Link to="/" className={`flex flex-col items-center gap-1 ${location.pathname === '/' ? 'text-amber-600' : 'text-slate-400'}`}><i className="fas fa-home text-lg"></i><span className="text-[8px] font-black uppercase">Home</span></Link>
        {user.role !== 'customer' && (<Link to="/customers" className={`flex flex-col items-center gap-1 ${location.pathname.startsWith('/customer') || location.pathname === '/customers' ? 'text-amber-600' : 'text-slate-400'}`}><i className="fas fa-users text-lg"></i><span className="text-[8px] font-black uppercase">Clients</span></Link>)}
        {user.role === 'admin' && (<Link to="/settings" className={`flex flex-col items-center gap-1 ${location.pathname === '/settings' ? 'text-amber-600' : 'text-slate-400'}`}><i className="fas fa-cog text-lg"></i><span className="text-[8px] font-black uppercase">Settings</span></Link>)}
      </div>
    </div>
  );
};

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
