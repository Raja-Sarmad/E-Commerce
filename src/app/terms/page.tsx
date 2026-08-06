import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The terms and conditions that govern your use of the NovaMart store and services.",
};

const sections = [
  {
    title: "1. Acceptance of terms",
    body: [
      "By accessing or using the NovaMart website, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, you should not use our services.",
    ],
  },
  {
    title: "2. Account responsibilities",
    body: [
      "When you create an account, you agree to provide accurate and complete information and to keep it up to date.",
      "You are responsible for maintaining the confidentiality of your login credentials and for all activity under your account. Notify us immediately of any unauthorized use.",
    ],
  },
  {
    title: "3. Orders & payment",
    body: [
      "All prices are listed in U.S. dollars and are subject to change. We reserve the right to refuse or cancel any order, including those suspected of fraud.",
      "Payment is due at the time of purchase. We accept major credit cards, PayPal, and digital wallets. A failed payment may result in order cancellation.",
    ],
  },
  {
    title: "4. Shipping & delivery",
    body: [
      "Estimated delivery times are provided at checkout and are not guaranteed. Delays caused by carriers, customs, or force majeure are outside our control.",
      "Risk of loss passes to you upon delivery. You are responsible for confirming delivery and reporting any damage within 48 hours.",
    ],
  },
  {
    title: "5. Returns & refunds",
    body: [
      "Eligible items may be returned within 30 days of delivery in original condition. Refunds are issued to the original payment method once the return is received.",
      "Certain items, including personalized products and clearance merchandise, are non-returnable unless defective.",
    ],
  },
  {
    title: "6. Intellectual property",
    body: [
      "All content on the site — including text, graphics, logos, and software — is the property of NovaMart or its licensors and is protected by intellectual property laws.",
      "You may not reproduce, distribute, or create derivative works from our content without prior written permission.",
    ],
  },
  {
    title: "7. Limitation of liability",
    body: [
      "To the maximum extent permitted by law, NovaMart is not liable for indirect, incidental, or consequential damages arising from your use of our services or products.",
      "Our total liability for any claim related to your purchase is limited to the amount you paid for the product or service in question.",
    ],
  },
  {
    title: "8. Changes to these terms",
    body: [
      "We may update these terms from time to time. Material changes will be posted on this page with an updated effective date. Continued use of the service after changes constitutes acceptance.",
    ],
  },
  {
    title: "9. Contact",
    body: [
      "Questions about these terms? Reach out to legal@novamart.com or write to us at 1200 Market Street, Suite 400, San Francisco, CA 94102.",
    ],
  },
];

export default function TermsPage() {
  return (
    <Container className="py-6">
      <Breadcrumb items={[{ label: "Legal" }, { label: "Terms & Conditions" }]} />

      <div className="mx-auto max-w-3xl py-6">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">
          Legal
        </p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Terms & Conditions
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Last updated: January 15, 2026
        </p>
        <p className="mt-6 leading-relaxed text-muted-foreground">
          These Terms & Conditions govern your use of the NovaMart website and
          the purchase of products from our store. Please read them carefully
          before placing an order.
        </p>

        <Card className="mt-8 space-y-8 p-6 sm:p-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-extrabold text-foreground">
                {section.title}
              </h2>
              {section.body.map((paragraph, i) => (
                <p
                  key={i}
                  className="mt-3 text-sm leading-relaxed text-muted-foreground"
                >
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </Card>
      </div>
    </Container>
  );
}
