'use client';

import React, {useEffect} from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useActionState } from 'react';
import {feedbackFormSchema, feedbackFormInitState, FeedbackFormData} from '@/app/zfdschema'
import {submitFeedbackForm} from "@/app/actions/sendFeedback";
import {useTranslations} from "next-intl";

interface FeedbackFormProps {
    tourName: string,
    tourId: string,
    date: string,
    onClose: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ tourName, tourId, date, onClose }) => {
    const { register, formState: { errors }, setValue } = useForm<FeedbackFormData>({
        resolver: zodResolver(feedbackFormSchema),
    });
    const [state, formAction, isPending] = useActionState(submitFeedbackForm, feedbackFormInitState);
    const t = useTranslations('FeedbackForm');

    useEffect(() => {
        if (state.success) {
            onClose();
        }
    }, [state.success, onClose]);

    useEffect(() => {
     setValue('name', state.name || '');
     setValue('tour', state.tour || '');
     setValue('tourId', state.tourId || '');
     setValue('date', state.date || '');
     setValue('text', state.text || '');
    }, [state, setValue]);
    return (
        // <div className="tour-body">Большое спасибо, что вы посетили тур "{tourName}". Пожалуйста опишите свои впечатления:</div>
        <form action={formAction}>
            <div className="form-body">{t('body', {tour: tourName})}
            <div>
                <label htmlFor="name" className="block text-sm font-bold mb-2">
                  {t('yourName')}
                </label>
                <input
                    type="text"
                    id="name"
                    autoComplete="name"
                    required
                    {...register('name')}
                    className="w-full p-3 rounded-lg bg-white/90 text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
            </div>
            <div className="mb-4">
                <label htmlFor="text" className="block text-sm font-bold mb-2">
                  {t('text')}
                </label>
                <textarea
                    id="text"
                    placeholder={t('text')}
                    rows={7}
                    className="w-full p-3 rounded-lg bg-white/90 text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    {...register('text')}
                />
                {errors.text && <div className="form-error">{errors.text.message}</div>}
            </div>
            </div>
            <input type="hidden" value={tourName} {...register("tour")} />
            <input type="hidden" value={tourId} {...register("tourId")} />
            <input type="hidden" value={date} {...register("date")} />
            {/* Display server errors */}
            {!state.success && state?.errMessage && <div className="mb-4"><div className="form-error">{state.errMessage}</div></div>}
            <button type="submit" disabled={isPending} className="book-button">
                {isPending ? t('pending') : t('submit')}
            </button>
        </form>
    );
};

export default FeedbackForm;