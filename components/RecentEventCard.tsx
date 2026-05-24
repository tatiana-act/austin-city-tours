'use client';

import React, { useState } from 'react';
import { PastTourEvent } from '@/types/tour';
import { formatDateToUserLocale } from '@/lib/utils';
import { Dialog, DialogPanel } from '@headlessui/react';
import FeedbackForm from "@/components/FeedbackForm";
import AboutTour from "@/components/AboutTour";
import Modal from "@/components/Modal";
import { useTranslations } from "next-intl";

interface PastTourCardProps {
    tour: PastTourEvent;
    tourName: string;
    locale: string;
}

const RecentEventCard: React.FC<PastTourCardProps> = ({ tour, tourName, locale }) => {
    const [openPopupIndex, setOpenPopupIndex] = useState(0);
    const t = useTranslations('Recent');
    const tFeedback = useTranslations('FeedbackForm');
    const handleDetailsClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setOpenPopupIndex(1);
    };
    const handleFeedbackClick = () => {
        setOpenPopupIndex(2);
    };
    const closePopup = () => {
        setOpenPopupIndex(0);
    };

    return (

        <div className="upcoming-tour-card p-2 bg-white rounded-lg shadow-md max-w-md mx-auto relative" id={'tour-card-' + tour.id.valueOf()}>
            <Modal isOpen={openPopupIndex === 2} onClose={closePopup} title={tFeedback('title')}>
                <FeedbackForm tourName={tourName} tourId={tour.tourProgramId} date={tour.date} onClose={closePopup} />
            </Modal>

            <Dialog open={openPopupIndex === 1} onClose={closePopup} className="relative z-50">
                <div className="popup-overlay fixed inset-0" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <DialogPanel className="modalfit">
                        <button className="close" onClick={closePopup}>
                            &times;
                        </button>
                        <AboutTour eventUrl={tour.eventUrl || ''} eventImage={tour.eventImage || ''} tourName={tourName} onClose={closePopup} />
                    </DialogPanel>
                </div>
            </Dialog>

            <div className="upcoming-tour-content">
                <h4 className="upcoming-tour-name">{tourName}</h4>
                <div className="upcoming-tour-details tour-datetime flex items-center">
                    <span>📅 {formatDateToUserLocale(tour.date, locale)}</span>
                    {tour.eventUrl && tour.eventImage &&
                        <button onClick={handleDetailsClick}
                            className="text-indigo-500 hover:text-indigo-700 text-sm font-medium focus:outline-none ml-2 cursor-pointer"
                        >{t('review')}</button>
                    }
                </div>

                {isRecentTour(tour) && <button className="book-button" onClick={handleFeedbackClick}>
                    {t('feedback')}
                </button>
                }
            </div>

        </div>
    );
};

function isRecentTour(tour: PastTourEvent) {
    const date = tour.date.split('-')
    const old = new Date(Number(date[0]), Number(date[1]) - 1, Number(date[2]))
    return (Date.now() - old.getTime()) < 45 * 24 * 60 * 60 * 1000;
}

export default RecentEventCard;
