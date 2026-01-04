'use client'

import Modal from './Modal'
import { ThomasMorel, financeData } from '@/data/mockData'

interface AssetsModalProps {
  isOpen: boolean
  onClose: () => void
}

const formatCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M€`
  }
  if (value >= 1000) {
    return `${Math.round(value / 1000)}k€`
  }
  return `${Math.round(value)}€`
}

export default function AssetsModal({ isOpen, onClose }: AssetsModalProps) {
  const patrimoine = ThomasMorel.moduleC.patrimoine
  const revenus = ThomasMorel.moduleC.revenus

  const assets = [
    { 
      label: 'Real Estate', 
      value: financeData.stock.realEstate, 
      color: 'var(--accent-gold)',
      icon: 'fa-building',
      percentage: Math.round((financeData.stock.realEstate / patrimoine.totalAssets) * 100)
    },
    { 
      label: 'Financial Assets', 
      value: financeData.stock.financial, 
      color: 'var(--accent-sage)',
      icon: 'fa-chart-line',
      percentage: Math.round((financeData.stock.financial / patrimoine.totalAssets) * 100)
    },
    { 
      label: 'Vehicles', 
      value: financeData.stock.vehicles, 
      color: 'var(--accent-sky)',
      icon: 'fa-car',
      percentage: Math.round((financeData.stock.vehicles / patrimoine.totalAssets) * 100)
    },
    { 
      label: 'Cash', 
      value: patrimoine.liquidAssets, 
      color: 'var(--accent-lavender)',
      icon: 'fa-wallet',
      percentage: Math.round((patrimoine.liquidAssets / patrimoine.totalAssets) * 100)
    },
  ]

  return (
    <Modal isOpen={isOpen} onClose={onClose} id="modal-assets" title="Net Worth">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div 
          className="p-4 rounded-2xl text-center"
          style={{ background: 'rgba(201, 169, 98, 0.08)' }}
        >
          <div 
            className="text-2xl font-light text-display"
            style={{ color: 'var(--accent-gold)' }}
          >
            {formatCurrency(patrimoine.netWorth)}
          </div>
          <div 
            className="text-[10px] uppercase tracking-wider mt-1"
            style={{ color: 'var(--text-muted)' }}
          >
            Net Worth
          </div>
        </div>
        <div 
          className="p-4 rounded-2xl text-center"
          style={{ background: 'rgba(139, 168, 136, 0.08)' }}
        >
          <div 
            className="text-2xl font-light text-display"
            style={{ color: 'var(--accent-sage)' }}
          >
            {formatCurrency(revenus.monthlyNetAverage)}
          </div>
          <div 
            className="text-[10px] uppercase tracking-wider mt-1"
            style={{ color: 'var(--text-muted)' }}
          >
            /month net
          </div>
        </div>
      </div>

      {/* Assets breakdown */}
      <div 
        className="text-[10px] uppercase tracking-[0.2em] font-medium mb-3 px-1"
        style={{ color: 'var(--text-tertiary)' }}
      >
        Asset Distribution
      </div>

      <div 
        className="rounded-2xl p-4 mb-5"
        style={{ 
          background: 'rgba(255, 255, 255, 0.6)',
          border: '1px solid var(--border-light)',
        }}
      >
        {/* Visual bar */}
        <div className="flex h-3 rounded-full overflow-hidden mb-4" style={{ background: 'rgba(0,0,0,0.03)' }}>
          {assets.map((asset, idx) => (
            <div
              key={asset.label}
              className="h-full transition-all duration-500"
              style={{
                width: `${asset.percentage}%`,
                background: asset.color,
              }}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="space-y-3">
          {assets.map((asset) => (
            <div key={asset.label} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${asset.color}15` }}
                >
                  <i 
                    className={`fa-solid ${asset.icon} text-xs`}
                    style={{ color: asset.color }}
                  />
                </div>
                <span style={{ color: 'var(--text-primary)' }}>{asset.label}</span>
              </div>
              <div className="text-right">
                <div 
                  className="font-medium"
                  style={{ color: asset.color }}
                >
                  {formatCurrency(asset.value)}
                </div>
                <div 
                  className="text-[10px]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {asset.percentage}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Liabilities */}
      <div 
        className="text-[10px] uppercase tracking-[0.2em] font-medium mb-3 px-1"
        style={{ color: 'var(--text-tertiary)' }}
      >
        Liabilities
      </div>

      <div 
        className="rounded-2xl p-4 mb-5"
        style={{ 
          background: 'rgba(212, 165, 165, 0.05)',
          border: '1px solid rgba(212, 165, 165, 0.1)',
        }}
      >
        {patrimoine.liabilities.map((liability, idx) => (
          <div 
            key={liability.id}
            className="flex items-center justify-between py-3"
            style={{ 
              borderBottom: idx < patrimoine.liabilities.length - 1 ? '1px solid var(--border-light)' : 'none',
            }}
          >
            <div>
              <div style={{ color: 'var(--text-primary)' }}>{liability.name}</div>
              <div 
                className="text-xs mt-0.5"
                style={{ color: 'var(--text-muted)' }}
              >
                {liability.interestRate}% • {formatCurrency(liability.monthlyPayment)}/month
              </div>
            </div>
            <div 
              className="font-medium"
              style={{ color: 'var(--accent-rose)' }}
            >
              -{formatCurrency(liability.remainingAmount)}
            </div>
          </div>
        ))}
      </div>

      {/* Revenue sources */}
      <div 
        className="text-[10px] uppercase tracking-[0.2em] font-medium mb-3 px-1"
        style={{ color: 'var(--text-tertiary)' }}
      >
        Income Sources
      </div>

      <div 
        className="rounded-2xl overflow-hidden"
        style={{ 
          background: 'rgba(255, 255, 255, 0.6)',
          border: '1px solid var(--border-light)',
        }}
      >
        {revenus.sources.map((source, idx) => (
          <div 
            key={source.name}
            className="flex items-center justify-between p-4"
            style={{ 
              borderBottom: idx < revenus.sources.length - 1 ? '1px solid var(--border-light)' : 'none',
            }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ background: source.isActive ? 'var(--accent-sage)' : 'var(--text-muted)' }}
              />
              <div>
                <div style={{ color: 'var(--text-primary)' }}>{source.name}</div>
                <div 
                  className="text-xs mt-0.5"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {source.type === 'salary' ? 'Salary' : 
                   source.type === 'freelance' ? 'Freelance' :
                   source.type === 'rental' ? 'Rental' :
                   source.type === 'investments' ? 'Investments' : 'Dividends'}
                </div>
              </div>
            </div>
            <div 
              className="font-medium"
              style={{ color: 'var(--accent-sage)' }}
            >
              +{formatCurrency(source.netAnnual)}/year
            </div>
          </div>
        ))}
      </div>
    </Modal>
  )
}
