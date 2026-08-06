"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiCheckCircle, FiLock } from "react-icons/fi";
import { AuthShell } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/context/ToastProvider";

export default function ResetPasswordPage() {
  const { success } = useToast();
  const router = useRouter();
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (form.password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      setFormError("Passwords do not match.");
      return;
    }
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setLoading(false);
    setDone(true);
    success("Password updated", "You can now sign in with your new password.");
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Choose a new password for your account."
    >
      {done ? (
        <div className="animate-fade-in-up text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/15">
            <FiCheckCircle className="h-8 w-8 text-success" aria-hidden />
          </span>
          <h2 className="mt-4 text-lg font-bold text-foreground">Password updated</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your password has been changed successfully.
          </p>
          <Button href="/login" fullWidth className="mt-6">
            Sign in with new password
          </Button>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="New password"
              type="password"
              name="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="At least 6 characters"
              leftIcon={<FiLock className="h-4 w-4" aria-hidden />}
              required
            />
            <Input
              label="Confirm new password"
              type="password"
              name="confirm"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              placeholder="Re-enter new password"
              leftIcon={<FiLock className="h-4 w-4" aria-hidden />}
              required
            />
            {formError && (
              <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
                {formError}
              </p>
            )}
            <Button type="submit" fullWidth size="lg" loading={loading}>
              {loading ? "Updating..." : "Update password"}
            </Button>
          </form>
          <Link
            href="/login"
            className="mt-5 inline-block text-sm font-semibold text-primary hover:text-primary-strong"
          >
            Back to sign in
          </Link>
        </>
      )}
    </AuthShell>
  );
}
