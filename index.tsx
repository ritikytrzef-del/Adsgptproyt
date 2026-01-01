import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Home, Play, Wallet, History, Clock, Landmark, ExternalLink, 
  Sparkles, X, AlertCircle, ArrowUpRight, CheckCircle2, Save, 
  ShieldCheck, Shield, BarChart3, Download, Check, Ban, 
  ChevronRight, Users, TrendingUp, Calendar, Info, MapPin, Hash, Zap,
  Mail, Smartphone, IndianRupee, RefreshCw, Settings, UserPlus, MinusCircle, PlusCircle, LayoutDashboard,
  FileDown, Square, CheckSquare, Layers, Award
} from 'lucide-react';

// Helper to avoid floating point issues for USDT (6 decimals)
const toCents = (val: number | string) => Math.round(parseFloat(val.toString()) * 1000000);
const fromCents = (val: number) => val / 1000000;

const App = () => {
    const tg = (window as any).Telegram?.WebApp;

    // --- TELEGRAM VERSION FIXES ---
    // Fix for: [Telegram.WebApp] CloudStorage is not supported in version 6.0
    // This Mock prevents external scripts (like Ad SDKs) from triggering console errors when probing for CloudStorage
    if (tg && !tg.isVersionAtLeast('6.9')) {
        if (!(tg as any).CloudStorage) {
            (tg as any).CloudStorage = {
                setItem: (k: any, v: any, cb: any) => cb?.(new Error('Unsupported')),
                getItem: (k: any, cb: any) => cb?.(new Error('Unsupported'), null),
                getItems: (k: any, cb: any) => cb?.(new Error('Unsupported'), {}),
                removeItem: (k: any, cb: any) => cb?.(new Error('Unsupported')),
                removeItems: (k: any, cb: any) => cb?.(new Error('Unsupported')),
                getKeys: (cb: any) => cb?.(new Error('Unsupported'), [])
            };
        }
    }

    const [activeTab, setActiveTab] = useState('home');
    const [user, setUser] = useState({ id: 0, first_name: 'Guest', username: '' });
    const [isAdminView, setIsAdminView] = useState(false);
    const [adminSubTab, setAdminSubTab] = useState<'dashboard' | 'withdrawals' | 'users' | 'settings'>('dashboard');
    const [adminWithdrawalFilter, setAdminWithdrawalFilter] = useState<'ALL' | 'PENDING' | 'PAID' | 'REJECTED'>('PENDING');
    const [adminNetworkFilter, setAdminNetworkFilter] = useState<'ALL' | 'TON' | 'UPI' | 'GIFT_CARD'>('ALL');
    
    // --- DYNAMIC CONFIG ---
    const [adReward, setAdReward] = useState(() => Number(localStorage.getItem('cfg_adReward')) || 0.0002);
    const [adCooldownSec, setAdCooldownSec] = useState(() => Number(localStorage.getItem('cfg_adCooldownSec')) || 120);
    const [tonMinUsdt, setTonMinUsdt] = useState(() => Number(localStorage.getItem('cfg_tonMinUsdt')) || 2.00);
    const [tonMaxUsdt, setTonMaxUsdt] = useState(() => Number(localStorage.getItem('cfg_tonMaxUsdt')) || 50.00);
    const [upiMinInr, setUpiMinInr] = useState(() => Number(localStorage.getItem('cfg_upiMinInr')) || 100.00);
    const [gplayMinInr, setGplayMinInr] = useState(() => Number(localStorage.getItem('cfg_gplayMinInr')) || 30.00);
    const [gasUsdt, setGasUsdt] = useState(() => Number(localStorage.getItem('cfg_gasUsdt')) || 0.03);

    // --- CORE APP STATE ---
    const [balance, setBalance] = useState(() => Number(localStorage.getItem('balance')) || 0.0000);
    const [earningsHistory, setEarningsHistory] = useState(() => JSON.parse(localStorage.getItem('earningsHistory') || '[]'));
    const [withdrawalHistory, setWithdrawalHistory] = useState(() => JSON.parse(localStorage.getItem('withdrawalHistory') || '[]'));
    const [exchangeRate, setExchangeRate] = useState(() => Number(localStorage.getItem('exchangeRate')) || 90.00);
    const [tonAddress, setTonAddress] = useState(() => localStorage.getItem('tonAddress') || '');
    const [upiId, setUpiId] = useState(() => localStorage.getItem('upiId') || '');
    const [giftCardEmail, setGiftCardEmail] = useState(() => localStorage.getItem('giftCardEmail') || '');
    const [adCooldowns, setAdCooldowns] = useState<Record<string, number>>(() => JSON.parse(localStorage.getItem('adCooldowns') || '{}'));
    const [currentTime, setCurrentTime] = useState(Date.now());

    // --- ADMIN SPECIFIC STATE ---
    const [usersList, setUsersList] = useState<any[]>(() => {
        const saved = localStorage.getItem('usersList');
        return saved ? JSON.parse(saved) : [
            { id: 1001, name: 'Alice', balance: 0.05, totalEarned: 0.12, joined: Date.now() - 86400000 * 5 },
            { id: 1002, name: 'Bob', balance: 0.01, totalEarned: 0.04, joined: Date.now() - 86400000 * 2 }
        ];
    });
    const [adminSelectedWithdrawals, setAdminSelectedWithdrawals] = useState<string[]>([]);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawNetwork, setWithdrawNetwork] = useState<'TON' | 'GIFT_CARD' | 'UPI'>('TON');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const [historySubTab, setHistorySubTab] = useState('earnings');

    // --- PERSISTENCE ---
    useEffect(() => {
        localStorage.setItem('balance', balance.toFixed(6));
        localStorage.setItem('earningsHistory', JSON.stringify(earningsHistory));
        localStorage.setItem('withdrawalHistory', JSON.stringify(withdrawalHistory));
        localStorage.setItem('adCooldowns', JSON.stringify(adCooldowns));
        localStorage.setItem('tonAddress', tonAddress);
        localStorage.setItem('upiId', upiId);
        localStorage.setItem('giftCardEmail', giftCardEmail);
        localStorage.setItem('exchangeRate', exchangeRate.toString());
        localStorage.setItem('usersList', JSON.stringify(usersList));
        
        localStorage.setItem('cfg_adReward', adReward.toString());
        localStorage.setItem('cfg_adCooldownSec', adCooldownSec.toString());
        localStorage.setItem('cfg_tonMinUsdt', tonMinUsdt.toString());
        localStorage.setItem('cfg_tonMaxUsdt', tonMaxUsdt.toString());
        localStorage.setItem('cfg_upiMinInr', upiMinInr.toString());
        localStorage.setItem('cfg_gplayMinInr', gplayMinInr.toString());
        localStorage.setItem('cfg_gasUsdt', gasUsdt.toString());
    }, [balance, earningsHistory, withdrawalHistory, adCooldowns, tonAddress, upiId, giftCardEmail, exchangeRate, usersList, adReward, adCooldownSec, tonMinUsdt, tonMaxUsdt, upiMinInr, gplayMinInr, gasUsdt]);

    useEffect(() => {
        if (tg) {
            tg.ready();
            tg.expand();
            if (tg.initDataUnsafe?.user) {
                setUser(tg.initDataUnsafe.user);
                setUsersList(prev => {
                    if (prev.find(u => u.id === tg.initDataUnsafe.user.id)) return prev;
                    return [...prev, { id: tg.initDataUnsafe.user.id, name: tg.initDataUnsafe.user.first_name, balance: balance, totalEarned: 0, joined: Date.now() }];
                });
            }
        }
        const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
        return () => clearInterval(timer);
    }, [tg]);

    // Monetag In-App Interstitial Setup
    useEffect(() => {
        const interval = setInterval(() => {
            if (typeof (window as any).show_10380842 === 'function') {
                (window as any).show_10380842({
                    type: 'inApp',
                    inAppSettings: {
                        frequency: 2,
                        capping: 0.1,
                        interval: 30,
                        timeout: 5,
                        everyPage: false
                    }
                });
                clearInterval(interval);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    // --- ANALYTICS ---
    const stats = useMemo(() => {
        const today = new Date().toDateString();
        const todayEarnings = earningsHistory
            .filter((e: any) => new Date(e.timestamp).toDateString() === today)
            .reduce((acc: number, curr: any) => acc + curr.amount, 0);
        const totalEarnings = earningsHistory.reduce((acc: number, curr: any) => acc + curr.amount, 0);
        return { todayEarnings, totalEarnings };
    }, [earningsHistory]);

    const adminAnalytics = useMemo(() => {
        const totalSystemBalance = usersList.reduce((acc, u) => acc + u.balance, 0);
        const totalPending = withdrawalHistory.filter((w: any) => w.status === 'PENDING').reduce((acc, w) => acc + w.amount, 0);
        const totalPaid = withdrawalHistory.filter((w: any) => w.status === 'PAID').reduce((acc, w) => acc + w.amount, 0);
        const activeUsersCount = usersList.length;
        return { totalSystemBalance, totalPending, totalPaid, activeUsersCount };
    }, [usersList, withdrawalHistory]);

    const filteredWithdrawalsForAdmin = useMemo(() => {
        return withdrawalHistory.filter((w: any) => {
            const statusMatch = adminWithdrawalFilter === 'ALL' || w.status === adminWithdrawalFilter;
            const networkMatch = adminNetworkFilter === 'ALL' || w.network === adminNetworkFilter;
            return statusMatch && networkMatch;
        });
    }, [withdrawalHistory, adminWithdrawalFilter, adminNetworkFilter]);

    const showMessage = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        setNotification({ message, type });
        // Safe check for HapticFeedback (requires v6.1+)
        if (tg && tg.isVersionAtLeast('6.1')) {
            tg.HapticFeedback.notificationOccurred(type === 'info' ? 'warning' : type);
        }
    };

    // --- HANDLERS ---
    const handleWatchAd = (adId: string) => {
        if (adCooldowns[adId] > currentTime) return;

        const rewardUser = () => {
            const now = Date.now();
            setBalance(prev => fromCents(toCents(prev) + toCents(adReward)));
            setAdCooldowns(prev => ({ ...prev, [adId]: now + (adCooldownSec * 1000) }));
            setEarningsHistory(prev => [{ id: Math.random().toString(36).substr(2, 9), source: `AD SLOT ${adId.replace('ads', '')}`, amount: adReward, timestamp: now }, ...prev]);
            setUsersList(prev => prev.map(u => u.id === user.id ? { ...u, balance: fromCents(toCents(u.balance) + toCents(adReward)), totalEarned: u.totalEarned + adReward } : u));
            showMessage(`Success! +$${adReward.toFixed(4)}`, 'success');
        };

        if (adId === 'ads1' && typeof (window as any).show_10380842 === 'function') {
            (window as any).show_10380842().then(() => {
                rewardUser();
                showMessage('You have seen an ad!', 'info');
            }).catch(() => {
                // If ad fails to show, we still reward for now but log error
                rewardUser();
            });
        } else {
            // For other slots, default reward behavior
            rewardUser();
        }
    };

    const handleWithdrawClick = () => {
        if (isWithdrawing) return;
        const activeAddress = withdrawNetwork === 'TON' ? tonAddress : withdrawNetwork === 'UPI' ? upiId : giftCardEmail;
        if (!activeAddress) return showMessage(`Please save ${withdrawNetwork === 'TON' ? 'USDT Ton' : withdrawNetwork === 'UPI' ? 'UPI' : 'Google Play'} info first`, 'error');

        const inputAmount = parseFloat(withdrawAmount);
        if (!withdrawAmount || isNaN(inputAmount) || inputAmount <= 0) return showMessage('Invalid amount', 'error');

        let totalNeeded = 0;
        if (withdrawNetwork === 'TON') {
            if (inputAmount < tonMinUsdt) return showMessage(`Min ${tonMinUsdt.toFixed(2)} USDT`, 'error');
            if (inputAmount > tonMaxUsdt) return showMessage(`Max ${tonMaxUsdt.toFixed(2)} USDT`, 'error');
            totalNeeded = inputAmount; // Total deducted includes gas eventually in confirm
        } else if (withdrawNetwork === 'UPI') {
            if (inputAmount < upiMinInr) return showMessage(`Min ₹${upiMinInr}`, 'error');
            totalNeeded = (inputAmount / exchangeRate); // No gas fee for UPI
        } else if (withdrawNetwork === 'GIFT_CARD') {
            if (inputAmount < gplayMinInr) return showMessage(`Min ₹${gplayMinInr}`, 'error');
            totalNeeded = (inputAmount / exchangeRate); // No gas fee for GPlay
        }

        if (balance < totalNeeded) return showMessage('Insufficient balance', 'error');
        setShowConfirmModal(true);
    };

    const confirmWithdrawal = () => {
        const inputAmount = parseFloat(withdrawAmount);
        // User requested: UPI or Google play giftcard me gas fees free
        const currentGas = withdrawNetwork === 'TON' ? gasUsdt : 0;
        
        let totalToDeduct = 0, netUsdt = 0, netInr = null;

        if (withdrawNetwork === 'TON') {
            totalToDeduct = inputAmount;
            netUsdt = inputAmount - currentGas;
        } else if (withdrawNetwork === 'UPI') {
            netInr = inputAmount;
            netUsdt = inputAmount / exchangeRate;
            totalToDeduct = netUsdt; // No gas added
        } else { // GIFT_CARD
            netInr = inputAmount;
            netUsdt = inputAmount / exchangeRate;
            totalToDeduct = netUsdt; // No gas added
        }

        setIsWithdrawing(true);
        setShowConfirmModal(false);
        setTimeout(() => {
            const now = Date.now();
            setBalance(prev => fromCents(toCents(prev) - toCents(totalToDeduct)));
            setUsersList(prev => prev.map(u => u.id === user.id ? { ...u, balance: fromCents(toCents(u.balance) - toCents(totalToDeduct)) } : u));
            const newWithdrawal = {
                id: Math.random().toString(36).substr(2, 9),
                amount: totalToDeduct,
                netPayout: netUsdt,
                netPayoutINR: netInr,
                gasFee: currentGas,
                network: withdrawNetwork,
                status: 'PENDING',
                address: withdrawNetwork === 'TON' ? tonAddress : withdrawNetwork === 'UPI' ? upiId : giftCardEmail,
                user_name: user.first_name,
                user_id: user.id,
                timestamp: now
            };
            setWithdrawalHistory(prev => [newWithdrawal, ...prev]);
            setIsWithdrawing(false);
            setWithdrawAmount('');
            showMessage('Request sent!', 'success');
            setActiveTab('history');
            setHistorySubTab('withdrawals');
        }, 1200);
    };

    // --- ADMIN ACTIONS ---
    const updateWithdrawalStatus = (ids: string[], status: 'PAID' | 'REJECTED') => {
        setWithdrawalHistory(prev => prev.map((w: any) => ids.includes(w.id) ? { ...w, status } : w));
        setAdminSelectedWithdrawals([]);
        showMessage(`${ids.length} request(s) ${status}`, 'success');
    };

    const adjustUserBalance = (userId: number, delta: number) => {
        setUsersList(prev => prev.map(u => u.id === userId ? { ...u, balance: Math.max(0, u.balance + delta) } : u));
        if (userId === user.id) setBalance(prev => Math.max(0, prev + delta));
        showMessage(`Balance adjusted by $${delta.toFixed(2)}`, 'info');
    };

    const downloadWithdrawalCSV = () => {
        if (withdrawalHistory.length === 0) return showMessage('No data to export', 'error');
        // User requested: CSV file me Indian Rupees me bhi kitna net payout dena hai show karna chahiye
        const headers = ["ID", "User", "UserID", "Total_USDT_Deducted", "Net_Payout_USDT", "Net_Payout_INR", "Gas_Fee", "Network", "Target_Address", "Status", "Timestamp"];
        const rows = withdrawalHistory.map((w: any) => [
            w.id,
            w.user_name,
            w.user_id,
            w.amount.toFixed(6),
            w.netPayout.toFixed(6),
            w.netPayoutINR ? w.netPayoutINR.toFixed(2) : "0.00",
            w.gasFee.toFixed(3),
            w.network === 'GIFT_CARD' ? 'Google Play' : w.network,
            w.address,
            w.status,
            new Date(w.timestamp).toLocaleString()
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `adsgpt_withdrawals_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showMessage('CSV with INR data exported!', 'success');
    };

    const toggleWithdrawalSelection = (id: string) => {
        setAdminSelectedWithdrawals(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const selectAllVisibleWithdrawals = () => {
        const visibleIds = filteredWithdrawalsForAdmin.map((w: any) => w.id);
        if (adminSelectedWithdrawals.length === visibleIds.length) {
            setAdminSelectedWithdrawals([]);
        } else {
            setAdminSelectedWithdrawals(visibleIds);
        }
    };

    const getCooldownText = (adId: string) => {
        const remaining = (adCooldowns[adId] || 0) - currentTime;
        if (remaining <= 0) return 'Watch Ad';
        const mins = Math.floor(remaining / 60000);
        const secs = Math.floor((remaining % 60000) / 1000);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const BrandingHero = () => (
        <div 
            onClick={() => {
                const link = 'https://t.me/Rewardsoftware_bot';
                if (tg && tg.openTelegramLink) {
                    tg.openTelegramLink(link);
                } else {
                    window.open(link, '_blank');
                }
            }}
            className="bg-black rounded-[40px] p-8 mb-6 relative overflow-hidden flex items-center justify-between border border-gray-800 shadow-2xl group active:scale-[0.98] transition-transform cursor-pointer"
        >
            <div className="relative z-10">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">Powered By</p>
                <h3 className="text-white text-2xl font-black tracking-tighter leading-none">REWARD<br/><span className="text-blue-500">SOFTWARE</span></h3>
            </div>
            <div className="relative z-10 w-20 h-20 bg-gradient-to-tr from-gray-900 to-black rounded-3xl flex items-center justify-center border border-gray-700 shadow-inner group-hover:rotate-6 transition-transform">
                <div className="flex flex-col items-center">
                    <span className="text-white font-black text-5xl tracking-tighter -mb-1">R</span>
                    <div className="w-4 h-1 bg-blue-500 rounded-full"></div>
                </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-blue-600/20 rounded-full blur-[60px]" />
            <div className="absolute -left-10 -top-10 w-24 h-24 bg-purple-600/10 rounded-full blur-[40px]" />
        </div>
    );

    return (
        <div className="max-w-md mx-auto min-h-screen pb-24 px-4 pt-6 bg-white relative">
            {notification && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[150] w-[90%] animate-fadeIn">
                    <div className={`p-4 rounded-2xl shadow-2xl flex items-center gap-3 border ${notification.type === 'success' ? 'bg-green-50 border-green-100 text-green-800' : notification.type === 'error' ? 'bg-red-50 border-red-100 text-red-800' : 'bg-blue-50 border-blue-100 text-blue-800'}`}>
                        {notification.type === 'success' ? <CheckCircle2 size={18} /> : notification.type === 'error' ? <AlertCircle size={18} /> : <Info size={18} />}
                        <p className="text-xs font-bold">{notification.message}</p>
                    </div>
                </div>
            )}

            <div className="tab-content">
                {activeTab === 'home' && !isAdminView && (
                    <div className="flex flex-col gap-6">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-black text-sm">R</div>
                                <div>
                                    <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 uppercase tracking-tighter leading-none">Adsgptpro</h1>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Reward Software</p>
                                </div>
                            </div>
                            <button onClick={() => setIsAdminView(true)} className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 active:scale-95"><Shield size={20} /></button>
                        </div>

                        <BrandingHero />

                        <div className="gradient-button p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden flex flex-col items-center">
                            <p className="text-[11px] uppercase tracking-[0.25em] opacity-80 mb-2 font-black">Available Balance</p>
                            <div className="flex flex-col items-center">
                                <div className="flex items-baseline gap-2">
                                    <h2 className="text-6xl font-black tracking-tighter">{balance.toFixed(4)}</h2>
                                    <span className="text-xl font-bold opacity-80">USDT</span>
                                </div>
                                <div className="mt-2 px-5 py-1.5 rounded-full bg-white/20 backdrop-blur-md shadow-inner text-base font-black flex items-center gap-1">
                                    <IndianRupee size={16} /> {(balance * exchangeRate).toFixed(2)} INR
                                </div>
                            </div>
                            <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="card p-5 rounded-3xl flex flex-col gap-1 border-b-4 border-b-green-500">
                                <p className="text-gray-400 text-[10px] font-bold uppercase">Today Earnings</p>
                                <p className="text-2xl font-bold text-green-500">+${stats.todayEarnings.toFixed(4)}</p>
                            </div>
                            <div className="card p-5 rounded-3xl flex flex-col gap-1 border-b-4 border-b-blue-600">
                                <p className="text-gray-400 text-[10px] font-bold uppercase">Total Earnings</p>
                                <p className="text-2xl font-bold text-blue-600">${stats.totalEarnings.toFixed(4)}</p>
                            </div>
                        </div>

                        <div className="card p-5 rounded-3xl flex items-center gap-4 border-l-4 border-l-purple-500">
                            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shadow-sm"><Zap size={20} /></div>
                            <div className="flex-1">
                                <h4 className="font-bold text-sm tracking-tight">Ads Revenue Active</h4>
                                <p className="text-xs text-gray-500">Yield: ${adReward} / {adCooldownSec}s</p>
                            </div>
                            <button onClick={() => setActiveTab('ads')} className="bg-gray-100 p-2.5 rounded-xl active:scale-95"><ChevronRight size={18} /></button>
                        </div>

                        <div 
                            onClick={() => {
                                const link = 'https://t.me/Rewardsoftware_bot';
                                if (tg && tg.openTelegramLink) {
                                    tg.openTelegramLink(link);
                                } else {
                                    window.open(link, '_blank');
                                }
                            }}
                            className="card p-5 rounded-3xl flex items-center gap-4 border-l-4 border-l-indigo-600 cursor-pointer active:scale-[0.98] transition-transform shadow-md"
                        >
                            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
                                <Award size={20} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-sm tracking-tight">Earn More</h4>
                                <p className="text-xs text-gray-500">Explore additional tasks & rewards</p>
                            </div>
                            <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600">
                                <ExternalLink size={18} />
                            </div>
                        </div>
                    </div>
                )}

                {isAdminView && (
                    <div className="flex flex-col gap-6 animate-fadeIn pb-10">
                        <header className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg">R</div>
                                <div>
                                    <h2 className="text-xl font-black uppercase tracking-tight leading-none text-black">Console</h2>
                                    <p className="text-[10px] font-bold text-blue-600 uppercase">Reward Software V2.5</p>
                                </div>
                            </div>
                            <button onClick={() => setIsAdminView(false)} className="bg-gray-100 p-2.5 rounded-xl active:scale-95"><X size={20} /></button>
                        </header>

                        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                            {(['dashboard', 'withdrawals', 'users', 'settings'] as const).map(tab => (
                                <button key={tab} onClick={() => setAdminSubTab(tab)} className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase whitespace-nowrap transition-all ${adminSubTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-50 text-gray-400'}`}>
                                    {tab === 'dashboard' && <LayoutDashboard size={14}/>}
                                    {tab === 'withdrawals' && <Landmark size={14}/>}
                                    {tab === 'users' && <Users size={14}/>}
                                    {tab === 'settings' && <Settings size={14}/>}
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {adminSubTab === 'dashboard' && (
                            <div className="grid grid-cols-2 gap-3 animate-fadeIn">
                                <div className="bg-black p-5 rounded-[32px] text-white shadow-xl flex flex-col gap-1 border border-gray-800">
                                    <p className="text-[10px] font-black opacity-60 uppercase tracking-widest">Liability</p>
                                    <p className="text-2xl font-black">${adminAnalytics.totalSystemBalance.toFixed(2)}</p>
                                </div>
                                <div className="bg-white border border-gray-100 p-5 rounded-[32px] shadow-sm flex flex-col gap-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Ads Sessions</p>
                                    <p className="text-2xl font-black text-black">{adminAnalytics.activeUsersCount}</p>
                                </div>
                                <div className="bg-green-50 border border-green-100 p-5 rounded-[32px] flex flex-col gap-1 col-span-2 shadow-sm">
                                    <div className="flex justify-between items-center">
                                        <p className="text-[10px] font-black text-green-700 uppercase tracking-widest">Global Payouts (USDT)</p>
                                        <TrendingUp size={16} className="text-green-500" />
                                    </div>
                                    <p className="text-4xl font-black text-green-800">${adminAnalytics.totalPaid.toFixed(2)}</p>
                                </div>
                            </div>
                        )}

                        {adminSubTab === 'withdrawals' && (
                            <div className="space-y-4 animate-fadeIn">
                                <div className="flex flex-col gap-4 sticky top-0 bg-white z-10 py-2">
                                    <div className="flex justify-between items-center">
                                        <div className="flex p-1 bg-gray-100 rounded-xl overflow-x-auto hide-scrollbar max-w-[70%]">
                                            {(['ALL', 'PENDING', 'PAID', 'REJECTED'] as const).map(f => (
                                                <button key={f} onClick={() => {setAdminWithdrawalFilter(f); setAdminSelectedWithdrawals([]);}} className={`px-3 py-1.5 text-[9px] font-black rounded-lg transition-all whitespace-nowrap ${adminWithdrawalFilter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}>{f}</button>
                                            ))}
                                        </div>
                                        <button onClick={downloadWithdrawalCSV} className="bg-blue-50 text-blue-600 p-2 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase shadow-sm"><FileDown size={16}/> CSV Export</button>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 ml-1"><Layers size={10}/> Payment Network</label>
                                        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                                            {(['ALL', 'TON', 'UPI', 'GIFT_CARD'] as const).map(n => (
                                                <button key={n} onClick={() => {setAdminNetworkFilter(n); setAdminSelectedWithdrawals([]);}} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[9px] font-black uppercase whitespace-nowrap transition-all border ${adminNetworkFilter === n ? (n === 'TON' ? 'bg-blue-600 text-white border-blue-700' : n === 'UPI' ? 'bg-purple-600 text-white border-purple-700' : n === 'GIFT_CARD' ? 'bg-orange-500 text-white border-orange-600' : 'bg-black text-white border-gray-900') : 'bg-white text-gray-400 border-gray-100'}`}>
                                                    {n === 'ALL' && 'All Networks'}
                                                    {n === 'TON' && <><Hash size={12}/> USDT TON</>}
                                                    {n === 'UPI' && <><Smartphone size={12}/> UPI</>}
                                                    {n === 'GIFT_CARD' && <><Mail size={12}/> Google Play</>}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                                        <button onClick={selectAllVisibleWithdrawals} className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-2">
                                            {adminSelectedWithdrawals.length > 0 && adminSelectedWithdrawals.length === filteredWithdrawalsForAdmin.length ? <CheckSquare size={16} className="text-blue-600"/> : <Square size={16}/>}
                                            {adminSelectedWithdrawals.length > 0 ? `Selected ${adminSelectedWithdrawals.length}` : 'Select All'}
                                        </button>
                                        
                                        {adminSelectedWithdrawals.length > 0 && (
                                            <div className="flex gap-2">
                                                <button onClick={() => updateWithdrawalStatus(adminSelectedWithdrawals, 'PAID')} className="bg-green-100 text-green-600 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase shadow-sm active:scale-95">Approve Paid</button>
                                                <button onClick={() => updateWithdrawalStatus(adminSelectedWithdrawals, 'REJECTED')} className="bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase shadow-sm active:scale-95">Reject All</button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {filteredWithdrawalsForAdmin.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-20 text-gray-300">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                            <CheckCircle2 size={32} className="opacity-20" />
                                        </div>
                                        <p className="text-xs font-black uppercase tracking-widest text-gray-400">Queue is Clear</p>
                                    </div>
                                )}

                                {filteredWithdrawalsForAdmin.map((w: any) => (
                                    <div key={w.id} onClick={() => toggleWithdrawalSelection(w.id)} className={`card p-4 rounded-[28px] border-l-4 transition-all active:scale-[0.98] ${adminSelectedWithdrawals.includes(w.id) ? 'bg-blue-50/50 ring-2 ring-blue-100' : ''} ${w.status === 'PAID' ? 'border-l-green-500' : w.status === 'REJECTED' ? 'border-l-red-500' : 'border-l-yellow-500'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex gap-3">
                                                <div className="pt-1">{adminSelectedWithdrawals.includes(w.id) ? <CheckSquare size={16} className="text-blue-600"/> : <Square size={16} className="text-gray-200"/>}</div>
                                                <div>
                                                    <p className="text-xs font-black text-black">{w.user_name} <span className="text-gray-400 font-medium text-[9px]">#{w.id}</span></p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md shadow-sm ${w.network === 'TON' ? 'bg-blue-50 text-blue-600' : w.network === 'UPI' ? 'bg-purple-600 text-purple-600' : 'bg-orange-50 text-orange-600'}`}>
                                                            {w.network === 'GIFT_CARD' ? 'Google Play' : w.network === 'TON' ? 'USDT TON' : w.network}
                                                        </span>
                                                        <p className="text-[9px] text-gray-400 font-bold">{new Date(w.timestamp).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-black text-black">${w.amount.toFixed(4)}</p>
                                                <p className="text-[9px] font-black text-green-600 uppercase">{w.netPayoutINR ? `₹${w.netPayoutINR.toFixed(2)}` : `$${w.netPayout.toFixed(4)}`}</p>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 border border-gray-100 p-2.5 rounded-xl mb-3">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mb-1">Target Account:</p>
                                            <p className="text-[9px] font-mono text-black break-all">{w.address}</p>
                                        </div>
                                        {w.status === 'PENDING' && !adminSelectedWithdrawals.includes(w.id) && (
                                            <div className="flex gap-2">
                                                <button onClick={(e) => {e.stopPropagation(); updateWithdrawalStatus([w.id], 'PAID');}} className="flex-1 py-2.5 rounded-xl bg-green-500 text-white text-[9px] font-black uppercase active:scale-95 shadow-md">Mark Paid</button>
                                                <button onClick={(e) => {e.stopPropagation(); updateWithdrawalStatus([w.id], 'REJECTED');}} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-[9px] font-black uppercase active:scale-95 shadow-sm">Reject</button>
                                            </div>
                                        )}
                                        {w.status !== 'PENDING' && (
                                            <div className="flex justify-end">
                                                <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full ${w.status === 'PAID' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{w.status}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {adminSubTab === 'users' && (
                            <div className="space-y-3 animate-fadeIn">
                                {usersList.map((u: any) => (
                                    <div key={u.id} className="card p-4 rounded-[28px] flex items-center justify-between border-l-4 border-l-blue-600">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-black shadow-md">{u.name[0]}</div>
                                            <div>
                                                <p className="text-sm font-black text-black">{u.name}</p>
                                                <p className="text-[10px] text-gray-400 font-bold">BAL: ${u.balance.toFixed(4)} • EARNED: ${u.totalEarned.toFixed(2)}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1.5">
                                            <button onClick={() => adjustUserBalance(u.id, 0.10)} className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center active:scale-90 shadow-sm"><PlusCircle size={16}/></button>
                                            <button onClick={() => adjustUserBalance(u.id, -0.10)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center active:scale-90 shadow-sm"><MinusCircle size={16}/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {adminSubTab === 'settings' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="p-5 rounded-[32px] bg-gray-50 border border-gray-100">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Ads Reward Config</label>
                                    <div className="flex flex-col gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <p className="text-[10px] font-bold text-gray-500">Global Ad Yield (USDT)</p>
                                            <input type="number" step="0.0001" value={adReward} onChange={(e) => setAdReward(parseFloat(e.target.value))} className="bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-black focus:ring-2 focus:ring-blue-500/20 shadow-inner" />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <p className="text-[10px] font-bold text-gray-500">Ad Session Reset (Sec)</p>
                                            <input type="number" value={adCooldownSec} onChange={(e) => setAdCooldownSec(parseInt(e.target.value))} className="bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-black focus:ring-2 focus:ring-blue-500/20 shadow-inner" />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 rounded-[32px] bg-gray-50 border border-gray-100">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Payout Gateway</label>
                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-1.5">
                                            <p className="text-[10px] font-bold text-gray-500">USDT/INR Exchange Rate</p>
                                            <input type="number" value={exchangeRate} onChange={(e) => setExchangeRate(parseFloat(e.target.value))} className="bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-black focus:ring-2 focus:ring-blue-500/20 shadow-inner" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="flex flex-col gap-1.5">
                                                <p className="text-[10px] font-bold text-gray-500">Min USDT TON</p>
                                                <input type="number" value={tonMinUsdt} onChange={(e) => setTonMinUsdt(parseFloat(e.target.value))} className="bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-black shadow-inner" />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <p className="text-[10px] font-bold text-gray-500">TON Network Gas Fee</p>
                                                <input type="number" value={gasUsdt} onChange={(e) => setGasUsdt(parseFloat(e.target.value))} className="bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-black shadow-inner" />
                                            </div>
                                        </div>
                                        <p className="text-[9px] text-blue-600 font-bold px-1 italic">* Gas fees are automatically bypassed for UPI/Google Play as per rules.</p>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="flex flex-col gap-1.5">
                                                <p className="text-[10px] font-bold text-gray-500">Min UPI (INR)</p>
                                                <input type="number" value={upiMinInr} onChange={(e) => setUpiMinInr(parseFloat(e.target.value))} className="bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-black shadow-inner" />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <p className="text-[10px] font-bold text-gray-500">Min G-Play (INR)</p>
                                                <input type="number" value={gplayMinInr} onChange={(e) => setGplayMinInr(parseFloat(e.target.value))} className="bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-black shadow-inner" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-center py-4">
                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">Hardware Layer Secure</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'ads' && (
                    <div className="flex flex-col gap-4">
                        <header>
                            <h2 className="text-2xl font-black uppercase tracking-tight text-black">Ad Stations</h2>
                            <p className="text-xs text-gray-500 mt-1 font-medium tracking-wide">Select a station to begin viewing rewards.</p>
                        </header>
                        {Array.from({ length: 10 }, (_, i) => `ads${i + 1}`).map((id, idx) => (
                            <div key={id} className="card p-5 rounded-[32px] flex items-center justify-between shadow-sm active:scale-[0.98] transition-transform">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center font-black text-white shadow-lg border border-gray-800">{idx + 1}</div>
                                    <div><p className="font-black text-sm text-black tracking-tight">AD_SLOT_{idx + 1}</p><p className="text-[10px] text-green-600 font-black uppercase tracking-widest">+${adReward} YIELD</p></div>
                                </div>
                                <button disabled={adCooldowns[id] > currentTime} onClick={() => handleWatchAd(id)} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${adCooldowns[id] > currentTime ? 'bg-gray-100 text-gray-300' : 'bg-black text-white shadow-xl hover:bg-gray-900 active:scale-95'}`}>{getCooldownText(id)}</button>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'wallet' && (
                    <div className="flex flex-col gap-8">
                        <header>
                            <h2 className="text-2xl font-black uppercase tracking-tight text-black">Wallet Payout</h2>
                            <p className="text-xs text-gray-500 mt-1 font-medium tracking-wide">Securely move your ad yields to private wallets or digital cards.</p>
                        </header>

                        <div className="gradient-button p-8 rounded-[40px] shadow-2xl text-white relative overflow-hidden flex flex-col items-center">
                            <p className="text-[11px] uppercase tracking-[0.3em] opacity-80 font-black mb-1">Wallet Balance</p>
                            <div className="flex flex-col items-center">
                                <div className="flex items-baseline gap-1.5"><span className="text-5xl font-black tracking-tighter">{balance.toFixed(4)}</span><span className="text-lg opacity-60 font-black">USDT</span></div>
                                <p className="text-sm font-black opacity-80 mt-1 flex items-center gap-1"><IndianRupee size={12} /> {(balance * exchangeRate).toFixed(2)} INR</p>
                            </div>
                            <div className="absolute left-0 top-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-2">
                                {['TON', 'GIFT_CARD', 'UPI'].map(net => (
                                    <button key={net} onClick={() => { setWithdrawNetwork(net as any); setWithdrawAmount(''); }} className={`py-3.5 rounded-2xl text-[10px] font-black border uppercase tracking-widest transition-all shadow-sm ${withdrawNetwork === net ? 'border-black bg-black text-white shadow-lg' : 'border-gray-100 bg-white text-gray-400'}`}>
                                        {net === 'GIFT_CARD' ? 'Google Play' : net === 'TON' ? 'USDT TON' : net}
                                    </button>
                                ))}
                            </div>

                            <div className="card p-6 rounded-[32px] border-l-4 border-l-black shadow-sm">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Receiving Destination</label>
                                {withdrawNetwork === 'TON' && (
                                    <input type="text" placeholder="TON Wallet Address (0x...)" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/10 shadow-inner" value={tonAddress} onChange={(e) => setTonAddress(e.target.value)} />
                                )}
                                {withdrawNetwork === 'UPI' && (
                                    <input type="text" placeholder="UPI ID / VPA (user@bank)" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/10 shadow-inner" value={upiId} onChange={(e) => setUpiId(e.target.value)} />
                                )}
                                {withdrawNetwork === 'GIFT_CARD' && (
                                    <input type="email" placeholder="Email for Google Play Code" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/10 shadow-inner" value={giftCardEmail} onChange={(e) => setGiftCardEmail(e.target.value)} />
                                )}
                            </div>

                            <div className="card p-6 rounded-[32px] border-l-4 border-l-black shadow-sm">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">Transfer Amount ({withdrawNetwork === 'TON' ? 'USDT' : 'INR'})</label>
                                <div className="relative">
                                    <input type="number" placeholder="0.00" className="w-full bg-gray-50 border border-gray-100 rounded-[24px] pl-12 pr-6 py-5 text-lg outline-none font-black focus:ring-2 focus:ring-blue-500/10 shadow-inner tracking-tight" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">
                                        {withdrawNetwork === 'TON' ? <span className="font-black">$</span> : <IndianRupee size={18}/>}
                                    </div>
                                    {withdrawNetwork === 'TON' && (
                                        <button onClick={() => setWithdrawAmount(balance.toFixed(4))} className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-white bg-black px-4 py-2 rounded-xl shadow-md">MAX</button>
                                    )}
                                </div>
                                <div className="mt-4 flex justify-between items-center text-[10px] font-black uppercase text-gray-400 tracking-widest">
                                    <span>Minimum: {withdrawNetwork === 'TON' ? `$${tonMinUsdt.toFixed(2)}` : withdrawNetwork === 'UPI' ? `₹${upiMinInr.toFixed(0)}` : `₹${gplayMinInr.toFixed(0)}`}</span>
                                    <span className="text-blue-600">Fee: {withdrawNetwork === 'TON' ? `$${gasUsdt}` : 'FREE'}</span>
                                </div>
                            </div>

                            <button onClick={handleWithdrawClick} className="w-full mt-2 py-6 rounded-[32px] bg-black text-white shadow-2xl flex items-center justify-center gap-4 font-black uppercase tracking-[0.25em] active:scale-95 transition-all text-sm">
                                {isWithdrawing ? <RefreshCw className="animate-spin" size={20} /> : 'Withdrawal'}
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="flex flex-col gap-4 animate-fadeIn">
                        <div className="flex p-1 bg-gray-100 rounded-2xl">
                            <button onClick={() => setHistorySubTab('earnings')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${historySubTab === 'earnings' ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}>Ad Revenue</button>
                            <button onClick={() => setHistorySubTab('withdrawals')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${historySubTab === 'withdrawals' ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}>Payout History</button>
                        </div>
                        <div className="space-y-3">
                            {(historySubTab === 'earnings' ? earningsHistory : withdrawalHistory).map((item: any) => (
                                <div key={item.id} className="card p-5 rounded-[32px] flex items-center justify-between shadow-sm border-l-4 border-l-black">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${historySubTab === 'earnings' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                                            {historySubTab === 'earnings' ? <Zap size={20}/> : <History size={20}/>}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-black tracking-tight">{item.source || (item.network === 'GIFT_CARD' ? 'Google Play Card' : item.network === 'TON' ? 'USDT Ton Network' : item.network)}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm font-black tracking-tight ${historySubTab === 'earnings' ? 'text-green-600' : 'text-black'}`}>
                                            {historySubTab === 'earnings' ? `+$${item.amount.toFixed(4)}` : (item.netPayoutINR ? `₹${item.netPayoutINR.toFixed(2)}` : `$${item.netPayout.toFixed(4)}`)}
                                        </p>
                                        {historySubTab === 'withdrawals' && (
                                            <span className={`text-[8px] px-2 py-0.5 rounded-full uppercase font-black tracking-widest mt-1 block ${item.status === 'PAID' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                                                {item.status}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {(historySubTab === 'earnings' ? earningsHistory : withdrawalHistory).length === 0 && (
                                <div className="text-center py-20">
                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">No activity recorded</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {showConfirmModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 backdrop-blur-md bg-black/60 animate-fadeIn">
                    <div className="bg-white w-full max-sm rounded-[40px] overflow-hidden shadow-2xl relative border border-gray-100">
                        <div className="bg-black px-8 pt-12 pb-10 flex flex-col items-center text-center relative overflow-hidden">
                            <div className="relative mb-4 z-10"><div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center text-white border border-white/20 shadow-2xl"><ShieldCheck size={40} /></div></div>
                            <h3 className="text-2xl font-black text-white tracking-tighter uppercase z-10">Sign Request</h3>
                            <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-600/30 rounded-full blur-[60px]" />
                        </div>
                        <div className="px-6 -mt-8 relative z-10">
                            <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-2xl flex flex-col items-center">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Secure Withdrawal Settlement</p>
                                <div className="flex flex-col items-center gap-1">
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-4xl font-black text-black tracking-tighter">
                                            {withdrawNetwork === 'TON' 
                                                ? (parseFloat(withdrawAmount) - gasUsdt).toFixed(4)
                                                : `₹${parseFloat(withdrawAmount).toFixed(0)}`
                                            }
                                        </span>
                                        <span className="text-sm font-black text-blue-600 uppercase tracking-widest">{withdrawNetwork === 'TON' ? 'USDT' : (withdrawNetwork === 'UPI' ? 'INR' : 'GPLAY')}</span>
                                    </div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        Gas Fee: {withdrawNetwork === 'TON' ? `$${gasUsdt}` : 'FREE'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="px-8 pt-8 pb-10 space-y-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Gateway</div>
                                    <span className="text-[11px] font-black text-black uppercase tracking-widest">
                                        {withdrawNetwork === 'GIFT_CARD' ? 'Google Play Card' : withdrawNetwork === 'TON' ? 'USDT TON Network' : 'UPI Network'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Target</div>
                                    <span className="text-[11px] font-mono break-all text-right text-black max-w-[65%] font-black uppercase">
                                        {withdrawNetwork === 'TON' ? tonAddress : withdrawNetwork === 'UPI' ? upiId : giftCardEmail}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3">
                                <button onClick={confirmWithdrawal} className="bg-black w-full py-5 rounded-[24px] text-white font-black shadow-2xl text-sm uppercase tracking-[0.25em] active:scale-95 transition-all">Withdrawal</button>
                                <button onClick={() => setShowConfirmModal(false)} className="w-full py-2 text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Cancel Transaction</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 px-6 py-4 flex justify-between items-center z-50 shadow-2xl">
                <button onClick={() => { setActiveTab('home'); setIsAdminView(false); }} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'home' && !isAdminView ? 'text-black scale-110' : 'text-gray-300'}`}><Home size={22} /><span className="text-[9px] font-black uppercase tracking-[0.15em]">Home</span></button>
                <button onClick={() => { setActiveTab('ads'); setIsAdminView(false); }} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'ads' ? 'text-black scale-110' : 'text-gray-300'}`}><Zap size={22} /><span className="text-[9px] font-black uppercase tracking-[0.15em]">Ads</span></button>
                <button onClick={() => { setActiveTab('wallet'); setIsAdminView(false); }} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'wallet' ? 'text-black scale-110' : 'text-gray-300'}`}><Wallet size={22} /><span className="text-[9px] font-black uppercase tracking-[0.15em]">Wallet</span></button>
                <button onClick={() => { setActiveTab('history'); setIsAdminView(false); }} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'history' ? 'text-black scale-110' : 'text-gray-300'}`}><History size={22} /><span className="text-[9px] font-black uppercase tracking-[0.15em]">History</span></button>
            </nav>
        </div>
    );
};

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}