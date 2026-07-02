-- ============================================================
-- 0003_seed_companies.sql  ※自動生成。手で編集せず companies.json を更新して再生成すること。
-- グローバルニッチトップ100選ベースの初期20社（仕様書 section 5 第1層）。
-- status は approved 投入（初期投入分は出典確認済み扱い）。source_origin = 'gnt100'。
-- ============================================================

with ins as (
  insert into companies
    (name, familiar_hook, share_highlight, share_source, avg_salary, salary_source,
     one_liner, product_field, visibility, scale_type, is_listed, location_type,
     status, source_origin, approved_at)
  values
    ('レーザーテック', 'あなたのスマホの頭脳（半導体）を作る、最先端工場のさらに裏方', 'EUV用フォトマスク欠陥検査装置で世界シェアほぼ100%', 'https://www.lasertec.co.jp/', 1681, 'https://www.nikkei.com/nkd/company/salary/?scode=6920', '世界の最先端半導体は、この会社の検査を通らないと出荷できない', 'electronics', 'product', 'niche_top', true, 'urban', 'approved', 'gnt100', now())
  on conflict do nothing
  returning id
)
insert into company_tags (company_id, type_code, weight)
select ins.id, t.type_code, t.weight
from ins
cross join (values
  ('money_machine', 3),
  ('comm_disorder_tech', 2),
  ('world_class_hidden', 2)
) as t(type_code, weight)
on conflict (company_id, type_code) do nothing;

with ins as (
  insert into companies
    (name, familiar_hook, share_highlight, share_source, avg_salary, salary_source,
     one_liner, product_field, visibility, scale_type, is_listed, location_type,
     status, source_origin, approved_at)
  values
    ('ディスコ', 'スマホの中のチップ、その「切る・削る・磨く」をほぼ全部担当', '半導体精密加工装置（ダイサー・グラインダ）で世界シェア7〜8割', 'https://www.disco.co.jp/', 1671, 'https://www.nikkei.com/nkd/company/salary/?scode=6146', '稼ぐ力も給与もエグい、半導体の裏方ガチ勢', 'electronics', 'product', 'niche_top', true, 'urban', 'approved', 'gnt100', now())
  on conflict do nothing
  returning id
)
insert into company_tags (company_id, type_code, weight)
select ins.id, t.type_code, t.weight
from ins
cross join (values
  ('money_machine', 3),
  ('world_class_hidden', 2),
  ('comm_disorder_tech', 1)
) as t(type_code, weight)
on conflict (company_id, type_code) do nothing;

with ins as (
  insert into companies
    (name, familiar_hook, share_highlight, share_source, avg_salary, salary_source,
     one_liner, product_field, visibility, scale_type, is_listed, location_type,
     status, source_origin, approved_at)
  values
    ('浜松ホトニクス', 'ノーベル賞のカミオカンデの「目」を作った会社', '光電子増倍管で世界シェア約9割', 'https://www.hamamatsu.com/jp/ja.html', 728, 'https://www.nikkei.com/nkd/company/salary/?scode=6965', '光を究めて世界の科学を裏で支える、静岡の世界企業', 'electronics', 'component', 'niche_top', true, 'regional', 'approved', 'gnt100', now())
  on conflict do nothing
  returning id
)
insert into company_tags (company_id, type_code, weight)
select ins.id, t.type_code, t.weight
from ins
cross join (values
  ('comm_disorder_tech', 3),
  ('world_class_hidden', 3)
) as t(type_code, weight)
on conflict (company_id, type_code) do nothing;

with ins as (
  insert into companies
    (name, familiar_hook, share_highlight, share_source, avg_salary, salary_source,
     one_liner, product_field, visibility, scale_type, is_listed, location_type,
     status, source_origin, approved_at)
  values
    ('ナブテスコ', '工場のロボットアームの「関節」、あと電車のドアやブレーキ', '産業用ロボット向け精密減速機で世界シェア約6割', 'https://www.nabtesco.com/', 686, 'https://www.nikkei.com/nkd/company/salary/?scode=6268', '世界中のロボットの関節、その60%はこの会社の中身', 'machine', 'component', 'niche_top', true, 'urban', 'approved', 'gnt100', now())
  on conflict do nothing
  returning id
)
insert into company_tags (company_id, type_code, weight)
select ins.id, t.type_code, t.weight
from ins
cross join (values
  ('world_class_hidden', 3),
  ('comm_disorder_tech', 2),
  ('clock_out_ghost', 1)
) as t(type_code, weight)
on conflict (company_id, type_code) do nothing;

