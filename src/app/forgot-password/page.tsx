"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { FiArrowLeft, FiCheckCircle, FiMail } from "react-icons/fi";
import { AuthShell } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { toast } from "@/hooks/use-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLoading(false);
    setSent(true);
    toast.success("Reset link sent", `Check your inbox at ${email}.`);
  };

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a reset link."
    >
      {sent ? (
        <div className="animate-fade-in-up text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/15">
            <FiCheckCircle className="h-8 w-8 text-success" aria-hidden />
          </span>
          <h2 className="mt-4 text-lg font-bold text-foreground">Check your email</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We&apos;ve sent a password reset link to{" "}
            <span className="font-semibold text-foreground">{email}</span>. The link
            expires in 30 minutes.
          </p>
          <Link
            href="/reset-password"
            className="mt-5 inline-block text-sm font-semibold text-primary hover:text-primary-strong"
          >
            I have the link — reset password
          </Link>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              leftIcon={<FiMail className="h-4 w-4" aria-hidden />}
              required
            />
            <Button type="submit" fullWidth size="lg" loading={loading}>
              {loading ? "Sending..." : "Send reset link"}
            </Button>
          </form>
          <Link
            href="/login"
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-strong"
          >
            <FiArrowLeft className="h-4 w-4" aria-hidden />
            Back to sign in
          </Link>
        </>
      )}
    </AuthShell>
  );
}
