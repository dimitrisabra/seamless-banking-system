import { beforeEach, describe, expect, it } from 'vitest';
import { buildManagerReportFile } from '@/lib/reportExports';
import { createMaintenanceTask, createTransfer, getStore, resetStore, updateTaskStatus } from '@/lib/bankData';

describe('banking security and operations flows', () => {
  beforeEach(() => {
    localStorage.clear();
    resetStore();
  });

  it('lets support complete a task and moves it into completed state', () => {
    const store = getStore();
    const creator = store.users.find(user => user.role === 'maintenance')!;
    const assignee = store.users.find(user => user.role === 'maintenance' && user.id !== creator.id)!;

    const creationResult = createMaintenanceTask({
      assignedTo: assignee.id,
      type: 'Security Patch',
      description: 'Rotate expiring TLS certificates for the API edge nodes.',
      priority: 'high',
      createdBy: creator.id,
    });

    expect(creationResult.success).toBe(true);
    expect(store.tasks[0]?.taskId).toBe(creationResult.data?.taskId);

    const startResult = updateTaskStatus(creationResult.data!.taskId, 'in_progress', creator.id);
    const completeResult = updateTaskStatus(creationResult.data!.taskId, 'completed', creator.id);

    expect(startResult.success).toBe(true);
    expect(completeResult.success).toBe(true);
    expect(store.tasks[0]?.status).toBe('completed');
    expect(store.tasks[0]?.assignedTo).toBe(creator.id);
    expect(store.tasks[0]?.resolvedAt).toBeTruthy();
  });

  it('blocks cross-account transfers and sanitizes export output', () => {
    const store = getStore();
    const customer = store.users.find(user => user.role === 'user')!;
    const ownAccounts = store.accounts.filter(account => account.userId === customer.id);
    const foreignAccount = store.accounts.find(account => account.userId !== customer.id)!;

    const transferResult = createTransfer(ownAccounts[0].accountId, foreignAccount.accountId, 100, customer.id);
    expect(transferResult.success).toBe(false);
    expect(transferResult.error).toMatch(/own accounts/i);

    store.transactions.unshift({
      transactionId: 'flagged-export-test',
      userId: customer.id,
      accountId: ownAccounts[0].accountId,
      type: 'transfer',
      amount: 9200,
      description: '=HYPERLINK("http://bad.example","click")',
      date: new Date().toISOString(),
      status: 'completed',
      flagged: true,
    });

    const fraudReport = buildManagerReportFile('fraud-detection', store);

    expect(fraudReport.filename).toMatch(/fraud-detection-.*\.csv/);
    expect(fraudReport.content).toContain('\'=HYPERLINK');
  });
});