with ins as (
  insert into companies
    (name, familiar_hook, share_highlight, share_source, avg_salary, salary_source,
     one_liner, product_field, visibility, scale_type, is_listed, location_type,
     status, source_origin, approved_at)
  values
    ('SMC', '世界中の工場の自動化ラインを動かす「空気の力」担当', '空気圧制御機器で世界シェア約3割超、世界首位', 'https://www.smcworld.com/', 853, 'https://www.nikkei.com/nkd/company/salary/?scode=6273', '知名度ゼロなのに高収益、工場自動化の影の世界王者', 'machine', 'component', 'niche_top', true, 'urban', 'approved', 'gnt100', now())
  on conflict do nothing
  returning id
)
insert into company_tags (company_id, type_code, weight)
select ins.id, t.type_code, t.weight
from ins
cross join (values
  ('world_class_hidden', 3),
  ('money_machine', 2),
  ('comm_disorder_tech', 1),
  ('loud_sales', 1)
) as t(type_code, weight)
on conflict (company_id, type_code) do nothing;

with ins as (
  insert into companies
    (name, familiar_hook, share_highlight, share_source, avg_salary, salary_source,
     one_liner, product_field, visibility, scale_type, is_listed, location_type,
     status, source_origin, approved_at)
  values
    ('信越化学工業', '世界の半導体の「土台（シリコンウェハ）」シェア世界一', '半導体シリコンウェハ・塩化ビニル樹脂でいずれも世界首位', 'https://www.shinetsu.co.jp/jp/', 876, 'https://www.nikkei.com/nkd/company/salary/?scode=4063', '派手さゼロ、利益は化け物。日本一の堅実な世界企業', 'material', 'component', 'stable', true, 'urban', 'approved', 'gnt100', now())
  on conflict do nothing
  returning id
)
insert into company_tags (company_id, type_code, weight)
select ins.id, t.type_code, t.weight
from ins
cross join (values
  ('clock_out_ghost', 2),
  ('world_class_hidden', 3),
  ('money_machine', 1)
) as t(type_code, weight)
on conflict (company_id, type_code) do nothing;

with ins as (
  insert into companies
    (name, familiar_hook, share_highlight, share_source, avg_salary, salary_source,
     one_liner, product_field, visibility, scale_type, is_listed, location_type,
     status, source_origin, approved_at)
  values
    ('村田製作所', 'あなたのスマホに千個入ってる極小部品の世界王者', '積層セラミックコンデンサ（MLCC）で世界シェア約4割', 'https://www.murata.com/ja-jp', 803, 'https://www.nikkei.com/nkd/company/salary/?scode=6981', '京都発、スマホ1台に千個入る部品の世界トップ', 'electronics', 'component', 'stable', true, 'urban', 'approved', 'gnt100', now())
  on conflict do nothing
  returning id
)
insert into company_tags (company_id, type_code, weight)
select ins.id, t.type_code, t.weight
from ins
cross join (values
  ('world_class_hidden', 2),
  ('clock_out_ghost', 2),
  ('comm_disorder_tech', 1),
  ('loud_sales', 1)
) as t(type_code, weight)
on conflict (company_id, type_code) do nothing;

with ins as (
  insert into companies
    (name, familiar_hook, share_highlight, share_source, avg_salary, salary_source,
     one_liner, product_field, visibility, scale_type, is_listed, location_type,
     status, source_origin, approved_at)
  values
    ('ミネベアミツミ', '家電からジェット機まで、回るものの中心はだいたいコレ', '超精密ミニチュアボールベアリングで世界シェア約6割', 'https://www.minebeamitsumi.com/', 762, 'https://www.nikkei.com/nkd/company/salary/?scode=6479', '1ミリの世界で世界一、回転部品の絶対王者', 'machine', 'component', 'niche_top', true, 'urban', 'approved', 'gnt100', now())
  on conflict do nothing
  returning id
)
insert into company_tags (company_id, type_code, weight)
select ins.id, t.type_code, t.weight
from ins
cross join (values
  ('world_class_hidden', 3),
  ('clock_out_ghost', 1)
) as t(type_code, weight)
on conflict (company_id, type_code) do nothing;

