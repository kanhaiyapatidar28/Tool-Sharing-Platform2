"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import Image from "next/image";
import { ToolItem } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  X,
  QrCode,
  Download,
  Printer,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";

interface ToolQRModalProps {
  tool: ToolItem;
  onClose: () => void;
  isOpen?: boolean;
}

export default function ToolQRModal({ tool, onClose, isOpen = true }: ToolQRModalProps) {
  if (!isOpen) return null;
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(true);

  // Compute public scan URL
  const publicId = tool.publicId || (tool.id ? `tool-${tool.id}` : `tool_${tool._id}`);
  const [scanUrl, setScanUrl] = useState<string>(`/scan/${publicId}`);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const fullUrl = `${window.location.origin}/scan/${publicId}`;
      setScanUrl(fullUrl);

      QRCode.toDataURL(fullUrl, {
        width: 360,
        margin: 2,
        color: {
          dark: "#171717",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "H",
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error("QR generation error:", err))
        .finally(() => setGenerating(false));
    }
  }, [publicId]);

  const copyUrl = () => {
    navigator.clipboard.writeText(scanUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `ToolShare-QR-${tool.title.replace(/[^a-zA-Z0-9]/g, "-")}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printQR = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Equipment QR Tag - ${tool.title}</title>
          <style>
            body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
            .card { background: white; padding: 24px; border-radius: 16px; border: 2px dashed #333; text-align: center; max-width: 320px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .badge { display: inline-block; background: #ff5722; color: white; padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
            h2 { margin: 12px 0 4px; font-size: 18px; color: #111; }
            p { margin: 4px 0; color: #666; font-size: 12px; }
            img { width: 220px; height: 220px; margin: 12px auto; display: block; }
            .footer { font-size: 10px; color: #888; margin-top: 12px; border-top: 1px solid #eee; padding-top: 8px; }
          </style>
        </head>
        <body>
          <div class="card">
            <span class="badge">ToolShare India Verified</span>
            <h2>${tool.title}</h2>
            <p>Scan with any camera to view equipment specs & book</p>
            <img src="${qrDataUrl}" alt="Tool QR" />
            <p style="font-weight: bold; color: #111;">Rate: ₹${tool.ratePerDay} / day</p>
            <p>Pickup: ${tool.pickupArea || tool.city}</p>
            <div class="footer">Public Identifier: ${publicId}</div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-card rounded-3xl border border-border p-6 sm:p-7 max-w-sm w-full text-center space-y-4 shadow-2xl relative text-card-foreground">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-neutral-100 transition-colors"
          aria-label="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <Badge className="bg-brand text-white text-[10px] uppercase font-bold tracking-wider">
            Equipment QR Code
          </Badge>
          <h3 className="font-oswald text-xl font-bold uppercase tracking-tight text-foreground line-clamp-1">
            {tool.title}
          </h3>
          <p className="text-xs text-muted-foreground">
            Attach this QR sticker to your tool for instant mobile scanning and borrower discovery.
          </p>
        </div>

        {/* QR Code Render Box */}
        <div className="bg-white p-4 rounded-2xl border border-border/80 shadow-inner flex flex-col items-center justify-center">
          {generating || !qrDataUrl ? (
            <div className="w-56 h-56 flex flex-col items-center justify-center gap-2">
              <QrCode className="w-8 h-8 text-brand animate-spin" />
              <span className="text-xs text-muted-foreground font-semibold">Generating QR Code...</span>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="relative w-56 h-56 mx-auto">
                <Image
                  src={qrDataUrl}
                  alt={`QR code for ${tool.title}`}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <p className="text-[11px] font-mono text-neutral-600 bg-neutral-100 px-2 py-1 rounded truncate max-w-[240px] mx-auto">
                {scanUrl}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={downloadQR}
            disabled={!qrDataUrl}
            className="w-full text-xs font-bold"
          >
            <Download className="w-3.5 h-3.5 mr-1 text-brand" /> Download PNG
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={printQR}
            disabled={!qrDataUrl}
            className="w-full text-xs font-bold"
          >
            <Printer className="w-3.5 h-3.5 mr-1 text-neutral-700" /> Print Sticker
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={copyUrl}
            className="flex-1 text-xs"
          >
            {copied ? (
              <span className="flex items-center text-emerald-600 font-bold">
                <Check className="w-3.5 h-3.5 mr-1" /> Copied!
              </span>
            ) : (
              <span className="flex items-center text-muted-foreground">
                <Copy className="w-3.5 h-3.5 mr-1" /> Copy Scan URL
              </span>
            )}
          </Button>

          <a
            href={`/scan/${publicId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button variant="ghost" size="sm" className="w-full text-xs text-brand hover:text-brand-hover">
              <ExternalLink className="w-3.5 h-3.5 mr-1" /> Test Scan Page
            </Button>
          </a>
        </div>

        {/* Non-handover notice */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5 flex items-start gap-2 text-left">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-700 leading-snug">
            <strong>Notice:</strong> This QR code is strictly for tool discovery & specs. It does not authorize tool release without a verified rental agreement.
          </p>
        </div>
      </div>
    </div>
  );
}
