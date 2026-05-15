package org.example.lexico.diccionario;
import org.example.lexico.Token;

//Metodos para clasificar palabras en español
public class Diccionarioespanol {
    public boolean esArticulo(String p) {
        return p.matches("el|la|los|las|un|una|unos|unas|lo");
    }

    public boolean esPosesivo(String p) {
        return p.matches("mi|mis|tu|tus|su|sus|" +
                "nuestro|nuestra|nuestros|nuestras|" +
                "vuestro|vuestra|vuestros|vuestras|" +
                "mío|mía|míos|mías|tuyo|tuya|tuyos|tuyas|" +
                "suyo|suya|suyos|suyas");
    }

    public boolean esDemostrativo(String p) {
        return p.matches("este|esta|estos|estas|" +
                "ese|esa|esos|esas|" +
                "aquel|aquella|aquellos|aquellas|" +
                "esto|eso|aquello");
    }

    public boolean esPronombre(String p) {
        return p.matches("yo|tú|él|ella|nosotros|nosotras|" +
                "vosotros|vosotras|ellos|ellas|" +
                "me|te|se|nos|os|le|lo|la|les|" +
                "quien|quienes|que|cual|cuales|" +
                "alguien|nadie|algo|nada|" +
                "mismo|misma|mismos|mismas");
    }

    public boolean esVerbo(String p) {
        return p.matches("es|son|era|eran|fue|fueron|ser|sido|siendo|" +
                "estar|estoy|estás|está|estamos|estáis|están|estuvo|estuvieron|" +
                "haber|he|has|ha|hemos|habéis|han|hubo|" +
                "tener|tengo|tienes|tiene|tenemos|tienen|tuvo|tuvieron|" +
                "ir|voy|vas|va|vamos|van|" +
                "hacer|hago|haces|hace|hacemos|hacen|hizo|hicieron|" +
                "poder|puedo|puedes|puede|podemos|pueden|pudo|pudieron|" +
                "querer|quiero|quieres|quiere|queremos|quieren|quiso|quisieron|" +
                "saber|sé|sabes|sabe|sabemos|saben|supo|supieron|" +
                "ver|veo|ves|ve|vemos|ven|vio|vieron|" +
                "dar|doy|das|da|damos|dan|dio|dieron|" +
                "decir|digo|dices|dice|decimos|dicen|dijo|dijeron|" +
                "hablar|hablo|hablas|habla|hablamos|hablan|habló|hablaron|" +
                "comer|como|comes|come|comemos|comen|comió|comieron|" +
                "vivir|vivo|vives|vive|vivimos|viven|vivió|vivieron|" +
                "trabajar|trabajo|trabajas|trabaja|trabajamos|trabajan|trabajó|" +
                "estudiar|estudio|estudias|estudia|estudiamos|estudian|estudió|" +
                "correr|corro|corres|corre|corremos|corren|corrió|" +
                "leer|leo|lees|lee|leemos|leen|leyó|leyeron|" +
                "escribir|escribo|escribes|escribe|escribimos|escriben|escribió|" +
                "escuchar|escucho|escuchas|escucha|escuchamos|escuchan|escuchó|" +
                "ayudar|ayudo|ayudas|ayuda|ayudamos|ayudan|ayudó|" +
                "necesitar|necesito|necesitas|necesita|necesitamos|necesitan|" +
                "amar|amo|amas|ama|amamos|aman|amó|amaron|" +
                "pensar|pienso|piensas|piensa|pensamos|piensan|pensó|" +
                "sentir|siento|sientes|siente|sentimos|sienten|sintió|" +
                "caminar|camino|caminas|camina|caminamos|caminan|caminó|" +
                "llevar|llevo|llevas|lleva|llevamos|llevan|llevó|" +
                "llamar|llamo|llamas|llama|llamamos|llaman|llamó|" +
                "comenzar|comienzo|comienzas|comienza|comenzamos|comienzan|comenzó|" +
                "terminar|termino|terminas|termina|terminamos|terminan|terminó|" +
                "abrir|abro|abres|abre|abrimos|abren|abrió|" +
                "cerrar|cierro|cierras|cierra|cerramos|cierran|cerró");
    }

    public boolean esAdverbio(String p) {
        return p.matches("muy|bien|también|ya|ahora|entonces|aquí|allí|allá|" +
                "siempre|nunca|jamás|frecuentemente|raramente|" +
                "todavía|aún|pronto|enseguida|antes|después|" +
                "demasiado|bastante|poco|mucho|más|menos|casi|" +
                "solo|solamente|únicamente|realmente|verdaderamente|" +
                "rápido|rápidamente|lento|lentamente|" +
                "temprano|tarde|lejos|cerca|" +
                "quizás|quizá|acaso|" +
                "sí|claro|efectivamente|ciertamente|" +
                "no|tampoco|" +
                "ayer|hoy|mañana|anoche");
    }

