"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error boundary caught:", error);
  }, [error]);

  return (
    <div className="max-w-lg mx-auto px-4 pt-36 pb-20 text-center space-y-6">
      <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto shadow-lg">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-600 font-mono">
          Something went wrong
        </span>
        <h1 className="font-oswald text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground">
          Application Encountered an Error
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
          We encountered an unexpected error while processing this page. Please try again or return to the marketplace home.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Button
          onClick={() => reset()}
          variant="default"
          className="font-bold rounded-full px-6 bg-brand hover:bg-brand-hover"
        >
          <RefreshCw className="w-4 h-4 mr-2" /> Try Again
        </Button>
        <Link href="/">
          <Button variant="outline" className="font-bold rounded-full px-6">
            <Home className="w-4 h-4 mr-2" /> Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