with ins as (
  insert into companies
    (name, familiar_hook, share_highlight, share_source, avg_salary, salary_source,
     one_liner, product_field, visibility, scale_type, is_listed, location_type,
     status, source_origin, approved_at)
  values
    ('THK', 'ロボットや工作機械が「まっすぐ滑らかに動く」のはこの部品のおかげ', '直動案内機器（LMガイド）を世界で初めて開発、世界シェア首位級', 'https://www.thk.com/', 608, 'https://www.nikkei.com/nkd/company/salary/?scode=6481', '「まっすぐ動く」を発明した会社、世界の機械の縁の下', 'machine', 'component', 'niche_top', true, 'urban', 'approved', 'gnt100', now())
  on conflict do nothing
  returning id
)
insert into company_tags (company_id, type_code, weight)
select ins.id, t.type_code, t.weight
from ins
cross join (values
  ('world_class_hidden', 3),
  ('comm_disorder_tech', 1)
) as t(type_code, weight)
on conflict (company_id, type_code) do nothing;

with ins as (
  insert into companies
    (name, familiar_hook, share_highlight, share_source, avg_salary, salary_source,
     one_liner, product_field, visibility, scale_type, is_listed, location_type,
     status, source_origin, approved_at)
  values
    ('ハーモニック・ドライブ・システムズ', '火星探査機からヒト型ロボまで、精密な「関節」の心臓部', '波動歯車装置（精密減速機）で世界シェア首位級', 'https://www.hds.co.jp/', 705, 'https://www.nikkei.com/nkd/company/salary/?scode=6324', '宇宙とロボットの関節を握る、究極のニッチトップ', 'machine', 'component', 'niche_top', true, 'regional', 'approved', 'gnt100', now())
  on conflict do nothing
  returning id
)
insert into company_tags (company_id, type_code, weight)
select ins.id, t.type_code, t.weight
from ins
cross join (values
  ('comm_disorder_tech', 3),
  ('world_class_hidden', 3)
) as t(type_code, weight)
on conflict (company_id, type_code) do nothing;

with ins as (
  insert into companies
    (name, familiar_hook, share_highlight, share_source, avg_salary, salary_source,
     one_liner, product_field, visibility, scale_type, is_listed, location_type,
     status, source_origin, approved_at)
  values
    ('堀場製作所', '世界中の新車が必ず通る「排ガス検査」の装置はだいたいココ', '自動車エンジン排ガス測定装置で世界シェア約8割', 'https://www.horiba.com/jpn/', 821, 'https://www.nikkei.com/nkd/company/salary/?scode=6856', '「おもしろおかしく」を社是にする京都の世界計測企業', 'car', 'product', 'niche_top', true, 'urban', 'approved', 'gnt100', now())
  on conflict do nothing
  returning id
)
insert into company_tags (company_id, type_code, weight)
select ins.id, t.type_code, t.weight
from ins
cross join (values
  ('world_class_hidden', 3),
  ('comm_disorder_tech', 2),
  ('money_machine', 1),
  ('loud_sales', 1)
) as t(type_code, weight)
on conflict (company_id, type_code) do nothing;

with ins as (
  insert into companies
    (name, familiar_hook, share_highlight, share_source, avg_salary, salary_source,
     one_liner, product_field, visibility, scale_type, is_listed, location_type,
     status, source_origin, approved_at)
  values
    ('ニデック', 'PCやデータセンターの中で静かに回り続ける小型モーターの王者', '精密小型モーター（HDD用スピンドル等）で世界シェア圧倒的首位', 'https://www.nidec.com/jp/', 760, 'https://www.nikkei.com/nkd/company/salary/?scode=6594', '「すぐやる、必ずやる、出来るまでやる」で世界一になった会社', 'electronics', 'component', 'niche_top', true, 'urban', 'approved', 'gnt100', now())
  on conflict do nothing
  returning id
)
insert into company_tags (company_id, type_code, weight)
select ins.id, t.type_code, t.weight
from ins
cross join (values
  ('world_class_hidden', 2),
  ('money_machine', 2),
  ('loud_sales', 2)
) as t(type_code, weight)
on conflict (company_id, type_code) do nothing;

