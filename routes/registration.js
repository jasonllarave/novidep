import express from "express";
import { Registration } from "../models/Registration.js";
import { createObjectCsvWriter } from "csv-writer";
import ExcelJS from "exceljs";
import path from "path";

const router = express.Router();

/**
 * GET /api/registration
 * Listar todos los registros
 */
router.get("/", async (req, res) => {
  try {
    const data = await Registration.find().sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (err) {
    console.error("Error listando registros:", err);
    res.status(500).json({ success: false, message: "Error interno" });
  }
});


/**
 * GET /api/registration/count
 * Contador para dashboard admin
 */
router.get("/count", async (req, res) => {
  try {
    const total = await Registration.countDocuments();
    res.json({ success: true, total });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});


/**
 * GET /api/registration/export/csv
 * Exportar registros en CSV
 */
router.get("/export/csv", async (req, res) => {
  try {
    const data = await Registration.find().sort({ createdAt: -1 });

    const filePath = path.join(process.cwd(), "exports", "registros.csv");

    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: "name", title: "Nombre" },
        { id: "phone", title: "Teléfono" },
        { id: "authorized", title: "Autorizó" },
        { id: "createdAt", title: "Fecha registro" },
      ],
    });

    await csvWriter.writeRecords(data);

    res.download(filePath);
  } catch (err) {
    console.error("Error exportando CSV:", err);
    res.status(500).json({ success: false });
  }
});


/**
 * GET /api/registration/export/excel
 * Exportar registros a Excel
 */
router.get("/export/excel", async (req, res) => {
  try {
    const data = await Registration.find().sort({ createdAt: -1 });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Registros");

    sheet.columns = [
      { header: "Nombre", key: "name", width: 30 },
      { header: "Teléfono", key: "phone", width: 20 },
      { header: "Autorizó", key: "authorized", width: 10 },
      { header: "Fecha registro", key: "createdAt", width: 30 }
    ];

    data.forEach((item) => sheet.addRow(item));

    const filePath = path.join(process.cwd(), "exports", "registros.xlsx");
    await workbook.xlsx.writeFile(filePath);

    res.download(filePath);
  } catch (err) {
    console.error("Error exportando Excel:", err);
    res.status(500).json({ success: false });
  }
});

export default router;
