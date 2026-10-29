import React from "react";
import Link from "next/link";
import { Wrench, Home, Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 pt-36 pb-20 text-center space-y-6">
      <div className="w-16 h-16 rounded-3xl bg-brand/10 text-brand flex items-center justify-center mx-auto shadow-xl shadow-brand/10">
        <Wrench className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-brand font-mono">
          Error 404 • Tool Not Found
        </span>
        <h1 className="font-oswald text-4xl sm:text-5xl font-black uppercase tracking-tight text-foreground">
          Page Not Available
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          The tool listing or page you are searching for might have been returned, moved, or is temporarily unavailable in your locality.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link href="/">
          <Button variant="default" className="font-bold rounded-full px-6 bg-brand hover:bg-brand-hover">
            <Home className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </Link>
        <Link href="/browse">
          <Button variant="outline" className="font-bold rounded-full px-6">
            <Search className="w-4 h-4 mr-2" /> Browse Equipment Catalog
          </Button>
        </Link>
      </div>
    </div>
  );
}
