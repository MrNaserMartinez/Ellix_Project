// ══════════════════════════════════════════════════════
//  app.js — Ellix Compiler Translator
//  Integración completa: léxico + sintáctico + semántico
// ══════════════════════════════════════════════════════

let direccionActual = 'en-es';
let escalaArbol     = 1;
let arrastrando     = false;

const TEXTO_PRUEBA = "The cat runs quickly in the house.\nShe is a beautiful and happy girl.\nThey have good books at school.";

// ══════════════════════════════════════════════════════
//  SECCIÓN 1 — INICIO
// ══════════════════════════════════════════════════════

window.onload = function() {
    document.getElementById('inputText').value = TEXTO_PRUEBA;
    manejarEntrada();
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
    mostrarToast('Dirección: ' + (dir === 'en-es' ? 'Inglés → Español' : 'Español → Inglés'));
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
        if (btn.onclick && btn.onclick.toString().includes("'" + nombre + "'")) {
            btn.classList.add('active');
        }
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
//  SECCIÓN 3 — CARGA DE ARCHIVOS
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
// ══════════════════════════════════════════════════════

function analizarTexto() {
    const texto = document.getElementById('inputText').value.trim();
    if (!texto) { mostrarToast('Escribe o carga un texto primero'); return; }

    limpiarResultados();
    document.getElementById('tablesSection').style.display = 'block';

    // Fase 1: Léxico
    const resLexico = analizarLexico(texto, direccionActual);
    llenarTablaTokens(resLexico.tokens);

    if (resLexico.errores.length > 0) {
        llenarTablaErrores(resLexico.errores.map(function(e) {
            return { tipo:'Léxico', lexema:e.lexema, linea:e.linea, columna:e.columna, descripcion:e.descripcion };
        }));
        actualizarStatus('Error léxico', 'error');
        mostrarMensajeOutput('⚠ Error léxico: no se puede continuar.', 'error');
        mostrarTab('errores');
        return;
    }

    // Fase 2: Sintáctico
    const resSintactico = analizarSintactico(resLexico.tokens);

    if (resSintactico.errores.length > 0) {
        llenarTablaErrores(resSintactico.errores.map(function(e) {
            return { tipo:'Sintáctico', lexema:e.lexema, linea:e.linea, columna:e.columna, descripcion:e.descripcion };
        }));
        actualizarStatus('Error sintáctico', 'error');
        mostrarMensajeOutput('⚠ Error sintáctico: no se genera árbol.', 'error');
        mostrarTab('errores');
        return;
    }

    // Árbol de derivación
    var arbol = construirArbol(resLexico.tokens);
    renderizarArbol(arbol);

    // Fase 3: Semántico
    const resSemantico = analizarSemantico(resLexico.tokens, direccionActual);

    if (resSemantico.errores.length > 0) {
        llenarTablaErrores(resSemantico.errores.map(function(e) {
            return { tipo:'Semántico', lexema:e.lexema, linea:e.linea, columna:e.columna, descripcion:e.descripcion };
        }));
        actualizarStatus('Error semántico', 'error');
        mostrarMensajeOutput('⚠ Error semántico detectado.', 'error');
        mostrarTab('errores');
        return;
    }

    actualizarStatus('Sin errores', 'ok');
    // Síntesis: genera la traducción real palabra por palabra
    var traduccion = generarTraduccion(resLexico.tokens, direccionActual);
    mostrarTraduccion(traduccion);
    mostrarTab('tokens');
}

function mostrarMensajeOutput(msg, tipo) {
    const color = tipo === 'error' ? 'var(--red-error)' : 'var(--green-ok)';
    document.getElementById('outputText').innerHTML =
        '<span style="color:' + color + ';font-style:italic;">' + escaparHTML(msg) + '</span>';
}

function mostrarTraduccion(traduccion) {
    const contenedor = document.getElementById('outputText');
    contenedor.innerHTML = traduccion.split(' ').map(function(p) {
        return '<span class="word-chip">' + escaparHTML(p) + '</span>';
    }).join(' ');
}

function llenarTablaTokens(tokens) {
    const cuerpo = document.getElementById('tokensBody');
    cuerpo.innerHTML = '';
    tokens.forEach(function(t, i) {
        const fila = document.createElement('tr');
        fila.innerHTML =
            '<td>' + (i+1) + '</td>' +
            '<td><strong>' + escaparHTML(t.lexema) + '</strong></td>' +
            '<td><span class="badge badge-' + t.categoria.toLowerCase() + '">' + t.categoria + '</span></td>' +
            '<td>' + (t.subcategoria||'—') + '</td>' +
            '<td>' + t.linea + '</td>' +
            '<td>' + t.columna + '</td>';
        cuerpo.appendChild(fila);
    });
}

function llenarTablaErrores(errores) {
    const cuerpo = document.getElementById('erroresBody');
    cuerpo.innerHTML = '';
    errores.forEach(function(e, i) {
        const fila = document.createElement('tr');
        fila.innerHTML =
            '<td>' + (i+1) + '</td>' +
            '<td><span class="badge badge-error">' + escaparHTML(e.tipo) + '</span></td>' +
            '<td>' + escaparHTML(e.lexema) + '</td>' +
            '<td>' + e.linea + '</td>' +
            '<td>' + e.columna + '</td>' +
            '<td>' + escaparHTML(e.descripcion) + '</td>';
        cuerpo.appendChild(fila);
    });
}

// ══════════════════════════════════════════════════════
//  SECCIÓN 5 — ÁRBOL DE DERIVACIÓN
// ══════════════════════════════════════════════════════

var COLORES = {
    'programa':      { f:'#3E2A14', t:'#FAF7F2', b:'#3E2A14' },
    'oracion':       { f:'#5C3D1E', t:'#FAF7F2', b:'#5C3D1E' },
    'sujeto':        { f:'#8B5E3C', t:'#FAF7F2', b:'#6B4426' },
    'predicado':     { f:'#8B5E3C', t:'#FAF7F2', b:'#6B4426' },
    'frase_nominal': { f:'#BFA880', t:'#3E2A14', b:'#9C7E5A' },
    'frase_verbal':  { f:'#BFA880', t:'#3E2A14', b:'#9C7E5A' },
    'frase_prep':    { f:'#D4C09A', t:'#3E2A14', b:'#B8985A' },
    'frase_adj':     { f:'#D4C09A', t:'#3E2A14', b:'#B8985A' },
    'terminal':      { f:'#FFFFFF', t:'#3E2A14', b:'#C4AE84' }
};

function renderizarArbol(raiz) {
    var cont = document.getElementById('arbolContainer');
    cont.innerHTML = '';
    if (!raiz) return;

    var ctrl = document.createElement('div');
    ctrl.className = 'arbol-controles';
    ctrl.innerHTML =
        '<div class="arbol-zoom-grupo">' +
        '<button class="arbol-btn" onclick="zoomArbol(0.15)">＋</button>' +
        '<span class="arbol-zoom-label" id="arbolZoomLabel">100%</span>' +
        '<button class="arbol-btn" onclick="zoomArbol(-0.15)">－</button>' +
        '<button class="arbol-btn arbol-btn-reset" onclick="resetArbol()">↺ Reset</button>' +
        '</div>' +
        '<div class="arbol-leyenda">' +
        '<span class="arbol-leyenda-item" style="background:#3E2A14;color:#FAF7F2;">Programa</span>' +
        '<span class="arbol-leyenda-item" style="background:#8B5E3C;color:#FAF7F2;">Oración</span>' +
        '<span class="arbol-leyenda-item" style="background:#BFA880;color:#3E2A14;">Frase</span>' +
        '<span class="arbol-leyenda-item" style="background:#FFF;color:#3E2A14;border:1px solid #C4AE84;">Token</span>' +
        '</div>';
    cont.appendChild(ctrl);

    var wrapper = document.createElement('div');
    wrapper.className = 'arbol-svg-wrapper';
    wrapper.id        = 'arbolSvgWrapper';
    cont.appendChild(wrapper);

    var nodos = [], lineas = [];
    calcularPos(raiz, 0, nodos, lineas, { x: 0 });

    var PAD_X    = 100;
    var PAD_Y    = 80;
    var maxX     = Math.max.apply(null, nodos.map(function(n){ return n.x; })) + PAD_X;
    var maxY     = Math.max.apply(null, nodos.map(function(n){ return n.y; })) + PAD_Y;
    var wrapperW = Math.max(window.innerWidth - 80, 800);
    var svgW     = Math.max(maxX, wrapperW);
    var offset   = (svgW - maxX) / 2;

    nodos.forEach(function(n)  { n.x += offset; });
    lineas.forEach(function(l) { l.x1 += offset; l.x2 += offset; });

    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width',  svgW);
    svg.setAttribute('height', maxY);
    svg.id = 'arbolSvg';

    // Fondo
    var bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('width','100%'); bg.setAttribute('height','100%'); bg.setAttribute('fill','#F8F4EE');
    svg.appendChild(bg);

    // Líneas curvas
    lineas.forEach(function(l) {
        var my   = (l.y1 + l.y2) / 2;
        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M'+l.x1+' '+l.y1+' C'+l.x1+' '+my+' '+l.x2+' '+my+' '+l.x2+' '+l.y2);
        path.setAttribute('fill',         'none');
        path.setAttribute('stroke',       l.terminal ? '#C4AE84' : '#9C7E5A');
        path.setAttribute('stroke-width', l.terminal ? '1.2'     : '1.8');
        svg.appendChild(path);
    });

    // Nodos
    nodos.forEach(function(n) {
        var c = COLORES[n.tipo] || COLORES['terminal'];
        var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');

        // Calcula ancho dinámico según largo del texto
        var charW    = n.terminal ? 8 : 7;
        var minW     = n.terminal ? 55 : 80;
        var nodoW    = Math.max(minW, n.etiqueta.length * charW + 20);
        var nodoH    = 28;
        var rx_term  = nodoW / 2;

        if (n.terminal) {
            var sh = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            sh.setAttribute('x', n.x - rx_term + 2); sh.setAttribute('y', n.y - nodoH/2 + 2);
            sh.setAttribute('width', nodoW); sh.setAttribute('height', nodoH);
            sh.setAttribute('rx','8'); sh.setAttribute('fill','rgba(0,0,0,0.07)');
            g.appendChild(sh);
            var r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            r.setAttribute('x', n.x - rx_term); r.setAttribute('y', n.y - nodoH/2);
            r.setAttribute('width', nodoW); r.setAttribute('height', nodoH);
            r.setAttribute('rx','8'); r.setAttribute('fill', c.f);
            r.setAttribute('stroke', c.b); r.setAttribute('stroke-width','1.5');
            g.appendChild(r);
        } else {
            var rx_elipse = Math.max(44, n.etiqueta.length * charW / 2 + 12);
            var sh2 = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            sh2.setAttribute('cx', n.x+2); sh2.setAttribute('cy', n.y+3);
            sh2.setAttribute('rx', rx_elipse); sh2.setAttribute('ry','20');
            sh2.setAttribute('fill','rgba(0,0,0,0.09)');
            g.appendChild(sh2);
            var el = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            el.setAttribute('cx', n.x); el.setAttribute('cy', n.y);
            el.setAttribute('rx', rx_elipse); el.setAttribute('ry','20');
            el.setAttribute('fill', c.f); el.setAttribute('stroke', c.b);
            el.setAttribute('stroke-width','2');
            g.appendChild(el);
        }

        var txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        txt.setAttribute('x', n.x); txt.setAttribute('y', n.y+5);
        txt.setAttribute('text-anchor','middle');
        txt.setAttribute('font-size',   n.terminal ? '12' : '11');
        txt.setAttribute('font-weight', n.terminal ? '700' : '600');
        txt.setAttribute('fill', c.t);
        txt.setAttribute('font-family','DM Sans, sans-serif');
        txt.textContent = n.etiqueta; // sin truncar
        g.appendChild(txt);
        svg.appendChild(g);
    });

    wrapper.appendChild(svg);

    // Ajusta la altura del wrapper exactamente al contenido del SVG
    wrapper.style.height = (maxY + 50) + 'px';

    // Centra el scroll al generar
    setTimeout(function() {
        wrapper.scrollLeft = Math.max(0, (wrapper.scrollWidth - wrapper.clientWidth) / 2);
        wrapper.scrollTop  = 0;
    }, 50);

    habilitarArrastre(wrapper);
}

function calcularPos(nodo, nivel, nodos, lineas, ref) {
    var ANCHO = 90;   // más compacto horizontalmente
    var ALTO  = 90;   // más espacio vertical entre niveles
    var id    = nodos.length;
    nodos.push(null);
    var posX, posY = nivel * ALTO + 60;

    if (!nodo.hijos || nodo.hijos.length === 0) {
        posX = ref.x * ANCHO + 70;
        ref.x++;
    } else {
        var xIni = ref.x, hijosIds = [];
        nodo.hijos.forEach(function(h) {
            hijosIds.push(nodos.length);
            calcularPos(h, nivel+1, nodos, lineas, ref);
        });
        posX = ((xIni + ref.x - 1) / 2) * ANCHO + 70;
        hijosIds.forEach(function(hid) {
            lineas.push({ x1:posX, y1:posY+22, x2:nodos[hid].x, y2:nodos[hid].y-22, terminal:nodos[hid].terminal });
        });
    }

    nodos[id] = { id:id, etiqueta:nodo.etiqueta, x:posX, y:posY,
        terminal:nodo.esTerminal, tipo:nodo.esTerminal?'terminal':nodo.etiqueta };
}

function zoomArbol(delta) {
    escalaArbol = Math.min(2.5, Math.max(0.3, escalaArbol + delta));
    var svg = document.getElementById('arbolSvg');
    var lbl = document.getElementById('arbolZoomLabel');
    if (svg) svg.style.transform = 'scale(' + escalaArbol + ')';
    if (lbl) lbl.textContent     = Math.round(escalaArbol * 100) + '%';
}

function resetArbol() {
    escalaArbol = 1;
    var svg = document.getElementById('arbolSvg');
    var w   = document.getElementById('arbolSvgWrapper');
    var lbl = document.getElementById('arbolZoomLabel');
    if (svg) svg.style.transform = 'scale(1)';
    if (lbl) lbl.textContent     = '100%';
    if (w)   { w.scrollLeft = Math.max(0,(w.scrollWidth-w.clientWidth)/2); w.scrollTop=0; }
}

function habilitarArrastre(wrapper) {
    var sX, sY, sL, sT;
    wrapper.addEventListener('mousedown', function(e) {
        arrastrando=true; sX=e.pageX; sY=e.pageY;
        sL=wrapper.scrollLeft; sT=wrapper.scrollTop;
        wrapper.style.cursor='grabbing';
    });
    wrapper.addEventListener('mouseup',    function(){ arrastrando=false; wrapper.style.cursor='grab'; });
    wrapper.addEventListener('mouseleave', function(){ arrastrando=false; wrapper.style.cursor='grab'; });
    wrapper.addEventListener('mousemove',  function(e){
        if (!arrastrando) return;
        e.preventDefault();
        wrapper.scrollLeft = sL-(e.pageX-sX);
        wrapper.scrollTop  = sT-(e.pageY-sY);
    });
    wrapper.addEventListener('wheel', function(e){
        e.preventDefault(); zoomArbol(e.deltaY<0?0.1:-0.1);
    }, { passive:false });
}

// ══════════════════════════════════════════════════════
//  SECCIÓN 6 — ANÁLISIS LÉXICO
// ══════════════════════════════════════════════════════

// Lista de sustantivos en inglés (para verificar plurales sin recursión)
var SUST_EN = /^(cat|dog|bird|fish|horse|cow|sheep|pig|lion|tiger|bear|wolf|fox|rabbit|deer|elephant|monkey|snake|turtle|frog|butterfly|eagle|owl|parrot|penguin|dolphin|whale|shark|man|woman|boy|girl|child|baby|person|people|teacher|student|doctor|nurse|engineer|lawyer|king|queen|prince|princess|president|mother|father|son|daughter|brother|sister|friend|enemy|family|neighbor|stranger|hero|artist|musician|writer|actor|athlete|soldier|house|home|school|hospital|church|store|market|city|town|village|country|world|street|road|bridge|park|garden|forest|mountain|river|sea|ocean|lake|beach|island|room|kitchen|bedroom|bathroom|office|library|restaurant|hotel|airport|station|book|pen|pencil|paper|table|chair|door|window|wall|floor|phone|computer|television|camera|radio|car|bus|train|plane|boat|bicycle|bag|box|bottle|cup|plate|spoon|knife|fork|bed|pillow|blanket|mirror|lamp|clock|sun|moon|star|sky|cloud|rain|snow|wind|fire|water|air|earth|tree|flower|grass|leaf|seed|fruit|vegetable|apple|orange|banana|grape|strawberry|mango|bread|rice|meat|egg|milk|cheese|butter|sugar|salt|time|day|night|morning|afternoon|evening|week|month|year|hour|minute|second|life|death|love|hate|peace|war|truth|lie|idea|thought|dream|memory|story|news|word|sentence|language|name|number|color|music|art|game|sport|dance|song|money|price|work|job|business|food|health|energy|power|light|sound|problem|question|answer|reason|result|way|place|thing|part|group|team|heart|mind|body|hand|eye|face|head|voice|smile|tear|breath|weather|temperature|storm|thunder|lightning|building|roof|path|corner|center)$/;

// Lista de sustantivos en español (para verificar plurales sin recursión)
var SUST_ES = /^(gato|perro|pájaro|pez|caballo|vaca|oveja|cerdo|león|tigre|oso|lobo|zorro|conejo|ciervo|elefante|mono|serpiente|tortuga|rana|mariposa|águila|búho|loro|pingüino|delfín|ballena|tiburón|hombre|mujer|niño|niña|bebé|persona|gente|maestro|maestra|estudiante|doctor|doctora|ingeniero|ingeniera|abogado|abogada|rey|reina|príncipe|princesa|presidente|presidenta|madre|padre|hijo|hija|hermano|hermana|amigo|amiga|enemigo|enemiga|vecino|vecina|héroe|heroína|artista|músico|escritor|escritora|actor|actriz|atleta|soldado|policía|bombero|chico|chica|joven|anciano|anciana|casa|hogar|escuela|hospital|iglesia|tienda|mercado|ciudad|pueblo|aldea|país|mundo|calle|camino|puente|parque|jardín|bosque|montaña|río|mar|océano|lago|playa|isla|cuarto|habitación|cocina|baño|oficina|biblioteca|restaurante|hotel|aeropuerto|estación|edificio|ventana|pared|piso|puerta|techo|libro|pluma|lápiz|papel|mesa|silla|teléfono|computadora|televisión|cámara|radio|carro|coche|autobús|tren|avión|barco|bicicleta|bolsa|caja|botella|vaso|plato|cuchara|cuchillo|tenedor|cama|almohada|cobija|espejo|lámpara|reloj|sol|luna|estrella|cielo|nube|lluvia|nieve|viento|fuego|agua|aire|tierra|árbol|flor|hierba|hoja|semilla|fruta|verdura|manzana|naranja|plátano|uva|fresa|mango|pan|arroz|carne|huevo|leche|queso|mantequilla|azúcar|sal|tiempo|día|noche|mañana|tarde|semana|mes|año|hora|minuto|segundo|vida|muerte|amor|odio|paz|guerra|verdad|mentira|idea|pensamiento|sueño|memoria|historia|noticia|palabra|oración|idioma|lengua|nombre|número|color|música|arte|juego|deporte|baile|canción|dinero|precio|trabajo|empleo|negocio|comida|salud|energía|poder|luz|sonido|problema|pregunta|respuesta|razón|resultado|lugar|cosa|parte|grupo|equipo|corazón|mente|cuerpo|mano|ojo|cara|cabeza|voz|sonrisa|lágrima|respiración|clima|temperatura|tormenta|trueno|relámpago)$/;

function analizarLexico(texto, direccion) {
    var resultado = { tokens:[], errores:[] };
    var lineas = texto.split('\n');
    lineas.forEach(function(linea, numLinea) {
        var partes = linea.match(/[\wáéíóúüñÁÉÍÓÚÜÑ']+|[.,!?;:()'"\-]/g);
        if (!partes) return;
        var pos = 0;
        partes.forEach(function(lexema) {
            var col  = linea.indexOf(lexema, pos) + 1;
            var info = clasificar(lexema, direccion);
            if (info.esError) {
                resultado.errores.push({ lexema:lexema, linea:numLinea+1, columna:col, descripcion:'Palabra no reconocida: "'+lexema+'"' });
            } else {
                resultado.tokens.push({ lexema:lexema, categoria:info.cat, subcategoria:info.sub, linea:numLinea+1, columna:col });
            }
            pos = linea.indexOf(lexema, pos) + lexema.length;
        });
    });
    return resultado;
}

function clasificar(lexema, direccion) {
    var p = lexema.toLowerCase();
    if (/^[.,!?;:()'"\-]$/.test(lexema)) return { cat:'Puntuacion',  sub:lexema,    esError:false };
    if (/^\d+$/.test(lexema))            return { cat:'Numeral',     sub:'Cardinal', esError:false };
    if (p==='al'||p==='del')             return { cat:'Contraccion', sub:p,          esError:false };
    return direccion==='en-es' ? clasificarEN(p) : clasificarES(p);
}

function clasificarEN(p) {
    if (/^(the|a|an)$/.test(p))
        return { cat:'Articulo', sub:'Definido/Indefinido', esError:false };
    if (/^(my|your|his|her|its|our|their)$/.test(p))
        return { cat:'Posesivo', sub:'Posesivo', esError:false };
    if (/^(this|that|these|those)$/.test(p))
        return { cat:'Demostrativo', sub:'Demostrativo', esError:false };
    if (/^(i|you|he|she|it|we|they|me|him|her|us|them|who|whom|whose|which|what|myself|yourself|himself|herself|itself|ourselves|themselves)$/.test(p))
        return { cat:'Pronombre', sub:'Personal', esError:false };
    if (/^(is|are|was|were|be|been|being|am|have|has|had|do|does|did|will|would|shall|should|may|might|can|could|must|run|runs|ran|eat|eats|ate|go|goes|went|see|sees|saw|come|comes|came|know|knows|knew|think|thinks|thought|like|likes|liked|want|wants|wanted|need|needs|needed|love|loves|loved|feel|feels|felt|read|reads|write|writes|wrote|written|speak|speaks|spoke|listen|listens|listened|work|works|worked|play|plays|played|study|studies|studied|learn|learns|learned|teach|teaches|taught|help|helps|helped|make|makes|made|take|takes|took|taken|give|gives|gave|given|get|gets|got|put|puts|set|sets|let|lets|say|says|said|tell|tells|told|ask|asks|asked|answer|answers|answered|find|finds|found|keep|keeps|kept|start|starts|started|stop|stops|stopped|open|opens|opened|close|closes|closed|call|calls|called|try|tries|tried|use|uses|used|show|shows|showed|shown|move|moves|moved|live|lives|lived|believe|believes|believed|hold|holds|held|bring|brings|brought|happen|happens|happened|walk|walks|walked|turn|turns|turned|begin|begins|began|begun|carry|carries|carried|wait|waits|waited|fly|flies|flew|swim|swims|swam|drive|drives|drove|travel|travels|traveled|arrive|arrives|arrived|leave|leaves|left|cook|cooks|cooked|sleep|sleeps|slept|wake|wakes|woke|buy|buys|bought|sell|sells|sold|win|wins|won|lose|loses|lost|create|creates|created|draw|draws|drew|sing|sings|sang|dance|dances|danced)$/.test(p))
        return { cat:'Verbo', sub:'Conjugado', esError:false };
    if (/^(very|well|also|just|now|then|here|there|always|never|often|sometimes|rarely|usually|still|already|soon|again|too|quite|much|more|most|less|least|only|really|quickly|slowly|early|late|together|away|back|up|down|out|perhaps|maybe|certainly|probably|definitely|almost|enough|even|else|instead|yesterday|today|tomorrow|ago|everywhere|somewhere|nowhere|anywhere|once|twice|thrice|badly|carefully|easily|clearly|quietly|loudly|gently|kindly|happily|sadly)$/.test(p))
        return { cat:'Adverbio', sub:subAdverbioEN(p), esError:false };
    if (/^(in|on|at|to|for|of|with|by|from|up|about|into|through|during|before|after|above|below|between|among|under|over|near|behind|beside|along|across|around|against|without|within|beyond|toward|towards|despite|except|per|since|until|upon|onto|off|inside|outside)$/.test(p))
        return { cat:'Preposicion', sub:'—', esError:false };
    if (/^(and|but|or|nor|for|yet|so|both|either|neither)$/.test(p))
        return { cat:'Conjuncion', sub:'Coordinante', esError:false };
    if (/^(because|since|although|though|if|unless|until|when|where|while|that|which|who|whom|whose|as|than|whether|whenever|wherever|however|whatever|whoever)$/.test(p))
        return { cat:'Conjuncion', sub:'Subordinante', esError:false };
    if (/^(good|bad|big|small|large|tiny|huge|tall|short|long|wide|narrow|deep|great|poor|excellent|terrible|wonderful|beautiful|ugly|pretty|handsome|lovely|clean|dirty|new|old|young|ancient|modern|white|black|red|blue|green|yellow|orange|purple|brown|gray|pink|hot|cold|warm|cool|happy|sad|angry|scared|excited|bored|tired|nervous|calm|proud|kind|cruel|brave|smart|intelligent|clever|stupid|wise|funny|serious|gentle|generous|polite|rude|friendly|shy|hard|easy|soft|difficult|simple|complex|fast|slow|strong|weak|light|heavy|right|wrong|true|false|real|fake|important|possible|impossible|special|common|strange|normal|first|second|third|last|next|other|same|only|whole|open|closed|full|empty|busy|free|ready|sick|healthy|rich|poor|dark|bright|loud|quiet)$/.test(p))
        return { cat:'Adjetivo', sub:'Calificativo', esError:false };
    if (SUST_EN.test(p))
        return { cat:'Sustantivo', sub:'Común', esError:false };
    // Plurales regulares (sin recursión)
    if (p.endsWith('ies') && SUST_EN.test(p.slice(0,-3)+'y')) return { cat:'Sustantivo', sub:'Común', esError:false };
    if (p.endsWith('es')  && SUST_EN.test(p.slice(0,-2)))     return { cat:'Sustantivo', sub:'Común', esError:false };
    if (p.endsWith('s')   && SUST_EN.test(p.slice(0,-1)))     return { cat:'Sustantivo', sub:'Común', esError:false };
    if (/^(oh|wow|hey|hi|hello|bye|yes|no|ok|okay|ouch|hmm|ah|aha|oops|hurray|alas|bravo|please|thanks|sorry)$/.test(p))
        return { cat:'Interjeccion', sub:'—', esError:false };
    return { cat:'Desconocido', sub:'—', esError:true };
}

function subAdverbioEN(p) {
    if (/^(now|then|yesterday|today|tomorrow|ago|soon|already|still|early|late)$/.test(p))          return 'Tiempo';
    if (/^(here|there|everywhere|somewhere|nowhere|anywhere|away|back|up|down|out)$/.test(p))        return 'Lugar';
    if (/^(very|much|more|most|less|least|quite|almost|enough|once|twice|thrice)$/.test(p))          return 'Cantidad';
    if (/^(well|quickly|slowly|really|together|instead|badly|carefully|easily|clearly|quietly|loudly|gently|kindly|happily|sadly)$/.test(p)) return 'Modo';
    if (/^(always|certainly|definitely|yes|also)$/.test(p))                                         return 'Afirmación';
    if (/^(never|rarely|nowhere)$/.test(p))                                                         return 'Negación';
    if (/^(perhaps|maybe|probably|possibly)$/.test(p))                                              return 'Duda';
    return 'Modo';
}

function clasificarES(p) {
    if (/^(el|la|los|las|un|una|unos|unas|lo)$/.test(p))
        return { cat:'Articulo', sub:'Definido/Indefinido', esError:false };
    if (/^(mi|mis|tu|tus|su|sus|nuestro|nuestra|nuestros|nuestras|vuestro|vuestra|vuestros|vuestras|mío|mía|míos|mías|tuyo|tuya|tuyos|tuyas|suyo|suya|suyos|suyas)$/.test(p))
        return { cat:'Posesivo', sub:'Posesivo', esError:false };
    if (/^(este|esta|estos|estas|ese|esa|esos|esas|aquel|aquella|aquellos|aquellas|esto|eso|aquello)$/.test(p))
        return { cat:'Demostrativo', sub:'Demostrativo', esError:false };
    if (/^(yo|tú|él|ella|nosotros|nosotras|vosotros|vosotras|ellos|ellas|me|te|se|nos|os|le|lo|la|les|quien|quienes|que|cual|cuales|alguien|nadie|algo|nada|mismo|misma|mismos|mismas|todos|todas|todo|cada|cualquier|cualquiera|ambos|ambas)$/.test(p))
        return { cat:'Pronombre', sub:'Personal', esError:false };
    if (/^(es|son|somos|sois|seré|será|seremos|serán|sería|seríamos|era|eran|fue|fueron|ser|sido|siendo|estar|estoy|estás|está|estamos|estáis|están|estuvo|estuvieron|haber|he|has|ha|hemos|habéis|han|hubo|tener|tengo|tienes|tiene|tenemos|tenéis|tienen|tuvo|tuvieron|tenía|ir|voy|vas|va|vamos|van|hacer|hago|haces|hace|hacemos|hacéis|hacen|hizo|hicieron|poder|puedo|puedes|puede|podemos|podéis|pueden|pudo|pudieron|querer|quiero|quieres|quiere|queremos|queréis|quieren|quiso|quisieron|saber|sé|sabes|sabe|sabemos|saben|supo|ver|veo|ves|ve|vemos|ven|vio|dar|doy|das|da|damos|dan|dio|decir|digo|dices|dice|decimos|dicen|dijo|hablar|hablo|hablas|habla|hablamos|hablan|habló|comer|como|comes|come|comemos|comen|comió|vivir|vivo|vives|vive|vivimos|viven|vivió|trabajar|trabajo|trabajas|trabaja|trabajamos|trabajan|trabajó|estudiar|estudio|estudias|estudia|estudiamos|estudian|estudió|correr|corro|corres|corre|corremos|corren|corrió|leer|leo|lees|lee|leemos|leen|leyó|escribir|escribo|escribes|escribe|escribimos|escriben|escribió|escuchar|escucho|escuchas|escucha|escuchamos|escuchan|escuchó|ayudar|ayudo|ayudas|ayuda|ayudamos|ayudan|ayudó|necesitar|necesito|necesitas|necesita|necesitamos|necesitan|amar|amo|amas|ama|amamos|aman|pensar|pienso|piensas|piensa|pensamos|piensan|sentir|siento|sientes|siente|sentimos|sienten|caminar|camino|caminas|camina|caminamos|caminan|llevar|llevo|llevas|lleva|llevamos|llevan|llamar|llamo|llamas|llama|llamamos|llaman|comenzar|comienzo|comienzas|comienza|comenzamos|comienzan|terminar|termino|terminas|termina|terminamos|terminan|abrir|abro|abres|abre|abrimos|abren|cerrar|cierro|cierras|cierra|cerramos|cierran|jugar|juego|juegas|juega|jugamos|juegan|comprar|compro|compras|compra|compramos|compran|dormir|duermo|duermes|duerme|dormimos|duermen|reír|río|ríes|ríe|reímos|ríen|llorar|lloro|lloras|llora|lloramos|lloran|cantar|canto|cantas|canta|cantamos|cantan|bailar|bailo|bailas|baila|bailamos|bailan)$/.test(p))
        return { cat:'Verbo', sub:'Conjugado', esError:false };
    if (/^(muy|bien|también|ya|ahora|entonces|aquí|allí|allá|siempre|nunca|jamás|frecuentemente|raramente|todavía|aún|pronto|enseguida|antes|después|demasiado|bastante|poco|mucho|más|menos|casi|solo|solamente|únicamente|realmente|verdaderamente|rápido|rápidamente|lento|lentamente|temprano|tarde|lejos|cerca|quizás|quizá|acaso|sí|claro|efectivamente|ciertamente|no|tampoco|ayer|hoy|mañana|anoche)$/.test(p))
        return { cat:'Adverbio', sub:subAdverbioES(p), esError:false };
    if (/^(a|ante|bajo|con|contra|de|desde|durante|en|entre|hacia|hasta|mediante|para|por|según|sin|sobre|tras|excepto|salvo|incluso|encima|debajo|delante|detrás|dentro|fuera|cerca|lejos|junto|alrededor)$/.test(p))
        return { cat:'Preposicion', sub:'—', esError:false };
    if (/^(y|e|ni|pero|mas|sino|o|u|bien|sea)$/.test(p))
        return { cat:'Conjuncion', sub:'Coordinante', esError:false };
    if (/^(que|porque|pues|si|aunque|como|cuando|mientras|donde|adonde|según|conforme|para|tan|tanto)$/.test(p))
        return { cat:'Conjuncion', sub:'Subordinante', esError:false };
    if (/^(bueno|buena|buenos|buenas|malo|mala|malos|malas|grande|grandes|pequeño|pequeña|pequeños|pequeñas|nuevo|nueva|nuevos|nuevas|viejo|vieja|viejos|viejas|joven|jóvenes|largo|larga|corto|corta|alto|alta|altos|altas|bajo|baja|bonito|bonita|feo|fea|rápido|rápida|lento|lenta|caliente|frío|fría|cálido|cálida|fresco|fresca|blanco|blanca|negro|negra|rojo|roja|azul|azules|verde|verdes|amarillo|amarilla|café|gris|feliz|triste|fuerte|débil|rico|pobre|limpio|sucio|lleno|vacío|importante|diferente|posible|especial|común|simple|primero|primera|segundo|segunda|tercero|tercera|último|última|siguiente|otro|otra|mismo|misma|verdadero|falso|real|libre|abierto|cerrado|hermoso|hermosa|bonito|bonita|fácil|difícil|enfermo|enferma|sano|sana)$/.test(p))
        return { cat:'Adjetivo', sub:'Calificativo', esError:false };
    if (SUST_ES.test(p))
        return { cat:'Sustantivo', sub:'Común', esError:false };
    // Plurales regulares (sin recursión)
    if (p.endsWith('es') && SUST_ES.test(p.slice(0,-2))) return { cat:'Sustantivo', sub:'Común', esError:false };
    if (p.endsWith('s')  && SUST_ES.test(p.slice(0,-1))) return { cat:'Sustantivo', sub:'Común', esError:false };
    if (/^(oh|ay|eh|ah|oye|hola|adiós|sí|no|ok|uy|vaya|caramba|bravo|hurra|ojalá)$/.test(p))
        return { cat:'Interjeccion', sub:'—', esError:false };
    return { cat:'Desconocido', sub:'—', esError:true };
}

function subAdverbioES(p) {
    if (/^(ahora|entonces|ya|todavía|aún|pronto|antes|después|ayer|hoy|mañana|anoche|tarde|temprano|enseguida)$/.test(p)) return 'Tiempo';
    if (/^(aquí|allí|allá|lejos|cerca|arriba|abajo|dentro|fuera|adelante|atrás)$/.test(p))                              return 'Lugar';
    if (/^(muy|mucho|poco|demasiado|bastante|más|menos|casi|tanto|tan)$/.test(p))                                       return 'Cantidad';
    if (/^(bien|mal|rápido|lento|rápidamente|lentamente|solamente|únicamente|realmente|verdaderamente)$/.test(p))       return 'Modo';
    if (/^(sí|claro|efectivamente|ciertamente|también)$/.test(p))                                                       return 'Afirmación';
    if (/^(no|nunca|jamás|tampoco)$/.test(p))                                                                           return 'Negación';
    if (/^(quizás|quizá|acaso|probablemente)$/.test(p))                                                                 return 'Duda';
    return 'Modo';
}

// ══════════════════════════════════════════════════════
//  SECCIÓN 7 — ANÁLISIS SINTÁCTICO
// ══════════════════════════════════════════════════════

function analizarSintactico(tokens) {
    var res = { errores:[] };
    var pos = 0;

    function cur()          { return pos < tokens.length ? tokens[pos] : null; }
    function adv()          { pos++; }
    function esCat(c)       { var t=cur(); return t && t.categoria===c; }
    function esFin()        { var t=cur(); return !t || t.categoria==='Puntuacion'; }
    function esDet()        { var t=cur(); return t&&(t.categoria==='Articulo'||t.categoria==='Posesivo'||t.categoria==='Demostrativo'||t.categoria==='Numeral'); }
    function err(desc)      { var t=cur(); res.errores.push({ lexema:t?t.lexema:'fin', linea:t?t.linea:-1, columna:t?t.columna:-1, descripcion:desc }); }
    function recuperar()    { while(cur()&&!esCat('Puntuacion'))adv(); if(cur())adv(); }

    function fraseNominal() {
        if (esCat('Pronombre'))  { adv(); return true; }
        if (esCat('Sustantivo')) { adv(); return true; }
        if (esDet()) {
            adv();
            // Adjetivos coordinados: "a beautiful and happy girl"
            while (esCat('Adjetivo')) {
                adv();
                if (cur() && esCat('Conjuncion')) {
                    var g = pos; adv();
                    if (esCat('Adjetivo')) adv();
                    else { pos=g; break; }
                } else break;
            }
            if (esCat('Sustantivo')) {
                adv();
                if (cur() && esCat('Adjetivo')) adv();
                return true;
            }
            err('Se esperaba un sustantivo después del determinante');
            return false;
        }
        return false;
    }

    function fraseVerbal() {
        if (esCat('Adverbio')) adv();
        if (!esCat('Verbo'))   return false;
        adv();
        if (cur() && esCat('Adverbio')) adv();
        return true;
    }

    function predicado() {
        if (!fraseVerbal()) return false;
        // Todos los complementos opcionales
        while (cur() && !esFin()) {
            if (esCat('Preposicion'))                                                     { adv(); fraseNominal(); continue; }
            if (esCat('Adjetivo'))                                                        { adv();
                while(cur()&&esCat('Conjuncion')){var g=pos;adv();if(esCat('Adjetivo'))adv();else{pos=g;break;}}
                continue; }
            if (esDet()||esCat('Sustantivo')||esCat('Pronombre'))                        { fraseNominal(); continue; }
            if (esCat('Adverbio'))                                                        { adv(); continue; }
            break;
        }
        return true;
    }

    while (pos < tokens.length) {
        if (esCat('Puntuacion'))    { adv(); continue; }
        if (esCat('Interjeccion'))  { adv(); continue; } // interjección opcional al inicio
        if (!fraseNominal())    { err('Se esperaba un sujeto (pronombre, artículo + sustantivo)'); recuperar(); continue; }
        if (!predicado())       { err('Se esperaba un predicado (verbo)'); recuperar(); continue; }
        if (cur() && esCat('Puntuacion')) adv();
    }

    return res;
}

// ══════════════════════════════════════════════════════
//  SECCIÓN 8 — ÁRBOL (construcción de nodos)
// ══════════════════════════════════════════════════════

function construirArbol(tokens) {
    var pos = 0;
    function n(e,t)   { return { etiqueta:e, esTerminal:t, hijos:[] }; }
    function cur()    { return pos<tokens.length?tokens[pos]:null; }
    function adv()    { pos++; }
    function esCat(c) { var t=cur(); return t&&t.categoria===c; }
    function esFin()  { var t=cur(); return !t||t.categoria==='Puntuacion'; }
    function esDet()  { var t=cur(); return t&&(t.categoria==='Articulo'||t.categoria==='Posesivo'||t.categoria==='Demostrativo'||t.categoria==='Numeral'); }

    function fn() {
        var nd = n('frase_nominal', false);
        if (esCat('Pronombre')||esCat('Sustantivo')) { nd.hijos.push(n(cur().lexema,true)); adv(); return nd; }
        if (esDet()) {
            nd.hijos.push(n(cur().lexema,true)); adv();
            while (esCat('Adjetivo')) {
                nd.hijos.push(n(cur().lexema,true)); adv();
                if (cur()&&esCat('Conjuncion')) { var g=pos; adv(); if(esCat('Adjetivo')){nd.hijos.push(n(cur().lexema,true));adv();}else{pos=g;break;} }
                else break;
            }
            if (esCat('Sustantivo')) {
                nd.hijos.push(n(cur().lexema,true)); adv();
                if (cur()&&esCat('Adjetivo')) { nd.hijos.push(n(cur().lexema,true)); adv(); }
            }
        }
        return nd;
    }

    function fv() {
        var nd = n('frase_verbal', false);
        if (esCat('Adverbio'))  { nd.hijos.push(n(cur().lexema,true)); adv(); }
        if (esCat('Verbo'))     { nd.hijos.push(n(cur().lexema,true)); adv(); }
        if (cur()&&esCat('Adverbio')) { nd.hijos.push(n(cur().lexema,true)); adv(); }
        return nd;
    }

    function pred() {
        var nd = n('predicado', false);
        nd.hijos.push(fv());
        while (cur()&&!esFin()) {
            if (esCat('Preposicion'))                           { var fp=n('frase_prep',false); fp.hijos.push(n(cur().lexema,true)); adv(); fp.hijos.push(fn()); nd.hijos.push(fp); continue; }
            if (esCat('Adjetivo'))                             { var fa=n('frase_adj',false); fa.hijos.push(n(cur().lexema,true)); adv();
                while(cur()&&esCat('Conjuncion')){var g=pos;adv();if(esCat('Adjetivo')){fa.hijos.push(n(cur().lexema,true));adv();}else{pos=g;break;}}
                nd.hijos.push(fa); continue; }
            if (esDet()||esCat('Sustantivo')||esCat('Pronombre')) { nd.hijos.push(fn()); continue; }
            if (esCat('Adverbio'))                             { nd.hijos.push(n(cur().lexema,true)); adv(); continue; }
            break;
        }
        return nd;
    }

    function oracion() {
        var nd  = n('oracion', false);
        // Interjección opcional al inicio
        if (esCat('Interjeccion')) { nd.hijos.push(n(cur().lexema, true)); adv(); }
        var suj = n('sujeto', false);
        suj.hijos.push(fn());
        nd.hijos.push(suj);
        nd.hijos.push(pred());
        if (cur()&&esCat('Puntuacion')) { nd.hijos.push(n(cur().lexema,true)); adv(); }
        return nd;
    }

    var raiz = n('programa', false);
    while (pos < tokens.length) {
        if (esCat('Puntuacion')) { adv(); continue; }
        raiz.hijos.push(oracion());
    }
    return raiz;
}

// ══════════════════════════════════════════════════════
//  SECCIÓN 9 — ANÁLISIS SEMÁNTICO
// ══════════════════════════════════════════════════════

function analizarSemantico(tokens, direccion) {
    var res = { errores:[] };

    function regErr(desc, token) {
        res.errores.push({ lexema:token.lexema, linea:token.linea, columna:token.columna, descripcion:desc });
    }

    function esDet(t) {
        return t.categoria==='Articulo'||t.categoria==='Posesivo'||t.categoria==='Demostrativo'||t.categoria==='Numeral';
    }

    function esMascEN(d)  { return /^(el|un|este|ese|aquel|mi|tu|su|nuestro)$/.test(d); }
    function esFemEN(d)   { return /^(la|una|esta|esa|aquella|mi|tu|su|nuestra)$/.test(d); }
    function esPluEN(d)   { return /^(los|las|unos|unas|estos|estas|esos|esas|mis|tus|sus|nuestros|nuestras)$/.test(d); }
    function esMascSust(s){ return /^(gato|perro|libro|hombre|niño|día|año|trabajo|sol|río|jardín|carro|coche|pan|arroz|huevo|piso|color|número|problema|equipo|deporte)$/.test(s); }
    function esFemSust(s) { return /^(casa|mujer|niña|vida|escuela|ciudad|familia|mano|flor|luna|estrella|calle|palabra|oración|noche|semana|tienda|voz|historia|música|fruta|verdura)$/.test(s); }

    function buscarSujeto(posVerbo) {
        for (var i=posVerbo-1;i>=0;i--) {
            if (tokens[i].categoria==='Pronombre'||tokens[i].categoria==='Sustantivo') return tokens[i];
            if (tokens[i].categoria==='Puntuacion') break;
        }
        return null;
    }

    tokens.forEach(function(token, i) {
        // Concordancia determinante-sustantivo en español
        if (esDet(token) && direccion==='es-en') {
            var sig = i+1 < tokens.length ? tokens[i+1] : null;
            if (sig && sig.categoria==='Adjetivo' && i+2<tokens.length) sig = tokens[i+2];
            if (sig && sig.categoria==='Sustantivo') {
                var d=token.lexema.toLowerCase(), s=sig.lexema.toLowerCase();
                if (esMascEN(d)&&esFemSust(s))  regErr('Concordancia de género incorrecta: "'+d+'" (masculino) con "'+s+'" (femenino)', token);
                if (esFemEN(d)&&esMascSust(s))  regErr('Concordancia de género incorrecta: "'+d+'" (femenino) con "'+s+'" (masculino)', token);
                if (esPluEN(d)&&!s.endsWith('s')) regErr('Concordancia de número incorrecta: "'+d+'" (plural) con "'+s+'" (singular)', token);
            }
        }

        // Concordancia sujeto-verbo
        if (token.categoria==='Verbo') {
            var sujeto = buscarSujeto(i);
            if (!sujeto) return;
            var suj=sujeto.lexema.toLowerCase(), verb=token.lexema.toLowerCase();
            if (direccion==='en-es') {
                if (/^(he|she|it)$/.test(suj)&&/^(are|were|have|do)$/.test(verb))
                    regErr('Concordancia incorrecta: "'+suj+'" debe usar forma singular, no "'+verb+'"', token);
                if (suj==='i'&&/^(is|are|were)$/.test(verb))
                    regErr('Concordancia incorrecta: "I" debe usar "am" o "was", no "'+verb+'"', token);
                if (/^(they|we|you)$/.test(suj)&&/^(is|was|has|does)$/.test(verb))
                    regErr('Concordancia incorrecta: "'+suj+'" (plural) no debe usar "'+verb+'" (singular)', token);
            } else {
                if (suj==='yo'&&/^(es|son|era|eran|fue|fueron)$/.test(verb))
                    regErr('Concordancia incorrecta: "yo" no debe usar "'+verb+'"', token);
                if (/^(él|ella)$/.test(suj)&&/^(son|somos|estamos|están|fueron)$/.test(verb))
                    regErr('Concordancia incorrecta: "'+suj+'" (singular) no debe usar "'+verb+'" (plural)', token);
                if (/^(ellos|ellas|nosotros|nosotras)$/.test(suj)&&/^(es|fue|está|tiene)$/.test(verb))
                    regErr('Concordancia incorrecta: "'+suj+'" (plural) no debe usar "'+verb+'" (singular)', token);
            }
        }
    });

    return res;
}

// ══════════════════════════════════════════════════════
//  SECCIÓN 10 — SÍNTESIS (TRADUCCIÓN)
//  Traduce cada token usando el diccionario bilingüe.
//  Solo se ejecuta cuando los 3 análisis son exitosos.
// ══════════════════════════════════════════════════════

// Diccionario EN→ES
var DIC_EN_ES = {
    "the":"el",
    "a":"un",
    "an":"un",
    "i":"yo",
    "you":"tú",
    "he":"él",
    "she":"ella",
    "it":"eso",
    "we":"nosotros",
    "they":"ellos",
    "me":"me",
    "him":"lo",
    "her":"la",
    "us":"nos",
    "them":"los",
    "my":"mi",
    "your":"tu",
    "his":"su",
    "its":"su",
    "our":"nuestro",
    "their":"su",
    "this":"este",
    "that":"que",
    "these":"estos",
    "those":"esos",
    "is":"es",
    "are":"son",
    "was":"era",
    "were":"eran",
    "be":"ser",
    "been":"sido",
    "am":"soy",
    "have":"tengo",
    "has":"tiene",
    "had":"tenía",
    "do":"hago",
    "does":"hace",
    "did":"hizo",
    "will":"va a",
    "would":"podría",
    "can":"puede",
    "could":"podría",
    "should":"debería",
    "must":"debe",
    "run":"corro",
    "runs":"corre",
    "ran":"corrió",
    "eat":"como",
    "eats":"come",
    "ate":"comió",
    "go":"voy",
    "goes":"va",
    "went":"fue",
    "see":"veo",
    "sees":"ve",
    "saw":"vio",
    "come":"vengo",
    "comes":"viene",
    "came":"vino",
    "know":"sé",
    "knows":"sabe",
    "knew":"supo",
    "think":"pienso",
    "thinks":"piensa",
    "thought":"pensó",
    "like":"gusto",
    "likes":"gusta",
    "liked":"gustó",
    "want":"quiero",
    "wants":"quiere",
    "wanted":"quería",
    "need":"necesito",
    "needs":"necesita",
    "needed":"necesitaba",
    "love":"amo",
    "loves":"ama",
    "loved":"amó",
    "feel":"siento",
    "feels":"siente",
    "felt":"sintió",
    "read":"leo",
    "reads":"lee",
    "write":"escribo",
    "writes":"escribe",
    "wrote":"escribió",
    "speak":"hablo",
    "speaks":"habla",
    "spoke":"habló",
    "listen":"escucho",
    "listens":"escucha",
    "work":"trabajo",
    "works":"trabaja",
    "worked":"trabajó",
    "play":"juego",
    "plays":"juega",
    "played":"jugó",
    "study":"estudio",
    "studies":"estudia",
    "studied":"estudió",
    "learn":"aprendo",
    "learns":"aprende",
    "learned":"aprendió",
    "teach":"enseño",
    "teaches":"enseña",
    "taught":"enseñó",
    "help":"ayudo",
    "helps":"ayuda",
    "helped":"ayudó",
    "make":"hago",
    "makes":"hace",
    "made":"hizo",
    "take":"tomo",
    "takes":"toma",
    "took":"tomó",
    "give":"doy",
    "gives":"da",
    "gave":"dio",
    "get":"obtengo",
    "gets":"obtiene",
    "got":"obtuvo",
    "find":"encuentro",
    "finds":"encuentra",
    "found":"encontrado",
    "keep":"mantengo",
    "keeps":"mantiene",
    "kept":"mantuvo",
    "start":"empiezo",
    "starts":"empieza",
    "started":"empezó",
    "stop":"detengo",
    "stops":"detiene",
    "stopped":"detuvo",
    "open":"abierto",
    "opens":"abre",
    "opened":"abrió",
    "close":"cierro",
    "closes":"cierra",
    "closed":"cerrado",
    "call":"llamo",
    "calls":"llama",
    "called":"llamó",
    "try":"intento",
    "tries":"intenta",
    "tried":"intentó",
    "use":"uso",
    "uses":"usa",
    "used":"usó",
    "show":"muestro",
    "shows":"muestra",
    "showed":"mostró",
    "walk":"camino",
    "walks":"camina",
    "walked":"caminó",
    "talk":"hablo",
    "talks":"habla",
    "talked":"habló",
    "live":"vivo",
    "lives":"vidas",
    "lived":"vivió",
    "sleep":"duermo",
    "sleeps":"duerme",
    "slept":"durmió",
    "buy":"compro",
    "buys":"compra",
    "bought":"compró",
    "win":"gano",
    "wins":"gana",
    "won":"ganó",
    "lose":"pierdo",
    "loses":"pierde",
    "lost":"perdido",
    "sing":"canto",
    "sings":"canta",
    "sang":"cantó",
    "dance":"bailo",
    "dances":"baila",
    "danced":"bailó",
    "cook":"cocino",
    "cooks":"cocina",
    "cooked":"cocido",
    "wait":"espero",
    "waits":"espera",
    "waited":"esperó",
    "ask":"pregunto",
    "asks":"pregunta",
    "asked":"preguntó",
    "answer":"respondo",
    "answers":"responde",
    "answered":"respondió",
    "move":"muevo",
    "moves":"mueve",
    "moved":"movió",
    "bring":"traigo",
    "brings":"trae",
    "brought":"trajo",
    "say":"digo",
    "says":"dice",
    "said":"dijo",
    "tell":"cuento",
    "tells":"cuenta",
    "told":"contó",
    "draw":"dibujo",
    "draws":"dibuja",
    "drew":"dibujó",
    "create":"creo",
    "creates":"crea",
    "created":"creó",
    "fly":"vuelo",
    "flies":"vuela",
    "flew":"voló",
    "swim":"nado",
    "swims":"nada",
    "swam":"nadó",
    "drive":"conduzco",
    "drives":"conduce",
    "drove":"condujo",
    "cat":"gato",
    "cats":"gatos",
    "dog":"perro",
    "dogs":"perros",
    "house":"casa",
    "houses":"casas",
    "car":"carro",
    "cars":"carros",
    "book":"libro",
    "books":"libros",
    "man":"hombre",
    "men":"hombres",
    "woman":"mujer",
    "women":"mujeres",
    "child":"niño",
    "children":"niños",
    "boy":"chico",
    "boys":"chicos",
    "girl":"chica",
    "girls":"chicas",
    "baby":"bebé",
    "babies":"bebés",
    "day":"día",
    "days":"días",
    "year":"año",
    "years":"años",
    "time":"tiempo",
    "life":"vida",
    "world":"mundo",
    "school":"escuela",
    "schools":"escuelas",
    "water":"agua",
    "food":"comida",
    "city":"ciudad",
    "cities":"ciudades",
    "country":"país",
    "countries":"países",
    "family":"familia",
    "families":"familias",
    "friend":"amigo",
    "friends":"amigos",
    "hand":"mano",
    "hands":"manos",
    "eye":"ojo",
    "eyes":"ojos",
    "face":"cara",
    "head":"cabeza",
    "door":"puerta",
    "doors":"puertas",
    "table":"mesa",
    "tables":"mesas",
    "chair":"silla",
    "chairs":"sillas",
    "room":"habitación",
    "rooms":"habitaciones",
    "tree":"árbol",
    "trees":"árboles",
    "flower":"flor",
    "flowers":"flores",
    "bird":"pájaro",
    "birds":"pájaros",
    "sun":"sol",
    "moon":"luna",
    "star":"estrella",
    "stars":"estrellas",
    "sky":"cielo",
    "street":"calle",
    "streets":"calles",
    "name":"nombre",
    "names":"nombres",
    "word":"palabra",
    "words":"palabras",
    "language":"idioma",
    "morning":"mañana",
    "afternoon":"tarde",
    "night":"noche",
    "week":"semana",
    "weeks":"semanas",
    "month":"mes",
    "months":"meses",
    "money":"dinero",
    "road":"camino",
    "heart":"corazón",
    "mind":"mente",
    "body":"cuerpo",
    "voice":"voz",
    "story":"historia",
    "stories":"historias",
    "question":"pregunta",
    "questions":"preguntas",
    "problem":"problema",
    "problems":"problemas",
    "idea":"idea",
    "ideas":"ideas",
    "teacher":"maestro",
    "teachers":"maestros",
    "student":"estudiante",
    "students":"estudiantes",
    "doctor":"médico",
    "doctors":"médicos",
    "mother":"madre",
    "father":"padre",
    "son":"hijo",
    "sons":"hijos",
    "daughter":"hija",
    "daughters":"hijas",
    "brother":"hermano",
    "brothers":"hermanos",
    "sister":"hermana",
    "sisters":"hermanas",
    "people":"personas",
    "person":"persona",
    "place":"lugar",
    "places":"lugares",
    "thing":"cosa",
    "things":"cosas",
    "park":"parque",
    "parks":"parques",
    "computer":"computadora",
    "phone":"teléfono",
    "music":"música",
    "game":"juego",
    "games":"juegos",
    "sport":"deporte",
    "sports":"deportes",
    "apple":"manzana",
    "apples":"manzanas",
    "bread":"pan",
    "milk":"leche",
    "egg":"huevo",
    "eggs":"huevos",
    "fruit":"fruta",
    "number":"número",
    "color":"color",
    "light":"luz",
    "river":"río",
    "rivers":"ríos",
    "sea":"mar",
    "ocean":"océano",
    "mountain":"montaña",
    "mountains":"montañas",
    "garden":"jardín",
    "gardens":"jardines",
    "building":"edificio",
    "buildings":"edificios",
    "window":"ventana",
    "windows":"ventanas",
    "floor":"piso",
    "paper":"papel",
    "pen":"pluma",
    "pencil":"lápiz",
    "good":"bueno",
    "bad":"malo",
    "big":"grande",
    "small":"pequeño",
    "tall":"alto",
    "short":"bajo",
    "long":"largo",
    "new":"nuevo",
    "old":"viejo",
    "young":"joven",
    "beautiful":"hermoso",
    "ugly":"feo",
    "happy":"feliz",
    "sad":"triste",
    "fast":"rápido",
    "slow":"lento",
    "hot":"caliente",
    "cold":"resfriado",
    "warm":"cálido",
    "cool":"fresco",
    "white":"blanco",
    "black":"negro",
    "red":"rojo",
    "blue":"azul",
    "green":"verde",
    "yellow":"amarillo",
    "strong":"fuerte",
    "weak":"débil",
    "hard":"duro",
    "easy":"fácil",
    "rich":"rico",
    "poor":"pobre",
    "clean":"limpio",
    "dirty":"sucio",
    "full":"lleno",
    "empty":"vacío",
    "important":"importante",
    "special":"especial",
    "great":"genial",
    "little":"pequeño",
    "kind":"amable",
    "brave":"valiente",
    "funny":"gracioso",
    "smart":"inteligente",
    "first":"primero",
    "last":"último",
    "next":"siguiente",
    "other":"otro",
    "same":"mismo",
    "real":"real",
    "possible":"posible",
    "different":"diferente",
    "simple":"simple",
    "true":"verdadero",
    "very":"muy",
    "well":"bien",
    "also":"también",
    "just":"solo",
    "now":"ahora",
    "then":"entonces",
    "here":"aquí",
    "there":"allí",
    "always":"siempre",
    "never":"nunca",
    "sometimes":"a veces",
    "still":"todavía",
    "already":"ya",
    "soon":"pronto",
    "again":"otra vez",
    "quite":"bastante",
    "much":"mucho",
    "more":"más",
    "less":"menos",
    "really":"realmente",
    "quickly":"rápidamente",
    "slowly":"lentamente",
    "early":"temprano",
    "late":"tarde",
    "together":"juntos",
    "perhaps":"quizás",
    "maybe":"tal vez",
    "almost":"casi",
    "yesterday":"ayer",
    "today":"hoy",
    "tomorrow":"mañana",
    "in":"en",
    "on":"sobre",
    "at":"en",
    "to":"a",
    "for":"para",
    "of":"de",
    "with":"con",
    "by":"por",
    "from":"desde",
    "about":"sobre",
    "before":"antes de",
    "after":"después de",
    "between":"entre",
    "under":"bajo",
    "over":"sobre",
    "near":"cerca de",
    "behind":"detrás de",
    "without":"sin",
    "during":"durante",
    "since":"desde",
    "until":"hasta",
    "toward":"hacia",
    "into":"dentro de",
    "through":"a través de",
    "above":"encima de",
    "below":"debajo de",
    "beside":"al lado de",
    "and":"y",
    "but":"pero",
    "or":"o",
    "nor":"ni",
    "so":"así que",
    "yet":"sin embargo",
    "because":"porque",
    "if":"si",
    "although":"aunque",
    "though":"aunque",
    "when":"cuando",
    "where":"donde",
    "while":"mientras",
    "which":"cual",
    "who":"quien",
    "than":"que",
    "as":"como",
    "oh":"oh",
    "wow":"vaya",
    "hey":"oye",
    "hi":"hola",
    "hello":"hola",
    "bye":"adiós",
    "yes":"sí",
    "no":"no",
    "ok":"ok",
    "okay":"está bien",
    "ouch":"ay",
    "hmm":"hmm",
    "ah":"ah",
    "oops":"ups",
    "hurray":"hurra",
    "bravo":"bravo",
    "please":"por favor",
    "thanks":"gracias",
    "sorry":"lo siento",
    "team":"equipo",
    "teams":"equipos",
    "fish":"pez",
    "fishes":"peces",
    "leaf":"hoja",
    "leaves":"hojas",
    "knife":"cuchillo",
    "knives":"cuchillos",
    "wife":"esposa",
    "wives":"esposas",
    "half":"mitad",
    "halves":"mitades",
    "wolf":"lobo",
    "wolves":"lobos",
    "shelf":"estante",
    "shelves":"estantes",
    "tooth":"diente",
    "teeth":"dientes",
    "foot":"pie",
    "feet":"pies",
    "mouse":"ratón",
    "mice":"ratones",
    "ox":"buey",
    "oxen":"bueyes",
    "news":"noticias",
    "homework":"tarea",
    "class":"clase",
    "classes":"clases",
    "test":"examen",
    "tests":"exámenes",
    "office":"oficina",
    "offices":"oficinas",
    "nurse":"enfermera",
    "nurses":"enfermeras",
    "police":"policía",
    "university":"universidad",
    "universities":"universidades",
    "subject":"materia",
    "subjects":"materias",
    "lesson":"lección",
    "lessons":"lecciones",
    "letter":"carta",
    "letters":"cartas",
    "sentence":"oración",
    "sentences":"oraciones",
    "paragraph":"párrafo",
    "paragraphs":"párrafos",
    "page":"página",
    "pages":"páginas",
    "chapter":"capítulo",
    "chapters":"capítulos",
    "exercise":"ejercicio",
    "exercises":"ejercicios",
    "example":"ejemplo",
    "examples":"ejemplos",
    "type":"tipo",
    "types":"tipos",
    "size":"tamaño",
    "sizes":"tamaños",
    "shape":"forma",
    "shapes":"formas",
    "line":"línea",
    "lines":"líneas",
    "circle":"círculo",
    "circles":"círculos",
    "square":"cuadrado",
    "squares":"cuadrados",
    "point":"punto",
    "points":"puntos",
    "cup":"taza",
    "cups":"tazas",
    "glass":"vaso",
    "glasses":"vasos",
    "shirt":"camisa",
    "shirts":"camisas",
    "pants":"pantalones",
    "shoes":"zapatos",
    "hat":"sombrero",
    "hats":"sombreros",
    "bag":"bolsa",
    "bags":"bolsas",
    "key":"llave",
    "keys":"llaves",
    "sign":"señal",
    "signs":"señales",
    "map":"mapa",
    "maps":"mapas",
    "picture":"foto",
    "pictures":"fotos",
    "photo":"foto",
    "photos":"fotos",
    "message":"mensaje",
    "messages":"mensajes",
    "email":"correo",
    "emails":"correos",
    "website":"sitio web",
    "internet":"internet",
    "password":"contraseña",
    "address":"dirección",
    "addresses":"direcciones",
    "numbers":"números",
    "price":"precio",
    "prices":"precios",
    "gift":"regalo",
    "gifts":"regalos",
    "birthday":"cumpleaños",
    "holiday":"vacaciones",
    "trip":"viaje",
    "trips":"viajes",
    "ticket":"boleto",
    "tickets":"boletos",
    "flight":"vuelo",
    "flights":"vuelos",
    "hotel":"hotel",
    "hotels":"hoteles",
    "restaurant":"restaurante",
    "restaurants":"restaurantes",
    "menu":"menú",
    "menus":"menús",
    "bill":"cuenta",
    "bills":"cuentas",
    "shop":"tienda",
    "shops":"tiendas",
    "supermarket":"supermercado",
    "hospital":"hospital",
    "hospitals":"hospitales",
    "medicine":"medicina",
    "medicines":"medicinas",
    "pain":"dolor",
    "pains":"dolores",
    "fever":"fiebre",
    "player":"jugador",
    "players":"jugadores",
    "match":"partido",
    "matches":"partidos",
    "goal":"gol",
    "goals":"goles",
    "ball":"pelota",
    "balls":"pelotas",
    "field":"campo",
    "fields":"campos",
    "race":"carrera",
    "races":"carreras",
    "winner":"ganador",
    "winners":"ganadores",
    "loser":"perdedor",
    "losers":"perdedores",
    "prize":"premio",
    "prizes":"premios",
    "trophy":"trofeo",
    "trophies":"trofeos",
    "tired":"cansado",
    "bored":"aburrido",
    "excited":"emocionado",
    "scared":"asustado",
    "nervous":"nervioso",
    "calm":"tranquilo",
    "proud":"orgulloso",
    "surprised":"sorprendido",
    "confused":"confundido",
    "sick":"enfermo",
    "healthy":"sano",
    "hungry":"hambriento",
    "thirsty":"sediento",
    "ready":"listo",
    "busy":"ocupado",
    "free":"libre",
    "alone":"solo",
    "similar":"similar",
    "popular":"popular",
    "famous":"famoso",
    "interesting":"interesante",
    "boring":"aburrido",
    "amazing":"increíble",
    "awful":"terrible",
    "perfect":"perfecto",
    "broken":"roto",
    "safe":"seguro",
    "dangerous":"peligroso",
    "expensive":"caro",
    "cheap":"barato",
    "delicious":"delicioso",
    "sweet":"dulce",
    "sour":"ácido",
    "bitter":"amargo",
    "salty":"salado",
    "fresh":"fresco",
    "frozen":"congelado",
    "raw":"crudo",
    "flat":"plano",
    "round":"redondo",
    "straight":"recto",
    "curved":"curvo",
    "sharp":"afilado",
    "smooth":"suave",
    "rough":"áspero",
    "wet":"mojado",
    "dry":"seco",
    "alive":"vivo",
    "dead":"muerto",
    "awake":"despierto",
    "asleep":"dormido",
    "married":"casado",
    "single":"soltero",
    "pregnant":"embarazada",
    "correct":"correcto",
    "incorrect":"incorrecto",
    "complete":"completo",
    "available":"disponible",
    "necessary":"necesario",
    "impossible":"imposible",
    "enough":"suficiente",
    "extra":"extra",
    "main":"principal",
    "local":"local",
    "national":"nacional",
    "international":"internacional",
    "official":"oficial",
    "private":"privado",
    "public":"público",
    "natural":"natural",
    "normal":"normal",
    "regular":"regular",
    ".":".",
    "!":"!",
    "?":"?",
    ";":";",
    ":":":"
};


// Diccionario ES→EN
var DIC_ES_EN = {
    "el":"the",
    "la":"the",
    "los":"the",
    "las":"the",
    "lo":"the",
    "un":"a",
    "una":"a",
    "unos":"some",
    "unas":"some",
    "yo":"I",
    "tú":"you",
    "él":"he",
    "ella":"she",
    "nosotros":"we",
    "nosotras":"we",
    "ellos":"they",
    "ellas":"they",
    "me":"me",
    "te":"you",
    "se":"himself",
    "nos":"us",
    "le":"him",
    "les":"them",
    "mi":"my",
    "mis":"my",
    "tu":"your",
    "tus":"your",
    "su":"his",
    "sus":"his",
    "nuestro":"our",
    "nuestra":"our",
    "nuestros":"our",
    "nuestras":"our",
    "este":"this",
    "esta":"this",
    "estos":"these",
    "estas":"these",
    "ese":"that",
    "esa":"that",
    "esos":"those",
    "esas":"those",
    "aquel":"that",
    "aquella":"that",
    "es":"is",
    "son":"are",
    "somos":"are",
    "sois":"are",
    "era":"was",
    "eran":"were",
    "ser":"to be",
    "sido":"been",
    "estar":"to be",
    "estoy":"am",
    "estás":"are",
    "está":"is",
    "estamos":"are",
    "están":"are",
    "estuvo":"was",
    "estuvieron":"were",
    "fue":"was",
    "fueron":"were",
    "tengo":"have",
    "tienes":"have",
    "tiene":"has",
    "tenemos":"have",
    "tienen":"have",
    "voy":"go",
    "vas":"go",
    "va":"goes",
    "vamos":"go",
    "van":"go",
    "corro":"run",
    "corres":"run",
    "corre":"runs",
    "corremos":"run",
    "corren":"run",
    "corrió":"ran",
    "como":"as",
    "comes":"eat",
    "come":"eats",
    "comemos":"eat",
    "comen":"eat",
    "comió":"ate",
    "hablo":"speak",
    "hablas":"speak",
    "habla":"speaks",
    "hablamos":"speak",
    "hablan":"speak",
    "habló":"spoke",
    "trabajo":"work",
    "trabajas":"work",
    "trabaja":"works",
    "trabajamos":"work",
    "trabajan":"work",
    "trabajó":"worked",
    "estudio":"study",
    "estudias":"study",
    "estudia":"studies",
    "estudiamos":"study",
    "estudian":"study",
    "estudió":"studied",
    "vivo":"live",
    "vives":"live",
    "vive":"lives",
    "vivimos":"live",
    "viven":"live",
    "vivió":"lived",
    "ayudo":"help",
    "ayudas":"help",
    "ayuda":"helps",
    "ayudamos":"help",
    "ayudan":"help",
    "ayudó":"helped",
    "necesito":"need",
    "necesitas":"need",
    "necesita":"needs",
    "necesitamos":"need",
    "necesitan":"need",
    "quiero":"want",
    "quieres":"want",
    "quiere":"wants",
    "queremos":"want",
    "quieren":"want",
    "quiso":"wanted",
    "pienso":"think",
    "piensas":"think",
    "piensa":"thinks",
    "pensamos":"think",
    "piensan":"think",
    "pensó":"thought",
    "siento":"feel",
    "sientes":"feel",
    "siente":"feels",
    "sentimos":"feel",
    "sienten":"feel",
    "sintió":"felt",
    "camino":"walk",
    "caminas":"walk",
    "camina":"walks",
    "caminamos":"walk",
    "caminan":"walk",
    "caminó":"walked",
    "leo":"read",
    "lees":"read",
    "lee":"reads",
    "leemos":"read",
    "leen":"read",
    "leyó":"read",
    "escribo":"write",
    "escribes":"write",
    "escribe":"writes",
    "escribimos":"write",
    "escriben":"write",
    "escribió":"wrote",
    "llamo":"call",
    "llamas":"call",
    "llama":"calls",
    "llamamos":"call",
    "llaman":"call",
    "llamó":"called",
    "abro":"open",
    "abres":"open",
    "abre":"opens",
    "abrimos":"open",
    "abren":"open",
    "abrió":"opened",
    "cierro":"close",
    "cierras":"close",
    "cierra":"closes",
    "cerramos":"close",
    "cierran":"close",
    "cerró":"closed",
    "canto":"sing",
    "cantas":"sing",
    "canta":"sings",
    "cantamos":"sing",
    "cantan":"sing",
    "cantó":"sang",
    "bailo":"dance",
    "bailas":"dance",
    "baila":"dances",
    "bailamos":"dance",
    "bailan":"dance",
    "bailó":"danced",
    "cocino":"cook",
    "cocinas":"cook",
    "cocina":"cooks",
    "cocinamos":"cook",
    "cocinan":"cook",
    "cocinó":"cooked",
    "compro":"buy",
    "compras":"buy",
    "compra":"buys",
    "compramos":"buy",
    "compran":"buy",
    "compró":"bought",
    "duermo":"sleep",
    "duermes":"sleep",
    "duerme":"sleeps",
    "dormimos":"sleep",
    "duermen":"sleep",
    "durmió":"slept",
    "gato":"cat",
    "gatos":"cats",
    "perro":"dog",
    "perros":"dogs",
    "casa":"house",
    "casas":"houses",
    "carro":"car",
    "carros":"cars",
    "coche":"car",
    "coches":"cars",
    "libro":"book",
    "libros":"books",
    "hombre":"man",
    "hombres":"men",
    "mujer":"woman",
    "mujeres":"women",
    "niño":"boy",
    "niños":"boys",
    "niña":"girl",
    "niñas":"girls",
    "bebé":"baby",
    "bebés":"babies",
    "día":"day",
    "días":"days",
    "año":"year",
    "años":"years",
    "tiempo":"time",
    "vida":"life",
    "mundo":"world",
    "escuela":"school",
    "escuelas":"schools",
    "agua":"water",
    "comida":"food",
    "ciudad":"city",
    "ciudades":"cities",
    "país":"country",
    "países":"countries",
    "familia":"family",
    "familias":"families",
    "amigo":"friend",
    "amigos":"friends",
    "amiga":"friend",
    "amigas":"friends",
    "mano":"hand",
    "manos":"hands",
    "ojo":"eye",
    "ojos":"eyes",
    "cara":"face",
    "cabeza":"head",
    "puerta":"door",
    "puertas":"doors",
    "mesa":"table",
    "mesas":"tables",
    "silla":"chair",
    "sillas":"chairs",
    "árbol":"tree",
    "árboles":"trees",
    "flor":"flower",
    "flores":"flowers",
    "pájaro":"bird",
    "pájaros":"birds",
    "sol":"sun",
    "luna":"moon",
    "estrella":"star",
    "estrellas":"stars",
    "cielo":"sky",
    "calle":"street",
    "calles":"streets",
    "nombre":"name",
    "nombres":"names",
    "palabra":"word",
    "palabras":"words",
    "idioma":"language",
    "noche":"night",
    "semana":"week",
    "semanas":"weeks",
    "mes":"month",
    "meses":"months",
    "dinero":"money",
    "corazón":"heart",
    "mente":"mind",
    "cuerpo":"body",
    "voz":"voice",
    "historia":"story",
    "historias":"stories",
    "pregunta":"asks",
    "preguntas":"ask",
    "problema":"problem",
    "problemas":"problems",
    "idea":"idea",
    "ideas":"ideas",
    "maestro":"teacher",
    "maestros":"teachers",
    "maestra":"teacher",
    "maestras":"teachers",
    "estudiante":"student",
    "estudiantes":"students",
    "doctor":"doctor",
    "doctores":"doctors",
    "madre":"mother",
    "padre":"father",
    "hijo":"son",
    "hijos":"sons",
    "hija":"daughter",
    "hijas":"daughters",
    "hermano":"brother",
    "hermanos":"brothers",
    "hermana":"sister",
    "hermanas":"sisters",
    "gente":"people",
    "persona":"person",
    "personas":"persons",
    "lugar":"place",
    "lugares":"places",
    "cosa":"thing",
    "cosas":"things",
    "parque":"park",
    "parques":"parks",
    "computadora":"computer",
    "teléfono":"phone",
    "teléfonos":"phones",
    "música":"music",
    "juego":"play",
    "juegos":"games",
    "deporte":"sport",
    "deportes":"sports",
    "manzana":"apple",
    "manzanas":"apples",
    "pan":"bread",
    "leche":"milk",
    "huevo":"egg",
    "huevos":"eggs",
    "fruta":"fruit",
    "frutas":"fruits",
    "número":"number",
    "números":"numbers",
    "color":"color",
    "colores":"colors",
    "luz":"light",
    "río":"river",
    "ríos":"rivers",
    "mar":"sea",
    "océano":"ocean",
    "montaña":"mountain",
    "montañas":"mountains",
    "jardín":"garden",
    "jardines":"gardens",
    "edificio":"building",
    "edificios":"buildings",
    "ventana":"window",
    "ventanas":"windows",
    "piso":"floor",
    "papel":"paper",
    "pluma":"pen",
    "plumas":"pens",
    "lápiz":"pencil",
    "lápices":"pencils",
    "bueno":"good",
    "buena":"good",
    "malo":"bad",
    "mala":"bad",
    "grande":"big",
    "pequeño":"small",
    "pequeña":"small",
    "alto":"tall",
    "alta":"tall",
    "bajo":"under",
    "baja":"short",
    "largo":"long",
    "larga":"long",
    "nuevo":"new",
    "nueva":"new",
    "viejo":"old",
    "vieja":"old",
    "joven":"young",
    "hermoso":"beautiful",
    "hermosa":"beautiful",
    "bonito":"pretty",
    "bonita":"pretty",
    "feo":"ugly",
    "fea":"ugly",
    "feliz":"happy",
    "triste":"sad",
    "rápido":"fast",
    "rápida":"fast",
    "lento":"slow",
    "lenta":"slow",
    "caliente":"hot",
    "frío":"cold",
    "fría":"cold",
    "cálido":"warm",
    "cálida":"warm",
    "fresco":"cool",
    "fresca":"cool",
    "blanco":"white",
    "blanca":"white",
    "negro":"black",
    "negra":"black",
    "rojo":"red",
    "roja":"red",
    "azul":"blue",
    "verde":"green",
    "amarillo":"yellow",
    "amarilla":"yellow",
    "fuerte":"strong",
    "débil":"weak",
    "fácil":"easy",
    "difícil":"hard",
    "rico":"rich",
    "rica":"rich",
    "pobre":"poor",
    "limpio":"clean",
    "limpia":"clean",
    "sucio":"dirty",
    "sucia":"dirty",
    "lleno":"full",
    "llena":"full",
    "vacío":"empty",
    "vacía":"empty",
    "importante":"important",
    "especial":"special",
    "inteligente":"smart",
    "amable":"kind",
    "valiente":"brave",
    "gracioso":"funny",
    "graciosa":"funny",
    "serio":"serious",
    "seria":"serious",
    "primero":"first",
    "primera":"first",
    "último":"last",
    "última":"last",
    "siguiente":"next",
    "otro":"other",
    "otra":"other",
    "mismo":"same",
    "misma":"same",
    "posible":"possible",
    "diferente":"different",
    "simple":"simple",
    "real":"real",
    "verdadero":"true",
    "verdadera":"true",
    "muy":"very",
    "bien":"well",
    "también":"also",
    "solo":"just",
    "ahora":"now",
    "entonces":"then",
    "aquí":"here",
    "allí":"there",
    "allá":"there",
    "siempre":"always",
    "nunca":"never",
    "todavía":"still",
    "ya":"already",
    "pronto":"soon",
    "bastante":"quite",
    "mucho":"much",
    "más":"more",
    "menos":"less",
    "realmente":"really",
    "rápidamente":"quickly",
    "lentamente":"slowly",
    "temprano":"early",
    "tarde":"late",
    "juntos":"together",
    "quizás":"perhaps",
    "tal vez":"maybe",
    "casi":"almost",
    "ayer":"yesterday",
    "hoy":"today",
    "mañana":"tomorrow",
    "lejos":"away",
    "atrás":"back",
    "en":"in",
    "sobre":"on",
    "a":"to",
    "para":"for",
    "de":"of",
    "con":"with",
    "por":"by",
    "desde":"from",
    "hacia":"toward",
    "hasta":"until",
    "entre":"between",
    "sin":"without",
    "durante":"during",
    "antes":"before",
    "después":"after",
    "encima":"above",
    "debajo":"below",
    "cerca":"near",
    "detrás":"behind",
    "y":"and",
    "e":"and",
    "pero":"but",
    "o":"or",
    "u":"or",
    "ni":"nor",
    "porque":"because",
    "si":"if",
    "aunque":"although",
    "cuando":"when",
    "donde":"where",
    "mientras":"while",
    "que":"that",
    "pues":"so",
    "al":"to the",
    "del":"of the",
    "amo":"love",
    "amas":"love",
    "amó":"loved",
    "amamos":"love",
    "aman":"love",
    "soy":"am",
    "eres":"are",
    "tenía":"had",
    "tenías":"had",
    "tenían":"had",
    "puedo":"can",
    "puedes":"can",
    "puede":"can",
    "podemos":"can",
    "pueden":"can",
    "debo":"must",
    "debes":"must",
    "debe":"must",
    "sé":"know",
    "sabes":"know",
    "sabe":"knows",
    "veo":"see",
    "ves":"see",
    "ve":"sees",
    "doy":"give",
    "das":"give",
    "da":"gives",
    "hago":"do",
    "haces":"do",
    "hace":"does",
    "traigo":"bring",
    "traes":"bring",
    "trae":"brings",
    "pongo":"put",
    "pones":"put",
    "pone":"puts",
    "salgo":"leave",
    "sales":"leave",
    "sale":"leaves",
    "llego":"arrive",
    "llegas":"arrive",
    "llega":"arrives",
    "juegas":"play",
    "juega":"plays",
    "vuelo":"fly",
    "vuelas":"fly",
    "vuela":"flies",
    "nado":"swim",
    "nadas":"swim",
    "nada":"swims",
    "conduzco":"drive",
    "conduces":"drive",
    "conduce":"drives",
    "gano":"win",
    "ganas":"win",
    "gana":"wins",
    "pierdo":"lose",
    "pierdes":"lose",
    "pierde":"loses",
    "creo":"believe",
    "creas":"create",
    "crea":"creates",
    "dibujo":"draw",
    "dibujas":"draw",
    "dibuja":"draws",
    "espero":"wait",
    "esperas":"wait",
    "espera":"waits",
    "pregunto":"ask",
    "respondo":"answer",
    "respondes":"answer",
    "responde":"answers",
    "muestro":"show",
    "muestras":"show",
    "muestra":"shows",
    "muevo":"move",
    "mueves":"move",
    "mueve":"moves",
    "llevo":"carry",
    "llevas":"carry",
    "lleva":"carries",
    "empiezo":"start",
    "empiezas":"start",
    "empieza":"starts",
    "termino":"finish",
    "terminas":"finish",
    "termina":"finishes",
    "intento":"try",
    "intentas":"try",
    "intenta":"tries",
    "uso":"use",
    "usas":"use",
    "usa":"uses",
    "crees":"believe",
    "cree":"believes",
    "encuentro":"find",
    "encuentras":"find",
    "encuentra":"finds",
    "mantengo":"keep",
    "mantienes":"keep",
    "mantiene":"keeps",
    "detengo":"stop",
    "detienes":"stop",
    "detiene":"stops",
    "escucho":"listen",
    "escuchas":"listen",
    "escucha":"listens",
    "oh":"oh",
    "ay":"ouch",
    "eh":"hey",
    "ah":"ah",
    "oye":"hey",
    "hola":"hello",
    "adiós":"goodbye",
    "ok":"ok",
    "uy":"oops",
    "vaya":"wow",
    "caramba":"wow",
    "bravo":"bravo",
    "hurra":"hurray",
    "por favor":"please",
    "gracias":"thanks",
    "perdón":"sorry",
    "disculpa":"excuse me",
    ".":".",
    "!":"!",
    "?":"?",
    ";":";",
    ":":":"
};


function generarTraduccion(tokens, direccion) {
    var dic      = direccion === 'en-es' ? DIC_EN_ES : DIC_ES_EN;
    var resultado = '';
    var primero   = true;

    tokens.forEach(function(token) {
        var lexema     = token.lexema;
        var traduccion = dic[lexema.toLowerCase()] || lexema;

        if (token.categoria === 'Puntuacion') {
            resultado += traduccion;
        } else {
            if (!primero) resultado += ' ';
            resultado += traduccion;
        }
        primero = false;
    });

    return resultado.trim();
}

// ══════════════════════════════════════════════════════
//  SECCIÓN 11 — RECONOCIMIENTO DE VOZ
//  Usa la Web Speech API (funciona en Chrome y Edge).
//  El idioma se detecta automáticamente según la
//  dirección de traducción seleccionada.
// ══════════════════════════════════════════════════════

var reconocimiento = null;
var vozActiva      = false;

function toggleVoz() {
    if (vozActiva) {
        detenerVoz();
    } else {
        iniciarVoz();
    }
}

function iniciarVoz() {
    // Verifica que el navegador soporte la Web Speech API
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        mostrarToast('Tu navegador no soporta reconocimiento de voz. Usa Chrome.');
        return;
    }

    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    reconocimiento = new SpeechRecognition();

    // Idioma automático según la dirección seleccionada
    reconocimiento.lang = (direccionActual === 'en-es') ? 'en-US' : 'es-ES';

    reconocimiento.continuous     = false; // una sola frase por vez
    reconocimiento.interimResults = false; // solo resultado final

    // Cuando detecta texto
    reconocimiento.onresult = function(event) {
        var texto = event.results[0][0].transcript;
        document.getElementById('inputText').value = texto;
        manejarEntrada();
        mostrarToast('Voz transcrita: "' + texto + '"');
        detenerVoz();
    };

    // Cuando termina de escuchar
    reconocimiento.onend = function() {
        detenerVoz();
    };

    // Si hay un error
    reconocimiento.onerror = function(event) {
        if (event.error === 'no-speech') {
            mostrarToast('No se detectó voz. Intenta de nuevo.');
        } else if (event.error === 'not-allowed') {
            mostrarToast('Permiso de micrófono denegado.');
        } else {
            mostrarToast('Error de voz: ' + event.error);
        }
        detenerVoz();
    };

    reconocimiento.start();
    vozActiva = true;

    // Activa la animación del botón
    document.getElementById('btnMic').classList.add('escuchando');
    var idioma = (direccionActual === 'en-es') ? 'inglés' : 'español';
    mostrarToast('Escuchando en ' + idioma + '...');
}

function detenerVoz() {
    if (reconocimiento) {
        reconocimiento.stop();
        reconocimiento = null;
    }
    vozActiva = false;
    document.getElementById('btnMic').classList.remove('escuchando');
}