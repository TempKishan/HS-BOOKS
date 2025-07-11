
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page immediately redirects to the dashboard, effectively removing the login requirement.
export default function LoginPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/');
    }, [router]);

    return null; // Render nothing as the redirect happens
}
