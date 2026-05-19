let direccionActual = 'en-es';

// Texto de prueba que se carga al abrir la página
const TEXTO_PRUEBA = "The cat runs quickly in the house.\nShe is a beautiful and happy girl.\nThey have good books at school.";

window.onload = function() {
    // Carga el texto de prueba en el panel de entrada
    document.getElementById('inputText').value = TEXTO_PRUEBA;
    manejarEntrada();
    mostrarToast('Texto de prueba cargado');
};

// ── Cambiar dirección de traducción ──
function setDirection(dir) {
    direccionActual = dir;

    document.getElementById('btn-en-es').classList.toggle('active', dir === 'en-es');
    document.getElementById('btn-es-en').classList.toggle('active', dir === 'es-en');

    document.getElementById('label-input').textContent  = dir === 'en-es' ? 'Inglés'  : 'Español';
    document.getElementById('label-output').textContent = dir === 'en-es' ? 'Español' : 'Inglés';

    limpiarResultados();
    mostrarToast('Dirección cambiada: ' + (dir === 'en-es' ? 'Inglés → Español' : 'Español → Inglés'));
}

// ── Contador de caracteres en tiempo real ──
function manejarEntrada() {
    const texto = document.getElementById('inputText').value;
    document.getElementById('charCount').textContent = texto.length + ' caracteres';
}

// ── Limpiar panel de entrada ──
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
    document.getElementById('tokensBody').innerHTML  = '';
    document.getElementById('erroresBody').innerHTML = '';
}

function actualizarStatus(texto, tipo) {
    const tag = document.getElementById('statusTag');
    tag.textContent = texto;
    tag.className   = 'status-tag ' + (tipo || '');
}

function mostrarTab(nombre) {
    document.querySelectorAll('.tab-content').forEach(function(el) {
        el.style.display = 'none';
    });
    document.querySelectorAll('.tab').forEach(function(el) {
        el.classList.remove('active');
    });
    document.getElementById('tab-' + nombre).style.display = 'block';
    document.querySelectorAll('.tab').forEach(function(btn) {
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
    setTimeout(function() { toast.classList.remove('visible'); }, 2500);
}

function escaparHTML(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}


function cargarArchivo(event) {
    const archivo = event.target.files[0];
    if (!archivo) return;

    // Solo acepta archivos .txt
    if (!archivo.name.endsWith('.txt')) {
        mostrarToast('Solo se aceptan archivos .txt');
        return;
    }

    const lector = new FileReader();
    lector.onload = function(e) {
        document.getElementById('inputText').value = e.target.result;
        manejarEntrada();
        mostrarToast('Archivo cargado: ' + archivo.name);
    };
    lector.onerror = function() {
        mostrarToast('Error al leer el archivo');
    };
    lector.readAsText(archivo, 'UTF-8');

    // Permite volver a cargar el mismo archivo
    event.target.value = '';
}

function analizarTexto() {
    const texto = document.getElementById('inputText').value.trim();

    if (!texto) {
        mostrarToast('Escribe o carga un texto primero');
        return;
    }

    const resultado = ejecutarAnalisisLexico(texto, direccionActual);
    mostrarResultados(resultado);
}

function mostrarResultados(resultado) {
    document.getElementById('tablesSection').style.display = 'block';

    llenarTablaTokens(resultado.tokens);
    llenarTablaErrores(resultado.errores);

    if (resultado.errores.length === 0) {
        // Sin errores: muestra la traducción y abre tab de tokens
        mostrarTraduccion(resultado.traduccion);
        actualizarStatus('Sin errores', 'ok');
        mostrarTab('tokens');
    } else {
        // Con errores: avisa y abre tab de errores
        document.getElementById('outputText').innerHTML =
            '<span style="color:var(--red-error);font-style:italic;">' +
            '⚠ Se encontraron ' + resultado.errores.length +
            ' error(es) léxico(s). Revisa la tabla de errores.</span>';
        actualizarStatus(resultado.errores.length + ' error(es)', 'error');
        mostrarTab('errores');
    }
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
            '<td><span class="badge badge-' + token.categoria.toLowerCase() + '">' +
            token.categoria + '</span></td>' +
            '<td>' + (token.subcategoria || '—') + '</td>' +
            '<td>' + token.linea + '</td>' +
            '<td>' + token.columna + '</td>';
        cuerpo.appendChild(fila);
    });
}

// ── Llena la tabla de errores ──
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

