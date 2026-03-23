import logoImg from '../../assets/95142fd9e55c098717be21006672d1b38112448f.png';

interface LogoProps {
  variant?: 'dark' | 'light' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const heights = {
  sm: 28,
  md: 48,
  lg: 60,
};

export function MaisonMarnoaLogo({ variant = 'dark', size = 'md', className = '' }: LogoProps) {
  const h = heights[size];

  return (
    <div className={`flex items-center ${className}`}>
      <img
        src={logoImg}
        alt="Maison Marnoa"
        style={{
          height: `${h}px`,
          width: 'auto',
          objectFit: 'contain',
          filter: variant === 'light' ? 'brightness(0) invert(1)' : 'none',
        }}
        draggable={false}
      />
    </div>
  );
}