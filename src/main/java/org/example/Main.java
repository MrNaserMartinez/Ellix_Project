package org.example;

import org.example.lexico.AnalizadorLexico;
import org.example.lexico.Tablatokens;

// Punto de entrada del programa
public class Main {

    public static void main(String[] args) {

        // Texto de prueba en inglés
        String textoPrueba = "The cat runs quickly in the house.\n" +
                "She is a beautiful and happy girl.\n" +
                "They have good books at school.";

        // Dirección de traducción: "en-es" (inglés a español)
        String direccion = "en-es";

        System.out.println("══════════════════════════════════════════════════════");
        System.out.println("  ELLIX — COMPILER TRANSLATOR");
        System.out.println("  Análisis Léxico");
        System.out.println("══════════════════════════════════════════════════════");
        System.out.println("  Dirección : " + direccion);
        System.out.println("  Texto     :\n");
        System.out.println(textoPrueba);
        System.out.println();

        // Crea el analizador léxico
        AnalizadorLexico lexico = new AnalizadorLexico(direccion);

        // Ejecuta el análisis sobre el texto
        lexico.analizar(textoPrueba);

        // Crea la tabla con los resultados del análisis
        Tablatokens tabla = new Tablatokens(lexico.getTokens(), lexico.getErrores());

        // Imprime la tabla de tokens en consola
        tabla.imprimirTablaTokens();

        // Imprime la tabla de errores léxicos
        tabla.imprimirTablaErrores();

        // Muestra el resumen final
        System.out.println("  RESUMEN: " + tabla.obtenerResumen());
        System.out.println();

        if (tabla.sinErrores()) {
            System.out.println("  ✓ Análisis léxico exitoso. Listo para análisis sintáctico.");
        } else {
            System.out.println("  ✗ Se encontraron errores léxicos. No se puede continuar.");
        }

        System.out.println("══════════════════════════════════════════════════════");
    }
}