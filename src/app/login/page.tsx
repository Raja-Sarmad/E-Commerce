"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FiEye, FiEyeOff, FiLock, FiMail } from "react-icons/fi";
import { AuthShell, AuthFooter } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useLoginMutation, useGetMeQuery } from "@/lib/rtk/authApi";
import { toast } from "@/hooks/use-toast";

const demoCredentials = [
  { email: "admin@novamart.com", password: "Admin@123456", role: "Admin" },
  { email: "rachel@example.com", password: "Customer@123", role: "Customer" },
];

export default function LoginPage() {
  const [loginMutation, { isLoading: loginLoading }] = useLoginMutation();
  const { data: user } = useGetMeQuery();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!user) return;
    const adminRoles = ["admin", "super_admin", "manager", "staff"];
    if (adminRoles.includes(user.role ?? "")) {
      router.replace("/admin");
    } else {
      router.replace("/account/profile");
    }
  }, [user, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!email.trim() || !password.trim()) {
      setFormError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const user = await loginMutation({ email, password }).unwrap();
      toast.success("Welcome back!", "You have signed in successfully.");
      const adminRoles = ["admin", "super_admin", "manager", "staff"];
      if (adminRoles.includes(user.role ?? "")) {
        router.push("/admin");
      } else {
        router.push("/account/profile");
      }
    } catch {
      setFormError("Invalid credentials. Try one of the demo accounts below.");
      toast.error("Sign in failed", "Invalid email or password.");
    }
    setLoading(false);
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your account to continue."
      footer={
        <AuthFooter
          text="Don't have an account?"
          linkLabel="Create one now"
          href="/register"
        />
      }
    >
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
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
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
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" className="h-4 w-4 rounded border-border accent-primary" />
            Remember me
          </label>
          <a href="/forgot-password" className="text-sm font-semibold text-primary hover:text-primary-strong">
            Forgot password?
          </a>
        </div>
        {formError && (
          <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
            {formError}
          </p>
        )}
        <Button type="submit" fullWidth size="lg" loading={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <div className="mt-6">
        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Demo accounts
          </span>
          <span className="h-px flex-1 bg-border" />
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {demoCredentials.map((demo) => (
            <button
              key={demo.email}
              type="button"
              onClick={() => {
                setEmail(demo.email);
                setPassword(demo.password);
              }}
              className="rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-left transition-all hover:border-primary/40 hover:bg-primary/5"
            >
              <p className="text-xs font-bold text-foreground">{demo.role}</p>
              <p className="truncate text-[11px] text-muted-foreground">
                {demo.email} / {demo.password}
              </p>
            </button>
          ))}
        </div>
      </div>
    </AuthShell>
  );
}
