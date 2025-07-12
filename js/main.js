/* URL de tu Apps Script */
const URL = 'https://script.google.com/macros/s/AKfycbyL_-fC6sKnjkUXr5ZLxd6gQNe_aJyXtvkpjvUPqBNw1l7w95DKg6Gko7-kTieNaguo4g/exec';

let ultimoNumero = 0;
let ultimaMarca = '';
let ultimaFamilia = '';

/* Al cargar la página ----------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  /* 1. Fecha de ingreso estática ---------------------------- */
  const hoyISO = new Date().toISOString().split('T')[0];
  document.getElementById('fecha_ingreso_static').textContent = hoyISO;

  /* 2. Traer datos para calcular el número de anteojo ------- */
  fetch(`${URL}?todos=true`)
    .then(r => r.json())
    .then(data => {
      // Buscar la primera fila con número pero sin datos
      let libre = null;
      for (let i = 1; i < data.length; i++) {
        const [num, marca, modelo, color] = data[i];
        if (num && !marca && !modelo && !color) {
          libre = parseInt(num);
          break;
        }
      }

      if (libre) {
        ultimoNumero = libre;
      } else if (data.length) {
        const ultima = data[data.length - 1];
        ultimoNumero = parseInt(ultima[0]) + 1 || 1;
      } else {
        ultimoNumero = 1;
      }
      document.getElementById('n_anteojo').value = ultimoNumero;
    })
    .catch(err => {
      console.error('Error cargando datos:', err);
      ultimoNumero = 1;
      document.getElementById('n_anteojo').value = ultimoNumero;
    });

  /* 3. Mostrar input de nueva marca -------------------------- */
  document.getElementById('marca').addEventListener('change', e => {
    document.getElementById('nueva_marca').style.display =
      e.target.value === 'OTRA' ? 'block' : 'none';
  });

  /* 4. Recalcular precio ------------------------------------ */
  document.getElementById('costo'  ).addEventListener('input',  calcPrecio);
  document.getElementById('familia').addEventListener('change', calcPrecio);
});

/* Cálculo automático de precio */
function calcPrecio() {
  const costo   = parseFloat(document.getElementById('costo').value);
  const familia = document.getElementById('familia').value;
  let precio = 0;

  if (!isNaN(costo)) {
    precio = familia === 'RECETA' ? costo * 3.63
           : familia === 'SOL'    ? costo * 2.42
           : costo;
  }
  document.getElementById('precio_publico').value = precio.toFixed(2);
}

/* Envío del formulario ---------------------------------------------------- */
document.getElementById('formulario').addEventListener('submit', async ev => {
  ev.preventDefault();

  /* Validación de color de cristal en SOL */
  const familia      = document.getElementById('familia').value;
  const colorCristal = document.getElementById('color_cristal').value.trim();
  if (familia === 'SOL' && !colorCristal) {
    alert('Debe ingresar el color de cristal para anteojos de SOL.');
    return;
  }

  /* Marca (puede ser nueva) */
  let marca = document.getElementById('marca').value;
  const nuevaMarca = document.getElementById('nueva_marca').value.trim();
  if (marca === 'OTRA' && nuevaMarca) marca = nuevaMarca;

  /* Datos a enviar */
  const datos = {
    n_anteojo:  document.getElementById('n_anteojo').value,
    marca,
    modelo:        document.getElementById('modelo').value.trim(),
    codigo_color:  document.getElementById('codigo_color').value.trim(),
    color_armazon: document.getElementById('color_armazon').value.trim(),
    calibre:       document.getElementById('calibre').value.trim(),
    color_cristal: colorCristal,
    familia,
    precio:        document.getElementById('precio_publico').value,
    costo:         document.getElementById('costo').value,
    fecha_ingreso: document.getElementById('fecha_ingreso_static').textContent,
    fecha_venta:   '',   // ocultos
    vendedor:      '',   // ocultos
    codigo_barras: document.getElementById('codigo_barras').value.trim(),
    observaciones: document.getElementById('observaciones').value.trim()
  };

  try {
    /* Enviamos por POST (Apps Script ya permite POST) */
    const res = await fetch(URL, {
      method : 'POST',
      body   : JSON.stringify(datos),
      headers: { 'Content-Type': 'application/json' }
    });
    const json = await res.json();

    if (json.success) {
      alert('Guardado correctamente ✅');

      /* Limpiar y preparar para el siguiente */
      ultimaMarca   = marca;
      ultimaFamilia = familia;
      document.getElementById('formulario').reset();

      document.getElementById('n_anteojo').value = ++ultimoNumero;
      document.getElementById('marca').value   = ultimaMarca;
      document.getElementById('familia').value = ultimaFamilia;
      document.getElementById('fecha_ingreso_static').textContent =
        new Date().toISOString().split('T')[0];
      document.getElementById('nueva_marca').style.display = 'none';
      calcPrecio();
    } else {
      alert('El servidor respondió error. Verifique los datos.');
    }
  } catch (err) {
    console.error(err);
    alert('Error de conexión. Intente de nuevo.');
  }
});
