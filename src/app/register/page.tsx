"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FiEye, FiEyeOff, FiLock, FiMail, FiUser } from "react-icons/fi";
import { AuthShell, AuthFooter } from "@/components/auth/AuthShell";
import { PasswordRequirements } from "@/components/auth/PasswordRequirements";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useRegisterMutation } from "@/lib/rtk/authApi";
import { getErrorMessage } from "@/lib/rtk/baseApi";
import { isPasswordValid, isValidEmail, passwordValidationMessage } from "@/lib/password-validation";
import { toast } from "@/hooks/use-toast";

function PasswordToggle({
  visible,
  onToggle,
  label,
}: {
  visible: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      className="text-muted-foreground hover:text-foreground"
    >
      {visible ? <FiEyeOff className="h-4 w-4" aria-hidden /> : <FiEye className="h-4 w-4" aria-hidden />}
    </button>
  );
}

export default function RegisterPage() {
  const [registerMutation] = useRegisterMutation();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    confirm: false,
  });

  const emailError = useMemo(() => {
    if (!form.email.trim()) return "";
    if (!isValidEmail(form.email)) return "Please enter a valid email address.";
    return "";
  }, [form.email]);

  const passwordError = useMemo(() => {
    if (!form.password) return "";
    return passwordValidationMessage(form.password) ?? "";
  }, [form.password]);

  const confirmError = useMemo(() => {
    if (!form.confirm) return "";
    if (form.password !== form.confirm) return "Passwords do not match.";
    return "";
  }, [form.confirm, form.password]);

  const validateForm = () => {
    const next = { name: "", email: "", password: "", confirm: "" };

    if (!form.name.trim()) {
      next.name = "Full name is required.";
    } else if (form.name.trim().length < 2) {
      next.name = "Name must be at least 2 characters.";
    }

    if (!form.email.trim()) {
      next.email = "Email is required.";
    } else if (!isValidEmail(form.email)) {
      next.email = "Please enter a valid email address.";
    }

    if (!form.password) {
      next.password = "Password is required.";
    } else if (!isPasswordValid(form.password)) {
      next.password = passwordValidationMessage(form.password) ?? "Password does not meet requirements.";
    }

    if (!form.confirm) {
      next.confirm = "Please confirm your password.";
    } else if (form.password !== form.confirm) {
      next.confirm = "Passwords do not match.";
    }

    setFieldErrors(next);
    setTouched({ email: true, password: true, confirm: true });
    return !next.name && !next.email && !next.password && !next.confirm;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!validateForm()) return;

    setLoading(true);
    try {
      await registerMutation({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      }).unwrap();
      toast.success("Account created!", "Welcome to NovaMart.");
      router.push("/account/profile");
    } catch (err) {
      const message = getErrorMessage(err);
      setFormError(message);
      toast.error("Registration failed", message);
    } finally {
      setLoading(false);
    }
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
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Full name"
          name="name"
          autoComplete="name"
          value={form.name}
          onChange={(e) => {
            setForm({ ...form, name: e.target.value });
            if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: "" }));
          }}
          placeholder="Jane Doe"
          leftIcon={<FiUser className="h-4 w-4" aria-hidden />}
          error={fieldErrors.name}
          required
        />
        <Input
          label="Email address"
          type="email"
          name="email"
          autoComplete="email"
          value={form.email}
          onChange={(e) => {
            setForm({ ...form, email: e.target.value });
            if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: "" }));
          }}
          onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
          placeholder="you@example.com"
          leftIcon={<FiMail className="h-4 w-4" aria-hidden />}
          error={fieldErrors.email || (touched.email ? emailError : "")}
          required
        />
        <div className="space-y-2">
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => {
              setForm({ ...form, password: e.target.value });
              if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: "" }));
            }}
            onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
            placeholder="Create a strong password"
            leftIcon={<FiLock className="h-4 w-4" aria-hidden />}
            rightIcon={
              <PasswordToggle
                visible={showPassword}
                onToggle={() => setShowPassword((prev) => !prev)}
                label={showPassword ? "Hide password" : "Show password"}
              />
            }
            error={fieldErrors.password || (touched.password ? passwordError : "")}
            required
          />
          <PasswordRequirements password={form.password} />
        </div>
        <Input
          label="Confirm password"
          type={showConfirmPassword ? "text" : "password"}
          name="confirm"
          autoComplete="new-password"
          value={form.confirm}
          onChange={(e) => {
            setForm({ ...form, confirm: e.target.value });
            if (fieldErrors.confirm) setFieldErrors((prev) => ({ ...prev, confirm: "" }));
          }}
          onBlur={() => setTouched((prev) => ({ ...prev, confirm: true }))}
          placeholder="Re-enter your password"
          leftIcon={<FiLock className="h-4 w-4" aria-hidden />}
          rightIcon={
            <PasswordToggle
              visible={showConfirmPassword}
              onToggle={() => setShowConfirmPassword((prev) => !prev)}
              label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            />
          }
          error={fieldErrors.confirm || (touched.confirm ? confirmError : "")}
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
