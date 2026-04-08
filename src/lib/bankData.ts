// Types
export type Role = 'user' | 'admin' | 'manager' | 'maintenance';
export type AccountType = 'checking' | 'savings' | 'credit';
export type TransactionType = 'deposit' | 'withdrawal' | 'transfer' | 'payment';
export type RequestType = 'card' | 'loan' | 'kyc';
export type Status = 'pending' | 'approved' | 'rejected' | 'completed' | 'in_progress';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  password?: string;
  role: Role;
  avatar?: string;
  createdAt: string;
  active: boolean;
}

export interface Account {
  accountId: string;
  userId: string;
  type: AccountType;
  balance: number;
  currency: string;
  createdAt: string;
}

export interface Transaction {
  transactionId: string;
  userId: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
  status: Status;
  toAccountId?: string;
  flagged?: boolean;
  reviewedBy?: string;
  reviewNote?: string;
}

export interface ServiceRequest {
  requestId: string;
  userId: string;
  type: RequestType;
  status: Status;
  assignedTo?: string;
  details: string;
  createdAt: string;
  reviewedBy?: string;
  reviewNote?: string;
}

export interface MaintenanceTask {
  taskId: string;
  assignedTo: string;
  type: string;
  description: string;
  status: Status;
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  resolvedAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export interface AuditLog {
  logId: string;
  action: string;
  performedBy: string;
  targetUser?: string;
  details?: string;
  timestamp: string;
}

export interface BankStore {
  users: User[];
  accounts: Account[];
  transactions: Transaction[];
  requests: ServiceRequest[];
  tasks: MaintenanceTask[];
  notifications: Notification[];
  logs: AuditLog[];
}

export interface ActionResult<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}

export interface CreateMaintenanceTaskInput {
  assignedTo: string;
  type: string;
  description: string;
  priority: MaintenanceTask['priority'];
  createdBy: string;
}

const PASSWORD_HASHES: Record<string, string> = {
  password: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
  password123: 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
};

export const MAINTENANCE_TASK_TYPES = [
  'Server Maintenance',
  'Database Backup',
  'Security Patch',
  'Network Issue',
  'Account Recovery',
  'System Update',
  'Performance Optimization',
  'Bug Fix',
] as const;

