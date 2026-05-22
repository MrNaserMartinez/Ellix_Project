package org.example.lexico.diccionario;

import org.example.lexico.Token;

public class Diccionarioespanol {

    // ── Artículos ──
    public boolean esArticulo(String p) {
        return p.matches("el|la|los|las|un|una|unos|unas|lo");
    }

    // ── Posesivos ──
    public boolean esPosesivo(String p) {
        return p.matches(
                "mi|mis|tu|tus|su|sus|" +
                        "nuestro|nuestra|nuestros|nuestras|" +
                        "vuestro|vuestra|vuestros|vuestras|" +
                        "mío|mía|míos|mías|tuyo|tuya|tuyos|tuyas|" +
                        "suyo|suya|suyos|suyas"
        );
    }

    // ── Demostrativos ──
    public boolean esDemostrativo(String p) {
        return p.matches(
                "este|esta|estos|estas|ese|esa|esos|esas|" +
                        "aquel|aquella|aquellos|aquellas|esto|eso|aquello"
        );
    }

    // ── Pronombres ──
    public boolean esPronombre(String p) {
        return p.matches(
                "yo|tú|él|ella|nosotros|nosotras|vosotros|vosotras|ellos|ellas|" +
                        "me|te|se|nos|os|le|lo|la|les|" +
                        "quien|quienes|que|cual|cuales|" +
                        "alguien|nadie|algo|nada|" +
                        "mismo|misma|mismos|mismas|" +
                        "mí|ti|sí|conmigo|contigo|consigo"
        );
    }

