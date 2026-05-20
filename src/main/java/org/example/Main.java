package org.example;

import org.example.lexico.AnalizadorLexico;
import org.example.lexico.Tablatokens;
import org.example.sintactico.AnalizadorSintactico;
import org.example.sintactico.ArbolDerivacion;
import org.example.sintactico.ErrorSintactico;

public class Main {

    public static void main(String[] args) {
        String[] pruebas = {
                "The cat runs quickly in the house.",
                "She is a beautiful and happy girl.",
                "They have good books at school.",
                "runs The house in cat."
        };

        String direccion = "en-es";

        for (String texto : pruebas) {
            System.out.println("\n╔══════════════════════════════════════════════════════╗");
            System.out.println("  TEXTO: " + texto);
            System.out.println("╚══════════════════════════════════════════════════════╝");

            AnalizadorLexico lexico = new AnalizadorLexico(direccion);
            lexico.analizar(texto);

            Tablatokens tabla = new Tablatokens(lexico.getTokens(), lexico.getErrores());
            tabla.imprimirTablaTokens();
            tabla.imprimirTablaErrores();
            System.out.println("  RESUMEN LÉXICO: " + tabla.obtenerResumen());

            if (!lexico.esExitoso()) {
                System.out.println("  ✗ Análisis léxico fallido. No se continúa.\n");
                continue;
            }

            System.out.println("  ✓ Análisis léxico exitoso.\n");

            AnalizadorSintactico sintactico = new AnalizadorSintactico();
            sintactico.analizar(lexico.getTokens());

            if (!sintactico.esExitoso()) {
                System.out.println("  ERRORES SINTÁCTICOS:");
                for (ErrorSintactico e : sintactico.getErrores()) {
                    System.out.println("  " + e.toString());
                }
                System.out.println("  ✗ Análisis sintáctico fallido. No se genera árbol.\n");
                continue;
            }

            System.out.println("  ✓ Análisis sintáctico exitoso.\n");

            ArbolDerivacion arbol = new ArbolDerivacion();
            arbol.construir(lexico.getTokens());
            arbol.imprimir();
        }
    }
}