package org.example.lexico.diccionario;

import org.example.lexico.Token;

//Diccionario lexico en ingles

public class Diccionarioingles {

    // ── Artículos ──
    public boolean esArticulo(String p) {
        return p.matches("the|a|an");
    }

    // ── Posesivos ──
    public boolean esPosesivo(String p) {
        return p.matches("my|your|his|her|its|our|their");
    }

    // ── Demostrativos ──
    public boolean esDemostrativo(String p) {
        return p.matches("this|that|these|those");
    }

    // ── Pronombres ──
    public boolean esPronombre(String p) {
        return p.matches("i|you|he|she|it|we|they|me|him|her|us|them|" +
                "who|whom|whose|which|what|" +
                "myself|yourself|himself|herself|itself|ourselves|themselves");
    }

    // ── Verbos: auxiliares, modales, regulares e irregulares ──
    public boolean esVerbo(String p) {
        return p.matches(
                // Auxiliares y modales
                "is|are|was|were|be|been|being|am|" +
                        "have|has|had|do|does|did|" +
                        "will|would|shall|should|may|might|can|could|must|" +
                        // Movimiento
                        "run|runs|ran|walk|walks|walked|jump|jumps|jumped|" +
                        "fly|flies|flew|flown|swim|swims|swam|swum|" +
                        "climb|climbs|climbed|drive|drives|drove|driven|" +
                        "ride|rides|rode|ridden|travel|travels|traveled|" +
                        "arrive|arrives|arrived|leave|leaves|left|" +
                        "enter|enters|entered|exit|exits|exited|" +
                        // Comunicación
                        "say|says|said|tell|tells|told|speak|speaks|spoke|spoken|" +
                        "talk|talks|talked|listen|listens|listened|" +
                        "ask|asks|asked|answer|answers|answered|" +
                        "write|writes|wrote|written|read|reads|" +
                        "call|calls|called|shout|shouts|shouted|" +
                        "whisper|whispers|whispered|explain|explains|explained|" +
                        "describe|describes|described|discuss|discusses|discussed|" +
                        "argue|argues|argued|agree|agrees|agreed|" +
                        "disagree|disagrees|disagreed|promise|promises|promised|" +
                        // Cognición
                        "think|thinks|thought|know|knows|knew|known|" +
                        "believe|believes|believed|understand|understands|understood|" +
                        "remember|remembers|remembered|forget|forgets|forgot|forgotten|" +
                        "learn|learns|learned|study|studies|studied|" +
                        "teach|teaches|taught|decide|decides|decided|" +
                        "choose|chooses|chose|chosen|plan|plans|planned|" +
                        "imagine|imagines|imagined|consider|considers|considered|" +
                        "realize|realizes|realized|notice|notices|noticed|" +
                        // Emoción y estado
                        "like|likes|liked|love|loves|loved|hate|hates|hated|" +
                        "want|wants|wanted|need|needs|needed|wish|wishes|wished|" +
                        "feel|feels|felt|enjoy|enjoys|enjoyed|" +
                        "prefer|prefers|preferred|hope|hopes|hoped|" +
                        "fear|fears|feared|worry|worries|worried|" +
                        "smile|smiles|smiled|laugh|laughs|laughed|cry|cries|cried|" +
                        // Acción física
                        "make|makes|made|take|takes|took|taken|" +
                        "give|gives|gave|given|get|gets|got|" +
                        "put|puts|set|sets|let|lets|" +
                        "bring|brings|brought|carry|carries|carried|" +
                        "hold|holds|held|keep|keeps|kept|" +
                        "open|opens|opened|close|closes|closed|" +
                        "push|pushes|pushed|pull|pulls|pulled|" +
                        "lift|lifts|lifted|drop|drops|dropped|" +
                        "throw|throws|threw|thrown|catch|catches|caught|" +
                        "hit|hits|cut|cuts|break|breaks|broke|broken|" +
                        "build|builds|built|fix|fixes|fixed|" +
                        "clean|cleans|cleaned|wash|washes|washed|" +
                        "cook|cooks|cooked|eat|eats|ate|eaten|" +
                        "drink|drinks|drank|drunk|buy|buys|bought|" +
                        "sell|sells|sold|pay|pays|paid|" +
                        "send|sends|sent|receive|receives|received|" +
                        "find|finds|found|lose|loses|lost|" +
                        "show|shows|showed|shown|hide|hides|hid|hidden|" +
                        "help|helps|helped|support|supports|supported|" +
                        "use|uses|used|try|tries|tried|" +
                        "start|starts|started|stop|stops|stopped|" +
                        "finish|finishes|finished|continue|continues|continued|" +
                        "change|changes|changed|move|moves|moved|" +
                        "turn|turns|turned|return|returns|returned|" +
                        "meet|meets|met|visit|visits|visited|" +
                        "join|joins|joined|leave|leaves|left|" +
                        "stay|stays|stayed|live|lives|lived|" +
                        "work|works|worked|play|plays|played|" +
                        "sleep|sleeps|slept|wake|wakes|woke|woken|" +
                        "grow|grows|grew|grown|" +
                        "happen|happens|happened|begin|begins|began|begun|" +
                        "wait|waits|waited|look|looks|looked|" +
                        "see|sees|saw|seen|watch|watches|watched|" +
                        "hear|hears|heard|smell|smells|smelled|" +
                        "touch|touches|touched|pick|picks|picked|" +
                        "create|creates|created|draw|draws|drew|drawn|" +
                        "paint|paints|painted|sing|sings|sang|sung|" +
                        "dance|dances|danced|play|plays|played|" +
                        "win|wins|won|lose|loses|lost|" +
                        "save|saves|saved|protect|protects|protected|" +
                        "share|shares|shared|offer|offers|offered|" +
                        "accept|accepts|accepted|refuse|refuses|refused"
        );
    }

