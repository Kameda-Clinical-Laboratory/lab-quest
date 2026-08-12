import { supabase } from './supabaseClient'
import type { Stage } from '../mocks/types'

/**
 * カリキュラム(stages→units→beats、clues、procedure_steps)をSupabaseの
 * get_curriculum RPC から取得する。
 *
 * publishedOnly=true  : 学生ランタイム用。非公開のstage/unitは木から除外される
 *                        (isStageCleared/isUnitCleared にそのまま渡せば
 *                        「非公開ユニットは存在しない」が自動的に成立する)
 * publishedOnly=false : スタッフ編集画面用。全件(下書き含む)を返す(Phase 4で使用)
 */
export async function fetchCurriculum(publishedOnly: boolean): Promise<Stage[]> {
  const { data, error } = await supabase.rpc('get_curriculum', { published_only: publishedOnly })
  if (error) throw new Error(`get_curriculum failed: ${error.message}`)
  return (data ?? []) as Stage[]
}
