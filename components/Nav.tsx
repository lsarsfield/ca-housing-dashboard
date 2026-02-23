'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Heatmap' },
  { href: '/screener', label: 'Screener' },
  { href: '/pm-scorecard', label: 'PM Scorecard' },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-white/[0.06] bg-[#0d0d10] px-6 py-3 flex items-center gap-6">
      <Link href="/" className="flex items-center gap-2 mr-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="CAHousing" width={36} height={36} className="rounded-sm transition-transform duration-200 hover:scale-125" />
        <span className="text-[9px] bg-white/[0.06] text-[#6b6b78] px-1.5 py-0.5 rounded-sm font-mono tracking-wide">v0</span>
      </Link>

      <div className="flex items-center gap-0.5">
        {links.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`text-sm px-3 py-1.5 rounded-md transition-colors ${
                active
                  ? 'bg-white/[0.07] text-[#ececf0] font-medium'
                  : 'text-[#6b6b78] hover:text-[#ececf0] hover:bg-white/[0.04]'
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      <div className="ml-auto text-[11px] text-[#44444f] tracking-wide">
        CMHC · StatCan · Teranet
      </div>
    </nav>
  );
}
