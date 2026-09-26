import type { SellerStats } from '@/lib/data/seller';

function formatNumber(n: number) {
  return String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function DashboardStats({ stats }: { stats: SellerStats }) {
  return (
    <div className="gm-stat-grid">
      <div className="gm-card gm-card-pad gm-stat">
        <span className="gm-stat-value">
          {formatNumber(stats.totalListings)}
        </span>
        <span className="gm-stat-label">Total listings</span>
      </div>

      <div className="gm-card gm-card-pad gm-stat">
        <span className="gm-stat-value">
          {formatNumber(stats.activeListings)}
        </span>
        <span className="gm-stat-label">Active</span>
      </div>

      <div className="gm-card gm-card-pad gm-stat">
        <span className="gm-stat-value">
          {formatNumber(stats.soldListings)}
        </span>
        <span className="gm-stat-label">Sold</span>
      </div>

      <div className="gm-card gm-card-pad gm-stat">
        <span className="gm-stat-value">{formatNumber(stats.totalViews)}</span>
        <span className="gm-stat-label">Total views</span>
      </div>
    </div>
  );
}