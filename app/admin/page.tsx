import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { AdminConsole } from "@/components/admin-console";

export default function AdminPage() {
  return (
    <main className="flex min-h-full flex-1 flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-show-yellow/20 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <BrandLogo width={180} className="w-28 sm:w-36" />
          <p className="text-xs tracking-[0.28em] text-show-magenta uppercase">
            Moderátor
          </p>
        </div>
        <Link
          href="/play"
          className="text-sm text-show-yellow underline-offset-4 hover:underline"
        >
          Otvoriť tabuľu
        </Link>
      </div>
      <AdminConsole />
    </main>
  );
}
