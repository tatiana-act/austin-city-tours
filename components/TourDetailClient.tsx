'use client';

import React, { useState } from 'react';
import { TourProgram } from '@/types/tour';
import Modal from './Modal';
import ContactForm from './ContactForm';
import { useTranslations } from 'next-intl';

interface TourDetailClientProps {
  tourProgram: TourProgram;
}

const TourDetailClient: React.FC<TourDetailClientProps> = ({ tourProgram }) => {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations('TourDetail');
  const tContact = useTranslations('ContactForm');

  return (
    <>
      <button className="book-button tour-detail-book-button" onClick={() => setIsOpen(true)}>
        {t('book')}
      </button>
      <Modal isOpen={isOpen} title={tContact('title')} onClose={() => setIsOpen(false)}>
        <ContactForm tourName={tourProgram.title} onClose={() => setIsOpen(false)} />
      </Modal>
    </>
  );
};

export default TourDetailClient;
