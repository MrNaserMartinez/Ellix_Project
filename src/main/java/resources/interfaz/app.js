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
    mostrarTraduccion('[Síntesis pendiente — Programador 3]');
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

    var PADDING  = 80;
    var maxX     = Math.max.apply(null, nodos.map(function(n){ return n.x; })) + PADDING;
    var maxY     = Math.max.apply(null, nodos.map(function(n){ return n.y; })) + PADDING;
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

        if (n.terminal) {
            var sh = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            sh.setAttribute('x', n.x-28); sh.setAttribute('y', n.y-10);
            sh.setAttribute('width','56'); sh.setAttribute('height','26');
            sh.setAttribute('rx','8'); sh.setAttribute('fill','rgba(0,0,0,0.07)');
            g.appendChild(sh);
            var r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            r.setAttribute('x', n.x-30); r.setAttribute('y', n.y-13);
            r.setAttribute('width','60'); r.setAttribute('height','26');
            r.setAttribute('rx','8'); r.setAttribute('fill', c.f);
            r.setAttribute('stroke', c.b); r.setAttribute('stroke-width','1.5');
            g.appendChild(r);
        } else {
            var sh2 = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            sh2.setAttribute('cx', n.x+2); sh2.setAttribute('cy', n.y+3);
            sh2.setAttribute('rx','50'); sh2.setAttribute('ry','20');
            sh2.setAttribute('fill','rgba(0,0,0,0.09)');
            g.appendChild(sh2);
            var el = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            el.setAttribute('cx', n.x); el.setAttribute('cy', n.y);
            el.setAttribute('rx','50'); el.setAttribute('ry','20');
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
        txt.textContent = n.etiqueta.length > 12 ? n.etiqueta.substring(0,11)+'…' : n.etiqueta;
        g.appendChild(txt);
        svg.appendChild(g);
    });

    wrapper.appendChild(svg);

    // Ajusta la altura del wrapper al contenido del SVG
    wrapper.style.height = Math.min(maxY + 50, window.innerHeight * 0.8) + 'px';

    // Centra el scroll al generar
    setTimeout(function() {
        wrapper.scrollLeft = Math.max(0, (wrapper.scrollWidth - wrapper.clientWidth) / 2);
        wrapper.scrollTop  = 0;
    }, 50);

    habilitarArrastre(wrapper);
}

function calcularPos(nodo, nivel, nodos, lineas, ref) {
    var ANCHO = 120, ALTO = 80;
    var id    = nodos.length;
    nodos.push(null);
    var posX, posY = nivel * ALTO + 50;

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
            lineas.push({ x1:posX, y1:posY+20, x2:nodos[hid].x, y2:nodos[hid].y-20, terminal:nodos[hid].terminal });
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
var SUST_EN = /^(cat|dog|bird|fish|horse|cow|sheep|pig|lion|tiger|bear|wolf|fox|rabbit|deer|elephant|monkey|snake|turtle|frog|butterfly|eagle|owl|parrot|penguin|dolphin|whale|shark|man|woman|boy|girl|child|baby|person|people|teacher|student|doctor|nurse|engineer|lawyer|king|queen|prince|princess|president|mother|father|son|daughter|brother|sister|friend|enemy|neighbor|stranger|hero|artist|musician|writer|actor|athlete|soldier|house|home|school|hospital|church|store|market|city|town|village|country|world|street|road|bridge|park|garden|forest|mountain|river|sea|ocean|lake|beach|island|room|kitchen|bedroom|bathroom|office|library|restaurant|hotel|airport|station|book|pen|pencil|paper|table|chair|door|window|wall|floor|phone|computer|television|camera|radio|car|bus|train|plane|boat|bicycle|bag|box|bottle|cup|plate|spoon|knife|fork|bed|pillow|blanket|mirror|lamp|clock|sun|moon|star|sky|cloud|rain|snow|wind|fire|water|air|earth|tree|flower|grass|leaf|seed|fruit|vegetable|apple|orange|banana|grape|strawberry|mango|bread|rice|meat|egg|milk|cheese|butter|sugar|salt|time|day|night|morning|afternoon|evening|week|month|year|hour|minute|second|life|death|love|hate|peace|war|truth|lie|idea|thought|dream|memory|story|news|word|sentence|language|name|number|color|music|art|game|sport|dance|song|money|price|work|job|business|food|health|energy|power|light|sound|problem|question|answer|reason|result|way|place|thing|part|group|team|heart|mind|body|hand|eye|face|head|voice|smile|tear|breath|weather|temperature|storm|thunder|lightning|building|roof|path|corner|center)$/;

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
    if (/^(yo|tú|él|ella|nosotros|nosotras|vosotros|vosotras|ellos|ellas|me|te|se|nos|os|le|lo|la|les|quien|quienes|que|cual|cuales|alguien|nadie|algo|nada|mismo|misma|mismos|mismas)$/.test(p))
        return { cat:'Pronombre', sub:'Personal', esError:false };
    if (/^(es|son|era|eran|fue|fueron|ser|sido|siendo|estar|estoy|estás|está|estamos|estáis|están|estuvo|estuvieron|haber|he|has|ha|hemos|habéis|han|hubo|tener|tengo|tienes|tiene|tenemos|tienen|tuvo|ir|voy|vas|va|vamos|van|hacer|hago|haces|hace|hacemos|hacen|hizo|poder|puedo|puedes|puede|podemos|pueden|pudo|querer|quiero|quieres|quiere|queremos|quieren|quiso|saber|sé|sabes|sabe|sabemos|saben|supo|ver|veo|ves|ve|vemos|ven|vio|dar|doy|das|da|damos|dan|dio|decir|digo|dices|dice|decimos|dicen|dijo|hablar|hablo|hablas|habla|hablamos|hablan|habló|comer|como|comes|come|comemos|comen|comió|vivir|vivo|vives|vive|vivimos|viven|vivió|trabajar|trabajo|trabajas|trabaja|trabajamos|trabajan|trabajó|estudiar|estudio|estudias|estudia|estudiamos|estudian|estudió|correr|corro|corres|corre|corremos|corren|corrió|leer|leo|lees|lee|leemos|leen|leyó|escribir|escribo|escribes|escribe|escribimos|escriben|escribió|escuchar|escucho|escuchas|escucha|escuchamos|escuchan|escuchó|ayudar|ayudo|ayudas|ayuda|ayudamos|ayudan|ayudó|necesitar|necesito|necesitas|necesita|necesitamos|necesitan|amar|amo|amas|ama|amamos|aman|pensar|pienso|piensas|piensa|pensamos|piensan|sentir|siento|sientes|siente|sentimos|sienten|caminar|camino|caminas|camina|caminamos|caminan|llevar|llevo|llevas|lleva|llevamos|llevan|llamar|llamo|llamas|llama|llamamos|llaman|comenzar|comienzo|comienzas|comienza|comenzamos|comienzan|terminar|termino|terminas|termina|terminamos|terminan|abrir|abro|abres|abre|abrimos|abren|cerrar|cierro|cierras|cierra|cerramos|cierran|jugar|juego|juegas|juega|jugamos|juegan|comprar|compro|compras|compra|compramos|compran|dormir|duermo|duermes|duerme|dormimos|duermen|reír|río|ríes|ríe|reímos|ríen|llorar|lloro|lloras|llora|lloramos|lloran|cantar|canto|cantas|canta|cantamos|cantan|bailar|bailo|bailas|baila|bailamos|bailan)$/.test(p))
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
        if (esCat('Puntuacion')) { adv(); continue; }
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