
import React, { useState, useEffect, useMemo } from 'react';
import { Network, BalanceSource, TelegramUser, WithdrawalPayload } from './types';
import { WITHDRAWAL_RULES, ADMIN_CONFIG } from './constants';

const App: React.FC = () => {
  // Telegram SDK Init
  const tg = (window as any).Telegram?.WebApp;

  const [user, setUser] = useState<TelegramUser | null>(null);
  const [balanceSource, setBalanceSource] = useState<BalanceSource>('Main Balance');
  const [network, setNetwork] = useState<Network>('USDT (TON Network)');
  const [walletAddress, setWalletAddress] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'IDLE' | 'PENDING' | 'SUCCESS'>('IDLE');

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
      if (tg.initDataUnsafe?.user) {
        setUser(tg.initDataUnsafe.user);
      } else {
        // Fallback for testing outside Telegram
        setUser({ id: 12345678, first_name: 'Tester', username: 'test_user' });
      }
    }
  }, [tg]);

  const isValid = useMemo(() => {
    const numAmount = parseFloat(amount);
    const isAmountValid = !isNaN(numAmount) && 
                         numAmount >= WITHDRAWAL_RULES.MIN_AMOUNT && 
                         numAmount <= WITHDRAWAL_RULES.MAX_AMOUNT;
    const isAddressValid = walletAddress.trim().length > 10;
    const isReferralValid = !(balanceSource === 'Referral Balance' && ADMIN_CONFIG.REFERRAL_LOCKED);
    
    return isAmountValid && isAddressValid && isReferralValid && !isSubmitting;
  }, [amount, walletAddress, balanceSource, isSubmitting]);

  const handleWithdrawal = async () => {
    if (!isValid || !user) return;

    setIsSubmitting(true);
    setStatus('PENDING');

    const payload: WithdrawalPayload = {
      user_id: user.id,
      username: user.username || `${user.first_name} (ID: ${user.id})`,
      amount: parseFloat(amount),
      gas_fee: WITHDRAWAL_RULES.GAS_FEE,
      network: network,
      wallet_address: walletAddress,
      source_balance: balanceSource,
      timestamp: Date.now(),
    };

    console.log('Sending payload to Admin Bot Backend:', payload);

    /**
     * BACKEND API CALL PLACEHOLDER
     * Example:
     * await fetch('https://your-admin-bot-api.com/withdraw', {
     *   method: 'POST',
     *   headers: { 'Content-Type': 'application/json' },
     *   body: JSON.stringify(payload)
     * });
     */

    // Simulate Network Latency
    setTimeout(() => {
      setStatus('SUCCESS');
      setIsSubmitting(false);
      
      if (tg) {
        tg.showAlert('Withdrawal request sent for admin approval', () => {
          tg.close();
        });
      } else {
        alert('Withdrawal request sent for admin approval');
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white p-4 max-w-md mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-xl font-bold">Withdraw USDT</h1>
          <p className="text-gray-500 text-sm">
            @{user?.username || 'anonymous'} (ID: {user?.id})
          </p>
        </div>
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
          {user?.first_name?.[0] || '?'}
        </div>
      </div>

      {/* Main Content Card */}
      <div className="glass-card rounded-2xl p-5 flex flex-col gap-5">
        
        {/* Balance Source */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Source Balance</label>
          <select 
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            value={balanceSource}
            onChange={(e) => setBalanceSource(e.target.value as BalanceSource)}
          >
            <option value="Main Balance">Main Balance</option>
            <option value="Referral Balance" disabled={ADMIN_CONFIG.REFERRAL_LOCKED}>
              Referral Balance {ADMIN_CONFIG.REFERRAL_LOCKED ? '(Locked)' : ''}
            </option>
          </select>
          {balanceSource === 'Referral Balance' && ADMIN_CONFIG.REFERRAL_LOCKED && (
            <p className="text-xs text-red-500 font-medium">Referral withdrawal is currently locked by admin</p>
          )}
        </div>

        {/* Network Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Select Network</label>
          <div className="grid grid-cols-2 gap-2">
            {(['USDT (TON Network)', 'USDT (BEP20 Network)'] as Network[]).map((n) => (
              <button
                key={n}
                onClick={() => setNetwork(n)}
                className={`py-3 px-2 rounded-xl text-xs font-medium border transition-all ${
                  network === n 
                    ? 'border-blue-500 bg-blue-50 text-blue-600' 
                    : 'border-gray-100 bg-gray-50 text-gray-400'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Wallet Address */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Wallet Address</label>
          <input
            type="text"
            placeholder="Enter your USDT wallet address"
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
          />
        </div>

        {/* Amount */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Amount (USD)</label>
            <span className="text-[10px] text-gray-400">Fee: ${WITHDRAWAL_RULES.GAS_FEE}</span>
          </div>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">USDT</div>
          </div>
        </div>

        {/* Rules */}
        <div className="bg-blue-50/50 rounded-xl p-4 flex flex-col gap-1.5 border border-blue-100/30">
          <h3 className="text-xs font-bold text-blue-800 uppercase tracking-widest mb-1">Withdrawal Rules</h3>
          <ul className="text-xs text-blue-700/80 space-y-1 list-disc list-inside">
            <li>Min withdrawal: ${WITHDRAWAL_RULES.MIN_AMOUNT.toFixed(2)}</li>
            <li>Max withdrawal: ${WITHDRAWAL_RULES.MAX_AMOUNT.toFixed(2)}</li>
            <li>Processing time: Instant to 24 hours</li>
            <li>Limit: 2 withdrawals per 24 hours</li>
          </ul>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleWithdrawal}
          disabled={!isValid || isSubmitting}
          className="gradient-button w-full py-4 rounded-2xl text-white font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : status === 'SUCCESS' ? (
            'Sent Successfully!'
          ) : (
            'Withdraw Funds'
          )}
        </button>
      </div>

      <div className="text-center text-gray-400 text-xs mt-auto">
        <p>Admin status: <span className="text-green-500 font-medium">Active</span></p>
        <p className="mt-1 opacity-50">Powered by Telegram WebApp SDK</p>
      </div>
    </div>
  );
};

export default App;
