import { BankStore, Transaction, formatCurrency } from '@/lib/bankData';

export type ManagerReportId =
  | 'daily-summary'
  | 'weekly-performance'
  | 'monthly-financial'
  | 'user-growth'
  | 'fraud-detection'
  | 'loan-portfolio';

export interface ManagerReportDefinition {
  id: ManagerReportId;
  title: string;
  desc: string;
  period: string;
  buildRows: (store: BankStore) => Array<Record<string, string | number>>;
}

function sanitizeCsvCell(value: string | number) {
  let safeValue = String(value ?? '').replace(/\r?\n/g, ' ').trim();
  if (/^[=+\-@]/.test(safeValue)) {
    safeValue = `'${safeValue}`;
  }

  if (safeValue.includes('"') || safeValue.includes(',')) {
    safeValue = `"${safeValue.replace(/"/g, '""')}"`;
  }

  return safeValue;
}

function toCsv(rows: Array<Record<string, string | number>>) {
  if (rows.length === 0) return 'No data available\n';

  const headers = Object.keys(rows[0]);
  const lines = rows.map(row => headers.map(header => sanitizeCsvCell(row[header] ?? '')).join(','));
  return [headers.join(','), ...lines].join('\n');
}

function formatDayKey(dateValue: string) {
  return new Date(dateValue).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getRecentTransactions(store: BankStore, days: number) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return store.transactions.filter(transaction => new Date(transaction.date).getTime() >= cutoff);
}

function getCustomerName(store: BankStore, userId: string) {
  return store.users.find(user => user.id === userId)?.name || 'Unknown';
}

function buildDailySummaryRows(store: BankStore) {
  const transactions = getRecentTransactions(store, 1);
  const grouped = ['deposit', 'withdrawal', 'transfer', 'payment'].map(type => {
    const matching = transactions.filter(transaction => transaction.type === type);
    return {
      transaction_type: type,
      transaction_count: matching.length,
      total_amount: formatCurrency(matching.reduce((sum, transaction) => sum + transaction.amount, 0)),
      flagged_count: matching.filter(transaction => transaction.flagged).length,
    };
  });

  return grouped;
}

function buildWeeklyPerformanceRows(store: BankStore) {
  const transactions = getRecentTransactions(store, 7);
  const grouped = new Map<string, Transaction[]>();

  transactions.forEach(transaction => {
    const key = formatDayKey(transaction.date);
    const current = grouped.get(key) ?? [];
    current.push(transaction);
    grouped.set(key, current);
  });

  return Array.from(grouped.entries()).map(([day, dayTransactions]) => ({
    day,
    transaction_volume: dayTransactions.length,
    deposits: formatCurrency(dayTransactions.filter(transaction => transaction.type === 'deposit').reduce((sum, transaction) => sum + transaction.amount, 0)),
    outflows: formatCurrency(dayTransactions.filter(transaction => transaction.type !== 'deposit').reduce((sum, transaction) => sum + transaction.amount, 0)),
    flagged_count: dayTransactions.filter(transaction => transaction.flagged).length,
  }));
}

function buildMonthlyFinancialRows(store: BankStore) {
  return ['checking', 'savings', 'credit'].map(accountType => {
    const accounts = store.accounts.filter(account => account.type === accountType);
    const positiveBalances = accounts.filter(account => account.balance > 0).reduce((sum, account) => sum + account.balance, 0);
    const exposure = accounts.filter(account => account.balance < 0).reduce((sum, account) => sum + Math.abs(account.balance), 0);

    return {
      account_type: accountType,
      account_count: accounts.length,
      deposits_held: formatCurrency(positiveBalances),
      credit_exposure: formatCurrency(exposure),
    };
  });
}

function buildUserGrowthRows(store: BankStore) {
  const grouped = new Map<string, number>();

  store.users
    .filter(user => user.role === 'user')
    .forEach(user => {
      const joinedMonth = new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      grouped.set(joinedMonth, (grouped.get(joinedMonth) ?? 0) + 1);
    });

  return Array.from(grouped.entries()).map(([month, newUsers]) => ({
    month,
    new_users: newUsers,
  }));
}

function buildFraudRows(store: BankStore) {
  return store.transactions
    .filter(transaction => transaction.flagged)
    .slice(0, 30)
    .map(transaction => ({
      date: formatDayKey(transaction.date),
      customer: getCustomerName(store, transaction.userId),
      amount: formatCurrency(transaction.amount),
      status: transaction.status,
      description: transaction.description,
      reviewed_by: getCustomerName(store, transaction.reviewedBy || ''),
    }));
}

function buildLoanRows(store: BankStore) {
  return store.requests
    .filter(request => request.type === 'loan')
    .slice(0, 30)
    .map(request => ({
      created_at: formatDayKey(request.createdAt),
      customer: getCustomerName(store, request.userId),
      status: request.status,
      reviewed_by: getCustomerName(store, request.reviewedBy || ''),
      details: request.details,
    }));
}

export const MANAGER_REPORTS: ManagerReportDefinition[] = [
  { id: 'daily-summary', title: 'Daily Summary', desc: 'Transaction summary for today', period: 'Daily', buildRows: buildDailySummaryRows },
  { id: 'weekly-performance', title: 'Weekly Performance', desc: 'KPIs and metrics for the past week', period: 'Weekly', buildRows: buildWeeklyPerformanceRows },
  { id: 'monthly-financial', title: 'Monthly Financial', desc: 'Comprehensive monthly financial report', period: 'Monthly', buildRows: buildMonthlyFinancialRows },
  { id: 'user-growth', title: 'User Growth', desc: 'New user registrations and account openings', period: 'Monthly', buildRows: buildUserGrowthRows },
  { id: 'fraud-detection', title: 'Fraud Detection', desc: 'Flagged transactions and suspicious activity', period: 'Weekly', buildRows: buildFraudRows },
  { id: 'loan-portfolio', title: 'Loan Portfolio', desc: 'Outstanding loans and repayment status', period: 'Monthly', buildRows: buildLoanRows },
];

export function buildManagerReportFile(reportId: ManagerReportId, store: BankStore) {
  const report = MANAGER_REPORTS.find(currentReport => currentReport.id === reportId);
  if (!report) throw new Error(`Unknown report: ${reportId}`);

  const csv = toCsv(report.buildRows(store));
  const fileDate = new Date().toISOString().slice(0, 10);
  return {
    filename: `${report.id}-${fileDate}.csv`,
    title: report.title,
    content: csv,
    mimeType: 'text/csv;charset=utf-8;',
  };
}

export function downloadManagerReport(reportId: ManagerReportId, store: BankStore) {
  const file = buildManagerReportFile(reportId, store);
  const blob = new Blob([file.content], { type: file.mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = file.filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);

  return file;
}
