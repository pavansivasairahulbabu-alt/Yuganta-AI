export function initialsDataUrl(name, size = 24, bg = '#E5E7EB', fg = '#6B7280') {
  const char = name && String(name).trim().length ? String(name).trim()[0].toUpperCase() : '?';
  const fontSize = Math.round(size * 0.6);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="100%" height="100%" fill="${bg}"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif" font-size="${fontSize}" fill="${fg}">${char}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
