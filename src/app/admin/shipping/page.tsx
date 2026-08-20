"use client";

import { useMemo, useState } from "react";
import { FiEdit2, FiGlobe, FiPlus, FiTrash2, FiTruck } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Tabs } from "@/components/ui/Tabs";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ExportButton } from "@/components/admin/ExportButton";
import { toast } from "@/hooks/use-toast";
import {
  useGetAdminShippingZonesQuery,
  useCreateShippingZoneMutation,
  useUpdateShippingZoneMutation,
  useDeleteShippingZoneMutation,
  useGetAdminShippingMethodsQuery,
  useCreateShippingMethodMutation,
  useUpdateShippingMethodMutation,
  useDeleteShippingMethodMutation,
  type AdminShippingZone,
  type AdminShippingMethod,
} from "@/lib/rtk/adminApi";
import { formatPrice } from "@/lib/utils";

const PER_PAGE = 8;

type ZoneForm = {
  name: string;
  regions: string;
  baseRate: string;
  freeAbove: string;
  methods: string;
};

type MethodForm = {
  name: string;
  zone: string;
  price: string;
  eta: string;
};

const emptyZoneForm: ZoneForm = {
  name: "",
  regions: "",
  baseRate: "",
  freeAbove: "",
  methods: "",
};

const emptyMethodForm: MethodForm = {
  name: "",
  zone: "",
  price: "",
  eta: "",
};

