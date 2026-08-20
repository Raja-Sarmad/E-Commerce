"use client";

import { useState, useEffect } from "react";
import {
  FiCreditCard,
  FiGlobe,
  FiMail,
  FiSave,
  FiShield,
  FiShoppingBag,
} from "react-icons/fi";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from "@/lib/rtk/adminApi";

const tabs = [
  { key: "general", label: "General", icon: FiGlobe },
  { key: "store", label: "Store", icon: FiShoppingBag },
  { key: "payment", label: "Payment", icon: FiCreditCard },
  { key: "email", label: "Email", icon: FiMail },
  { key: "security", label: "Security", icon: FiShield },
] as const;

type TabKey = (typeof tabs)[number]["key"];

type SettingsForm = {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  supportEmail: string;
  currency: string;
  taxRate: string;
  freeShippingThreshold: string;
  shippingRate: string;
  orderPrefix: string;
  defaultOrderStatus: string;
  paymentGateway: string;
  testMode: boolean;
  emailFromName: string;
  emailFromAddress: string;
  dailySummary: boolean;
  twoFactor: boolean;
  passwordMinLength: string;
  sessionTimeout: string;
};

const defaults: SettingsForm = {
  storeName: "",
  storeEmail: "",
  storePhone: "",
  supportEmail: "",
  currency: "USD",
  taxRate: "0",
  freeShippingThreshold: "0",
  shippingRate: "0",
  orderPrefix: "",
  defaultOrderStatus: "pending",
  paymentGateway: "stripe",
  testMode: false,
  emailFromName: "",
  emailFromAddress: "",
  dailySummary: false,
  twoFactor: false,
  passwordMinLength: "8",
  sessionTimeout: "30",
};

