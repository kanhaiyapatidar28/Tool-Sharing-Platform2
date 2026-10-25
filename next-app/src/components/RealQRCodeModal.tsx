"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import Image from "next/image";
import { BookingItem } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  X,
  QrCode,
  ShieldCheck,
  Download,
  Copy,
  Check,
  Smartphone,
  ExternalLink,
} from "lucide-react";

interface RealQRCodeModalProps {
  booking: BookingItem;
  onClose: () => void;
}

export default function RealQRCodeModal({ booking, onClose }: RealQRCodeModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(true);

  // Dynamic Handover Verification payload
  const securityPin = (booking.id.replace(/[^0-9]/g, "") || "8492").padStart(4, "0");
  const verificationPayload = JSON.stringify({
    app: "ToolShare India",
    type: "HANDOVER_VERIFICATION",
    bookingId: booking.id,
    toolId: booking.toolId,
    toolTitle: booking.toolTitle,
    renter: booking.renterName,
    renterEmail: booking.renterEmail,
    owner: booking.ownerName,
    pin: securityPin,
    status: booking.status,
    issuedAt: new Date().toISOString(),
  });

  useEffect(() => {
    let isMounted = true;
    async function generateCode() {
      try {
        setGenerating(true);
        // Generate actual ISO-18004 high resolution QR code
        const dataUrl = await QRCode.toDataURL(verificationPayload, {
          width: 320,
          margin: 2,
          color: {
            dark: "#171717",
            light: "#FFFFFF",
          },
          errorCorrectionLevel: "H",
        });
        if (isMounted) {
          setQrDataUrl(dataUrl);
        }
      } catch (err) {
        console.error("QR Code generation error:", err);
      } finally {
        if (isMounted) setGenerating(false);
      }
    }
    generateCode();
    return () => {
      isMounted = false;
    };
  }, [verificationPayload]);

  const copyPayload = () => {
    navigator.clipboard.writeText(verificationPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `ToolShare-Handover-${booking.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-card rounded-3xl border border-border/80 p-6 sm:p-7 max-w-sm w-full text-center space-y-4 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand">
              Live Handover QR Code
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tool Info */}
        <div className="text-left bg-neutral-50 dark:bg-neutral-900/60 p-3 rounded-2xl border border-border/60 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white p-1 border border-border shrink-0 flex items-center justify-center overflow-hidden">
            <Image
              src={booking.toolPhoto || "/assets/drill machine.png"}
              alt={booking.toolTitle}
              width={48}
              height={48}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-oswald text-sm font-bold uppercase text-foreground truncate">
              {booking.toolTitle}
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Owner: <span className="font-semibold text-foreground">{booking.ownerName}</span>
            </p>
          </div>
        </div>

        {/* Real QR Display */}
        <div className="relative p-3 bg-white rounded-2xl inline-block shadow-lg border-2 border-neutral-200/90 mx-auto">
          {generating ? (
            <div className="w-52 h-52 flex flex-col items-center justify-center gap-2 text-neutral-400">
              <QrCode className="w-8 h-8 animate-spin text-brand" />
              <span className="text-xs font-mono">Generating Real QR...</span>
            </div>
          ) : qrDataUrl ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrDataUrl}
                alt="Tool Handover QR Code"
                className="w-52 h-52 object-contain rounded-lg"
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-brand text-white flex items-center justify-center shadow-md border-2 border-white pointer-events-none">
                <QrCode className="w-5 h-5" />
              </div>
            </div>
          ) : (
            <div className="w-52 h-52 flex items-center justify-center text-xs text-destructive">
              Failed to generate QR
            </div>
          )}
        </div>

        {/* Verification PIN Badge */}
        <div className="flex items-center justify-center gap-2">
          <Badge variant="outline" className="text-xs font-mono font-bold px-3 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300">
            Security PIN: {securityPin}
          </Badge>
          <Badge variant="outline" className="text-xs font-mono font-bold px-3 py-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300">
            ID: {booking.id}
          </Badge>
        </div>

        {/* Instructions */}
        <div className="text-[11px] text-muted-foreground leading-relaxed px-1">
          <p className="flex items-center justify-center gap-1 font-semibold text-foreground">
            <Smartphone className="w-3.5 h-3.5 text-brand" /> Scan with any phone camera or Google Lens
          </p>
          <p className="text-[10px] mt-0.5">
            Owner scans this QR code at pickup to verify borrower identity and activate rental warranty.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={copyPayload}
            className="flex-1 text-xs font-bold rounded-xl"
          >
            {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
            {copied ? "Copied" : "Copy Payload"}
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={downloadQR}
            disabled={!qrDataUrl}
            className="flex-1 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-xl"
          >
            <Download className="w-3.5 h-3.5 mr-1" /> Save QR
          </Button>
        </div>
      </div>
    </div>
  );
}
