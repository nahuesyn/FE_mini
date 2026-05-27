import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/*
 * =============================================
 * Supabase 테이블 구조 (참고용)
 * =============================================
 *
 * projects
 *   - id          uuid, primary key
 *   - title       text
 *   - description text
 *   - thumbnail   text (url)
 *   - tech_stack  text[] (배열)
 *   - links       jsonb { github, live, ... }
 *   - status      text ('done' | 'wip' | 'idea')
 *   - is_public   boolean
 *   - order       int
 *
 * posts
 *   - id          uuid, primary key
 *   - title       text
 *   - content     text
 *   - category    text
 *   - tags        text[]
 *   - is_public   boolean
 *   - created_at  timestamp
 *
 * garden_flowers
 *   - id          uuid, primary key
 *   - nickname    text
 *   - message     text
 *   - position_x  float
 *   - position_y  float
 *   - flower_type text
 *   - created_at  timestamp
 *
 * study_sessions
 *   - id          uuid, primary key
 *   - started_at  timestamp
 *   - ended_at    timestamp
 *   - duration    int (분 단위)
 *   - tag         text
 *   - memo        text
 *
 * todos
 *   - id          uuid, primary key
 *   - title       text
 *   - is_done     boolean
 *   - created_at  timestamp
 * =============================================
 */
