import { Link } from 'react-router-dom'
import { getStage } from '@/mocks/data'
import { formatDateJa, seriesProgressLabel } from '@/mocks/schedule'
import { useAppState } from '@/context/AppState'
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
      <div className="quest-ticket overflow-hidden">
        <div className="quest-ticket-banner">
          <img src="/art/quest-map-vignette.png" alt="" />
          <div className="absolute inset-x-0 bottom-0 z-[1] flex flex-wrap items-end justify-between gap-4 p-5">
            <div>
              <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-amber-200">
                <IconSwordQuest className="h-4 w-4" />
                Today&apos;s Quest
              </div>
              <h2 className="font-display text-2xl text-emerald-50">
                {formatDateJa(mockToday)}
                {visitIndex ? ` / 実習 ${visitIndex} 日目` : ''}
              </h2>
              <p className="mt-1 text-sm text-amber-50/80">
                {todayQueue.plan.note ||
                  (todayQueue.isAppOffDay
                    ? '本日はアプリ学習なし（見学など）'
                    : '計画シリーズと繰り越しを消化しよう')}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {sortUnique(currentStudent.visitDates).map((d) => (
                <Button
                  key={d}
                  size="sm"
                  variant={d === mockToday ? 'quest' : 'outline'}
                  onClick={() => setMockToday(d)}
                >
                  {formatDateJa(d)}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {todayQueue.carryIds.length > 0 && (
        <div className="quest-alert">
          <IconFlag className="mt-0.5 h-6 w-6 shrink-0" />
          <div>
            <div className="font-display font-medium text-amber-100">繰り越しクエスト発生</div>
            <div className="text-sm text-amber-100/90">
              {todayQueue.carryIds.map((id) => getStage(id)?.title).join('、')}
              を先にクリアしてから、本日計画へ進みます。
            </div>
          </div>
        </div>
      )}

      {todayQueue.isAppOffDay && (
        <div className="rounded-xl border-2 border-orange-400/40 bg-orange-950/30 px-4 py-3 text-orange-100">
          本日はシリーズ割当なし。現場見学・実習の日です。
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.35fr_0.85fr]">
        <div className="map-board">
          <div className="map-board-art">
            <img src="/art/quest-map-vignette.png" alt="" />
          </div>
          <div className="map-board-body p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="flex items-center gap-2 font-display text-xl text-emerald-50">
                  <IconFlask className="h-6 w-6" />
                  冒険マップ / 今日のシリーズ
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  計画 {todayQueue.plan.seriesIds.length} 本
                  {todayQueue.carryIds.length > 0 ? ` ＋ 繰り越し ${todayQueue.carryIds.length}` : ''}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {todayQueue.queueIds.length === 0 && todayQueue.isVisitDay && !todayQueue.isAppOffDay && (
                <div className="rounded-lg border-2 border-emerald-500/40 bg-emerald-950/50 px-4 py-3 text-emerald-100">
                  本日分クリア！スタンプ獲得済みです。
                </div>
              )}

              {todayQueue.queueIds.map((id, i) => {
                const stage = getStage(id)
                const carried = todayQueue.carryIds.includes(id)
                return (
                  <Link key={id} to={`/app/stage/${id}`} className={`map-node ${carried ? 'carry' : ''}`}>
                    <div className="map-node-badge">{i + 1}</div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-emerald-50">{stage?.title ?? id}</div>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {carried ? (
                          <Badge variant="quest" className="text-amber-100">
                            繰り越し
                          </Badge>
                        ) : (
                          <Badge variant="ok" className="text-emerald-100">
                            本日計画
                          </Badge>
                        )}
                        {stage?.hasProcedure && (
                          <Badge variant="secondary">手技チェック</Badge>
                        )}
                        <Badge variant="outline">{seriesProgressLabel(currentStudent, id)}</Badge>
                      </div>
                    </div>
                    <IconSwordQuest className="h-5 w-5 opacity-80" />
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
                      <div className="font-medium">{getStage(id)?.title}</div>
                      <Badge variant="ok" className="mt-1 text-emerald-100">
                        クリア済
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
              <CardTitle className="text-lg text-emerald-50">冒険の進捗</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">必須シリーズ</span>
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
                  <div className="text-xs text-muted-foreground">スタンプ</div>
                  <div className="font-display text-2xl text-amber-200">{p.stamps}</div>
                </div>
              </div>
              {(todayQueue.isFinalVisit || p.clearedStageIds.length > 0) && (
                <div className="space-y-2 pt-1">
                  {p.cbtSubmitted && !p.cbtRetakeAllowed ? (
                    <div className="boss-cta">
                      <img src="/art/quest-boss-seal.png" alt="" />
                      <Button asChild variant="secondary" className="flex-1">
                        <Link to="/app/cbt/result">ボス戦結果を見る</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="boss-cta">
                      <img src="/art/quest-boss-seal.png" alt="" />
                      <div className="min-w-0 flex-1 space-y-1">
                        <Button asChild variant="quest" className="w-full">
                          <Link to="/app/cbt">
                            <IconBoss className="h-4 w-4" />
                            最終確認テスト（ボス戦）
                          </Link>
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          クリア済みシリーズの問題だけで構成。合否なし・素点のみ。
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
                実習カレンダー
              </CardTitle>
              <CardDescription>クエスト掲示板</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {currentStudent.dayPlans.map((plan) => (
                  <li key={plan.date} className="flex gap-2 border-b border-border/50 pb-2 last:border-0">
                    <span className="w-24 shrink-0 text-foreground">{formatDateJa(plan.date)}</span>
                    <span>
                      {plan.seriesIds.length === 0
                        ? plan.note || 'アプリなし'
                        : plan.seriesIds.map((id) => getStage(id)?.title).join('、')}
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
