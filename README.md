# Backend - Sistema de Gestión de Horarios SENATI

Backend API RESTful construido con Node.js, Express y MongoDB.

## 🚀 Inicio Rápido

### 1. Instalar dependencias
```bash
cd backend
npm install
npm install xlsx  # Para importar datos desde Excel
```

### 2. Configurar variables de entorno
Copia `.env.example` a `.env` y ajusta los valores:
```bash
cp .env.example .env
```

### 3. Asegúrate de tener MongoDB corriendo
```bash
# Si usas MongoDB localmente
mongod

# O usa MongoDB Compass o MongoDB Atlas (cloud)
```

### 4. Importar datos desde Excel
Coloca los archivos Excel en la raíz del proyecto y ejecuta:
```bash
npm run import
```

### 5. Iniciar el servidor
```bash
# Modo desarrollo (con nodemon)
npm run dev

# Modo producción
npm start
```

El servidor estará disponible en: `http://localhost:5000`

## 📡 Endpoints API

### Períodos
- `GET /api/periodos` - Listar períodos
- `POST /api/periodos` - Crear período
- `PUT /api/periodos/:id` - Actualizar período
- `DELETE /api/periodos/:id` - Eliminar período

### Escuelas
- `GET /api/escuelas` - Listar escuelas
- `POST /api/escuelas` - Crear escuela
- `PUT /api/escuelas/:id` - Actualizar escuela
- `DELETE /api/escuelas/:id` - Eliminar escuela

### Carreras
- `GET /api/carreras` - Listar carreras
- `GET /api/carreras?search=industrial` - Buscar carreras
- `GET /api/carreras?activo=true` - Filtrar activas
- `GET /api/carreras/:id` - Obtener carrera
- `POST /api/carreras` - Crear carrera
- `PUT /api/carreras/:id` - Actualizar carrera
- `DELETE /api/carreras/:id` - Eliminar carrera

### Cursos
- `GET /api/cursos` - Listar cursos
- `GET /api/cursos?carrera=ID` - Filtrar por carrera
- `GET /api/cursos?semestre=I` - Filtrar por semestre
- `GET /api/cursos/:id` - Obtener curso
- `POST /api/cursos` - Crear curso
- `PUT /api/cursos/:id` - Actualizar curso
- `DELETE /api/cursos/:id` - Eliminar curso

### Bloques
- `GET /api/bloques` - Listar bloques
- `GET /api/bloques?periodo=ID&carrera=ID` - Filtrar
- `GET /api/bloques/:id` - Obtener bloque
- `POST /api/bloques` - Crear bloque
- `PUT /api/bloques/:id` - Actualizar bloque
- `DELETE /api/bloques/:id` - Eliminar bloque

### Profesores
- `GET /api/profesores` - Listar profesores
- `GET /api/profesores?search=juan` - Buscar profesores
- `POST /api/profesores` - Crear profesor
- `PUT /api/profesores/:id` - Actualizar profesor
- `DELETE /api/profesores/:id` - Eliminar profesor

### Aulas
- `GET /api/aulas` - Listar aulas
- `GET /api/aulas?tipo=Taller` - Filtrar por tipo
- `POST /api/aulas` - Crear aula
- `PUT /api/aulas/:id` - Actualizar aula
- `DELETE /api/aulas/:id` - Eliminar aula

### Asignaciones
- `GET /api/asignaciones` - Listar asignaciones
- `GET /api/asignaciones?bloque=ID` - Por bloque
- `POST /api/asignaciones` - Crear asignación
- `PUT /api/asignaciones/:id` - Actualizar asignación
- `DELETE /api/asignaciones/:id` - Eliminar asignación

### Horarios
- `GET /api/horarios` - Listar horarios
- `GET /api/horarios/bloque/:bloqueId` - Horario completo de un bloque
- `POST /api/horarios` - Crear horario
- `PUT /api/horarios/:id` - Actualizar horario
- `DELETE /api/horarios/:id` - Eliminar horario

### Estudiantes
- `GET /api/estudiantes` - Listar estudiantes
- `GET /api/estudiantes?search=maria` - Buscar estudiantes
- `POST /api/estudiantes` - Crear estudiante
- `PUT /api/estudiantes/:id` - Actualizar estudiante
- `DELETE /api/estudiantes/:id` - Eliminar estudiante

### Matrículas
- `GET /api/matriculas` - Listar matrículas
- `GET /api/matriculas?estudiante=ID` - Por estudiante
- `GET /api/matriculas?bloque=ID` - Por bloque
- `POST /api/matriculas` - Matricular estudiante
- `DELETE /api/matriculas/:id` - Eliminar matrícula

## 📦 Modelos de Datos

### Período
```javascript
{
  codigo: String (unique),
  nombre: String,
  fechaInicio: Date,
  fechaFin: Date,
  estado: 'activo' | 'cerrado' | 'planificado'
}
```

### Carrera
```javascript
{
  escuela: ObjectId (ref: Escuela),
  codigo: String (unique),
  nombre: String,
  nivel: String,
  grado: String,
  catalogo: String,
  activo: Boolean
}
```

### Curso
```javascript
{
  carrera: ObjectId (ref: Carrera),
  materia: String,
  numero: String,
  codigo: String (unique),
  nombre: String,
  semestre: String,
  creditos: Number,
  horasTeoria: Number,
  horasTaller: Number,
  horasVirtual: Number,
  horasTotal: Number,
  tipoCurso: 'TEC' | 'TAL' | 'VIR' | 'TEC-INGLES',
  clasificacion: String
}
```

## 🛠️ Tecnologías

- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **CORS** - Soporte para peticiones cross-origin
- **Helmet** - Seguridad HTTP
- **Morgan** - Logger de peticiones
- **dotenv** - Variables de entorno

## 📄 Licencia

MIT
# fronted_senati
