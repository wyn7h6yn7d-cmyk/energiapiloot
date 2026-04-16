"use client";

import { useState, type ReactNode } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { startUnlockCheckout } from "@/lib/unlock/checkout-client";
import type { UnlockOfferId } from "@/lib/unlock/types";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";

type Variant = VariantProps<typeof buttonVariants>["variant"];

export function UnlockCheckoutButton({
  offerId,
  children,
  variant = "gradient",
  size = "default",
  className,
  fallbackHref,
  disabled,
}: {
  offerId: UnlockOfferId;
  children: ReactNode;
  variant?: Variant;
  size?: VariantProps<typeof buttonVariants>["size"];
  className?: string;
  /** When checkout is not live (501), navigate here so the CTA still does something useful. */
  fallbackHref?: string;
  disabled?: boolean;
}) {
  const [pending, setPending] = useState(false);

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn(className)}
      disabled={disabled || pending}
      onClick={async () => {
        setPending(true);
        try {
          const result = await startUnlockCheckout({ offerId });
          if (result.ok) {
            window.location.assign(result.checkoutUrl);
            return;
          }
          if (fallbackHref) {
            window.location.assign(fallbackHref);
          }
        } finally {
          setPending(false);
        }
      }}
    >
      {pending ? "Suunan…" : children}
    </Button>
  );
}
