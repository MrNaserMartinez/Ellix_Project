package org.example.lexico;
import java.util.List;

//almacena los errores y tokens del analisis lexico
public class Tablatokens {
    private List<Token>       tokens;
    private List<ErrorLexico> errores;

    public Tablatokens(List<Token> tokens, List<ErrorLexico> errores) {
        this.tokens  = tokens;
        this.errores = errores;
    }

    public void imprimirTablaTokens() {
        System.out.println("\n══════════════════════════════════════════════════════");
        System.out.println("  TABLA DE TOKENS");
        System.out.println("══════════════════════════════════════════════════════");
        System.out.printf("  %-4s %-20s %-15s %-20s %-6s %-6s%n",
                "#", "Lexema", "Categoría", "Subcategoría", "Línea", "Col");
        System.out.println("  ──────────────────────────────────────────────────");

        int i = 1;
        for (Token t : tokens) {
            System.out.printf("  %-4d %-20s %-15s %-20s %-6d %-6d%n",
                    i++,
                    t.getLexema(),
                    t.getCategoria(),
                    t.getSubcategoria(),
                    t.getLinea(),
                    t.getColumna());
        }

        System.out.println("══════════════════════════════════════════════════════\n");
    }

    public void imprimirTablaErrores() {
        if (errores.isEmpty()) {
            System.out.println("\n  ✓ No se encontraron errores léxicos.\n");
            return;
        }

        System.out.println("\n══════════════════════════════════════════════════════");
        System.out.println("  TABLA DE ERRORES LÉXICOS");
        System.out.println("══════════════════════════════════════════════════════");
        System.out.printf("  %-4s %-8s %-20s %-6s %-6s %-30s%n",
                "#", "Tipo", "Lexema", "Línea", "Col", "Descripción");
        System.out.println("  ──────────────────────────────────────────────────");

        int i = 1;
        for (ErrorLexico e : errores) {
            System.out.printf("  %-4d %-8s %-20s %-6d %-6d %-30s%n",
                    i++,
                    "Léxico",
                    e.getLexema(),
                    e.getLinea(),
                    e.getColumna(),
                    e.getDescripcion());
        }

        System.out.println("══════════════════════════════════════════════════════\n");
    }

    //devuelve un resumen del analisis
    public String obtenerResumen() {
        return String.format("Tokens reconocidos: %d | Errores léxicos: %d",
                tokens.size(), errores.size());
    }

    public List<Token>       getTokens()  { return tokens; }
    public List<ErrorLexico> getErrores() { return errores; }

    public boolean sinErrores() {
        return errores.isEmpty();
    }
}
