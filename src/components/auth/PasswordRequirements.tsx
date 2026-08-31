"use client";

import type { ReactNode } from "react";
import { FiCheck, FiCircle } from "react-icons/fi";
import { getPasswordChecks } from "@/lib/password-validation";
import { cn } from "@/lib/utils";

type PasswordRequirementsProps = {
  password: string;
  className?: string;
};

function RequirementRow({
  met,
  optional,
  children,
}: {
  met: boolean;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <li
      className={cn(
        "flex items-center gap-2 text-xs",
        met ? "text-success" : optional ? "text-muted-foreground" : "text-muted-foreground"
      )}
    >
      {met ? (
        <FiCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />
      ) : (
        <FiCircle className="h-3 w-3 shrink-0 opacity-50" aria-hidden />
      )}
      <span>
        {children}
        {optional ? " (optional)" : ""}
      </span>
    </li>
  );
}

export function PasswordRequirements({ password, className }: PasswordRequirementsProps) {
  const checks = getPasswordChecks(password);

  return (
    <ul className={cn("space-y-1 rounded-lg border border-border bg-muted/30 px-3 py-2.5", className)}>
      <p className="mb-1.5 text-xs font-medium text-foreground">Password requirements</p>
      <RequirementRow met={checks.minLength}>At least 8 characters</RequirementRow>
      <RequirementRow met={checks.uppercase}>At least 1 uppercase letter</RequirementRow>
      <RequirementRow met={checks.number}>At least 1 number</RequirementRow>
      <RequirementRow met={checks.specialChar} optional>
        Special character (e.g. @, #, !)
      </RequirementRow>
    </ul>
  );
}
