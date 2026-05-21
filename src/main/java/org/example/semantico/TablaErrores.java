package org.example.semantico;
/*
Tabla unificada que consolida todos los errores del compilador
léxicos, sintácticos y semánticos en un solo lugar.
Esta es la tabla de errores final!!!!
*/
import org.example.lexico.ErrorLexico;
import org.example.sintactico.ErrorSintactico;
import java.util.ArrayList;
import java.util.List;

public class TablaErrores {

    // Entrada unificada para cualquier tipo de error
    public static class EntradaError {
        public String tipo;
        public String lexema;
        public int    linea;
        public int    columna;
        public String descripcion;

        public EntradaError(String tipo, String lexema, int linea, int columna, String descripcion) {
            this.tipo        = tipo;
            this.lexema      = lexema;
            this.linea       = linea;
            this.columna     = columna;
            this.descripcion = descripcion;
        }
    }

    private List<EntradaError> errores;

    public TablaErrores() {
        this.errores = new ArrayList<>();
    }

    // Agrega errores léxicos a la tabla unificada
    public void agregarErroresLexicos(List<ErrorLexico> lista) {
        for (ErrorLexico e : lista) {
            errores.add(new EntradaError(
                    "Léxico", e.getLexema(), e.getLinea(), e.getColumna(), e.getDescripcion()
            ));
        }
    }

    // Agrega errores sintácticos a la tabla unificada
    public void agregarErroresSintacticos(List<ErrorSintactico> lista) {
        for (ErrorSintactico e : lista) {
            errores.add(new EntradaError(
                    "Sintáctico", e.getLexema(), e.getLinea(), e.getColumna(), e.getDescripcion()
            ));
        }
    }

    // Agrega errores semánticos a la tabla unificada
    public void agregarErroresSemanticos(List<ErrorSemantico> lista) {
        for (ErrorSemantico e : lista) {
            errores.add(new EntradaError(
                    "Semántico", e.getLexema(), e.getLinea(), e.getColumna(), e.getDescripcion()
            ));
        }
    }

    // Imprime la tabla unificada en consola
    public void imprimir() {
        if (errores.isEmpty()) {
            System.out.println("\n  ✓ No se encontraron errores.\n");
            return;
        }

        System.out.println("\n══════════════════════════════════════════════════════════════════");
        System.out.println("  TABLA DE ERRORES UNIFICADA");
        System.out.println("══════════════════════════════════════════════════════════════════");
        System.out.printf("  %-4s %-12s %-20s %-6s %-6s %-30s%n",
                "#", "Tipo", "Lexema", "Línea", "Col", "Descripción");
        System.out.println("  ──────────────────────────────────────────────────────────────");

        int i = 1;
        for (EntradaError e : errores) {
            System.out.printf("  %-4d %-12s %-20s %-6d %-6d %-30s%n",
                    i++, e.tipo, e.lexema, e.linea, e.columna, e.descripcion);
        }

        System.out.println("══════════════════════════════════════════════════════════════════\n");
    }

    // Resumen por tipo de error
    public String obtenerResumen() {
        long lexicos    = errores.stream().filter(e -> e.tipo.equals("Léxico")).count();
        long sintacticos = errores.stream().filter(e -> e.tipo.equals("Sintáctico")).count();
        long semanticos  = errores.stream().filter(e -> e.tipo.equals("Semántico")).count();
        return String.format("Léxicos: %d | Sintácticos: %d | Semánticos: %d", lexicos, sintacticos, semanticos);
    }

    public List<EntradaError> getErrores() { return errores; }
    public boolean            sinErrores() { return errores.isEmpty(); }
}