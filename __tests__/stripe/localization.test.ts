/**
 * @jest-environment node
 */
/// <reference types="jest" />
import en from '@/messages/en.json';
import ru from '@/messages/ru.json';
import { paymentPolicy as policyEn } from '@/data/paymentPolicy.en';
import { paymentPolicy as policyRu } from '@/data/paymentPolicy';

type Messages = { [key: string]: string | Messages };

function keys(messages: Messages, prefix = ''): string[] {
  return Object.entries(messages).flatMap(([key, value]) =>
    typeof value === 'string' ? [prefix + key] : keys(value, `${prefix}${key}.`),
  );
}

describe('pilot strings exist in both locales (PRD AC 23)', () => {
  it('messages/en.json and messages/ru.json have the same keys', () => {
    expect(keys(ru).sort()).toEqual(keys(en).sort());
  });

  it.each(['Payment', 'PaymentComplete', 'BookingStatus'])('%s is present', (namespace) => {
    expect(en).toHaveProperty(namespace);
    expect(ru).toHaveProperty(namespace);
  });

  it("Stripe's name label fits its 50-character limit (architecture §4.1)", () => {
    expect(en.Payment.nameLabel.length).toBeLessThanOrEqual(50);
    expect(ru.Payment.nameLabel.length).toBeLessThanOrEqual(50);
  });

  it("uses the owner's texts on Stripe's page [73, 74]", () => {
    expect(en.Payment.nameLabel).toBe('Name for the guest list');
    expect(ru.Payment.nameLabel).toBe('Имя для списка гостей');
    expect(en.Payment.pricePerPerson).toBe('Price per person');
    expect(ru.Payment.pricePerPerson).toBe('Цена за одного человека');
  });
});

describe('policy files (architecture §7.2)', () => {
  it.each([
    ['en', policyEn],
    ['ru', policyRu],
  ])('%s notice is at most 1200 characters and names the address (AC 5)', (_locale, policy) => {
    expect(policy.notice.length).toBeLessThanOrEqual(1200);
    expect(policy.notice).toContain('tatiana.city.guide@gmail.com');
    expect(policy.policy.length).toBeGreaterThan(0);
  });
});
