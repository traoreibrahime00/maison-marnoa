import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = '2250102528848';
const WHATSAPP_MESSAGE = encodeURIComponent("Bonjour Maison Marnoa, je souhaite obtenir des informations sur vos bijoux.");

export function WhatsAppButton() {
  const [showTooltip, setShowTooltip] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const handleClick = () => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`, '_blank');
  };

  return (
    <div
      className="fixed z-50"
      style={{ bottom: '88px', right: '16px' }}
    >
      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && !dismissed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="absolute bottom-16 right-0 w-56 rounded-2xl p-3 shadow-xl"
            style={{ background: '#fff', border: '1px solid #EDE5D0', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
          >
            <button
              onClick={() => setDismissed(true)}
              className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded-full"
              style={{ background: '#F5F5F5' }}
            >
              <X size={10} color="#888" />
            </button>
            <div className="flex items-start gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: '#25D366' }}
              >
                <MessageCircle size={14} color="#fff" />
              </div>
              <div>
                <p style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700, fontSize: '12px', color: '#1C1510', marginBottom: '2px' }}>
                  Besoin d'aide ?
                </p>
                <p style={{ fontFamily: 'Manrope, sans-serif', fontSize: '10px', color: '#8A7564', lineHeight: 1.4 }}>
                  Nos conseillers répondent en moins de 5 min sur WhatsApp.
                </p>
              </div>
            </div>
            {/* Arrow */}
            <div
              className="absolute -bottom-2 right-6"
              style={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '8px solid #fff' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main button */}
      <motion.button
        onClick={handleClick}
        onHoverStart={() => setShowTooltip(true)}
        onHoverEnd={() => setShowTooltip(false)}
        whileTap={{ scale: 0.88 }}
        whileHover={{ scale: 1.06 }}
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #25D366, #128C7E)',
          boxShadow: '0 4px 20px rgba(37,211,102,0.45)',
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.5, type: 'spring', stiffness: 200 }}
      >
        {/* Pulse ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: 'rgba(37,211,102,0.3)' }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
          <path d="M16 2C8.268 2 2 8.268 2 16c0 2.478.668 4.8 1.832 6.8L2 30l7.388-1.808A13.924 13.924 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm7.28 19.12c-.308.864-1.52 1.576-2.492 1.788-.664.14-1.528.252-4.436-.952-3.72-1.532-6.12-5.308-6.308-5.552-.18-.244-1.508-2.004-1.508-3.824 0-1.82.952-2.712 1.292-3.076.308-.332.82-.484 1.312-.484.158 0 .3.008.428.016.38.016.572.036.82.64.308.752 1.056 2.572 1.148 2.76.092.188.184.436.056.68-.12.252-.228.364-.416.58-.188.216-.368.38-.556.612-.172.204-.364.42-.148.8.216.372.96 1.584 2.06 2.568 1.416 1.256 2.58 1.648 2.996 1.828.32.136.7.1.924-.14.284-.3.636-.8.992-1.296.256-.356.58-.4.92-.276.348.116 2.204 1.04 2.584 1.228.38.188.632.28.724.44.092.16.092.924-.216 1.788z" fill="white" />
        </svg>
      </motion.button>
    </div>
  );
}
