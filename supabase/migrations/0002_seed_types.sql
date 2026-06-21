-- ============================================================
-- 0002_seed_types.sql  ※自動生成。手で編集せず src/data/types.json を更新して再生成すること。
-- 仕様書 section 6「毒舌タイプ初期セット」。最初はこの5つで開始。
-- 制約: ディスの対象は架空のタイプのみ。実在の職業・企業はディスらない。
--       "MBTI" 等の公式名称は使わず独自タイプ名のみ（仕様書 section 10）。
-- ============================================================

insert into types (code, display_name, roast, love_followup, worst_match, worst_match_line, emoji_or_icon)
values
  ('loud_sales', '声のデカさとノリだけで内定勝ち取った人', 'スペックより勢い。会議は元気だが議事録は白紙。飲みの席だけ評価がうなぎ登り。', 'でもその瞬発力、現場では最強。人を巻き込んで数字を動かせるのはあなただけ。', 'comm_disorder_tech', '「PCと喋る方が落ち着く民」とは永遠に分かり合えません。', '🍻'),
  ('comm_disorder_tech', 'コミュ障を技術力でカバーするしかない奴', '雑談は地獄、仕様書は天国。人と話すより回路と話す方が早いと本気で思っている。', 'でもその一点突破力、世界を裏で動かしてる。語らずとも結果が喋る。', 'loud_sales', '「とりあえず飲みに行こ！」の民とは住む世界が違います。', '🔬'),
  ('money_machine', '命を削って札束を刷るマシーン', '時給換算は禁止カード。年収は高いが心拍数も高い。休みの定義を忘れた高機能アンドロイド。', 'でもその覚悟、本物。リターンを取りに行ける胆力は誰にでも持てるものじゃない。', 'clock_out_ghost', '「定時で消える霊」とは人生のコスパ観が噛み合いません。', '💴'),
  ('clock_out_ghost', 'コスパ極めた定時退散かつ霊', '18時に存在が消える。残業の気配を察知して退避する能力だけは天才的。波風立てず生き残る。', 'でもその安定感、組織の生命線。長く回り続ける仕組みはあなたみたいな人が支えてる。', 'money_machine', '「命削って札束刷るマシーン」とは休日の過ごし方で確実に揉めます。', '🕰️'),
  ('world_class_hidden', '世界が知らんとこで世界一握ってる人', '名刺を出しても「何の会社？」と聞き返される。でも我が社の部品が無いと世界が止まる。黒子の帝王。', 'でもその静かな世界一、最強に渋い。派手さより本質を選べる目を持ってる。', 'loud_sales', '「目立ってナンボ」の民とは、評価されたいベクトルが真逆です。', '🌏')
on conflict (code) do update set
  display_name     = excluded.display_name,
  roast            = excluded.roast,
  love_followup    = excluded.love_followup,
  worst_match      = excluded.worst_match,
  worst_match_line = excluded.worst_match_line,
  emoji_or_icon    = excluded.emoji_or_icon;
