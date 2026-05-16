package org.example.lexico;

//representa un error lexico
public class ErrorLexico {
    private String lexema;
    private int linea;
    private int columna;
    private String descripcion;

    // Constructor
    public ErrorLexico(String lexema, int linea, int columna, String descripcion) {
        this.lexema = lexema;
        this.linea = linea;
        this.columna = columna;
        this.descripcion = descripcion;
    }

    // ── Getters ──
    public String getLexema()      { return lexema; }
    public int    getLinea()       { return linea; }
    public int    getColumna()     { return columna; }
    public String getDescripcion() { return descripcion; }

    // Muestra el error en formato legible
    @Override
    public String toString() {
        return String.format("[ERROR LÉXICO] \"%s\" en L%d:C%d — %s",
                lexema, linea, columna, descripcion);
    }
}
