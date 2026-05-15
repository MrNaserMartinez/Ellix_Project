package org.example.lexico.diccionario;
import org.example.lexico.Token;

//Metodos para clasificar palabras en ingles
public class Diccionarioingles {
    public boolean esArticulo(String p){
        return p.matches("the|a|an");
    }

    public boolean esPosesivo(String p){
        return p.matches("my|your|his|her|its|our|their");
    }

    public boolean esDemostrativo(String p){
        return p.matches("this|that|these|those");
    }

    public boolean esPronombre(String p){
        return p.matches("i|you|he|she|it|we|they|me|him|her|us|them|\" +\n" +
                "\"who|whom|whose|which|what|\" +\n" +
                "\"myself|yourself|himself|herself|itself|ourselves|themselves");
    }

    public boolean esVerbo(String p){
        return p.matches("is|are|was|were|be|been|being|am|" +
                "have|has|had|do|does|did|" +
                "will|would|shall|should|may|might|can|could|must|" +
                "run|runs|ran|eat|eats|ate|go|goes|went|" +
                "see|sees|saw|come|comes|came|" +
                "know|knows|knew|think|thinks|thought|" +
                "like|likes|liked|want|wants|wanted|" +
                "need|needs|needed|love|loves|loved|" +
                "feel|feels|felt|read|reads|" +
                "write|writes|wrote|written|" +
                "speak|speaks|spoke|listen|listens|listened|" +
                "work|works|worked|play|plays|played|" +
                "study|studies|studied|learn|learns|learned|" +
                "teach|teaches|taught|help|helps|helped|" +
                "make|makes|made|take|takes|took|taken|" +
                "give|gives|gave|given|get|gets|got|" +
                "put|puts|set|sets|let|lets|" +
                "say|says|said|tell|tells|told|" +
                "ask|asks|asked|answer|answers|answered|" +
                "find|finds|found|keep|keeps|kept|" +
                "start|starts|started|stop|stops|stopped|" +
                "open|opens|opened|close|closes|closed|" +
                "call|calls|called|try|tries|tried|" +
                "use|uses|used|show|shows|showed|shown|" +
                "move|moves|moved|live|lives|lived|" +
                "believe|believes|believed|hold|holds|held|" +
                "bring|brings|brought|happen|happens|happened|" +
                "walk|walks|walked|turn|turns|turned|" +
                "begin|begins|began|begun|" +
                "carry|carries|carried|wait|waits|waited");
    }

    public boolean esAdverbio(String p){
        return p.matches("very|well|also|just|now|then|here|there|" +
                "always|never|often|sometimes|rarely|usually|" +
                "still|already|soon|again|too|quite|" +
                "much|more|most|less|least|only|" +
                "really|quickly|slowly|early|late|" +
                "together|away|back|up|down|out|" +
                "perhaps|maybe|certainly|probably|definitely|" +
                "almost|enough|even|else|instead|" +
                "yesterday|today|tomorrow|ago|" +
                "everywhere|somewhere|nowhere|anywhere|" +
                "once|twice|thrice");
    }

    public String detectarSubtipoAdverbio(String p){
        if (p.matches("now|then|yesterday|today|tomorrow|ago|soon|already|still|early|late"))
            return "Tiempo";
        if (p.matches("\"here|there|everywhere|somewhere|nowhere|anywhere|away|back|up|down|out\""))
            return "Lugar";
        if (p.matches("very|much|more|most|less|least|quite|almost|enough|once|twice|thrice"))
            return "Cantidad";
        if (p.matches("well|quickly|slowly|really|together|instead"))
            return "Modo";
        if (p.matches("always|certainly|definitely|yes|also"))
            return "Afirmación";
        if (p.matches("never|rarely|nowhere"))
            return "Negación";
        if (p.matches("perhaps|maybe|probably|possibly"))
            return "Duda";
        return "Modo";
    }

    public boolean esPreposicion(String p){
        return p.matches("in|on|at|to|for|of|with|by|from|" +
                "up|about|into|through|during|before|after|" +
                "above|below|between|among|under|over|" +
                "near|behind|beside|along|across|around|" +
                "against|without|within|beyond|toward|towards|" +
                "despite|except|per|since|until|upon");
    }

    //conjunciones coordinantes
    public boolean esConjuncionCoordinante(String p){
        return p.matches("and|but|or|nor|for|yet|so|both|either|neither");
    }

