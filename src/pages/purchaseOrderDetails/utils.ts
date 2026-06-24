import { LineItem } from '@/models';

export const isSupplierRole = (role?: string) => role?.toUpperCase() === 'SUPPLIER';

export const getTabs = (role?: string) => {
  if (isSupplierRole(role)) {
    return ['OVERVIEW', 'LINE ITEM', 'HISTORY', 'DOCUMENT'];
  }
  return ['OVERVIEW', 'LINE ITEM', 'HISTORY', 'DOCUMENT'];
};

export const formatLineId = (line?: LineItem) => {
  if (!line) return '';
  if (line.id) return String(line.id);
  return String(line.line_number || '').padStart(5, '0');
};

export const formatActionLabel = (action?: string) => {
  const value = String(action || 'ACTIVITY').trim().toUpperCase();
  return value.replace(/_/g, ' ');
};

export const getActionVisual = (action?: string): { color: 'warning' | 'info' } => {
  const normalized = String(action || '').toUpperCase();

  if (
    normalized.includes('HOLD') ||
    // normalized.includes('NEED_MORE_INFORMATION') ||
    normalized.includes('PROPOSE_CHANGE') ||
    normalized.includes('RAISE_CONCESSION') ||
    normalized.includes('MOVE_IN') ||
    normalized.includes('MOVE_OUT') ||
    normalized.includes('SPLIT')
  ) {
    return { color: 'info' };
  }

  return { color: 'warning' };
};
