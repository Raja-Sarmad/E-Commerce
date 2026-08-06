"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FiSave, FiUser } from "react-icons/fi";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthProvider";
import { useToast } from "@/context/ToastProvider";

export default function EditProfilePage() {
  const { user, updateProfile } = useAuth();
  const { success } = useToast();
  const router = useRouter();

  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    firstName: user?.address?.firstName ?? "",
    lastName: user?.address?.lastName ?? "",
    address: user?.address?.address ?? "",
    city: user?.address?.city ?? "",
    state: user?.address?.state ?? "",
    zip: user?.address?.zip ?? "",
    country: user?.address?.country ?? "",
  });
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    updateProfile({
      name: form.name,
      email: form.email,
      phone: form.phone,
      address: {
        firstName: form.firstName,
        lastName: form.lastName,
        address: form.address,
        city: form.city,
        state: form.state,
        zip: form.zip,
        country: form.country,
        phone: form.phone,
      },
    });
    setTimeout(() => {
      setSaving(false);
      success("Profile updated", "Your changes have been saved.");
      router.push("/account/profile");
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          Edit profile
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your personal and shipping information.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <h2 className="flex items-center gap-2 font-bold text-foreground">
            <FiUser className="h-4 w-4 text-primary" aria-hidden />
            Personal information
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Input
              label="Full name"
              name="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <Input
              label="Email address"
              type="email"
              name="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <Input
              label="Phone"
              type="tel"
              name="phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+1 555 000 0000"
              containerClassName="sm:col-span-2"
            />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-bold text-foreground">Default shipping address</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Input
              label="First name"
              name="firstName"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
            <Input
              label="Last name"
              name="lastName"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
            <Textarea
              label="Street address"
              name="address"
              rows={2}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              containerClassName="sm:col-span-2"
            />
            <Input
              label="City"
              name="city"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="State"
                name="state"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
              <Input
                label="ZIP / Postal code"
                name="zip"
                value={form.zip}
                onChange={(e) => setForm({ ...form, zip: e.target.value })}
              />
            </div>
            <Select
              label="Country"
              name="country"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              containerClassName="sm:col-span-2"
            >
              {[
                "United States",
                "Canada",
                "United Kingdom",
                "Germany",
                "Australia",
              ].map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </Select>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" loading={saving} leftIcon={<FiSave className="h-4 w-4" aria-hidden />}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
