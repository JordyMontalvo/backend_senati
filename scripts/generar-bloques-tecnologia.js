const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

// Datos de ejemplo para tecnología
const datos = [
  // Ingeniería de Software con IA - Semestre I (2 Bloques: Mañana y Tarde)
  {
    "Código": "ISIA-I-2024-M",
    "Período": "2024-10",
    "Semestre": 1,
    "Carrera": "Ingeniería de Software con Inteligencia Artificial",
    "Turno": "Mañana",
    "Capacidad Máxima": 30,
    "Fecha Inicio": "2024-03-01",
    "Fecha Fin": "2024-07-15"
  },
  {
    "Código": "ISIA-I-2024-T",
    "Período": "2024-10",
    "Semestre": 1,
    "Carrera": "Ingeniería de Software con Inteligencia Artificial",
    "Turno": "Tarde",
    "Capacidad Máxima": 30,
    "Fecha Inicio": "2024-03-01",
    "Fecha Fin": "2024-07-15"
  },
  // Ingeniería de Software con IA - Semestre III
  {
    "Código": "ISIA-III-2024-N",
    "Período": "2024-10",
    "Semestre": 3,
    "Carrera": "Ingeniería de Software con Inteligencia Artificial",
    "Turno": "Noche",
    "Capacidad Máxima": 25,
    "Fecha Inicio": "2024-03-01",
    "Fecha Fin": "2024-07-15"
  },
  // Diseño Gráfico Digital
  {
    "Código": "DGD-I-2024-M",
    "Período": "2024-10",
    "Semestre": 1,
    "Carrera": "Diseño Gráfico Digital",
    "Turno": "Mañana",
    "Capacidad Máxima": 20,
    "Fecha Inicio": "2024-03-01",
    "Fecha Fin": "2024-07-15"
  },
  // Seguridad de la Información
  {
    "Código": "SEG-II-2024-T",
    "Período": "2024-10",
    "Semestre": 2,
    "Carrera": "Seguridad de la Información",
    "Turno": "Tarde",
    "Capacidad Máxima": 25,
    "Fecha Inicio": "2024-03-01",
    "Fecha Fin": "2024-07-15"
  }
];

// Crear libro y hoja
const wb = xlsx.utils.book_new();
const ws = xlsx.utils.json_to_sheet(datos);

// Ajustar ancho de columnas
const cols = [
  { wch: 15 }, // Código
  { wch: 10 }, // Período
  { wch: 10 }, // Semestre
  { wch: 40 }, // Carrera
  { wch: 10 }, // Turno
  { wch: 15 }, // Capacidad
  { wch: 12 }, // Inicio
  { wch: 12 }  // Fin
];
ws['!cols'] = cols;

xlsx.utils.book_append_sheet(wb, ws, "Bloques Tecnología");

// Guardar archivo
const outputPath = path.join(__dirname, '../bloques_tecnologia.xlsx');
xlsx.writeFile(wb, outputPath);

console.log(`✅ Archivo Excel generado exitosamente: ${outputPath}`);
console.log('📋 Contiene 5 bloques de ejemplo para carreras de tecnología.');
