'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import styles from './Header.module.css';

export default function Header() {
    const pathname = usePathname();

    // List of paths where header should not be shown
    const excludedPaths = ['/login', '/admin'];

    if (excludedPaths.includes(pathname)) {
        return null;
    }

    return (
        <header className={styles.header}>
            <nav className={styles.nav}>
                <Link href="/" className={styles.logo}>
                    <Image
                        src="/logo-azul-menor.png"
                        alt="Motoinfo Logo"
                        width={150}
                        height={125}
                        priority
                    />
                </Link>
                <div className={styles.links}>
                    <Link href="/motos">Motos</Link>
                    <Link href="/comparador">Comparador</Link>
                </div>
            </nav>
        </header>
    );
} 