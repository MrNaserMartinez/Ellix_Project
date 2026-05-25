package org.example;

import org.example.lexico.AnalizadorLexico;
import org.example.sintactico.AnalizadorSintactico;
import org.example.sintactico.ArbolDerivacion;
import org.example.sintactico.ErrorSintactico;
import org.example.semantico.AnalizadorSemantico;
import org.example.semantico.TablaErrores;
import org.example.semantico.ErrorSemantico;
import org.example.lexico.ErrorLexico;
import org.example.lexico.Token;
import org.example.sintesis.Traductor;

// Punto de entrada del programa.
// Ejecuta los 3 análisis en secuencia y genera la traducción si no hay errores.
public class Main {

    public static void main(String[] args) {

        String[][] pruebas = {
                {"The cat runs quickly in the house.", "en-es"},
                {"She is a beautiful and happy girl.", "en-es"},
                {"They have good books at school.",    "en-es"},
                {"runs The house in cat.",             "en-es"},
                {"el gato corre rápido.",              "es-en"},
                {"la casa es bonita.",                 "es-en"},
                {"el casa es bonita.",                 "es-en"},
        };

        Traductor traductor = new Traductor();

        for (String[] prueba : pruebas) {
            String texto     = prueba[0];
            String direccion = prueba[1];
            TablaErrores tablaErrores = new TablaErrores();

            System.out.println("\n╔══════════════════════════════════════════════════════╗");
            System.out.println("  TEXTO    : " + texto);
            System.out.println("  DIRECCIÓN: " + direccion);
            System.out.println("╚══════════════════════════════════════════════════════╝");

            // ── Fase 1: Léxico ──
            AnalizadorLexico lexico = new AnalizadorLexico(direccion);
            lexico.analizar(texto);

            // Imprime tokens reconocidos
            System.out.println("\n  TOKENS:");
            for (Token t : lexico.getTokens()) {
                System.out.printf("  %-15s | %-15s | %s%n",
                        t.getLexema(), t.getCategoria(), t.getSubcategoria());
            }

            if (!lexico.esExitoso()) {
                tablaErrores.agregarErroresLexicos(lexico.getErrores());
                tablaErrores.imprimir();
                System.out.println("  ✗ Análisis léxico fallido.\n");
                continue;
            }
            System.out.println("  ✓ Análisis léxico exitoso.");

            // ── Fase 2: Sintáctico ──
            AnalizadorSintactico sintactico = new AnalizadorSintactico();
            sintactico.analizar(lexico.getTokens());

            if (!sintactico.esExitoso()) {
                tablaErrores.agregarErroresSintacticos(sintactico.getErrores());
                tablaErrores.imprimir();
                System.out.println("  ✗ Análisis sintáctico fallido. No se genera árbol.\n");
                continue;
            }
            System.out.println("  ✓ Análisis sintáctico exitoso.");

            // ── Árbol de derivación ──
            ArbolDerivacion arbol = new ArbolDerivacion();
            arbol.construir(lexico.getTokens());
            arbol.imprimir();

            // ── Fase 3: Semántico ──
            AnalizadorSemantico semantico = new AnalizadorSemantico();
            semantico.analizar(lexico.getTokens(), direccion);

            if (!semantico.esExitoso()) {
                tablaErrores.agregarErroresSemanticos(semantico.getErrores());
                tablaErrores.imprimir();
                System.out.println("  ✗ Análisis semántico fallido.\n");
                continue;
            }
            System.out.println("  ✓ Análisis semántico exitoso.");

            // ── Síntesis: Traducción ──
            String traduccion = traductor.traducir(lexico.getTokens(), direccion);
            System.out.println("\n  TRADUCCIÓN : " + traduccion);
            System.out.println("\n  CLASIFICACIÓN:");
            System.out.print(traductor.clasificacionCompleta(lexico.getTokens()));
            System.out.println("  ✓ Síntesis completada.\n");
        }
    }
}