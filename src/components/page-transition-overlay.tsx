'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';

export function PageTransitionOverlay() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref) sessionStorage.setItem('ac_referral_code', ref);
    } catch (e) {}
    const alreadyVisited = sessionStorage.getItem('ac_page_visited');
    if (!alreadyVisited) {
      sessionStorage.setItem('ac_page_visited', '1');
      return;
    }

    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="page-transition-overlay"
          className="fixed inset-0 z-[999] flex items-center justify-center bg-white dark:bg-neutral-950"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.15, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="relative h-40 w-40 sm:h-52 sm:w-52"
          >
            <Image
              src="/images/loading-artisan.png"
              alt="Artisan Connect"
              fill
              className="object-contain drop-shadow-2xl"
              priority
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
