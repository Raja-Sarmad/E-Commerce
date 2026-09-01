"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  FiArrowRight,
  FiFacebook,
  FiInstagram,
  FiLinkedin,
  FiLock,
  FiMail,
  FiMapPin,
  FiPhone,
  FiShield,
  FiTruck,
  FiTwitter,
  FiYoutube,
  FiRefreshCw,
} from "react-icons/fi";
import { Container } from "@/components/ui/Container";
import { Logo } from "./Logo";
import { Input } from "@/components/ui/Input";
import { toast } from "@/hooks/use-toast";
import { footerLinks, siteConfig } from "@/lib/site";
import { FreeShippingText } from "@/components/ui/FreeShippingText";

const benefits = [
  { icon: FiTruck, title: "Free Shipping", text: <FreeShippingText /> },
  { icon: FiRefreshCw, title: "Easy Returns", text: "30-day money back" },
  { icon: FiLock, title: "Secure Payment", text: "256-bit SSL encrypted" },
  { icon: FiShield, title: "2-Year Warranty", text: "On all electronics" },
];

export function Footer() {
  return (
    <>
      <div className="border-y border-border bg-muted/40">
        <Container>
          <div className="grid grid-cols-2 gap-6 py-10 md:grid-cols-4">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <benefit.icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {benefit.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{benefit.text}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </div>

      <footer className="border-t border-border bg-card">
        <Container>
          <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <Logo />
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
                {siteConfig.tagline} We bring you premium products from around
                the world — carefully curated, quality checked, and delivered
                to your doorstep with care.
              </p>
              <ul className="mt-6 space-y-2.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2.5">
                  <FiMapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                  {siteConfig.address}
                </li>
                <li className="flex items-center gap-2.5">
                  <FiPhone className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                  {siteConfig.phone}
                </li>
                <li className="flex items-center gap-2.5">
                  <FiMail className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                  {siteConfig.email}
                </li>
              </ul>
              <div className="mt-6 flex items-center gap-2">
                {[
                  { icon: FiFacebook, label: "Facebook", href: siteConfig.socials.facebook },
                  { icon: FiTwitter, label: "Twitter", href: siteConfig.socials.twitter },
                  { icon: FiInstagram, label: "Instagram", href: siteConfig.socials.instagram },
                  { icon: FiYoutube, label: "YouTube", href: siteConfig.socials.youtube },
                  { icon: FiLinkedin, label: "LinkedIn", href: siteConfig.socials.linkedin },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <social.icon className="h-4 w-4" aria-hidden />
                  </a>
                ))}
              </div>
            </div>

            {[
              { title: "Shop", links: footerLinks.shop },
              { title: "Company", links: footerLinks.company },
              { title: "Support", links: footerLinks.support },
            ].map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  {group.title}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-primary"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <NewsletterBar />

          <div className="flex flex-col items-center justify-between gap-4 border-t border-border py-6 text-xs text-muted-foreground sm:flex-row">
            <p>
              © {new Date().getFullYear()} {siteConfig.name}. All rights
              reserved.
            </p>
            <div className="flex items-center gap-5">
              <Link href="/privacy-policy" className="hover:text-primary">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-primary">
                Terms of Service
              </Link>
              <Link href="/faq" className="hover:text-primary">
                FAQ
              </Link>
            </div>
          </div>
        </Container>
      </footer>
    </>
  );
}

function NewsletterBar() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) return;
    toast.success("Subscribed!", "You'll receive our best deals and new arrivals.");
    setEmail("");
  };

  return (
    <div className="mb-12 overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary-strong p-8 text-primary-foreground sm:p-10">
      <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
        <div className="max-w-lg">
          <h3 className="text-xl font-bold sm:text-2xl">
            Join the NovaMart newsletter
          </h3>
          <p className="mt-2 text-sm text-primary-foreground/85">
            Get 10% off your first order, plus early access to flash sales,
            new arrivals, and exclusive deals.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex w-full max-w-md gap-2">
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            aria-label="Email address"
            className="h-12 border-transparent bg-white/15 text-white placeholder:text-white/60 focus:border-white focus:ring-white/30"
          />
          <button
            type="submit"
            className="inline-flex h-12 shrink-0 items-center gap-2 rounded-lg bg-white px-5 text-sm font-semibold text-primary transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Subscribe
            <FiArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </form>
      </div>
    </div>
  );
}
