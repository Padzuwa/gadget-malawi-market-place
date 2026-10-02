import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Report a listing',
  description: 'Flag a scam, prohibited item, or bad actor.',
};

export default function ReportLandingPage() {
  return (
    <div className="gm-stack" style={{ gap: 16, maxWidth: 640 }}>
      <span className="gm-eyebrow">Report</span>
      <h1 className="gm-title">Report a listing</h1>
      <p className="gm-muted">
        To report a specific listing, open the product page and tap the{' '}
        <strong>Report</strong> button below the share options. Your report is
        anonymous to the seller and reviewed by our team.
      </p>
      <Link href="/browse" className="gm-btn gm-btn-primary" style={{ width: 'fit-content' }}>
        Browse listings
      </Link>
    </div>
  );
}