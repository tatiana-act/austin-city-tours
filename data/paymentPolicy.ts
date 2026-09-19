import { PaymentPolicyText } from '@/types/paymentPolicy';

// Stage-1 texts (design.md §8). The maintainer replaces both, together with
// `paymentPolicy.en.ts`, before stage 2 (PRD AC 5, AC 23).
export const paymentPolicy: PaymentPolicyText = {
  notice:
    'Возврат и отмена через сайт невозможны. По любому вопросу пишите на tatiana.city.guide@gmail.com.',
  policy: [
    {
      paragraphs: ['Здесь будет опубликован текст условий.'],
    },
  ],
};
