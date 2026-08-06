import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function AdminFooter() {
  return (
    <footer className="border-t border-border px-4 py-5 lg:px-8">
      <div className="flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
        <p>
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="transition-colors hover:text-primary"
          >
            Storefront
          </Link>
          <Link
            href="/admin/settings"
            className="transition-colors hover:text-primary"
          >
            Settings
          </Link>
          <Link
            href="/contact"
            className="transition-colors hover:text-primary"
          >
            Support
          </Link>
        </div>
      </div>
    </footer>
  );
}