    // ── Verbos: ser/estar/tener + regulares e irregulares conjugados ──
    public boolean esVerbo(String p) {
        return p.matches(
                // Ser / Estar / Haber / Tener
                "es|son|era|eran|fue|fueron|ser|sido|siendo|" +
                        "estar|estoy|estás|está|estamos|estáis|están|estuvo|estuvieron|" +
                        "haber|he|has|ha|hemos|habéis|han|hubo|había|habían|" +
                        "tener|tengo|tienes|tiene|tenemos|tenéis|tienen|tuvo|tuvieron|tenía|" +
                        // Ir / Venir
                        "ir|voy|vas|va|vamos|vais|van|fui|fuiste|" +
                        "venir|vengo|vienes|viene|venimos|venís|vienen|vino|vinieron|" +
                        // Hacer / Poder / Querer / Saber
                        "hacer|hago|haces|hace|hacemos|hacéis|hacen|hizo|hicieron|hacía|" +
                        "poder|puedo|puedes|puede|podemos|podéis|pueden|pudo|pudieron|" +
                        "querer|quiero|quieres|quiere|queremos|queréis|quieren|quiso|quisieron|" +
                        "saber|sé|sabes|sabe|sabemos|sabéis|saben|supo|supieron|" +
                        // Ver / Dar / Decir
                        "ver|veo|ves|ve|vemos|veis|ven|vio|vieron|veía|" +
                        "dar|doy|das|da|damos|dais|dan|dio|dieron|" +
                        "decir|digo|dices|dice|decimos|decís|dicen|dijo|dijeron|" +
                        // Verbos de movimiento
                        "caminar|camino|caminas|camina|caminamos|caminan|caminó|" +
                        "correr|corro|corres|corre|corremos|corren|corrió|" +
                        "saltar|salto|saltas|salta|saltamos|saltan|saltó|" +
                        "volar|vuelo|vuelas|vuela|volamos|vuelan|voló|" +
                        "nadar|nado|nadas|nada|nadamos|nadan|nadó|" +
                        "subir|subo|subes|sube|subimos|suben|subió|" +
                        "bajar|bajo|bajas|baja|bajamos|bajan|bajó|" +
                        "entrar|entro|entras|entra|entramos|entran|entró|" +
                        "salir|salgo|sales|sale|salimos|salen|salió|" +
                        "llegar|llego|llegas|llega|llegamos|llegan|llegó|" +
                        "partir|parto|partes|parte|partimos|parten|partió|" +
                        "regresar|regreso|regresas|regresa|regresamos|regresan|regresó|" +
                        "viajar|viajo|viajas|viaja|viajamos|viajan|viajó|" +
                        "conducir|conduzco|conduces|conduce|conducimos|conducen|condujo|" +
                        "llevar|llevo|llevas|lleva|llevamos|llevan|llevó|" +
                        // Verbos de comunicación
                        "hablar|hablo|hablas|habla|hablamos|hablan|habló|hablaron|" +
                        "escuchar|escucho|escuchas|escucha|escuchamos|escuchan|escuchó|" +
                        "leer|leo|lees|lee|leemos|leen|leyó|leyeron|" +
                        "escribir|escribo|escribes|escribe|escribimos|escriben|escribió|" +
                        "llamar|llamo|llamas|llama|llamamos|llaman|llamó|" +
                        "preguntar|pregunto|preguntas|pregunta|preguntamos|preguntan|preguntó|" +
                        "responder|respondo|respondes|responde|respondemos|responden|respondió|" +
                        "explicar|explico|explicas|explica|explicamos|explican|explicó|" +
                        "contar|cuento|cuentas|cuenta|contamos|cuentan|contó|" +
                        "describir|describo|describes|describe|describimos|describen|describió|" +
                        "discutir|discuto|discutes|discute|discutimos|discuten|discutió|" +
                        "prometer|prometo|prometes|promete|prometemos|prometen|prometió|" +
                        // Verbos cognitivos
                        "pensar|pienso|piensas|piensa|pensamos|piensan|pensó|" +
                        "creer|creo|crees|cree|creemos|creen|creyó|" +
                        "entender|entiendo|entiendes|entiende|entendemos|entienden|entendió|" +
                        "recordar|recuerdo|recuerdas|recuerda|recordamos|recuerdan|recordó|" +
                        "olvidar|olvido|olvidas|olvida|olvidamos|olvidan|olvidó|" +
                        "estudiar|estudio|estudias|estudia|estudiamos|estudian|estudió|" +
                        "aprender|aprendo|aprendes|aprende|aprendemos|aprenden|aprendió|" +
                        "decidir|decido|decides|decide|decidimos|deciden|decidió|" +
                        "elegir|elijo|eliges|elige|elegimos|eligen|eligió|" +
                        "imaginar|imagino|imaginas|imagina|imaginamos|imaginan|imaginó|" +
                        // Verbos de emoción
                        "amar|amo|amas|ama|amamos|aman|amó|amaron|" +
                        "odiar|odio|odias|odia|odiamos|odian|odió|" +
                        "querer|quiero|quieres|quiere|queremos|quieren|" +
                        "sentir|siento|sientes|siente|sentimos|sienten|sintió|" +
                        "disfrutar|disfruto|disfrutas|disfruta|disfrutamos|disfrutan|disfrutó|" +
                        "preferir|prefiero|prefieres|prefiere|preferimos|prefieren|prefirió|" +
                        "esperar|espero|esperas|espera|esperamos|esperan|esperó|" +
                        "temer|temo|temes|teme|tememos|temen|temió|" +
                        "reír|río|ríes|ríe|reímos|ríen|rió|" +
                        "llorar|lloro|lloras|llora|lloramos|lloran|lloró|" +
                        "sonreír|sonrío|sonríes|sonríe|sonreímos|sonríen|sonrió|" +
                        // Acciones físicas
                        "comer|como|comes|come|comemos|comen|comió|comieron|" +
                        "beber|bebo|bebes|bebe|bebemos|beben|bebió|" +
                        "dormir|duermo|duermes|duerme|dormimos|duermen|durmió|" +
                        "despertar|despierto|despiertas|despierta|despertamos|despiertan|despertó|" +
                        "trabajar|trabajo|trabajas|trabaja|trabajamos|trabajan|trabajó|" +
                        "jugar|juego|juegas|juega|jugamos|juegan|jugó|" +
                        "cocinar|cocino|cocinas|cocina|cocinamos|cocinan|cocinó|" +
                        "limpiar|limpio|limpias|limpia|limpiamos|limpian|limpió|" +
                        "comprar|compro|compras|compra|compramos|compran|compró|" +
                        "vender|vendo|vendes|vende|vendemos|venden|vendió|" +
                        "abrir|abro|abres|abre|abrimos|abren|abrió|" +
                        "cerrar|cierro|cierras|cierra|cerramos|cierran|cerró|" +
                        "empezar|empiezo|empiezas|empieza|empezamos|empiezan|empezó|" +
                        "terminar|termino|terminas|termina|terminamos|terminan|terminó|" +
                        "comenzar|comienzo|comienzas|comienza|comenzamos|comienzan|comenzó|" +
                        "ayudar|ayudo|ayudas|ayuda|ayudamos|ayudan|ayudó|" +
                        "necesitar|necesito|necesitas|necesita|necesitamos|necesitan|" +
                        "usar|uso|usas|usa|usamos|usan|usó|" +
                        "crear|creo|creas|crea|creamos|crean|creó|" +
                        "construir|construyo|construyes|construye|construimos|construyen|construyó|" +
                        "romper|rompo|rompes|rompe|rompemos|rompen|rompió|" +
                        "arreglar|arreglo|arreglas|arregla|arreglamos|arreglan|arregló|" +
                        "dibujar|dibujo|dibujas|dibuja|dibujamos|dibujan|dibujó|" +
                        "pintar|pinto|pintas|pinta|pintamos|pintan|pintó|" +
                        "cantar|canto|cantas|canta|cantamos|cantan|cantó|" +
                        "bailar|bailo|bailas|baila|bailamos|bailan|bailó|" +
                        "ganar|gano|ganas|gana|ganamos|ganan|ganó|" +
                        "perder|pierdo|pierdes|pierde|perdemos|pierden|perdió|" +
                        "guardar|guardo|guardas|guarda|guardamos|guardan|guardó|" +
                        "compartir|comparto|compartes|comparte|compartimos|comparten|compartió|" +
                        "vivir|vivo|vives|vive|vivimos|viven|vivió|vivieron"
        );
    }

