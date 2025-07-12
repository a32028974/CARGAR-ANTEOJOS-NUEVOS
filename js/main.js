
document.addEventListener('DOMContentLoaded', () => {
  const hoy = new Date().toISOString().split('T')[0];
  const fechaSpan = document.getElementById('fecha_ingreso_static');
  if (fechaSpan) fechaSpan.innerText = hoy;

  const costoInput = document.getElementById('costo');
  const familiaSelect = document.getElementById('familia');
  const precioPublicoInput = document.getElementById('precio_publico');

  function calcularPrecio() {
    const costo = parseFloat(costoInput.value);
    const familia = familiaSelect.value;
    let precio = 0;

    if (!isNaN(costo)) {
      if (familia === 'RECETA') {
        precio = costo * 3.63;
      } else if (familia === 'SOL') {
        precio = costo * 2.42;
      }
    }

    precioPublicoInput.value = precio.toFixed(2);
  }

  costoInput.addEventListener('input', calcularPrecio);
  familiaSelect.addEventListener('change', calcularPrecio);
});
