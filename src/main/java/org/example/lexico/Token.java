package org.example.lexico;

public class Token {

    //Categorias a reconocer
    public enum Categoria{
        SUSTANTIVO,
        ADJETIVO,
        CALIFICATIVO,
        ARTICULO,
        POSESIVO,
        DEMOSTRATIVO,
        INDEFINIDO,
        NUMERAL,
        PRONOMBRE,
        VERBO,
        ADVERBIO,
        PREPOSICION,
        CONJUNCION,
        INTERJECCION,
        CONTRACCION,
        PUNTUACION,
        DESCONOCIDO //ERROR LEXICO
    }

    //Datos que guarda cada token
    private String lexema;
    private Categoria categoria;
    private String subcategoria;
    private int linea;
    private int columna;

    //cada vez que el analisis reconoce una palabra
    public Token(String lexema, Categoria categoria, String subcategoria, int linea, int columna) {
        this.lexema = lexema;
        this.categoria = categoria;
        this.subcategoria = subcategoria;
        this.linea = linea;
        this.columna = columna;
    }

    //Getters
    public String getLexema() { return lexema; }
    public Categoria getCategoria() { return categoria; }
    public String getSubcategoria() { return subcategoria; }
    public int getLinea() { return linea; }
    public int getColumna() { return columna; }

    @Override
    public String toString() {
        return String.format("[%s | %s | %s | L%d | C%d] ", lexema, categoria, subcategoria, linea, columna);
    }
}