    // ── Adverbios ──
    public boolean esAdverbio(String p) {
        return p.matches(
                // Tiempo
                "ahora|entonces|ya|todavía|aún|pronto|enseguida|antes|después|" +
                        "ayer|hoy|mañana|anoche|tarde|temprano|siempre|nunca|jamás|" +
                        "frecuentemente|raramente|a veces|últimamente|recientemente|" +
                        "inmediatamente|finalmente|eventualmente|súbitamente|" +
                        // Lugar
                        "aquí|allí|allá|lejos|cerca|arriba|abajo|dentro|fuera|" +
                        "adelante|atrás|afuera|adentro|alrededor|encima|debajo|" +
                        "enfrente|detrás|a lado|en frente|" +
                        // Cantidad
                        "muy|mucho|poco|demasiado|bastante|más|menos|casi|tanto|tan|" +
                        "completamente|totalmente|absolutamente|apenas|aproximadamente|" +
                        "exactamente|simplemente|solamente|únicamente|" +
                        // Modo
                        "bien|mal|rápido|lento|rápidamente|lentamente|" +
                        "cuidadosamente|fácilmente|difícilmente|claramente|" +
                        "tranquilamente|fuertemente|suavemente|amablemente|" +
                        "realmente|verdaderamente|generalmente|probablemente|" +
                        // Afirmación
                        "sí|claro|efectivamente|ciertamente|también|por supuesto|" +
                        "exacto|correcto|seguro|" +
                        // Negación
                        "no|nunca|jamás|tampoco|" +
                        // Duda
                        "quizás|quizá|acaso|probablemente|posiblemente|tal vez"
        );
    }

