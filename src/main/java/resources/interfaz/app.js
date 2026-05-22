// ══════════════════════════════════════════════════════
//  app.js — Ellix Compiler Translator
//  Integración completa: léxico + sintáctico + semántico
//  La síntesis (traducción real) será implementada por el Programador 3
// ══════════════════════════════════════════════════════

let direccionActual = 'en-es';

const TEXTO_PRUEBA = "The cat runs quickly in the house.\nShe is a beautiful and happy girl.\nThey have good books at school.";

// ══════════════════════════════════════════════════════
//  SECCIÓN 1 — INICIO
// ══════════════════════════════════════════════════════

window.onload = function() {
    document.getElementById('inputText').value = TEXTO_PRUEBA;
    manejarEntrada();
    mostrarToast('Texto de prueba cargado');
};

// ══════════════════════════════════════════════════════
//  SECCIÓN 2 — CONTROL DE INTERFAZ
// ══════════════════════════════════════════════════════

function setDirection(dir) {
    direccionActual = dir;
    document.getElementById('btn-en-es').classList.toggle('active', dir === 'en-es');
    document.getElementById('btn-es-en').classList.toggle('active', dir === 'es-en');
    document.getElementById('label-input').textContent  = dir === 'en-es' ? 'Inglés'  : 'Español';
    document.getElementById('label-output').textContent = dir === 'en-es' ? 'Español' : 'Inglés';
    limpiarResultados();
    mostrarToast('Dirección cambiada: ' + (dir === 'en-es' ? 'Inglés → Español' : 'Español → Inglés'));
}

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
    document.getElementById('tokensBody').innerHTML   = '';
    document.getElementById('erroresBody').innerHTML  = '';
    document.getElementById('arbolContainer').innerHTML = '';
}

function actualizarStatus(texto, tipo) {
    const tag = document.getElementById('statusTag');
    tag.textContent = texto;
    tag.className   = 'status-tag ' + (tipo || '');
}

function mostrarTab(nombre) {
    document.querySelectorAll('.tab-content').forEach(function(el) { el.style.display = 'none'; });
    document.querySelectorAll('.tab').forEach(function(el) { el.classList.remove('active'); });
    document.getElementById('tab-' + nombre).style.display = 'block';
    document.querySelectorAll('.tab').forEach(function(btn) {
        if (btn.onclick && btn.onclick.toString().includes(nombre)) btn.classList.add('active');
    });
}

function copiarTraduccion() {
    const texto = document.getElementById('outputText').innerText;
    if (!texto || texto.includes('aparecerá aquí')) { mostrarToast('No hay traducción que copiar'); return; }
    navigator.clipboard.writeText(texto).then(function() { mostrarToast('Traducción copiada'); });
}

function mostrarToast(mensaje) {
    const toast = document.getElementById('toast');
    toast.textContent = mensaje;
    toast.classList.add('visible');
    setTimeout(function() { toast.classList.remove('visible'); }, 2500);
}