// Helpers
const uid = () => {
  if (globalThis.crypto?.getRandomValues) {
    const bytes = new Uint8Array(8);
    globalThis.crypto.getRandomValues(bytes);
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  return Math.random().toString(36).slice(2, 10);
};

const randomDate = (start: Date, end: Date) => {
  const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return d.toISOString();
};

const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const normalizeEmail = (email: string) => email.trim().toLowerCase();
const normalizeText = (value: string, maxLength = 240) => value.replace(/\s+/g, ' ').trim().slice(0, maxLength);
const looksLikeSha256 = (value: string) => /^[a-f0-9]{64}$/i.test(value);

const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Lisa', 'Daniel', 'Nancy', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley', 'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle', 'Kenneth', 'Carol', 'Kevin', 'Amanda', 'Brian', 'Dorothy', 'George', 'Melissa', 'Timothy', 'Deborah'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'];
const txDescriptions: Record<TransactionType, string[]> = {
  deposit: ['Salary deposit', 'Cash deposit', 'Wire transfer in', 'Interest payment', 'Refund'],
  withdrawal: ['ATM withdrawal', 'Cash withdrawal', 'Wire transfer out'],
  transfer: ['Transfer to savings', 'Transfer to checking', 'Internal transfer'],
  payment: ['Electric bill', 'Water bill', 'Internet bill', 'Insurance', 'Subscription', 'Grocery store', 'Gas station', 'Restaurant'],
};

function toPasswordHash(value: unknown) {
  if (typeof value !== 'string' || !value) return '';
  if (looksLikeSha256(value)) return value.toLowerCase();
  return PASSWORD_HASHES[value] ?? '';
}

function migrateUser(rawUser: Partial<User> & { password?: string }): User {
  const passwordHash = rawUser.passwordHash || rawUser.password ? toPasswordHash(rawUser.passwordHash || rawUser.password) : '';

  return {
    id: rawUser.id || uid(),
    name: rawUser.name || 'Unknown User',
    email: normalizeEmail(rawUser.email || ''),
    passwordHash,
    role: rawUser.role || 'user',
    avatar: rawUser.avatar,
    createdAt: rawUser.createdAt || new Date().toISOString(),
    active: rawUser.active ?? true,
  };
}

function generateData(): BankStore {
  const users: User[] = [];
  const accounts: Account[] = [];
  const transactions: Transaction[] = [];
  const requests: ServiceRequest[] = [];
  const tasks: MaintenanceTask[] = [];
  const notifications: Notification[] = [];
  const logs: AuditLog[] = [];

  const now = new Date();
  const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

  const makeUser = (role: Role, count: number) => {
    for (let i = 0; i < count; i++) {
      const fn = pick(firstNames);
      const ln = pick(lastNames);
      users.push({
        id: uid(),
        name: `${fn} ${ln}`,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}${rand(1, 99)}@bank.com`,
        passwordHash: PASSWORD_HASHES.password123,
        role,
        createdAt: randomDate(yearAgo, now),
        active: true,
      });
    }
  };

  makeUser('user', 50);
  makeUser('admin', 10);
  makeUser('manager', 5);
  makeUser('maintenance', 5);

  const demoUsers: User[] = [
    { id: 'demo-user', name: 'Demo Customer', email: 'user@bank.com', passwordHash: PASSWORD_HASHES.password, role: 'user', createdAt: yearAgo.toISOString(), active: true },
    { id: 'demo-admin', name: 'Demo Admin', email: 'admin@bank.com', passwordHash: PASSWORD_HASHES.password, role: 'admin', createdAt: yearAgo.toISOString(), active: true },
    { id: 'demo-manager', name: 'Demo Manager', email: 'manager@bank.com', passwordHash: PASSWORD_HASHES.password, role: 'manager', createdAt: yearAgo.toISOString(), active: true },
    { id: 'demo-maintenance', name: 'Demo Support', email: 'support@bank.com', passwordHash: PASSWORD_HASHES.password, role: 'maintenance', createdAt: yearAgo.toISOString(), active: true },
  ];
  users.push(...demoUsers);

  const userRoleUsers = users.filter(u => u.role === 'user');
  for (const user of userRoleUsers) {
    const types: AccountType[] = ['checking', 'savings'];
    if (Math.random() > 0.5) types.push('credit');

    for (const type of types) {
      accounts.push({
        accountId: uid(),
        userId: user.id,
        type,
        balance: type === 'credit' ? -rand(0, 5000) : rand(500, 50000),
        currency: 'USD',
        createdAt: user.createdAt,
      });
    }
  }

  for (const account of accounts) {
    const count = rand(5, 20);
    for (let i = 0; i < count; i++) {
      const type = pick<TransactionType>(['deposit', 'withdrawal', 'transfer', 'payment']);
      const amount = type === 'deposit' ? rand(100, 10000) : rand(10, 3000);
      transactions.push({
        transactionId: uid(),
        userId: account.userId,
        accountId: account.accountId,
        type,
        amount,
        description: pick(txDescriptions[type]),
        date: randomDate(yearAgo, now),
        status: 'completed',
        flagged: amount > 8000,
      });
    }
  }

  for (let i = 0; i < 30; i++) {
    const user = pick(userRoleUsers);
    requests.push({
      requestId: uid(),
      userId: user.id,
      type: pick<RequestType>(['card', 'loan', 'kyc']),
      status: pick<Status>(['pending', 'approved', 'rejected']),
      details: pick([
        'Need a new debit card for international travel',
        'Applying for personal loan - $15,000',
        'Update KYC documents with new address',
        'Request credit card limit increase',
        'Home loan pre-approval request',
        'Re-verification of identity documents',
      ]),
      createdAt: randomDate(yearAgo, now),
    });
  }

  const maintenanceUsers = users.filter(u => u.role === 'maintenance');
  for (let i = 0; i < 20; i++) {
    const status = pick<Status>(['pending', 'in_progress', 'completed']);
    const taskType = pick(MAINTENANCE_TASK_TYPES);
    tasks.push({
      taskId: uid(),
      assignedTo: pick(maintenanceUsers).id,
      type: taskType,
      description: `${taskType} - ticket #${rand(1000, 9999)}`,
      status,
      priority: pick<MaintenanceTask['priority']>(['low', 'medium', 'high', 'critical']),
      createdAt: randomDate(yearAgo, now),
      resolvedAt: status === 'completed' ? randomDate(yearAgo, now) : undefined,
    });
  }

  for (const user of demoUsers) {
    for (let i = 0; i < 5; i++) {
      notifications.push({
        id: uid(),
        userId: user.id,
        message: pick([
          'Your transfer has been processed.',
          'New security update available.',
          'Your loan request has been approved.',
          'Monthly statement is ready.',
          'Suspicious activity detected on your account.',
          'System maintenance scheduled for tonight.',
          'Your KYC documents have been verified.',
        ]),
        type: pick<Notification['type']>(['info', 'success', 'warning', 'error']),
        read: Math.random() > 0.5,
        createdAt: randomDate(yearAgo, now),
      });
    }
  }

  for (let i = 0; i < 50; i++) {
    const actor = pick(users.filter(u => u.role !== 'user'));
    logs.push({
      logId: uid(),
      action: pick(['User created', 'Account updated', 'Transaction approved', 'Request processed', 'Role changed', 'Login attempt', 'Settings updated', 'Report generated']),
      performedBy: actor.id,
      targetUser: pick(userRoleUsers).id,
      timestamp: randomDate(yearAgo, now),
    });
  }

  transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return { users, accounts, transactions, requests, tasks, notifications, logs };
}

// Reactive store
const STORAGE_KEY = 'bankSystem';
let listeners: Array<() => void> = [];
let data: BankStore | null = null;
let snapshot: BankStore | null = null;

function loadOrInit(): BankStore {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return {
        users: Array.isArray(parsed.users) ? parsed.users.map(migrateUser) : [],
        accounts: Array.isArray(parsed.accounts) ? parsed.accounts : [],
        transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
        requests: Array.isArray(parsed.requests) ? parsed.requests : [],
        tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
        notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
        logs: Array.isArray(parsed.logs) ? parsed.logs : [],
      };
    } catch {
      // Fall through to regenerate.
    }
  }

  const initialData = generateData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
  return initialData;
}

