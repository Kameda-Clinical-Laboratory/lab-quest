import { Link } from 'react-router-dom'
import { getStage } from '@/mocks/data'
import {
  formatDateJa,
  getDayPlan,
  seriesProgressLabel,
  sortDates,
} from '@/mocks/schedule'
import { useAppState } from '@/context/AppState'
import type { Student } from '@/mocks/types'
import {
  IconBoss,
  IconCheck,
  IconFlag,
  IconFlask,
  IconShield,
  IconSwordQuest,
} from '@/components/QuestIcons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'

type DayNodeStatus = 'done' | 'today' | 'missed' | 'upcoming' | 'off'

function dayNodeStatus(student: Student, date: string, mockToday: string): DayNodeStatus {
  const plan = getDayPlan(student, date)
  const isOff = plan.seriesIds.length === 0
  const allClear =
    isOff || plan.seriesIds.every((id) => student.progress.clearedStageIds.includes(id))

  if (date === mockToday) {
    if (isOff) return 'off'
    return allClear ? 'done' : 'today'
  }
  if (date < mockToday) {
    if (isOff) return 'off'
    return allClear ? 'done' : 'missed'
  }
  return isOff ? 'off' : 'upcoming'
}

/** Evenly spaced points on a gentle arc across the compact banner map */
function pathPoints(count: number): { x: number; y: number }[] {
  if (count <= 0) return []
  if (count === 1) return [{ x: 50, y: 58 }]
  return Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1)
    const x = 8 + t * 84
    const y = 72 - Math.sin(t * Math.PI) * 22
    return { x, y }
  })
}