    public String detectarSubtipoAdverbio(String p) {
        if (p.matches("ahora|entonces|ya|todavía|aún|pronto|antes|después|ayer|hoy|mañana|anoche|tarde|temprano|enseguida"))
            return "Tiempo";
        if (p.matches("aquí|allí|allá|lejos|cerca|arriba|abajo|dentro|fuera|adelante|atrás"))
            return "Lugar";
        if (p.matches("muy|mucho|poco|demasiado|bastante|más|menos|casi|tanto|tan"))
            return "Cantidad";
        if (p.matches("bien|mal|rápido|lento|rápidamente|lentamente|así|solamente|únicamente|realmente|verdaderamente"))
            return "Modo";
        if (p.matches("sí|claro|efectivamente|ciertamente|también"))
            return "Afirmación";
        if (p.matches("no|nunca|jamás|tampoco"))
            return "Negación";
        if (p.matches("quizás|quizá|acaso|probablemente"))
            return "Duda";
        return "Modo";
    }

    //preposiciones
    public boolean esPreposicion(String p) {
        return p.matches("a|ante|bajo|con|contra|de|desde|durante|" +
                "en|entre|hacia|hasta|mediante|para|por|según|" +
                "sin|sobre|tras|versus|vía|" +
                "excepto|salvo|incluso|" +
                "encima|debajo|delante|detrás|dentro|fuera|" +
                "cerca|lejos|junto|alrededor");
    }

    //conjunciones coordinantes
    public boolean esConjuncionCoordinante(String p) {
        return p.matches("y|e|ni|pero|mas|sino|o|u|bien|sea");
    }

    //conjunciones subordinantes
    public boolean esConjuncionSubordinante(String p) {
        return p.matches("que|porque|pues|si|aunque|como|cuando|" +
                "mientras|donde|adonde|según|conforme|" +
                "para|tan|tanto|después|antes");
    }

    //conjunciones calificativos
    public boolean esAdjetivo(String p) {
        return p.matches("bueno|buena|buenos|buenas|malo|mala|malos|malas|" +
                "grande|grandes|pequeño|pequeña|pequeños|pequeñas|" +
                "nuevo|nueva|nuevos|nuevas|viejo|vieja|viejos|viejas|" +
                "joven|jóvenes|largo|larga|largos|largas|" +
                "corto|corta|cortos|cortas|" +
                "alto|alta|altos|altas|bajo|baja|bajos|bajas|" +
                "bonito|bonita|bonitos|bonitas|feo|fea|feos|feas|" +
                "rápido|rápida|rápidos|rápidas|lento|lenta|lentos|lentas|" +
                "caliente|frío|fría|frías|fríos|cálido|cálida|fresco|fresca|" +
                "blanco|blanca|negro|negra|rojo|roja|azul|azules|" +
                "verde|verdes|amarillo|amarilla|anaranjado|morado|café|gris|" +
                "feliz|triste|fuerte|débil|rico|pobre|" +
                "limpio|sucio|lleno|vacío|" +
                "importante|diferente|posible|especial|común|simple|" +
                "primero|primera|segundo|segunda|tercero|tercera|" +
                "último|última|siguiente|otro|misma|mismo|" +
                "verdadero|falso|real|libre|abierto|cerrado");
    }

    // ── Sustantivos comunes ──
    public boolean esSustantivo(String p) {
        return p.matches("gato|perro|casa|carro|coche|libro|" +
                "hombre|mujer|niño|niña|bebé|chico|chica|" +
                "día|año|tiempo|camino|vida|mundo|" +
                "escuela|trabajo|agua|comida|ciudad|país|" +
                "familia|amigo|amiga|mano|ojo|cara|cabeza|" +
                "puerta|mesa|silla|cuarto|habitación|árbol|flor|" +
                "pájaro|sol|luna|estrella|cielo|calle|" +
                "nombre|palabra|oración|idioma|lengua|" +
                "mañana|tarde|noche|semana|mes|" +
                "dinero|precio|tienda|mercado|" +
                "corazón|mente|cuerpo|voz|sonido|luz|" +
                "color|letra|número|historia|noticia|" +
                "pregunta|respuesta|problema|idea|" +
                "rey|reina|maestro|maestra|estudiante|doctor|" +
                "madre|padre|hijo|hija|hermano|hermana|" +
                "gente|persona|lugar|cosa|parte|" +
                "aire|fuego|tierra|suelo|río|mar|océano|" +
                "jardín|parque|edificio|ventana|pared|piso|" +
                "computadora|teléfono|papel|pluma|lápiz|" +
                "música|arte|juego|deporte|equipo|" +
                "pez|caballo|vaca|oveja|cerdo|león|tigre|oso|" +
                "manzana|pan|leche|arroz|huevo|carne|fruta|verdura");
    }

    //Interjecciones
    public boolean esInterjeccion(String p) {
        return p.matches("oh|ay|eh|ah|oye|hola|adiós|sí|no|ok|" +
                "uy|vaya|caramba|bravo|hurra|ojalá");
    }

    //recibe una palabra y devuelve su categoría
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
        return null; // No reconocida
    }

    // Devuelve la subcategoría según la categoría detectada
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

