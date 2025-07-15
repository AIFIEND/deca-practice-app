'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
// Corrected heroicons import paths for v2
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
  const { data: session, status } = useSession();
  console.log("Navbar session status:", status, "session:", session);
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/exams', label: 'Exams' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                DECA Prep
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-4 ml-10">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive(link.href)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {status === 'loading' ? (
                <div className="animate-pulse h-8 w-16 bg-gray-200 rounded-md"></div>
              ) : session ? (
                <div className="ml-3 relative">
                  <div>
                    <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="max-w-xs bg-gray-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white" id="user-menu" aria-haspopup="true">
                      <span className="sr-only">Open user menu</span>
                      <img className="h-8 w-8 rounded-full" src={session.user?.image || `https://ui-avatars.com/api/?name=${session.user?.name}&background=0D8ABC&color=fff`} alt="" />
                    </button>
                  </div>
                  {isProfileMenuOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5">
                      <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                        Your Profile
                      </Link>
                      <a href="#" onClick={() => signOut()} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                        Sign out
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login" className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                  Login
                </Link>
              )}
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="bg-gray-100 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
               <Link key={link.href} href={link.href} className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive(link.href)
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}>
                {link.label}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {session ? (
              <>
                <div className="flex items-center px-5">
                  <div className="flex-shrink-0">
                    <img className="h-10 w-10 rounded-full" src={session.user?.image || `https://ui-avatars.com/api/?name=${session.user?.name}&background=0D8ABC&color=fff`} alt="" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium leading-none text-gray-800">{session.user?.name}</div>
                    <div className="text-sm font-medium leading-none text-gray-500">{session.user?.email}</div>
                  </div>
                </div>
                <div className="mt-3 px-2 space-y-1">
                  <Link
                    href="/profile"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Your Profile
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              </>
            ) : (
              <div className="px-2 space-y-1">
                <Link href="/login" className="block w-full px-3 py-2 rounded-md text-left text-base font-medium text-gray-700 hover:bg-gray-100">
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;