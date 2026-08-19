'use client';

import React from 'react';
import ToursSection from '@/components/ToursSection';
import CalendarSection from "@/components/CalendarSection";
import UpcomingToursSection from '@/components/UpcomingSection';
import BookingManager from '@/components/BookingManager';
import { TourProgram, UpcomingTourEvent } from '@/types/tour';
import type { PoiView } from '@/lib/poi';
import pastTours from '@/data/RecentTours';


interface HomeClientProps {
    allTours: Map<string, TourProgram>;
    tours: TourProgram[];
    /** Places per program id, read on the server — see `app/[locale]/page.tsx`. */
    poiByProgram: Record<string, PoiView[]>;
    upcomingTours: UpcomingTourEvent[];
    isMobileDevice: boolean;
    locale: string;
}

const HomeClient: React.FC<HomeClientProps> = ({ allTours, tours, poiByProgram, upcomingTours, isMobileDevice, locale }) => {
    return (
        <BookingManager allTours={allTours}>
            {(handleBookTour) => (
                <>
                    <ToursSection tours={tours} poiByProgram={poiByProgram} onBookTour={handleBookTour} />
                    <CalendarSection allTours={allTours} upcomingTours={upcomingTours} recentTours={pastTours} locale={locale} />
                    <UpcomingToursSection allTours={allTours} upcomingTours={upcomingTours} onReserveSpot={handleBookTour} isMobileDevice={isMobileDevice} locale={locale} />
                </>
            )}
        </BookingManager>
    );
};

export default HomeClient;
