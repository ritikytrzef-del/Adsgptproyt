import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Home, Wallet, History, Clock, Landmark, X, AlertCircle, CheckCircle2, 
  ShieldCheck, Shield, ChevronRight, Users, Zap, IndianRupee, RefreshCw, 
  Settings, MinusCircle, PlusCircle, LayoutDashboard, KeyRound, Copy, 
  Search, Bot, Trash2, Megaphone, Gift, Info, Share2, UserPlus, CreditCard, Star
} from 'lucide-react';

// --- CONFIGURATION ---
const AUTHORIZED_ADMIN_ID = 6601027952; 
const ADMIN_CHAT_ID = "6601027952";
const BOT_TOKEN = "8511554119:AAGAQLkLPEsX3KHCNk5hfkK8ok1pM_qiQm4";
const SECRET_ADMIN_PASSCODE = "REWARD_SOFTWARE_PRO_ADMIN_ULTRA_LONG_SECURE_PASSCODE_2025_ACCESS_GRANTED_7952"; 
const AUTO_PAID_TIMEOUT = 24 * 60 * 60 * 1000; // 24 Hours in ms

// Helper to avoid floating point issues
const toCents = (val: number | string) => Math.round(parseFloat(val.toString()) * 1000000);
const fromCents = (val: number) => val / 1000000;

