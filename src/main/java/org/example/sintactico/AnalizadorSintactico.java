package org.example.sintactico;

//Valida que los tokens dell análisis léxico sigan el orden definido en las gramáticas BNF.
//Se ejecuta solo si el análisis léxico funciona (Confio en que funciona Blankita y que no lo haga cuando no deba).

import org.example.lexico.Token;
import java.util.ArrayList;
import java.util.List;

public class AnalizadorSintactico {

    private List<Token>         tokens;
    private List<ErrorSintactico> errores;
    private int                 posicion;

    public AnalizadorSintactico() {
        this.errores  = new ArrayList<>();
    }

    // Método principal: recibe los tokens del léxico y valida cada oración
    public void analizar(List<Token> tokens) {
        this.tokens   = tokens;
        this.posicion = 0;
        this.errores.clear();

        // Analiza oración por oración hasta consumir todos los tokens
        while (posicion < tokens.size()) {
            analizarOracion();
        }
    }

    // <oracion> ::= <sujeto> <predicado> <puntuacion_final>?
    private void analizarOracion() {

        // Ignora puntuación suelta al inicio
        if (tokenActual() != null && esCategoria(Token.Categoria.PUNTUACION)) {
            avanzar();
            return;
        }

        int inicioOracion = posicion;

        // Intenta analizar sujeto
        if (!analizarSujeto()) {
            registrarError("Se esperaba un sujeto (pronombre, artículo + sustantivo)", tokenActual());
            recuperar();
            return;
        }

        // Intenta analizar predicado
        if (!analizarPredicado()) {
            registrarError("Se esperaba un predicado (verbo)", tokenActual());
            recuperar();
            return;
        }

        // Puntuación final opcional
        if (tokenActual() != null && esCategoria(Token.Categoria.PUNTUACION)) {
            avanzar();
        }
    }

    // <sujeto> ::= <frase_nominal>
    private boolean analizarSujeto() {
        return analizarFraseNominal();
    }

    // <predicado> ::= <frase_verbal>
    //               | <frase_verbal> <frase_nominal>
    //               | <frase_verbal> <frase_preposicional>
    //               | <frase_verbal> <frase_nominal> <frase_preposicional>
    //               | <frase_verbal> <frase_adjetival>
    private boolean analizarPredicado() {
        if (!analizarFraseVerbal()) return false;

        // Complemento opcional después del verbo
        if (tokenActual() == null || esFinOracion()) return true;

        // Intenta frase preposicional
        if (esCategoria(Token.Categoria.PREPOSICION)) {
            analizarFrasePreposicional();
            return true;
        }

        // Intenta frase nominal como complemento
        if (esDeterminante() || esCategoria(Token.Categoria.SUSTANTIVO) || esCategoria(Token.Categoria.PRONOMBRE)) {
            analizarFraseNominal();

            // Frase preposicional adicional opcional
            if (tokenActual() != null && esCategoria(Token.Categoria.PREPOSICION)) {
                analizarFrasePreposicional();
            }
            return true;
        }

        // Intenta frase adjetival como complemento
        if (esCategoria(Token.Categoria.ADJETIVO)) {
            analizarFraseAdjetival();
            return true;
        }

        return true;
    }

    // <frase_nominal> ::= <determinante> <sustantivo>
    //                   | <determinante> <adjetivo> <sustantivo>
    //                   | <determinante> <sustantivo> <adjetivo>
    //                   | <pronombre>
    //                   | <sustantivo>
    private boolean analizarFraseNominal() {

        // Solo pronombre
        if (esCategoria(Token.Categoria.PRONOMBRE)) {
            avanzar();
            return true;
        }

        // Solo sustantivo
        if (esCategoria(Token.Categoria.SUSTANTIVO)) {
            avanzar();
            return true;
        }

        // Determinante + (adjetivo?) + sustantivo
        if (esDeterminante()) {
            avanzar(); // consume determinante

            // Adjetivo antes del sustantivo (inglés: "a beautiful girl")
            if (esCategoria(Token.Categoria.ADJETIVO)) {
                avanzar();
            }

            // Debe venir un sustantivo
            if (esCategoria(Token.Categoria.SUSTANTIVO)) {
                avanzar();

                // Adjetivo después del sustantivo (español: "el gato negro")
                if (tokenActual() != null && esCategoria(Token.Categoria.ADJETIVO)) {
                    avanzar();
                }
                return true;
            }

            // Determinante sin sustantivo: error
            registrarError("Se esperaba un sustantivo después del determinante", tokenActual());
            return false;
        }

        return false;
    }

