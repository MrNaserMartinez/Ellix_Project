package org.example.sintactico;

// Construye y representa el árbol de derivación de una oración.

import org.example.lexico.Token;
import java.util.ArrayList;
import java.util.List;

public class ArbolDerivacion {

    // Un nodo puede ser una regla BNF (no terminal) o un token (terminal)
    public static class Nodo {
        private String      etiqueta;   // nombre de la regla o lexema del token
        private boolean     esTerminal; // true si es un token real
        private List<Nodo>  hijos;

        public Nodo(String etiqueta, boolean esTerminal) {
            this.etiqueta   = etiqueta;
            this.esTerminal = esTerminal;
            this.hijos      = new ArrayList<>();
        }

        public void agregarHijo(Nodo hijo)  { hijos.add(hijo); }
        public String      getEtiqueta()    { return etiqueta; }
        public boolean     esTerminal()     { return esTerminal; }
        public List<Nodo>  getHijos()       { return hijos; }
    }

    private Nodo  raiz;
    private List<Token> tokens;
    private int         posicion;

    // Construye el árbol a partir de los tokens validados
    public void construir(List<Token> tokens) {
        this.tokens   = tokens;
        this.posicion = 0;
        this.raiz     = new Nodo("programa", false);

        // Construye un subárbol por cada oración encontrada
        while (posicion < tokens.size()) {
            Nodo nodoOracion = construirOracion();
            if (nodoOracion != null) {
                raiz.agregarHijo(nodoOracion);
            }
        }
    }

    // Construye el nodo de una oración completa
    private Nodo construirOracion() {

        // Salta puntuación suelta
        if (tokenActual() != null && esCategoria(Token.Categoria.PUNTUACION)) {
            avanzar();
            return null;
        }

        Nodo oracion = new Nodo("oracion", false);

        // Interjección opcional al inicio
        if (tokenActual() != null && esCategoria(Token.Categoria.INTERJECCION)) {
            oracion.agregarHijo(new Nodo(tokenActual().getLexema(), true));
            avanzar();
        }

        // Sujeto
        Nodo sujeto = construirSujeto();
        if (sujeto != null) oracion.agregarHijo(sujeto);

        // Predicado
        Nodo predicado = construirPredicado();
        if (predicado != null) oracion.agregarHijo(predicado);

        // Puntuación final
        if (tokenActual() != null && esCategoria(Token.Categoria.PUNTUACION)) {
            oracion.agregarHijo(new Nodo(tokenActual().getLexema(), true));
            avanzar();
        }

        return oracion;
    }

    // sujeto → frase_nominal
    private Nodo construirSujeto() {
        Nodo sujeto = new Nodo("sujeto", false);
        Nodo fn = construirFraseNominal();
        if (fn != null) sujeto.agregarHijo(fn);
        return sujeto;
    }

    // predicado → frase_verbal (complemento)?
    private Nodo construirPredicado() {
        Nodo predicado = new Nodo("predicado", false);

        Nodo fv = construirFraseVerbal();
        if (fv != null) predicado.agregarHijo(fv);

        if (tokenActual() == null || esFinOracion()) return predicado;

        // Complemento preposicional
        if (esCategoria(Token.Categoria.PREPOSICION)) {
            Nodo fp = construirFrasePreposicional();
            if (fp != null) predicado.agregarHijo(fp);
            return predicado;
        }

        // Complemento nominal
        if (esDeterminante() || esCategoria(Token.Categoria.SUSTANTIVO) || esCategoria(Token.Categoria.PRONOMBRE)) {
            Nodo fn = construirFraseNominal();
            if (fn != null) predicado.agregarHijo(fn);

            if (tokenActual() != null && esCategoria(Token.Categoria.PREPOSICION)) {
                Nodo fp = construirFrasePreposicional();
                if (fp != null) predicado.agregarHijo(fp);
            }
            return predicado;
        }

        // Complemento adjetival
        if (esCategoria(Token.Categoria.ADJETIVO)) {
            Nodo fa = construirFraseAdjetival();
            if (fa != null) predicado.agregarHijo(fa);
        }

        return predicado;
    }