const App = () => {
    const tg = (window as any).Telegram?.WebApp;

    const [activeTab, setActiveTab] = useState('home');
    const [user, setUser] = useState({ id: 0, first_name: 'Guest', username: '' });
    const [isAdminView, setIsAdminView] = useState(false);
    
    // Auth
    const [headerClicks, setHeaderClicks] = useState(0);
    const [showPasscodeModal, setShowPasscodeModal] = useState(false);
    const [inputPasscode, setInputPasscode] = useState("");
    const [isPasscodeAuthenticated, setIsPasscodeAuthenticated] = useState(() => localStorage.getItem('isAdminAuth') === 'true');

    // Admin Tabs
    const [adminSubTab, setAdminSubTab] = useState<'dashboard' | 'withdrawals' | 'users' | 'settings'>('dashboard');
    const [adminWithdrawalFilter, setAdminWithdrawalFilter] = useState<'ALL' | 'PENDING' | 'PAID' | 'REJECTED'>('PENDING');
    
    // Config
    const [adReward, setAdReward] = useState(() => Number(localStorage.getItem('cfg_adReward')) || 0.0002);
    const [adCooldownSec, setAdCooldownSec] = useState(() => Number(localStorage.getItem('cfg_adCooldownSec')) || 120);
    const [tonMinUsdt, setTonMinUsdt] = useState(() => Number(localStorage.getItem('cfg_tonMinUsdt')) || 2.00);
    const [upiMinInr, setUpiMinInr] = useState(() => Number(localStorage.getItem('cfg_upiMinInr')) || 100.00);
    const [gplayMinInr, setGplayMinInr] = useState(() => Number(localStorage.getItem('cfg_gplayMinInr')) || 30.00);
    const [gasUsdt, setGasUsdt] = useState(() => Number(localStorage.getItem('cfg_gasUsdt')) || 0.03);

    // Core State
    const [balance, setBalance] = useState(() => Number(localStorage.getItem('balance')) || 0.0000);
    const [earningsHistory, setEarningsHistory] = useState(() => JSON.parse(localStorage.getItem('earningsHistory') || '[]'));
    const [withdrawalHistory, setWithdrawalHistory] = useState(() => JSON.parse(localStorage.getItem('withdrawalHistory') || '[]'));
    const [exchangeRate, setExchangeRate] = useState(() => Number(localStorage.getItem('exchangeRate')) || 90.00);
    const [tonAddress, setTonAddress] = useState(() => localStorage.getItem('tonAddress') || '');
    const [upiId, setUpiId] = useState(() => localStorage.getItem('upiId') || '');
    const [giftCardEmail, setGiftCardEmail] = useState(() => localStorage.getItem('giftCardEmail') || '');
    const [adCooldowns, setAdCooldowns] = useState<Record<string, number>>(() => JSON.parse(localStorage.getItem('adCooldowns') || '{}'));
    const [currentTime, setCurrentTime] = useState(Date.now());
    const [loadingAdId, setLoadingAdId] = useState<string | null>(null);
    
    // Tasks
    const [task1Claimed, setTask1Claimed] = useState(() => localStorage.getItem('task1Claimed') === 'true');
    const [task2Claimed, setTask2Claimed] = useState(() => localStorage.getItem('task2Claimed') === 'true');
    const [task3Claimed, setTask3Claimed] = useState(() => localStorage.getItem('task3Claimed') === 'true');

    // Wallet
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawNetwork, setWithdrawNetwork] = useState<'TON' | 'GIFT_CARD' | 'UPI'>('TON');

    // Admin List
    const [usersList, setUsersList] = useState<any[]>(() => {
        const saved = localStorage.getItem('usersList');
        return saved ? JSON.parse(saved) : [];
    });
    
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const [historySubTab, setHistorySubTab] = useState('earnings');

    const isUserAdmin = useMemo(() => {
        return user.id === AUTHORIZED_ADMIN_ID || isPasscodeAuthenticated;
    }, [user.id, isPasscodeAuthenticated]);

    const isFirstWithdrawal = useMemo(() => {
        return withdrawalHistory.length === 0;
    }, [withdrawalHistory]);

    // Save Data
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
        localStorage.setItem('task3Claimed', task3Claimed.toString());
        
        localStorage.setItem('cfg_adReward', adReward.toString());
        localStorage.setItem('cfg_adCooldownSec', adCooldownSec.toString());
        localStorage.setItem('cfg_tonMinUsdt', tonMinUsdt.toString());
        localStorage.setItem('cfg_upiMinInr', upiMinInr.toString());
        localStorage.setItem('cfg_gplayMinInr', gplayMinInr.toString());
        localStorage.setItem('cfg_gasUsdt', gasUsdt.toString());
    }, [balance, earningsHistory, withdrawalHistory, adCooldowns, tonAddress, upiId, giftCardEmail, exchangeRate, usersList, adReward, adCooldownSec, tonMinUsdt, upiMinInr, gplayMinInr, gasUsdt, isPasscodeAuthenticated, task1Claimed, task2Claimed, task3Claimed]);

    // Automatic Status Update (PENDING -> PAID after 24H)
    useEffect(() => {
        const checkAutoPay = () => {
            const now = Date.now();
            let changed = false;
            const updatedHistory = withdrawalHistory.map((w: any) => {
                if (w.status === 'PENDING' && (now - w.timestamp) >= AUTO_PAID_TIMEOUT) {
                    changed = true;
                    return { ...w, status: 'PAID' };
                }
                return w;
            });
            if (changed) {
                setWithdrawalHistory(updatedHistory);
            }
        };
        checkAutoPay();
    }, [currentTime, withdrawalHistory]);

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
                        updated[existingIdx] = { 
                            ...updated[existingIdx], 
                            username: u.username || '', 
                            name: u.first_name
                        };
                        return updated;
                    }
                    return [...prev, { 
                        id: u.id, 
                        name: u.first_name, 
                        username: u.username || '', 
                        balance: balance, 
                        joined: Date.now() 
                    }];
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

    // Analytics
    const stats = useMemo(() => {
        const today = new Date().toDateString();
        const todayEarnings = earningsHistory
            .filter((e: any) => new Date(e.timestamp).toDateString() === today)
            .reduce((acc: number, curr: any) => acc + curr.amount, 0);
        const totalEarnings = earningsHistory.reduce((acc: number, curr: any) => acc + curr.amount, 0);
        return { todayEarnings, totalEarnings };
    }, [earningsHistory]);

    const adminAnalytics = useMemo(() => {
        const totalSystemBalance = usersList.reduce((acc, u) => acc + (Number(u.balance) || 0), 0);
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

    // Secret Login
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

    // Admin Panel Ops
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

    // Payout logic
    const sendTelegramBotAlert = async (withdrawal: any) => {
        const text = `🚀 *New Payout Request*\n\n` +
                     `👤 *User:* ${withdrawal.user_name} (@${user.username || 'n/a'})\n` +
                     `🆔 *ID:* \`${withdrawal.user_id}\`\n` +
                     `💰 *Gross:* ${withdrawal.amount} USDT\n` +
                     `💸 *Net:* ${withdrawal.netPayoutINR ? '₹' + withdrawal.netPayoutINR.toFixed(2) : '$' + withdrawal.netPayout.toFixed(4)}\n` +
                     `🌐 *Network:* ${withdrawal.network}\n` +
                     `📍 *Address:* \`${withdrawal.address}\`\n\n` +
                     `🕒 *Time:* ${new Date(withdrawal.timestamp).toLocaleString()}\n` +
                     `⏱ _Auto-Paid will trigger in 24 hours._`;

        try {
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: ADMIN_CHAT_ID,
                    text: text,
                    parse_mode: 'Markdown'
                })
            });
        } catch (e) {
            console.error("Failed to send Telegram alert", e);
        }
    };

    // Reward User Logic
    const rewardUser = (stationId: string) => {
        const now = Date.now();
        const rewardAmount = adReward;
        setBalance(prev => fromCents(toCents(prev) + toCents(rewardAmount)));
        setAdCooldowns(prev => ({ ...prev, [stationId]: now + (adCooldownSec * 1000) }));
        setEarningsHistory(prev => [{ 
            id: Math.random().toString(36).substr(2, 9), 
            source: `STATION ${stationId.replace('ads', '')}`, 
            amount: rewardAmount, 
            timestamp: now 
        }, ...prev]);
        setUsersList(prev => prev.map(u => u.id === user.id ? { 
            ...u, 
            balance: fromCents(toCents(u.balance) + toCents(rewardAmount)), 
        } : u));
        showMessage(`Success! +$${rewardAmount.toFixed(4)}`, 'success');
    };

    // User Actions
    const handleWatchAd = (stationId: string) => {
        if (adCooldowns[stationId] > currentTime || loadingAdId) return;
        if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');

        setLoadingAdId(stationId);
        showMessage('Processing reward...', 'info');
        
        setTimeout(() => {
            rewardUser(stationId);
            setLoadingAdId(null);
        }, 2000);
    };

    const handleClaimTask = (taskId: number, url: string, amount: number) => {
        let isClaimed = false;
        if (taskId === 1) isClaimed = task1Claimed;
        if (taskId === 2) isClaimed = task2Claimed;
        if (taskId === 3) isClaimed = task3Claimed;
        
        if (isClaimed) return;

        if (tg) tg.openTelegramLink(url);
        else window.open(url, '_blank');

        const now = Date.now();
        setBalance(prev => fromCents(toCents(prev) + toCents(amount)));
        
        if (taskId === 1) setTask1Claimed(true);
        if (taskId === 2) setTask2Claimed(true);
        if (taskId === 3) setTask3Claimed(true);

        const sourceName = taskId === 1 ? "BOT TASK" : taskId === 2 ? "CHANNEL TASK 1" : "CHANNEL TASK 2";
        
        setEarningsHistory(prev => [{ 
            id: Math.random().toString(36).substr(2, 9), 
            source: sourceName, 
            amount: amount, 
            timestamp: now 
        }, ...prev]);
        
        setUsersList(prev => prev.map(u => u.id === user.id ? { 
            ...u, 
            balance: fromCents(toCents(u.balance) + toCents(amount)), 
        } : u));
        
        showMessage(`Success! $${amount} claimed`, "success");
    };

    const handleWithdrawClick = () => {
        const addr = withdrawNetwork === 'TON' ? tonAddress : withdrawNetwork === 'UPI' ? upiId : giftCardEmail;
        if (!addr) return showMessage(`Enter your payout detail`, 'error');
        const inputAmount = parseFloat(withdrawAmount);
        if (!withdrawAmount || isNaN(inputAmount) || inputAmount <= 0) return showMessage('Invalid amount', 'error');

        let needed = 0;
        if (withdrawNetwork === 'TON') {
            const currentMinTon = isFirstWithdrawal ? 0.05 : tonMinUsdt;
            if (inputAmount < currentMinTon) return showMessage(`Min ${currentMinTon} USDT`, 'error');
            needed = inputAmount;
        } else {
            const minInr = withdrawNetwork === 'UPI' ? upiMinInr : gplayMinInr;
            if (inputAmount < minInr) return showMessage(`Min ₹${minInr}`, 'error');
            needed = inputAmount / exchangeRate;
        }

        if (balance < needed) return showMessage('Insufficient funds', 'error');
        
        if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
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
        
        const now = Date.now();
        const withdrawal = {
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
        };

        sendTelegramBotAlert(withdrawal);

        setTimeout(() => {
            setBalance(prev => fromCents(toCents(prev) - toCents(totalDeduct)));
            setWithdrawalHistory(prev => [withdrawal, ...prev]);
            
            setUsersList(prev => prev.map(u => u.id === user.id ? { 
                ...u, 
                balance: fromCents(toCents(u.balance) - toCents(totalDeduct)), 
            } : u));

            setIsWithdrawing(false);
            setWithdrawAmount('');
            showMessage('Request Sent. Status will update in 24h.', 'success');
            setActiveTab('history');
            setHistorySubTab('withdrawals');
        }, 1200);
    };

    const getCooldownText = (stationId: string) => {
        if (loadingAdId === stationId) return 'Loading...';
        const remaining = (adCooldowns[stationId] || 0) - currentTime;
        if (remaining <= 0) return 'Claim Reward';
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
                                    <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 uppercase tracking-tighter leading-none">Adsgptpro 2</h1>
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
                            <p className="text-[11px] uppercase tracking-[0.25em] opacity-80 mb-2 font-black">Balance</p>
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
                                <p className="text-gray-400 text-[10px] font-bold uppercase">Today</p>
                                <p className="text-2xl font-bold text-green-500">+${stats.todayEarnings.toFixed(4)}</p>
                            </div>
                            <div className="card p-5 rounded-3xl flex flex-col gap-1 border-b-4 border-b-blue-600">
                                <p className="text-gray-400 text-[10px] font-bold uppercase">Total</p>
                                <p className="text-2xl font-bold text-blue-600">${stats.totalEarnings.toFixed(4)}</p>
                            </div>
                        </div>
                        
                        <div className="card p-5 rounded-3xl flex items-center gap-4 border-l-4 border-l-purple-500 cursor-pointer active:scale-[0.98]" onClick={() => tg?.openTelegramLink('https://t.me/Rewardsoftware_bot')}>
                            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 shadow-sm"><Bot size={20} /></div>
                            <div className="flex-1">
                                <h4 className="font-bold text-sm tracking-tight text-black">Earn More</h4>
                                <p className="text-xs text-gray-500">Get extra rewards from our official bot</p>
                            </div>
                            <div className="bg-gray-100 p-2.5 rounded-xl"><ChevronRight size={18} /></div>
                        </div>
                    </div>
                )}

                {isAdminView && isUserAdmin && (
                    <div className="flex flex-col gap-6 animate-fadeIn pb-20">
                        <header className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-black text-lg">R</div>
                                <div>
                                    <h2 className="text-xl font-black uppercase tracking-tight leading-none text-black">Admin Panel</h2>
                                    <p className="text-[10px] font-bold text-blue-600 uppercase">Adsgptpro 2 Console</p>
                                </div>
                            </div>
                            <button onClick={() => setIsAdminView(false)} className="bg-gray-100 p-2.5 rounded-xl active:scale-95"><X size={20} /></button>
                        </header>

                        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
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
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-black p-5 rounded-[32px] text-white flex flex-col gap-1 shadow-xl">
                                    <p className="text-[10px] font-black opacity-60 uppercase tracking-widest">Global Bal</p>
                                    <p className="text-2xl font-black">${adminAnalytics.totalSystemBalance.toFixed(2)}</p>
                                </div>
                                <div className="bg-green-50 p-5 rounded-[32px] flex flex-col gap-1 border border-green-100">
                                    <p className="text-[10px] font-black text-green-700 uppercase tracking-widest">Paid Out</p>
                                    <p className="text-2xl font-black text-green-800">${adminAnalytics.totalPaid.toFixed(2)}</p>
                                </div>
                                <div className="bg-blue-50 p-5 rounded-[32px] flex flex-col gap-1 border border-blue-100 col-span-2">
                                    <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Total Logs</p>
                                    <p className="text-2xl font-black text-blue-800">{adminAnalytics.totalRequestCount} REQUESTS</p>
                                </div>
                            </div>
                        )}

                        {adminSubTab === 'withdrawals' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center px-2">
                                    <h3 className="text-lg font-black text-black">Payout Queue ({adminAnalytics.pendingCount})</h3>
                                    <div className="flex p-1 bg-gray-100 rounded-xl">
                                        {(['ALL', 'PENDING', 'PAID', 'REJECTED'] as const).map(f => (
                                            <button key={f} onClick={() => setAdminWithdrawalFilter(f)} className={`px-3 py-1.5 text-[9px] font-black rounded-lg transition-all ${adminWithdrawalFilter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}>{f}</button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-4">
                                    {filteredWithdrawalsForAdmin.length === 0 ? (
                                        <div className="text-center py-20 bg-gray-50 rounded-[40px] border border-dashed text-gray-400 text-xs font-bold uppercase">Queue empty</div>
                                    ) : (
                                        filteredWithdrawalsForAdmin.map((w: any) => (
                                            <div key={w.id} className={`card p-5 rounded-[32px] border-l-4 ${w.status === 'PAID' ? 'border-l-green-500' : w.status === 'REJECTED' ? 'border-l-red-500' : 'border-l-yellow-500 shadow-xl'}`}>
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <p className="text-sm font-black text-black">{w.user_name}</p>
                                                        <p className="text-[9px] font-bold text-gray-400 uppercase">UID: {w.user_id}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-lg font-black text-black">${w.amount.toFixed(4)}</p>
                                                        <p className="text-[10px] font-black text-green-600">{w.netPayoutINR ? `₹${w.netPayoutINR.toFixed(2)}` : `$${w.netPayout.toFixed(4)}`}</p>
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 p-3 rounded-2xl mb-4 text-[10px] font-mono break-all text-black flex items-center justify-between group" onClick={() => copyToClipboard(w.address)}>
                                                    <span>{w.address}</span>
                                                    <Copy size={12} className="text-gray-400 opacity-0 group-hover:opacity-100" />
                                                </div>
                                                <div className="flex gap-2">
                                                    {w.status === 'PENDING' && (
                                                        <>
                                                            <button onClick={() => updateWithdrawalStatus([w.id], 'PAID')} className="flex-1 py-3.5 rounded-2xl bg-green-600 text-white text-[10px] font-black uppercase active:scale-95 shadow-md">Pay</button>
                                                            <button onClick={() => updateWithdrawalStatus([w.id], 'REJECTED')} className="flex-1 py-3.5 rounded-2xl bg-red-600 text-white text-[10px] font-black uppercase active:scale-95 shadow-md">Reject</button>
                                                        </>
                                                    )}
                                                    <button onClick={() => deleteWithdrawal(w.id)} className="w-12 h-12 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center active:text-red-500 border border-gray-100"><Trash2 size={16} /></button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {adminSubTab === 'users' && (
                            <div className="space-y-3">
                                <h3 className="text-lg font-black text-black px-2">Members ({adminAnalytics.activeUsersCount})</h3>
                                {usersList.map((u: any) => (
                                    <div key={u.id} className="card p-4 rounded-[28px] flex items-center justify-between border-l-4 border-l-blue-600">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-black uppercase text-sm">{u.name ? u.name[0] : '?'}</div>
                                            <div>
                                                <p className="text-sm font-black text-black">{u.name}</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[10px] text-blue-600 font-bold">@{u.username || 'n/a'}</p>
                                                </div>
                                                <p className="text-[8px] text-gray-400 font-bold uppercase">BAL: ${u.balance.toFixed(4)}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1.5">
                                            <button onClick={() => adjustUserBalance(u.id, 0.50)} className="w-9 h-9 rounded-xl bg-green-50 text-green-600 flex items-center justify-center border border-green-100"><Star size={18}/></button>
                                            <button onClick={() => adjustUserBalance(u.id, 0.50)} className="w-9 h-9 rounded-xl bg-green-50 text-green-600 flex items-center justify-center border border-green-100"><PlusCircle size={18}/></button>
                                            <button onClick={() => adjustUserBalance(u.id, -0.50)} className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100"><MinusCircle size={18}/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'ads' && (
                    <div className="flex flex-col gap-4 animate-fadeIn">
                        <header><h2 className="text-2xl font-black uppercase tracking-tight text-black">Earn Rewards</h2></header>
                        
                        <div className="grid grid-cols-1 gap-3">
                            {Array.from({ length: 6 }, (_, i) => `ads${i + 1}`).map((id, idx) => (
                                <div key={id} className="card p-5 rounded-[32px] flex items-center justify-between shadow-sm active:scale-[0.98] transition-all hover:border-black/10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center font-black text-white shadow-lg">{idx + 1}</div>
                                        <div>
                                            <p className="font-black text-sm text-black uppercase tracking-tighter">Station {idx + 1}</p>
                                            <p className="text-[10px] text-green-600 font-bold tracking-widest">+${adReward.toFixed(4)} USDT</p>
                                        </div>
                                    </div>
                                    <button 
                                        disabled={adCooldowns[id] > currentTime || (loadingAdId === id)} 
                                        onClick={() => handleWatchAd(id)} 
                                        className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${adCooldowns[id] > currentTime ? 'bg-gray-100 text-gray-400' : 'bg-black text-white shadow-xl active:scale-95'} ${(loadingAdId === id) ? 'opacity-50' : ''}`}
                                    >
                                        {getCooldownText(id)}
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="h-4"></div>
                        <h3 className="text-xl font-black uppercase tracking-tight text-black px-2">Global Rewards</h3>

                        <div className="card p-6 rounded-[32px] bg-gradient-to-br from-indigo-600 to-purple-700 text-white relative overflow-hidden shadow-2xl">
                            <div className="relative z-10 flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center"><Bot size={24} className="text-white" /></div>
                                    <h3 className="font-black text-lg uppercase tracking-tight">Software Bot</h3>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <div className="text-2xl font-black">+$10.00</div>
                                    <button onClick={() => handleClaimTask(1, 'https://t.me/Rewardsoftware_bot', 10)} disabled={task1Claimed} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${task1Claimed ? 'bg-green-500' : 'bg-white text-indigo-600'}`}>{task1Claimed ? 'Claimed ✓' : 'Complete'}</button>
                                </div>
                            </div>
                        </div>

                        <div className="card p-6 rounded-[32px] bg-gradient-to-br from-blue-500 to-cyan-600 text-white relative overflow-hidden shadow-2xl">
                            <div className="relative z-10 flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center"><Megaphone size={24} className="text-white" /></div>
                                    <h3 className="font-black text-lg uppercase tracking-tight">Main Channel</h3>
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                    <div className="text-2xl font-black">+$5.00</div>
                                    <button onClick={() => handleClaimTask(2, 'https://t.me/Rewardsoftware_', 5)} disabled={task2Claimed} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${task2Claimed ? 'bg-green-500' : 'bg-white text-blue-600'}`}>{task2Claimed ? 'Claimed ✓' : 'Complete'}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'wallet' && (
                    <div className="flex flex-col gap-6 animate-fadeIn">
                        <header className="flex flex-col gap-1">
                            <h2 className="text-2xl font-black uppercase tracking-tight text-black leading-none">Payout</h2>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Withdraw securely</p>
                        </header>
                        <div className="gradient-button p-8 rounded-[40px] shadow-2xl text-white flex flex-col items-center">
                            <p className="text-[11px] uppercase tracking-[0.3em] opacity-80 font-black mb-1">Current Balance</p>
                            <div className="flex items-baseline gap-1.5"><span className="text-5xl font-black tracking-tighter">{balance.toFixed(4)}</span><span className="text-lg opacity-60 font-black">USDT</span></div>
                            <p className="text-sm font-black opacity-80 mt-1 flex items-center gap-1"><IndianRupee size={12} /> {(balance * exchangeRate).toFixed(2)} INR</p>
                        </div>

                        {/* First Time Withdrawal Offer Banner */}
                        {isFirstWithdrawal && withdrawNetwork === 'TON' && (
                            <div className="bg-yellow-50 border-2 border-dashed border-yellow-200 rounded-3xl p-4 flex items-center gap-4 animate-pulse">
                                <div className="w-10 h-10 rounded-2xl bg-yellow-400 text-white flex items-center justify-center shadow-lg"><Star size={20} fill="currentColor" /></div>
                                <div>
                                    <h4 className="text-xs font-black text-yellow-800 uppercase tracking-tight">First Withdrawal Offer!</h4>
                                    <p className="text-[10px] text-yellow-700 font-bold">Min withdrawal reduced to 0.05 USDT just for you!</p>
                                </div>
                            </div>
                        )}

                        <div className="glass-card rounded-[40px] p-6 flex flex-col gap-6 border border-gray-100 shadow-xl bg-white">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Payout Method</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button onClick={() => { setWithdrawNetwork('TON'); setWithdrawAmount(''); }} className={`py-3.5 rounded-2xl text-[9px] font-black border uppercase tracking-widest transition-all ${withdrawNetwork === 'TON' ? 'border-black bg-black text-white shadow-lg' : 'border-gray-100 bg-gray-50 text-gray-400'}`}>USDT Ton</button>
                                    <button onClick={() => { setWithdrawNetwork('GIFT_CARD'); setWithdrawAmount(''); }} className={`py-3.5 rounded-2xl text-[9px] font-black border uppercase tracking-widest transition-all ${withdrawNetwork === 'GIFT_CARD' ? 'border-black bg-black text-white shadow-lg' : 'border-gray-100 bg-gray-50 text-gray-400'}`}>Google Play Giftcard</button>
                                    <button onClick={() => { setWithdrawNetwork('UPI'); setWithdrawAmount(''); }} className={`py-3.5 rounded-2xl text-[9px] font-black border uppercase tracking-widest transition-all ${withdrawNetwork === 'UPI' ? 'border-black bg-black text-white shadow-lg' : 'border-gray-100 bg-gray-50 text-gray-400'}`}>UPI</button>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    {withdrawNetwork === 'TON' ? 'Address' : withdrawNetwork === 'UPI' ? 'UPI ID' : 'Email Address'}
                                </label>
                                <input 
                                    type="text" 
                                    placeholder={withdrawNetwork === 'TON' ? "Enter Ton Network Address" : withdrawNetwork === 'UPI' ? "Enter UPI number" : "Enter Email Id"} 
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-xs font-bold outline-none text-black" 
                                    value={withdrawNetwork === 'TON' ? tonAddress : withdrawNetwork === 'UPI' ? upiId : giftCardEmail} 
                                    onChange={(e) => { if(withdrawNetwork === 'TON') setTonAddress(e.target.value); else if(withdrawNetwork === 'UPI') setUpiId(e.target.value); else setGiftCardEmail(e.target.value); }} 
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount ({withdrawNetwork === 'TON' ? 'USDT' : 'INR'})</label><span className="text-[9px] text-gray-400 font-bold">Fee: {withdrawNetwork === 'TON' ? `$${gasUsdt}` : '₹0.00'}</span></div>
                                <div className="relative"><input type="number" placeholder="0.00" className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-6 py-5 text-xl outline-none font-black text-black" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} /></div>
                            </div>

                            <div className="bg-gray-50 rounded-3xl p-5 border border-gray-100 flex flex-col gap-3">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck size={16} className="text-black" />
                                    <h3 className="text-[10px] font-black text-black uppercase tracking-widest">Payout Rules</h3>
                                </div>
                                <ul className="flex flex-col gap-2">
                                    <li className="flex items-center justify-between">
                                        <span className="text-[9px] font-bold text-black/60 uppercase">Processing Time</span>
                                        <span className="text-[9px] font-black text-black uppercase">Within 24 Hours</span>
                                    </li>
                                    <li className="flex items-center justify-between">
                                        <span className="text-[9px] font-bold text-black/60 uppercase">Minimum Payout</span>
                                        <span className={`text-[9px] font-black uppercase ${isFirstWithdrawal && withdrawNetwork === 'TON' ? 'text-green-600' : 'text-black'}`}>
                                            {withdrawNetwork === 'TON' ? (isFirstWithdrawal ? '0.05 USDT (New User)' : `${tonMinUsdt} USDT`) : withdrawNetwork === 'UPI' ? `₹${upiMinInr}` : `₹${gplayMinInr}`}
                                        </span>
                                    </li>
                                    <li className="flex items-center justify-between">
                                        <span className="text-[9px] font-bold text-black/60 uppercase">Gas Fee (Network)</span>
                                        <span className="text-[9px] font-black text-black uppercase">{withdrawNetwork === 'TON' ? `$${gasUsdt} USDT` : '₹0.00'}</span>
                                    </li>
                                    <li className="flex items-center justify-between">
                                        <span className="text-[9px] font-bold text-black/60 uppercase">Security Check</span>
                                        <span className="text-[9px] font-black text-black uppercase">Automated</span>
                                    </li>
                                </ul>
                            </div>

                            <button onClick={handleWithdrawClick} disabled={isWithdrawing} className="w-full py-6 rounded-3xl bg-black text-white flex items-center justify-center gap-4 font-black uppercase tracking-[0.25em] active:scale-95 shadow-xl disabled:opacity-50">{isWithdrawing ? <RefreshCw className="animate-spin" size={20} /> : 'Process Payout'}</button>
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
                                        <p className="text-sm font-black text-green-600 leading-none">{historySubTab === 'earnings' ? `+$${item.amount.toFixed(4)}` : (item.netPayoutINR ? `₹${item.netPayoutINR.toFixed(2)}` : `$${item.netPayout.toFixed(4)}`)}</p>
                                        {historySubTab === 'withdrawals' && <span className="text-[7px] font-black uppercase text-white bg-green-500 px-1.5 py-0.5 rounded-md mt-1 inline-block">{item.status}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center px-4 backdrop-blur-md bg-black/60 animate-fadeIn">
                    <div className="bg-white w-full max-w-sm rounded-[40px] shadow-2xl p-8 border border-gray-100 flex flex-col gap-6">
                        <div className="flex flex-col items-center text-center gap-2">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-2">
                                <CreditCard size={32} />
                            </div>
                            <h3 className="text-xl font-black tracking-tight uppercase">Confirm Payout</h3>
                            <p className="text-xs text-gray-500 font-medium">Verify your withdrawal details before processing.</p>
                        </div>

                        <div className="bg-gray-50 rounded-3xl p-6 flex flex-col gap-4">
                            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                                <span className="text-[10px] font-black text-gray-400 uppercase">Amount</span>
                                <div className="text-right">
                                    <p className="text-lg font-black text-black">{withdrawAmount} {withdrawNetwork === 'TON' ? 'USDT' : 'INR'}</p>
                                    <p className="text-[10px] font-bold text-green-600">
                                        {withdrawNetwork === 'TON' ? `≈ ₹${(parseFloat(withdrawAmount) * exchangeRate).toFixed(2)}` : `≈ $${(parseFloat(withdrawAmount) / exchangeRate).toFixed(4)} USDT`}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-gray-400 uppercase">Network</span>
                                <p className="text-xs font-black text-black">{getNetworkDisplayName(withdrawNetwork)}</p>
                            </div>
                            <div className="flex flex-col gap-1 overflow-hidden">
                                <span className="text-[10px] font-black text-gray-400 uppercase">Destination</span>
                                <p className="text-[10px] font-mono break-all font-bold text-black bg-white p-2 rounded-xl border border-gray-100">
                                    {withdrawNetwork === 'TON' ? tonAddress : withdrawNetwork === 'UPI' ? upiId : giftCardEmail}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={confirmWithdrawal} 
                                className="w-full py-5 rounded-3xl bg-black text-white font-black uppercase tracking-widest text-xs active:scale-95 shadow-xl flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 size={16} /> Confirm & Send
                            </button>
                            <button 
                                onClick={() => setShowConfirmModal(false)} 
                                className="w-full py-5 rounded-3xl bg-gray-100 text-gray-500 font-black uppercase tracking-widest text-xs active:scale-95"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showPasscodeModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 backdrop-blur-md bg-black/60 animate-fadeIn">
                    <div className="bg-white w-full max-w-xs rounded-[40px] shadow-2xl p-8 border border-gray-100 flex flex-col items-center text-center gap-4">
                        <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600"><KeyRound size={32} /></div>
                        <h3 className="text-xl font-black tracking-tight uppercase">Console Login</h3>
                        <input type="password" autoFocus className="w-full bg-gray-50 border rounded-2xl px-5 py-4 text-center font-black tracking-[0.2em] text-lg outline-none text-black" value={inputPasscode} onChange={(e) => setInputPasscode(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handlePasscodeSubmit()} />
                        <button onClick={handlePasscodeSubmit} className="bg-black text-white w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs active:scale-95 shadow-xl">Unlock</button>
                    </div>
                </div>
            )}

            <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 px-6 py-4 flex justify-between items-center z-50 shadow-2xl">
                <button onClick={() => { setActiveTab('home'); setIsAdminView(false); }} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'home' && !isAdminView ? 'text-black scale-110' : 'text-gray-300'}`}><Home size={22} /><span className="text-[9px] font-black uppercase">Home</span></button>
                <button onClick={() => { setActiveTab('ads'); setIsAdminView(false); }} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'ads' ? 'text-black scale-110' : 'text-gray-300'}`}><Zap size={22} /><span className="text-[9px] font-black uppercase">Earn</span></button>
                <button onClick={() => { setActiveTab('wallet'); setIsAdminView(false); }} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === 'wallet' ? 'text-black scale-110' : 'text-gray-300'}`}><Wallet size={22} /><span className="text-[9px] font-black uppercase">Payout</span></button>
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