import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/carreras',
      name: 'carreras',
      component: () => import('../views/CarrerasView.vue')
    },
    {
      path: '/cursos',
      name: 'cursos',
      component: () => import('../views/CursosView.vue')
    },
    {
      path: '/bloques',
      name: 'bloques',
      component: () => import('../views/BloquesView.vue')
    },
    {
      path: '/horarios',
      name: 'horarios',
      component: () => import('../views/HorariosView.vue')
    },
    {
      path: '/horarios/gestionar',
      name: 'gestionar-horarios',
      component: () => import('../views/AsignarHorariosView.vue')
    },
    {
      path: '/horarios/bloque/:id',
      name: 'horario-bloque',
      component: () => import('../views/HorarioBloqueView.vue')
    },
    {
      path: '/profesores',
      name: 'profesores',
      component: () => import('../views/ProfesoresView.vue')
    },
    {
      path: '/aulas',
      name: 'aulas',
      component: () => import('../views/AulasView.vue')
    },
    {
      path: '/periodos',
      name: 'periodos',
      component: () => import('../views/PeriodosView.vue')
    }
  ]
})

export default router
