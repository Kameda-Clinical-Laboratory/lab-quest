# -*- coding: utf-8 -*-
from pathlib import Path

text = """import { Link } from 'react-router-dom'
import { ArrowRight, Flag, FlaskConical, Shield, Swords } from 'lucide-react'
import { getStage } from '@/mocks/data'
import { formatDateJa, seriesProgressLabel } from '@/mocks/schedule'
import { useAppState } from '@/context/AppState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'

export function HomeMap() {
  const { currentStudent, todayQueue, mockToday, setMockToday, stages } = useAppState()
  if (!currentStudent || !todayQueue) return null

  const p = currentStudent.progress
  const reqTotal = stages.filter((s) => s.required).length
  const reqDone = p.clearedStageIds.filter((id) => getStage(id)?.required).length
  const pct = reqTotal ? Math.round((reqDone / reqTotal) * 100) : 0
  const visitIndex =
    currentStudent.visitDates.indexOf(mockToday) >= 0
      ? currentStudent.visitDates.indexOf(mockToday) + 1
      : null

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden border-primary/25 bg-gradient-to-br from-card via-card to-teal-950/40">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary">
              <Swords className="h-3.5 w-3.5" />
              Today&apos;s Quest
            </div>
            <h2 className="font-display text-2xl text-emerald-50">
              {formatDateJa(mockToday)}
              {visitIndex ? ` \\u00b7 \\u6765\\u9662 ${visitIndex} \\u65e5\\u76ee` : ''}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {todayQueue.plan.note ||
                (todayQueue.isAppOffDay
                  ? '\\u672c\\u65e5\\u306f\\u30a2\\u30d7\\u30ea\\u5b66\\u7fd2\\u306a\\u3057\\uff08\\u898b\\u5b66\\u306a\\u3069\\uff09'
                  : '\\u8a08\\u753b\\u30b7\\u30ea\\u30fc\\u30ba\\u3068\\u7e70\\u308a\\u8d8a\\u3057\\u3092\\u6d88\\u5316\\u3057\\u3088\\u3046')}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {sortUnique(currentStudent.visitDates).map((d) => (
              <Button
                key={d}
                size="sm"
                variant={d === mockToday ? 'default' : 'outline'}
                onClick={() => setMockToday(d)}
              >
                {formatDateJa(d)}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {todayQueue.carryIds.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-950/40 px-4 py-3 text-amber-100">
          <Flag className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <div className="font-medium">\\u7e70\\u308a\\u8d8a\\u3057\\u30af\\u30a8\\u30b9\\u30c8\\u767a\\u751f</div>
            <div className="text-sm opacity-90">
              {todayQueue.carryIds.map((id) => getStage(id)?.title).join('\\u3001')}
              \\u3092\\u5148\\u306b\\u30af\\u30ea\\u30a2\\u3057\\u3066\\u304b\\u3089\\u3001\\u672c\\u65e5\\u8a08\\u753b\\u3078\\u9032\\u307f\\u307e\\u3059\\u3002
            </div>
          </div>
        </div>
      )}

      {todayQueue.isAppOffDay && (
        <div className="rounded-xl border border-orange-400/40 bg-orange-950/30 px-4 py-3 text-orange-100">
          \\u672c\\u65e5\\u306f\\u30b7\\u30ea\\u30fc\\u30ba\\u5272\\u5f53\\u306a\\u3057\\u3002\\u73fe\\u5834\\u898b\\u5b66\\u30fb\\u5b9f\\u7fd2\\u306e\\u65e5\\u3067\\u3059\\u3002
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.35fr_0.85fr]">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-50">
              <FlaskConical className="h-5 w-5 text-primary" />
              \\u5192\\u967a\\u30de\\u30c3\\u30d7 \\u00b7 \\u4eca\\u65e5\\u306e\\u30b7\\u30ea\\u30fc\\u30ba
            </CardTitle>
            <CardDescription>
              \\u8a08\\u753b {todayQueue.plan.seriesIds.length} \\u672c
              {todayQueue.carryIds.length > 0 ? ` \\uff0b \\u7e70\\u308a\\u8d8a\\u3057 ${todayQueue.carryIds.length}` : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayQueue.queueIds.length === 0 && todayQueue.isVisitDay && !todayQueue.isAppOffDay && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-4 py-3 text-emerald-100">
                \\u672c\\u65e5\\u5206\\u30af\\u30ea\\u30a2\\uff01\\u30b9\\u30bf\\u30f3\\u30d7\\u7372\\u5f97\\u6e08\\u307f\\u3067\\u3059\\u3002
              </div>
            )}

            {todayQueue.queueIds.map((id, i) => {
              const stage = getStage(id)
              const carried = todayQueue.carryIds.includes(id)
              return (
                <Link key={id} to={`/app/stage/${id}`} className={`map-node ${carried ? 'carry' : ''}`}>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/20 font-display text-lg text-primary">
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-emerald-50">{stage?.title ?? id}</div>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {carried ? <Badge variant="quest">\\u7e70\\u308a\\u8d8a\\u3057</Badge> : <Badge variant="ok">\\u672c\\u65e5\\u8a08\\u753b</Badge>}
                      {stage?.hasProcedure && <Badge variant="secondary">\\u624b\\u6280\\u30c1\\u30a7\\u30c3\\u30af</Badge>}
                      <Badge variant="outline">{seriesProgressLabel(currentStudent, id)}</Badge>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              )
            })}

            {todayQueue.plan.seriesIds
              .filter((id) => p.clearedStageIds.includes(id))
              .map((id) => (
                <Link key={`done-${id}`} to={`/app/stage/${id}`} className="map-node done">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600/30 text-emerald-300">
                    OK
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{getStage(id)?.title}</div>
                    <Badge variant="ok" className="mt-1">
                      \\u30af\\u30ea\\u30a2\\u6e08
                    </Badge>
                  </div>
                </Link>
              ))}
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-emerald-50">\\u5192\\u967a\\u306e\\u9032\\u6367</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">\\u5fc5\\u9808\\u30b7\\u30ea\\u30fc\\u30ba</span>
                  <span>
                    {reqDone} / {reqTotal}
                  </span>
                </div>
                <Progress value={pct} />
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="rounded-lg border border-border bg-secondary/40 p-3">
                  <div className="text-xs text-muted-foreground">XP</div>
                  <div className="font-display text-2xl text-amber-200">{p.xp}</div>
                </div>
                <div className="rounded-lg border border-border bg-secondary/40 p-3">
                  <div className="text-xs text-muted-foreground">\\u30b9\\u30bf\\u30f3\\u30d7</div>
                  <div className="font-display text-2xl text-amber-200">{p.stamps}</div>
                </div>
              </div>
              {(todayQueue.isFinalVisit || p.clearedStageIds.length > 0) && (
                <div className="space-y-2 pt-1">
                  {p.cbtSubmitted && !p.cbtRetakeAllowed ? (
                    <Button asChild variant="secondary" className="w-full">
                      <Link to="/app/cbt/result">\\u30dc\\u30b9\\u6226\\u7d50\\u679c\\u3092\\u898b\\u308b</Link>
                    </Button>
                  ) : (
                    <Button asChild variant="quest" className="w-full">
                      <Link to="/app/cbt">\\u6700\\u7d42\\u78ba\\u8a8d\\u30c6\\u30b9\\u30c8\\uff08\\u30dc\\u30b9\\u6226\\uff09</Link>
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground">
                    \\u30af\\u30ea\\u30a2\\u6e08\\u307f\\u30b7\\u30ea\\u30fc\\u30ba\\u306e\\u554f\\u984c\\u3060\\u3051\\u3067\\u69cb\\u6210\\u3002\\u5408\\u5426\\u306a\\u3057\\u30fb\\u7d20\\u70b9\\u306e\\u307f\\u3002
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-emerald-50">
                <Shield className="h-4 w-4 text-primary" />
                \\u6765\\u9662\\u30ab\\u30ec\\u30f3\\u30c0\\u30fc
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {currentStudent.dayPlans.map((plan) => (
                  <li key={plan.date} className="flex gap-2 border-b border-border/50 pb-2 last:border-0">
                    <span className="w-24 shrink-0 text-foreground">{formatDateJa(plan.date)}</span>
                    <span>
                      {plan.seriesIds.length === 0
                        ? plan.note || '\\u30a2\\u30d7\\u30ea\\u306a\\u3057'
                        : plan.seriesIds.map((id) => getStage(id)?.title).join('\\u3001')}
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

function sortUnique(dates: string[]) {
  return [...dates].sort()
}
"""

# Decode unicode escapes that we double-escaped for the Python source
out = text.encode('utf-8').decode('unicode_escape')
# Fix: unicode_escape will break the file's actual backslash sequences in JS.
# Better approach: write utf-8 Japanese directly in this file.
raise SystemExit('use direct method')
