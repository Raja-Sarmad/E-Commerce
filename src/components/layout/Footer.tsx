"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  FiFacebook,
  FiInstagram,
  FiMail,
  FiMapPin,
  FiPhone,
  FiYoutube,
} from "react-icons/fi";
import { Container } from "@/components/ui/Container";
import { toast } from "@/hooks/use-toast";
import { footerLinks, siteConfig } from "@/lib/site";
import { useSubscribeNewsletterMutation } from "@/lib/rtk/storefrontApi";

const PAYMENT_LABELS = ["Visa", "Mastercard", "Amex", "Apple Pay"];

export function Footer() {
  return (
    <footer className="border-t border-primary/20 bg-foreground text-background">
      <Container className="px-4 sm:px-6">
        <NewsletterBlock />

        <div className="grid gap-8 py-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6 lg:py-10">
          <FooterColumn title="The Company" links={footerLinks.company} />
          <FooterColumn title="Policies" links={footerLinks.policies} />
          <FooterColumn title="Shop" links={footerLinks.shop} />
          <div>
            <h3 className="text-[11px] font-semibold tracking-[0.2em] text-background/90 uppercase">
              How can we help you?
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-background/75">
              <li className="flex gap-2.5">
                <FiMapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <span>{siteConfig.address}</span>
              </li>
              <li className="flex gap-2.5">
                <FiPhone className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <a href={`tel:${siteConfig.phone.replace(/\s/g, "")}`} className="hover:text-primary">
                  {siteConfig.phone}
                </a>
              </li>
              <li className="flex gap-2.5">
                <FiMail className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <a href={`mailto:${siteConfig.email}`} className="hover:text-primary">
                  {siteConfig.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center gap-5 border-t border-background/10 py-5 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-3">
            {[
              { icon: FiFacebook, label: "Facebook", href: siteConfig.socials.facebook },
              { icon: FiInstagram, label: "Instagram", href: siteConfig.socials.instagram },
              { icon: FiYoutube, label: "YouTube", href: siteConfig.socials.youtube },
            ].map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="flex h-8 w-8 items-center justify-center rounded-full text-background/80 transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <social.icon className="h-4 w-4" aria-hidden />
              </a>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {PAYMENT_LABELS.map((label) => (
              <span
                key={label}
                className="rounded border border-background/20 px-2 py-0.5 text-[10px] font-medium tracking-wide text-background/60 uppercase"
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        <p className="pb-5 text-center text-[11px] text-background/50">
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: Array<{ label: string; href: string }>;
}) {
  return (
    <div>
      <h3 className="text-[11px] font-semibold tracking-[0.2em] text-background/90 uppercase">
        {title}
      </h3>
      <ul className="mt-4 space-y-2">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-sm text-background/70 transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NewsletterBlock() {
  const [email, setEmail] = useState("");
  const [subscribe, { isLoading }] = useSubscribeNewsletterMutation();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!value || !value.includes("@")) {
      toast.warning("Invalid email", "Please enter a valid email address.");
      return;
    }
    try {
      await subscribe({ email: value }).unwrap();
      toast.success("Subscribed!", "You'll receive offers and updates.");
      setEmail("");
    } catch {
      toast.error("Subscription failed", "Please try again later.");
    }
  };

  return (
    <div className="border-b border-background/10 py-8 text-center lg:py-9">
      <p className="text-[10px] font-medium tracking-[0.28em] text-background/50 uppercase">
        Keep me updated
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[0.12em] text-background uppercase sm:text-3xl">
        Newsletter
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-background/60">
        Subscribe for offers, new arrivals, and exclusive updates.
      </p>
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="mx-auto mt-5 flex max-w-md flex-col gap-2 sm:flex-row sm:items-stretch"
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail"
          aria-label="Email address"
          className="h-11 flex-1 border border-background/30 bg-transparent px-4 text-sm text-background placeholder:text-background/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="h-11 shrink-0 bg-primary px-8 text-xs font-semibold tracking-[0.18em] text-primary-foreground uppercase transition hover:bg-primary-strong disabled:opacity-60"
        >
          {isLoading ? "…" : "Subscribe"}
        </button>
      </form>
    </div>
  );
}