function Toggle({
  active,
  onToggle,
  label,
}: {
  active: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={label}
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        active ? "bg-primary" : "bg-muted"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          active ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default function AdminShippingPage() {
  const { data: zonesData } = useGetAdminShippingZonesQuery({});
  const { data: methodsData } = useGetAdminShippingMethodsQuery({});
  const [createShippingZone] = useCreateShippingZoneMutation();
  const [updateShippingZone] = useUpdateShippingZoneMutation();
  const [deleteShippingZone] = useDeleteShippingZoneMutation();
  const [createShippingMethod] = useCreateShippingMethodMutation();
  const [updateShippingMethod] = useUpdateShippingMethodMutation();
  const [deleteShippingMethod] = useDeleteShippingMethodMutation();

  const zones = zonesData?.items ?? [];
  const methods = methodsData?.items ?? [];

  const [zoneQuery, setZoneQuery] = useState("");
  const [zonePage, setZonePage] = useState(1);
  const [zonePageSize, setZonePageSize] = useState(PER_PAGE);
  const [zoneFormOpen, setZoneFormOpen] = useState(false);
  const [zoneEditing, setZoneEditing] = useState<AdminShippingZone | null>(null);
  const [zoneForm, setZoneForm] = useState<ZoneForm>(emptyZoneForm);
  const [zoneFormError, setZoneFormError] = useState("");
  const [deleteZone, setDeleteZone] = useState<AdminShippingZone | null>(null);

  const [methodQuery, setMethodQuery] = useState("");
  const [methodPage, setMethodPage] = useState(1);
  const [methodPageSize, setMethodPageSize] = useState(PER_PAGE);
  const [methodFormOpen, setMethodFormOpen] = useState(false);
  const [methodEditing, setMethodEditing] = useState<AdminShippingMethod | null>(null);
  const [methodForm, setMethodForm] = useState<MethodForm>(emptyMethodForm);
  const [methodFormError, setMethodFormError] = useState("");
  const [deleteMethod, setDeleteMethod] = useState<AdminShippingMethod | null>(null);

  const filteredZones = useMemo(() => {
    const q = zoneQuery.trim().toLowerCase();
    return zones.filter(
      (z) => !q || z.name.toLowerCase().includes(q) || z.regions.toLowerCase().includes(q)
    );
  }, [zones, zoneQuery]);

  const filteredMethods = useMemo(() => {
    const q = methodQuery.trim().toLowerCase();
    return methods.filter(
      (m) => !q || m.name.toLowerCase().includes(q) || m.zone.toLowerCase().includes(q)
    );
  }, [methods, methodQuery]);

  const zoneTotalPages = Math.max(1, Math.ceil(filteredZones.length / zonePageSize));
  const zonePageItems = filteredZones.slice(
    (zonePage - 1) * zonePageSize,
    zonePage * zonePageSize
  );
  const methodTotalPages = Math.max(1, Math.ceil(filteredMethods.length / methodPageSize));
  const methodPageItems = filteredMethods.slice(
    (methodPage - 1) * methodPageSize,
    methodPage * methodPageSize
  );

  const toggleZone = async (zone: AdminShippingZone) => {
    try {
      await updateShippingZone({ id: zone._id, body: { active: !zone.active } }).unwrap();
      toast.info("Zone updated", `"${zone.name}" is now ${zone.active ? "disabled" : "active"}.`);
    } catch {
      toast.error("Error", "Failed to update zone status.");
    }
  };

  const toggleMethod = async (method: AdminShippingMethod) => {
    try {
      await updateShippingMethod({ id: method._id, body: { active: !method.active } }).unwrap();
      toast.info("Method updated", `"${method.name}" is now ${method.active ? "disabled" : "active"}.`);
    } catch {
      toast.error("Error", "Failed to update method status.");
    }
  };

  const openZoneModal = (zone?: AdminShippingZone) => {
    setZoneEditing(zone ?? null);
    setZoneForm(
      zone
        ? {
            name: zone.name,
            regions: zone.regions,
            baseRate: String(zone.baseRate),
            freeAbove: String(zone.freeAbove),
            methods: zone.methods.join(", "),
          }
        : emptyZoneForm
    );
    setZoneFormError("");
    setZoneFormOpen(true);
  };

  const saveZone = async () => {
    if (!zoneForm.name.trim()) {
      setZoneFormError("Zone name is required.");
      return;
    }
    const baseRate = Number(zoneForm.baseRate);
    const freeAbove = Number(zoneForm.freeAbove);
    const methodsList = zoneForm.methods
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);
    if (!Number.isFinite(baseRate) || baseRate < 0) {
      setZoneFormError("Enter a valid base rate.");
      return;
    }
    const payload = {
      name: zoneForm.name.trim(),
      regions: zoneForm.regions.trim(),
      baseRate,
      freeAbove: Number.isFinite(freeAbove) ? freeAbove : 0,
      methods: methodsList,
    };
    try {
      if (zoneEditing) {
        await updateShippingZone({ id: zoneEditing._id, body: payload }).unwrap();
        toast.success("Zone updated", `"${payload.name}" was saved.`);
      } else {
        await createShippingZone({ ...payload, active: true }).unwrap();
        toast.success("Zone added", `"${payload.name}" was created.`);
      }
      setZoneFormOpen(false);
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "data" in err ? String((err as { data?: unknown }).data) : String(err);
      setZoneFormError(msg || "Something went wrong.");
    }
  };

  const openMethodModal = (method?: AdminShippingMethod) => {
    setMethodEditing(method ?? null);
    setMethodForm(
      method
        ? { name: method.name, zone: method.zone, price: String(method.price), eta: method.eta }
        : emptyMethodForm
    );
    setMethodFormError("");
    setMethodFormOpen(true);
  };

  const saveMethod = async () => {
    if (!methodForm.name.trim()) {
      setMethodFormError("Method name is required.");
      return;
    }
    const price = Number(methodForm.price);
    if (!Number.isFinite(price) || price < 0) {
      setMethodFormError("Enter a valid price.");
      return;
    }
    const payload = {
      name: methodForm.name.trim(),
      zone: methodForm.zone.trim(),
      price,
      eta: methodForm.eta.trim(),
    };
    try {
      if (methodEditing) {
        await updateShippingMethod({ id: methodEditing._id, body: payload }).unwrap();
        toast.success("Method updated", `"${payload.name}" was saved.`);
      } else {
        await createShippingMethod({ ...payload, active: true }).unwrap();
        toast.success("Method added", `"${payload.name}" was created.`);
      }
      setMethodFormOpen(false);
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "data" in err ? String((err as { data?: unknown }).data) : String(err);
      setMethodFormError(msg || "Something went wrong.");
    }
  };

  const removeZone = async () => {
    if (!deleteZone) return;
    try {
      await deleteShippingZone(deleteZone._id).unwrap();
      toast.success("Zone removed", `"${deleteZone.name}" was deleted.`);
      setDeleteZone(null);
    } catch {
      toast.error("Error", "Failed to delete zone.");
    }
  };

  const removeMethod = async () => {
    if (!deleteMethod) return;
    try {
      await deleteShippingMethod(deleteMethod._id).unwrap();
      toast.success("Method removed", `"${deleteMethod.name}" was deleted.`);
      setDeleteMethod(null);
    } catch {
      toast.error("Error", "Failed to delete method.");
    }
  };

  const zoneColumns: Column<AdminShippingZone>[] = [
    {
      key: "name",
      header: "Name",
      sortable: true,
      sortValue: (z) => z.name,
      render: (z) => <span className="font-semibold text-foreground">{z.name}</span>,
    },
    {
      key: "regions",
      header: "Regions",
      render: (z) => <span className="text-muted-foreground">{z.regions}</span>,
    },
    {
      key: "baseRate",
      header: "Base rate",
      align: "right",
      sortable: true,
      sortValue: (z) => z.baseRate,
      render: (z) => <span className="font-bold text-foreground">{formatPrice(z.baseRate)}</span>,
    },
    {
      key: "freeAbove",
      header: "Free above",
      align: "right",
      sortable: true,
      sortValue: (z) => z.freeAbove,
      render: (z) => (
        <span className="font-semibold text-muted-foreground">{formatPrice(z.freeAbove)}</span>
      ),
    },
    {
      key: "methods",
      header: "Methods",
      render: (z) => (
        <div className="flex flex-wrap gap-1">
          {z.methods.length === 0 ? (
            <span className="text-muted-foreground">—</span>
          ) : (
            z.methods.map((m) => (
              <Badge key={m} variant="outline">
                {m}
              </Badge>
            ))
          )}
        </div>
      ),
    },
    {
      key: "active",
      header: "Status",
      align: "center",
      sortable: true,
      sortValue: (z) => (z.active ? 1 : 0),
      render: (z) => (
        <div className="flex items-center justify-center gap-2">
          {!z.active && <Badge variant="outline">Disabled</Badge>}
          <Toggle
            active={z.active}
            label={`Toggle ${z.name}`}
            onToggle={() => toggleZone(z)}
          />
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (z) => (
        <div className="flex justify-end gap-1">
          <button
            type="button"
            onClick={() => openZoneModal(z)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={`Edit ${z.name}`}
          >
            <FiEdit2 className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setDeleteZone(z)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Delete ${z.name}`}
          >
            <FiTrash2 className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ),
    },
  ];

  const methodColumns: Column<AdminShippingMethod>[] = [
    {
      key: "name",
      header: "Name",
      sortable: true,
      sortValue: (m) => m.name,
      render: (m) => <span className="font-semibold text-foreground">{m.name}</span>,
    },
    {
      key: "zone",
      header: "Zone",
      sortable: true,
      sortValue: (m) => m.zone,
      render: (m) => <Badge variant="secondary">{m.zone}</Badge>,
    },
    {
      key: "price",
      header: "Price",
      align: "right",
      sortable: true,
      sortValue: (m) => m.price,
      render: (m) => (
        <span className="font-bold text-foreground">
          {m.price === 0 ? "Free" : formatPrice(m.price)}
        </span>
      ),
    },
    {
      key: "eta",
      header: "ETA",
      render: (m) => <span className="text-muted-foreground">{m.eta}</span>,
    },
    {
      key: "active",
      header: "Status",
      align: "center",
      sortable: true,
      sortValue: (m) => (m.active ? 1 : 0),
      render: (m) => (
        <div className="flex items-center justify-center gap-2">
          {!m.active && <Badge variant="outline">Disabled</Badge>}
          <Toggle
            active={m.active}
            label={`Toggle ${m.name}`}
            onToggle={() => toggleMethod(m)}
          />
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (m) => (
        <div className="flex justify-end gap-1">
          <button
            type="button"
            onClick={() => openMethodModal(m)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={`Edit ${m.name}`}
          >
            <FiEdit2 className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setDeleteMethod(m)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Delete ${m.name}`}
          >
            <FiTrash2 className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Shipping"
        subtitle="Configure shipping zones and delivery methods."
        breadcrumb={[{ label: "Shipping" }]}
      />

      <Tabs
        defaultKey="zones"
        tabs={[
          {
            key: "zones",
            label: "Zones",
            icon: <FiGlobe className="h-4 w-4" aria-hidden />,
            content: (
              <div className="space-y-3">
                <FilterBar
                  searchValue={zoneQuery}
                  onSearchChange={(v) => {
                    setZoneQuery(v);
                    setZonePage(1);
                  }}
                  searchPlaceholder="Search zones by name or region..."
                  rightSlot={
                    <>
                      <ExportButton
                        filename="shipping-zones"
                        data={filteredZones.map((z) => ({
                          Name: z.name,
                          Regions: z.regions,
                          "Base rate": z.baseRate,
                          "Free above": z.freeAbove,
                          Methods: z.methods.join(", "),
                          Active: z.active ? "Yes" : "No",
                        }))}
                        disabled={filteredZones.length === 0}
                      />
                      <Button size="sm" onClick={() => openZoneModal()}>
                        <FiPlus className="h-4 w-4" aria-hidden />
                        Add zone
                      </Button>
                    </>
                  }
                />
                <DataTable<AdminShippingZone>
                  columns={zoneColumns}
                  rows={zonePageItems}
                  rowKey={(z) => z._id}
                  pagination={{
                    page: zonePage,
                    totalPages: zoneTotalPages,
                    totalItems: filteredZones.length,
                    pageSize: zonePageSize,
                    onPageChange: setZonePage,
                    onPageSizeChange: (size) => {
                      setZonePageSize(size);
                      setZonePage(1);
                    },
                    pageSizeOptions: [8, 16, 24],
                  }}
                  empty={{
                    icon: <FiGlobe className="h-7 w-7" aria-hidden />,
                    title: "No zones found",
                    description: "Try adjusting your search or add a new zone.",
                    actionLabel: "Add zone",
                    onAction: () => openZoneModal(),
                  }}
                />
              </div>
            ),
          },
          {
            key: "methods",
            label: "Methods",
            icon: <FiTruck className="h-4 w-4" aria-hidden />,
            content: (
              <div className="space-y-3">
                <FilterBar
                  searchValue={methodQuery}
                  onSearchChange={(v) => {
                    setMethodQuery(v);
                    setMethodPage(1);
                  }}
                  searchPlaceholder="Search methods by name or zone..."
                  rightSlot={
                    <>
                      <ExportButton
                        filename="shipping-methods"
                        data={filteredMethods.map((m) => ({
                          Name: m.name,
                          Zone: m.zone,
                          Price: m.price,
                          ETA: m.eta,
                          Active: m.active ? "Yes" : "No",
                        }))}
                        disabled={filteredMethods.length === 0}
                      />
                      <Button size="sm" onClick={() => openMethodModal()}>
                        <FiPlus className="h-4 w-4" aria-hidden />
                        Add method
                      </Button>
                    </>
                  }
                />
                <DataTable<AdminShippingMethod>
                  columns={methodColumns}
                  rows={methodPageItems}
                  rowKey={(m) => m._id}
                  pagination={{
                    page: methodPage,
                    totalPages: methodTotalPages,
                    totalItems: filteredMethods.length,
                    pageSize: methodPageSize,
                    onPageChange: setMethodPage,
                    onPageSizeChange: (size) => {
                      setMethodPageSize(size);
                      setMethodPage(1);
                    },
                    pageSizeOptions: [8, 16, 24],
                  }}
                  empty={{
                    icon: <FiTruck className="h-7 w-7" aria-hidden />,
                    title: "No methods found",
                    description: "Try adjusting your search or add a new method.",
                    actionLabel: "Add method",
                    onAction: () => openMethodModal(),
                  }}
                />
              </div>
            ),
          },
        ]}
      />

      <Modal
        open={zoneFormOpen}
        onClose={() => setZoneFormOpen(false)}
        title={zoneEditing ? "Edit zone" : "Add zone"}
        subtitle={zoneEditing ? zoneEditing.name : "Create a new shipping zone."}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Name"
            placeholder="e.g. United States"
            value={zoneForm.name}
            onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })}
          />
          <Input
            label="Regions"
            placeholder="e.g. Continental US"
            value={zoneForm.regions}
            onChange={(e) => setZoneForm({ ...zoneForm, regions: e.target.value })}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Base rate"
              type="number"
              placeholder="12"
              value={zoneForm.baseRate}
              onChange={(e) => setZoneForm({ ...zoneForm, baseRate: e.target.value })}
            />
            <Input
              label="Free shipping above"
              type="number"
              placeholder="100"
              value={zoneForm.freeAbove}
              onChange={(e) => setZoneForm({ ...zoneForm, freeAbove: e.target.value })}
            />
          </div>
          <Input
            label="Methods"
            placeholder="Standard, Express, Next Day"
            value={zoneForm.methods}
            onChange={(e) => setZoneForm({ ...zoneForm, methods: e.target.value })}
            hint="Comma-separated method names."
          />
          {zoneFormError && (
            <p className="text-xs font-medium text-destructive">{zoneFormError}</p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setZoneFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveZone}>
              <FiPlus className="h-4 w-4" aria-hidden />
              {zoneEditing ? "Save changes" : "Add zone"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={methodFormOpen}
        onClose={() => setMethodFormOpen(false)}
        title={methodEditing ? "Edit method" : "Add method"}
        subtitle={methodEditing ? methodEditing.name : "Create a new shipping method."}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Name"
            placeholder="e.g. Express"
            value={methodForm.name}
            onChange={(e) => setMethodForm({ ...methodForm, name: e.target.value })}
          />
          <Input
            label="Zone"
            placeholder="e.g. United States"
            value={methodForm.zone}
            onChange={(e) => setMethodForm({ ...methodForm, zone: e.target.value })}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Price"
              type="number"
              placeholder="24"
              value={methodForm.price}
              onChange={(e) => setMethodForm({ ...methodForm, price: e.target.value })}
            />
            <Input
              label="ETA"
              placeholder="2–3 business days"
              value={methodForm.eta}
              onChange={(e) => setMethodForm({ ...methodForm, eta: e.target.value })}
            />
          </div>
          {methodFormError && (
            <p className="text-xs font-medium text-destructive">{methodFormError}</p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setMethodFormOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveMethod}>
              <FiPlus className="h-4 w-4" aria-hidden />
              {methodEditing ? "Save changes" : "Add method"}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteZone !== null}
        onClose={() => setDeleteZone(null)}
        onConfirm={removeZone}
        title="Delete zone?"
        description={`This will permanently remove "${deleteZone?.name}". This action cannot be undone.`}
        confirmLabel="Delete"
      />

      <ConfirmDialog
        open={deleteMethod !== null}
        onClose={() => setDeleteMethod(null)}
        onConfirm={removeMethod}
        title="Delete method?"
        description={`This will permanently remove "${deleteMethod?.name}". This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  );
}
