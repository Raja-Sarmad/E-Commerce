"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiCreditCard,
  FiLock,
  FiMapPin,
  FiSmartphone,
  FiTruck,
  FiPackage,
  FiZap,
} from "react-icons/fi";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ProductImage } from "@/components/ui/ProductImage";
import { useSelector, useDispatch } from "react-redux";
import {
  selectCartItems,
  selectCartTotals,
  selectCartCoupon,
  clearCart,
} from "@/lib/rtk/cartSlice";
import { useGetMeQuery } from "@/lib/rtk/authApi";
import { toast } from "@/hooks/use-toast";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { useCreateOrderMutation } from "@/lib/rtk/authApi";
import { getErrorMessage } from "@/lib/rtk/baseApi";
import type { Address } from "@/lib/types";
import { siteConfig } from "@/lib/site";
import { formatPrice, cn } from "@/lib/utils";
import {
  useSyncCartStock,
  validateCartStockBeforeCheckout,
} from "@/hooks/use-sync-cart-stock";
import { syncCartStock } from "@/lib/rtk/cartSlice";

type DeliveryOption = {
  id: string;
  name: string;
  eta: string;
  price: number;
  icon: typeof FiTruck;
};

const deliveryOptions: DeliveryOption[] = [
  { id: "standard", name: "Standard", eta: "5–7 business days", price: 0, icon: FiPackage },
  { id: "express", name: "Express", eta: "2–3 business days", price: 12, icon: FiTruck },
  { id: "nextday", name: "Next Day", eta: "Delivered tomorrow", price: 25, icon: FiZap },
];

const paymentMethods = [
  { id: "card", name: "Credit / Debit Card", icon: FiCreditCard },
  { id: "paypal", name: "PayPal", icon: FiSmartphone },
  { id: "applepay", name: "Apple Pay", icon: FiSmartphone },
];