    //conjunciones subcordinantes
    public boolean esConjuncionSubordinante(String p) {
        return p.matches("because|since|although|though|if|unless|until|" +
                "when|where|while|that|which|who|whom|whose|as|than|" +
                "whether|whenever|wherever|however|whatever|whoever");
    }

    // ── Adjetivos calificativos ──
    public boolean esAdjetivo(String p) {
        return p.matches("good|bad|big|small|new|old|young|" +
                "long|short|high|low|great|little|" +
                "own|right|left|next|last|" +
                "hard|easy|strong|weak|" +
                "happy|sad|beautiful|ugly|fast|slow|" +
                "hot|cold|warm|cool|" +
                "white|black|red|blue|green|yellow|orange|purple|brown|gray|" +
                "large|tiny|huge|tall|wide|narrow|deep|" +
                "rich|poor|busy|free|full|empty|" +
                "clean|dirty|quiet|loud|bright|dark|" +
                "important|different|possible|sure|ready|" +
                "open|closed|simple|complex|special|common|" +
                "first|second|third|other|same|only|whole|real|true|false");
    }

    // ── Sustantivos comunes ──
    public boolean esSustantivo(String p) {
        return p.matches("cat|dog|house|car|book|" +
                "man|woman|child|boy|girl|baby|" +
                "day|year|time|way|life|world|" +
                "school|work|water|food|city|country|" +
                "family|friend|hand|eye|face|head|" +
                "door|table|chair|room|tree|flower|" +
                "bird|sun|moon|star|sky|street|" +
                "name|word|sentence|language|" +
                "morning|afternoon|evening|night|week|month|" +
                "money|price|store|market|road|" +
                "heart|mind|body|voice|sound|light|" +
                "color|letter|number|story|news|" +
                "question|answer|problem|idea|" +
                "king|queen|teacher|student|doctor|" +
                "mother|father|son|daughter|brother|sister|" +
                "people|person|place|thing|part|" +
                "air|fire|earth|ground|river|sea|ocean|" +
                "garden|park|building|window|wall|floor|" +
                "computer|phone|paper|pen|pencil|" +
                "music|art|game|sport|team|" +
                "fish|horse|cow|sheep|pig|lion|tiger|bear|" +
                "apple|bread|milk|rice|egg|meat|fruit|vegetable");
    }

    // ── Interjecciones ──
    public boolean esInterjeccion(String p) {
        return p.matches("oh|wow|hey|hi|hello|bye|yes|no|ok|okay|" +
                "ouch|hmm|ah|aha|oops|hurray|alas|bravo");
    }

    //recibe una palabra y devuelve una categoria
    public Token.Categoria clasificar(String palabra) {
        if (esArticulo(palabra))               return Token.Categoria.ARTICULO;
        if (esPosesivo(palabra))               return Token.Categoria.POSESIVO;
        if (esDemostrativo(palabra))           return Token.Categoria.DEMOSTRATIVO;
        if (esPronombre(palabra))              return Token.Categoria.PRONOMBRE;
        if (esVerbo(palabra))                  return Token.Categoria.VERBO;
        if (esAdverbio(palabra))               return Token.Categoria.ADVERBIO;
        if (esPreposicion(palabra))            return Token.Categoria.PREPOSICION;
        if (esConjuncionCoordinante(palabra))  return Token.Categoria.CONJUNCION;
        if (esConjuncionSubordinante(palabra)) return Token.Categoria.CONJUNCION;
        if (esAdjetivo(palabra))               return Token.Categoria.ADJETIVO;
        if (esSustantivo(palabra))             return Token.Categoria.SUSTANTIVO;
        if (esInterjeccion(palabra))           return Token.Categoria.INTERJECCION;
        return null; // No reconocida
    }

    // Devuelve la subcategoría según la categoría detectada
    public String obtenerSubcategoria(String palabra, Token.Categoria categoria) {
        if (categoria == null) return "—";
        switch (categoria) {
            case ARTICULO:     return "Definido/Indefinido";
            case POSESIVO:     return "Posesivo";
            case DEMOSTRATIVO: return "Demostrativo";
            case PRONOMBRE:    return "Personal";
            case VERBO:        return "Conjugado";
            case ADVERBIO:     return detectarSubtipoAdverbio(palabra);
            case CONJUNCION:
                return esConjuncionCoordinante(palabra) ? "Coordinante" : "Subordinante";
            case ADJETIVO:     return "Calificativo";
            case SUSTANTIVO:   return "Común";
            default:           return "—";
        }
    }
}



