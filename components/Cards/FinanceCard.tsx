'use client'

import { useLanguage } from '@/contexts/LanguageContext'

interface FinanceSource {
  name: string
  amount: number
  type: string
}

interface FinanceCardProps {
  flux: {
    totalNet: number
    monthly: number
    sources: FinanceSource[]
    savingsRate: number
  }
  stock: {
    netWorth: number
    totalAssets: number
    totalLiabilities: number
    liquidAssets: number
    realEstate: number
    financial: number
    vehicles: number
  }
  percentage: number
  onClick?: () => void
  isPinned?: boolean
  isHero?: boolean
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

const getTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    salary: 'fa-building',
    freelance: 'fa-laptop-code',
    investments: 'fa-chart-line',
    dividends: 'fa-coins',
    rental: 'fa-home',
  }
  return icons[type] || 'fa-money-bill'
}

export default function FinanceCard({ flux, stock, percentage, onClick, isPinned, isHero }: FinanceCardProps) {
  const { t } = useLanguage()

  const assetBreakdown = [
    { labelKey: 'realEstate', value: stock.realEstate, color: '#f59e0b', icon: 'fa-building' },
    { labelKey: 'financial', value: stock.financial, color: '#10b981', icon: 'fa-chart-pie' },
    { labelKey: 'vehicles', value: stock.vehicles, color: '#3b82f6', icon: 'fa-car' },
  ]

  const totalAssetsForChart = stock.realEstate + stock.financial + stock.vehicles

  if (isHero) {
    return (
      <div
        className="relative overflow-hidden cursor-pointer rounded-[32px] mb-4"
        onClick={onClick}
        style={{
          background: 'linear-gradient(135deg, rgba(30, 25, 15, 0.95) 0%, rgba(20, 18, 12, 0.98) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          boxShadow: '0 8px 40px rgba(245, 158, 11, 0.15), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        {/* Gradient background */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(ellipse at 20% 30%, rgba(245, 158, 11, 0.4) 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, rgba(16, 185, 129, 0.3) 0%, transparent 50%)',
          }}
        />

        {/* Pin indicator */}
        {isPinned && (
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            <span className="text-[9px] uppercase tracking-widest text-amber-400/80 font-bold">{t('pinned')}</span>
            <div className="w-6 h-6 rounded-full bg-amber-400/20 flex items-center justify-center">
              <i className="fa-solid fa-thumbtack text-amber-400 text-[10px]" />
            </div>
          </div>
        )}

        <div className="relative z-10 p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="text-3xl">💰</div>
            <div>
              <h2 className="text-xl font-bold text-white">{t('financeDimension')}</h2>
              <p className="text-sm text-amber-300/70">{t('patrimoine')}</p>
            </div>
          </div>

          {/* Main Stats - Flux vs Stock */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            {/* FLUX - Revenus */}
            <div
              className="p-4 rounded-2xl relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <i className="fa-solid fa-arrow-trend-up text-emerald-400 text-xs" />
                <span className="text-[10px] uppercase tracking-widest text-emerald-400/80 font-bold">Flux</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{formatCurrency(flux.monthly)}</div>
              <div className="text-[10px] text-gray-400">{t('perMonth')}</div>
              <div className="mt-2 pt-2 border-t border-emerald-500/20">
                <div className="text-[10px] text-emerald-400">{flux.savingsRate}% {t('savingsLabel')}</div>
              </div>
            </div>

            {/* STOCK - Patrimoine */}
            <div
              className="p-4 rounded-2xl relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <i className="fa-solid fa-vault text-amber-400 text-xs" />
                <span className="text-[10px] uppercase tracking-widest text-amber-400/80 font-bold">Stock</span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{formatCurrency(stock.netWorth)}</div>
              <div className="text-[10px] text-gray-400">{t('netPatrimony')}</div>
              <div className="mt-2 pt-2 border-t border-amber-500/20">
                <div className="text-[10px] text-amber-400">{formatCurrency(stock.liquidAssets)} {t('liquid')}</div>
              </div>
            </div>
          </div>

          {/* Asset breakdown */}
          <div className="mb-4">
            <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-3 font-bold">{t('assetBreakdown')}</div>
            <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-white/5">
              {assetBreakdown.map((asset, idx) => (
                <div
                  key={asset.labelKey}
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${(asset.value / totalAssetsForChart) * 100}%`,
                    background: asset.color,
                  }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {assetBreakdown.map((asset) => (
                <div key={asset.labelKey} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: asset.color }} />
                  <span className="text-[9px] text-gray-400">{t(asset.labelKey)}</span>
                  <span className="text-[9px] text-gray-500">{formatCurrency(asset.value)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue sources */}
          <div className="space-y-2">
            <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-bold">{t('incomeSources')}</div>
            {flux.sources.slice(0, 3).map((source) => (
              <div
                key={source.name}
                className="flex items-center justify-between px-3 py-2 rounded-xl"
                style={{ background: 'rgba(255, 255, 255, 0.03)' }}
              >
                <div className="flex items-center gap-2">
                  <i className={`fa-solid ${getTypeIcon(source.type)} text-emerald-400/60 text-xs`} />
                  <span className="text-xs text-gray-300">{source.name}</span>
                </div>
                <span className="text-xs font-semibold text-emerald-400">{formatCurrency(source.amount)}{t('perYear')}</span>
              </div>
            ))}
          </div>

          {/* Progress */}
          <div className="mt-5">
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full relative overflow-hidden"
                style={{
                  width: `${percentage}%`,
                  background: 'linear-gradient(90deg, #f59e0b, #10b981)',
                }}
              >
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  style={{ animation: 'shimmer 2s infinite' }}
                />
              </div>
            </div>
            <div className="flex justify-between text-[9px] text-gray-500 mt-1.5">
              <span>{t('score')}: {percentage}%</span>
              <span>{t('goalLabel')}: 1M€</span>
            </div>
          </div>
        </div>

        <i className="fa-solid fa-chevron-right absolute right-5 top-1/2 -translate-y-1/2 opacity-20 text-white text-lg" />

        <style jsx>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
        `}</style>
      </div>
    )
  }

  // Regular (non-hero) finance card
  return (
    <div
      className="glass cursor-pointer relative"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">💰</span>
          <div className="text-[11px] uppercase tracking-widest text-gray-400 font-bold">{t('financeDimension')}</div>
        </div>
        <span className="text-amber-400 font-bold">{percentage}%</span>
      </div>

      {/* Compact Flux vs Stock */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <i className="fa-solid fa-arrow-trend-up text-emerald-400 text-xs" />
          </div>
          <div>
            <div className="text-xs text-gray-400">Flux</div>
            <div className="text-sm font-bold text-white">{formatCurrency(flux.monthly)}/m</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <i className="fa-solid fa-vault text-amber-400 text-xs" />
          </div>
          <div>
            <div className="text-xs text-gray-400">Stock</div>
            <div className="text-sm font-bold text-white">{formatCurrency(stock.netWorth)}</div>
          </div>
        </div>
      </div>

      {/* Mini bar */}
      <div className="bar-bg">
        <div
          className="bar-fill"
          style={{ width: `${percentage}%`, background: 'linear-gradient(90deg, #f59e0b, #10b981)' }}
        />
      </div>

      <i className="fa-solid fa-chevron-right absolute right-5 top-1/2 -translate-y-1/2 opacity-30" />
    </div>
  )
}

