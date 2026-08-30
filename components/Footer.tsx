import React from 'react';
import Link from 'next/link';
import { FaFacebook, FaTelegram, FaInstagram, FaPhone, FaEnvelope } from 'react-icons/fa';
import {useLocale, useTranslations} from "next-intl";

const Footer: React.FC = () => {
  const t = useTranslations('Footer');
  const tPlaces = useTranslations('Places');
  const locale = useLocale();
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <h3>Austin City Tours</h3>
          <p>{t('title')}</p>
          <div className="contact-info" id="contactInfoSection">
            <div className="contact-item">
              <span><FaPhone color="#25D366" /></span>
              <span>
                <a className='contact-item-link' href="tel:+17373097849">+1-737-309-7849</a>
              </span>
            </div>
            <div className="contact-item">
              <span><FaInstagram color="#E4405F" /></span>
              <span>
                <a className='contact-item-link'
                  href="https://www.instagram.com/austin.tx.guide/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </a>
              </span>
            </div>
            <div className="contact-item">
              <span><FaTelegram color="#229ED9" /></span>
              <span>
                <a className='contact-item-link'
                  href="https://t.me/austin_city_tours"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Telegram
                </a>
              </span>
            </div>
            <div className="contact-item">
              <span><FaFacebook color="#1877F2" /></span>
              <span>
                <a className='contact-item-link'
                  href="https://www.facebook.com/groups/662224066870718/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Facebook
                </a>
              </span>
            </div>
            {
              <div className="contact-item">
                <span><FaEnvelope color="#D44638" /></span>
                <span>
                  <a className='contact-item-link' href="mailto:tatiana.city.guide@gmail.com">
                    tatiana.city.guide@gmail.com
                  </a>
                </span>
              </div>
            }
          </div>
          {/* Site-wide entry point to the places page — the footer is on every
              page, and it is not the main navigation. */}
          <p>
            <Link
              href={`/${locale}/places`}
              className="font-semibold text-white underline underline-offset-4 transition-colors hover:text-gray-300"
            >
              {tPlaces('title')}
            </Link>
          </p>
          <p>&copy; 2026 Austin City Tours</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
