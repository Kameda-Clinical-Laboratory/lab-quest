import { useQuery } from '@tanstack/react-query'
import { fetchCurriculum } from './curriculumApi'
import { backendMode } from './backendMode'

/**
 * スタッフ編集画面(Phase 4 コンテンツエディタ)用のカリキュラム取得フック。
 * get_curriculum(published_only=false) を叩き、下書き含む全stage/unit/beatを返す。
 * `UnitListPage`/`UnitEditor` の両方から共有される(同じqueryKeyで一度だけ取得)。
 */
export function useAdminCurriculum() {
  return useQuery({
    queryKey: ['curriculum', 'admin'],
    queryFn: () => fetchCurriculum(false),
    enabled: backendMode === 'supabase',
    staleTime: 30_000,
  })
}
