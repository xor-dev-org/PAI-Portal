export const formatActionLabel = (value: string): string =>
  value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export const formatLineId = (lineNumber: number): string => String(lineNumber).padStart(5, '0');

export const toCurrency = (amount: number, currency: string): string =>
  `${currency} ${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export const normalizeLineStatus = (value: string): string =>
  value
    .trim()
    .replace(/\s+/g, '_')
    .toUpperCase();

export const lineStatusAliases: Record<string, string[]> = {
  ALL: ['ALL'],
  REVISED: ['REVISED', 'MAKE_REVISION', 'IN_PROGRESS'],
  CONCESSION: ['CONCESSION', 'RAISE_CONCESSION', 'IN_PROGRESS'],
  SPLIT_PO: ['SPLIT_PO', 'SPLIT', 'IN_PROGRESS'],
  REJECTED: ['REJECTED', 'REJECT', 'CANCELLED'],
  ACCEPTED: ['ACCEPTED', 'ACCEPT', 'APPROVED'],
  NEED_MORE_INFO: ['NEED_MORE_INFO', 'NEED_MORE_INFORMATION', 'IN_PROGRESS'],
  HOLD: ['HOLD'],
  IN_PROGRESS: ['IN_PROGRESS'],
  APPROVED: ['APPROVED'],
  CANCELLED: ['CANCELLED'],
  DELIVERED: ['DELIVERED'],
};

export const doesLineStatusMatchTab = (tabValue: string, lineStatus: string): boolean => {
  const normalizedTab = normalizeLineStatus(tabValue);
  const normalizedLineStatus = normalizeLineStatus(lineStatus || 'ALL');
  if (normalizedTab === 'ALL') {
    return true;
  }

  const aliases = lineStatusAliases[normalizedTab] || [normalizedTab];
  return aliases.includes(normalizedLineStatus);
};
