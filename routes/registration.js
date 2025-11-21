// routes/registration.js
import express from "express";
import { Registration } from "../models/Registration.js";
import { Parser as Json2csvParser } from "json2csv";
import ExcelJS from "exceljs";

const router = express.Router();

/**
 * GET /api/registration
 * Lista todos los registros
 */
router.get("/", async (req, res) => {
  try {
    const list = await Registration.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Error obteniendo registros" });
  }
});

/**
 * GET /api/registration/csv
 * Exporta CSV
 */
router.get("/csv", async (req, res) => {
  try {
    const list = await Registration.find().lean();
    const fields = ["name", "phone", "authorized", "createdAt"];
    const json2csv = new Json2csvParser({ fields });
    const csv = json2csv.parse(list);

    res.header("Content-Type", "text/csv");
    res.attachment("registros.csv");
    return res.send(csv);
  } catch (err) {
    console.error("CSV Error:", err);
    res.status(500).json({ error: "Error generando CSV" });
  }
});

/**
 * GET /api/registration/excel
 * Exporta Excel
 */
router.get("/excel", async (req, res) => {
  try {
    const list = await Registration.find().lean();

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Registros");

    ws.columns = [
      { header: "Nombre", key: "name", width: 25 },
      { header: "Teléfono", key: "phone", width: 15 },
      { header: "Autorizado", key: "authorized", width: 10 },
      { header: "Fecha", key: "createdAt", width: 20 }
    ];

    list.forEach((item) => ws.addRow(item));

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=registros.xlsx");

    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Excel Error:", err);
    res.status(500).json({ error: "Error generando Excel" });
  }
});

export default router;