export default function AdminSettingsPage() {
  const [active, setActive] = useState<TabKey>("general");
  const { data: apiSettings, isLoading } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isSaving }] = useUpdateSettingsMutation();
  const [form, setForm] = useState<SettingsForm>(defaults);
  const [toggles, setToggles] = useState({
    maintenanceMode: false,
    newCustomerDiscount: true,
    autoApplyCoupons: true,
    lowStockAlerts: true,
    emailNotifications: true,
    testMode: true,
    dailySummary: true,
    twoFactor: false,
  });

  useEffect(() => {
    if (!apiSettings) return;
    const s = apiSettings as Record<string, unknown>;
    setForm({
      storeName: String(s.storeName ?? defaults.storeName),
      storeEmail: String(s.storeEmail ?? defaults.storeEmail),
      storePhone: String(s.storePhone ?? defaults.storePhone),
      supportEmail: String(s.supportEmail ?? defaults.supportEmail),
      currency: String(s.currency ?? defaults.currency),
      taxRate: String(s.taxRate ?? defaults.taxRate),
      freeShippingThreshold: String(s.freeShippingThreshold ?? defaults.freeShippingThreshold),
      shippingRate: String(s.shippingRate ?? defaults.shippingRate),
      orderPrefix: String(s.orderPrefix ?? defaults.orderPrefix),
      defaultOrderStatus: String(s.defaultOrderStatus ?? defaults.defaultOrderStatus),
      paymentGateway: String(s.paymentGateway ?? defaults.paymentGateway),
      testMode: Boolean(s.testMode ?? defaults.testMode),
      emailFromName: String(s.emailFromName ?? defaults.emailFromName),
      emailFromAddress: String(s.emailFromAddress ?? defaults.emailFromAddress),
      dailySummary: Boolean(s.dailySummary ?? defaults.dailySummary),
      twoFactor: Boolean(s.twoFactor ?? defaults.twoFactor),
      passwordMinLength: String(s.passwordMinLength ?? defaults.passwordMinLength),
      sessionTimeout: String(s.sessionTimeout ?? defaults.sessionTimeout),
    });
    setToggles({
      maintenanceMode: Boolean(s.maintenanceMode ?? false),
      newCustomerDiscount: Boolean(s.newCustomerDiscount ?? true),
      autoApplyCoupons: Boolean(s.autoApplyCoupons ?? true),
      lowStockAlerts: Boolean(s.lowStockAlerts ?? true),
      emailNotifications: Boolean(s.emailNotifications ?? true),
      testMode: Boolean(s.testMode ?? true),
      dailySummary: Boolean(s.dailySummary ?? true),
      twoFactor: Boolean(s.twoFactor ?? false),
    });
  }, [apiSettings]);

  const set = <K extends keyof SettingsForm>(key: K, value: SettingsForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    const payload = { ...form, ...toggles };
    try {
      await updateSettings(payload).unwrap();
      toast.success("Settings saved", "Your changes have been applied.");
    } catch {
      toast.error("Save failed", "Something went wrong. Please try again.");
    }
  };

  const toggle = (key: keyof typeof toggles) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleRow = (key: keyof typeof toggles, title: string, description: string) => (
    <div className="flex items-center justify-between gap-4 py-4">
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={toggles[key]}
        onClick={() => toggle(key)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          toggles[key] ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            toggles[key] ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading settings…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Settings"
        subtitle="Configure your store, payments, email and security."
        breadcrumb={[{ label: "Settings" }]}
        actions={
          <Button onClick={handleSave} leftIcon={<FiSave className="h-4 w-4" aria-hidden />} disabled={isSaving}>
            {isSaving ? "Saving…" : "Save changes"}
          </Button>
        }
      />

      <div className="flex flex-wrap gap-1 rounded-2xl border border-border bg-card p-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors sm:flex-none",
              active === tab.key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <tab.icon className="h-4 w-4" aria-hidden />
            <span className="sm:hidden">{tab.label}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {active === "general" && (
        <>
          <Card className="p-6">
            <h2 className="flex items-center gap-2 font-bold text-foreground">
              <FiGlobe className="h-4 w-4 text-primary" aria-hidden />
              Store details
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Input label="Store name" value={form.storeName} onChange={(e) => set("storeName", e.target.value)} />
              <Input label="Store email" type="email" value={form.storeEmail} onChange={(e) => set("storeEmail", e.target.value)} />
              <Input label="Store phone" value={form.storePhone} onChange={(e) => set("storePhone", e.target.value)} />
              <Input label="Support email" type="email" value={form.supportEmail} onChange={(e) => set("supportEmail", e.target.value)} />
            </div>
          </Card>
          <Card className="p-6">
            <h2 className="font-bold text-foreground">Maintenance</h2>
            <div className="mt-2 divide-y divide-border">
              {toggleRow("maintenanceMode", "Maintenance mode", "Temporarily take the store offline for visitors.")}
            </div>
          </Card>
        </>
      )}

      {active === "store" && (
        <>
          <Card className="p-6">
            <h2 className="flex items-center gap-2 font-bold text-foreground">
              <FiShoppingBag className="h-4 w-4 text-primary" aria-hidden />
              Commerce settings
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Select label="Currency" value={form.currency} onChange={(e) => set("currency", e.target.value)}>
                {[
                  ["USD", "US Dollar (USD)"],
                  ["EUR", "Euro (EUR)"],
                  ["GBP", "British Pound (GBP)"],
                ].map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
              <Input label="Tax rate (%)" type="number" value={form.taxRate} onChange={(e) => set("taxRate", e.target.value)} />
              <Input label="Free shipping threshold ($)" type="number" value={form.freeShippingThreshold} onChange={(e) => set("freeShippingThreshold", e.target.value)} />
              <Input label="Standard shipping rate ($)" type="number" value={form.shippingRate} onChange={(e) => set("shippingRate", e.target.value)} />
              <Input label="Order number prefix" value={form.orderPrefix} onChange={(e) => set("orderPrefix", e.target.value)} />
              <Select label="Default order status" value={form.defaultOrderStatus} onChange={(e) => set("defaultOrderStatus", e.target.value)}>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
              </Select>
            </div>
          </Card>
          <Card className="p-6">
            <h2 className="font-bold text-foreground">Automation</h2>
            <div className="mt-2 divide-y divide-border">
              {toggleRow("newCustomerDiscount", "New customer discount", "Apply 10% off for first-time customers automatically.")}
              {toggleRow("autoApplyCoupons", "Auto-apply coupons", "Automatically apply the best available coupon at checkout.")}
              {toggleRow("lowStockAlerts", "Low stock alerts", "Notify admins when a product drops below 10 units.")}
            </div>
          </Card>
        </>
      )}

      {active === "payment" && (
        <>
          <Card className="p-6">
            <h2 className="flex items-center gap-2 font-bold text-foreground">
              <FiCreditCard className="h-4 w-4 text-primary" aria-hidden />
              Payment gateway
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Select label="Primary gateway" value={form.paymentGateway} onChange={(e) => set("paymentGateway", e.target.value)}>
                <option value="stripe">Stripe</option>
                <option value="paypal">PayPal</option>
                <option value="cod">Cash on delivery</option>
              </Select>
              <Input label="Test mode" value={form.testMode ? "Enabled" : "Disabled"} readOnly />
            </div>
            <div className="mt-2 divide-y divide-border">
              {toggleRow("testMode", "Test mode", "Process payments in sandbox mode without real charges.")}
            </div>
          </Card>
        </>
      )}

      {active === "email" && (
        <>
          <Card className="p-6">
            <h2 className="flex items-center gap-2 font-bold text-foreground">
              <FiMail className="h-4 w-4 text-primary" aria-hidden />
              Email sender
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Input label="From name" value={form.emailFromName} onChange={(e) => set("emailFromName", e.target.value)} />
              <Input label="From address" type="email" value={form.emailFromAddress} onChange={(e) => set("emailFromAddress", e.target.value)} />
            </div>
          </Card>
          <Card className="p-6">
            <h2 className="font-bold text-foreground">Notifications</h2>
            <div className="mt-2 divide-y divide-border">
              {toggleRow("emailNotifications", "Order email notifications", "Send customers an email for every order status change.")}
              {toggleRow("dailySummary", "Daily summary report", "Email admins a daily sales and activity summary.")}
            </div>
          </Card>
        </>
      )}

      {active === "security" && (
        <>
          <Card className="p-6">
            <h2 className="flex items-center gap-2 font-bold text-foreground">
              <FiShield className="h-4 w-4 text-primary" aria-hidden />
              Authentication
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Input label="Min password length" type="number" value={form.passwordMinLength} onChange={(e) => set("passwordMinLength", e.target.value)} />
              <Input label="Session timeout (minutes)" type="number" value={form.sessionTimeout} onChange={(e) => set("sessionTimeout", e.target.value)} />
            </div>
            <div className="mt-2 divide-y divide-border">
              {toggleRow("twoFactor", "Two-factor authentication", "Require a one-time code for admin sign-in.")}
            </div>
          </Card>
        </>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} leftIcon={<FiSave className="h-4 w-4" aria-hidden />} disabled={isSaving}>
          {isSaving ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </div>
  );
}
