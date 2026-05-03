export function brandFromInitials(i) {
  const palette = ["#3AFF3E","#FFD23F","#FF8AE6","#7A4CFF","#0070F3","#FF6B35","#01963A"];
  let h = 0;
  for (const c of i || "") h = (h*31 + c.charCodeAt(0)) >>> 0;
  return palette[h % palette.length];
}
