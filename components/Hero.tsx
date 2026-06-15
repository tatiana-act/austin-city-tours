'use client';

import React, {useState} from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import MyConstants from './../lib/MyConstants'
import LanguageSwitcher from './LanguageSwitcher';
import Modal from './Modal';
import BookingForm from "@/components/BookingForm";
import {TourProgram} from "@/types/tour";

interface HeroProps {
  allTours: Map<string, TourProgram>;
}

const Hero: React.FC<HeroProps> = ({ allTours }) => {
  const t = useTranslations('Hero');
  const tAbout = useTranslations('About');
  const tBooking = useTranslations('BookingForm');
  const locale = useLocale();
  const [isBookingOpened, setBookingOpened] = useState(false);
  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };
  const closeBookingPopup = () => {
    setBookingOpened(false);
  };

  return (
    <section className="hero">
      <div className="hero-content">
        <h1>{t('title')}</h1>
        <p>{t('description')}</p>
        <button className="cta-button" onClick={() => scrollToSection(MyConstants.idTours)}>
          {t('tours')}
        </button>
        <button className="cta-button" onClick={() => setBookingOpened(true)}>
          {t('makeOrder')}
        </button>
        <button className="cta-button" onClick={() => scrollToSection(MyConstants.idCalendar)}>
          {t('calendar')}
        </button>
        <button className="cta-button" onClick={() => scrollToSection(MyConstants.idContactInfo)}>
          {t('contacts')}
        </button>
        <Link href={`/${locale}/about`} className="cta-button">
          {tAbout('navLink')}
        </Link>
        <br />
        <div className="absolute top-4 right-4 z-50 md:top-6 md:right-8">
          <LanguageSwitcher />
        </div>
        {isBookingOpened && (
              <Modal isOpen={isBookingOpened} onClose={closeBookingPopup} title={tBooking('title')}>
                <BookingForm allTours={allTours} onClose={closeBookingPopup} />
              </Modal>
        )}
      </div>
    </section>
  );
};

export default Hero;
