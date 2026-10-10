function obtenerConfiguracion() {
  const puertoTexto = process.env.PORT;

  const puerto = puertoTexto === undefined ? 3000 : Number(puertoTexto);

  if (!Number.isInteger(puerto) || puerto < 1 || puerto > 65535) {
    throw new Error("PORT debe ser un número entero entre 1 y 65535.");
  }

  const entorno = process.env.NODE_ENV || "development";

  const formatoMorgan = entorno === "production" ? "combined" : "dev";

  return {
    puerto,
    entorno,
    formatoMorgan,
  };
}

module.exports = obtenerConfiguracion;
