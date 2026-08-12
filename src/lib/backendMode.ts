/**
 * Phase 1で導入したバックエンド切り替えフラグ。
 * 'mock'     = 従来どおり src/mocks/data.ts の静的データ・インメモリ状態を使う(既定値)
 * 'supabase' = カリキュラム(stages/units/beats)をSupabase(get_curriculum RPC)から取得する
 *
 * 学生/進捗/認証は Phase 2・3 で切り替えるまで、このフラグの値に関わらずモックのまま。
 */
export const backendMode: 'mock' | 'supabase' = import.meta.env.VITE_BACKEND_MODE ?? 'mock'
