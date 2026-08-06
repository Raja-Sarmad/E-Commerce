import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read the NovaMart privacy policy to understand how we collect, use, and protect your personal information.",
};

const sections = [
  {
    title: "1. Information we collect",
    body: [
      "We collect information you provide directly, such as your name, email address, shipping address, phone number, and payment details when you create an account, place an order, or contact support.",
      "We automatically collect certain information about your device and usage, including IP address, browser type, pages visited, and how you interact with our store, to improve your shopping experience.",
    ],
  },
  {
    title: "2. How we use your information",
    body: [
      "To process and deliver your orders, including sending order confirmations and tracking updates.",
      "To communicate with you about promotions, new products, and important account updates — you can opt out of marketing emails at any time.",
      "To improve and personalize your experience, analyze site traffic, and prevent fraud and abuse.",
    ],
  },
  {
    title: "3. How we share your information",
    body: [
      "We share your data with trusted service providers who help us operate our business, such as payment processors, shipping carriers, and analytics providers — strictly limited to what they need to perform their services.",
      "We do not sell your personal information to third parties. We may disclose information if required by law or to protect our rights.",
    ],
  },
  {
    title: "4. Cookies & similar technologies",
    body: [
      "We use cookies and similar technologies to keep you signed in, remember your preferences (like your cart), and understand how our store is used.",
      "You can control cookies through your browser settings. Disabling some cookies may affect features like keeping items in your cart.",
    ],
  },
  {
    title: "5. Data security",
    body: [
      "We use industry-standard safeguards, including SSL/TLS encryption and secure payment processing, to protect your personal information in transit and at rest.",
      "While no method of transmission is 100% secure, we work hard to protect your data and review our practices regularly.",
    ],
  },
  {
    title: "6. Your rights & choices",
    body: [
      "You may access, update, or delete your account information at any time from your profile settings.",
      "You can request a copy of the data we hold about you, ask us to correct inaccuracies, or request deletion by contacting our support team.",
    ],
  },
  {
    title: "7. Contact us",
    body: [
      "If you have questions about this policy or how we handle your data, contact us at privacy@novamart.com or by mail at 1200 Market Street, Suite 400, San Francisco, CA 94102.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <Container className="py-6">
      <Breadcrumb items={[{ label: "Legal" }, { label: "Privacy Policy" }]} />

      <div className="mx-auto max-w-3xl py-6">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">
          Legal
        </p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Last updated: January 15, 2026
        </p>
        <p className="mt-6 leading-relaxed text-muted-foreground">
          At NovaMart, your privacy matters. This policy explains what
          information we collect, how we use it, and the choices you have. By
          using our services, you agree to the practices described below.
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