with ins as (
  insert into companies
    (name, familiar_hook, share_highlight, share_source, avg_salary, salary_source,
     one_liner, product_field, visibility, scale_type, is_listed, location_type,
     status, source_origin, approved_at)
  values
    ('マニー', 'あなたの体を縫った針、世界の歯医者のヤスリ、実は栃木の会社', '手術用縫合針・歯科用ファイルで世界シェア上位', 'https://www.mani.co.jp/', 786, 'https://www.nikkei.com/nkd/company/salary/?scode=7730', '「世界一の品質」だけを追う、医療ニッチの職人企業', 'medical', 'product', 'niche_top', true, 'regional', 'approved', 'gnt100', now())
  on conflict do nothing
  returning id
)
insert into company_tags (company_id, type_code, weight)
select ins.id, t.type_code, t.weight
from ins
cross join (values
  ('world_class_hidden', 3),
  ('comm_disorder_tech', 1),
  ('clock_out_ghost', 1)
) as t(type_code, weight)
on conflict (company_id, type_code) do nothing;

with ins as (
  insert into companies
    (name, familiar_hook, share_highlight, share_source, avg_salary, salary_source,
     one_liner, product_field, visibility, scale_type, is_listed, location_type,
     status, source_origin, approved_at)
  values
    ('椿本チエイン', '工場の搬送ラインや車のエンジンの中で力を伝える「鎖」', '産業用スチールチェーンで世界シェア上位', 'https://www.tsubakimoto.jp/', 664, 'https://www.nikkei.com/nkd/company/salary/?scode=6371', '100年以上ずっと回り続ける、チェーンの老舗世界企業', 'machine', 'component', 'stable', true, 'urban', 'approved', 'gnt100', now())
  on conflict do nothing
  returning id
)
insert into company_tags (company_id, type_code, weight)
select ins.id, t.type_code, t.weight
from ins
cross join (values
  ('clock_out_ghost', 2),
  ('world_class_hidden', 2)
) as t(type_code, weight)
on conflict (company_id, type_code) do nothing;

with ins as (
  insert into companies
    (name, familiar_hook, share_highlight, share_source, avg_salary, salary_source,
     one_liner, product_field, visibility, scale_type, is_listed, location_type,
     status, source_origin, approved_at)
  values
    ('日本ガイシ', '世界中の車の排気を綺麗にするセラミックの蜂の巣はココ', '自動車排ガス浄化用セラミックスで世界シェア首位級', 'https://www.ngk.co.jp/', 845, 'https://www.nikkei.com/nkd/company/salary/?scode=5333', 'セラミックで地球の空気を守る、名古屋の堅実世界企業', 'material', 'component', 'stable', true, 'regional', 'approved', 'gnt100', now())
  on conflict do nothing
  returning id
)
insert into company_tags (company_id, type_code, weight)
select ins.id, t.type_code, t.weight
from ins
cross join (values
  ('clock_out_ghost', 2),
  ('world_class_hidden', 2),
  ('comm_disorder_tech', 1)
) as t(type_code, weight)
on conflict (company_id, type_code) do nothing;

with ins as (
  insert into companies
    (name, familiar_hook, share_highlight, share_source, avg_salary, salary_source,
     one_liner, product_field, visibility, scale_type, is_listed, location_type,
     status, source_origin, approved_at)
  values
    ('不二製油グループ本社', 'コンビニスイーツやお菓子のチョコ、裏で支える「油脂の会社」', '業務用チョコレート・植物性油脂で世界的シェア', 'https://www.fujioilholdings.com/', 995, 'https://www.nikkei.com/nkd/company/salary/?scode=2607', 'あなたが今日食べたチョコの裏に、たぶんこの会社', 'food', 'component', 'stable', true, 'urban', 'approved', 'gnt100', now())
  on conflict do nothing
  returning id
)
insert into company_tags (company_id, type_code, weight)
select ins.id, t.type_code, t.weight
from ins
cross join (values
  ('clock_out_ghost', 2),
  ('world_class_hidden', 1),
  ('loud_sales', 1)
) as t(type_code, weight)
on conflict (company_id, type_code) do nothing;

