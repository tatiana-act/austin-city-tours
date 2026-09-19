export interface PolicySection {
  /** Rendered as h2; absent = paragraphs only. */
  heading?: string;
  /** Plain text, one `<p>` each. */
  paragraphs: string[];
}

/**
 * The maintainer's policy and notice for one language (architecture §7.2). Both
 * `data/paymentPolicy*.ts` files carry both fields, so a missing one fails the build.
 */
export interface PaymentPolicyText {
  /** Plain text, at most 1200 characters, names tatiana.city.guide@gmail.com. */
  notice: string;
  policy: PolicySection[];
}
