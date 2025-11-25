// routes/registration.js
import express from "express";
import { Registration } from "../models/Registration.js";
import { Parser as Json2csvParser } from "json2csv";
import ExcelJS from "exceljs";

const router = express.Router();

/**
 * GET /api/registration
 * Lista todos los registros ordenados por fecha descendente
 */
router.get("/", async (req, res) => {
  try {
    const list = await Registration.find().sort({ createdAt: -1 }).lean();
    res.json(list);
  } catch (err) {
    console.error("Error obteniendo registros:", err);
    res.status(500).json({ error: "Error obteniendo registros" });
  }
});

/**
 * GET /api/registration/csv
 * Exporta todos los registros en formato CSV
 */
router.get("/csv", async (req, res) => {
  try {
    const list = await Registration.find().lean();
    if (!list || list.length === 0) {
      return res.status(404).json({ error: "No hay registros para exportar" });
    }

    const fields = ["name", "phone", "authorized", "createdAt"];
    const json2csv = new Json2csvParser({ fields });
    const csv = json2csv.parse(list);

    res.header("Content-Type", "text/csv");
    res.attachment("registros.csv");
    return res.send(csv);
  } catch (err) {
    console.error("Error generando CSV:", err);
    res.status(500).json({ error: "Error generando CSV" });
  }
});

/**
 * GET /api/registration/excel
 * Exporta todos los registros en formato Excel (.xlsx)
 */
router.get("/excel", async (req, res) => {
  try {
    const list = await Registration.find().lean();
    if (!list || list.length === 0) {
      return res.status(404).json({ error: "No hay registros para exportar" });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Registros");

    // Definir columnas con encabezados y ancho
    worksheet.columns = [
      { header: "Nombre", key: "name", width: 25 },
      { header: "Teléfono", key: "phone", width: 15 },
      { header: "Autorizado", key: "authorized", width: 12 },
      { header: "Fecha", key: "createdAt", width: 20 }
    ];

    // Agregar filas
    list.forEach(item => {
      worksheet.addRow({
        name: item.name,
        phone: item.phone,
        authorized: item.authorized ? "Sí" : "No",
        createdAt: item.createdAt
          ? new Date(item.createdAt).toLocaleString("es-CO")
          : ""
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=registros.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Error generando Excel:", err);
    res.status(500).json({ error: "Error generando Excel" });
  }
});

export default router;
