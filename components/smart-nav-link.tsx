"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface SmartNavLinkProps {
  href: string;
  protectedHref: string;
  children: React.ReactNode;
  className?: string;
}

export function SmartNavLink({ href, protectedHref, children, className }: SmartNavLinkProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        setIsAuthenticated(!error && !!user);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className={`${className} opacity-50`}>{children}</div>;
  }

  const targetHref = isAuthenticated ? protectedHref : href;
  
  return (
    <Link href={targetHref} className={className}>
      {children}
    </Link>
  );
}