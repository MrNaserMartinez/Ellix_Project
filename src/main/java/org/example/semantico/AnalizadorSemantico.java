package org.example.semantico;
/*
Verifica que los tokens tengan coherencia semántica.
Solo se ejecuta si el análisis sintáctico fue exitoso (Confío en mi mismo).
*/
import org.example.lexico.Token;
import java.util.ArrayList;
import java.util.List;

public class AnalizadorSemantico {

    private List<ErrorSemantico> errores;

    public AnalizadorSemantico() {
        this.errores = new ArrayList<>();
    }

    public void analizar(List<Token> tokens, String direccion) {
        errores.clear();

        for (int i = 0; i < tokens.size(); i++) {
            Token actual = tokens.get(i);

            // Verifica concordancia entre determinante y sustantivo
            if (esDeterminante(actual) && i + 1 < tokens.size()) {
                Token siguiente = tokens.get(i + 1);

                // Si el siguiente es adjetivo, busca el sustantivo después
                if (siguiente.getCategoria() == Token.Categoria.ADJETIVO && i + 2 < tokens.size()) {
                    siguiente = tokens.get(i + 2);
                }

                if (siguiente.getCategoria() == Token.Categoria.SUSTANTIVO) {
                    if (direccion.equals("es-en")) {
                        verificarConcordanciaEspanol(actual, siguiente);
                    }
                }
            }

            // Verifica que el verbo esté conjugado correctamente
            if (actual.getCategoria() == Token.Categoria.VERBO) {
                verificarVerbo(actual, tokens, i, direccion);
            }
        }
    }

    private void verificarConcordanciaEspanol(Token determinante, Token sustantivo) {
        String det  = determinante.getLexema().toLowerCase();
        String sust = sustantivo.getLexema().toLowerCase();

        boolean detMasculino = esMasculinoES(det);
        boolean detFemenino  = esFemeninoES(det);
        boolean detPlural    = esPluralES(det);

        boolean sustMasculino = esSustantivoMasculinoES(sust);
        boolean sustFemenino  = esSustantivoFemeninoES(sust);
        boolean sustPlural    = esSustantivoPluralES(sust);

        // Verifica género
        if (detMasculino && sustFemenino) {
            registrarError(
                    "Concordancia de género incorrecta: \"" + det + "\" (masculino) con \"" + sust + "\" (femenino)",
                    determinante
            );
        } else if (detFemenino && sustMasculino) {
            registrarError(
                    "Concordancia de género incorrecta: \"" + det + "\" (femenino) con \"" + sust + "\" (masculino)",
                    determinante
            );
        }

        // Verifica número
        if (detPlural && !sustPlural) {
            registrarError(
                    "Concordancia de número incorrecta: \"" + det + "\" (plural) con \"" + sust + "\" (singular)",
                    determinante
            );
        } else if (!detPlural && sustPlural && (detMasculino || detFemenino)) {
            registrarError(
                    "Concordancia de número incorrecta: \"" + det + "\" (singular) con \"" + sust + "\" (plural)",
                    determinante
            );
        }
    }

    // Verifica que el verbo tenga un sujeto compatible
    private void verificarVerbo(Token verbo, List<Token> tokens, int pos, String direccion) {
        Token sujeto = buscarSujeto(tokens, pos);
        if (sujeto == null) return;

        String lex    = sujeto.getLexema().toLowerCase();
        String verboL = verbo.getLexema().toLowerCase();

        if (direccion.equals("en-es")) {
            verificarConcordanciaVerboEN(lex, verboL, verbo);
        } else {
            verificarConcordanciaVerboES(lex, verboL, verbo);
        }
    }

    // Concordancia sujeto-verbo en inglés
    private void verificarConcordanciaVerboEN(String sujeto, String verbo, Token tokenVerbo) {

        // Tercera persona singular → debe usar "is", "has", "does" o verbo con -s
        boolean es3raSingular = sujeto.matches("he|she|it");
        boolean esPlural      = sujeto.matches("they|we|you");
        boolean es1raSingular = sujeto.equals("i");

        if (es3raSingular && verbo.matches("are|were|have|do")) {
            registrarError(
                    "Concordancia incorrecta: \"" + sujeto + "\" debe usar forma singular del verbo, no \"" + verbo + "\"",
                    tokenVerbo
            );
        }

        if (es1raSingular && verbo.matches("is|are|was|were")) {
            if (verbo.matches("is|are|were")) {
                registrarError(
                        "Concordancia incorrecta: \"I\" debe usar \"am\" o \"was\", no \"" + verbo + "\"",
                        tokenVerbo
                );
            }
        }

        if (esPlural && verbo.matches("is|was|has|does")) {
            registrarError(
                    "Concordancia incorrecta: \"" + sujeto + "\" (plural) no debe usar \"" + verbo + "\" (singular)",
                    tokenVerbo
            );
        }
    }

