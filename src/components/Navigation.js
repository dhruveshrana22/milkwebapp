'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    HomeIcon,
    UsersIcon,
    CubeIcon,
    ShoppingCartIcon,
    ChartBarIcon,
    ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

const navItems = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'POS Sales', href: '/sales', icon: ShoppingCartIcon },
    { name: 'Customers', href: '/customers', icon: UsersIcon },
    { name: 'Transactions', href: '/transactions', icon: ClipboardDocumentListIcon },
    { name: 'Product Entry', href: '/master', icon: CubeIcon },
    { name: 'Reports', href: '/reports', icon: ChartBarIcon },
];

export default function Navigation() {
    const pathname = usePathname();

    return (
        <>
            <aside className="fixed left-0 top-0 hidden h-full w-64 border-r border-gray-200 bg-white p-4 md:block">
                <div className="mb-8 flex items-center gap-2 px-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg">
                        🥛
                    </div>
                    <span className="text-xl font-bold tracking-tight text-blue-900">DairyPOS</span>
                </div>
                <nav className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                            >
                                <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-gray-100 bg-white/80 px-1 py-1 backdrop-blur-md md:hidden">
                <div className="flex justify-around items-center">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center gap-1 p-2 transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400'
                                    }`}
                            >
                                <item.icon className="h-5 w-5" />
                                <span className="text-[9px] font-medium text-center leading-tight">{item.name}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </>
    );
}