    public String detectarSubtipoAdverbio(String p) {
        if (p.matches("ahora|entonces|ya|todavía|aún|pronto|enseguida|antes|después|" +
                "ayer|hoy|mañana|anoche|tarde|temprano|siempre|nunca|jamás|" +
                "frecuentemente|raramente|últimamente|recientemente|inmediatamente|" +
                "finalmente|eventualmente|súbitamente"))
            return "Tiempo";
        if (p.matches("aquí|allí|allá|lejos|cerca|arriba|abajo|dentro|fuera|" +
                "adelante|atrás|afuera|adentro|alrededor|encima|debajo|enfrente"))
            return "Lugar";
        if (p.matches("muy|mucho|poco|demasiado|bastante|más|menos|casi|tanto|tan|" +
                "completamente|totalmente|absolutamente|apenas|aproximadamente|" +
                "exactamente|simplemente|solamente|únicamente"))
            return "Cantidad";
        if (p.matches("bien|mal|rápido|lento|rápidamente|lentamente|cuidadosamente|" +
                "fácilmente|difícilmente|claramente|tranquilamente|fuertemente|" +
                "suavemente|amablemente|realmente|verdaderamente|generalmente|probablemente"))
            return "Modo";
        if (p.matches("sí|claro|efectivamente|ciertamente|también|por supuesto|exacto|correcto|seguro"))
            return "Afirmación";
        if (p.matches("no|nunca|jamás|tampoco"))     return "Negación";
        if (p.matches("quizás|quizá|acaso|probablemente|posiblemente|tal vez")) return "Duda";
        return "Modo";
    }

    // ── Preposiciones ──
    public boolean esPreposicion(String p) {
        return p.matches(
                "a|ante|bajo|con|contra|de|desde|durante|en|entre|hacia|hasta|" +
                        "mediante|para|por|según|sin|sobre|tras|versus|vía|" +
                        "excepto|salvo|incluso|encima|debajo|delante|detrás|" +
                        "dentro|fuera|cerca|lejos|junto|alrededor|" +
                        "respecto|acerca|además|aparte|frente|través"
        );
    }

    // ── Conjunciones coordinantes ──
    public boolean esConjuncionCoordinante(String p) {
        return p.matches("y|e|ni|pero|mas|sino|o|u|bien|sea");
    }

    // ── Conjunciones subordinantes ──
    public boolean esConjuncionSubordinante(String p) {
        return p.matches(
                "que|porque|pues|ya que|dado que|puesto que|" +
                        "si|con tal de que|siempre que|a menos que|" +
                        "aunque|a pesar de que|por más que|" +
                        "como|según|conforme|" +
                        "para que|a fin de que|" +
                        "tan|tanto|así que|de modo que|" +
                        "cuando|mientras|antes de que|después de que|" +
                        "donde|adonde|hasta que|desde que"
        );
    }