    // Concordancia sujeto-verbo en español
    private void verificarConcordanciaVerboES(String sujeto, String verbo, Token tokenVerbo) {

        boolean es1raSingular = sujeto.equals("yo");
        boolean es3raSingular = sujeto.matches("él|ella");
        boolean esPlural      = sujeto.matches("ellos|ellas|nosotros|nosotras");

        if (es1raSingular && verbo.matches("es|son|era|eran|fue|fueron")) {
            registrarError(
                    "Concordancia incorrecta: \"yo\" no debe usar \"" + verbo + "\"",
                    tokenVerbo
            );
        }

        if (es3raSingular && verbo.matches("son|somos|estamos|están|fueron")) {
            registrarError(
                    "Concordancia incorrecta: \"" + sujeto + "\" (singular) no debe usar \"" + verbo + "\" (plural)",
                    tokenVerbo
            );
        }

        if (esPlural && verbo.matches("es|fue|está|tiene")) {
            registrarError(
                    "Concordancia incorrecta: \"" + sujeto + "\" (plural) no debe usar \"" + verbo + "\" (singular)",
                    tokenVerbo
            );
        }
    }

    // Busca el sujeto más cercano antes del verbo
    private Token buscarSujeto(List<Token> tokens, int posVerbo) {
        for (int i = posVerbo - 1; i >= 0; i--) {
            Token t = tokens.get(i);
            if (t.getCategoria() == Token.Categoria.PRONOMBRE  ||
                    t.getCategoria() == Token.Categoria.SUSTANTIVO) {
                return t;
            }
            if (t.getCategoria() == Token.Categoria.PUNTUACION) break;
        }
        return null;
    }

    // ── Métodos de clasificación para español ──
    private boolean esMasculinoES(String det) {
        return det.matches("el|un|este|ese|aquel|mi|tu|su|nuestro|vuestro");
    }

    private boolean esFemeninoES(String det) {
        return det.matches("la|una|esta|esa|aquella|mi|tu|su|nuestra|vuestra");
    }

    private boolean esPluralES(String det) {
        return det.matches("los|las|unos|unas|estos|estas|esos|esas|aquellos|aquellas|mis|tus|sus|nuestros|nuestras");
    }

    private boolean esSustantivoMasculinoES(String sust) {
        return sust.matches("gato|perro|libro|hombre|niño|día|año|trabajo|sol|río|" +
                "jardín|parque|edificio|carro|coche|pan|arroz|huevo|piso|" +
                "corazón|mente|color|número|problema|idioma|equipo|deporte");
    }

    private boolean esSustantivoFemeninoES(String sust) {
        return sust.matches("casa|mujer|niña|vida|escuela|ciudad|familia|mano|flor|" +
                "luna|estrella|calle|palabra|oración|lengua|noche|semana|" +
                "tienda|voz|historia|noticia|pregunta|respuesta|música|fruta|verdura");
    }

    private boolean esSustantivoPluralES(String sust) {
        return sust.endsWith("s") || sust.endsWith("es");
    }

    private boolean esDeterminante(Token t) {
        return t.getCategoria() == Token.Categoria.ARTICULO     ||
                t.getCategoria() == Token.Categoria.POSESIVO     ||
                t.getCategoria() == Token.Categoria.DEMOSTRATIVO ||
                t.getCategoria() == Token.Categoria.NUMERAL;
    }

    private void registrarError(String descripcion, Token token) {
        errores.add(new ErrorSemantico(
                token.getLexema(),
                token.getLinea(),
                token.getColumna(),
                descripcion
        ));
    }

    public List<ErrorSemantico> getErrores() { return errores; }
    public boolean esExitoso()               { return errores.isEmpty(); }
}