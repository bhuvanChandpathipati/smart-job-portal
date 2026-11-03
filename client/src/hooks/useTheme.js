import { useState } from 'react';
export default function useTheme() {
  const [dark, setDark] = useState(document.documentElement.classList.contains('dark'));
  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('sjp_theme', next ? 'dark' : 'light');
    setDark(next);
  };
  return { dark, toggle };
}
