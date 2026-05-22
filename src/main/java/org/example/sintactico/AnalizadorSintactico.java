package org.example.sintactico;

import org.example.lexico.Token;
import java.util.ArrayList;
import java.util.List;

public class AnalizadorSintactico {

    private List<Token>           tokens;
    private List<ErrorSintactico> errores;
    private int                   posicion;

    public AnalizadorSintactico() {
        this.errores = new ArrayList<>();
    }

    public void analizar(List<Token> tokens) {
        this.tokens   = tokens;
        this.posicion = 0;
        this.errores.clear();

        while (posicion < tokens.size()) {
            analizarOracion();
        }
    }

    // <oracion> ::= <sujeto> <predicado> <puntuacion_final>?
    private void analizarOracion() {
        if (tokenActual() != null && esCategoria(Token.Categoria.PUNTUACION)) {
            avanzar();
            return;
        }

        if (!analizarSujeto()) {
            registrarError("Se esperaba un sujeto (pronombre, artículo + sustantivo)", tokenActual());
            recuperar();
            return;
        }

        if (!analizarPredicado()) {
            registrarError("Se esperaba un predicado (verbo)", tokenActual());
            recuperar();
            return;
        }

        if (tokenActual() != null && esCategoria(Token.Categoria.PUNTUACION)) {
            avanzar();
        }
    }

    private boolean analizarSujeto() {
        return analizarFraseNominal();
    }

    // <predicado> ::= <frase_verbal> <complemento>*
    private boolean analizarPredicado() {
        if (!analizarFraseVerbal()) return false;

        // Consume todos los complementos opcionales que vengan después del verbo
        while (tokenActual() != null && !esFinOracion()) {

            // Frase preposicional
            if (esCategoria(Token.Categoria.PREPOSICION)) {
                analizarFrasePreposicional();
                continue;
            }

            // Frase adjetival (predicativo: "She is beautiful and happy")
            if (esCategoria(Token.Categoria.ADJETIVO)) {
                analizarFraseAdjetival();
                continue;
            }

            // Frase nominal como complemento directo
            if (esDeterminante() || esCategoria(Token.Categoria.SUSTANTIVO)
                    || esCategoria(Token.Categoria.PRONOMBRE)) {
                analizarFraseNominal();
                continue;
            }

            // Adverbio adicional después del verbo
            if (esCategoria(Token.Categoria.ADVERBIO)) {
                avanzar();
                continue;
            }

            break;
        }

        return true;
    }

    // <frase_nominal> ::= <determinante> (<adjetivo> (CONJUNCION <adjetivo>)*)* <sustantivo> <adjetivo>?
    //                   | <pronombre>
    //                   | <sustantivo>
    private boolean analizarFraseNominal() {

        if (esCategoria(Token.Categoria.PRONOMBRE)) {
            avanzar();
            return true;
        }

        if (esCategoria(Token.Categoria.SUSTANTIVO)) {
            avanzar();
            return true;
        }

        if (esDeterminante()) {
            avanzar();

            // Uno o más adjetivos coordinados antes del sustantivo
            // Cubre: "a beautiful and happy girl"
            while (esCategoria(Token.Categoria.ADJETIVO)) {
                avanzar();
                // Conjunción coordinando adjetivos: "beautiful and happy"
                if (tokenActual() != null && esCategoria(Token.Categoria.CONJUNCION)) {
                    int guardado = posicion;
                    avanzar();
                    // Solo avanza si lo siguiente es adjetivo, si no deshace
                    if (esCategoria(Token.Categoria.ADJETIVO)) {
                        avanzar();
                    } else {
                        posicion = guardado;
                        break;
                    }
                } else {
                    break;
                }
            }

            if (esCategoria(Token.Categoria.SUSTANTIVO)) {
                avanzar();
                // Adjetivo después del sustantivo (español: "el gato negro")
                if (tokenActual() != null && esCategoria(Token.Categoria.ADJETIVO)) {
                    avanzar();
                }
                return true;
            }

            registrarError("Se esperaba un sustantivo después del determinante", tokenActual());
            return false;
        }

        return false;
    }

    // <frase_verbal> ::= <adverbio>? VERBO <adverbio>?
    private boolean analizarFraseVerbal() {
        if (esCategoria(Token.Categoria.ADVERBIO)) avanzar();

        if (!esCategoria(Token.Categoria.VERBO)) return false;
        avanzar();

        if (tokenActual() != null && esCategoria(Token.Categoria.ADVERBIO)) avanzar();

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

    // <frase_adjetival> ::= ADJETIVO (CONJUNCION ADJETIVO)*
    private boolean analizarFraseAdjetival() {
        if (!esCategoria(Token.Categoria.ADJETIVO)) return false;
        avanzar();

        while (tokenActual() != null && esCategoria(Token.Categoria.CONJUNCION)) {
            int guardado = posicion;
            avanzar();
            if (esCategoria(Token.Categoria.ADJETIVO)) {
                avanzar();
            } else {
                posicion = guardado;
                break;
            }
        }
        return true;
    }

    // ── Utilidades ──

    private Token tokenActual() {
        return posicion < tokens.size() ? tokens.get(posicion) : null;
    }

    private void avanzar() { posicion++; }

    private boolean esCategoria(Token.Categoria categoria) {
        Token t = tokenActual();
        return t != null && t.getCategoria() == categoria;
    }

    private boolean esDeterminante() {
        Token t = tokenActual();
        if (t == null) return false;
        return t.getCategoria() == Token.Categoria.ARTICULO     ||
                t.getCategoria() == Token.Categoria.POSESIVO     ||
                t.getCategoria() == Token.Categoria.DEMOSTRATIVO ||
                t.getCategoria() == Token.Categoria.NUMERAL;
    }

    private boolean esFinOracion() {
        Token t = tokenActual();
        return t == null || t.getCategoria() == Token.Categoria.PUNTUACION;
    }

    private void recuperar() {
        while (tokenActual() != null && !esCategoria(Token.Categoria.PUNTUACION)) avanzar();
        if (tokenActual() != null) avanzar();
    }

    private void registrarError(String descripcion, Token token) {
        int    linea   = token != null ? token.getLinea()   : -1;
        int    columna = token != null ? token.getColumna() : -1;
        String lexema  = token != null ? token.getLexema()  : "fin de texto";
        errores.add(new ErrorSintactico(lexema, linea, columna, descripcion));
    }

    public List<ErrorSintactico> getErrores() { return errores; }
    public boolean esExitoso()                { return errores.isEmpty(); }
}