'use client'
import { motion, useInView } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Users, Briefcase, Globe, Heart, Clock, Shield, Star } from 'lucide-react'
import { useRef, useEffect, useState } from 'react'

/* ──────────────────────── Custom Counter Hook ──────────────────────── */

function useCountUp(target: number, duration: number = 2000, start: boolean = false) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!start) return
    let startTime: number | null = null
    let animationFrame: number

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) {
        animationFrame = requestAnimationFrame(step)
      } else {
        setCount(target)
      }
    }

    animationFrame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animationFrame)
  }, [target, duration, start])

  return count
}

/* ──────────────────────── Counter Card Component ──────────────────────── */

function CounterCard({
  icon: Icon,
  value,
  suffix,
  label,
  delay,
  inView,
}: {
  icon: React.ElementType
  value: number
  suffix: string
  label: string
  delay: number
  inView: boolean
}) {
  const count = useCountUp(value, 2200, inView)

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
    >
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white to-amber-50/50 dark:from-gray-900 dark:to-amber-950/20 shadow-lg hover:shadow-xl transition-shadow">
        <CardContent className="flex flex-col items-center gap-3 pt-6 pb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-md">
            <Icon className="h-7 w-7 text-white" />
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            {count.toLocaleString('fr-FR')}{suffix}
          </div>
          <div className="text-sm text-muted-foreground text-center font-medium">
            {label}
          </div>
        </CardContent>
        {/* Decorative corner */}
        <div className="absolute -top-6 -right-6 h-20 w-20 rounded-full bg-amber-500/10" />
      </Card>
    </motion.div>
  )
}

/* ──────────────────────── Bar Chart ──────────────────────── */

const monthlyData = [
  { month: 'Jan', value: 1200 },
  { month: 'Fév', value: 1800 },
  { month: 'Mar', value: 2400 },
  { month: 'Avr', value: 3100 },
  { month: 'Mai', value: 3800 },
  { month: 'Jun', value: 4500 },
  { month: 'Jul', value: 5200 },
  { month: 'Aoû', value: 6100 },
  { month: 'Sep', value: 7200 },
  { month: 'Oct', value: 8500 },
  { month: 'Nov', value: 9800 },
  { month: 'Déc', value: 11000 },
]

