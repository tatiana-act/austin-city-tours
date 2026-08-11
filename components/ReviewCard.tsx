'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Review } from '@/types/review';

interface ReviewCardProps {
    review: Review;
    tourTitle?: string;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, tourTitle }) => {
    const t = useTranslations('Reviews');
    const [isExpanded, setIsExpanded] = useState(false);
    const [shouldShowButton, setShouldShowButton] = useState(false);
    const textRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        const checkOverflow = () => {
            const element = textRef.current;
            if (element) {
                // If scrollHeight > clientHeight, content is truncated.
                const isOverflowing = element.scrollHeight > element.clientHeight;
                setShouldShowButton(isOverflowing || isExpanded);
            }
        };
        checkOverflow();
        window.addEventListener('resize', checkOverflow);
        return () => window.removeEventListener('resize', checkOverflow);
    }, [review.text, isExpanded]); // Re-check if text changes or expansion state changes

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                <span className="font-bold text-gray-900 text-lg">{tourTitle}</span>
                <span className="text-sm text-gray-500">{review.tourDate}</span>
            </div>
            {tourTitle && (
                <div className="text-sm font-semibold text-indigo-600 mb-4 leading-relaxed">
                    {review.reviewer}
                </div>
            )}
            <div className="flex-grow mb-4">
                <p
                    ref={textRef}
                    className={`text-gray-600 italic leading-relaxed ${!isExpanded ? 'line-clamp-3' : ''}`}
                >
                    "{review.text}"
                </p>
                {shouldShowButton && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-indigo-500 hover:text-indigo-700 text-sm font-medium mt-2 focus:outline-none cursor-pointer"
                    >
                        {isExpanded ? t('hide') : t('readMore')}
                    </button>
                )}
            </div>
            {review.link && (
                <a href={review.link} target="_blank" rel="noopener noreferrer" className="inline-block mt-auto text-sm font-medium text-purple-600 hover:text-purple-700 hover:underline">
                    {t('readOriginal')}
                </a>
            )}
        </div>
    );
};

export default ReviewCard;
