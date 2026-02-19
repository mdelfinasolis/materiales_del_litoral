// 1. Referencias al HTML
const contenedor = document.getElementById('contenedor-productos');
const tituloSeccion = document.querySelector('.titulo'); 

// 2. Capturar la categoría de la URL (ej: ?categoria=Lourdes)
const urlParams = new URLSearchParams(window.location.search);
const categoriaSeleccionada = urlParams.get('categoria');

async function cargarCatalogo() {
    try {
        // 3. Cargar el archivo con soporte para acentos
        const respuesta = await fetch('base_de_datos.csv');
        const buffer = await respuesta.arrayBuffer();
        const decoder = new TextDecoder('iso-8859-1'); 
        const contenido = decoder.decode(buffer);

        // 4. Dividir por líneas
        const lineas = contenido.split(/\r?\n/);
        
        // Actualizar el título dinámicamente
        if (categoriaSeleccionada && tituloSeccion) {
            tituloSeccion.textContent = `Catálogo: ${categoriaSeleccionada}`;
        }

        for (let i = 1; i < lineas.length; i++) {
            const linea = lineas[i].trim();
            if (linea === "") continue;

            const separador = linea.includes(';') ? ';' : ',';
            const fila = linea.split(separador);

            if (fila.length >= 5) { 
                const producto = {
                    codigo:    fila[0].trim(),
                    nombre:    fila[1].trim(),
                    medidas:   fila[2].trim(),
                    imagen:    fila[3].trim(),
                    categoria: fila[4].trim() // Aquí está la clave del filtro
                };

                // 6. LÓGICA DE FILTRADO ESTRICTA
                // Si no hay categoría en la URL, muestra todo.
                // Si hay categoría, comparamos ignorando mayúsculas/minúsculas.
                const coincideFiltro = !categoriaSeleccionada || 
                                     producto.categoria.toLowerCase() === categoriaSeleccionada.toLowerCase();

                if (coincideFiltro) {
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
    // Forzamos la carpeta de la categoría a minúsculas para GitHub (ej: img/lourdes/foto.jpg)
    const carpetaMarca = prod.categoria.toLowerCase();
    const rutaImagen = `img/${carpetaMarca}/${prod.imagen}`;

    tarjeta.innerHTML = `
        <img src="${rutaImagen}" alt="${prod.nombre}" onerror="this.src='img/placeholder.jpg'">
        <div class="info">
            <span class="marca-etiqueta">${prod.categoria}</span>
            <h3>${prod.nombre}</h3>
            <p>Medidas: ${prod.medidas}</p>
            <p class="codigo">Ref: ${prod.codigo}</p>
        </div>
    `;
    contenedor.appendChild(tarjeta);
}

// Iniciar la ejecución
cargarCatalogo();