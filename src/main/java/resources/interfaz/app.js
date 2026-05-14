//logica de interfaz
let direccionActual = "en-es";

function setDirection(dir) {
    direccionActual = dir;
}

    document.getElementById("btn-en-es").classList.toggle("active", dir == "en-es");
    document.getElementById("btn-es-en").classList.toggle("active", dir == "es-en");

    document.getElementById('label-input').textContent  = dir === 'en-es' ? 'Inglés'  : 'Español';
    document.getElementById('label-output').textContent = dir === 'en-es' ? 'Español' : 'Inglés';

    limpiarResultados();
    mostrarToast('Dirección cambiada: ' + (dir === 'en-es' ? 'Inglés → Español' : 'Español → Inglés'));

    // ── Contador de caracteres en tiempo real ──
    function manejarEntrada() {
        const texto = document.getElementById('inputText').value;
        document.getElementById('charCount').textContent = texto.length + ' caracteres';
    }

    function limpiarEntrada() {
        document.getElementById('inputText').value = '';
        document.getElementById('charCount').textContent = '0 caracteres';
        limpiarResultados();
    }

    function limpiarResultados() {
        document.getElementById('outputText').innerHTML =
            '<span class="output-placeholder">La traducción aparecerá aquí…</span>';
        actualizarStatus('En espera', '');
        document.getElementById('tablesSection').style.display = 'none';
        document.getElementById('tokensBody').innerHTML = '';
        document.getElementById('erroresBody').innerHTML = '';
    }

    function cargarArchivo(event) {
        const archivo = event.target.files[0];

        // Valida que sea un archivo .txt
        if (!archivo) return;
        if (!archivo.name.endsWith('.txt')) {
            mostrarToast('Solo se aceptan archivos .txt');
            return;
        }
    }

    const lector = new FileReader();
    lector.onload = function(e) {
        const contenido = e.target.result;
        document.getElementById('inputText').value = contenido;
        manejarEntrada();  // Actualiza el contador
        mostrarToast('Archivo cargado: ' + archivo.name);
    };
    lector.onerror = function() {
        mostrarToast('Error al leer el archivo');
    };
    lector.readAsText(archivo, 'UTF-8');

    // Limpia el input para permitir cargar el mismo archivo de nuevo
    event.target.value = '';

    function analizarTexto() {
        const texto = document.getElementById('inputText').value.trim();

        if (!texto) {
            mostrarToast('Escribe o carga un texto primero');
            return;
        }
        const resultado = ejecutarAnalisisLexico(texto, direccionActual);
        mostrarResultados(resultado);
    }

    // ── Mostrar resultados del análisis ──
    function mostrarResultados(resultado) {
        const tablesSection = document.getElementById('tablesSection');
        tablesSection.style.display = 'block';

        llenarTablaTokens(resultado.tokens);

        llenarTablaErrores(resultado.errores);

        if (resultado.errores.length === 0) {
            // Sin errores: muestra la traducción
            mostrarTraduccion(resultado.traduccion);
            actualizarStatus('Sin errores', 'ok');
        } else {
            // Con errores: muestra el conteo
            document.getElementById('outputText').innerHTML =
                '<span style="color:var(--red-error);font-style:italic;">' +
                '⚠ Se encontraron ' + resultado.errores.length + ' error(es). Revisa la tabla de errores.</span>';
            actualizarStatus(resultado.errores.length + ' error(es)', 'error');
            mostrarTab('errores');
        }
    }

    function llenarTablaTokens(tokens) {
        const cuerpo = document.getElementById('tokensBody');
        cuerpo.innerHTML = '';

        tokens.forEach(function(token, i) {
            const fila = document.createElement('tr');
            fila.innerHTML =
                '<td>' + (i + 1) + '</td>' +
                '<td><strong>' + escaparHTML(token.lexema) + '</strong></td>' +
                '<td><span class="badge badge-' + token.categoria.toLowerCase() + '">' +
                token.categoria + '</span></td>' +
                '<td>' + (token.subcategoria || '—') + '</td>' +
                '<td>' + token.linea + '</td>' +
                '<td>' + token.columna + '</td>';
            cuerpo.appendChild(fila);
        });
    }

    function llenarTablaErrores(errores) {
        const cuerpo = document.getElementById('erroresBody');
        cuerpo.innerHTML = '';

        errores.forEach(function(error, i) {
            const fila = document.createElement('tr');
            fila.innerHTML =
                '<td>' + (i + 1) + '</td>' +
                '<td><span class="badge badge-error">' + escaparHTML(error.tipo) + '</span></td>' +
                '<td>' + escaparHTML(error.lexema) + '</td>' +
                '<td>' + error.linea + '</td>' +
                '<td>' + error.columna + '</td>' +
                '<td>' + escaparHTML(error.descripcion) + '</td>';
            cuerpo.appendChild(fila);
        });
    }

    function mostrarTraduccion(traduccion) {
        const contenedor = document.getElementById('outputText');

        if (!traduccion || traduccion.trim() === '') {
            contenedor.innerHTML = '<span class="output-placeholder">Sin traducción disponible.</span>';
            return;
        }
        const palabras = traduccion.split(' ');
        const html = palabras.map(function(p) {
            return '<span class="word-chip">' + escaparHTML(p) + '</span>';
        }).join(' ');

        contenedor.innerHTML = html;
    }

    function mostrarTab(nombre) {
        document.querySelectorAll('.tab-content').forEach(function(el) {
            el.style.display = 'none';
        });
        document.querySelectorAll('.tab').forEach(function(el) {
            el.classList.remove('active');
        });

        document.getElementById('tab-' + nombre).style.display = 'block';

        const botones = document.querySelectorAll('.tab');
        botones.forEach(function(btn) {
            if (btn.textContent.toLowerCase().includes(nombre)) {
                btn.classList.add('active');
            }
        });
    }

    function copiarTraduccion() {
        const contenedor = document.getElementById('outputText');
        const texto = contenedor.innerText || contenedor.textContent;

        if (!texto || texto.includes('aparecerá aquí')) {
            mostrarToast('No hay traducción que copiar');
            return;
        }

        navigator.clipboard.writeText(texto).then(function() {
            mostrarToast('Traducción copiada');
        }).catch(function() {
            mostrarToast('No se pudo copiar');
        });
    }

    function mostrarToast(mensaje) {
        const toast = document.getElementById('toast');
        toast.textContent = mensaje;
        toast.classList.add('visible');
        setTimeout(function() {
            toast.classList.remove('visible');
        }, 2500);
    }

    function escaparHTML(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function ejecutarAnalisisLexico(texto, direccion) {
        // Resultado que se devolverá a mostrarResultados()
        const resultado = {
            tokens:    [],
            errores:   [],
            traduccion: ''
        };

        const lineas = texto.split('\n');

        lineas.forEach(function(lineaTexto, numLinea) {
            const partes = lineaTexto.match(/[\w']+|[.,!?;:()\-"]/g);
            if (!partes) return;

            let columna = 0;
            partes.forEach(function(lexema) {
                columna = lineaTexto.indexOf(lexema, columna);
                const info = clasificarPalabra(lexema, direccion);

                if (info.esError) {
                    // Agrega a tabla de errores
                    resultado.errores.push({
                        tipo:        'Léxico',
                        lexema:      lexema,
                        linea:       numLinea + 1,
                        columna:     columna + 1,
                        descripcion: info.descripcion
                    });
        } else {
                    resultado.tokens.push({
                        lexema:       lexema,
                        categoria:    info.categoria,
                        subcategoria: info.subcategoria,
                        linea:        numLinea + 1,
                        columna:      columna + 1
                    });
                }
                columna += lexema.length;
            });
        });
        if (resultado.errores.length === 0) {
            resultado.traduccion = '[Síntesis pendiente — se implementa en la Fase 3]';
        }

        return resultado;
                }

    function clasificarPalabra(lexema, direccion) {
        const palabra = lexema.toLowerCase();

        // ── Signos de puntuación ──
        if (/^[.,!?;:()\-"]$/.test(lexema)) {
            return { categoria: 'Puntuacion', subcategoria: lexema, esError: false };
        }

        // ── Números ──
        if (/^\d+$/.test(lexema)) {
            return { categoria: 'Numeral', subcategoria: 'Cardinal', esError: false };
        }
        // Diccionarios básicos EN (se expanden en el backend Java)
        const diccionarioEN = {
            // Artículos
            articulos: ['the', 'a', 'an'],
            // Pronombres personales
            pronombres: ['i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their'],
            // Verbos comunes
            verbos: ['is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall', 'should', 'may', 'might', 'can', 'could', 'run', 'runs', 'eat', 'eats', 'go', 'goes', 'see', 'sees', 'come', 'comes', 'know', 'knows', 'think', 'like', 'want', 'need', 'love', 'feel', 'read', 'write', 'speak', 'listen', 'work', 'play', 'study', 'learn', 'teach', 'help', 'make', 'take', 'give', 'get', 'put', 'set', 'let'],
            // Sustantivos comunes
            sustantivos: ['cat', 'dog', 'house', 'car', 'book', 'man', 'woman', 'child', 'day', 'year', 'time', 'way', 'life', 'world', 'school', 'work', 'water', 'food', 'city', 'country', 'family', 'friend', 'hand', 'eye', 'face', 'head', 'door', 'table', 'chair', 'room', 'tree', 'flower', 'bird', 'sun', 'moon', 'star', 'sky', 'street', 'name', 'word', 'sentence'],
            // Adjetivos
            adjetivos: ['good', 'bad', 'big', 'small', 'new', 'old', 'young', 'long', 'short', 'high', 'low', 'great', 'little', 'own', 'right', 'left', 'next', 'last', 'early', 'late', 'hard', 'easy', 'strong', 'weak', 'happy', 'sad', 'beautiful', 'ugly', 'fast', 'slow', 'hot', 'cold', 'warm', 'cool', 'white', 'black', 'red', 'blue', 'green', 'yellow'],
            // Adverbios
            adverbios: ['very', 'well', 'also', 'just', 'now', 'then', 'here', 'there', 'always', 'never', 'often', 'sometimes', 'still', 'already', 'soon', 'again', 'too', 'quite', 'much', 'more', 'most', 'less', 'least', 'only', 'really', 'quickly', 'slowly', 'early', 'late', 'together', 'away', 'back', 'up', 'down', 'out', 'in'],
            // Preposiciones
            preposiciones: ['in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'among', 'under', 'over', 'near', 'behind', 'beside'],
            // Conjunciones
            conjunciones: ['and', 'but', 'or', 'nor', 'for', 'yet', 'so', 'because', 'since', 'while', 'although', 'though', 'if', 'unless', 'when', 'where', 'that', 'which', 'who', 'whom', 'whose', 'whether', 'until', 'after', 'before']
        };

        // Diccionario básico ES
        const diccionarioES = {
            articulos: ['el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas'],
            pronombres: ['yo', 'tú', 'él', 'ella', 'nosotros', 'vosotros', 'ellos', 'ellas', 'me', 'te', 'se', 'nos', 'le', 'lo', 'la', 'les', 'mi', 'tu', 'su', 'nuestro', 'vuesto'],
            verbos: ['es', 'son', 'era', 'eran', 'ser', 'estar', 'estoy', 'estás', 'está', 'estamos', 'tienen', 'tiene', 'tener', 'ir', 'va', 'voy', 'vas', 'correr', 'corre', 'ver', 'come', 'comer', 'sabe', 'saber', 'querer', 'quiere', 'poder', 'puede', 'hacer', 'hace', 'dar', 'hablar', 'habla', 'escribir', 'escribe', 'leer', 'lee', 'vivir', 'vive', 'trabajar', 'trabaja', 'estudiar', 'estudia', 'ayudar', 'necesitar'],
            sustantivos: ['gato', 'perro', 'casa', 'carro', 'libro', 'hombre', 'mujer', 'niño', 'día', 'año', 'tiempo', 'vida', 'mundo', 'escuela', 'trabajo', 'agua', 'comida', 'ciudad', 'país', 'familia', 'amigo', 'mano', 'ojo', 'cara', 'puerta', 'mesa', 'silla', 'árbol', 'flor', 'pájaro', 'sol', 'luna', 'estrella', 'cielo', 'calle', 'nombre', 'palabra', 'oración'],
            adjetivos: ['bueno', 'malo', 'grande', 'pequeño', 'nuevo', 'viejo', 'joven', 'largo', 'corto', 'alto', 'bajo', 'bello', 'feo', 'rápido', 'lento', 'caliente', 'frío', 'cálido', 'fresco', 'blanco', 'negro', 'rojo', 'azul', 'verde', 'amarillo', 'feliz', 'triste', 'fuerte', 'débil'],
            adverbios: ['muy', 'bien', 'también', 'ahora', 'aquí', 'allí', 'siempre', 'nunca', 'a veces', 'ya', 'pronto', 'todavía', 'solo', 'más', 'menos', 'rápido', 'lento', 'temprano', 'tarde', 'juntos', 'lejos', 'cerca'],
            preposiciones: ['en', 'sobre', 'a', 'para', 'de', 'con', 'por', 'desde', 'hasta', 'entre', 'antes', 'después', 'bajo', 'ante', 'tras', 'sin', 'durante', 'según', 'contra', 'hacia'],
            conjunciones: ['y', 'e', 'pero', 'o', 'u', 'ni', 'porque', 'como', 'aunque', 'si', 'cuando', 'donde', 'que', 'mientras', 'sino', 'pues', 'ya que', 'a menos que', 'con tal de que']
        };

        // Selecciona el diccionario según la dirección
        const dic = (direccion === 'en-es') ? diccionarioEN : diccionarioES;

        if (palabra === 'al' || palabra === 'del') {
            return { categoria: 'Contraccion', subcategoria: palabra, esError: false };
        }

        // Verifica en cada categoría del diccionario activo
        if (dic.articulos.includes(palabra))      return { categoria: 'Articulo',     subcategoria: 'Definido/Indefinido', esError: false };
        if (dic.pronombres.includes(palabra))     return { categoria: 'Pronombre',    subcategoria: 'Personal',            esError: false };
        if (dic.verbos.includes(palabra))         return { categoria: 'Verbo',        subcategoria: 'Conjugado',           esError: false };
        if (dic.sustantivos.includes(palabra))    return { categoria: 'Sustantivo',   subcategoria: 'Común',               esError: false };
        if (dic.adjetivos.includes(palabra))      return { categoria: 'Adjetivo',     subcategoria: 'Calificativo',        esError: false };
        if (dic.adverbios.includes(palabra))      return { categoria: 'Adverbio',     subcategoria: 'Modo/Tiempo',         esError: false };
        if (dic.preposiciones.includes(palabra))  return { categoria: 'Preposicion',  subcategoria: '—',                   esError: false };
        if (dic.conjunciones.includes(palabra))   return { categoria: 'Conjuncion',   subcategoria: 'Coordinante',         esError: false };

        // Si no se reconoce: error léxico
        return {
            categoria:    'Desconocido',
            subcategoria: '—',
            esError:      true,
            descripcion:  'La palabra "' + lexema + '" no pertenece a ninguna categoría reconocida.'
        };
    }
 