    // frase_nominal → determinante? adjetivo? sustantivo | pronombre
    private Nodo construirFraseNominal() {
        Nodo fn = new Nodo("frase_nominal", false);

        if (esCategoria(Token.Categoria.PRONOMBRE)) {
            fn.agregarHijo(new Nodo(tokenActual().getLexema(), true));
            avanzar();
            return fn;
        }

        if (esCategoria(Token.Categoria.SUSTANTIVO)) {
            fn.agregarHijo(new Nodo(tokenActual().getLexema(), true));
            avanzar();
            return fn;
        }

        if (esDeterminante()) {
            fn.agregarHijo(new Nodo(tokenActual().getLexema(), true));
            avanzar();

            if (esCategoria(Token.Categoria.ADJETIVO)) {
                fn.agregarHijo(new Nodo(tokenActual().getLexema(), true));
                avanzar();
            }

            if (esCategoria(Token.Categoria.SUSTANTIVO)) {
                fn.agregarHijo(new Nodo(tokenActual().getLexema(), true));
                avanzar();

                if (tokenActual() != null && esCategoria(Token.Categoria.ADJETIVO)) {
                    fn.agregarHijo(new Nodo(tokenActual().getLexema(), true));
                    avanzar();
                }
            }
            return fn;
        }

        return null;
    }

    // frase_verbal → adverbio? verbo adverbio?
    private Nodo construirFraseVerbal() {
        Nodo fv = new Nodo("frase_verbal", false);

        if (esCategoria(Token.Categoria.ADVERBIO)) {
            fv.agregarHijo(new Nodo(tokenActual().getLexema(), true));
            avanzar();
        }

        if (esCategoria(Token.Categoria.VERBO)) {
            fv.agregarHijo(new Nodo(tokenActual().getLexema(), true));
            avanzar();
        }

        if (tokenActual() != null && esCategoria(Token.Categoria.ADVERBIO)) {
            fv.agregarHijo(new Nodo(tokenActual().getLexema(), true));
            avanzar();
        }

        return fv;
    }

    // frase_preposicional → preposicion frase_nominal
    private Nodo construirFrasePreposicional() {
        Nodo fp = new Nodo("frase_prep", false);
        fp.agregarHijo(new Nodo(tokenActual().getLexema(), true));
        avanzar();

        Nodo fn = construirFraseNominal();
        if (fn != null) fp.agregarHijo(fn);

        return fp;
    }

    // frase_adjetival → adjetivo (conjuncion adjetivo)?
    private Nodo construirFraseAdjetival() {
        Nodo fa = new Nodo("frase_adj", false);
        fa.agregarHijo(new Nodo(tokenActual().getLexema(), true));
        avanzar();

        if (tokenActual() != null && esCategoria(Token.Categoria.CONJUNCION)) {
            fa.agregarHijo(new Nodo(tokenActual().getLexema(), true));
            avanzar();

            if (esCategoria(Token.Categoria.ADJETIVO)) {
                fa.agregarHijo(new Nodo(tokenActual().getLexema(), true));
                avanzar();
            }
        }

        return fa;
    }

    // ── Imprime el árbol en consola con indentación ──
    public void imprimir() {
        if (raiz == null) {
            System.out.println("  Árbol no disponible.");
            return;
        }
        System.out.println("\n══════════════════════════════════════════════════════");
        System.out.println("  ÁRBOL DE DERIVACIÓN");
        System.out.println("══════════════════════════════════════════════════════");
        imprimirNodo(raiz, 0);
        System.out.println("══════════════════════════════════════════════════════\n");
    }

    private void imprimirNodo(Nodo nodo, int nivel) {
        String sangria = "  ".repeat(nivel);
        if (nodo.esTerminal()) {
            System.out.println(sangria + "└─ [" + nodo.getEtiqueta() + "]");
        } else {
            System.out.println(sangria + "○ " + nodo.getEtiqueta());
            for (Nodo hijo : nodo.getHijos()) {
                imprimirNodo(hijo, nivel + 1);
            }
        }
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

    public Nodo getRaiz() { return raiz; }
}