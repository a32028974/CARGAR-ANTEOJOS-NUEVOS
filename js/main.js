const URL = 'https://script.google.com/macros/s/AKfycbxvSqJQTRK4UGku7nVwqn-UqKp_wpGy3uB0_In1kD02T2h03rfjZETyYIR9zP6PyFCdOg/exec';

let ultimoNumero = 0;
let ultimaMarca = '';
let ultimaFamilia = '';

// 👉 Al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  const hoy = new Date().toISOString().split('T')[0];
  document.getElementById('fecha_ingreso').value = hoy;

  // Traer el último número de anteojo
  fetch(URL + '?todos=true')
    .then(res => res.json())
    .then(data => {
      const ultFila = data.slice(-1)[0];
      ultimoNumero = parseInt(ultFila[0]) + 1 || 1;
      document.getElementById('n_anteojo').value = ultimoNumero;
    });

  // Mostrar input de marca nueva si se elige "OTRA"
  const marcaSelect = document.getElementById('marca');
  marcaSelect.addEventListener('change', () => {
    const nuevaInput = document.getElementById('nueva_marca');
    if (marcaSelect.value === 'OTRA') {
      nuevaInput.style.display = 'block';
    } else {
      nuevaInput.style.display = 'none';
    }
  });

  // Recalcular precio si cambia costo o familia
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

// 👉 Envío del formulario
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
    await fetch(URL, {
      method: 'POST',
      body: JSON.stringify(datos),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Guardar últimos valores
    ultimaMarca = marca;
    ultimaFamilia = familia;

    // Limpiar formulario
    document.getElementById('formulario').reset();

    // Restaurar persistencias
    document.getElementById('n_anteojo').value = ++ultimoNumero;
    document.getElementById('marca').value = ultimaMarca;
    document.getElementById('familia').value = ultimaFamilia;
    document.getElementById('fecha_ingreso').value = new Date().toISOString().split('T')[0];
    document.getElementById('nueva_marca').style.display = 'none';

  } catch (err) {
    alert('Error al guardar. Reintentá.');
    console.error(err);
  }
});
