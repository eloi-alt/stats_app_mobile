// Harmony Calculator with Historical Data and Degressive Coefficients
// Coefficients: Friends (0.5) > National (0.3) > Worldwide (0.2)

import { ThomasMorel } from '@/data/mockData'

export interface HarmonyHistoryPoint {
  date: string
  value: number
  friendsAvg: number
  nationalAvg: number
  worldwideAvg: number
}

// Generate historical data (last 12 weeks)
export function generateHarmonyHistory(): HarmonyHistoryPoint[] {
  const history: HarmonyHistoryPoint[] = []
  const today = new Date()
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - (i * 7))
    
    // Base values with some variation
    const baseValue = 85
    const variation = (Math.random() - 0.5) * 10
    const value = Math.max(0, Math.min(100, baseValue + variation))
    
    // Friends average (closer to user, higher weight)
    const friendsAvg = value + (Math.random() - 0.5) * 8
    
    // National average (moderate difference)
    const nationalAvg = value + (Math.random() - 0.5) * 15
    
    // Worldwide average (more variation)
    const worldwideAvg = value + (Math.random() - 0.5) * 20
    
    history.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(value),
      friendsAvg: Math.round(Math.max(0, Math.min(100, friendsAvg))),
      nationalAvg: Math.round(Math.max(0, Math.min(100, nationalAvg))),
      worldwideAvg: Math.round(Math.max(0, Math.min(100, worldwideAvg))),
    })
  }
  
  return history
}

// Calculate Harmony score with degressive coefficients
export function calculateHarmonyScore(
  userScores: { [key: string]: number },
  friendsAvg: { [key: string]: number },
  nationalAvg: { [key: string]: number },
  worldwideAvg: { [key: string]: number }
): number {
  const modules = ['A', 'B', 'C', 'D', 'E']
  let totalWeightedScore = 0
  let totalWeight = 0
  
  modules.forEach((module) => {
    const userScore = userScores[module] || 0
    
    // Calculate weighted average with degressive coefficients
    // Friends (0.5) > National (0.3) > Worldwide (0.2)
    const friendsWeight = 0.5
    const nationalWeight = 0.3
    const worldwideWeight = 0.2
    
    const weightedAvg = 
      (friendsAvg[module] || userScore) * friendsWeight +
      (nationalAvg[module] || userScore) * nationalWeight +
      (worldwideAvg[module] || userScore) * worldwideWeight
    
    // Personal score gets 60% weight, weighted average gets 40%
    const personalWeight = 0.6
    const avgWeight = 0.4
    
    const moduleScore = userScore * personalWeight + weightedAvg * avgWeight
    
    totalWeightedScore += moduleScore
    totalWeight += 1
  })
  
  return Math.round(totalWeightedScore / totalWeight)
}

// Get current Harmony score
export function getCurrentHarmonyScore(): number {
  const userScores = {
    A: ThomasMorel.performance.byModule.A,
    B: ThomasMorel.performance.byModule.B,
    C: ThomasMorel.performance.byModule.C,
    D: ThomasMorel.performance.byModule.D,
    E: ThomasMorel.performance.byModule.E,
  }
  
  // Mock averages (in real app, these would come from API)
  const friendsAvg = {
    A: 88,
    B: 75,
    C: 72,
    D: 70,
    E: 65,
  }
  
  const nationalAvg = {
    A: 75,
    B: 65,
    C: 68,
    D: 60,
    E: 55,
  }
  
  const worldwideAvg = {
    A: 70,
    B: 60,
    C: 65,
    D: 55,
    E: 50,
  }
  
  return calculateHarmonyScore(userScores, friendsAvg, nationalAvg, worldwideAvg)
}

