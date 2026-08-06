"use client";

import { useState, type FormEvent } from "react";
import { FiClock, FiHeadphones, FiMail, FiMapPin, FiPhone, FiSend } from "react-icons/fi";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastProvider";
import { siteConfig } from "@/lib/site";

const contactMethods = [
  {
    icon: FiPhone,
    title: "Call us",
    value: siteConfig.phone,
    detail: "Mon–Fri, 9am–6pm PT",
  },
  {
    icon: FiMail,
    title: "Email us",
    value: siteConfig.email,
    detail: "We reply within 24 hours",
  },
  {
    icon: FiMapPin,
    title: "Visit us",
    value: siteConfig.address,
    detail: "San Francisco, CA",
  },
  {
    icon: FiClock,
    title: "Support hours",
    value: "24/7 live chat",
    detail: "Always here for you",
  },
];

export default function ContactPage() {
  const { success } = useToast();
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "Order support",
    message: "",
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSending(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setSending(false);
    setForm({ name: "", email: "", subject: "Order support", message: "" });
    success("Message sent!", "Thanks for reaching out — we'll reply within 24 hours.");
  };

  return (
    <Container className="py-6">
      <Breadcrumb items={[{ label: "Contact" }]} />

      <div className="grid gap-10 lg:grid-cols-[1fr_420px] lg:py-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            Get in touch
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            How can we help?
          </h1>
          <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
            Whether you have a question about an order, a product, or want to
            partner with us — our team is here to help. Fill out the form and
            we&apos;ll get back to you within one business day.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {contactMethods.map((method) => (
              <Card key={method.title} className="p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <method.icon className="h-5 w-5" aria-hidden />
                </span>
                <h2 className="mt-3 text-sm font-bold text-foreground">{method.title}</h2>
                <p className="mt-1 text-sm text-foreground/80">{method.value}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{method.detail}</p>
              </Card>
            ))}
          </div>
        </div>

        <Card className="h-fit p-6 sm:p-8">
          <h2 className="text-xl font-extrabold text-foreground">Send us a message</h2>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              label="Your name"
              name="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Jane Doe"
              required
            />
            <Input
              label="Email address"
              type="email"
              name="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              required
            />
            <Select
              label="Topic"
              name="subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            >
              {[
                "Order support",
                "Returns & refunds",
                "Shipping question",
                "Product inquiry",
                "Partnership",
                "Other",
              ].map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </Select>
            <Textarea
              label="Message"
              name="message"
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Tell us how we can help..."
              required
            />
            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={sending}
              leftIcon={<FiSend className="h-4 w-4" aria-hidden />}
            >
              {sending ? "Sending..." : "Send message"}
            </Button>
          </form>
        </Card>
      </div>
    </Container>
  );
}
