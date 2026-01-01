
export type Network = 'USDT (TON Network)' | 'USDT (BEP20 Network)';
export type BalanceSource = 'Main Balance' | 'Referral Balance';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface WithdrawalPayload {
  user_id: number;
  username: string;
  amount: number;
  gas_fee: number;
  network: Network;
  wallet_address: string;
  source_balance: BalanceSource;
  timestamp: number;
}
