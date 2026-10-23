import {createRouter, createWebHistory} from 'vue-router';
import ParamList from './views/ParamList.vue';
import ProductList from './views/ProductList.vue';
import ProductEditor from './views/ProductEditor.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {path: '/', redirect: '/params'},
    {path: '/params', component: ParamList},
    {path: '/products', component: ProductList},
    {path: '/products/:id', component: ProductEditor},
  ],
});
