export type Brand = "Apple" | "Google" | "Samsung" | "Xiaomi";

export type Category =
  | "Smartphones"
  | "Tablets"
  | "Smart Watches"
  | "Laptops"
  | "Earbuds"
  | "Gaming Phones"
  | "Smart Home";

export type SpecValue = string | number | null;

export interface ProductSpec {
  label: string;
  value: SpecValue;
}

export interface Product {
  id: string;
  brand: Brand;
  category: Category;
  name: string;
  model: string;
  image?: string;
  year: number;
  score?: number; // 0-100 editorial score
  badge?: string; // e.g. "Best Value", "Editor's Pick", "New"
  specs: Record<string, SpecValue>;
}

export interface SpecGroup {
  label: string;
  keys: string[];
}

export interface CategoryConfig {
  id: Category;
  label: string;
  icon: string;
  specFields: SpecField[];
  specGroups?: SpecGroup[];
}

export interface SpecField {
  key: string;
  label: string;
  unit?: string;
  higherIsBetter?: boolean; // for best-value highlighting
  lowerIsBetter?: boolean;
  isNumeric?: boolean;
}

export type Slot = {
  id: number;
  product: Product | null;
};

export type ViewMode = "table" | "cards";
