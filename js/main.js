const URL = 'https://script.google.com/macros/s/AKfycbxvSqJQTRK4UGku7nVwqn-UqKp_wpGy3uB0_In1kD02T2h03rfjZETyYIR9zP6PyFCdOg/exec';

let ultimoNumero = 0;
let ultimaMarca = '';
let ultimaFamilia = '';

document.addEventListener('DOMContentLoaded', () => {
  const hoy = new Date().toISOString().split('T')[0];
  document.getElementById('fecha_ingreso').value = hoy;

  // Buscar el primer número vacío
  fetch(URL + '?todos=true')
    .then(res => res.json())
    .then(data => {
      let encontrado = null;
      for (let i = 1; i < data.length; i++) {
        const fila = data[i];
        const numero = fila[0];
        const marca = fila[1];
        const modelo = fila[2];
        const color = fila[3];
        if (numero && !marca && !modelo && !color) {
          encontrado = parseInt(numero);
          break;
        }
      }

      if (encontrado) {
        ultimoNumero = encontrado;
      } else {
        const ultFila = data.at(-1);
        ultimoNumero = parseInt(ultFila[0]) + 1 || 1;
      }

      document.getElementById('n_anteojo').value = ultimoNumero;
    });

  // Mostrar input para nueva marca
  const marcaSelect = document.getElementById('marca');
  marcaSelect.addEventListener('change', () => {
    const nuevaInput = document.getElementById('nueva_marca');
    if (marcaSelect.value === 'OTRA') {
      nuevaInput.style.display = 'block';
    } else {
      nuevaInput.style.display = 'none';
    }
  });

  // Recalcular precio automáticamente
  document.getElementById('costo').addEventListener('input', calcularPrecio);
  document.getElementById('familia').addEventListener('change', calcularPrecio);
});

function calcularPrecio() {
  const costo = parseFloat(document.getElementById('costo').value);
  const familia = document.getElementById('familia').value;
  let precio = 0;

  if (!isNaN(costo)) {
    if (familia === 'RECETA') {
      precio = costo * 3.63;
    } else if (familia === 'SOL') {
      precio = costo * 2.42;
    }
  }

  document.getElementById('precio_publico').value = precio.toFixed(2);
}

document.getElementById('formulario').addEventListener('submit', async (e) => {
  e.preventDefault();

  const familia = document.getElementById('familia').value;
  const colorCristal = document.getElementById('color_cristal').value.trim();

  if (familia === 'SOL' && colorCristal === '') {
    alert('Debe ingresar el color de cristal para anteojos de SOL.');
    return;
  }

  let marca = document.getElementById('marca').value;
  const nuevaMarca = document.getElementById('nueva_marca').value.trim();
  if (marca === 'OTRA' && nuevaMarca) {
    marca = nuevaMarca;
  }

  const datos = {
    n_anteojo: document.getElementById('n_anteojo').value,
    marca,
    modelo: document.getElementById('modelo').value.trim(),
    codigo_color: document.getElementById('codigo_color').value.trim(),
    color_armazon: document.getElementById('color_armazon').value.trim(),
    calibre: document.getElementById('calibre').value.trim(),
    color_cristal: colorCristal,
    familia,
    precio: document.getElementById('precio_publico').value,
    fecha_ingreso: document.getElementById('fecha_ingreso').value,
    fecha_venta: '',
    vendedor: '',
    costo: document.getElementById('costo').value,
    codigo_barras: document.getElementById('codigo_barras').value.trim(),
    observaciones: document.getElementById('observaciones').value.trim(),
  };

  try {
    const response = await fetch(URL, {
      method: 'POST',
      body: JSON.stringify(datos),
      headers: { 'Content-Type': 'application/json' }
    });

    const result = await response.json();

    if (result.success) {
      alert('Guardado correctamente ✅');

      // Guardar últimos valores
      ultimaMarca = marca;
      ultimaFamilia = familia;

      // Limpiar todo
      document.getElementById('formulario').reset();

      // Restaurar valores por defecto
      document.getElementById('n_anteojo').value = ++ultimoNumero;
      document.getElementById('marca').value = ultimaMarca;
      document.getElementById('familia').value = ultimaFamilia;
      document.getElementById('fecha_ingreso').value = new Date().toISOString().split('T')[0];
      document.getElementById('nueva_marca').style.display = 'none';
    } else {
      alert('Error al guardar. Reintentá.');
    }

  } catch (err) {
    alert('Error de conexión. Reintentá.');
    console.error(err);
  }
});
