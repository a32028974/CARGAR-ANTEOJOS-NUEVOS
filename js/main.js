document.addEventListener("DOMContentLoaded", () => {
  const URL = 'https://script.google.com/macros/s/AKfycbyZpgCOy4VFFPE_gq_jpv9Ed5KsPjJqLAX-8SEohVRYl_qAm2PIpEtpAALLvRx9Bdt7Pg/exec';

  const fechaSpan = document.getElementById("fecha_ingreso_static");
  const nAnteojoInput = document.getElementById("n_anteojo");
  const marcaSelect = document.getElementById("marca");
  const nuevaMarcaInput = document.getElementById("nueva_marca");
  const familiaSelect = document.getElementById("familia");
  const costoInput = document.getElementById("costo");
  const precioInput = document.getElementById("precio_publico");
  const colorCristalInput = document.getElementById("color_cristal");
  const form = document.getElementById("formulario");

  // Mostrar fecha
  const hoy = new Date();
  const fechaFormateada = hoy.toISOString().split("T")[0];
  fechaSpan.textContent = fechaFormateada;

  // Obtener número de anteojo
  fetch(URL + "?todos=true")
    .then(res => res.json())
    .then(data => {
      const ultima = data[data.length - 1];
      const ultimoNumero = parseInt(ultima[0]) + 1 || 1;
      nAnteojoInput.value = ultimoNumero;
    })
    .catch(err => console.error("Error al obtener número:", err));

  // Mostrar input si es "OTRA"
  marcaSelect.addEventListener("change", () => {
    nuevaMarcaInput.style.display = marcaSelect.value === "OTRA" ? "block" : "none";
  });

  // Calcular precio
  costoInput.addEventListener("input", () => {
    const costo = parseFloat(costoInput.value);
    let precio = 0;
    if (familiaSelect.value === "SOL") {
      precio = costo * 2.42;
    } else if (familiaSelect.value === "RECETA") {
      precio = costo * 3.63;
    }
    precioInput.value = precio ? precio.toFixed(2) : '';
  });

  // Validación y envío
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (familiaSelect.value === "SOL" && !colorCristalInput.value.trim()) {
      alert("Debés ingresar el color de cristal para anteojos de sol.");
      return;
    }

    const formData = {
      n_anteojo: nAnteojoInput.value,
      marca: marcaSelect.value === "OTRA" ? nuevaMarcaInput.value.trim().toUpperCase() : marcaSelect.value,
      modelo: document.getElementById("modelo").value.trim(),
      codigo_color: document.getElementById("codigo_color").value.trim(),
      color_armazon: document.getElementById("color_armazon").value.trim(),
      calibre: document.getElementById("calibre").value.trim(),
      color_cristal: colorCristalInput.value.trim(),
      familia: familiaSelect.value,
      costo: costoInput.value,
      precio_publico: precioInput.value,
      codigo_barras: document.getElementById("codigo_barras").value.trim(),
      observaciones: document.getElementById("observaciones").value.trim(),
      fecha_ingreso: fechaFormateada,
    };

    try {
      const res = await fetch(URL, {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await res.json();
      if (result.success) {
        alert("Anteojo guardado correctamente.");
        form.reset();
        nuevaMarcaInput.style.display = "none";
        nAnteojoInput.value = parseInt(nAnteojoInput.value) + 1;
        fechaSpan.textContent = fechaFormateada;
      } else {
        alert("Error al guardar.");
      }
    } catch (err) {
      console.error("Error al guardar:", err);
      alert("Error al conectar con el servidor.");
    }
  });
});