    // ── Adjetivos ──
    public boolean esAdjetivo(String p) {
        return p.matches(
                // Tamaño
                "grande|grandes|pequeño|pequeña|pequeños|pequeñas|" +
                        "largo|larga|largos|largas|corto|corta|cortos|cortas|" +
                        "alto|alta|altos|altas|bajo|baja|bajos|bajas|" +
                        "grueso|gruesa|delgado|delgada|ancho|ancha|estrecho|estrecha|" +
                        // Calidad
                        "bueno|buena|buenos|buenas|malo|mala|malos|malas|" +
                        "excelente|terrible|maravilloso|maravillosa|horrible|" +
                        "bonito|bonita|bonitos|bonitas|feo|fea|feos|feas|" +
                        "hermoso|hermosa|hermosos|hermosas|lindo|linda|" +
                        "limpio|limpia|limpios|limpias|sucio|sucia|sucios|sucias|" +
                        // Edad
                        "nuevo|nueva|nuevos|nuevas|viejo|vieja|viejos|viejas|" +
                        "joven|jóvenes|antiguo|antigua|moderno|moderna|reciente|" +
                        // Color
                        "blanco|blanca|negro|negra|rojo|roja|azul|azules|" +
                        "verde|verdes|amarillo|amarilla|anaranjado|anaranjada|" +
                        "morado|morada|café|gris|rosado|rosada|dorado|plateado|" +
                        // Temperatura
                        "caliente|frío|fría|fríos|frías|cálido|cálida|fresco|fresca|" +
                        // Emoción y carácter
                        "feliz|triste|enojado|enojada|asustado|asustada|" +
                        "emocionado|emocionada|aburrido|aburrida|cansado|cansada|" +
                        "nervioso|nerviosa|tranquilo|tranquila|orgulloso|orgullosa|" +
                        "amable|cruel|valiente|cobarde|honesto|honesta|" +
                        "inteligente|tonto|tonta|sabio|sabia|gracioso|graciosa|" +
                        "generoso|generosa|egoísta|educado|educada|tímido|tímida|" +
                        // Estado
                        "lleno|llena|vacío|vacía|abierto|abierta|cerrado|cerrada|" +
                        "ocupado|ocupada|libre|enfermo|enferma|sano|sana|" +
                        "vivo|viva|muerto|muerta|perdido|perdida|roto|rota|" +
                        // Otros
                        "duro|dura|suave|fácil|difícil|posible|imposible|" +
                        "importante|necesario|necesaria|especial|común|extraño|extraña|" +
                        "normal|usual|inusual|verdadero|verdadera|falso|falsa|" +
                        "real|libre|rico|rica|pobre|fuerte|débil|" +
                        "rápido|rápida|rápidos|rápidas|lento|lenta|lentos|lentas|" +
                        "primero|primera|segundo|segunda|tercero|tercera|" +
                        "último|última|siguiente|otro|otra|mismo|misma"
        );
    }

    // ── Sustantivos ──
    public boolean esSustantivo(String p) {
        return p.matches(
                // Animales
                "gato|perro|pájaro|pez|caballo|vaca|oveja|cerdo|" +
                        "león|tigre|oso|lobo|zorro|conejo|ciervo|" +
                        "elefante|mono|serpiente|tortuga|rana|mariposa|" +
                        "águila|búho|loro|pingüino|delfín|ballena|tiburón|" +
                        // Personas y roles
                        "hombre|mujer|niño|niña|bebé|persona|gente|" +
                        "maestro|maestra|estudiante|doctor|doctora|enfermero|enfermera|" +
                        "ingeniero|ingeniera|abogado|abogada|" +
                        "rey|reina|príncipe|princesa|presidente|presidenta|" +
                        "madre|padre|hijo|hija|hermano|hermana|" +
                        "amigo|amiga|enemigo|enemiga|vecino|vecina|héroe|heroína|" +
                        "artista|músico|músico|escritor|escritora|actor|actriz|" +
                        "atleta|soldado|policía|bombero|" +
                        "chico|chica|joven|anciano|anciana|" +
                        // Lugares
                        "casa|hogar|escuela|hospital|iglesia|tienda|mercado|" +
                        "ciudad|pueblo|aldea|país|mundo|" +
                        "calle|camino|puente|parque|jardín|bosque|" +
                        "montaña|río|mar|océano|lago|playa|isla|" +
                        "cuarto|habitación|cocina|baño|oficina|biblioteca|" +
                        "restaurante|hotel|aeropuerto|estación|" +
                        "edificio|ventana|pared|piso|puerta|techo|" +
                        // Objetos
                        "libro|pluma|lápiz|papel|mesa|silla|" +
                        "teléfono|computadora|televisión|cámara|radio|" +
                        "carro|coche|autobús|tren|avión|barco|bicicleta|" +
                        "bolsa|caja|botella|vaso|plato|cuchara|cuchillo|tenedor|" +
                        "cama|almohada|cobija|espejo|lámpara|reloj|" +
                        // Naturaleza
                        "sol|luna|estrella|cielo|nube|lluvia|nieve|viento|fuego|agua|aire|tierra|" +
                        "árbol|flor|hierba|hoja|semilla|fruta|verdura|" +
                        "manzana|naranja|plátano|uva|fresa|mango|" +
                        "pan|arroz|carne|huevo|leche|queso|mantequilla|azúcar|sal|" +
                        // Conceptos abstractos
                        "tiempo|día|noche|mañana|tarde|" +
                        "semana|mes|año|hora|minuto|segundo|" +
                        "vida|muerte|amor|odio|paz|guerra|verdad|mentira|" +
                        "idea|pensamiento|sueño|memoria|historia|noticia|" +
                        "palabra|oración|idioma|lengua|nombre|número|color|" +
                        "música|arte|juego|deporte|baile|canción|" +
                        "dinero|precio|trabajo|empleo|negocio|" +
                        "comida|salud|energía|poder|luz|sonido|" +
                        "problema|pregunta|respuesta|razón|resultado|" +
                        "camino|lugar|cosa|parte|grupo|equipo|" +
                        "corazón|mente|cuerpo|mano|ojo|cara|cabeza|" +
                        "voz|sonrisa|lágrima|respiración|" +
                        // Clima
                        "clima|temperatura|tormenta|trueno|relámpago"
        );
    }

