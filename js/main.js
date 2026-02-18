// 1. Referencias al HTML
const contenedor = document.getElementById('contenedor-productos');
const tituloSeccion = document.querySelector('.titulo'); // Para cambiar el nombre dinámicamente

// 2. Capturar la categoría de la URL (ej: ?categoria=Lourdes)
const urlParams = new URLSearchParams(window.location.search);
const categoriaSeleccionada = urlParams.get('categoria');

async function cargarCatalogo() {
    try {
        // 3. Cargar el archivo con soporte para acentos (ISO-8859-1)
        const respuesta = await fetch('base_de_datos.csv');
        const buffer = await respuesta.arrayBuffer();
        const decoder = new TextDecoder('iso-8859-1'); 
        const contenido = decoder.decode(buffer);

        // 4. Dividir por líneas y procesar
        const lineas = contenido.split(/\r?\n/);
        
        // Actualizar el título de la página según el filtro
        if (categoriaSeleccionada) {
            tituloSeccion.textContent = `Catálogo: ${categoriaSeleccionada}`;
        }

        for (let i = 1; i < lineas.length; i++) {
            const linea = lineas[i].trim();
            if (linea === "") continue;

            // 5. Detector de separador (coma o punto y coma)
            const separador = linea.includes(';') ? ';' : ',';
            const fila = linea.split(separador);

            if (fila.length >= 4) {
                const producto = {
                    codigo:    fila[0].trim(),
                    nombre:    fila[1].trim(),
                    medidas:   fila[2].trim(),
                    imagen:    fila[3].trim(),
                    categoria: fila[4] ? fila[4].trim() : "General"
                };

                // 6. LÓGICA DE FILTRADO
                // Si no hay parámetro en la URL, muestra todo. 
                // Si hay, muestra solo lo que coincida con la columna "Categoría".
                if (!categoriaSeleccionada || producto.categoria === categoriaSeleccionada) {
                    renderizarTarjeta(producto);
                }
            }
        }
    } catch (error) {
        console.error("Error al cargar los datos:", error);
    }
}

function renderizarTarjeta(prod) {
    const tarjeta = document.createElement('div');
    tarjeta.classList.add('tarjeta-producto');

    // CONSTRUCCIÓN DE RUTA DINÁMICA:
    // Si la categoría es "Lourdes", la ruta será: img/Lourdes/nombre_foto.jpeg
    const rutaImagen = `img/${prod.categoria}/${prod.imagen}`;

    tarjeta.innerHTML = `
        <img src="${rutaImagen}" alt="${prod.nombre}">
        <div class="info">
            <h3>${prod.nombre}</h3>
            <p>Medidas: ${prod.medidas}</p>
            <p class="codigo">Ref: ${prod.codigo}</p>
        </div>
    `;
    contenedor.appendChild(tarjeta);
}

// Iniciar la ejecución
cargarCatalogo();