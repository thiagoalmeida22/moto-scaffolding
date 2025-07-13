'use client';

import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.content}>
                <p>&copy; {new Date().getFullYear()} Moto Scaffolding. All rights reserved.</p>
                <div className={styles.links}>
                    <a href="/about">About</a>
                    <a href="/privacy">Privacy Policy</a>
                    <a href="/terms">Terms of Service</a>
                </div>
            </div>
        </footer>
    );
} 