    // <frase_verbal> ::= VERBO
    //                  | VERBO <adverbio>
    //                  | <adverbio> VERBO
    private boolean analizarFraseVerbal() {

        // Adverbio antes del verbo
        if (esCategoria(Token.Categoria.ADVERBIO)) {
            avanzar();
        }

        // El verbo es obligatorio
        if (!esCategoria(Token.Categoria.VERBO)) {
            return false;
        }
        avanzar();

        // Adverbio después del verbo
        if (tokenActual() != null && esCategoria(Token.Categoria.ADVERBIO)) {
            avanzar();
        }

        return true;
    }

    // <frase_preposicional> ::= PREPOSICION <frase_nominal>
    private boolean analizarFrasePreposicional() {
        if (!esCategoria(Token.Categoria.PREPOSICION)) return false;
        avanzar();

        if (!analizarFraseNominal()) {
            registrarError("Se esperaba una frase nominal después de la preposición", tokenActual());
            return false;
        }
        return true;
    }

    // <frase_adjetival> ::= ADJETIVO
    //                     | ADJETIVO CONJUNCION ADJETIVO
    private boolean analizarFraseAdjetival() {
        if (!esCategoria(Token.Categoria.ADJETIVO)) return false;
        avanzar();

        // Adjetivo coordinado: "beautiful and happy"
        if (tokenActual() != null && esCategoria(Token.Categoria.CONJUNCION)) {
            avanzar();
            if (esCategoria(Token.Categoria.ADJETIVO)) {
                avanzar();
            } else {
                registrarError("Se esperaba un adjetivo después de la conjunción", tokenActual());
            }
        }
        return true;
    }

    // ── Utilidades de navegación ──

    private Token tokenActual() {
        if (posicion < tokens.size()) return tokens.get(posicion);
        return null;
    }

    private void avanzar() {
        posicion++;
    }

    private boolean esCategoria(Token.Categoria categoria) {
        Token t = tokenActual();
        return t != null && t.getCategoria() == categoria;
    }

    private boolean esDeterminante() {
        Token t = tokenActual();
        if (t == null) return false;
        return t.getCategoria() == Token.Categoria.ARTICULO    ||
                t.getCategoria() == Token.Categoria.POSESIVO    ||
                t.getCategoria() == Token.Categoria.DEMOSTRATIVO ||
                t.getCategoria() == Token.Categoria.NUMERAL;
    }

    private boolean esFinOracion() {
        Token t = tokenActual();
        if (t == null) return true;
        if (t.getCategoria() == Token.Categoria.PUNTUACION) return true;
        return false;
    }

    // Avanza hasta encontrar puntuación o fin para recuperarse de un error
    private void recuperar() {
        while (tokenActual() != null && !esCategoria(Token.Categoria.PUNTUACION)) {
            avanzar();
        }
        if (tokenActual() != null) avanzar();
    }

    // Registra un error sintáctico con ubicación
    private void registrarError(String descripcion, Token token) {
        int linea   = token != null ? token.getLinea()   : -1;
        int columna = token != null ? token.getColumna() : -1;
        String lexema = token != null ? token.getLexema() : "fin de texto";
        errores.add(new ErrorSintactico(lexema, linea, columna, descripcion));
    }

    public List<ErrorSintactico> getErrores() { return errores; }
    public boolean esExitoso()                { return errores.isEmpty(); }
}