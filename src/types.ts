export type ParamGroup =
  | 'underlying'
  | 'tenor'
  | 'barrier'
  | 'coupon'
  | 'price'
  | 'leverage'
  | 'size'
  | 'issuance';

export type ParamValueType = 'string' | 'number' | 'date' | 'array' | 'boolean';

export type ProductCategory = 'Notes' | 'OTC' | 'Other';

export interface EnumOption {
  value: string;
  label: string;
}

export interface ParamAtom {
  id: string;
  key: string;
  backendKey: string;
  title: string;
  group: ParamGroup;
  valueType: ParamValueType;
  options: EnumOption[];
  suffix: string;
  pattern: '' | 'float2' | 'int' | 'date';
  defaultValue: string;
  custom: boolean;
}

/** 一笔询价只求解其中一个字段，其余由客户填写。 */
export interface QuoteConfig {
  solveFor: string[];
  common: string[];
  advanced: string[];
}

export function emptyQuote(): QuoteConfig {
  return {solveFor: [], common: [], advanced: []};
}

export interface ProductDef {
  id: string;
  code: string;
  name: string;
  category: ProductCategory;
  paramIds: string[];
  /** 该产品的询价单：常用项、进阶项、可求解项。值是参数 id。 */
  quote: QuoteConfig;
  custom: boolean;
}

export interface Catalog {
  params: ParamAtom[];
  products: ProductDef[];
}

export const GROUP_LABEL: Record<ParamGroup, string> = {
  underlying: 'Underlying',
  tenor: 'Tenor & Dates',
  barrier: 'Barriers',
  coupon: 'Coupon & Return',
  price: 'Price & Fees',
  leverage: 'Leverage & Settlement',
  size: 'Size',
  issuance: 'Issuance',
};

export const CATEGORIES: ProductCategory[] = ['Notes', 'OTC', 'Other'];
