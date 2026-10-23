<template>
  <div class="page">
    <div class="page-head">
      <div>
        <h1>Products</h1>
        <p>A product is an ordered set of parameters. Cards show the fields a client fills on a quote.</p>
      </div>
    </div>
    <div class="switcher">
      <button
        v-for="item in CATEGORIES"
        :key="item"
        type="button"
        :class="{on: category === item}"
        @click="category = item"
      >
        {{ item }} {{ count(item) }}
      </button>
    </div>
    <div class="product-grid">
      <button class="product-card create" type="button" data-testid="new-product" @click="router.push('/products/new')">
        <strong>New product</strong>
        <span>Compose a term sheet from the parameter catalog.</span>
      </button>
      <button v-for="product in visible" :key="product.id" class="product-card" type="button" @click="router.push(`/products/${product.id}`)">
        <span class="eyebrow">{{ product.category }}<template v-if="product.custom"> · Custom</template></span>
        <strong>{{ product.name }}</strong>
        <span class="chips">
          <span v-for="title in titles(product.quote?.common ?? [], 4)" :key="title" class="chip">{{ title }}</span>
        </span>
        <span class="chips">
          <span v-for="title in titles(product.quote?.solveFor ?? [], 3)" :key="title" class="chip custom">Solve {{ title }}</span>
        </span>
      </button>
    </div>
    <div v-if="!visible.length" class="empty">No products in this category.</div>
  </div>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue';
import {useRouter} from 'vue-router';
import {useCatalog} from '@/store';
import {CATEGORIES, type ProductCategory} from '@/types';

const catalog = useCatalog();
const router = useRouter();
const category = ref<ProductCategory>('Notes');
const visible = computed(() => catalog.products.filter((item) => item.category === category.value));

function count(name: ProductCategory) {
  return catalog.products.filter((item) => item.category === name).length;
}

function titles(ids: string[], limit: number) {
  return ids
    .map((id) => catalog.params.find((item) => item.id === id)?.title)
    .filter((item): item is string => !!item)
    .slice(0, limit);
}
</script>
