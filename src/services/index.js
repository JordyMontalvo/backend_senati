import api from './api'

export const carrerasService = {
  getAll: (params = {}) => api.get('/carreras', { params }),
  getById: (id) => api.get(`/carreras/${id}`),
  create: (data) => api.post('/carreras', data),
  update: (id, data) => api.put(`/carreras/${id}`, data),
  delete: (id) => api.delete(`/carreras/${id}`)
}

export const cursosService = {
  getAll: (params = {}) => api.get('/cursos', { params }),
  getById: (id) => api.get(`/cursos/${id}`),
  create: (data) => api.post('/cursos', data),
  update: (id, data) => api.put(`/cursos/${id}`, data),
  delete: (id) => api.delete(`/cursos/${id}`)
}

export const periodosService = {
  getAll: () => api.get('/periodos'),
  getById: (id) => api.get(`/periodos/${id}`),
  create: (data) => api.post('/periodos', data),
  update: (id, data) => api.put(`/periodos/${id}`, data),
  delete: (id) => api.delete(`/periodos/${id}`)
}

export const bloquesService = {
  getAll: (params = {}) => api.get('/bloques', { params }),
  getById: (id) => api.get(`/bloques/${id}`),
  create: (data) => api.post('/bloques', data),
  update: (id, data) => api.put(`/bloques/${id}`, data),
  delete: (id) => api.delete(`/bloques/${id}`)
}

export const profesoresService = {
  getAll: (params = {}) => api.get('/profesores', { params }),
  getById: (id) => api.get(`/profesores/${id}`),
  create: (data) => api.post('/profesores', data),
  update: (id, data) => api.put(`/profesores/${id}`, data),
  delete: (id) => api.delete(`/profesores/${id}`)
}

export const aulasService = {
  getAll: (params = {}) => api.get('/aulas', { params }),
  create: (data) => api.post('/aulas', data),
  update: (id, data) => api.put(`/aulas/${id}`, data),
  delete: (id) => api.delete(`/aulas/${id}`)
}

export const horariosService = {
  getAll: (params = {}) => api.get('/horarios', { params }),
  getByBloque: (bloqueId) => api.get(`/horarios/bloque/${bloqueId}`),
  create: (data) => api.post('/horarios', data),
  update: (id, data) => api.put(`/horarios/${id}`, data),
  delete: (id) => api.delete(`/horarios/${id}`)
}

export const asignacionesService = {
  getAll: (params = {}) => api.get('/asignaciones', { params }),
  create: (data) => api.post('/asignaciones', data),
  update: (id, data) => api.put(`/asignaciones/${id}`, data),
  delete: (id) => api.delete(`/asignaciones/${id}`)
}

export const estudiantesService = {
  getAll: (params = {}) => api.get('/estudiantes', { params }),
  create: (data) => api.post('/estudiantes', data),
  update: (id, data) => api.put(`/estudiantes/${id}`, data),
  delete: (id) => api.delete(`/estudiantes/${id}`)
}

export const matriculasService = {
  getAll: (params = {}) => api.get('/matriculas', { params }),
  create: (data) => api.post('/matriculas', data),
  delete: (id) => api.delete(`/matriculas/${id}`)
}
