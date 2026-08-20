"use client";

import { Modal } from "./Modal";
import { Button } from "./Button";
import { FiLogIn, FiUserPlus } from "react-icons/fi";

type AuthRequiredModalProps = {
  open: boolean;
  onClose: () => void;
};

export function AuthRequiredModal({ open, onClose }: AuthRequiredModalProps) {
  return (
    <Modal open={open} onClose={onClose} size="sm" title="Login Required" subtitle="Please login or create an account to continue">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <FiLogIn className="h-8 w-8 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">
          You need to be logged in to add items to your cart and make purchases.
        </p>
        <div className="flex w-full gap-3">
          <Button href="/login" onClick={onClose} className="flex-1">
            <FiLogIn className="h-4 w-4" aria-hidden />
            Login
          </Button>
          <Button href="/signup" onClick={onClose} variant="outline" className="flex-1">
            <FiUserPlus className="h-4 w-4" aria-hidden />
            Sign up
          </Button>
        </div>
      </div>
    </Modal>
  );
}