function escaparHTML(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ══════════════════════════════════════════════════════
//  SECCIÓN 3 — CARGA DE ARCHIVOS .txt
// ══════════════════════════════════════════════════════

function cargarArchivo(event) {
    const archivo = event.target.files[0];
    if (!archivo) return;
    if (!archivo.name.endsWith('.txt')) { mostrarToast('Solo se aceptan archivos .txt'); return; }
    const lector = new FileReader();
    lector.onload = function(e) {
        document.getElementById('inputText').value = e.target.result;
        manejarEntrada();
        mostrarToast('Archivo cargado: ' + archivo.name);
    };
    lector.readAsText(archivo, 'UTF-8');
    event.target.value = '';
}

// ══════════════════════════════════════════════════════
//  SECCIÓN 4 — PIPELINE DE ANÁLISIS
//  Léxico → Sintáctico → Semántico
//  Cada fase solo corre si la anterior fue exitosa
// ══════════════════════════════════════════════════════

function analizarTexto() {
    const texto = document.getElementById('inputText').value.trim();
    if (!texto) { mostrarToast('Escribe o carga un texto primero'); return; }

    limpiarResultados();
    document.getElementById('tablesSection').style.display = 'block';

    // ── Fase 1: Léxico ──
    const resultadoLexico = ejecutarAnalisisLexico(texto, direccionActual);
    llenarTablaTokens(resultadoLexico.tokens);

    if (resultadoLexico.errores.length > 0) {
        llenarTablaErrores(resultadoLexico.errores.map(function(e) {
            return { tipo: 'Léxico', lexema: e.lexema, linea: e.linea, columna: e.columna, descripcion: e.descripcion };
        }));
        actualizarStatus('Error léxico', 'error');
        mostrarMensajeOutput('⚠ Error léxico: no se puede continuar.', 'error');
        mostrarTab('errores');
        return;
    }

    // ── Fase 2: Sintáctico ──
    const resultadoSintactico = ejecutarAnalisisSintactico(resultadoLexico.tokens);

    if (resultadoSintactico.errores.length > 0) {
        llenarTablaErrores(resultadoSintactico.errores.map(function(e) {
            return { tipo: 'Sintáctico', lexema: e.lexema, linea: e.linea, columna: e.columna, descripcion: e.descripcion };
        }));
        actualizarStatus('Error sintáctico', 'error');
        mostrarMensajeOutput('⚠ Error sintáctico: no se genera árbol.', 'error');
        mostrarTab('errores');
        return;
    }

    // ── Árbol de Derivación ──
    const arbol = construirArbol(resultadoLexico.tokens);
    renderizarArbol(arbol);

    // ── Fase 3: Semántico ──
    const resultadoSemantico = ejecutarAnalisisSemantico(resultadoLexico.tokens, direccionActual);

    if (resultadoSemantico.errores.length > 0) {
        llenarTablaErrores(resultadoSemantico.errores.map(function(e) {
            return { tipo: 'Semántico', lexema: e.lexema, linea: e.linea, columna: e.columna, descripcion: e.descripcion };
        }));
        actualizarStatus('Error semántico', 'error');
        mostrarMensajeOutput('⚠ Error semántico detectado. Revisa la tabla de errores.', 'error');
        mostrarTab('errores');
        return;
    }

    // ── Todo exitoso ──
    actualizarStatus('Sin errores', 'ok');
    var traduccion = ejecutarSintesis(resultadoLexico.tokens, direccionActual);
    mostrarTraduccion(traduccion);
    mostrarTab('tokens');
}

// ── Muestra mensaje en panel de salida ──
function mostrarMensajeOutput(mensaje, tipo) {
    const color = tipo === 'error' ? 'var(--red-error)' : 'var(--green-ok)';
    document.getElementById('outputText').innerHTML =
        '<span style="color:' + color + ';font-style:italic;">' + escaparHTML(mensaje) + '</span>';
}

// ── Muestra traducción en el panel derecho ──
function mostrarTraduccion(traduccion) {
    const contenedor = document.getElementById('outputText');
    const palabras   = traduccion.split(' ');
    contenedor.innerHTML = palabras.map(function(p) {
        return '<span class="word-chip">' + escaparHTML(p) + '</span>';
    }).join(' ');
}

// ── Llena la tabla de tokens ──
function llenarTablaTokens(tokens) {
    const cuerpo = document.getElementById('tokensBody');
    cuerpo.innerHTML = '';
    tokens.forEach(function(token, i) {
        const fila = document.createElement('tr');
        fila.innerHTML =
            '<td>' + (i + 1) + '</td>' +
            '<td><strong>' + escaparHTML(token.lexema) + '</strong></td>' +
            '<td><span class="badge badge-' + token.categoria.toLowerCase() + '">' + token.categoria + '</span></td>' +
            '<td>' + (token.subcategoria || '—') + '</td>' +
            '<td>' + token.linea + '</td>' +
            '<td>' + token.columna + '</td>';
        cuerpo.appendChild(fila);
    });
}

// ── Llena la tabla de errores unificada ──
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

// ══════════════════════════════════════════════════════
//  SECCIÓN 5 — ÁRBOL DE DERIVACIÓN (visual interactivo)
// ══════════════════════════════════════════════════════

var COLORES_NODO = {
    'programa':      { fondo: '#3E2A14', texto: '#FAF7F2', borde: '#3E2A14' },
    'oracion':       { fondo: '#5C3D1E', texto: '#FAF7F2', borde: '#5C3D1E' },
    'sujeto':        { fondo: '#8B5E3C', texto: '#FAF7F2', borde: '#6B4426' },
    'predicado':     { fondo: '#8B5E3C', texto: '#FAF7F2', borde: '#6B4426' },
    'frase_nominal': { fondo: '#BFA880', texto: '#3E2A14', borde: '#9C7E5A' },
    'frase_verbal':  { fondo: '#BFA880', texto: '#3E2A14', borde: '#9C7E5A' },
    'frase_prep':    { fondo: '#D4C09A', texto: '#3E2A14', borde: '#B8985A' },
    'frase_adj':     { fondo: '#D4C09A', texto: '#3E2A14', borde: '#B8985A' },
    'terminal':      { fondo: '#FFFFFF', texto: '#3E2A14', borde: '#C4AE84' }
};

var escalaArbol = 1;
var arrastrandoArbol = false;

function renderizarArbol(raiz) {
    var contenedor = document.getElementById('arbolContainer');
    contenedor.innerHTML = '';
    if (!raiz) return;

    // Controles superiores
    var controles = document.createElement('div');
    controles.className = 'arbol-controles';
    controles.innerHTML =
        '<div class="arbol-zoom-grupo">' +
        '<button class="arbol-btn" onclick="zoomArbol(0.15)" title="Acercar">＋</button>' +
        '<span class="arbol-zoom-label" id="arbolZoomLabel">100%</span>' +
        '<button class="arbol-btn" onclick="zoomArbol(-0.15)" title="Alejar">－</button>' +
        '<button class="arbol-btn arbol-btn-reset" onclick="resetArbol()" title="Restablecer">↺</button>' +
        '</div>' +
        '<div class="arbol-leyenda">' +
        '<span class="arbol-leyenda-item" style="background:#3E2A14;color:#FAF7F2;">Programa</span>' +
        '<span class="arbol-leyenda-item" style="background:#8B5E3C;color:#FAF7F2;">Oración</span>' +
        '<span class="arbol-leyenda-item" style="background:#BFA880;color:#3E2A14;">Frase</span>' +
        '<span class="arbol-leyenda-item" style="background:#FFFFFF;color:#3E2A14;border:1.5px solid #C4AE84;">Token</span>' +
        '</div>';
    contenedor.appendChild(controles);

    // Área del SVG
    var svgWrapper = document.createElement('div');
    svgWrapper.className = 'arbol-svg-wrapper';
    svgWrapper.id        = 'arbolSvgWrapper';
    contenedor.appendChild(svgWrapper);

    // Calcula posiciones
    var nodos  = [];
    var lineas = [];
    calcularPosiciones(raiz, 0, nodos, lineas, { x: 0 });

    var PADDING = 60;
    var maxX = Math.max.apply(null, nodos.map(function(n) { return n.x; })) + PADDING;
    var maxY = Math.max.apply(null, nodos.map(function(n) { return n.y; })) + PADDING;

    // Crea el SVG
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width',   Math.max(maxX, 600));
    svg.setAttribute('height',  maxY);
    svg.setAttribute('xmlns',   'http://www.w3.org/2000/svg');
    svg.id = 'arbolSvg';

    // Fondo suave
    var fondo = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    fondo.setAttribute('width',  '100%');
    fondo.setAttribute('height', '100%');
    fondo.setAttribute('fill',   '#F8F4EE');
    svg.appendChild(fondo);

    // Dibuja las conexiones con curvas bezier
    lineas.forEach(function(l) {
        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        var mx   = (l.x1 + l.x2) / 2;
        var my   = (l.y1 + l.y2) / 2;
        var d    = 'M ' + l.x1 + ' ' + l.y1 +
            ' C ' + l.x1 + ' ' + my +
            ' ' + l.x2 + ' ' + my +
            ' ' + l.x2 + ' ' + l.y2;
        path.setAttribute('d',            d);
        path.setAttribute('fill',         'none');
        path.setAttribute('stroke',       l.terminal ? '#C4AE84' : '#9C7E5A');
        path.setAttribute('stroke-width', l.terminal ? '1.2' : '1.8');
        svg.appendChild(path);
    });

    // Dibuja los nodos
    nodos.forEach(function(n) {
        var color = COLORES_NODO[n.tipo] || COLORES_NODO['terminal'];
        var g     = document.createElementNS('http://www.w3.org/2000/svg', 'g');

        if (n.terminal) {
            // Token: rectángulo redondeado con sombra
            var sombra = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            sombra.setAttribute('x',       n.x - 28);
            sombra.setAttribute('y',       n.y - 11);
            sombra.setAttribute('width',   56);
            sombra.setAttribute('height',  26);
            sombra.setAttribute('rx',      8);
            sombra.setAttribute('fill',    'rgba(0,0,0,0.08)');
            g.appendChild(sombra);

            var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x',            n.x - 30);
            rect.setAttribute('y',            n.y - 13);
            rect.setAttribute('width',        60);
            rect.setAttribute('height',       26);
            rect.setAttribute('rx',           8);
            rect.setAttribute('fill',         color.fondo);
            rect.setAttribute('stroke',       color.borde);
            rect.setAttribute('stroke-width', '1.5');
            g.appendChild(rect);

        } else {
            // Regla BNF: elipse con sombra
            var sombraE = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            sombraE.setAttribute('cx',   n.x + 2);
            sombraE.setAttribute('cy',   n.y + 3);
            sombraE.setAttribute('rx',   50);
            sombraE.setAttribute('ry',   20);
            sombraE.setAttribute('fill', 'rgba(0,0,0,0.10)');
            g.appendChild(sombraE);

            var elipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            elipse.setAttribute('cx',            n.x);
            elipse.setAttribute('cy',            n.y);
            elipse.setAttribute('rx',            50);
            elipse.setAttribute('ry',            20);
            elipse.setAttribute('fill',          color.fondo);
            elipse.setAttribute('stroke',        color.borde);
            elipse.setAttribute('stroke-width',  '2');
            g.appendChild(elipse);
        }

        // Texto del nodo
        var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x',            n.x);
        text.setAttribute('y',            n.y + 5);
        text.setAttribute('text-anchor',  'middle');
        text.setAttribute('font-size',    n.terminal ? '12' : '11');
        text.setAttribute('font-weight',  n.terminal ? '700' : '600');
        text.setAttribute('fill',         color.texto);
        text.setAttribute('font-family',  'DM Sans, sans-serif');
        text.textContent = n.etiqueta.length > 12
            ? n.etiqueta.substring(0, 11) + '…'
            : n.etiqueta;
        g.appendChild(text);

        svg.appendChild(g);
    });

    svgWrapper.appendChild(svg);
    habilitarArrastre(svgWrapper);
}

// Calcula posición X,Y de cada nodo con espaciado cómodo
function calcularPosiciones(nodo, nivel, nodos, lineas, ref) {
    var ANCHO = 120;
    var ALTO  = 80;
    var id    = nodos.length;
    nodos.push(null); // reserva el lugar

    var posX, posY;
    posY = nivel * ALTO + 50;

    if (!nodo.hijos || nodo.hijos.length === 0) {
        posX = ref.x * ANCHO + 70;
        ref.x++;
    } else {
        var xInicio  = ref.x;
        var hijosIds = [];
        nodo.hijos.forEach(function(hijo) {
            hijosIds.push(nodos.length);
            calcularPosiciones(hijo, nivel + 1, nodos, lineas, ref);
        });
        var xFin = ref.x - 1;
        posX = ((xInicio + xFin) / 2) * ANCHO + 70;

        // Líneas curvas desde padre a cada hijo
        hijosIds.forEach(function(hid) {
            lineas.push({
                x1: posX,        y1: posY + 20,
                x2: nodos[hid].x, y2: nodos[hid].y - 20,
                terminal: nodos[hid].terminal
            });
        });
    }

    nodos[id] = {
        id:        id,
        etiqueta:  nodo.etiqueta,
        x:         posX,
        y:         posY,
        terminal:  nodo.esTerminal,
        tipo:      nodo.esTerminal ? 'terminal' : nodo.etiqueta,
        tieneHijos: nodo.hijos && nodo.hijos.length > 0
    };
}

function zoomArbol(delta) {
    escalaArbol = Math.min(2.5, Math.max(0.3, escalaArbol + delta));
    var svg   = document.getElementById('arbolSvg');
    var label = document.getElementById('arbolZoomLabel');
    if (svg)   svg.style.transform = 'scale(' + escalaArbol + ')';
    if (label) label.textContent   = Math.round(escalaArbol * 100) + '%';
}

function resetArbol() {
    escalaArbol = 1;
    var svg     = document.getElementById('arbolSvg');
    var wrapper = document.getElementById('arbolSvgWrapper');
    var label   = document.getElementById('arbolZoomLabel');
    if (svg)     svg.style.transform = 'scale(1)';
    if (wrapper) { wrapper.scrollLeft = 0; wrapper.scrollTop = 0; }
    if (label)   label.textContent   = '100%';
}

function habilitarArrastre(wrapper) {
    var startX, startY, scrollL, scrollT;

    wrapper.addEventListener('mousedown', function(e) {
        arrastrandoArbol = true;
        startX  = e.pageX;
        startY  = e.pageY;
        scrollL = wrapper.scrollLeft;
        scrollT = wrapper.scrollTop;
        wrapper.style.cursor = 'grabbing';
    });
    wrapper.addEventListener('mouseup',    function() { arrastrandoArbol = false; wrapper.style.cursor = 'grab'; });
    wrapper.addEventListener('mouseleave', function() { arrastrandoArbol = false; wrapper.style.cursor = 'grab'; });
    wrapper.addEventListener('mousemove',  function(e) {
        if (!arrastrandoArbol) return;
        e.preventDefault();
        wrapper.scrollLeft = scrollL - (e.pageX - startX);
        wrapper.scrollTop  = scrollT - (e.pageY - startY);
    });
    wrapper.addEventListener('wheel', function(e) {
        e.preventDefault();
        zoomArbol(e.deltaY < 0 ? 0.1 : -0.1);
    }, { passive: false });
}

// ══════════════════════════════════════════════════════
//  SECCIÓN 6 — ANÁLISIS SINTÁCTICO
//  Sincronizado con AnalizadorSintactico.java
// ══════════════════════════════════════════════════════

function ejecutarAnalisisSintactico(tokens) {
    const resultado = { errores: [] };
    let posicion = 0;

    function tokenActual()       { return posicion < tokens.length ? tokens[posicion] : null; }
    function avanzar()           { posicion++; }
    function esCategoria(cat)    { var t = tokenActual(); return t && t.categoria === cat; }
    function esFinOracion()      { var t = tokenActual(); return !t || t.categoria === 'Puntuacion'; }
    function esDeterminante()    {
        var t = tokenActual();
        return t && (t.categoria === 'Articulo' || t.categoria === 'Posesivo' ||
            t.categoria === 'Demostrativo' || t.categoria === 'Numeral');
    }

    function registrarError(desc) {
        var t = tokenActual();
        resultado.errores.push({
            lexema:      t ? t.lexema : 'fin de texto',
            linea:       t ? t.linea  : -1,
            columna:     t ? t.columna : -1,
            descripcion: desc
        });
    }

    function recuperar() {
        while (tokenActual() && !esCategoria('Puntuacion')) avanzar();
        if (tokenActual()) avanzar();
    }

    function analizarFraseNominal() {
        if (esCategoria('Pronombre'))  { avanzar(); return true; }
        if (esCategoria('Sustantivo')) { avanzar(); return true; }
        if (esDeterminante()) {
            avanzar();
            if (esCategoria('Adjetivo'))  avanzar();
            if (esCategoria('Sustantivo')) {
                avanzar();
                if (tokenActual() && esCategoria('Adjetivo')) avanzar();
                return true;
            }
            registrarError('Se esperaba un sustantivo después del determinante');
            return false;
        }
        return false;
    }

    function analizarFraseVerbal() {
        if (esCategoria('Adverbio')) avanzar();
        if (!esCategoria('Verbo'))   return false;
        avanzar();
        if (tokenActual() && esCategoria('Adverbio')) avanzar();
        return true;
    }

    function analizarPredicado() {
        if (!analizarFraseVerbal()) return false;
        if (!tokenActual() || esFinOracion()) return true;
        if (esCategoria('Preposicion')) {
            avanzar(); analizarFraseNominal(); return true;
        }
        if (esDeterminante() || esCategoria('Sustantivo') || esCategoria('Pronombre')) {
            analizarFraseNominal();
            if (tokenActual() && esCategoria('Preposicion')) { avanzar(); analizarFraseNominal(); }
            return true;
        }
        if (esCategoria('Adjetivo')) {
            avanzar();
            if (tokenActual() && esCategoria('Conjuncion')) {
                avanzar();
                if (esCategoria('Adjetivo')) avanzar();
            }
            return true;
        }
        return true;
    }

    // Analiza oración por oración
    while (posicion < tokens.length) {
        if (esCategoria('Puntuacion')) { avanzar(); continue; }

        if (!analizarFraseNominal()) {
            registrarError('Se esperaba un sujeto (pronombre, artículo + sustantivo)');
            recuperar(); continue;
        }
        if (!analizarPredicado()) {
            registrarError('Se esperaba un predicado (verbo)');
            recuperar(); continue;
        }
        if (tokenActual() && esCategoria('Puntuacion')) avanzar();
    }

    return resultado;
}

// ══════════════════════════════════════════════════════
//  SECCIÓN 7 — ÁRBOL (construcción de nodos)
//  Sincronizado con ArbolDerivacion.java
// ══════════════════════════════════════════════════════

function construirArbol(tokens) {
    let posicion = 0;

    function nodo(etiqueta, esTerminal) { return { etiqueta: etiqueta, esTerminal: esTerminal, hijos: [] }; }
    function tokenActual()    { return posicion < tokens.length ? tokens[posicion] : null; }
    function avanzar()        { posicion++; }
    function esCategoria(cat) { var t = tokenActual(); return t && t.categoria === cat; }
    function esFinOracion()   { var t = tokenActual(); return !t || t.categoria === 'Puntuacion'; }
    function esDeterminante() {
        var t = tokenActual();
        return t && (t.categoria === 'Articulo' || t.categoria === 'Posesivo' ||
            t.categoria === 'Demostrativo' || t.categoria === 'Numeral');
    }

    function fraseNominal() {
        var fn = nodo('frase_nominal', false);
        if (esCategoria('Pronombre') || esCategoria('Sustantivo')) {
            fn.hijos.push(nodo(tokenActual().lexema, true)); avanzar(); return fn;
        }
        if (esDeterminante()) {
            fn.hijos.push(nodo(tokenActual().lexema, true)); avanzar();
            if (esCategoria('Adjetivo'))  { fn.hijos.push(nodo(tokenActual().lexema, true)); avanzar(); }
            if (esCategoria('Sustantivo')) {
                fn.hijos.push(nodo(tokenActual().lexema, true)); avanzar();
                if (tokenActual() && esCategoria('Adjetivo')) { fn.hijos.push(nodo(tokenActual().lexema, true)); avanzar(); }
            }
        }
        return fn;
    }

    function fraseVerbal() {
        var fv = nodo('frase_verbal', false);
        if (esCategoria('Adverbio')) { fv.hijos.push(nodo(tokenActual().lexema, true)); avanzar(); }
        if (esCategoria('Verbo'))    { fv.hijos.push(nodo(tokenActual().lexema, true)); avanzar(); }
        if (tokenActual() && esCategoria('Adverbio')) { fv.hijos.push(nodo(tokenActual().lexema, true)); avanzar(); }
        return fv;
    }

    function frasePrep() {
        var fp = nodo('frase_prep', false);
        fp.hijos.push(nodo(tokenActual().lexema, true)); avanzar();
        fp.hijos.push(fraseNominal());
        return fp;
    }

    function predicado() {
        var pred = nodo('predicado', false);
        pred.hijos.push(fraseVerbal());
        if (!tokenActual() || esFinOracion()) return pred;
        if (esCategoria('Preposicion'))  { pred.hijos.push(frasePrep()); return pred; }
        if (esDeterminante() || esCategoria('Sustantivo') || esCategoria('Pronombre')) {
            pred.hijos.push(fraseNominal());
            if (tokenActual() && esCategoria('Preposicion')) pred.hijos.push(frasePrep());
            return pred;
        }
        if (esCategoria('Adjetivo')) {
            var fa = nodo('frase_adj', false);
            fa.hijos.push(nodo(tokenActual().lexema, true)); avanzar();
            if (tokenActual() && esCategoria('Conjuncion')) {
                fa.hijos.push(nodo(tokenActual().lexema, true)); avanzar();
                if (esCategoria('Adjetivo')) { fa.hijos.push(nodo(tokenActual().lexema, true)); avanzar(); }
            }
            pred.hijos.push(fa);
        }
        return pred;
    }

    function oracion() {
        var or = nodo('oracion', false);
        var suj = nodo('sujeto', false);
        suj.hijos.push(fraseNominal());
        or.hijos.push(suj);
        or.hijos.push(predicado());
        if (tokenActual() && esCategoria('Puntuacion')) {
            or.hijos.push(nodo(tokenActual().lexema, true)); avanzar();
        }
        return or;
    }

    var raiz = nodo('programa', false);
    while (posicion < tokens.length) {
        if (esCategoria('Puntuacion')) { avanzar(); continue; }
        raiz.hijos.push(oracion());
    }
    return raiz;
}

// ══════════════════════════════════════════════════════
//  SECCIÓN 8 — ANÁLISIS SEMÁNTICO
//  Sincronizado con AnalizadorSemantico.java
// ══════════════════════════════════════════════════════

function ejecutarAnalisisSemantico(tokens, direccion) {
    const resultado = { errores: [] };

    function registrarError(desc, token) {
        resultado.errores.push({
            lexema: token.lexema, linea: token.linea,
            columna: token.columna, descripcion: desc
        });
    }

    function esDeterminante(t) {
        return t.categoria === 'Articulo' || t.categoria === 'Posesivo' ||
            t.categoria === 'Demostrativo' || t.categoria === 'Numeral';
    }

    function esMasculinoES(d) { return /^(el|un|este|ese|aquel|mi|tu|su|nuestro|vuestro)$/.test(d); }
    function esFemeninoES(d)  { return /^(la|una|esta|esa|aquella|mi|tu|su|nuestra|vuestra)$/.test(d); }
    function esPluralES(d)    { return /^(los|las|unos|unas|estos|estas|esos|esas|aquellos|aquellas|mis|tus|sus|nuestros|nuestras)$/.test(d); }

    function esSustMasculinoES(s) {
        return /^(gato|perro|libro|hombre|niño|día|año|trabajo|sol|río|jardín|parque|edificio|carro|coche|pan|arroz|huevo|piso|corazón|color|número|problema|idioma|equipo|deporte)$/.test(s);
    }
    function esSustFemeninoES(s) {
        return /^(casa|mujer|niña|vida|escuela|ciudad|familia|mano|flor|luna|estrella|calle|palabra|oración|lengua|noche|semana|tienda|voz|historia|noticia|pregunta|respuesta|música|fruta|verdura)$/.test(s);
    }

    function buscarSujeto(pos) {
        for (var i = pos - 1; i >= 0; i--) {
            if (tokens[i].categoria === 'Pronombre' || tokens[i].categoria === 'Sustantivo') return tokens[i];
            if (tokens[i].categoria === 'Puntuacion') break;
        }
        return null;
    }

    tokens.forEach(function(token, i) {

        // Concordancia determinante-sustantivo en español
        if (esDeterminante(token) && direccion === 'es-en') {
            var sig = i + 1 < tokens.length ? tokens[i + 1] : null;
            if (sig && sig.categoria === 'Adjetivo' && i + 2 < tokens.length) sig = tokens[i + 2];
            if (sig && sig.categoria === 'Sustantivo') {
                var d = token.lexema.toLowerCase();
                var s = sig.lexema.toLowerCase();
                if (esMasculinoES(d) && esSustFemeninoES(s))
                    registrarError('Concordancia de género incorrecta: "' + d + '" (masculino) con "' + s + '" (femenino)', token);
                else if (esFemeninoES(d) && esSustMasculinoES(s))
                    registrarError('Concordancia de género incorrecta: "' + d + '" (femenino) con "' + s + '" (masculino)', token);
                if (esPluralES(d) && !s.endsWith('s'))
                    registrarError('Concordancia de número incorrecta: "' + d + '" (plural) con "' + s + '" (singular)', token);
            }
        }

        // Concordancia sujeto-verbo
        if (token.categoria === 'Verbo') {
            var sujeto = buscarSujeto(i);
            if (!sujeto) return;
            var suj  = sujeto.lexema.toLowerCase();
            var verb = token.lexema.toLowerCase();

            if (direccion === 'en-es') {
                if (/^(he|she|it)$/.test(suj) && /^(are|were|have|do)$/.test(verb))
                    registrarError('Concordancia incorrecta: "' + suj + '" debe usar forma singular, no "' + verb + '"', token);
                if (suj === 'i' && /^(is|are|were)$/.test(verb))
                    registrarError('Concordancia incorrecta: "I" debe usar "am" o "was", no "' + verb + '"', token);
                if (/^(they|we|you)$/.test(suj) && /^(is|was|has|does)$/.test(verb))
                    registrarError('Concordancia incorrecta: "' + suj + '" (plural) no debe usar "' + verb + '" (singular)', token);
            } else {
                if (suj === 'yo' && /^(es|son|era|eran|fue|fueron)$/.test(verb))
                    registrarError('Concordancia incorrecta: "yo" no debe usar "' + verb + '"', token);
                if (/^(él|ella)$/.test(suj) && /^(son|somos|estamos|están|fueron)$/.test(verb))
                    registrarError('Concordancia incorrecta: "' + suj + '" (singular) no debe usar "' + verb + '" (plural)', token);
                if (/^(ellos|ellas|nosotros|nosotras)$/.test(suj) && /^(es|fue|está|tiene)$/.test(verb))
                    registrarError('Concordancia incorrecta: "' + suj + '" (plural) no debe usar "' + verb + '" (singular)', token);
            }
        }
    });

    return resultado;
}

// ══════════════════════════════════════════════════════
//  SECCIÓN 9 — ANÁLISIS LÉXICO
//  Sincronizado con AnalizadorLexico.java,
//  DiccionarioIngles.java y DiccionarioEspanol.java
// ══════════════════════════════════════════════════════

function ejecutarAnalisisLexico(texto, direccion) {
    const resultado = { tokens: [], errores: [] };
    const lineas = texto.split('\n');

    lineas.forEach(function(lineaTexto, numLinea) {
        const partes = lineaTexto.match(/[\wáéíóúüñÁÉÍÓÚÜÑ']+|[.,!?;:()'"\-]/g);
        if (!partes) return;
        let posicion = 0;
        partes.forEach(function(lexema) {
            const columna = lineaTexto.indexOf(lexema, posicion) + 1;
            const info    = clasificarPalabra(lexema, direccion);
            if (info.esError) {
                resultado.errores.push({ lexema: lexema, linea: numLinea + 1, columna: columna, descripcion: 'Palabra no reconocida: "' + lexema + '"' });
            } else {
                resultado.tokens.push({ lexema: lexema, categoria: info.categoria, subcategoria: info.subcategoria, linea: numLinea + 1, columna: columna });
            }
            posicion = lineaTexto.indexOf(lexema, posicion) + lexema.length;
        });
    });
    return resultado;
}

function clasificarPalabra(lexema, direccion) {
    const p = lexema.toLowerCase();
    if (/^[.,!?;:()'"\-]$/.test(lexema)) return { categoria: 'Puntuacion', subcategoria: lexema, esError: false };
    if (/^\d+$/.test(lexema))            return { categoria: 'Numeral', subcategoria: 'Cardinal', esError: false };
    if (p === 'al' || p === 'del')       return { categoria: 'Contraccion', subcategoria: p, esError: false };
    return (direccion === 'en-es') ? clasificarIngles(lexema, p) : clasificarEspanol(lexema, p);
}

function clasificarIngles(lexema, p) {
    if (/^(the|a|an)$/.test(p))                                                                    return { categoria: 'Articulo',     subcategoria: 'Definido/Indefinido', esError: false };
    if (/^(my|your|his|her|its|our|their)$/.test(p))                                              return { categoria: 'Posesivo',     subcategoria: 'Posesivo',            esError: false };
    if (/^(this|that|these|those)$/.test(p))                                                      return { categoria: 'Demostrativo', subcategoria: 'Demostrativo',        esError: false };
    if (/^(i|you|he|she|it|we|they|me|him|her|us|them|who|whom|whose|which|what|myself|yourself|himself|herself|itself|ourselves|themselves)$/.test(p)) return { categoria: 'Pronombre', subcategoria: 'Personal', esError: false };
    if (/^(is|are|was|were|be|been|being|am|have|has|had|do|does|did|will|would|shall|should|may|might|can|could|must|run|runs|ran|eat|eats|ate|go|goes|went|see|sees|saw|come|comes|came|know|knows|knew|think|thinks|thought|like|likes|liked|want|wants|wanted|need|needs|needed|love|loves|loved|feel|feels|felt|read|reads|write|writes|wrote|written|speak|speaks|spoke|listen|listens|listened|work|works|worked|play|plays|played|study|studies|studied|learn|learns|learned|teach|teaches|taught|help|helps|helped|make|makes|made|take|takes|took|taken|give|gives|gave|given|get|gets|got|put|puts|set|sets|let|lets|say|says|said|tell|tells|told|ask|asks|asked|answer|answers|answered|find|finds|found|keep|keeps|kept|start|starts|started|stop|stops|stopped|open|opens|opened|close|closes|closed|call|calls|called|try|tries|tried|use|uses|used|show|shows|showed|shown|move|moves|moved|live|lives|lived|believe|believes|believed|hold|holds|held|bring|brings|brought|happen|happens|happened|walk|walks|walked|turn|turns|turned|begin|begins|began|begun|carry|carries|carried|wait|waits|waited)$/.test(p)) return { categoria: 'Verbo', subcategoria: 'Conjugado', esError: false };
    if (/^(very|well|also|just|now|then|here|there|always|never|often|sometimes|rarely|usually|still|already|soon|again|too|quite|much|more|most|less|least|only|really|quickly|slowly|early|late|together|away|back|up|down|out|perhaps|maybe|certainly|probably|definitely|almost|enough|even|else|instead|yesterday|today|tomorrow|ago|everywhere|somewhere|nowhere|anywhere|once|twice|thrice)$/.test(p)) return { categoria: 'Adverbio', subcategoria: detectarSubtipoAdverbioEN(p), esError: false };
    if (/^(in|on|at|to|for|of|with|by|from|up|about|into|through|during|before|after|above|below|between|among|under|over|near|behind|beside|along|across|around|against|without|within|beyond|toward|towards|despite|except|per|since|until|upon)$/.test(p)) return { categoria: 'Preposicion', subcategoria: '—', esError: false };
    if (/^(and|but|or|nor|for|yet|so|both|either|neither)$/.test(p))                             return { categoria: 'Conjuncion',   subcategoria: 'Coordinante',         esError: false };
    if (/^(because|since|although|though|if|unless|until|when|where|while|that|which|who|whom|whose|as|than|whether|whenever|wherever|however|whatever|whoever)$/.test(p)) return { categoria: 'Conjuncion', subcategoria: 'Subordinante', esError: false };
    if (/^(good|bad|big|small|new|old|young|long|short|high|low|great|little|own|right|left|next|last|hard|easy|strong|weak|happy|sad|beautiful|ugly|fast|slow|hot|cold|warm|cool|white|black|red|blue|green|yellow|orange|purple|brown|gray|large|tiny|huge|tall|wide|narrow|deep|rich|poor|busy|free|full|empty|clean|dirty|quiet|loud|bright|dark|important|different|possible|sure|ready|open|closed|simple|complex|special|common|first|second|third|other|same|only|whole|real|true|false)$/.test(p)) return { categoria: 'Adjetivo', subcategoria: 'Calificativo', esError: false };
    if (/^(cat|dog|house|car|book|man|woman|child|boy|girl|baby|day|year|time|way|life|world|school|work|water|food|city|country|family|friend|hand|eye|face|head|door|table|chair|room|tree|flower|bird|sun|moon|star|sky|street|name|word|sentence|language|morning|afternoon|evening|night|week|month|money|price|store|market|road|heart|mind|body|voice|sound|light|color|letter|number|story|news|question|answer|problem|idea|king|queen|teacher|student|doctor|mother|father|son|daughter|brother|sister|people|person|place|thing|part|air|fire|earth|ground|river|sea|ocean|garden|park|building|window|wall|floor|computer|phone|paper|pen|pencil|music|art|game|sport|team|fish|horse|cow|sheep|pig|lion|tiger|bear|apple|bread|milk|rice|egg|meat|fruit|vegetable)$/.test(p)) return { categoria: 'Sustantivo', subcategoria: 'Común', esError: false };
    if (/^(oh|wow|hey|hi|hello|bye|yes|no|ok|okay|ouch|hmm|ah|aha|oops|hurray|alas|bravo)$/.test(p)) return { categoria: 'Interjeccion', subcategoria: '—', esError: false };
    return { categoria: 'Desconocido', subcategoria: '—', esError: true };
}

function detectarSubtipoAdverbioEN(p) {
    if (/^(now|then|yesterday|today|tomorrow|ago|soon|already|still|early|late)$/.test(p))   return 'Tiempo';
    if (/^(here|there|everywhere|somewhere|nowhere|anywhere|away|back|up|down|out)$/.test(p)) return 'Lugar';
    if (/^(very|much|more|most|less|least|quite|almost|enough|once|twice|thrice)$/.test(p))  return 'Cantidad';
    if (/^(well|quickly|slowly|really|together|instead)$/.test(p))                          return 'Modo';
    if (/^(always|certainly|definitely|yes|also)$/.test(p))                                 return 'Afirmación';
    if (/^(never|rarely|nowhere)$/.test(p))                                                 return 'Negación';
    if (/^(perhaps|maybe|probably|possibly)$/.test(p))                                      return 'Duda';
    return 'Modo';
}

function clasificarEspanol(lexema, p) {
    if (/^(el|la|los|las|un|una|unos|unas|lo)$/.test(p))                                          return { categoria: 'Articulo',     subcategoria: 'Definido/Indefinido', esError: false };
    if (/^(mi|mis|tu|tus|su|sus|nuestro|nuestra|nuestros|nuestras|vuestro|vuestra|vuestros|vuestras|mío|mía|míos|mías|tuyo|tuya|tuyos|tuyas|suyo|suya|suyos|suyas)$/.test(p)) return { categoria: 'Posesivo', subcategoria: 'Posesivo', esError: false };
    if (/^(este|esta|estos|estas|ese|esa|esos|esas|aquel|aquella|aquellos|aquellas|esto|eso|aquello)$/.test(p)) return { categoria: 'Demostrativo', subcategoria: 'Demostrativo', esError: false };
    if (/^(yo|tú|él|ella|nosotros|nosotras|vosotros|vosotras|ellos|ellas|me|te|se|nos|os|le|lo|la|les|quien|quienes|que|cual|cuales|alguien|nadie|algo|nada|mismo|misma|mismos|mismas)$/.test(p)) return { categoria: 'Pronombre', subcategoria: 'Personal', esError: false };
    if (/^(es|son|era|eran|fue|fueron|ser|sido|siendo|estar|estoy|estás|está|estamos|estáis|están|estuvo|estuvieron|haber|he|has|ha|hemos|habéis|han|hubo|tener|tengo|tienes|tiene|tenemos|tienen|tuvo|tuvieron|ir|voy|vas|va|vamos|van|hacer|hago|haces|hace|hacemos|hacen|hizo|hicieron|poder|puedo|puedes|puede|podemos|pueden|pudo|pudieron|querer|quiero|quieres|quiere|queremos|quieren|quiso|quisieron|saber|sé|sabes|sabe|sabemos|saben|supo|supieron|ver|veo|ves|ve|vemos|ven|vio|vieron|dar|doy|das|da|damos|dan|dio|dieron|decir|digo|dices|dice|decimos|dicen|dijo|dijeron|hablar|hablo|hablas|habla|hablamos|hablan|habló|hablaron|comer|como|comes|come|comemos|comen|comió|comieron|vivir|vivo|vives|vive|vivimos|viven|vivió|vivieron|trabajar|trabajo|trabajas|trabaja|trabajamos|trabajan|trabajó|estudiar|estudio|estudias|estudia|estudiamos|estudian|estudió|correr|corro|corres|corre|corremos|corren|corrió|leer|leo|lees|lee|leemos|leen|leyó|leyeron|escribir|escribo|escribes|escribe|escribimos|escriben|escribió|escuchar|escucho|escuchas|escucha|escuchamos|escuchan|escuchó|ayudar|ayudo|ayudas|ayuda|ayudamos|ayudan|ayudó|necesitar|necesito|necesitas|necesita|necesitamos|necesitan|amar|amo|amas|ama|amamos|aman|amó|amaron|pensar|pienso|piensas|piensa|pensamos|piensan|pensó|sentir|siento|sientes|siente|sentimos|sienten|sintió|caminar|camino|caminas|camina|caminamos|caminan|caminó|llevar|llevo|llevas|lleva|llevamos|llevan|llevó|llamar|llamo|llamas|llama|llamamos|llaman|llamó|comenzar|comienzo|comienzas|comienza|comenzamos|comienzan|comenzó|terminar|termino|terminas|termina|terminamos|terminan|terminó|abrir|abro|abres|abre|abrimos|abren|abrió|cerrar|cierro|cierras|cierra|cerramos|cierran|cerró)$/.test(p)) return { categoria: 'Verbo', subcategoria: 'Conjugado', esError: false };
    if (/^(muy|bien|también|ya|ahora|entonces|aquí|allí|allá|siempre|nunca|jamás|frecuentemente|raramente|todavía|aún|pronto|enseguida|antes|después|demasiado|bastante|poco|mucho|más|menos|casi|solo|solamente|únicamente|realmente|verdaderamente|rápido|rápidamente|lento|lentamente|temprano|tarde|lejos|cerca|quizás|quizá|acaso|sí|claro|efectivamente|ciertamente|no|tampoco|ayer|hoy|mañana|anoche)$/.test(p)) return { categoria: 'Adverbio', subcategoria: detectarSubtipoAdverbioES(p), esError: false };
    if (/^(a|ante|bajo|con|contra|de|desde|durante|en|entre|hacia|hasta|mediante|para|por|según|sin|sobre|tras|versus|vía|excepto|salvo|incluso|encima|debajo|delante|detrás|dentro|fuera|cerca|lejos|junto|alrededor)$/.test(p)) return { categoria: 'Preposicion', subcategoria: '—', esError: false };
    if (/^(y|e|ni|pero|mas|sino|o|u|bien|sea)$/.test(p))                                          return { categoria: 'Conjuncion',   subcategoria: 'Coordinante',  esError: false };
    if (/^(que|porque|pues|si|aunque|como|cuando|mientras|donde|adonde|según|conforme|para|tan|tanto|después|antes)$/.test(p)) return { categoria: 'Conjuncion', subcategoria: 'Subordinante', esError: false };
    if (/^(bueno|buena|buenos|buenas|malo|mala|malos|malas|grande|grandes|pequeño|pequeña|pequeños|pequeñas|nuevo|nueva|nuevos|nuevas|viejo|vieja|viejos|viejas|joven|jóvenes|largo|larga|largos|largas|corto|corta|cortos|cortas|alto|alta|altos|altas|bajo|baja|bajos|bajas|bonito|bonita|bonitos|bonitas|feo|fea|feos|feas|rápido|rápida|rápidos|rápidas|lento|lenta|lentos|lentas|caliente|frío|fría|frías|fríos|cálido|cálida|fresco|fresca|blanco|blanca|negro|negra|rojo|roja|azul|azules|verde|verdes|amarillo|amarilla|anaranjado|morado|café|gris|feliz|triste|fuerte|débil|rico|pobre|limpio|sucio|lleno|vacío|importante|diferente|posible|especial|común|simple|primero|primera|segundo|segunda|tercero|tercera|último|última|siguiente|otro|misma|mismo|verdadero|falso|real|libre|abierto|cerrado)$/.test(p)) return { categoria: 'Adjetivo', subcategoria: 'Calificativo', esError: false };
    if (/^(gato|perro|casa|carro|coche|libro|hombre|mujer|niño|niña|bebé|chico|chica|día|año|tiempo|camino|vida|mundo|escuela|trabajo|agua|comida|ciudad|país|familia|amigo|amiga|mano|ojo|cara|cabeza|puerta|mesa|silla|cuarto|habitación|árbol|flor|pájaro|sol|luna|estrella|cielo|calle|nombre|palabra|oración|idioma|lengua|mañana|tarde|noche|semana|mes|dinero|precio|tienda|mercado|corazón|mente|cuerpo|voz|sonido|luz|color|letra|número|historia|noticia|pregunta|respuesta|problema|idea|rey|reina|maestro|maestra|estudiante|doctor|madre|padre|hijo|hija|hermano|hermana|gente|persona|lugar|cosa|parte|aire|fuego|tierra|suelo|río|mar|océano|jardín|parque|edificio|ventana|pared|piso|computadora|teléfono|papel|pluma|lápiz|música|arte|juego|deporte|equipo|pez|caballo|vaca|oveja|cerdo|león|tigre|oso|manzana|pan|leche|arroz|huevo|carne|fruta|verdura)$/.test(p)) return { categoria: 'Sustantivo', subcategoria: 'Común', esError: false };
    if (/^(oh|ay|eh|ah|oye|hola|adiós|sí|no|ok|uy|vaya|caramba|bravo|hurra|ojalá)$/.test(p))     return { categoria: 'Interjeccion', subcategoria: '—',            esError: false };
    return { categoria: 'Desconocido', subcategoria: '—', esError: true };
}

function detectarSubtipoAdverbioES(p) {
    if (/^(ahora|entonces|ya|todavía|aún|pronto|antes|después|ayer|hoy|mañana|anoche|tarde|temprano|enseguida)$/.test(p)) return 'Tiempo';
    if (/^(aquí|allí|allá|lejos|cerca|arriba|abajo|dentro|fuera|adelante|atrás)$/.test(p))                              return 'Lugar';
    if (/^(muy|mucho|poco|demasiado|bastante|más|menos|casi|tanto|tan)$/.test(p))                                       return 'Cantidad';
    if (/^(bien|mal|rápido|lento|rápidamente|lentamente|solamente|únicamente|realmente|verdaderamente)$/.test(p))       return 'Modo';
    if (/^(sí|claro|efectivamente|ciertamente|también)$/.test(p))                                                       return 'Afirmación';
    if (/^(no|nunca|jamás|tampoco)$/.test(p))                                                                           return 'Negación';
    if (/^(quizás|quizá|acaso|probablemente)$/.test(p))                                                                 return 'Duda';
    return 'Modo';
}