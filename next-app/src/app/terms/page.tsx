import React from "react";
import Link from "next/link";
import { Scale, CheckCircle2, AlertTriangle, HelpCircle, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Rental | ToolShare India",
  description: "Terms and conditions governing peer-to-peer equipment borrowing, security deposits, and safe tool operation on ToolShare.",
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 pt-28 pb-16 space-y-8">
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-brand font-semibold">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold uppercase tracking-wider">
          <Scale className="w-3.5 h-3.5" /> Community Agreement
        </div>
        <h1 className="font-oswald text-4xl sm:text-5xl font-black uppercase tracking-tight text-foreground">
          Terms of Rental
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Please review the operating terms and responsibilities before reserving or listing equipment on ToolShare.
        </p>
      </div>

      <div className="bg-card rounded-3xl border border-border/80 p-6 sm:p-10 shadow-sm space-y-8 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
        <section className="space-y-3">
          <h2 className="font-oswald text-xl font-bold uppercase text-foreground flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" /> 1. Peer-to-Peer Rental Agreement
          </h2>
          <p>
            ToolShare acts as a community marketplace connecting independent tool owners with local borrowers. When you book a tool, you enter into a direct temporary rental agreement with the equipment owner. ToolShare provides catalog discovery, reservation synchronization, dynamic QR handover tokens, and transaction transparency.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-oswald text-xl font-bold uppercase text-foreground flex items-center gap-2">
            <Scale className="w-5 h-5 text-brand" /> 2. Security Deposits & Timely Returns
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li><strong>Deposit Guarantee:</strong> The security deposit listed on each tool is held during the active reservation period.</li>
            <li><strong>Condition Check at Pickup:</strong> Both parties inspect the equipment before completing the QR handover scan to verify working status.</li>
            <li><strong>Timely Return:</strong> Tools must be returned to the agreed location by the end date specified in your booking confirmation.</li>
            <li><strong>Deposit Release:</strong> Once the tool is returned undamaged and verified by the owner, the deposit hold is released.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-oswald text-xl font-bold uppercase text-foreground flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" /> 3. Safe Operation & Protective Gear
          </h2>
          <p>
            Power tools, angle grinders, and ladders carry inherent operational risks. Borrowers are strictly responsible for:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
            <li>Wearing appropriate Personal Protective Equipment (safety goggles, ear protection, non-slip gloves, and dust masks).</li>
            <li>Operating tools only in accordance with manufacturer guidelines and suitable electrical supplies (e.g. 230V / 50Hz).</li>
            <li>Not subleasing, disassembling, or modifying rented equipment.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-oswald text-xl font-bold uppercase text-foreground flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-500" /> 4. Dispute Resolution & Fair Play
          </h2>
          <p>
            In the rare event of equipment breakdown or scheduling disagreement, both parties agree to communicate respectfully through ToolShare messaging. ToolShare support helps review photographic evidence and initial condition records to ensure fair resolution.
          </p>
        </section>
      </div>
    </div>
  );
}
