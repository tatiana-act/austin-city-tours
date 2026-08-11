'use client';

import React  from 'react';
import {PastTourEvent, TourProgram, UpcomingTourEvent} from '@/types/tour';
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import type { EventClickArg } from '@fullcalendar/core'
import MyConstants from "@/lib/MyConstants";
import {useTranslations} from "next-intl";
import {useRouter} from "@/i18n/routing";

interface CalendarSectionProps {
  allTours: ReadonlyMap<string, TourProgram>;
  upcomingTours: UpcomingTourEvent[];
  recentTours: PastTourEvent[];
  locale: string;
  // 'home' scrolls to the tour card on the same page (default);
  // 'standalone' navigates to the tour's detail page (used on /tours/calendar).
  variant?: 'home' | 'standalone';
}

const CalendarSection: React.FC<CalendarSectionProps> = ({
  allTours,
  upcomingTours,
  recentTours,
  locale,
  variant = 'home'
}) => {
  const router = useRouter();

  const handleEventClick = (info: EventClickArg) => {
      const eventId = info.event.extendedProps.eventId;
      if (variant === 'standalone') {
          router.push(`/tours/${eventId}`);
          return;
      }
      document.getElementById('tour-card-' + eventId)?.scrollIntoView({ behavior: 'smooth' });
  }

  const futureEvents = upcomingTours.map((ut)=> {
      return {
          title: allTours.get(ut.tourProgramId)?.shortTitle || '',
          date: ut.date,
          allDay: true,
          extendedProps: {
              programId: ut.tourProgramId,
              eventId: ut.id,
          }
      }
  })

  const pastEvents = recentTours.map((rt)=> {
      return {
          title: allTours.get(rt.tourProgramId)?.shortTitle || '',
          date: rt.date,
          allDay: true,
          extendedProps: {
            programId: rt.tourProgramId,
            eventId: rt.id,
          }
        }
    })
  const events = pastEvents.concat(futureEvents);
  const initDate = upcomingTours.length === 0 ? new Date() : new Date(upcomingTours[0].date);
  const t = useTranslations('Calendar');

  return (
      <section className="section upcoming-tours-section" id={MyConstants.idCalendar}>
         <div className="container">
              <h2 className="section-title">{t('title')}</h2>
             <div className="tours-grid">
              <FullCalendar
        plugins={[
        dayGridPlugin,
        ]}
        firstDay={locale == 'ru' ? 1 : 7}
        headerToolbar={{
            left: 'prev,next',
            center: 'title'
        }}
        locale={locale}
        initialView='dayGridMonth'
        initialDate={initDate}
        // Grow with content instead of a fixed aspect-ratio height, otherwise
        // wrapped multi-line tour titles push the last weeks out of view.
        height='auto'
        nowIndicator={true}
        editable={false}
        selectable={true}
        selectMirror={true}
        eventClick={handleEventClick}
        events={events}
    />
             </div>
         </div>
      </section>
  );
};

export default CalendarSection;
