package org.example.semantico;

//Representa un error semántico concordancia incorrecta de género, número o conjugación verbal detectada.
public class ErrorSemantico {

    private String lexema;
    private int    linea;
    private int    columna;
    private String descripcion;

    public ErrorSemantico(String lexema, int linea, int columna, String descripcion) {
        this.lexema      = lexema;
        this.linea       = linea;
        this.columna     = columna;
        this.descripcion = descripcion;
    }

    public String getLexema()      { return lexema; }
    public int    getLinea()       { return linea; }
    public int    getColumna()     { return columna; }
    public String getDescripcion() { return descripcion; }

    @Override
    public String toString() {
        return String.format("[ERROR SEMÁNTICO] \"%s\" en L%d:C%d — %s",
                lexema, linea, columna, descripcion);
    }
}