    // ── Interjecciones ──
    public boolean esInterjeccion(String p) {
        return p.matches(
                "oh|ay|eh|ah|oye|hola|adiós|sí|no|ok|" +
                        "uy|vaya|caramba|bravo|hurra|ojalá|" +
                        "bien|claro|seguro|genial|fantástico|" +
                        "por favor|gracias|perdón|disculpa"
        );
    }

    // ── Método principal ──
    public Token.Categoria clasificar(String palabra) {
        if (esArticulo(palabra))               return Token.Categoria.ARTICULO;
        if (esPosesivo(palabra))               return Token.Categoria.POSESIVO;
        if (esDemostrativo(palabra))           return Token.Categoria.DEMOSTRATIVO;
        if (esPronombre(palabra))              return Token.Categoria.PRONOMBRE;
        if (esVerbo(palabra))                  return Token.Categoria.VERBO;
        if (esAdverbio(palabra))               return Token.Categoria.ADVERBIO;
        if (esPreposicion(palabra))            return Token.Categoria.PREPOSICION;
        if (esConjuncionCoordinante(palabra))  return Token.Categoria.CONJUNCION;
        if (esConjuncionSubordinante(palabra)) return Token.Categoria.CONJUNCION;
        if (esAdjetivo(palabra))               return Token.Categoria.ADJETIVO;
        if (esSustantivo(palabra))             return Token.Categoria.SUSTANTIVO;
        if (esInterjeccion(palabra))           return Token.Categoria.INTERJECCION;
        return null;
    }

    public String obtenerSubcategoria(String palabra, Token.Categoria categoria) {
        if (categoria == null) return "—";
        switch (categoria) {
            case ARTICULO:     return "Definido/Indefinido";
            case POSESIVO:     return "Posesivo";
            case DEMOSTRATIVO: return "Demostrativo";
            case PRONOMBRE:    return "Personal";
            case VERBO:        return "Conjugado";
            case ADVERBIO:     return detectarSubtipoAdverbio(palabra);
            case CONJUNCION:
                return esConjuncionCoordinante(palabra) ? "Coordinante" : "Subordinante";
            case ADJETIVO:     return "Calificativo";
            case SUSTANTIVO:   return "Común";
            default:           return "—";
        }
    }
}