package org.example;

import org.example.lexico.AnalizadorLexico;
import org.example.lexico.Tablatokens;
import org.example.semantico.AnalizadorSemantico;
import org.example.semantico.TablaErrores;
import org.example.sintactico.AnalizadorSintactico;
import org.example.sintactico.ArbolDerivacion;
import org.example.sintactico.ErrorSintactico;

public class Main {

    public static void main(String[] args) {

        // Textos de prueba: válidos e inválidos
        String[][] pruebas = {
                {"The cat runs quickly in the house.", "en-es"},
                {"She is a beautiful and happy girl.", "en-es"},
                {"They have good books at school.",    "en-es"},
                {"runs The house in cat.",             "en-es"},  // error sintáctico
                {"el gato corre rápido.",              "es-en"},
                {"la casa es bonita.",                 "es-en"},
                {"el casa es bonita.",                 "es-en"},  // error semántico
        };

        for (String[] prueba : pruebas) {
            String texto     = prueba[0];
            String direccion = prueba[1];

            TablaErrores tablaErrores = new TablaErrores();

            System.out.println("\n╔══════════════════════════════════════════════════════╗");
            System.out.println("  TEXTO    : " + texto);
            System.out.println("  DIRECCIÓN: " + direccion);
            System.out.println("╚══════════════════════════════════════════════════════╝");

            // ── FASE 1: Análisis Léxico ──
            AnalizadorLexico lexico = new AnalizadorLexico(direccion);
            lexico.analizar(texto);

            Tablatokens tablaTokens = new Tablatokens(lexico.getTokens(), lexico.getErrores());
            tablaTokens.imprimirTablaTokens();

            if (!lexico.esExitoso()) {
                tablaErrores.agregarErroresLexicos(lexico.getErrores());
                tablaErrores.imprimir();
                System.out.println("  ✗ Análisis léxico fallido. No se continúa.");
                continue;
            }
            System.out.println("  ✓ Análisis léxico exitoso.");

            // ── FASE 2: Análisis Sintáctico ──
            AnalizadorSintactico sintactico = new AnalizadorSintactico();
            sintactico.analizar(lexico.getTokens());

            if (!sintactico.esExitoso()) {
                tablaErrores.agregarErroresSintacticos(sintactico.getErrores());
                tablaErrores.imprimir();
                System.out.println("  ✗ Análisis sintáctico fallido. No se genera árbol.");
                continue;
            }
            System.out.println("  ✓ Análisis sintáctico exitoso.");

            // ── Árbol de Derivación ──
            ArbolDerivacion arbol = new ArbolDerivacion();
            arbol.construir(lexico.getTokens());
            arbol.imprimir();

            // ── FASE 3: Análisis Semántico ──
            AnalizadorSemantico semantico = new AnalizadorSemantico();
            semantico.analizar(lexico.getTokens(), direccion);

            if (!semantico.esExitoso()) {
                tablaErrores.agregarErroresSemanticos(semantico.getErrores());
                tablaErrores.imprimir();
                System.out.println("  ✗ Análisis semántico fallido.");
                continue;
            }

            System.out.println("  ✓ Análisis semántico exitoso.");
            System.out.println("  ✓ Listo para síntesis (Programador 3).");

            // Resumen final sin errores
            System.out.println("  RESUMEN: " + tablaErrores.obtenerResumen());
        }
    }
}