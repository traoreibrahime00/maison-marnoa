import { motion } from 'motion/react';

interface SkeletonCardProps {
  index?: number;
  className?: string;
}

function ShimmerBox({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`overflow-hidden relative ${className}`}
      style={{ background: '#F0EAD8', borderRadius: 12, ...style }}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
        }}
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

export function SkeletonCard({ index = 0, className = '' }: SkeletonCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      className={`rounded-2xl overflow-hidden ${className}`}
      style={{ background: '#FFFFFF', border: '1px solid #EDE5D0' }}
    >
      {/* Image */}
      <ShimmerBox style={{ aspectRatio: '1', borderRadius: 0 }} />
      {/* Content */}
      <div className="p-3 flex flex-col gap-2">
        <ShimmerBox style={{ height: 14, width: '75%' }} />
        <ShimmerBox style={{ height: 10, width: '45%' }} />
        <ShimmerBox style={{ height: 14, width: '55%', marginTop: 2 }} />
      </div>
    </motion.div>
  );
}

export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} index={i} />
      ))}
    </>
  );
}

export function SkeletonHorizontal({ count = 3 }: { count?: number }) {
  return (
    <div className="flex gap-3 overflow-x-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex-shrink-0 w-40">
          <SkeletonCard index={i} />
        </div>
      ))}
    </div>
  );
}
