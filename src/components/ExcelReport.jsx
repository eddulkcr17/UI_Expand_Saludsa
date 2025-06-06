/* eslint-disable react/prop-types */

import React from "react";
import ExcelJS from "exceljs";
import moment from "moment";

class ExcelReport extends React.Component {
  constructor(props) {
    super(props);
    this.generateReport = this.generateReport.bind(this);
  }

  generateReport() {
    const { data } = this.props;

    const fechaActual = moment().format("YYYY-MM-DD HH:mm");
    const nombreArchivo = `ReportGeneral_Llamadas_${fechaActual}.xlsx`;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("data");

    const headerFont = {
      name: "Arial",
      bold: true,
      size: 10,
      color: { argb: "00121E" },
    };
    const headerFill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "33a5ff" },
    };
    const TotalesFill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "AED6F1" },
    };
    const PromediosFill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "87BEE4" },
    };

    const headerBorder = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
    const columnWidths = [25, 25, 15, 15, 15, 15, 15, 20, 20, 20, 15, 15, 15];
    const columnAlignment = [
      "center",
      "center",
      "center",
      "center",
      "center",
      "center",
      "center",
      "center",
      "center",
      "center",
      "center",
      "center",
      "center",
    ];

    const titleRow = worksheet.addRow(["REPORTE GENERAL DE LLAMADAS"]);
    titleRow.getCell(1).font = headerFont;
    titleRow.getCell(1).fill = headerFill;
    
    // Unificar las celdas para mostrar un único título que abarque varias columnas
    worksheet.mergeCells('A1:B1');

    
    worksheet.addRow(["Fecha del reporte " + fechaActual])
    const headers = [
      "Agente",
      "Tiempo Logueado",
      "Tiempo Total Disponible",
      "Tiempo Hablado Saliente",
      "Tiempo Promedio Saliente",
      "Tiempo en Pausa",
      "Cantidad Llamadas Atendidas",
      "Tiempo Hablado LLamada Entrante",
      "Tiempo Promedio Total LLamadas Entrante",
      "LLamadas Atendidas Por Humano",
      "LLamadas Atendidas Por No Humano",
      "Total Llamadas Salientes",
    ];

    // Agregar cabeceras con formato
    headers.forEach((header, index) => {
      const cell = worksheet.getRow(4).getCell(index + 1);
      cell.value = header;
      cell.font = headerFont;
      cell.fill = headerFill;
      cell.border = headerBorder;
      cell.alignment = {
        vertical: "middle",
        horizontal: columnAlignment[index],
        wrapText: true,
      };
      worksheet.getColumn(index + 1).width = columnWidths[index];
    });

    data.forEach((item) => {
      const row = [
        item.agente,
        item.logueado,
        item.tiempo_TotalDisponible,
        item.tiempo_Hablado_Saliente,
        item.tiempo_Promedio_Saliente,
        item.tiempo_En_Pausa,
        item.cantidad_Llamadas_Atendidas,
        item.tiempo_Hablado_LLamada_Entrante,
        item.tiempo_Promedio_Total,
        parseInt(item.lLamadas_Atendidas_Humano),
        parseInt(item.lLamadas_Atendidas_No_Humano),
        parseInt(item.total_LLamadas_Saliente),
      ];
      worksheet.addRow(row).eachCell((cell) => {
        cell.border = headerBorder;
      });
    });

    const totalesRow = [
      "Totales",
      calcularSumaTiempos(data.map((fila) => fila["logueado"])),
      calcularSumaTiempos(data.map((fila) => fila["tiempo_TotalDisponible"])),
      calcularSumaTiempos(data.map((fila) => fila["tiempo_Hablado_Saliente"])),
      calcularSumaTiempos(data.map((fila) => fila["tiempo_Promedio_Saliente"])),
      calcularSumaTiempos(data.map((fila) => fila["tiempo_En_Pausa"])),
      (sumarColumnaNumerica(data, "cantidad_Llamadas_Atendidas")).toString(),
      calcularSumaTiempos(data.map((fila) => fila["tiempo_Hablado_LLamada_Entrante"])),
      calcularSumaTiempos(data.map((fila) => fila["tiempo_Promedio_Total"])),
      sumarColumnaNumerica(data, "lLamadas_Atendidas_Humano"),
      sumarColumnaNumerica(data, "lLamadas_Atendidas_No_Humano"),
      sumarColumnaNumerica(data, "total_LLamadas_Saliente"),
    ];

    worksheet.addRow(totalesRow).eachCell((cell) => {
      cell.font = headerFont;
      cell.fill = TotalesFill;
      cell.border = headerBorder;
    });

    const promediosRow = [
      "Promedios",
      calcularPromedioTiempos(data.map((fila) => fila["logueado"])),
      calcularPromedioTiempos(
        data.map((fila) => fila["tiempo_TotalDisponible"])
      ),
      calcularPromedioTiempos(
        data.map((fila) => fila["tiempo_Hablado_Saliente"])
      ),
      calcularPromedioTiempos(
        data.map((fila) => fila["tiempo_Promedio_Saliente"])
      ),
      calcularPromedioTiempos(data.map((fila) => fila["tiempo_En_Pausa"])),
      
        (
          sumarColumnaNumerica(data, "cantidad_Llamadas_Atendidas") / data.length
        ).toFixed(2)
      ,
      calcularPromedioTiempos(
        data.map((fila) => fila["tiempo_Hablado_LLamada_Entrante"])
      ),
      calcularPromedioTiempos(
        data.map((fila) => fila["tiempo_Promedio_Total"])
      ),
      parseFloat(
        (
          sumarColumnaNumerica(data, "lLamadas_Atendidas_Humano") / data.length
        ).toFixed(2)
      ),
      parseFloat(
        (
          sumarColumnaNumerica(data, "lLamadas_Atendidas_No_Humano") /
          data.length
        ).toFixed(2)
      ),
      parseFloat(
        (
          sumarColumnaNumerica(data, "total_LLamadas_Saliente") / data.length
        ).toFixed(2)
      ),
    ];

    worksheet.addRow(promediosRow).eachCell((cell) => {
      cell.font = headerFont;
      cell.fill = PromediosFill;
      cell.border = headerBorder;
    });

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = nombreArchivo;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  render() {
    return <button onClick={this.generateReport}>Generar Reporte Excel</button>;
  }
}

