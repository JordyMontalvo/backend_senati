const ExcelService = require('../services/excelService');
const fs = require('fs');

const uploadBloques = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se ha subido ningún archivo' });
    }

    const filePath = req.file.path;
    
    // Procesar el Excel
    const data = ExcelService.parseExcelBloques(filePath);

    // Eliminar el archivo temporal después de procesarlo
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'Archivo procesado correctamente',
      preview: {
        totalRows: data.rows.length,
        headers: data.headers,
        firstRow: data.rows[0]
      }
    });

  } catch (error) {
    console.error('Error al procesar excel:', error);
    res.status(500).json({ success: false, message: 'Error al procesar el archivo Excel', error: error.message });
  }
};

module.exports = {
  uploadBloques
};
