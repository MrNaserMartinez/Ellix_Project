package org.example.sintesis;

import org.example.lexico.Token;
import java.util.List;

public class Traductor {

    private Diccionario diccionario;

    public Traductor() {
        this.diccionario = new Diccionario();
    }

    // Traduce la lista de tokens y devuelve el texto traducido completo
    public String traducir(List<Token> tokens, String direccion) {
        StringBuilder resultado = new StringBuilder();
        boolean primerToken     = true;

        for (Token token : tokens) {
            String lexema     = token.getLexema();
            String traduccion = diccionario.traducir(lexema, direccion);

            // Puntuación va pegada a la palabra anterior sin espacio
            if (token.getCategoria() == Token.Categoria.PUNTUACION) {
                resultado.append(traduccion);
            } else {
                if (!primerToken) resultado.append(" ");
                resultado.append(traduccion);
            }

            primerToken = false;
        }

        return resultado.toString().trim();
    }

    // Devuelve la clasificación completa de cada token
    public String clasificacionCompleta(List<Token> tokens) {
        StringBuilder sb = new StringBuilder();
        for (Token token : tokens) {
            if (token.getCategoria() == Token.Categoria.PUNTUACION) continue;
            sb.append(String.format("%-15s → %-15s (%s)%n",
                    token.getLexema(),
                    token.getCategoria(),
                    token.getSubcategoria()));
        }
        return sb.toString();
    }
}