function BarChart({ inView }: { inView: boolean }) {
  const maxValue = Math.max(...monthlyData.map(d => d.value))

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-amber-50/30 dark:from-gray-900 dark:to-amber-950/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-amber-500" />
            Croissance mensuelle
          </CardTitle>
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
            +817% YTD
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-1.5 sm:gap-2 h-56">
          {monthlyData.map((item, index) => {
            const heightPercent = (item.value / maxValue) * 100
            return (
              <div key={item.month} className="flex-1 flex flex-col items-center gap-1.5">
                <motion.div
                  className="w-full rounded-t-md bg-gradient-to-t from-amber-600 to-orange-400 relative group cursor-pointer min-w-0"
                  initial={{ height: 0 }}
                  whileInView={{ height: `${heightPercent}%` }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.8,
                    delay: inView ? index * 0.06 : 0,
                    ease: 'easeOut',
                  }}
                  style={{ maxHeight: '100%' }}
                >
                  {/* Tooltip on hover */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {item.value.toLocaleString('fr-FR')}
                  </div>
                </motion.div>
                <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                  {item.month}
                </span>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

/* ──────────────────────── Donut Chart ──────────────────────── */

const categoryData = [
  { name: 'Plomberie', value: 25, color: '#f59e0b' },     // amber-500
  { name: 'Électricité', value: 22, color: '#10b981' },    // emerald-500
  { name: 'Menuiserie', value: 18, color: '#f97316' },     // orange-500
  { name: 'Peinture', value: 15, color: '#14b8a6' },       // teal-500
  { name: 'Climatisation', value: 12, color: '#06b6d4' },  // cyan-500
  { name: 'Nettoyage', value: 8, color: '#8b5cf6' },       // violet-500
]

function DonutChart({ inView }: { inView: boolean }) {
  const radius = 60
  const circumference = 2 * Math.PI * radius

  // Precompute segment data to avoid mutating variables during render
  const segments = categoryData.reduce<
    Array<{ name: string; value: number; color: string; segmentLength: number; offset: number }>
  >((acc, item, index) => {
    const segmentLength = (item.value / 100) * circumference
    const offset = index === 0 ? 0 : acc[index - 1].offset + acc[index - 1].segmentLength
    acc.push({ name: item.name, value: item.value, color: item.color, segmentLength, offset })
    return acc
  }, [])

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-amber-50/30 dark:from-gray-900 dark:to-amber-950/10">
      <CardHeader>
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Heart className="h-5 w-5 text-amber-500" />
          Répartition par catégorie
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* SVG Donut */}
          <div className="relative flex-shrink-0">
            <svg width="160" height="160" viewBox="0 0 160 160" className="-rotate-90">
              {segments.map((seg, index) => (
                <motion.circle
                  key={seg.name}
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="20"
                  strokeDasharray={`${seg.segmentLength} ${circumference - seg.segmentLength}`}
                  strokeDashoffset={-seg.offset}
                  strokeLinecap="butt"
                  initial={{ opacity: 0, strokeDasharray: `0 ${circumference}` }}
                  whileInView={{ opacity: 1, strokeDasharray: `${seg.segmentLength} ${circumference - seg.segmentLength}` }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 1,
                    delay: inView ? index * 0.15 : 0,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                6
              </span>
              <span className="text-xs text-muted-foreground font-medium">Catégories</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-2.5 w-full">
            {categoryData.map((item, index) => (
              <motion.div
                key={item.name}
                className="flex items-center justify-between gap-3"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: inView ? index * 0.1 : 0 }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-foreground font-medium">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-muted-foreground">{item.value}%</span>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* ──────────────────────── Line Chart ──────────────────────── */

const satisfactionData = [
  { year: '2020', value: 89 },
  { year: '2021', value: 91 },
  { year: '2022', value: 94 },
  { year: '2023', value: 96 },
  { year: '2024', value: 98 },
]

function LineChart({ inView }: { inView: boolean }) {
  const chartWidth = 500
  const chartHeight = 200
  const padding = { top: 20, right: 20, bottom: 40, left: 50 }
  const innerWidth = chartWidth - padding.left - padding.right
  const innerHeight = chartHeight - padding.top - padding.bottom

  const minValue = 85
  const maxValue = 100
  const valueRange = maxValue - minValue

  // Compute points
  const points = satisfactionData.map((item, i) => {
    const x = padding.left + (i / (satisfactionData.length - 1)) * innerWidth
    const y = padding.top + innerHeight - ((item.value - minValue) / valueRange) * innerHeight
    return { ...item, x, y }
  })

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ')

  // Area under line
  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + innerHeight} L ${points[0].x} ${padding.top + innerHeight} Z`

  // Y-axis grid lines
  const yTicks = [86, 90, 94, 98]

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-amber-50/30 dark:from-gray-900 dark:to-amber-950/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500" />
            Évolution de la satisfaction
          </CardTitle>
          <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0">
            +9 pts
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Grid lines */}
            {yTicks.map((tick) => {
              const y = padding.top + innerHeight - ((tick - minValue) / valueRange) * innerHeight
              return (
                <g key={tick}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={padding.left + innerWidth}
                    y2={y}
                    stroke="currentColor"
                    strokeOpacity={0.1}
                    strokeDasharray="4 4"
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 4}
                    textAnchor="end"
                    className="fill-muted-foreground text-[11px]"
                  >
                    {tick}%
                  </text>
                </g>
              )
            })}

            {/* X axis labels */}
            {points.map((p) => (
              <text
                key={p.year}
                x={p.x}
                y={chartHeight - 8}
                textAnchor="middle"
                className="fill-muted-foreground text-[11px]"
              >
                {p.year}
              </text>
            ))}

            {/* Area fill */}
            <motion.path
              d={areaD}
              fill="url(#areaGradient)"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: inView ? 0.5 : 0 }}
            />

            {/* Line */}
            <motion.path
              d={pathD}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: 'easeInOut', delay: inView ? 0.2 : 0 }}
            />

            {/* Gradient definitions */}
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#f97316" />
              </linearGradient>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#f97316" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            {/* Data points */}
            {points.map((p, index) => (
              <motion.circle
                key={p.year}
                cx={p.x}
                cy={p.y}
                r="5"
                fill="white"
                stroke="#f59e0b"
                strokeWidth="2.5"
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.4,
                  delay: inView ? 0.4 + index * 0.15 : 0,
                  type: 'spring',
                  stiffness: 300,
                }}
              />
            ))}

            {/* Value labels */}
            {points.map((p, index) => (
              <motion.text
                key={`label-${p.year}`}
                x={p.x}
                y={p.y - 14}
                textAnchor="middle"
                className="fill-amber-600 text-[11px] font-bold"
                initial={{ opacity: 0, y: p.y }}
                whileInView={{ opacity: 1, y: p.y - 14 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.4,
                  delay: inView ? 0.6 + index * 0.15 : 0,
                }}
              >
                {p.value}%
              </motion.text>
            ))}
          </svg>
        </div>
      </CardContent>
    </Card>
  )
}

/* ──────────────────────── Comparison Cards ──────────────────────── */

const comparisonData = [
  {
    icon: Clock,
    title: 'Temps de réponse moyen',
    value: '15 min',
    versus: '48h traditionnel',
    color: 'from-amber-500 to-orange-500',
    bgColor: 'from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20',
  },
  {
    icon: TrendingUp,
    title: 'Économie moyenne',
    value: '30%',
    versus: 'vs prix marché',
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20',
  },
  {
    icon: Shield,
    title: 'Taux de réussite',
    value: '98%',
    versus: '72% traditionnel',
    color: 'from-cyan-500 to-blue-500',
    bgColor: 'from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20',
  },
  {
    icon: Star,
    title: 'Artisans vérifiés',
    value: '100%',
    versus: '0% vérification',
    color: 'from-orange-500 to-red-500',
    bgColor: 'from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20',
  },
]

function ComparisonCards({ inView }: { inView: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-amber-50/30 dark:from-gray-900 dark:to-amber-950/10 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-500" />
            Pourquoi choisir Artisan Connecté
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {comparisonData.map((item, index) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: inView ? index * 0.1 : 0 }}
                  className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${item.bgColor} p-5 border border-white/50 dark:border-gray-800/50`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} shadow-md`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-muted-foreground font-medium mb-1">
                        {item.title}
                      </div>
                      <div className="text-2xl font-extrabold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                        {item.value}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-400" />
                        {item.versus}
                      </div>
                    </div>
                  </div>
                  {/* Decorative circle */}
                  <div className="absolute -bottom-4 -right-4 h-16 w-16 rounded-full bg-gradient-to-br from-amber-500/10 to-orange-500/10" />
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

/* ──────────────────────── Main Component ──────────────────────── */

export function AnimatedStats() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' })

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-16 sm:py-20 px-4 sm:px-6 lg:px-8"
    >
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-50/60 via-orange-50/30 to-transparent dark:from-amber-950/20 dark:via-orange-950/10 dark:to-transparent -z-10" />
      {/* Decorative blobs */}
      <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl -z-10" />
      <div className="absolute bottom-20 right-10 h-72 w-72 rounded-full bg-orange-400/10 blur-3xl -z-10" />

      <div className="mx-auto max-w-7xl space-y-12">
        {/* Section header */}
        <motion.div
          className="text-center space-y-3"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 px-4 py-1 text-sm">
            Nos chiffres parlent
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 bg-clip-text text-transparent">
            Artisan Connecté en chiffres
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg">
            Une plateforme en croissance exponentielle qui transforme la manière dont les artisans et les clients se rencontrent en Afrique de l&apos;Ouest.
          </p>
        </motion.div>

        {/* Animated counters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <CounterCard
            icon={Users}
            value={10000}
            suffix="+"
            label="Artisans vérifiés"
            delay={0.1}
            inView={isInView}
          />
          <CounterCard
            icon={Briefcase}
            value={50000}
            suffix="+"
            label="Missions réalisées"
            delay={0.2}
            inView={isInView}
          />
          <CounterCard
            icon={Globe}
            value={15}
            suffix="+"
            label="Pays couverts"
            delay={0.3}
            inView={isInView}
          />
          <CounterCard
            icon={Heart}
            value={98}
            suffix="%"
            label="Taux de satisfaction"
            delay={0.4}
            inView={isInView}
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BarChart inView={isInView} />
          <DonutChart inView={isInView} />
        </div>

        {/* Line chart - full width */}
        <LineChart inView={isInView} />

        {/* Comparison cards */}
        <ComparisonCards inView={isInView} />
      </div>
    </section>
  )
}