    // ── Adverbios ──
    public boolean esAdverbio(String p) {
        return p.matches(
                // Tiempo
                "now|then|yesterday|today|tomorrow|ago|soon|already|still|" +
                        "early|late|lately|recently|always|never|often|sometimes|" +
                        "rarely|usually|finally|eventually|immediately|suddenly|" +
                        "before|after|again|once|twice|thrice|" +
                        // Lugar
                        "here|there|everywhere|somewhere|nowhere|anywhere|" +
                        "away|back|up|down|out|in|inside|outside|nearby|far|" +
                        "above|below|left|right|forward|backward|" +
                        // Cantidad y grado
                        "very|much|more|most|less|least|quite|almost|enough|" +
                        "too|so|just|only|barely|nearly|approximately|" +
                        "completely|totally|absolutely|entirely|partly|" +
                        // Modo
                        "well|badly|quickly|slowly|carefully|carelessly|" +
                        "easily|hardly|together|instead|otherwise|" +
                        "clearly|quietly|loudly|gently|kindly|" +
                        "happily|sadly|angrily|proudly|bravely|" +
                        "really|truly|actually|generally|probably|" +
                        // Afirmación
                        "certainly|definitely|yes|also|indeed|" +
                        // Negación
                        "never|rarely|nowhere|" +
                        // Duda
                        "perhaps|maybe|possibly|apparently|seemingly"
        );
    }

    public String detectarSubtipoAdverbio(String p) {
        if (p.matches("now|then|yesterday|today|tomorrow|ago|soon|already|still|early|late|" +
                "lately|recently|finally|eventually|immediately|suddenly|before|after|again|once|twice|thrice"))
            return "Tiempo";
        if (p.matches("here|there|everywhere|somewhere|nowhere|anywhere|away|back|up|down|" +
                "out|in|inside|outside|nearby|far|above|below|left|right|forward|backward"))
            return "Lugar";
        if (p.matches("very|much|more|most|less|least|quite|almost|enough|too|so|just|only|" +
                "barely|nearly|approximately|completely|totally|absolutely|entirely|partly"))
            return "Cantidad";
        if (p.matches("well|badly|quickly|slowly|carefully|carelessly|easily|hardly|together|" +
                "instead|otherwise|clearly|quietly|loudly|gently|kindly|happily|sadly|" +
                "angrily|proudly|bravely|really|truly|actually|generally|probably"))
            return "Modo";
        if (p.matches("always|certainly|definitely|yes|also|indeed"))   return "Afirmación";
        if (p.matches("never|rarely|nowhere"))                          return "Negación";
        if (p.matches("perhaps|maybe|possibly|apparently|seemingly"))   return "Duda";
        return "Modo";
    }

    // ── Preposiciones ──
    public boolean esPreposicion(String p) {
        return p.matches(
                "in|on|at|to|for|of|with|by|from|up|about|into|through|" +
                        "during|before|after|above|below|between|among|under|over|" +
                        "near|behind|beside|along|across|around|against|without|" +
                        "within|beyond|toward|towards|despite|except|per|since|" +
                        "until|upon|onto|off|out|inside|outside|throughout|" +
                        "regarding|concerning|including|excluding|alongside"
        );
    }

    // ── Conjunciones coordinantes ──
    public boolean esConjuncionCoordinante(String p) {
        return p.matches("and|but|or|nor|for|yet|so|both|either|neither");
    }

    // ── Conjunciones subordinantes ──
    public boolean esConjuncionSubordinante(String p) {
        return p.matches(
                "because|since|although|though|even though|if|unless|until|" +
                        "when|where|while|that|which|who|whom|whose|as|than|whether|" +
                        "whenever|wherever|however|whatever|whoever|" +
                        "provided|assuming|given|supposing|in case|as long as|" +
                        "so that|in order that|as if|as though"
        );
    }