// ── Muestra la traducción en el panel derecho ──
function mostrarTraduccion(traduccion) {
    const contenedor = document.getElementById('outputText');

    if (!traduccion || traduccion.trim() === '') {
        contenedor.innerHTML = '<span class="output-placeholder">Sin traducción disponible.</span>';
        return;
    }

    // Cada palabra aparece como chip individual
    const palabras = traduccion.split(' ');
    const html = palabras.map(function(p) {
        return '<span class="word-chip">' + escaparHTML(p) + '</span>';
    }).join(' ');

    contenedor.innerHTML = html;
}

function ejecutarAnalisisLexico(texto, direccion) {
    const resultado = { tokens: [], errores: [], traduccion: '' };

    // Divide el texto en líneas para rastrear número de línea
    const lineas = texto.split('\n');

    lineas.forEach(function(lineaTexto, numLinea) {

        const partes = lineaTexto.match(/[\wáéíóúüñÁÉÍÓÚÜÑ']+|[.,!?;:()'"\-]/g);
        if (!partes) return;

        let posicion = 0;
        partes.forEach(function(lexema) {
            const columna = lineaTexto.indexOf(lexema, posicion) + 1;
            const info    = clasificarPalabra(lexema, direccion);

            if (info.esError) {
                resultado.errores.push({
                    tipo:        'Léxico',
                    lexema:      lexema,
                    linea:       numLinea + 1,
                    columna:     columna,
                    descripcion: 'Palabra no reconocida en el diccionario: "' + lexema + '"'
                });
            } else {
                resultado.tokens.push({
                    lexema:       lexema,
                    categoria:    info.categoria,
                    subcategoria: info.subcategoria,
                    linea:        numLinea + 1,
                    columna:      columna
                });
            }
            posicion = lineaTexto.indexOf(lexema, posicion) + lexema.length;
        });
    });

    // Sin errores léxicos: síntesis pendiente para Fase 3
    if (resultado.errores.length === 0) {
        resultado.traduccion = '[Síntesis pendiente — Fase 3]';
    }

    return resultado;
}

// ── Clasifica una palabra ──
function clasificarPalabra(lexema, direccion) {
    const p = lexema.toLowerCase();

    // Signos de puntuación
    if (/^[.,!?;:()'"\-]$/.test(lexema))
        return { categoria: 'Puntuacion', subcategoria: lexema, esError: false };

    // Números cardinales
    if (/^\d+$/.test(lexema))
        return { categoria: 'Numeral', subcategoria: 'Cardinal', esError: false };

    // Contracciones del español
    if (p === 'al' || p === 'del')
        return { categoria: 'Contraccion', subcategoria: p, esError: false };

    // Delega al diccionario según la dirección
    return (direccion === 'en-es')
        ? clasificarIngles(lexema, p)
        : clasificarEspanol(lexema, p);
}

function clasificarIngles(lexema, p) {

    // Artículos
    if (/^(the|a|an)$/.test(p))
        return { categoria: 'Articulo', subcategoria: 'Definido/Indefinido', esError: false };

    // Posesivos
    if (/^(my|your|his|her|its|our|their)$/.test(p))
        return { categoria: 'Posesivo', subcategoria: 'Posesivo', esError: false };

    // Demostrativos
    if (/^(this|that|these|those)$/.test(p))
        return { categoria: 'Demostrativo', subcategoria: 'Demostrativo', esError: false };

    // Pronombres personales y reflexivos
    if (/^(i|you|he|she|it|we|they|me|him|her|us|them|who|whom|whose|which|what|myself|yourself|himself|herself|itself|ourselves|themselves)$/.test(p))
        return { categoria: 'Pronombre', subcategoria: 'Personal', esError: false };

    // Verbos
    if (/^(is|are|was|were|be|been|being|am|have|has|had|do|does|did|will|would|shall|should|may|might|can|could|must|run|runs|ran|eat|eats|ate|go|goes|went|see|sees|saw|come|comes|came|know|knows|knew|think|thinks|thought|like|likes|liked|want|wants|wanted|need|needs|needed|love|loves|loved|feel|feels|felt|read|reads|write|writes|wrote|written|speak|speaks|spoke|listen|listens|listened|work|works|worked|play|plays|played|study|studies|studied|learn|learns|learned|teach|teaches|taught|help|helps|helped|make|makes|made|take|takes|took|taken|give|gives|gave|given|get|gets|got|put|puts|set|sets|let|lets|say|says|said|tell|tells|told|ask|asks|asked|answer|answers|answered|find|finds|found|keep|keeps|kept|start|starts|started|stop|stops|stopped|open|opens|opened|close|closes|closed|call|calls|called|try|tries|tried|use|uses|used|show|shows|showed|shown|move|moves|moved|live|lives|lived|believe|believes|believed|hold|holds|held|bring|brings|brought|happen|happens|happened|walk|walks|walked|turn|turns|turned|begin|begins|began|begun|carry|carries|carried|wait|waits|waited)$/.test(p))
        return { categoria: 'Verbo', subcategoria: 'Conjugado', esError: false };

    // Adverbios
    if (/^(very|well|also|just|now|then|here|there|always|never|often|sometimes|rarely|usually|still|already|soon|again|too|quite|much|more|most|less|least|only|really|quickly|slowly|early|late|together|away|back|up|down|out|perhaps|maybe|certainly|probably|definitely|almost|enough|even|else|instead|yesterday|today|tomorrow|ago|everywhere|somewhere|nowhere|anywhere|once|twice|thrice)$/.test(p))
        return { categoria: 'Adverbio', subcategoria: detectarSubtipoAdverbioEN(p), esError: false };

    // Preposiciones
    if (/^(in|on|at|to|for|of|with|by|from|up|about|into|through|during|before|after|above|below|between|among|under|over|near|behind|beside|along|across|around|against|without|within|beyond|toward|towards|despite|except|per|since|until|upon)$/.test(p))
        return { categoria: 'Preposicion', subcategoria: '—', esError: false };

    // Conjunciones coordinantes
    if (/^(and|but|or|nor|for|yet|so|both|either|neither)$/.test(p))
        return { categoria: 'Conjuncion', subcategoria: 'Coordinante', esError: false };

    // Conjunciones subordinantes
    if (/^(because|since|although|though|if|unless|until|when|where|while|that|which|who|whom|whose|as|than|whether|whenever|wherever|however|whatever|whoever)$/.test(p))
        return { categoria: 'Conjuncion', subcategoria: 'Subordinante', esError: false };

    // Adjetivos
    if (/^(good|bad|big|small|new|old|young|long|short|high|low|great|little|own|right|left|next|last|hard|easy|strong|weak|happy|sad|beautiful|ugly|fast|slow|hot|cold|warm|cool|white|black|red|blue|green|yellow|orange|purple|brown|gray|large|tiny|huge|tall|wide|narrow|deep|rich|poor|busy|free|full|empty|clean|dirty|quiet|loud|bright|dark|important|different|possible|sure|ready|open|closed|simple|complex|special|common|first|second|third|other|same|only|whole|real|true|false)$/.test(p))
        return { categoria: 'Adjetivo', subcategoria: 'Calificativo', esError: false };

    // Sustantivos
    if (/^(cat|dog|house|car|book|man|woman|child|boy|girl|baby|day|year|time|way|life|world|school|work|water|food|city|country|family|friend|hand|eye|face|head|door|table|chair|room|tree|flower|bird|sun|moon|star|sky|street|name|word|sentence|language|morning|afternoon|evening|night|week|month|money|price|store|market|road|heart|mind|body|voice|sound|light|color|letter|number|story|news|question|answer|problem|idea|king|queen|teacher|student|doctor|mother|father|son|daughter|brother|sister|people|person|place|thing|part|air|fire|earth|ground|river|sea|ocean|garden|park|building|window|wall|floor|computer|phone|paper|pen|pencil|music|art|game|sport|team|fish|horse|cow|sheep|pig|lion|tiger|bear|apple|bread|milk|rice|egg|meat|fruit|vegetable)$/.test(p))
        return { categoria: 'Sustantivo', subcategoria: 'Común', esError: false };

    // Interjecciones
    if (/^(oh|wow|hey|hi|hello|bye|yes|no|ok|okay|ouch|hmm|ah|aha|oops|hurray|alas|bravo)$/.test(p))
        return { categoria: 'Interjeccion', subcategoria: '—', esError: false };

    return { categoria: 'Desconocido', subcategoria: '—', esError: true };
}

// Detecta el subtipo del adverbio en inglés
function detectarSubtipoAdverbioEN(p) {
    if (/^(now|then|yesterday|today|tomorrow|ago|soon|already|still|early|late)$/.test(p))          return 'Tiempo';
    if (/^(here|there|everywhere|somewhere|nowhere|anywhere|away|back|up|down|out)$/.test(p))        return 'Lugar';
    if (/^(very|much|more|most|less|least|quite|almost|enough|once|twice|thrice)$/.test(p))          return 'Cantidad';
    if (/^(well|quickly|slowly|really|together|instead)$/.test(p))                                  return 'Modo';
    if (/^(always|certainly|definitely|yes|also)$/.test(p))                                         return 'Afirmación';
    if (/^(never|rarely|nowhere)$/.test(p))                                                         return 'Negación';
    if (/^(perhaps|maybe|probably|possibly)$/.test(p))                                              return 'Duda';
    return 'Modo';
}

function clasificarEspanol(lexema, p) {

    // Artículos
    if (/^(el|la|los|las|un|una|unos|unas|lo)$/.test(p))
        return { categoria: 'Articulo', subcategoria: 'Definido/Indefinido', esError: false };

    // Posesivos
    if (/^(mi|mis|tu|tus|su|sus|nuestro|nuestra|nuestros|nuestras|vuestro|vuestra|vuestros|vuestras|mío|mía|míos|mías|tuyo|tuya|tuyos|tuyas|suyo|suya|suyos|suyas)$/.test(p))
        return { categoria: 'Posesivo', subcategoria: 'Posesivo', esError: false };

    // Demostrativos
    if (/^(este|esta|estos|estas|ese|esa|esos|esas|aquel|aquella|aquellos|aquellas|esto|eso|aquello)$/.test(p))
        return { categoria: 'Demostrativo', subcategoria: 'Demostrativo', esError: false };

    // Pronombres
    if (/^(yo|tú|él|ella|nosotros|nosotras|vosotros|vosotras|ellos|ellas|me|te|se|nos|os|le|lo|la|les|quien|quienes|que|cual|cuales|alguien|nadie|algo|nada|mismo|misma|mismos|mismas)$/.test(p))
        return { categoria: 'Pronombre', subcategoria: 'Personal', esError: false };

    // Verbos
    if (/^(es|son|era|eran|fue|fueron|ser|sido|siendo|estar|estoy|estás|está|estamos|estáis|están|estuvo|estuvieron|haber|he|has|ha|hemos|habéis|han|hubo|tener|tengo|tienes|tiene|tenemos|tienen|tuvo|tuvieron|ir|voy|vas|va|vamos|van|hacer|hago|haces|hace|hacemos|hacen|hizo|hicieron|poder|puedo|puedes|puede|podemos|pueden|pudo|pudieron|querer|quiero|quieres|quiere|queremos|quieren|quiso|quisieron|saber|sé|sabes|sabe|sabemos|saben|supo|supieron|ver|veo|ves|ve|vemos|ven|vio|vieron|dar|doy|das|da|damos|dan|dio|dieron|decir|digo|dices|dice|decimos|dicen|dijo|dijeron|hablar|hablo|hablas|habla|hablamos|hablan|habló|hablaron|comer|como|comes|come|comemos|comen|comió|comieron|vivir|vivo|vives|vive|vivimos|viven|vivió|vivieron|trabajar|trabajo|trabajas|trabaja|trabajamos|trabajan|trabajó|estudiar|estudio|estudias|estudia|estudiamos|estudian|estudió|correr|corro|corres|corre|corremos|corren|corrió|leer|leo|lees|lee|leemos|leen|leyó|leyeron|escribir|escribo|escribes|escribe|escribimos|escriben|escribió|escuchar|escucho|escuchas|escucha|escuchamos|escuchan|escuchó|ayudar|ayudo|ayudas|ayuda|ayudamos|ayudan|ayudó|necesitar|necesito|necesitas|necesita|necesitamos|necesitan|amar|amo|amas|ama|amamos|aman|amó|amaron|pensar|pienso|piensas|piensa|pensamos|piensan|pensó|sentir|siento|sientes|siente|sentimos|sienten|sintió|caminar|camino|caminas|camina|caminamos|caminan|caminó|llevar|llevo|llevas|lleva|llevamos|llevan|llevó|llamar|llamo|llamas|llama|llamamos|llaman|llamó|comenzar|comienzo|comienzas|comienza|comenzamos|comienzan|comenzó|terminar|termino|terminas|termina|terminamos|terminan|terminó|abrir|abro|abres|abre|abrimos|abren|abrió|cerrar|cierro|cierras|cierra|cerramos|cierran|cerró)$/.test(p))
        return { categoria: 'Verbo', subcategoria: 'Conjugado', esError: false };

    // Adverbios
    if (/^(muy|bien|también|ya|ahora|entonces|aquí|allí|allá|siempre|nunca|jamás|frecuentemente|raramente|todavía|aún|pronto|enseguida|antes|después|demasiado|bastante|poco|mucho|más|menos|casi|solo|solamente|únicamente|realmente|verdaderamente|rápido|rápidamente|lento|lentamente|temprano|tarde|lejos|cerca|quizás|quizá|acaso|sí|claro|efectivamente|ciertamente|no|tampoco|ayer|hoy|mañana|anoche)$/.test(p))
        return { categoria: 'Adverbio', subcategoria: detectarSubtipoAdverbioES(p), esError: false };

    // Preposiciones
    if (/^(a|ante|bajo|con|contra|de|desde|durante|en|entre|hacia|hasta|mediante|para|por|según|sin|sobre|tras|versus|vía|excepto|salvo|incluso|encima|debajo|delante|detrás|dentro|fuera|cerca|lejos|junto|alrededor)$/.test(p))
        return { categoria: 'Preposicion', subcategoria: '—', esError: false };

    // Conjunciones coordinantes
    if (/^(y|e|ni|pero|mas|sino|o|u|bien|sea)$/.test(p))
        return { categoria: 'Conjuncion', subcategoria: 'Coordinante', esError: false };

    // Conjunciones subordinantes
    if (/^(que|porque|pues|si|aunque|como|cuando|mientras|donde|adonde|según|conforme|para|tan|tanto|después|antes)$/.test(p))
        return { categoria: 'Conjuncion', subcategoria: 'Subordinante', esError: false };

    // Adjetivos
    if (/^(bueno|buena|buenos|buenas|malo|mala|malos|malas|grande|grandes|pequeño|pequeña|pequeños|pequeñas|nuevo|nueva|nuevos|nuevas|viejo|vieja|viejos|viejas|joven|jóvenes|largo|larga|largos|largas|corto|corta|cortos|cortas|alto|alta|altos|altas|bajo|baja|bajos|bajas|bonito|bonita|bonitos|bonitas|feo|fea|feos|feas|rápido|rápida|rápidos|rápidas|lento|lenta|lentos|lentas|caliente|frío|fría|frías|fríos|cálido|cálida|fresco|fresca|blanco|blanca|negro|negra|rojo|roja|azul|azules|verde|verdes|amarillo|amarilla|anaranjado|morado|café|gris|feliz|triste|fuerte|débil|rico|pobre|limpio|sucio|lleno|vacío|importante|diferente|posible|especial|común|simple|primero|primera|segundo|segunda|tercero|tercera|último|última|siguiente|otro|misma|mismo|verdadero|falso|real|libre|abierto|cerrado)$/.test(p))
        return { categoria: 'Adjetivo', subcategoria: 'Calificativo', esError: false };

    // Sustantivos
    if (/^(gato|perro|casa|carro|coche|libro|hombre|mujer|niño|niña|bebé|chico|chica|día|año|tiempo|camino|vida|mundo|escuela|trabajo|agua|comida|ciudad|país|familia|amigo|amiga|mano|ojo|cara|cabeza|puerta|mesa|silla|cuarto|habitación|árbol|flor|pájaro|sol|luna|estrella|cielo|calle|nombre|palabra|oración|idioma|lengua|mañana|tarde|noche|semana|mes|dinero|precio|tienda|mercado|corazón|mente|cuerpo|voz|sonido|luz|color|letra|número|historia|noticia|pregunta|respuesta|problema|idea|rey|reina|maestro|maestra|estudiante|doctor|madre|padre|hijo|hija|hermano|hermana|gente|persona|lugar|cosa|parte|aire|fuego|tierra|suelo|río|mar|océano|jardín|parque|edificio|ventana|pared|piso|computadora|teléfono|papel|pluma|lápiz|música|arte|juego|deporte|equipo|pez|caballo|vaca|oveja|cerdo|león|tigre|oso|manzana|pan|leche|arroz|huevo|carne|fruta|verdura)$/.test(p))
        return { categoria: 'Sustantivo', subcategoria: 'Común', esError: false };

    // Interjecciones
    if (/^(oh|ay|eh|ah|oye|hola|adiós|sí|no|ok|uy|vaya|caramba|bravo|hurra|ojalá)$/.test(p))
        return { categoria: 'Interjeccion', subcategoria: '—', esError: false };

    return { categoria: 'Desconocido', subcategoria: '—', esError: true };
}

// Detecta el subtipo del adverbio en español
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