function emitChange() {
  snapshot = data ? { ...data } : null;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  for (const listener of listeners) listener();
}

export function getStore(): BankStore {
  if (!data) {
    data = loadOrInit();
    snapshot = { ...data };
  }
  return data;
}

export function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter(currentListener => currentListener !== listener);
  };
}

export function getSnapshot(): BankStore {
  if (!snapshot) {
    data = loadOrInit();
    snapshot = { ...data };
  }
  return snapshot;
}

export function saveStore() {
  emitChange();
}

export function resetStore() {
  localStorage.removeItem(STORAGE_KEY);
  data = null;
  snapshot = null;
  getStore();
  emitChange();
  return data!;
}

function getUserById(userId: string) {
  return getStore().users.find(user => user.id === userId);
}

function requireActiveUser(userId: string, roles?: Role[]): ActionResult<User> {
  const user = getUserById(userId);
  if (!user) return { success: false, error: 'User not found.' };
  if (!user.active) return { success: false, error: 'Account is inactive.' };
  if (roles && !roles.includes(user.role)) return { success: false, error: 'Unauthorized action.' };
  return { success: true, data: user };
}

function asFailure<T>(result: ActionResult<unknown>): ActionResult<T> {
  return { success: false, error: result.error || 'Action failed.' };
}

// Action helpers
export function addNotification(userId: string, message: string, type: Notification['type'] = 'info') {
  const store = getStore();
  store.notifications.unshift({
    id: uid(),
    userId,
    message,
    type,
    read: false,
    createdAt: new Date().toISOString(),
  });
}

export function addAuditLog(action: string, performedBy: string, targetUser?: string, details?: string) {
  const store = getStore();
  store.logs.unshift({
    logId: uid(),
    action,
    performedBy,
    targetUser,
    details,
    timestamp: new Date().toISOString(),
  });
}

export function approveRequest(requestId: string, reviewerId: string): ActionResult<ServiceRequest> {
  const reviewer = requireActiveUser(reviewerId, ['admin']);
  if (!reviewer.success) return asFailure<ServiceRequest>(reviewer);

  const store = getStore();
  const request = store.requests.find(currentRequest => currentRequest.requestId === requestId);
  if (!request) return { success: false, error: 'Request not found.' };
  if (request.status !== 'pending') return { success: false, error: 'Only pending requests can be approved.' };

  request.status = 'approved';
  request.reviewedBy = reviewerId;
  request.reviewNote = undefined;

  addNotification(request.userId, `Your ${request.type} request has been approved.`, 'success');
  addAuditLog('Request approved', reviewerId, request.userId, `${request.type} request approved`);
  getStore().users
    .filter(user => user.role === 'manager')
    .forEach(manager => addNotification(manager.id, `A ${request.type} request was approved by admin.`, 'info'));

  saveStore();
  return { success: true, data: request };
}

