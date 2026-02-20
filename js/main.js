// 1. Referencias al HTML
const contenedor = document.getElementById('contenedor-productos');
const tituloSeccion = document.getElementById('titulo-dinamico'); 
const contenedorFiltros = document.getElementById('contenedor-filtros'); 

// 2. Capturar la categoría de la URL
const urlParams = new URLSearchParams(window.location.search);
const categoriaSeleccionada = urlParams.get('categoria');

let productosFiltradosPorCategoria = [];

async function cargarCatalogo() {
    try {
        if (tituloSeccion) {
            if (categoriaSeleccionada) {
                const nombresMarcas = {
                    'sanpietro': 'San Pietro',
                    'sanlorenzo': 'San Lorenzo',
                    'lourdes': 'Lourdes',
                    'salteña': 'Salteña',
                    'importados': 'Importados'
                };
                const nombreLindo = nombresMarcas[categoriaSeleccionada.toLowerCase()] || 
                    (categoriaSeleccionada.charAt(0).toUpperCase() + categoriaSeleccionada.slice(1));
                tituloSeccion.textContent = `Colección ${nombreLindo}`;
            } else {
                tituloSeccion.textContent = "Nuestro Catálogo";
            }
        }

        // 3. Cargar el archivo base_de_datos.csv
        const respuesta = await fetch('base_de_datos.csv');
        const buffer = await respuesta.arrayBuffer();
        const decoder = new TextDecoder('iso-8859-1'); 
        const contenido = decoder.decode(buffer);
        const lineas = contenido.split(/\r?\n/);

        for (let i = 1; i < lineas.length; i++) {
            const linea = lineas[i].trim();
            if (linea === "") continue;

            const separador = linea.includes(';') ? ';' : ',';
            const fila = linea.split(separador);

            console.log("Fila completa:", fila);

            if (fila.length >= 5) { 
                const producto = {
                    codigo:    fila[0].trim(),
                    nombre:    fila[1].trim(),
                    medidas:   fila[2].trim(),
                    imagen:    fila[3].trim(),
                    categoria: fila[4].trim(),
                    subcoleccion: fila[5] ? fila[5].trim() : "" 
                };

                const coincideFiltro = !categoriaSeleccionada || 
                    producto.categoria.toLowerCase() === categoriaSeleccionada.toLowerCase();

                if (coincideFiltro) {
                    productosFiltradosPorCategoria.push(producto);
                }
            }
        }

        if (categoriaSeleccionada && categoriaSeleccionada.toLowerCase() === 'importados') {
            generarBotoneraFiltros(productosFiltradosPorCategoria);
        }

        renderizarGrid(productosFiltradosPorCategoria);

    } catch (error) {
        console.error("Error al cargar los datos:", error);
    }
}

function generarBotoneraFiltros(productos) {
    if (!contenedorFiltros) return;

    const marcasunicas = [...new Set(productos.map(p => p.subcoleccion.trim()))]
                            .filter(m => m !== "" && m !== undefined);

    console.log("Marcas únicas detectadas:", marcasunicas);

    let htmlBotones = `<button class="btn-filtro active" data-sub="">TODOS</button>`;
    
    marcasunicas.forEach(marca => {
        htmlBotones += `<button class="btn-filtro" data-sub="${marca}">${marca}</button>`;
    });

    contenedorFiltros.innerHTML = htmlBotones;

    contenedorFiltros.querySelectorAll('.btn-filtro').forEach(boton => {
        boton.addEventListener('click', (e) => {
            contenedorFiltros.querySelectorAll('.btn-filtro').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            const subElegida = e.target.getAttribute('data-sub');
            const finales = subElegida === "" 
                ? productosFiltradosPorCategoria 
                : productosFiltradosPorCategoria.filter(p => p.subcoleccion === subElegida);
            
            renderizarGrid(finales);
        });
    });
}

function renderizarGrid(listaProductos) {
    contenedor.innerHTML = "";
    listaProductos.forEach(prod => {
        renderizarTarjeta(prod);
    });
}

function renderizarTarjeta(prod) {
    const tarjeta = document.createElement('div');
    tarjeta.classList.add('tarjeta-producto');

    const carpetaMarca = prod.categoria.toLowerCase().trim();
    const rutaImagen = `img/${carpetaMarca}/${prod.imagen.trim()}`;

    let textoEtiqueta = prod.categoria;
    
    if (prod.categoria.toLowerCase() === 'importados' && prod.subcoleccion !== "") {
        textoEtiqueta = prod.subcoleccion;
    }

    tarjeta.innerHTML = `
        <img src="${rutaImagen}" alt="${prod.nombre}" onerror="this.src='img/placeholder.jpg'">
        <div class="info">
            <span class="marca-etiqueta">${textoEtiqueta}</span>
            <h3>${prod.nombre}</h3>
            <p>Medidas: ${prod.medidas}</p>
            <p class="codigo">Ref: ${prod.codigo}</p>
        </div>
    `;
    contenedor.appendChild(tarjeta);
}

// Iniciar la carga
cargarCatalogo();