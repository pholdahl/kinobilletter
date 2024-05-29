package com.example.kinobilletter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.util.List;


@RestController
public class KinoBillettController {

    private final String FEILMELDING = "Feil i database - prøv igjen senere.";

    private Logger logger = LoggerFactory.getLogger(KinoBillettController.class);

    @Autowired
    private BillettRepository rep;

    @Autowired
    private HttpSession session;

    // Funksjon for innloggingsvalidering
    private boolean valideringBrukerPassord(Bruker bruker) {
        String regexBrukernavnPassord = "[0-9a-zæøåA-ZÆØÅ. \\-]{2,20}";
        boolean brukernavnOK = bruker.getBrukernavn().matches(regexBrukernavnPassord);
        boolean passordOK = bruker.getPassord().matches(regexBrukernavnPassord);
        if(brukernavnOK && passordOK){
            return true;
        }
        logger.error("Feil med validering");
        return false;
    }

    // Funksjon for inputvalidering som matcher inputvalideringen på klientsiden
    private boolean valideringInput(Billett billett){
        String regexTall = "[0-9]{1,2}";
        String regexAntall = "\\b([0-9]|1[0-9]|2[0])\\b";
        String regexNavn = "[a-zæøåéA-ZÆØÅÉ. \\-]{2,20}";
        String regexTelefon = "[0-9]{8}";
        String regexEpost = "(?=.*@)(?=.*[.])[0-9a-zæøåA-ZÆØÅ.@_ \\-]{2,50}";
        boolean filmOK = billett.getFilm().matches(regexTall);
        boolean tallOK = billett.getAntall().matches(regexTall);
        boolean antallOK = billett.getAntall().matches(regexAntall);
        boolean fornavnOK = billett.getFornavn().matches(regexNavn);
        boolean etternavnOK = billett.getEtternavn().matches(regexNavn);
        boolean telefonOK = billett.getTelefonnr().matches(regexTelefon);
        boolean epostOK = billett.getEpost().matches(regexEpost);
        if(fornavnOK && etternavnOK && telefonOK && epostOK && tallOK && antallOK && filmOK){
            return true;
        }
        logger.error("Feil med validering");
        return false;
    }

    // Funksjon for å registrere billetter
    @PostMapping("/regBillett")
    private void billettRegistrering(Billett billett, HttpServletResponse response) throws IOException {
        if(!valideringInput(billett)) {
            response.sendError(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Feil i valideringen - prøv igjen senere.");
        } else {
            if(!rep.lagreBillett(billett)) {
                response.sendError(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        FEILMELDING);
            }
        }
    }

    // Funksjon for å hente alle billettene fra databasen
    @GetMapping("/hentBilletter")
    private List<Billett> hentBilletter(HttpServletResponse response) throws IOException{
        if(rep.hentBilletter() == null){
            response.sendError(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    FEILMELDING);
        }
        return rep.hentBilletter();
    }

    // Funksjon for å slette alle billettene fra databasen
    @GetMapping("/slettBilletter")
    private void slettBilletter(HttpServletResponse response) throws IOException {
        if(!rep.slettBilletter()){
            response.sendError(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    FEILMELDING);
        }
    }

    // Funksjon for å hente ut filmer fra databasen
    @GetMapping("/hentFilmer")
    private List<Film> hentFilmer(HttpServletResponse response) throws IOException {
        if(rep.hentFilmer() == null){
            response.sendError(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    FEILMELDING);
        }
        return rep.hentFilmer();
    }

    // Funksjon for å logge inn brukere
    @GetMapping("/logginn")
    public boolean login(Bruker bruker){
        if (valideringBrukerPassord(bruker)) {
            if(rep.sjekkBrukerPassord(bruker)){
                session.setAttribute("Innlogget", bruker);
                return true;
            }
        }
        return false;
    }

    // Funksjon for å sjekke om brukeren er logget inn
    @GetMapping("/sjekkLogginn")
    public boolean sjekkLogginn(){
        if(session.getAttribute("Innlogget") != null){
            return true;
        }
        return false;
    }

    // Funksjon for å logge ut
    @GetMapping("/loggut")
    public void logout(){
        session.removeAttribute("Innlogget");
    }

    // Funksjon for å registrere nye brukere
    @PostMapping("/regBruker")
    public boolean regBruker(Bruker bruker){
        if(!rep.regBruker(bruker)){
            return false;
        }
        return true;
    }

}