export function rejectRequest(requestId: string, reviewerId: string, reason?: string): ActionResult<ServiceRequest> {
  const reviewer = requireActiveUser(reviewerId, ['admin']);
  if (!reviewer.success) return asFailure<ServiceRequest>(reviewer);

  const store = getStore();
  const request = store.requests.find(currentRequest => currentRequest.requestId === requestId);
  if (!request) return { success: false, error: 'Request not found.' };
  if (request.status !== 'pending') return { success: false, error: 'Only pending requests can be rejected.' };

  const reviewNote = normalizeText(reason || '', 160);
  request.status = 'rejected';
  request.reviewedBy = reviewerId;
  request.reviewNote = reviewNote || undefined;

  addNotification(
    request.userId,
    `Your ${request.type} request has been rejected.${reviewNote ? ` Reason: ${reviewNote}` : ''}`,
    'error',
  );
  addAuditLog('Request rejected', reviewerId, request.userId, `${request.type} request rejected`);
  getStore().users
    .filter(user => user.role === 'manager')
    .forEach(manager => addNotification(manager.id, `A ${request.type} request was rejected by admin.`, 'warning'));

  saveStore();
  return { success: true, data: request };
}

export function flagTransaction(txnId: string, reviewerId: string) {
  const reviewer = requireActiveUser(reviewerId, ['admin', 'manager']);
  if (!reviewer.success) return asFailure<Transaction>(reviewer);

  const store = getStore();
  const transaction = store.transactions.find(currentTransaction => currentTransaction.transactionId === txnId);
  if (!transaction) return { success: false, error: 'Transaction not found.' };

  transaction.flagged = true;
  transaction.reviewedBy = reviewerId;
  addNotification(transaction.userId, `Your transaction of ${formatCurrency(transaction.amount)} has been flagged for review.`, 'warning');
  addAuditLog('Transaction flagged', reviewerId, transaction.userId, `Transaction ${txnId} flagged`);
  saveStore();
  return { success: true, data: transaction };
}

export function clearTransactionFlag(txnId: string, reviewerId: string) {
  const reviewer = requireActiveUser(reviewerId, ['admin', 'manager']);
  if (!reviewer.success) return asFailure<Transaction>(reviewer);

  const store = getStore();
  const transaction = store.transactions.find(currentTransaction => currentTransaction.transactionId === txnId);
  if (!transaction) return { success: false, error: 'Transaction not found.' };

  transaction.flagged = false;
  transaction.reviewedBy = reviewerId;
  addNotification(transaction.userId, 'Your flagged transaction has been cleared.', 'success');
  addAuditLog('Transaction flag cleared', reviewerId, transaction.userId, `Transaction ${txnId} cleared`);
  saveStore();
  return { success: true, data: transaction };
}

export function updateTaskStatus(taskId: string, newStatus: 'in_progress' | 'completed', userId: string): ActionResult<MaintenanceTask> {
  const actor = requireActiveUser(userId, ['maintenance']);
  if (!actor.success) return asFailure<MaintenanceTask>(actor);

  const store = getStore();
  const task = store.tasks.find(currentTask => currentTask.taskId === taskId);
  if (!task) return { success: false, error: 'Task not found.' };
  if (task.status === 'completed') return { success: false, error: 'Completed tasks are read-only.' };

  if (task.assignedTo !== userId) {
    task.assignedTo = userId;
  }

  task.status = newStatus;
  task.resolvedAt = newStatus === 'completed' ? new Date().toISOString() : undefined;

  addAuditLog(
    newStatus === 'completed' ? 'Task completed' : 'Task started',
    userId,
    undefined,
    `${task.type}: ${task.description}`,
  );

  store.users
    .filter(user => user.role === 'admin' || user.role === 'manager')
    .forEach(user => {
      addNotification(
        user.id,
        `Maintenance task "${task.type}" has been ${newStatus === 'completed' ? 'completed' : 'started'}.`,
        newStatus === 'completed' ? 'success' : 'info',
      );
    });

  saveStore();
  return { success: true, data: task };
}

