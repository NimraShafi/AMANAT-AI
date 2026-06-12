export interface BankStatement {
  id: string;
  transaction_ref: string;
  bank_name: string;
  amount: number;
  status: 'new' | 'waiting_purpose' | 'completed';
  created_at: Date;
  updated_at: Date;
}

export interface Donation {
  id: string;
  sender_number: string;
  amount: number;
  transaction_ref: string;
  bank_name: string;
  purpose: 'Gaza' | 'Orphan' | 'Ration' | string;
  status: 'Verified' | 'Pending' | 'Rejected';
  created_at: Date;
  updated_at: Date;
}

export interface ReviewQueue {
  id: string;
  donation_id: string;
  issue: string;
  status: 'OPEN' | 'RESOLVED';
  // created_at: Date;
  resolved_at?: Date;
  donation?: Donation;
}

export interface DashboardStats {
  totalFunds: number;
  totalVerified: number;
  pendingReviews: number;
  totalDonors: number;
  verificationRate: number;
}

export interface DonationTrend {
  date: string;
  amount: number;
  count: number;
}

export interface FundAllocation {
  name: string;
  value: number;
  color: string;
}
