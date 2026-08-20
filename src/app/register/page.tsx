"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FiEye, FiEyeOff, FiLock, FiMail, FiUser } from "react-icons/fi";
import { AuthShell, AuthFooter } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useRegisterMutation } from "@/lib/rtk/authApi";
import { toast } from "@/hooks/use-toast";

export default function RegisterPage() {
  const [registerMutation] = useRegisterMutation();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setFormError("All fields are required.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setFormError("Please enter a valid email address.");
      return;
    }
    if (form.password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      setFormError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await registerMutation({ name: form.name, email: form.email, password: form.password }).unwrap();
      toast.success("Account created!", "Welcome to NovaMart.");
      router.push("/account/profile");
    } catch {
      setFormError("Registration failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start shopping in minutes. It's free."
      footer={
        <AuthFooter
          text="Already have an account?"
          linkLabel="Sign in"
          href="/login"
        />
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full name"
          name="name"
          autoComplete="name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Jane Doe"
          leftIcon={<FiUser className="h-4 w-4" aria-hidden />}
          required
        />
        <Input
          label="Email address"
          type="email"
          name="email"
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="you@example.com"
          leftIcon={<FiMail className="h-4 w-4" aria-hidden />}
          required
        />
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          name="password"
          autoComplete="new-password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="At least 6 characters"
          leftIcon={<FiLock className="h-4 w-4" aria-hidden />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <FiEyeOff className="h-4 w-4" aria-hidden /> : <FiEye className="h-4 w-4" aria-hidden />}
            </button>
          }
          required
        />
        <Input
          label="Confirm password"
          type={showPassword ? "text" : "password"}
          name="confirm"
          autoComplete="new-password"
          value={form.confirm}
          onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          placeholder="Re-enter your password"
          leftIcon={<FiLock className="h-4 w-4" aria-hidden />}
          required
        />
        <label className="flex items-start gap-2.5 text-xs text-muted-foreground">
          <input type="checkbox" required className="mt-0.5 h-4 w-4 rounded border-border accent-primary" />
          <span>
            I agree to the{" "}
            <a href="/terms" className="font-semibold text-primary hover:text-primary-strong">
              Terms & Conditions
            </a>{" "}
            and{" "}
            <a href="/privacy-policy" className="font-semibold text-primary hover:text-primary-strong">
              Privacy Policy
            </a>.
          </span>
        </label>
        {formError && (
          <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
            {formError}
          </p>
        )}
        <Button type="submit" fullWidth size="lg" loading={loading}>
          {loading ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthShell>
  );
}