export function createMaintenanceTask(input: CreateMaintenanceTaskInput): ActionResult<MaintenanceTask> {
  const actor = requireActiveUser(input.createdBy, ['maintenance']);
  if (!actor.success) return asFailure<MaintenanceTask>(actor);

  const assignee = requireActiveUser(input.assignedTo, ['maintenance']);
  if (!assignee.success) return { success: false, error: 'Select a valid active support assignee.' };

  const type = normalizeText(input.type, 60);
  const description = normalizeText(input.description, 180);

  if (!type) return { success: false, error: 'Task type is required.' };
  if (description.length < 8) return { success: false, error: 'Task description must be at least 8 characters.' };

  const store = getStore();
  const task: MaintenanceTask = {
    taskId: uid(),
    assignedTo: input.assignedTo,
    type,
    description,
    status: 'pending',
    priority: input.priority,
    createdAt: new Date().toISOString(),
  };

  store.tasks.unshift(task);
  addNotification(
    assignee.data!.id,
    `New ${input.priority} ${type.toLowerCase()} task assigned to you.`,
    input.priority === 'critical' ? 'warning' : 'info',
  );
  store.users
    .filter(user => user.role === 'admin' || user.role === 'manager')
    .forEach(user => addNotification(user.id, `Support created a new ${input.priority} task: ${type}.`, 'info'));
  addAuditLog('Maintenance task created', input.createdBy, input.assignedTo, `${type}: ${description}`);

  saveStore();
  return { success: true, data: task };
}

export function toggleUserActive(userId: string, performedBy: string) {
  const actor = requireActiveUser(performedBy, ['admin']);
  if (!actor.success) return asFailure<User>(actor);

  const store = getStore();
  const user = store.users.find(currentUser => currentUser.id === userId);
  if (!user) return { success: false, error: 'User not found.' };

  user.active = !user.active;
  addNotification(userId, user.active ? 'Your account has been reactivated.' : 'Your account has been suspended.', user.active ? 'success' : 'error');
  addAuditLog(user.active ? 'User reactivated' : 'User suspended', performedBy, userId);
  saveStore();
  return { success: true, data: user };
}

export function createTransfer(fromAccountId: string, toAccountId: string, amount: number, userId: string): ActionResult<Transaction> {
  const actor = requireActiveUser(userId, ['user']);
  if (!actor.success) return asFailure<Transaction>(actor);

  const store = getStore();
  const from = store.accounts.find(account => account.accountId === fromAccountId);
  const to = store.accounts.find(account => account.accountId === toAccountId);

  if (!from || !to) return { success: false, error: 'Both accounts must exist.' };
  if (from.userId !== userId || to.userId !== userId) return { success: false, error: 'Transfers are limited to your own accounts.' };
  if (from.accountId === to.accountId) return { success: false, error: 'Select two different accounts.' };
  if (!Number.isFinite(amount) || amount <= 0) return { success: false, error: 'Enter a valid amount.' };
  if (from.balance < amount) return { success: false, error: 'Insufficient funds.' };

  from.balance -= amount;
  to.balance += amount;

  const transaction: Transaction = {
    transactionId: uid(),
    userId,
    accountId: fromAccountId,
    type: 'transfer',
    amount,
    description: `Transfer to ${to.type} account`,
    date: new Date().toISOString(),
    status: 'completed',
    toAccountId,
    flagged: amount > 8000,
  };

  store.transactions.unshift(transaction);
  addAuditLog('Transfer completed', userId, undefined, `Transfer of ${formatCurrency(amount)}`);

  if (amount > 5000) {
    store.users
      .filter(user => user.role === 'manager')
      .forEach(manager => addNotification(manager.id, `High-value transfer of ${formatCurrency(amount)} detected.`, 'warning'));
  }

  saveStore();
  return { success: true, data: transaction };
}

export function submitRequest(userId: string, type: RequestType, details: string): ActionResult<ServiceRequest> {
  const actor = requireActiveUser(userId, ['user']);
  if (!actor.success) return asFailure<ServiceRequest>(actor);

  const cleanDetails = normalizeText(details, 280);
  if (cleanDetails.length < 10) return { success: false, error: 'Please provide a fuller request description.' };

  const store = getStore();
  const request: ServiceRequest = {
    requestId: uid(),
    userId,
    type,
    status: 'pending',
    details: cleanDetails,
    createdAt: new Date().toISOString(),
  };

  store.requests.unshift(request);
  store.users
    .filter(user => user.role === 'admin')
    .forEach(admin => addNotification(admin.id, `New ${type} request submitted.`, 'info'));
  addAuditLog('Request submitted', userId, undefined, `${type} request`);
  saveStore();
  return { success: true, data: request };
}

export function markNotificationRead(notifId: string) {
  const store = getStore();
  const notification = store.notifications.find(currentNotification => currentNotification.id === notifId);
  if (notification) {
    notification.read = true;
    saveStore();
  }
}

export function markAllNotificationsRead(userId: string) {
  const store = getStore();
  store.notifications
    .filter(notification => notification.userId === userId && !notification.read)
    .forEach(notification => {
      notification.read = true;
    });
  saveStore();
}

// Formatters
export function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
