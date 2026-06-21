// アプリ全体で使うドメイン型。DBの companies / types に対応。

export interface Company {
  id: string;
  name: string;
  familiar_hook: string;
  share_highlight: string;
  share_source: string;
  avg_salary: number | null;
  salary_source: string | null;
  one_liner: string | null;
  product_field: string;
  visibility: "product" | "component";
  scale_type: "niche_top" | "stable";
  is_listed: boolean;
  location_type: "urban" | "regional";
  status: string;
  source_origin: string | null;
}

export interface CompanyTag {
  type_code: string;
  weight: number;
}

export interface TypeDef {
  code: string;
  display_name: string;
  roast: string;
  love_followup: string;
  worst_match: string;
  worst_match_line: string;
  emoji_or_icon: string | null;
}
