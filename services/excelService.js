const xlsx = require('xlsx');

const parseExcelBloques = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0]; // Asumimos que está en la primera hoja
  const worksheet = workbook.Sheets[sheetName];
  
  // Convertir a JSON
  const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
  
  // Procesar datos (Aquí adaptaremos la lógica según la estructura exacta de tu Excel)
  // Por ahora devolvemos la estructura cruda para inspección
  return {
    headers: data[0],
    rows: data.slice(1)
  };
};

module.exports = {
  parseExcelBloques
};
