const custom = require('@/controllers/pdfController');
const pool = require('@/db/pool');
const { getModel } = require('@/db/models');

module.exports = downloadPdf = async (req, res, { directory, id }) => {
  try {
    const modelName = directory.slice(0, 1).toUpperCase() + directory.slice(1);
    let modelDef;
    try {
      modelDef = getModel(modelName);
    } catch (e) {
      modelDef = null;
    }

    if (modelDef) {
      const [rows] = await pool.query(`SELECT * FROM ${modelDef.tableName} WHERE id = ?`, [id]);
      const result = rows[0];

      // Throw error if no result (zero rows found is the SQL equivalent of
      // Mongoose's "no document" / invalid ObjectId case)
      if (!result) {
        throw { name: 'ValidationError' };
      }

      // Continue process if result is returned

      const fileId = modelName.toLowerCase() + '-' + result.id + '.pdf';
      const folderPath = modelName.toLowerCase();
      const targetLocation = `src/public/download/${folderPath}/${fileId}`;
      await custom.generatePdf(
        modelName,
        { filename: folderPath, format: 'A4', targetLocation },
        result,
        async () => {
          return res.download(targetLocation, (error) => {
            if (error)
              return res.status(500).json({
                success: false,
                result: null,
                message: "Couldn't find file",
                error: error.message,
              });
          });
        }
      );
    } else {
      return res.status(404).json({
        success: false,
        result: null,
        message: `Model '${modelName}' does not exist`,
      });
    }
  } catch (error) {
    // If error is thrown due to required validations / not-found row
    if (error.name == 'ValidationError') {
      return res.status(400).json({
        success: false,
        result: null,
        error: error.message,
        message: 'Required fields are not supplied',
      });
    } else if (error.name == 'BSONTypeError') {
      // Kept for parity with the previous Mongoose-based error handling.
      // Under SQL a malformed id simply fails the query or matches zero
      // rows, which is handled by the ValidationError branch above.
      return res.status(400).json({
        success: false,
        result: null,
        error: error.message,
        message: 'Invalid ID',
      });
    } else {
      // Server Error
      return res.status(500).json({
        success: false,
        result: null,
        error: error.message,
        message: error.message,
        controller: 'downloadPDF.js',
      });
    }
  }
};
