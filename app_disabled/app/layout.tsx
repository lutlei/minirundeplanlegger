"use client";

import React from 'react';
import Link from 'next/link';
import { Poppins } from 'next/font/google';
import { usePathname } from 'next/navigation';
import './styles.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-poppins',
});

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  return (
    <div className={`${poppins.variable} font-sans min-h-screen bg-slate-100 dark:bg-slate-900`}>
      <header className="bg-white dark:bg-slate-800 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <img
                src="https://bandyforbundet.no/midt-norge-bandyregion/wp-content/uploads/sites/9/2021/06/cropped-midtnorge.png"
                alt="Midt-Norge Bandyregion Logo"
                className="h-8 w-auto mr-2"
              />
              <span className="text-xl font-bold text-primary-dark dark:text-primary">Jimini</span>
            </Link>
            
            <nav className="flex space-x-4">
              <NavLink href="/app/signup" isActive={pathname === '/app/signup'}>
                Påmelding
              </NavLink>
              <NavLink href="/app/organizer" isActive={pathname === '/app/organizer'}>
                Arrangør
              </NavLink>
              <NavLink href="/app/schedule" isActive={pathname === '/app/schedule'}>
                Kampprogram
              </NavLink>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      
      <footer className="bg-white dark:bg-slate-800 shadow-inner">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} Jimini - Minirundeplanlegger</p>
        </div>
      </footer>
    </div>
  );
}

function NavLink({
  href,
  isActive,
  children,
}: {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-md text-sm font-medium ${
        isActive
          ? 'bg-primary-light/30 text-primary-dark dark:bg-primary-dark/30 dark:text-primary-light'
          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
      }`}
    >
      {children}
    </Link>
  );
} 