"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ToolItem } from "@/lib/constants";
import { useAuth } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ToolQRModal from "@/components/ToolQRModal";
import {
  Wrench,
  PlusCircle,
  QrCode,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

export default function OwnerToolsPage() {
  const { user, loading: authLoading } = useAuth();
  const [tools, setTools] = useState<ToolItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQRTool, setSelectedQRTool] = useState<ToolItem | null>(null);

  useEffect(() => {
    async function fetchTools() {
      if (!user) return;
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/tools?ownerOnly=true");
        const data = await res.json();
        if (res.ok && data.success && data.tools) {
          setTools(data.tools);
        } else {
          setError(data.error || "Failed to load your tools");
        }
      } catch (err: any) {
        setError(err.message || "Network error loading tools");
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      fetchTools();
    }
  }, [user, authLoading]);

  const togglePublish = async (tool: ToolItem) => {
    const id = tool.id || tool._id!;
    const newPublished = tool.isPublished === false ? true : false;
    try {
      const res = await fetch(`/api/tools/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: newPublished }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTools((prev) =>
          prev.map((t) => (t.id === id || t._id === id ? { ...t, isPublished: newPublished } : t))
        );
      } else {
        alert(data.error || "Failed to update publication status");
      }
    } catch (e: any) {
      alert(e.message || "Network error updating publication status");
    }
  };

  const toggleAvailability = async (tool: ToolItem) => {
    const id = tool.id || tool._id!;
    const newAvail = !tool.isAvailable;
    try {
      const res = await fetch(`/api/tools/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: newAvail }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTools((prev) =>
          prev.map((t) => (t.id === id || t._id === id ? { ...t, isAvailable: newAvail } : t))
        );
      } else {
        alert(data.error || "Failed to update availability");
      }
    } catch (e: any) {
      alert(e.message || "Network error updating availability");
    }
  };

  const handleDelete = async (tool: ToolItem) => {
    const id = tool.id || tool._id!;
    if (!confirm(`Are you sure you want to permanently delete "${tool.title}"?`)) return;

    try {
      const res = await fetch(`/api/tools/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        setTools((prev) => prev.filter((t) => t.id !== id && t._id !== id));
      } else {
        alert(data.error || "Failed to delete tool");
      }
    } catch (e: any) {
      alert(e.message || "Network error deleting tool");
    }
  };

  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 pt-28 pb-16 min-h-[60vh] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-brand animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 pt-32 pb-16 text-center space-y-4">
        <Wrench className="w-12 h-12 text-brand mx-auto" />
        <h2 className="text-2xl font-bold font-oswald uppercase">Authentication Required</h2>
        <p className="text-sm text-muted-foreground">Please sign in as an owner to view your listings.</p>
        <Link href="/login">
          <Button className="w-full bg-brand text-white font-bold">Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-brand text-white text-[10px] uppercase font-bold tracking-wider">
              Owner Management
            </Badge>
            <span className="text-xs text-muted-foreground">{tools.length} Tools in Fleet</span>
          </div>
          <h1 className="font-oswald text-3xl sm:text-4xl font-black uppercase tracking-tight text-foreground mt-1">
            My Tool Listings
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Manage your peer-to-peer equipment, update availability, generate QR sticker tags, and track catalog status.
          </p>
        </div>

        <Link href="/owner/tools/new">
          <Button className="bg-brand hover:bg-brand-hover text-white font-oswald uppercase tracking-wider text-xs sm:text-sm font-bold shadow-md shadow-brand/20">
            <PlusCircle className="w-4 h-4 mr-1.5" /> Add New Tool
          </Button>
        </Link>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex items-center gap-3 text-red-600 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tools Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 bg-card border border-border rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : tools.length === 0 ? (
        <div className="bg-card border border-border rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-brand/10 text-brand flex items-center justify-center mx-auto">
            <Wrench className="w-8 h-8" />
          </div>
          <h3 className="font-oswald text-2xl font-bold uppercase text-foreground">No Tools in Your Fleet</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            You haven't listed any equipment yet. Start earning passive income by sharing power tools, garden gear, or hand equipment with your local community.
          </p>
          <Link href="/owner/tools/new">
            <Button className="bg-brand hover:bg-brand-hover text-white font-bold text-sm">
              <PlusCircle className="w-4 h-4 mr-1.5" /> List Your First Tool
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const isPub = tool.isPublished !== false;
            return (
              <div
                key={tool.id || tool._id}
                className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs hover:border-brand/40 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Photo & Badges */}
                  <div className="relative h-48 bg-neutral-100 overflow-hidden">
                    <Image
                      src={tool.images?.[0] || "/assets/drill machine.png"}
                      alt={tool.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <Badge className={isPub ? "bg-emerald-600 text-white text-[10px]" : "bg-neutral-600 text-white text-[10px]"}>
                        {isPub ? "Published" : "Draft / Hidden"}
                      </Badge>
                      <Badge variant="outline" className="bg-white/90 text-neutral-900 text-[10px] font-bold">
                        {tool.isAvailable ? "Available" : "In Use"}
                      </Badge>
                    </div>
                    <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-xs font-bold font-oswald">
                      ₹{tool.ratePerDay}/day
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="font-semibold uppercase tracking-wider text-brand">{tool.category.replace(/_/g, " ")}</span>
                      <span>{tool.pickupArea || tool.city}</span>
                    </div>

                    <h3 className="font-oswald text-lg font-bold uppercase tracking-tight text-foreground line-clamp-1">
                      {tool.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {tool.description}
                    </p>

                    <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                      <span>Condition: <strong>{tool.condition.replace(/_/g, " ")}</strong></span>
                      <span>Deposit: <strong>₹{tool.deposit || 0}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 pt-0 border-t border-border mt-3 grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedQRTool(tool)}
                    className="w-full text-xs font-bold text-brand hover:bg-brand/10 border-brand/30"
                  >
                    <QrCode className="w-3.5 h-3.5 mr-1" /> QR Asset Tag
                  </Button>

                  <Link href={`/owner/tools/${tool.id || tool._id}/edit`} className="w-full">
                    <Button size="sm" variant="outline" className="w-full text-xs font-bold">
                      <Edit className="w-3.5 h-3.5 mr-1" /> Edit Listing
                    </Button>
                  </Link>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => togglePublish(tool)}
                    className="w-full text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    {isPub ? (
                      <span className="flex items-center gap-1"><EyeOff className="w-3.5 h-3.5" /> Unpublish</span>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-600"><Eye className="w-3.5 h-3.5" /> Publish</span>
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(tool)}
                    className="w-full text-[11px] text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR Code Modal */}
      {selectedQRTool && (
        <ToolQRModal
          tool={selectedQRTool}
          onClose={() => setSelectedQRTool(null)}
        />
      )}
    </div>
  );
}
