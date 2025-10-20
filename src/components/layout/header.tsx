
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const Breadcrumb = () => {
    const pathname = usePathname();
    const router = useRouter();

    const pathSegments = pathname.split('/').filter(segment => segment && segment !== 'app');
    
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    // Don't render breadcrumbs on the main dashboard page
    if (pathSegments.length <= 1 && pathSegments[0] === 'dashboard') {
        return null;
    }
     if (pathSegments.length <= 1 && pathSegments[0] === 'admin') {
        return null;
    }


    return (
        <nav className="flex items-center text-sm text-muted-foreground">
            <Button variant="ghost" size="icon" className="h-8 w-8 mr-2" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1.5">
                <Link href="/dashboard" className="hover:text-foreground transition-colors">
                    Home
                </Link>
                {pathSegments.map((segment, index) => {
                    const href = '/' + pathSegments.slice(0, index + 1).join('/');
                    const isLast = index === pathSegments.length - 1;

                    return (
                        <div key={href} className="flex items-center gap-1.5">
                            <ChevronRight className="h-4 w-4" />
                            <Link 
                                href={href} 
                                className={`${isLast ? 'text-foreground font-semibold' : 'hover:text-foreground'} transition-colors`}
                            >
                                {capitalize(segment.replace(/-/g, ' '))}
                            </Link>
                        </div>
                    )
                })}
            </div>
        </nav>
    );
}


export default function Header() {
    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 pt-4">
             <Breadcrumb />
        </header>
    );
}
