import {defineStore} from 'pinia';
import {createSeed} from './seed';
import {emptyQuote, type Catalog, type ParamAtom, type ProductDef, type QuoteConfig} from './types';

const STORAGE_KEY = 'ec-desk-param-catalog-v1';
const LEGACY_STORAGE_KEY = 'ec-oms-param-catalog-v1';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function normalizeQuote(quote: QuoteConfig | undefined, allowed: Set<string>): QuoteConfig {
  const source = quote ?? emptyQuote();
  const keep = (ids: string[] | undefined) => (ids ?? []).filter((id) => allowed.has(id));
  return {solveFor: keep(source.solveFor), common: keep(source.common), advanced: keep(source.advanced)};
}

function load(): Catalog {
  const seed = createSeed();
  const stored = localStorage.getItem(STORAGE_KEY);
  const raw = stored ?? localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!raw) return seed;
  try {
    const parsed = JSON.parse(raw) as Catalog;
    if (!Array.isArray(parsed.params) || !Array.isArray(parsed.products)) return seed;
    const known = new Set(parsed.params.map((item) => item.id));
    const seedTitle = new Map(seed.params.map((item) => [item.key, item.title]));
    let migrated = stored == null;
    parsed.params = parsed.params.map((param) => {
      if (param.custom) return param;
      const title = seedTitle.get(param.key);
      if (!title || title === param.title) return param;
      migrated = true;
      return {...param, title};
    });
    parsed.products = parsed.products.map((product) => {
      const seeded = seed.products.find((item) => item.id === product.id);
      let next = product;
      if (!product.quote && seeded && !product.custom) {
        next = {...product, quote: seeded.quote, paramIds: [...product.paramIds]};
        for (const id of [...seeded.quote.solveFor, ...seeded.quote.common, ...seeded.quote.advanced]) {
          if (known.has(id) && !next.paramIds.includes(id)) next.paramIds.push(id);
        }
        migrated = true;
      }
      const quote = normalizeQuote(next.quote, known);
      if (!next.quote) migrated = true;
      return {...next, quote};
    });
    if (migrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({params: parsed.params, products: parsed.products}));
    }
    return parsed;
  } catch {
    return seed;
  }
}

export const useCatalog = defineStore('catalog', {
  state: () => load(),
  actions: {
    persist() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({params: this.params, products: this.products}));
    },
    reset() {
      const seed = createSeed();
      this.params = seed.params;
      this.products = seed.products;
      this.persist();
    },
    saveParam(input: ParamAtom) {
      const index = this.params.findIndex((item) => item.id === input.id);
      if (this.params.some((item) => item.key === input.key && item.id !== input.id)) {
        throw new Error('Parameter key already exists');
      }
      if (index === -1) this.params.push(clone(input));
      else this.params[index] = clone(input);
      this.persist();
    },
    removeParam(id: string) {
      this.params = this.params.filter((item) => item.id !== id);
      this.products.forEach((product) => {
        product.paramIds = product.paramIds.filter((paramId) => paramId !== id);
        product.quote = normalizeQuote(product.quote, new Set(product.paramIds));
      });
      this.persist();
    },
    saveProduct(input: ProductDef) {
      const index = this.products.findIndex((item) => item.id === input.id);
      if (this.products.some((item) => item.code === input.code && item.id !== input.id)) {
        throw new Error('Product code already exists');
      }
      if (index === -1) this.products.push(clone(input));
      else this.products[index] = clone(input);
      this.persist();
    },
    removeProduct(id: string) {
      this.products = this.products.filter((item) => item.id !== id);
      this.persist();
    },
  },
});