with ins as (
  insert into companies
    (name, familiar_hook, share_highlight, share_source, avg_salary, salary_source,
     one_liner, product_field, visibility, scale_type, is_listed, location_type,
     status, source_origin, approved_at)
  values
    ('ローツェ', '半導体工場で、繊細なウェハを傷つけず運ぶロボットの専門家', '半導体ウェハ搬送ロボット・装置で世界シェア上位', 'https://www.rorze.com/', 1019, 'https://www.nikkei.com/nkd/company/salary/?scode=6323', '広島発、半導体工場の「運ぶ」を独占する技術集団', 'electronics', 'product', 'niche_top', true, 'regional', 'approved', 'gnt100', now())
  on conflict do nothing
  returning id
)
insert into company_tags (company_id, type_code, weight)
select ins.id, t.type_code, t.weight
from ins
cross join (values
  ('comm_disorder_tech', 2),
  ('world_class_hidden', 2),
  ('money_machine', 1)
) as t(type_code, weight)
on conflict (company_id, type_code) do nothing;

with ins as (
  insert into companies
    (name, familiar_hook, share_highlight, share_source, avg_salary, salary_source,
     one_liner, product_field, visibility, scale_type, is_listed, location_type,
     status, source_origin, approved_at)
  values
    ('ユーシン精機', 'ペットボトルのキャップや弁当容器を量産する裏方ロボット', 'プラスチック成形品取出ロボットで世界シェア首位級', 'https://www.yushin.com/', 645, 'https://www.nikkei.com/nkd/company/salary/?scode=6482', '身の回りの樹脂製品、その量産を支える京都のロボット屋', 'machine', 'product', 'niche_top', true, 'regional', 'approved', 'gnt100', now())
  on conflict do nothing
  returning id
)
insert into company_tags (company_id, type_code, weight)
select ins.id, t.type_code, t.weight
from ins
cross join (values
  ('world_class_hidden', 3),
  ('clock_out_ghost', 1)
) as t(type_code, weight)
on conflict (company_id, type_code) do nothing;

with ins as (
  insert into companies
    (name, familiar_hook, share_highlight, share_source, avg_salary, salary_source,
     one_liner, product_field, visibility, scale_type, is_listed, location_type,
     status, source_origin, approved_at)
  values
    ('メック', 'スマホ基板の「くっつき」を陰で保証する薬品メーカー', 'プリント基板用の密着向上表面処理薬品で世界的シェア', 'https://www.mec-co.com/', 745, 'https://www.nikkei.com/nkd/company/salary/?scode=4971', '電子機器の信頼性を、目に見えない化学で支える兵庫の会社', 'material', 'component', 'niche_top', true, 'regional', 'approved', 'gnt100', now())
  on conflict do nothing
  returning id
)
insert into company_tags (company_id, type_code, weight)
select ins.id, t.type_code, t.weight
from ins
cross join (values
  ('comm_disorder_tech', 2),
  ('world_class_hidden', 2)
) as t(type_code, weight)
on conflict (company_id, type_code) do nothing;

with ins as (
  insert into companies
    (name, familiar_hook, share_highlight, share_source, avg_salary, salary_source,
     one_liner, product_field, visibility, scale_type, is_listed, location_type,
     status, source_origin, approved_at)
  values
    ('島津製作所', '病院の検査や食品の安全を支える分析装置、ノーベル賞も出た会社', '液体クロマトグラフ等の分析計測機器でグローバル上位', 'https://www.shimadzu.co.jp/', 901, 'https://www.nikkei.com/nkd/company/salary/?scode=7701', 'ノーベル賞研究者を生んだ、京都の老舗分析機器メーカー', 'medical', 'product', 'stable', true, 'urban', 'approved', 'gnt100', now())
  on conflict do nothing
  returning id
)
insert into company_tags (company_id, type_code, weight)
select ins.id, t.type_code, t.weight
from ins
cross join (values
  ('comm_disorder_tech', 3),
  ('world_class_hidden', 2),
  ('clock_out_ghost', 1)
) as t(type_code, weight)
on conflict (company_id, type_code) do nothing;
