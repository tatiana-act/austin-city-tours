import { PaymentPolicyText } from '@/types/paymentPolicy';

// Stage-1 texts (design.md §8). The maintainer replaces both, together with
// `paymentPolicy.ts`, before stage 2 (PRD AC 5, AC 23).
export const paymentPolicy: PaymentPolicyText = {
  notice:
    'No refunds or cancellations through the site. For any issue, email tatiana.city.guide@gmail.com.',
  policy: [
    {
      paragraphs: ['The policy text will be published here.'],
    },
  ],
};