const emptyAddress: Address = {
  firstName: "",
  lastName: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  country: "United States",
  phone: "",
};

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const { subtotal, discount, shipping: cartShipping, tax, total } = useSelector(selectCartTotals);
  const coupon = useSelector(selectCartCoupon);
  const { data: user } = useGetMeQuery();
  const isAuthenticated = Boolean(user);
  const { isAdmin } = useIsAdmin();
  const [createOrder, { isLoading: creatingOrder }] = useCreateOrderMutation();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [shippingAddress, setShippingAddress] = useState<Address>(() =>
    user?.address ? { ...user.address } : { ...emptyAddress }
  );
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [billingAddress, setBillingAddress] = useState<Address>({ ...emptyAddress });
  const [deliveryId, setDeliveryId] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardDetails, setCardDetails] = useState({ number: "", name: "", expiry: "", cvc: "" });
  const [processing, setProcessing] = useState(false);
  const { refetch: refetchStock } = useSyncCartStock();

  const delivery = deliveryOptions.find((d) => d.id === deliveryId) ?? deliveryOptions[0];
  const totalWithDelivery = total + delivery.price;

  useEffect(() => {
    if (isAdmin) router.replace("/admin");
  }, [isAdmin, router]);

  useEffect(() => {
    if (items.length === 0 && step > 1) {
      router.replace("/cart");
    }
  }, [items.length, step, router]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const shippingValid = useMemo(
    () =>
      shippingAddress.firstName.trim() &&
      shippingAddress.lastName.trim() &&
      shippingAddress.address.trim() &&
      shippingAddress.city.trim() &&
      shippingAddress.state.trim() &&
      shippingAddress.zip.trim() &&
      shippingAddress.phone.trim(),
    [shippingAddress]
  );

  const billingValid = useMemo(() => {
    if (sameAsBilling) return true;
    return Boolean(
      billingAddress.firstName.trim() &&
        billingAddress.lastName.trim() &&
        billingAddress.address.trim() &&
        billingAddress.city.trim() &&
        billingAddress.zip.trim()
    );
  }, [sameAsBilling, billingAddress]);

  const cardValid = useMemo(() => {
    if (paymentMethod !== "card") return true;
    return cardDetails.number.replace(/\s/g, "").length >= 12 && cardDetails.name.trim() && cardDetails.expiry.trim() && cardDetails.cvc.trim();
  }, [paymentMethod, cardDetails]);

  const handleNext = () => {
    if (step === 1 && shippingValid && billingValid) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => (s - 1) as 1 | 2 | 3);
  };

  const handlePlaceOrder = async () => {
    if (!cardValid) return;
    setProcessing(true);

    const fresh = await refetchStock();
    const stockMap = fresh.data;
    if (stockMap) {
      dispatch(syncCartStock(stockMap));
    }

    const stockCheck = validateCartStockBeforeCheckout(items, stockMap);
    if (!stockCheck.ok) {
      toast.error("Stock unavailable", stockCheck.message);
      setProcessing(false);
      router.push("/cart");
      return;
    }

    const payload = {
      items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
      couponCode: coupon?.code ?? undefined,
      shippingAddress: sameAsBilling ? shippingAddress : { ...shippingAddress },
      billingAddress: sameAsBilling ? shippingAddress : billingAddress,
      paymentMethod: paymentMethod === "card" ? "card" : paymentMethod,
    };

    if (isAuthenticated) {
      try {
        const created = await createOrder(payload).unwrap();
        dispatch(clearCart());
        toast.success("Order placed!", `Order ${created.number} confirmed.`);
        router.push(`/order-success?number=${created.number}`);
      } catch (err) {
        toast.error("Order failed", getErrorMessage(err));
        setProcessing(false);
      }
      return;
    }

    toast.error("Login required", "Please log in to complete your purchase.");
    setProcessing(false);
    router.push("/login?redirect=/checkout");
  };

  const updateAddress = (
    setter: React.Dispatch<React.SetStateAction<Address>>,
    key: keyof Address,
    value: string
  ) => setter((prev) => ({ ...prev, [key]: value }));

  return (
    <Container className="py-6">
      <Breadcrumb items={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]} />
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
        Checkout
      </h1>

      <StepIndicator step={step} />

      {items.length === 0 && step === 1 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <p className="text-lg font-bold text-foreground">Your cart is empty</p>
          <Button href="/shop" className="mt-4">
            Start shopping
          </Button>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div>
            {step === 1 && (
              <div className="animate-fade-in-up space-y-6">
                <section className="rounded-2xl border border-border bg-card p-6">
                  <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">1</span>
                    Shipping address
                  </h2>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <Input label="First name" value={shippingAddress.firstName} onChange={(e) => updateAddress(setShippingAddress, "firstName", e.target.value)} placeholder="Jane" />
                    <Input label="Last name" value={shippingAddress.lastName} onChange={(e) => updateAddress(setShippingAddress, "lastName", e.target.value)} placeholder="Doe" />
                    <Input label="Street address" containerClassName="sm:col-span-2" value={shippingAddress.address} onChange={(e) => updateAddress(setShippingAddress, "address", e.target.value)} placeholder="123 Main Street, Apt 4B" />
                    <Input label="City" value={shippingAddress.city} onChange={(e) => updateAddress(setShippingAddress, "city", e.target.value)} placeholder="Austin" />
                    <Input label="State / Province" value={shippingAddress.state} onChange={(e) => updateAddress(setShippingAddress, "state", e.target.value)} placeholder="TX" />
                    <Input label="ZIP / Postal code" value={shippingAddress.zip} onChange={(e) => updateAddress(setShippingAddress, "zip", e.target.value)} placeholder="73301" />
                    <Select label="Country" value={shippingAddress.country} onChange={(e) => updateAddress(setShippingAddress, "country", e.target.value)}>
                      {["United States", "Canada", "United Kingdom", "Australia", "Germany", "France"].map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </Select>
                    <Input label="Phone" value={shippingAddress.phone} onChange={(e) => updateAddress(setShippingAddress, "phone", e.target.value)} placeholder="+1 555 010 2233" />
                  </div>
                </section>

                <section className="rounded-2xl border border-border bg-card p-6">
                  <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">2</span>
                    Billing address
                  </h2>
                  <label className="mt-4 flex w-fit cursor-pointer items-center gap-2.5 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={sameAsBilling}
                      onChange={(e) => setSameAsBilling(e.target.checked)}
                      className="h-4 w-4 rounded border-border accent-primary"
                    />
                    Same as shipping address
                  </label>
                  {!sameAsBilling && (
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <Input label="First name" value={billingAddress.firstName} onChange={(e) => updateAddress(setBillingAddress, "firstName", e.target.value)} />
                      <Input label="Last name" value={billingAddress.lastName} onChange={(e) => updateAddress(setBillingAddress, "lastName", e.target.value)} />
                      <Input label="Street address" containerClassName="sm:col-span-2" value={billingAddress.address} onChange={(e) => updateAddress(setBillingAddress, "address", e.target.value)} />
                      <Input label="City" value={billingAddress.city} onChange={(e) => updateAddress(setBillingAddress, "city", e.target.value)} />
                      <Input label="State" value={billingAddress.state} onChange={(e) => updateAddress(setBillingAddress, "state", e.target.value)} />
                      <Input label="ZIP" value={billingAddress.zip} onChange={(e) => updateAddress(setBillingAddress, "zip", e.target.value)} />
                      <Input label="Country" value={billingAddress.country} onChange={(e) => updateAddress(setBillingAddress, "country", e.target.value)} />
                    </div>
                  )}
                </section>
              </div>
            )}

            {step === 2 && (
              <div className="animate-fade-in-up space-y-6">
                <section className="rounded-2xl border border-border bg-card p-6">
                  <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">3</span>
                    Delivery options
                  </h2>
                  <div className="mt-5 space-y-3">
                    {deliveryOptions.map((option) => (
                      <label
                        key={option.id}
                        className={cn(
                          "flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all",
                          deliveryId === option.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-muted-foreground/40"
                        )}
                      >
                        <input
                          type="radio"
                          name="delivery"
                          checked={deliveryId === option.id}
                          onChange={() => setDeliveryId(option.id)}
                          className="sr-only"
                        />
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <option.icon className="h-5 w-5" aria-hidden />
                        </span>
                        <span className="flex-1">
                          <span className="block text-sm font-bold text-foreground">{option.name}</span>
                          <span className="block text-xs text-muted-foreground">{option.eta}</span>
                        </span>
                        <span className="text-sm font-bold text-foreground">
                          {option.price === 0 ? "Free" : formatPrice(option.price)}
                        </span>
                      </label>
                    ))}
                  </div>
                </section>

                <section className="rounded-2xl border border-border bg-card p-6">
                  <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">4</span>
                    Payment method
                  </h2>
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {paymentMethods.map((method) => (
                      <label
                        key={method.id}
                        className={cn(
                          "flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all",
                          paymentMethod === method.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-muted-foreground/40"
                        )}
                      >
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === method.id}
                          onChange={() => setPaymentMethod(method.id)}
                          className="sr-only"
                        />
                        <method.icon className="h-6 w-6 text-primary" aria-hidden />
                        <span className="text-sm font-semibold text-foreground">{method.name}</span>
                      </label>
                    ))}
                  </div>

                  {paymentMethod === "card" && (
                    <div className="animate-fade-in mt-5 grid gap-4 rounded-xl bg-muted/50 p-5 sm:grid-cols-2">
                      <Input label="Card number" placeholder="4242 4242 4242 4242" value={cardDetails.number} onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })} containerClassName="sm:col-span-2" inputMode="numeric" />
                      <Input label="Name on card" placeholder="Jane Doe" value={cardDetails.name} onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })} containerClassName="sm:col-span-2" />
                      <Input label="Expiry (MM/YY)" placeholder="08/28" value={cardDetails.expiry} onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })} />
                      <Input label="CVC" placeholder="123" type="password" value={cardDetails.cvc} onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })} />
                    </div>
                  )}
                </section>
              </div>
            )}

            {step === 3 && (
              <div className="animate-fade-in-up space-y-6">
                <ReviewBlock
                  title="Shipping address"
                  icon={<FiMapPin className="h-4 w-4" aria-hidden />}
                  onEdit={() => setStep(1)}
                >
                  {shippingAddress.firstName} {shippingAddress.lastName}, {shippingAddress.address}, {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip}, {shippingAddress.country}
                </ReviewBlock>
                <ReviewBlock
                  title="Delivery"
                  icon={<FiTruck className="h-4 w-4" aria-hidden />}
                  onEdit={() => setStep(2)}
                >
                  {delivery.name} — {delivery.eta} ({delivery.price === 0 ? "Free" : formatPrice(delivery.price)})
                </ReviewBlock>
                <ReviewBlock
                  title="Payment"
                  icon={<FiCreditCard className="h-4 w-4" aria-hidden />}
                  onEdit={() => setStep(2)}
                >
                  {paymentMethod === "card"
                    ? `Card ending ${cardDetails.number.replace(/\s/g, "").slice(-4) || "••••"}`
                    : paymentMethod === "paypal"
                      ? "PayPal"
                      : "Apple Pay"}
                </ReviewBlock>
                <div className="rounded-2xl border border-border bg-card p-6">
                  <h3 className="text-lg font-bold text-foreground">Items</h3>
                  <ul className="mt-4 space-y-3">
                    {items.map((item) => (
                      <li key={item.product.id} className="flex items-center gap-3">
                         <ProductImage src={item.product.images?.[0] ?? ""} alt={item.product.name} className="h-12 w-12 rounded-lg" imgClassName="rounded-lg" />
                        <div className="min-w-0 flex-1">
                          <p className="clamp-1 text-sm font-medium text-foreground">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <span className="text-sm font-bold text-foreground">{formatPrice(item.product.price * item.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between gap-4">
              {step > 1 ? (
                <Button variant="outline" onClick={handleBack} leftIcon={<FiArrowLeft className="h-4 w-4" aria-hidden />}>
                  Back
                </Button>
              ) : (
                <Button variant="outline" href="/cart" leftIcon={<FiArrowLeft className="h-4 w-4" aria-hidden />}>
                  Back to cart
                </Button>
              )}
              {step < 3 ? (
                <Button onClick={handleNext} rightIcon={<FiArrowRight className="h-4 w-4" aria-hidden />}>
                  Continue
                </Button>
              ) : (
                <Button onClick={handlePlaceOrder} loading={processing} leftIcon={!processing ? <FiLock className="h-4 w-4" aria-hidden /> : undefined}>
                  {processing ? "Placing order..." : `Place order · ${formatPrice(totalWithDelivery)}`}
                </Button>
              )}
            </div>
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-lg font-bold text-foreground">Order summary</h2>
              <ul className="mt-4 space-y-3 border-b border-border pb-4">
                {items.slice(0, 4).map((item) => (
                  <li key={item.product.id} className="flex items-center gap-3">
                    <div className="relative shrink-0">
                       <ProductImage src={item.product.images?.[0] ?? ""} alt={item.product.name} className="h-14 w-14 rounded-lg" imgClassName="rounded-lg" />
                      <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-bold text-background">
                        {item.quantity}
                      </span>
                    </div>
                    <span className="clamp-1 flex-1 text-sm text-foreground">{item.product.name}</span>
                    <span className="text-sm font-semibold text-foreground">{formatPrice(item.product.price * item.quantity)}</span>
                  </li>
                ))}
                {items.length > 4 && (
                  <li className="text-xs text-muted-foreground">+{items.length - 4} more item(s)</li>
                )}
              </ul>
              <div className="mt-4 space-y-2.5 text-sm">
                <Row label="Subtotal" value={formatPrice(subtotal)} />
                {discount > 0 && <Row label="Discount" value={`-${formatPrice(discount)}`} accent />}
                <Row label="Shipping" value={delivery.price === 0 ? "Free" : formatPrice(delivery.price)} />
                <Row label="Estimated tax" value={formatPrice(tax + delivery.price * siteConfig.taxRate)} />
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <span className="text-base font-bold text-foreground">Total</span>
                <span className="text-2xl font-extrabold text-foreground">{formatPrice(totalWithDelivery)}</span>
              </div>
              <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <FiLock className="h-3.5 w-3.5" aria-hidden />
                Payments are encrypted and secure
              </p>
            </div>
          </aside>
        </div>
      )}
    </Container>
  );
}

function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  const steps = ["Address", "Delivery & Payment", "Review"];
  return (
    <div className="mb-8 flex items-center gap-2 sm:gap-4">
      {steps.map((label, index) => {
        const num = (index + 1) as 1 | 2 | 3;
        const active = step >= num;
        const current = step === num;
        return (
          <div key={label} className="flex flex-1 items-center gap-2 sm:gap-4">
            <div className="flex flex-col items-center gap-1.5 sm:flex-row sm:gap-3">
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {active && !current ? <FiCheck className="h-4 w-4" aria-hidden /> : num}
              </span>
              <span
                className={cn(
                  "text-xs font-semibold sm:text-sm",
                  active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="h-0.5 flex-1 rounded-full bg-muted">
                <div className={cn("h-full rounded-full bg-primary transition-all duration-500", step > num ? "w-full" : "w-0")} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Row({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-semibold text-foreground", accent && "text-success")}>{value}</span>
    </div>
  );
}

function ReviewBlock({
  title,
  icon,
  onEdit,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
          {icon}
          {title}
        </h3>
        <button
          type="button"
          onClick={onEdit}
          className="text-sm font-semibold text-primary transition-colors hover:text-primary-strong"
        >
          Edit
        </button>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{children}</p>
    </div>
  );
}
