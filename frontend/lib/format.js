export const fmt = (n, currency = 'USD') => {
  if (n === null || n === undefined) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 2 }).format(n);
};

export const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const fmtDatetime = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const daysLeft = (end) => {
  if (!end) return null;
  const diff = Math.ceil((new Date(end) - Date.now()) / 86400000);
  return Math.max(0, diff);
};

export const cyclePct = (start, end) => {
  if (!start || !end) return 0;
  const pct = ((Date.now() - new Date(start)) / (new Date(end) - new Date(start))) * 100;
  return Math.min(100, Math.max(0, pct));
};

export const sign = (n) => parseFloat(n) >= 0 ? '+' : '';
