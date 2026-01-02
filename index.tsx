import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Home, Play, Wallet, History, Clock, Landmark, ExternalLink, 
  Sparkles, X, AlertCircle, ArrowUpRight, CheckCircle2, Save, 
  ShieldCheck, Shield, BarChart3, Download, Check, Ban, 
  ChevronRight, Users, TrendingUp, Calendar, Info, MapPin, Hash, Zap,
  Mail, Smartphone, IndianRupee, RefreshCw, Settings, UserPlus, MinusCircle, PlusCircle, LayoutDashboard,
  FileDown, Square, CheckSquare, Layers, Award, KeyRound, ChevronDown, Gift, Copy, Search, Bot, Trash2, Megaphone
} from 'lucide-react';

// --- AUTHORIZATION CONFIG ---
const AUTHORIZED_ADMIN_ID = 6601027952; 
const SECRET_ADMIN_PASSCODE = "REWARD_SOFTWARE_PRO_ADMIN_ULTRA_LONG_SECURE_PASSCODE_2025_ACCESS_GRANTED_7952"; 

// Helper to avoid floating point issues for USDT (6 decimals)
const toCents = (val: number | string) => Math.round(parseFloat(val.toString()) * 1000000);
const fromCents = (val: number) => val / 1000000;

const App = () => {
    const tg = (window as any).Telegram?.WebApp;

    const [activeTab, setActiveTab] = useState('home');
    const [user, setUser] = useState({ id: 0, first_name: 'Guest', username: '' });
    const [isAdminView, setIsAdminView] = useState(false);
    
    // Secret Auth State
    const [headerClicks, setHeaderClicks] = useState(0);
    const [showPasscodeModal, setShowPasscodeModal] = useState(false);
    const [inputPasscode, setInputPasscode] = useState("");
    const [isPasscodeAuthenticated, setIsPasscodeAuthenticated] = useState(() => localStorage.getItem('isAdminAuth') === 'true');

    // Admin Sub Tabs
    const [adminSubTab, setAdminSubTab] = useState<'dashboard' | 'withdrawals' | 'users' | 'settings'>('dashboard');
    const [adminWithdrawalFilter, setAdminWithdrawalFilter] = useState<'ALL' | 'PENDING' | 'PAID' | 'REJECTED'>('PENDING');
    
    // --- DYNAMIC CONFIG (ADMIN SETTINGS) ---
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
    const [task1Claimed, setTask1Claimed] = useState(() => localStorage.getItem('task1Claimed') === 'true');
    const [task2Claimed, setTask2Claimed] = useState(() => localStorage.getItem('task2Claimed') === 'true');

    // --- WALLET TAB SPECIFIC ---
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawNetwork, setWithdrawNetwork] = useState<'TON' | 'GIFT_CARD' | 'UPI'>('TON');

    // --- ADMIN SPECIFIC STATE ---
    const [usersList, setUsersList] = useState<any[]>(() => {
        const saved = localStorage.getItem('usersList');
        return saved ? JSON.parse(saved) : [
            { id: 1001, name: 'Alice', username: 'alice_crypto', balance: 5.05, joined: Date.now() - 86400000 * 5 },
            { id: 1002, name: 'Bob', username: 'bob_payout', balance: 1.01, joined: Date.now() - 86400000 * 2 }
        ];
    });
    
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const [historySubTab, setHistorySubTab] = useState('earnings');

    const isUserAdmin = useMemo(() => {
        return user.id === AUTHORIZED_ADMIN_ID || isPasscodeAuthenticated;
    }, [user.id, isPasscodeAuthenticated]);

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
        localStorage.setItem('isAdminAuth', isPasscodeAuthenticated.toString());
        localStorage.setItem('task1Claimed', task1Claimed.toString());
        localStorage.setItem('task2Claimed', task2Claimed.toString());
        
        localStorage.setItem('cfg_adReward', adReward.toString());
        localStorage.setItem('cfg_adCooldownSec', adCooldownSec.toString());
        localStorage.setItem('cfg_tonMinUsdt', tonMinUsdt.toString());
        localStorage.setItem('cfg_tonMaxUsdt', tonMaxUsdt.toString());
        localStorage.setItem('cfg_upiMinInr', upiMinInr.toString());
        localStorage.setItem('cfg_gplayMinInr', gplayMinInr.toString());
        localStorage.setItem('cfg_gasUsdt', gasUsdt.toString());
    }, [balance, earningsHistory, withdrawalHistory, adCooldowns, tonAddress, upiId, giftCardEmail, exchangeRate, usersList, adReward, adCooldownSec, tonMinUsdt, tonMaxUsdt, upiMinInr, gplayMinInr, gasUsdt, isPasscodeAuthenticated, task1Claimed, task2Claimed]);

    useEffect(() => {
        if (tg) {
            tg.ready();
            tg.expand();
            if (tg.initDataUnsafe?.user) {
                const u = tg.initDataUnsafe.user;
                setUser(u);
                setUsersList(prev => {
                    const existingIdx = prev.findIndex(item => item.id === u.id);
                    if (existingIdx !== -1) {
                        const updated = [...prev];
                        updated[existingIdx] = { ...updated[existingIdx], username: u.username || '', name: u.first_name };
                        return updated;
                    }
                    return [...prev, { id: u.id, name: u.first_name, username: u.username || '', balance: balance, totalEarned: 0, joined: Date.now() }];
                });
            }
        }
        const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
        return () => clearInterval(timer);
    }, [tg]);

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
        const pendingCount = withdrawalHistory.filter((w: any) => w.status === 'PENDING').length;
        const totalRequestCount = withdrawalHistory.length;
        return { totalSystemBalance, totalPending, totalPaid, activeUsersCount, pendingCount, totalRequestCount };
    }, [usersList, withdrawalHistory]);

    const filteredWithdrawalsForAdmin = useMemo(() => {
        return withdrawalHistory.filter((w: any) => {
            if (adminWithdrawalFilter === 'ALL') return true;
            return w.status === adminWithdrawalFilter;
        });
    }, [withdrawalHistory, adminWithdrawalFilter]);

    const showMessage = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        setNotification({ message, type });
        if (tg && tg.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred(type === 'info' ? 'warning' : type);
        }
    };

    // --- AUTH ---
    const handleHeaderClick = () => {
        const newCount = headerClicks + 1;
        setHeaderClicks(newCount);
        if (newCount === 30) {
            setHeaderClicks(0);
            setShowPasscodeModal(true);
        }
        setTimeout(() => setHeaderClicks(0), 5000);
    };

    const handlePasscodeSubmit = () => {
        if (inputPasscode === SECRET_ADMIN_PASSCODE) {
            setIsPasscodeAuthenticated(true);
            setShowPasscodeModal(false);
            setInputPasscode("");
            showMessage("Access Granted", "success");
        } else {
            showMessage("Access Denied", "error");
            setInputPasscode("");
        }
    };

    // --- ADMIN ACTIONS ---
    const adjustUserBalance = (userId: number, delta: number) => {
        setUsersList(prev => prev.map(u => u.id === userId ? { ...u, balance: Math.max(0, fromCents(toCents(u.balance) + toCents(delta))) } : u));
        if (userId === user.id) setBalance(prev => Math.max(0, fromCents(toCents(prev) + toCents(delta))));
        showMessage(`Balance adjusted by $${delta}`, 'info');
    };

    const deleteWithdrawal = (id: string) => {
        setWithdrawalHistory(prev => prev.filter(w => w.id !== id));
        showMessage('Request removed', 'info');
    };

    const updateWithdrawalStatus = (ids: string[], status: 'PAID' | 'REJECTED') => {
        setWithdrawalHistory(prev => prev.map((w: any) => ids.includes(w.id) ? { ...w, status } : w));
        showMessage(`Requests marked as ${status}`, 'success');
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        showMessage('Copied to clipboard', 'success');
    };

    const getNetworkDisplayName = (net: string) => {
        if (net === 'TON') return 'USDT Ton';
        if (net === 'GIFT_CARD') return 'Google Play Giftcard';
        if (net === 'UPI') return 'UPI';
        return net;
    };

    // --- USER ACTIONS (WATCH ADS) ---
    const handleWatchAd = (adId: string) => {
        if (adCooldowns[adId] > currentTime) return;
        if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');

        const rewardUser = () => {
            const now = Date.now();
            const rewardAmount = adReward;
            setBalance(prev => fromCents(toCents(prev) + toCents(rewardAmount)));
            setAdCooldowns(prev => ({ ...prev, [adId]: now + (adCooldownSec * 1000) }));
            setEarningsHistory(prev => [{ 
                id: Math.random().toString(36).substr(2, 9), 
                source: `AD SLOT ${adId.replace('ads', '')}`, 
                amount: rewardAmount, 
                timestamp: now 
            }, ...prev]);
            setUsersList(prev => prev.map(u => u.id === user.id ? { 
                ...u, 
                balance: fromCents(toCents(u.balance) + toCents(rewardAmount)), 
                totalEarned: (u.totalEarned || 0) + rewardAmount 
            } : u));
            showMessage(`Success! +$${rewardAmount.toFixed(4)}`, 'success');
        };

        if (adId === 'ads1') {
            const gigaFn = (window as any).showGiga;
            if (typeof gigaFn === 'function') {
                try { gigaFn().then(rewardUser).catch(() => rewardUser()); } catch (e) { rewardUser(); }
            } else { rewardUser(); }
        } else {
            const adFn = (window as any).show_10380842;
            if (typeof adFn === 'function') {
                try { adFn().then(rewardUser).catch(() => rewardUser()); } catch (e) { rewardUser(); }
            } else { rewardUser(); }
        }
    };

    // --- TASK ACTIONS ---
    const handleClaimTask1 = () => {
        if (task1Claimed) return;
        if (tg) { tg.openTelegramLink('https://t.me/Rewardsoftware_bot'); } else { window.open('https://t.me/Rewardsoftware_bot', '_blank'); }
        const rewardAmount = 10.00;
        const now = Date.now();
        setBalance(prev => fromCents(toCents(prev) + toCents(rewardAmount)));
        setTask1Claimed(true);
        setEarningsHistory(prev => [{ 
            id: Math.random().toString(36).substr(2, 9), 
            source: "TASK: JOIN BOT", 
            amount: rewardAmount, 
            timestamp: now 
        }, ...prev]);
        setUsersList(prev => prev.map(u => u.id === user.id ? { 
            ...u, 
            balance: fromCents(toCents(u.balance) + toCents(rewardAmount)), 
            totalEarned: (u.totalEarned || 0) + rewardAmount 
        } : u));
        showMessage("Success! $10 task claimed", "success");
    };

    const handleClaimTask2 = () => {
        if (task2Claimed) return;
        if (tg) { tg.openTelegramLink('https://t.me/Rewardsoftware_'); } else { window.open('https://t.me/Rewardsoftware_', '_blank'); }
        const rewardAmount = 5.00;
        const now = Date.now();
        setBalance(prev => fromCents(toCents(prev) + toCents(rewardAmount)));
        setTask2Claimed(true);
        setEarningsHistory(prev => [{ 
            id: Math.random().toString(36).substr(2, 9), 
            source: "TASK: JOIN CHANNEL", 
            amount: rewardAmount, 
            timestamp: now 
        }, ...prev]);
        setUsersList(prev => prev.map(u => u.id === user.id ? { 
            ...u, 
            balance: fromCents(toCents(u.balance) + toCents(rewardAmount)), 
            totalEarned: (u.totalEarned || 0) + rewardAmount 
        } : u));
        showMessage("Success! $5 task claimed", "success");
    };

    const handleWithdrawClick = () => {
        const addr = withdrawNetwork === 'TON' ? tonAddress : withdrawNetwork === 'UPI' ? upiId : giftCardEmail;
        if (!addr) return showMessage(`Enter your payout detail`, 'error');
        const inputAmount = parseFloat(withdrawAmount);
        if (!withdrawAmount || isNaN(inputAmount) || inputAmount <= 0) return showMessage('Invalid amount', 'error');

        let needed = 0;
        if (withdrawNetwork === 'TON') {
            if (inputAmount < tonMinUsdt) return showMessage(`Min ${tonMinUsdt} USDT`, 'error');
            needed = inputAmount;
        } else {
            const minInr = withdrawNetwork === 'UPI' ? upiMinInr : gplayMinInr;
            if (inputAmount < minInr) return showMessage(`Min ₹${minInr}`, 'error');
            needed = inputAmount / exchangeRate;
        }

        if (balance < needed) return showMessage('Insufficient funds', 'error');
        setShowConfirmModal(true);
    };

    const confirmWithdrawal = () => {
        const inputAmount = parseFloat(withdrawAmount);
        const currentGas = withdrawNetwork === 'TON' ? gasUsdt : 0;
        let totalDeduct = 0, netUsdt = 0, netInr = null;

        if (withdrawNetwork === 'TON') {
            totalDeduct = inputAmount;
            netUsdt = inputAmount - currentGas;
        } else {
            netInr = inputAmount;
            netUsdt = inputAmount / exchangeRate;
            totalDeduct = netUsdt;
        }

        setIsWithdrawing(true);
        setShowConfirmModal(false);
        setTimeout(() => {
            const now = Date.now();
            setBalance(prev => fromCents(toCents(prev) - toCents(totalDeduct)));
            setWithdrawalHistory(prev => [{
                id: Math.random().toString(36).substr(2, 9),
                amount: totalDeduct,
                netPayout: netUsdt,
                netPayoutINR: netInr,
                gasFee: currentGas,
                network: getNetworkDisplayName(withdrawNetwork),
                status: 'PENDING',
                address: withdrawNetwork === 'TON' ? tonAddress : withdrawNetwork === 'UPI' ? upiId : giftCardEmail,
                user_name: user.first_name,
                user_id: user.id,
                timestamp: now
            }, ...prev]);
            setIsWithdrawing(false);
            setWithdrawAmount('');
            showMessage('Request Submitted', 'success');
            setActiveTab('history');
            setHistorySubTab('withdrawals');
        }, 1000);
    };

    const getCooldownText = (adId: string) => {
        const remaining = (adCooldowns[adId] || 0) - currentTime;
        if (remaining <= 0) return 'Watch Ad';
        const mins = Math.floor(remaining / 60000);
        const secs = Math.floor((remaining % 60000) / 1000);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

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
                            <div className="flex items-center gap-2 cursor-pointer select-none" onClick={handleHeaderClick}>
                                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-black text-sm">R</div>
                                <div>
                                    <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 uppercase tracking-tighter leading-none">Adsgptpro</h1>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Reward Software</p>
                                </div>
                            </div>
                            {isUserAdmin && (
                                <button onClick={() => setIsAdminView(true)} className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 active:scale-95 shadow-sm">
                                    <Shield size={20} />
                                </button>
                            )}
                        </div>

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

                        <div className="card p-5 rounded-3xl flex items-center gap-4 border-l-4 border-l-indigo-600 shadow-sm">
                            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm"><Bot size={22} /></div>
                            <div className="flex-1">
                                <h4 className="font-bold text-sm tracking-tight text-black">Earn More</h4>
                                <p className="text-xs text-gray-500">Join Reward Software Bot</p>
                            </div>
                            <button 
                                onClick={() => {
                                    if (tg) tg.openTelegramLink('https://t.me/Rewardsoftware_bot');
                                    else window.open('https://t.me/Rewardsoftware_bot', '_blank');
                                }} 
                                className="bg-indigo-600 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 shadow-md shadow-indigo-100"
                            >
                                Open
                            </button>
                        </div>
                    </div>
                )}

                {isAdminView && isUserAdmin ? (
                    <div className="flex flex-col gap-6 animate-fadeIn pb-20">
                        <header className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg">R</div>
                                <div>
                                    <h2 className="text-xl font-black uppercase tracking-tight leading-none text-black">Console</h2>
                                    <p className="text-[10px] font-bold text-blue-600 uppercase">Admin Tools</p>
                                </div>
                            </div>
                            <button onClick={() => setIsAdminView(false)} className="bg-gray-100 p-2.5 rounded-xl active:scale-95"><X size={20} /></button>
                        </header>

                        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2">
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
                                <div className="bg-black p-5 rounded-[32px] text-white flex flex-col gap-1 shadow-xl border border-gray-800">
                                    <p className="text-[10px] font-black opacity-60 uppercase tracking-widest">Global Balance</p>
                                    <p className="text-2xl font-black">${adminAnalytics.totalSystemBalance.toFixed(2)}</p>
                                </div>
                                <div className="bg-green-50 p-5 rounded-[32px] flex flex-col gap-1 border border-green-100 shadow-sm">
                                    <p className="text-[10px] font-black text-green-700 uppercase tracking-widest">Total Paid</p>
                                    <p className="text-2xl font-black text-green-800">${adminAnalytics.totalPaid.toFixed(2)}</p>
                                </div>
                                <div className="bg-blue-50 p-5 rounded-[32px] flex flex-col gap-1 border border-blue-100 col-span-2 shadow-sm">
                                    <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Active Users</p>
                                    <p className="text-2xl font-black text-blue-800">{adminAnalytics.activeUsersCount}</p>
                                </div>
                            </div>
                        )}

                        {adminSubTab === 'withdrawals' && (
                            <div className="space-y-4 animate-fadeIn">
                                <div className="flex justify-between items-center px-2">
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase">Requests View</p>
                                        <h3 className="text-lg font-black text-black">Payout Queue ({adminAnalytics.totalRequestCount})</h3>
                                    </div>
                                    <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100">
                                        <Clock size={14} className="text-amber-600" />
                                        <span className="text-[10px] font-black text-amber-700">{adminAnalytics.pendingCount} PENDING</span>
                                    </div>
                                </div>

                                <div className="flex p-1 bg-gray-100 rounded-xl overflow-x-auto hide-scrollbar whitespace-nowrap">
                                    {(['ALL', 'PENDING', 'PAID', 'REJECTED'] as const).map(f => (
                                        <button key={f} onClick={() => setAdminWithdrawalFilter(f)} className={`px-4 py-2 text-[10px] font-black rounded-lg transition-all ${adminWithdrawalFilter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}>{f}</button>
                                    ))}
                                </div>

                                <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-1">
                                    {filteredWithdrawalsForAdmin.length === 0 ? (
                                        <div className="text-center py-20 bg-gray-50 rounded-[40px] border border-dashed">
                                            <Search size={40} className="mx-auto text-gray-200 mb-4" />
                                            <p className="text-gray-400 text-xs font-bold uppercase">No records matching filter</p>
                                        </div>
                                    ) : (
                                        filteredWithdrawalsForAdmin.map((w: any) => (
                                            <div key={w.id} className={`card p-5 rounded-[32px] border-l-4 ${w.status === 'PAID' ? 'border-l-green-500' : w.status === 'REJECTED' ? 'border-l-red-500' : 'border-l-yellow-500 shadow-xl shadow-yellow-50/50'}`}>
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <p className="text-sm font-black text-black leading-tight">{w.user_name}</p>
                                                        <p className="text-[9px] font-bold text-gray-400 uppercase mt-0.5">ID: {w.user_id}</p>
                                                        <div className="flex items-center gap-2 mt-1.5">
                                                            <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">{w.network}</span>
                                                            <p className="text-[9px] text-gray-400 font-bold">{new Date(w.timestamp).toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-lg font-black text-black leading-none">${w.amount.toFixed(4)}</p>
                                                        <p className="text-[10px] font-black text-green-600 mt-1">{w.netPayoutINR ? `₹${w.netPayoutINR.toFixed(2)}` : `$${w.netPayout.toFixed(4)}`}</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="bg-gray-50 p-3 rounded-2xl mb-4 border border-gray-100/50 group active:scale-[0.99] transition-all" onClick={() => copyToClipboard(w.address)}>
                                                    <div className="flex justify-between items-center mb-0.5">
                                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Target Payout</p>
                                                        <Copy size={10} className="text-gray-400" />
                                                    </div>
                                                    <p className="text-[10px] font-mono break-all text-black font-medium">{w.address}</p>
                                                </div>

                                                <div className="flex gap-2">
                                                    {w.status === 'PENDING' && (
                                                        <>
                                                            <button onClick={() => updateWithdrawalStatus([w.id], 'PAID')} className="flex-1 py-3.5 rounded-2xl bg-green-600 text-white text-[10px] font-black uppercase active:scale-95 shadow-lg shadow-green-100">Approve</button>
                                                            <button onClick={() => updateWithdrawalStatus([w.id], 'REJECTED')} className="flex-1 py-3.5 rounded-2xl bg-red-600 text-white text-[10px] font-black uppercase active:scale-95 shadow-lg shadow-red-100">Reject</button>
                                                        </>
                                                    )}
                                                    <button onClick={() => deleteWithdrawal(w.id)} className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center active:bg-red-50 active:text-red-500 transition-colors border border-gray-100"><Trash2 size={16} /></button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {adminSubTab === 'users' && (
                            <div className="space-y-3 animate-fadeIn max-h-[70vh] overflow-y-auto pr-1">
                                <div className="px-2 flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-black text-black">Member List ({adminAnalytics.activeUsersCount})</h3>
                                    <div className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl uppercase">Unlimited View</div>
                                </div>
                                {usersList.map((u: any) => (
                                    <div key={u.id} className="card p-4 rounded-[28px] flex items-center justify-between border-l-4 border-l-blue-600 hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-black uppercase shadow-inner text-sm">{u.name ? u.name[0] : '?'}</div>
                                            <div>
                                                <p className="text-sm font-black text-black leading-none">{u.name}</p>
                                                <p className="text-[10px] text-blue-600 font-bold mt-0.5 tracking-tight">@{u.username || 'no_username'}</p>
                                                <p className="text-[8px] text-gray-400 font-bold tracking-tight uppercase mt-1">ID: {u.id} | BAL: ${u.balance.toFixed(4)}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1.5">
                                            <button onClick={() => adjustUserBalance(u.id, 0.50)} className="w-9 h-9 rounded-xl bg-green-50 text-green-600 flex items-center justify-center active:scale-90 border border-green-100"><PlusCircle size={18}/></button>
                                            <button onClick={() => adjustUserBalance(u.id, -0.50)} className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center active:scale-90 border border-red-100"><MinusCircle size={18}/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {adminSubTab === 'settings' && (
                            <div className="space-y-6 animate-fadeIn">
                                <div className="p-6 rounded-[32px] bg-gray-50 border border-gray-100 shadow-sm">
                                    <label className="text-[10px] font-black text-gray-400 uppercase mb-4 block tracking-widest">Global Earnings</label>
                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-1.5">
                                            <p className="text-[9px] font-black text-gray-500 uppercase">Ad Reward (USDT)</p>
                                            <input type="number" step="0.0001" value={adReward} onChange={(e) => setAdReward(parseFloat(e.target.value))} className="bg-white border border-gray-100 rounded-2xl px-4 py-3 text-sm font-black outline-none focus:ring-2 focus:ring-blue-500/10" />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <p className="text-[9px] font-black text-gray-500 uppercase">Cooldown (Seconds)</p>
                                            <input type="number" value={adCooldownSec} onChange={(e) => setAdCooldownSec(parseInt(e.target.value))} className="bg-white border border-gray-100 rounded-2xl px-4 py-3 text-sm font-black outline-none focus:ring-2 focus:ring-blue-500/10" />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 rounded-[32px] bg-gray-50 border border-gray-100 shadow-sm">
                                    <label className="text-[10px] font-black text-gray-400 uppercase mb-4 block tracking-widest">Payout Gateways</label>
                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-1.5">
                                            <p className="text-[9px] font-black text-gray-500 uppercase">Conversion (USDT to INR)</p>
                                            <input type="number" value={exchangeRate} onChange={(e) => setExchangeRate(parseFloat(e.target.value))} className="bg-white border border-gray-100 rounded-2xl px-4 py-3 text-sm font-black outline-none focus:ring-2 focus:ring-blue-500/10" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="flex flex-col gap-1.5">
                                                <p className="text-[9px] font-black text-gray-500 uppercase">Min TON ($)</p>
                                                <input type="number" value={tonMinUsdt} onChange={(e) => setTonMinUsdt(parseFloat(e.target.value))} className="bg-white border border-gray-100 rounded-2xl px-4 py-3 text-sm font-black outline-none" />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <p className="text-[9px] font-black text-gray-500 uppercase">TON Fee ($)</p>
                                                <input type="number" value={gasUsdt} onChange={(e) => setGasUsdt(parseFloat(e.target.value))} className="bg-white border border-gray-100 rounded-2xl px-4 py-3 text-sm font-black outline-none" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : null}

                {activeTab === 'ads' && (
                    <div className="flex flex-col gap-4 animate-fadeIn">
                        <header><h2 className="text-2xl font-black uppercase tracking-tight text-black">Ad Stations</h2></header>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">Watch to earn USDT instantly</p>
                        
                        {/* AD STATIONS */}
                        {Array.from({ length: 10 }, (_, i) => `ads${i + 1}`).map((id, idx) => (
                            <div key={id} className="card p-5 rounded-[32px] flex items-center justify-between shadow-sm active:scale-[0.98] transition-transform">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center font-black text-white shadow-lg">{idx + 1}</div>
                                    <div>
                                        <p className="font-black text-sm text-black uppercase tracking-tighter">Station {idx + 1}</p>
                                        <p className="text-[10px] text-green-600 font-bold">+${adReward.toFixed(4)}</p>
                                    </div>
                                </div>
                                <button disabled={adCooldowns[id] > currentTime} onClick={() => handleWatchAd(id)} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${adCooldowns[id] > currentTime ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-black text-white shadow-xl hover:bg-gray-900 active:scale-95'}`}>{getCooldownText(id)}</button>
                            </div>
                        ))}

                        <div className="h-4"></div>
                        <h3 className="text-xl font-black uppercase tracking-tight text-black px-2">Reward Tasks</h3>

                        {/* TASK 1: BOT */}
                        <div className="card p-6 rounded-[32px] bg-gradient-to-br from-indigo-600 to-purple-700 text-white relative overflow-hidden shadow-2xl">
                            <div className="relative z-10 flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg"><Bot size={24} className="text-white" /></div>
                                    <div>
                                        <h3 className="font-black text-lg uppercase tracking-tight">Main Bot Task</h3>
                                        <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Join Software Bot</p>
                                    </div>
                                </div>
                                <p className="text-xs font-medium opacity-90 leading-relaxed">Unlock $10.00 instantly by joining our official Reward Software Bot.</p>
                                <div className="flex justify-between items-center mt-2">
                                    <div className="text-2xl font-black">+$10.00</div>
                                    <button 
                                        onClick={handleClaimTask1} 
                                        disabled={task1Claimed} 
                                        className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all ${task1Claimed ? 'bg-green-500 text-white cursor-default' : 'bg-white text-indigo-600 hover:bg-gray-100'}`}
                                    >
                                        {task1Claimed ? 'Claimed ✓' : 'Complete'}
                                    </button>
                                </div>
                            </div>
                            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                        </div>

                        {/* TASK 2: CHANNEL */}
                        <div className="card p-6 rounded-[32px] bg-gradient-to-br from-blue-500 to-cyan-600 text-white relative overflow-hidden shadow-2xl">
                            <div className="relative z-10 flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg"><Megaphone size={24} className="text-white" /></div>
                                    <div>
                                        <h3 className="font-black text-lg uppercase tracking-tight">Channel Task</h3>
                                        <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Join Telegram Channel</p>
                                    </div>
                                </div>
                                <p className="text-xs font-medium opacity-90 leading-relaxed">Get $5.00 extra by joining our official update channel to stay notified.</p>
                                <div className="flex justify-between items-center mt-2">
                                    <div className="text-2xl font-black">+$5.00</div>
                                    <button 
                                        onClick={handleClaimTask2} 
                                        disabled={task2Claimed} 
                                        className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all ${task2Claimed ? 'bg-green-500 text-white cursor-default' : 'bg-white text-blue-600 hover:bg-gray-100'}`}
                                    >
                                        {task2Claimed ? 'Claimed ✓' : 'Complete'}
                                    </button>
                                </div>
                            </div>
                            <div className="absolute -left-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                        </div>
                    </div>
                )}

                {activeTab === 'wallet' && (
                    <div className="flex flex-col gap-6 animate-fadeIn">
                        <header className="flex flex-col gap-1">
                            <h2 className="text-2xl font-black uppercase tracking-tight text-black leading-none">Withdraw Funds</h2>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Secure & Fast Payouts</p>
                        </header>
                        <div className="gradient-button p-8 rounded-[40px] shadow-2xl text-white flex flex-col items-center">
                            <p className="text-[11px] uppercase tracking-[0.3em] opacity-80 font-black mb-1">Available</p>
                            <div className="flex items-baseline gap-1.5"><span className="text-5xl font-black tracking-tighter">{balance.toFixed(4)}</span><span className="text-lg opacity-60 font-black">USDT</span></div>
                            <p className="text-sm font-black opacity-80 mt-1 flex items-center gap-1"><IndianRupee size={12} /> {(balance * exchangeRate).toFixed(2)} INR</p>
                        </div>
                        <div className="glass-card rounded-[40px] p-6 flex flex-col gap-6 border border-gray-100 shadow-xl bg-white">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Method</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button onClick={() => { setWithdrawNetwork('TON'); setWithdrawAmount(''); }} className={`py-3.5 rounded-2xl text-[9px] font-black border uppercase tracking-widest transition-all ${withdrawNetwork === 'TON' ? 'border-black bg-black text-white shadow-lg' : 'border-gray-100 bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>USDT Ton</button>
                                    <button onClick={() => { setWithdrawNetwork('GIFT_CARD'); setWithdrawAmount(''); }} className={`py-3.5 rounded-2xl text-[9px] font-black border uppercase tracking-widest transition-all ${withdrawNetwork === 'GIFT_CARD' ? 'border-black bg-black text-white shadow-lg' : 'border-gray-100 bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>Google Play Giftcard</button>
                                    <button onClick={() => { setWithdrawNetwork('UPI'); setWithdrawAmount(''); }} className={`py-3.5 rounded-2xl text-[9px] font-black border uppercase tracking-widest transition-all ${withdrawNetwork === 'UPI' ? 'border-black bg-black text-white shadow-lg' : 'border-gray-100 bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>UPI</button>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    {withdrawNetwork === 'TON' ? 'Enter USDT Ton address' : withdrawNetwork === 'UPI' ? 'Enter UPI number' : 'Enter Email Id'}
                                </label>
                                <input type="text" placeholder="Detail here" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:ring-2 focus:ring-black/5" value={withdrawNetwork === 'TON' ? tonAddress : withdrawNetwork === 'UPI' ? upiId : giftCardEmail} onChange={(e) => { if(withdrawNetwork === 'TON') setTonAddress(e.target.value); else if(withdrawNetwork === 'UPI') setUpiId(e.target.value); else setGiftCardEmail(e.target.value); }} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount ({withdrawNetwork === 'TON' ? 'USDT' : 'INR'})</label><span className="text-[9px] text-gray-400 font-bold">Fee: {withdrawNetwork === 'TON' ? `$${gasUsdt}` : '₹0.00'}</span></div>
                                <div className="relative"><input type="number" placeholder="0.00" className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-6 py-5 text-xl outline-none font-black focus:ring-2 focus:ring-black/5" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} /><div className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-gray-300 pointer-events-none">{withdrawNetwork === 'TON' ? 'USDT' : 'INR'}</div></div>
                            </div>
                            <button onClick={handleWithdrawClick} disabled={isWithdrawing} className="w-full py-6 rounded-3xl bg-black text-white flex items-center justify-center gap-4 font-black uppercase tracking-[0.25em] active:scale-95 shadow-xl transition-all disabled:opacity-50">{isWithdrawing ? <RefreshCw className="animate-spin" size={20} /> : 'Process Payout'}</button>
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="flex flex-col gap-4 animate-fadeIn">
                        <div className="flex p-1 bg-gray-100 rounded-2xl">
                            <button onClick={() => setHistorySubTab('earnings')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${historySubTab === 'earnings' ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}>Earnings</button>
                            <button onClick={() => setHistorySubTab('withdrawals')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${historySubTab === 'withdrawals' ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}>Payouts</button>
                        </div>
                        <div className="space-y-3">
                            {(historySubTab === 'earnings' ? earningsHistory : withdrawalHistory).map((item: any) => (
                                <div key={item.id} className="card p-5 rounded-[32px] flex items-center justify-between shadow-sm border-l-4 border-l-green-600">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-green-50 text-green-600 font-bold uppercase text-xs">{item.source ? item.source[0] : item.network[0]}</div>
                                        <div>
                                            <p className="text-sm font-black text-black leading-tight">{item.source || item.network}</p>
                                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter mt-0.5">{new Date(item.timestamp).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-green-600 leading-none">
                                            {historySubTab === 'earnings' ? `+$${item.amount.toFixed(4)}` : (item.netPayoutINR ? `₹${item.netPayoutINR.toFixed(2)}` : `$${item.netPayout.toFixed(4)}`)}
                                        </p>
                                        {historySubTab === 'withdrawals' && <span className="text-[7px] font-black uppercase text-white bg-green-500 px-1.5 py-0.5 rounded-md mt-1 inline-block">{item.status}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {showPasscodeModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 backdrop-blur-md bg-black/60 animate-fadeIn">
                    <div className="bg-white w-full max-w-xs rounded-[40px] shadow-2xl p-8 border border-gray-100 flex flex-col items-center text-center gap-4">
                        <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600"><KeyRound size={32} /></div>
                        <h3 className="text-xl font-black tracking-tight uppercase">Admin Login</h3>
                        <input type="password" autoFocus className="w-full bg-gray-50 border rounded-2xl px-5 py-4 text-center font-black tracking-[0.2em] text-lg outline-none" value={inputPasscode} onChange={(e) => setInputPasscode(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handlePasscodeSubmit()} />
                        <button onClick={handlePasscodeSubmit} className="bg-black text-white w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs active:scale-95 shadow-xl">Unlock Console</button>
                        <button onClick={() => setShowPasscodeModal(false)} className="text-gray-300 font-black uppercase text-[9px]">Cancel</button>
                    </div>
                </div>
            )}

            {showConfirmModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 backdrop-blur-md bg-black/60 animate-fadeIn">
                    <div className="bg-white w-full max-sm rounded-[40px] overflow-hidden shadow-2xl border border-gray-100">
                        <div className="bg-black px-8 py-8 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-white border border-white/20 mb-3"><ShieldCheck size={32} /></div>
                            <h3 className="text-xl font-black text-white tracking-tighter uppercase">Confirm Payout</h3>
                        </div>
                        
                        <div className="px-8 py-6 flex flex-col gap-4 border-b border-gray-100">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-gray-400 uppercase">Network</span>
                                <span className="text-[10px] font-black text-black uppercase bg-gray-100 px-2 py-1 rounded-lg">
                                    {getNetworkDisplayName(withdrawNetwork)}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] font-black text-gray-400 uppercase">Payout Details</span>
                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <p className="text-[10px] font-mono break-all font-black text-blue-600">
                                        {withdrawNetwork === 'TON' ? tonAddress : withdrawNetwork === 'UPI' ? upiId : giftCardEmail}
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-gray-400 uppercase">Gross Amount</span>
                                <span className="text-sm font-black text-black">{withdrawAmount} {withdrawNetwork === 'TON' ? 'USDT' : 'INR'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-gray-400 uppercase">Fee</span>
                                <span className="text-[10px] font-black text-red-500">{withdrawNetwork === 'TON' ? `-$${gasUsdt}` : '₹0.00'}</span>
                            </div>
                            <div className="flex justify-between items-center bg-green-50 p-3 rounded-2xl border border-green-100">
                                <span className="text-[10px] font-black text-green-700 uppercase">Net Payout</span>
                                <span className="text-lg font-black text-green-800">
                                    {withdrawNetwork === 'TON' ? `$${(parseFloat(withdrawAmount) - gasUsdt).toFixed(4)}` : `₹${parseFloat(withdrawAmount).toFixed(2)}`}
                                </span>
                            </div>
                        </div>

                        <div className="px-8 py-8 flex flex-col gap-3">
                            <button onClick={confirmWithdrawal} className="bg-black text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl active:scale-95 text-xs transition-all">Send Request</button>
                            <button onClick={() => setShowConfirmModal(false)} className="text-gray-300 font-black uppercase text-[10px] py-2">Go Back</button>
                        </div>
                    </div>
                </div>
            )}

            <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 px-6 py-4 flex justify-between items-center z-50 shadow-2xl">
                <button onClick={() => { setActiveTab('home'); setIsAdminView(false); }} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'home' && !isAdminView ? 'text-black scale-110' : 'text-gray-300'}`}><Home size={22} /><span className="text-[9px] font-black uppercase">Home</span></button>
                <button onClick={() => { setActiveTab('ads'); setIsAdminView(false); }} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'ads' ? 'text-black scale-110' : 'text-gray-300'}`}><Zap size={22} /><span className="text-[9px] font-black uppercase">Ads</span></button>
                <button onClick={() => { setActiveTab('wallet'); setIsAdminView(false); }} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'wallet' ? 'text-black scale-110' : 'text-gray-300'}`}><Wallet size={22} /><span className="text-[9px] font-black uppercase">Wallet</span></button>
                <button onClick={() => { setActiveTab('history'); setIsAdminView(false); }} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'history' ? 'text-black scale-110' : 'text-gray-300'}`}><History size={22} /><span className="text-[9px] font-black uppercase">History</span></button>
            </nav>
        </div>
    );
};

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}