// Función para convertir tiempo a segundos
function tiempoASegundos(tiempo) {
  const partes = tiempo.split(":").map(Number);
  return partes[0] * 3600 + partes[1] * 60 + partes[2];
}

function calcularSumaTiempos(data) {
  let totalSegundos = 0;

  for (let i = 0; i < data.length; i++) {
    const tiempoEnSegundos = tiempoASegundos(data[i]);
    totalSegundos += tiempoEnSegundos;
  }

  const promedioSegundos = totalSegundos;

  const horas = Math.floor(promedioSegundos / 3600);
  const minutos = Math.floor((promedioSegundos % 3600) / 60);
  const segundos = Math.floor(promedioSegundos % 60);

  const tiempoPromedio = `${horas}:${minutos < 10 ? "0" : ""}${minutos}:${
    segundos < 10 ? "0" : ""
  }${segundos}`;

  return tiempoPromedio;
}

function calcularPromedioTiempos(data) {
  let totalSegundos = 0;

  for (let i = 0; i < data.length; i++) {
    const tiempoEnSegundos = tiempoASegundos(data[i]);
    totalSegundos += tiempoEnSegundos;
  }

  const promedioSegundos = totalSegundos / data.length;

  const horas = Math.floor(promedioSegundos / 3600);
  const minutos = Math.floor((promedioSegundos % 3600) / 60);
  const segundos = Math.floor(promedioSegundos % 60);

  const tiempoPromedio = `${horas}:${minutos < 10 ? "0" : ""}${minutos}:${
    segundos < 10 ? "0" : ""
  }${segundos}`;

  return tiempoPromedio;
}

// Función para sumar valores numéricos
function sumarColumnaNumerica(data, columna) {
  const total = data.reduce(
    (suma, fila) => suma + parseInt(fila[columna], 10),
    0
  );
  return total;
}

export default ExcelReport;
