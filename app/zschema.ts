import { z } from 'zod';

const phoneSchema = z.string().optional().transform((val) => {
    if (val) {
        return val.replace(/\D/g, '');
    }
    return val; // Return as-is if empty or undefined
})
    .refine((val) => {
        if (!val) {
            return true;
        }
        // After transform, check length
        return val.length === 10 || val.length === 11;
    }, {
        message: 'Введите полный номер телефона',
    }).transform((val) => {
        if (val) {
            if (val.length === 11) {
                val = '+' + val.substring(0,1) + '(' + val.substring(1, 4) + ')' + val.substring(4, 7) + '-' + val.substring(7, 9) + '-' + val.substring(9);
            } else if (val.length === 10) {
                val = '+1(' + val.substring(0, 3) + ')' + val.substring(3, 6) + '-' + val.substring(6, 8) + '-' + val.substring(8);
            }
            return val;
        }
    });

const telegramNicknameSchema = z.string()
    .min(5, "Ник в Telegram не может быть короче 5 символов")
    .max(32, "Ник в Telegram не может быть длиннее 32 символов")
    .regex(/^@?[a-zA-Z][a-zA-Z0-9_]*$/, "Ник в Telegram состоит из латинских букв, цифр и знака подчеркивания");


export const contactFormSchema = z.object({
    name: z.string().min(3, 'Мне нужно хотя бы 3 буквы Вашего имени.').max(50, 'Меня зовут Татьяна. А Вас?'),
    email: z.email('проверьте пожалуйста адрес эл почты').optional().or(z.literal('')),
    phone: phoneSchema,
    tour: z.string().max(200).trim().optional(),
    whatsapp: z.boolean().default(false),
    telegram: telegramNicknameSchema.optional().or(z.literal('')),
    success: z.boolean().default(false),
    errMessage: z.string().optional(),
}).refine((data) => {
    return !(!data.email && !data.phone && !data.telegram);
}, {
    message: 'Как с Вами связаться?',
    path: ['phone'],
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

export const contactFormInitState = {
    name: '',
    email: '',
    phone: '',
    whatsapp: false,
    telegram: '',
    success: false,
    errMessage: ''
}