export function HomeMap() {
  const { currentStudent, todayQueue, mockToday, setMockToday, stages } = useAppState()
  if (!currentStudent || !todayQueue) return null

  const p = currentStudent.progress
  const reqTotal = stages.filter((s) => s.required).length
  const reqDone = p.clearedStageIds.filter((id) => getStage(stages, id)?.required).length
  const pct = reqTotal ? Math.round((reqDone / reqTotal) * 100) : 0
  const visitDates = sortDates(currentStudent.visitDates)
  const visitIndex =
    visitDates.indexOf(mockToday) >= 0 ? visitDates.indexOf(mockToday) + 1 : null
  const points = pathPoints(visitDates.length)

  return (
    <div className="space-y-5">
      <div className="quest-ticket overflow-hidden">
        <div className="quest-ticket-banner quest-ticket-banner-compact">
          <img src="/art/quest-map-bg.png" alt="" />
          <svg className="quest-path-overlay" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            {points.length > 1 && (
              <polyline
                className="quest-path-line"
                fill="none"
                points={points.map((pt) => `${pt.x},${pt.y}`).join(' ')}
              />
            )}
          </svg>
          <div className="quest-path-nodes">
            {visitDates.map((d, i) => {
              const pt = points[i] ?? { x: 50, y: 50 }
              const status = dayNodeStatus(currentStudent, d, mockToday)
              return (
                <button
                  key={d}
                  type="button"
                  className={`quest-path-node ${status} ${d === mockToday ? 'selected' : ''}`}
                  style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                  title={formatDateJa(d)}
                  onClick={() => setMockToday(d)}
                >
                  <span>{i + 1}</span>
                </button>
              )
            })}
          </div>
          <div className="quest-ticket-banner-ui">
            <div className="mb-0.5 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-amber-200">
              <IconSwordQuest className="h-3.5 w-3.5" />
              Today&apos;s Quest
            </div>
            <h2 className="font-display text-lg leading-tight text-emerald-50 sm:text-xl">
              {formatDateJa(mockToday)}
              {visitIndex ? ` / \u5b9f\u7fd2 ${visitIndex} \u65e5\u76ee` : ''}
            </h2>
            <p className="mt-0.5 max-w-xl text-[11px] leading-snug text-amber-50/85 sm:text-xs">
              {todayQueue.plan.note ||
                (todayQueue.isAppOffDay
                  ? '\u672c\u65e5\u306f\u30a2\u30d7\u30ea\u5b66\u7fd2\u306a\u3057\uff08\u898b\u5b66\u306a\u3069\uff09'
                  : '\u30de\u30b9\u3092\u9078\u3093\u3067\u65e5\u3092\u5207\u308a\u66ff\u3048\u3002\u8a08\u753b\u30b7\u30ea\u30fc\u30ba\u3092\u6d88\u5316\u3057\u3088\u3046')}
            </p>
          </div>
        </div>
      </div>

      {todayQueue.carryIds.length > 0 && (
        <div className="quest-alert">
          <IconFlag className="mt-0.5 h-6 w-6 shrink-0" />
          <div>
            <div className="font-display font-medium text-amber-100">{'\u7e70\u308a\u8d8a\u3057\u30af\u30a8\u30b9\u30c8\u767a\u751f'}</div>
            <div className="text-sm text-amber-100/90">
              {todayQueue.carryIds.map((id) => getStage(stages, id)?.title).join('\u3001')}
              {'\u3092\u5148\u306b\u30af\u30ea\u30a2\u3057\u3066\u304b\u3089\u3001\u672c\u65e5\u8a08\u753b\u3078\u9032\u307f\u307e\u3059\u3002'}
            </div>
          </div>
        </div>
      )}

      {todayQueue.isAppOffDay && (
        <div className="rounded-xl border-2 border-orange-400/40 bg-orange-950/30 px-4 py-3 text-orange-100">
          {'\u672c\u65e5\u306f\u30b7\u30ea\u30fc\u30ba\u5272\u5f53\u306a\u3057\u3002\u73fe\u5834\u898b\u5b66\u30fb\u5b9f\u7fd2\u306e\u65e5\u3067\u3059\u3002'}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.35fr_0.85fr]">
        <div className="map-board">
          <div className="map-board-body p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="flex items-center gap-2 font-display text-xl text-emerald-50">
                  <IconFlask className="h-6 w-6" />
                  {'\u5192\u967a\u30de\u30c3\u30d7 / \u4eca\u65e5\u306e\u30b7\u30ea\u30fc\u30ba'}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {'\u8a08\u753b'} {todayQueue.plan.seriesIds.length} {'\u672c'}
                  {todayQueue.carryIds.length > 0
                    ? ` \uff0b \u7e70\u308a\u8d8a\u3057 ${todayQueue.carryIds.length}`
                    : ''}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {todayQueue.queueIds.length === 0 && todayQueue.isVisitDay && !todayQueue.isAppOffDay && (
                <div className="rounded-lg border-2 border-emerald-500/40 bg-emerald-950/50 px-4 py-3 text-emerald-100">
                  {'\u672c\u65e5\u5206\u30af\u30ea\u30a2\uff01\u30b9\u30bf\u30f3\u30d7\u7372\u5f97\u6e08\u307f\u3067\u3059\u3002'}
                </div>
              )}

              {todayQueue.queueIds.map((id, i) => {
                const stage = getStage(stages, id)
                const carried = todayQueue.carryIds.includes(id)
                return (
                  <Link key={id} to={`/app/stage/${id}`} className={`map-node ${carried ? 'carry' : ''}`}>
                    <div className="map-node-badge">{i + 1}</div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-emerald-50">{stage?.title ?? id}</div>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {carried ? (
                          <Badge variant="quest" className="text-amber-100">
                            {'\u7e70\u308a\u8d8a\u3057'}
                          </Badge>
                        ) : (
                          <Badge variant="ok" className="text-emerald-100">
                            {'\u672c\u65e5\u8a08\u753b'}
                          </Badge>
                        )}
                        {stage?.hasProcedure && (
                          <Badge variant="secondary">{'\u624b\u6280\u30c1\u30a7\u30c3\u30af'}</Badge>
                        )}
                        <Badge variant="outline">{seriesProgressLabel(currentStudent, id, stages)}</Badge>
                      </div>
                    </div>
                    <span className="map-node-go" aria-hidden>
                      <IconSwordQuest className="h-6 w-6" />
                    </span>
                  </Link>
                )
              })}

              {todayQueue.plan.seriesIds
                .filter((id) => p.clearedStageIds.includes(id))
                .map((id) => (
                  <Link key={`done-${id}`} to={`/app/stage/${id}`} className="map-node done">
                    <div className="map-node-badge done">
                      <IconCheck className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{getStage(stages, id)?.title}</div>
                      <Badge variant="ok" className="mt-1 text-emerald-100">
                        {'\u30af\u30ea\u30a2\u6e08'}
                      </Badge>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <Card className="quest-frame border-0 bg-transparent">
            <CardHeader>
              <CardTitle className="text-lg text-emerald-50">{'\u5192\u967a\u306e\u9032\u6357'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">{'\u5fc5\u9808\u30b7\u30ea\u30fc\u30ba'}</span>
                  <span>
                    {reqDone} / {reqTotal}
                  </span>
                </div>
                <Progress value={pct} />
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="rounded-lg border-2 border-amber-500/30 bg-amber-950/20 p-3">
                  <div className="text-xs text-muted-foreground">XP</div>
                  <div className="font-display text-2xl text-amber-200">{p.xp}</div>
                </div>
                <div className="rounded-lg border-2 border-amber-500/30 bg-amber-950/20 p-3">
                  <div className="text-xs text-muted-foreground">{'\u30b9\u30bf\u30f3\u30d7'}</div>
                  <div className="font-display text-2xl text-amber-200">{p.stamps}</div>
                </div>
              </div>
              {(todayQueue.isFinalVisit || p.clearedStageIds.length > 0) && (
                <div className="space-y-2 pt-1">
                  {p.cbtSubmitted && !p.cbtRetakeAllowed ? (
                    <div className="boss-cta">
                      <img src="/art/quest-boss-seal.png" alt="" />
                      <Button asChild variant="secondary" className="flex-1">
                        <Link to="/app/cbt/result">{'\u30dc\u30b9\u6226\u7d50\u679c\u3092\u898b\u308b'}</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="boss-cta">
                      <img src="/art/quest-boss-seal.png" alt="" />
                      <div className="min-w-0 flex-1 space-y-1">
                        <Button asChild variant="quest" className="w-full">
                          <Link to="/app/cbt">
                            <IconBoss className="h-4 w-4" />
                            {'\u6700\u7d42\u78ba\u8a8d\u30c6\u30b9\u30c8\uff08\u30dc\u30b9\u6226\uff09'}
                          </Link>
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          {'\u30af\u30ea\u30a2\u6e08\u307f\u30b7\u30ea\u30fc\u30ba\u306e\u554f\u984c\u3060\u3051\u3067\u69cb\u6210\u3002\u5408\u5426\u306a\u3057\u30fb\u7d20\u70b9\u306e\u307f\u3002'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="quest-frame border-0 bg-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-emerald-50">
                <IconShield className="h-5 w-5" />
                {'\u5b9f\u7fd2\u30ab\u30ec\u30f3\u30c0\u30fc'}
              </CardTitle>
              <CardDescription>{'\u30af\u30a8\u30b9\u30c8\u63b2\u793a\u677f'}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {currentStudent.dayPlans.map((plan) => (
                  <li key={plan.date} className="flex gap-2 border-b border-border/50 pb-2 last:border-0">
                    <span className="w-24 shrink-0 text-foreground">{formatDateJa(plan.date)}</span>
                    <span>
                      {plan.seriesIds.length === 0
                        ? plan.note || '\u30a2\u30d7\u30ea\u306a\u3057'
                        : plan.seriesIds.map((id) => getStage(stages, id)?.title).join('\u3001')}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
