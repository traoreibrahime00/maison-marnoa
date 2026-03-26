import fichier1 from '../../assets/logo-dark.png';   // Fichier 1 — mode sombre
import fichier2 from '../../assets/logo-light.png';  // Fichier 2 — mode clair
import { useApp } from '../context/AppContext';

interface LogoProps {
  variant?: 'auto' | 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const heights = { sm: 28, md: 48, lg: 60 };

export function MaisonMarnoaLogo({ variant = 'auto', size = 'md', className = '' }: LogoProps) {
  const { darkMode } = useApp();
  const h = heights[size];

  // dark mode  → Fichier 1
  // light mode → Fichier 2
  // variant="light" = sur fond sombre (hero, login) → Fichier 1
  // variant="dark"  = sur fond clair → Fichier 2
  const isDark = variant === 'dark' ? false
               : variant === 'light' ? true
               : darkMode;

  const src = isDark ? fichier1 : fichier2;

  return (
    <div className={`flex items-center ${className}`}>
      <img
        src={src}
        alt="Maison Marnoa"
        style={{ height: `${h}px`, width: 'auto', objectFit: 'contain' }}
        draggable={false}
      />
    </div>
  );
}