    // ── Adjetivos ──
    public boolean esAdjetivo(String p) {
        return p.matches(
                // Tamaño
                "big|small|large|tiny|huge|tall|short|long|wide|narrow|deep|thick|thin|" +
                        // Calidad
                        "good|bad|great|poor|excellent|terrible|wonderful|awful|" +
                        "beautiful|ugly|pretty|handsome|lovely|attractive|" +
                        "clean|dirty|neat|messy|tidy|" +
                        // Edad
                        "new|old|young|ancient|modern|recent|" +
                        // Color
                        "white|black|red|blue|green|yellow|orange|purple|brown|gray|pink|golden|silver|" +
                        // Temperatura
                        "hot|cold|warm|cool|freezing|boiling|" +
                        // Emoción
                        "happy|sad|angry|scared|surprised|excited|bored|tired|" +
                        "nervous|calm|proud|ashamed|lonely|confident|" +
                        // Estado
                        "open|closed|full|empty|busy|free|ready|sick|healthy|" +
                        "alive|dead|awake|asleep|lost|found|broken|fixed|" +
                        // Carácter
                        "kind|cruel|brave|coward|honest|dishonest|" +
                        "smart|intelligent|clever|stupid|wise|foolish|" +
                        "funny|serious|gentle|rough|patient|impatient|" +
                        "generous|selfish|polite|rude|friendly|shy|" +
                        // Otros
                        "hard|easy|soft|difficult|simple|complex|" +
                        "fast|slow|strong|weak|light|heavy|" +
                        "right|wrong|true|false|real|fake|" +
                        "important|necessary|possible|impossible|" +
                        "special|common|strange|normal|usual|unusual|" +
                        "first|second|third|last|next|other|same|only|whole"
        );
    }

    // ── Sustantivos ──
    public boolean esSustantivo(String p) {
        return p.matches(
                // Animales
                "cat|dog|bird|fish|horse|cow|sheep|pig|lion|tiger|bear|wolf|fox|" +
                        "rabbit|deer|elephant|monkey|snake|turtle|frog|butterfly|" +
                        "eagle|owl|parrot|penguin|dolphin|whale|shark|" +
                        // Personas y roles
                        "man|woman|boy|girl|child|baby|person|people|" +
                        "teacher|student|doctor|nurse|engineer|lawyer|" +
                        "king|queen|prince|princess|president|" +
                        "mother|father|son|daughter|brother|sister|" +
                        "friend|enemy|neighbor|stranger|hero|" +
                        "artist|musician|writer|actor|athlete|soldier|" +
                        // Lugares
                        "house|home|school|hospital|church|store|market|" +
                        "city|town|village|country|world|" +
                        "street|road|bridge|park|garden|forest|" +
                        "mountain|river|sea|ocean|lake|beach|island|" +
                        "room|kitchen|bedroom|bathroom|office|library|" +
                        "restaurant|hotel|airport|station|" +
                        // Objetos cotidianos
                        "book|pen|pencil|paper|table|chair|door|window|wall|floor|" +
                        "phone|computer|television|camera|radio|" +
                        "car|bus|train|plane|boat|bicycle|" +
                        "bag|box|bottle|cup|plate|spoon|knife|fork|" +
                        "bed|pillow|blanket|mirror|lamp|clock|" +
                        // Naturaleza
                        "sun|moon|star|sky|cloud|rain|snow|wind|fire|water|air|earth|" +
                        "tree|flower|grass|leaf|seed|fruit|vegetable|" +
                        "apple|orange|banana|grape|strawberry|mango|" +
                        "bread|rice|meat|egg|milk|cheese|butter|sugar|salt|" +
                        // Conceptos
                        "time|day|night|morning|afternoon|evening|" +
                        "week|month|year|hour|minute|second|" +
                        "life|death|love|hate|peace|war|truth|lie|" +
                        "idea|thought|dream|memory|story|news|" +
                        "word|sentence|language|name|number|color|" +
                        "music|art|game|sport|dance|song|" +
                        "money|price|work|job|business|" +
                        "food|health|energy|power|light|sound|" +
                        "problem|question|answer|reason|result|" +
                        "way|place|thing|part|group|team|" +
                        "heart|mind|body|hand|eye|face|head|" +
                        "voice|smile|tear|breath|" +
                        // Clima y entorno
                        "weather|temperature|storm|thunder|lightning|" +
                        "building|wall|roof|path|corner|center"
        );
    }

    // ── Interjecciones ──
    public boolean esInterjeccion(String p) {
        return p.matches(
                "oh|wow|hey|hi|hello|bye|goodbye|yes|no|ok|okay|" +
                        "ouch|hmm|ah|aha|oops|hurray|alas|bravo|" +
                        "well|right|sure|really|great|cool|" +
                        "please|thanks|sorry|excuse"
        );
    }

    // ── Reconoce plurales regulares de sustantivos, nuevo manejo de plurales
    public boolean esSustantivoPlural(String p) {
        if (p.endsWith("ies") && esSustantivo(p.substring(0, p.length() - 3) + "y")) return true;
        if (p.endsWith("es")  && esSustantivo(p.substring(0, p.length() - 2)))       return true;
        if (p.endsWith("s")   && esSustantivo(p.substring(0, p.length() - 1)))       return true;
        return false;
    }

    // ── Método principal ──
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
        if (esSustantivoPlural(palabra))       return Token.Categoria.SUSTANTIVO;
        if (esInterjeccion(palabra))           return Token.Categoria.INTERJECCION;
        return null;
    }

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