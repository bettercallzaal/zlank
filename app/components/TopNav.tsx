'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/builder', label: 'Builder' },
  { href: '/templates', label: 'Templates' },
  { href: '/dashboard', label: 'My Snaps' },
  { href: '/suggest', label: 'Suggest' },
];

// Global top banner. Rendered once in the root layout so every page shares the
// same nav. The Zlank wordmark is the home link; tabs highlight the active
// section. Sticky so it stays reachable while scrolling.
export default function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-[#1f3252] bg-[#0a1628]/95 backdrop-blur px-4 sm:px-6 py-3">
      <div className="max-w-6xl mx-auto flex items-center gap-3 sm:gap-5">
        <Link href="/" className="text-[#f5a623] font-bold text-lg shrink-0">
          Zlank
        </Link>
        <nav className="flex gap-1 sm:gap-2 text-sm">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={
                  active
                    ? 'px-3 py-1.5 rounded-md font-bold bg-[#f5a623] text-[#0a1628]'
                    : 'px-3 py-1.5 rounded-md text-[#b8c4d4] hover:text-[#f5a623] hover:bg-[#122440] transition'
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
