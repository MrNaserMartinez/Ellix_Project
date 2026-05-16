package org.example.lexico;
import org.example.lexico.diccionario.Diccionarioingles;
import org.example.lexico.diccionario.Diccionarioespanol;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class AnalizadorLexico {
    private List<Token>       tokens;
    private List<ErrorLexico> errores;
    private String            direccion;

    private Diccionarioingles  dicIngles;
    private Diccionarioespanol dicEspanol;

    public AnalizadorLexico(String direccion) {
        this.direccion  = direccion;
        this.tokens     = new ArrayList<>();
        this.errores    = new ArrayList<>();
        this.dicIngles  = new Diccionarioingles();
        this.dicEspanol = new Diccionarioespanol();
    }

    public void analizar(String texto) {
        tokens.clear();
        errores.clear();

        String[] lineas = texto.split("\n", -1);

        for (int numLinea = 0; numLinea < lineas.length; numLinea++) {
            procesarLinea(lineas[numLinea], numLinea + 1);
        }
    }

    private void procesarLinea(String linea, int numLinea) {

        Pattern patron = Pattern.compile("[\\w'áéíóúüñÁÉÍÓÚÜÑ]+|[.,!?;:()'\"\\-]");
        Matcher matcher = patron.matcher(linea);

        while (matcher.find()) {
            String lexema = matcher.group();
            int columna = matcher.start() + 1;

            Token token = clasificar(lexema, numLinea, columna);

            if (token.getCategoria() == Token.Categoria.DESCONOCIDO) {
                errores.add(new ErrorLexico(
                        lexema,
                        numLinea,
                        columna,
                        "Palabra no reconocida en el diccionario: \"" + lexema + "\""
                ));
            } else {
                tokens.add(token);
            }
        }
    }

    //clasifica un lexema y devuelve un token
    private Token clasificar(String lexema, int linea, int columna) {
        String palabra = lexema.toLowerCase();

        // Signos de puntuación
        if (lexema.matches("[.,!?;:()'\"\\-]"))
            return new Token(lexema, Token.Categoria.PUNTUACION, lexema, linea, columna);

        // Números cardinales
        if (lexema.matches("\\d+"))
            return new Token(lexema, Token.Categoria.NUMERAL, "Cardinal", linea, columna);

        // Contracciones del español
        if (palabra.equals("al") || palabra.equals("del"))
            return new Token(lexema, Token.Categoria.CONTRACCION, palabra, linea, columna);

        // Delega al diccionario según la dirección
        if (direccion.equals("en-es")) {
            Token.Categoria categoria = dicIngles.clasificar(palabra);
            if (categoria != null) {
                String sub = dicIngles.obtenerSubcategoria(palabra, categoria);
                return new Token(lexema, categoria, sub, linea, columna);
            }
        } else {
            Token.Categoria categoria = dicEspanol.clasificar(palabra);
            if (categoria != null) {
                String sub = dicEspanol.obtenerSubcategoria(palabra, categoria);
                return new Token(lexema, categoria, sub, linea, columna);
            }
        }

        return new Token(lexema, Token.Categoria.DESCONOCIDO, "—", linea, columna);
    }

    public List<Token>       getTokens()  { return tokens; }
    public List<ErrorLexico> getErrores() { return errores; }

    public boolean esExitoso() { return errores.isEmpty(); }
}
