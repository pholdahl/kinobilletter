// Onready funksjon som:
// - Henter filmer fra databsen
// - Henter billetter hvis det finnes noen registrert i databasen
// - Sjekker om brukeren er logget inn ved refresh av siden
$(()=> {
    hentFilmer();
    hentAlleBilletter();
    sjekkInnlogging();
    regAdmin();
});

// registrerer en adminbruker
const regAdmin = () => {
    const admin = {
        brukernavn: "admin",
        passord: "1234"
    }
    $.post("/regBruker", admin)
}

// En tom variabel til å lagre filmdata fra server.
let filmer;

// Async funksjon for å sjekke om brukeren er logget inn når siden lastes inn på nytt.
async function sjekkInnlogging() {
    try {
        const innlogget = await sjekkSession();
        await loggutMeny(innlogget);
    } catch(err) {
        // console.log("logg inn: " + err);
    }
}

// Funksjon som henter filmene fra databasen
const hentFilmer = () => {
    $.get("/hentFilmer", filmdata => {
        filmer = filmdata;
        filmListe(filmdata);
    }).fail(jqXHR => {
        const json = $.parseJSON(jqXHR.responseText);
        $("#kjøp").after().empty();
        $("#kjøp").after(`<span class="feil" style="color: red;">${json.message}</span>`);
        reject(false);
    });
}

// Funksjon som formatterer filmene som options og legger dette inn i en SELECT liste.
const filmListe = filmer => {
    let filmliste = `<option disabled selected value> -- Velg en Film -- </option>`;
    for(let i = 0; i < filmer.length; i++){
        filmliste += `<option value="${filmer[i].filmid}">${filmer[i].film}</option>`;
    }
    $("#film").append(filmliste);
}

// Funksjon som endrer bakgrunn ut i fra hvilken film en velger, og starter en trailervideo av den valgte filmen
const endreFilm = () => {
    let videoplayer = $("#videoplayer");
    let filmValg = $("#film").val();
    let body = $("#background");
    let video = "";
    for (let i = 0; i < filmer.length; i++){
        if(filmValg == i+1){
            body.css("background-image", `url(${filmer[i].filmbilde})`);
            video += `<iframe class="embed-responsive-item" src="${filmer[i].filmtrailer}?autoplay=1&mute=1"
                              title="${filmer[i].film}" frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen></iframe>`;
        }
    }
    videoplayer.removeClass("noshow");
    videoplayer.empty();
    videoplayer.append(video);
}

// Funksjon som henter alle billettene
const hentAlleBilletter = () => {
    $.get("/hentBilletter", billetter => {
        this.billetter = billetter;
        formatterBilletter(this.billetter);
    }).fail(jqXHR => {
        const json = $.parseJSON(jqXHR.responseText);
        $("#kjøp").after(`<span class="feil" style="color: red;">${json.message}</span>`);
    });
}

// Funksjon som formatterer billettobjektene inn i en tabell og printer den ut
const formatterBilletter = (billetter) => {
    let billettRegister = $("#utskriftContainer");
    billettRegister.html("");
    let filmnr;
    let html = "";
    if (billetter.length > 0){
        html =
            `<table class="table table-sm table-striped table-dark utskrift table-bordered w-auto fs-6">
            <thead class="thead-dark fs-6">
                <tr>
                    <th>Film</th><th>Antall</th><th>Fornavn</th><th>Etternavn</th><th>Telefonnr</th><th>Epost</th>
                </tr>
            </thead>
            <tbody class="utskrift fs-6">`;
        for (let i = 0; i < billetter.length; i++) {
            filmnr = billetter[i].film;
            html += `<tr>
                        <td>${billetter[i].film}</td>
                        <td>${billetter[i].antall}</td>
                        <td>${billetter[i].fornavn}</td>
                        <td>${billetter[i].etternavn}</td>
                        <td>${billetter[i].telefonnr}</td>
                        <td>${billetter[i].epost}</td>
                    </tr>`
        }
        html += `</tbody>
            </table>`;
    }
    billettRegister.html(html);
}

// Inputvalidering av tomme felt, som sletter feilmeldinger før den legger ut nye feilmeldinger.
const inputValidering = () => {
    let inputs = $(".input");
    let feil =  $(".feil");
    if (feil.length > 0){
        feil.parent().children(".feil").remove();
    }
    let antallFeil = 0;
    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].value === ""){
            let feilmelding = `<span class='feil' style='color: red'> &nbsp Må skrive noe inn i ${inputs[i].id}</span>`;
            inputs.eq(i).parent().children(":nth-child(1)").append(feilmelding);
            antallFeil ++;
        }
    }
    return antallFeil === 0;
}


// Inputvalidering for korrekt skriving i inputs.
const valideringRettskriving = (film, antall, fornavn, etternavn, telefonnr, epost) => {
    let antallFeil = 0;
    const regexpNavn = /^[a-zæøåA-ZÆØÅ. \-]{2,20}/;
    const regexpTall = /^[0-9]{1,2}/;
    const regexpAntall = /\b([0-9]|1[0-9]|2[0])\b/;
    const regexpTelefon = /^[0-9]{8}/;
    const regexpEpost = /^(?=.*@)(?=.*[.])[0-9a-zæøåA-ZÆØÅ.@_ \-]{2,50}/;
    let html = "<span class='feil' style='color: red;'>";
    if (film === null) {
        $("#film").parent().children(":nth-child(1)").append(html + " &nbsp Velg en film</span>");
        antallFeil ++;
    }
    if ((!regexpAntall.test(antall)) && (regexpTall.test(antall))) {
        $("#antall").parent().children(":nth-child(1)").append(html + " &nbsp Feil antall</span>");
        alert("Skal du bestille mer enn 20 billetter, kontakt kundeservice.");
        antallFeil ++;
    }
    if (isNaN(antall) || antall <= 0) {
        $("#antall").parent().children(":nth-child(1)").append(html + " &nbsp Feil antall</span>");
        antallFeil ++;
    }
    if ((!regexpNavn.test(fornavn)) && (fornavn !== "")) {
        $("#fornavn").parent().children(":nth-child(1)").append(html + " &nbsp Det kan ikke være tall i fornavnet</span>");
        antallFeil ++;
    }
    if ((!regexpNavn.test(etternavn)) && (etternavn !== "")) {
        $("#etternavn").parent().children(":nth-child(1)").append(html + " &nbsp Det kan ikke være tall i et etternavnet</span>");
        antallFeil ++;
    }
    if ((!regexpTelefon.test(telefonnr)) && (telefonnr !== "")) {
        $("#telefonnr").parent().children(":nth-child(1)").append(html + " &nbsp Telefonnr må skrives med tall, 8 siffer langt</span>");
        antallFeil ++;
    }
    if ((!regexpEpost.test(epost)) && (epost !== "")) {
        $("#epost").parent().children(":nth-child(1)").append(html + " &nbsp E-post mangler . og/eller @</span>");
        antallFeil ++;
    }
    return antallFeil === 0;
}


// Funksjon som henter inputs, sjekker validering, lager et objekt som sender dette til en registrerings funksjon.
const billettInput = () => {
    let film = $("#film").val();
    let antall = $("#antall").val();
    let fornavn = $("#fornavn").val();
    let etternavn = $("#etternavn").val();
    let telefonnr = $("#telefonnr").val();
    let epost = $("#epost").val();
    let tommeFeltCheck = inputValidering();
    let rettSkriveCheck = valideringRettskriving(film, antall, fornavn, etternavn, telefonnr, epost);
    if (tommeFeltCheck === true && rettSkriveCheck === true) {
        const billett = {
            film: film,
            antall: antall,
            fornavn: fornavn,
            etternavn: etternavn,
            telefonnr: telefonnr,
            epost: epost
        };
        regBillett(billett);
    }
}

// Funksjon som registrerer billett til server, som kaller på hentbillett funksjonen og deretter refresher siden.
const regBillett = (billett) => {
    $.post("/regBillett", billett, () => {
        window.location.href = "/";
    }).fail(jqXHR => {
        const json = $.parseJSON(jqXHR.responseText);
        $("#kjøp").after().empty();
        $("#kjøp").after(`<span class="feil" style="color: red;">${json.message}</span>`);
    });
}

// Funksjon som henter fram innlogging menyen, hvis brukeren er logget ut.
const innlogging = () => {
    let html = `<form id="innlogging" action="javascript:void(0)" class="row">
                    <ol>
                        <li class="form-group">
                            <label for="brukernavn">Brukernavn</label>
                            <input class="form-control form-control-sm input" id="brukernavn" type="text">
                        </li>
                        <li class="form-group">
                            <label for="passord">Passord</label>
                            <input class="form-control form-control-sm input" id="passord" type="text">
                        </li>
                        <li class="form-group">
                            <button class="btn btn-dark form-control form-control-sm button" onclick="logginnSjekk()">Logg inn</button>                        
                        </li>
                        <li class="form-group">
                            <button class="btn btn-outline-light form-control form-control-sm button" onclick="registrerBruker()">Registrer</button>                        
                        </li>
                    </ol>
                </form>`
    $(".innlogging").empty();
    $(".innlogging").append(html);
}

// Registrerer nye brukere
const registrerBruker = () => {
    let brukernavn = $("#brukernavn").val();
    let passord = $("#passord").val();
    const bruker = {
        brukernavn: brukernavn,
        passord: passord
    }
    $.post("/regBruker", bruker, (sjekk) => {
        if(sjekk) {
            innlogging();
            $(".innlogging").append(`<span class="feil" style="color: green; text-align: center;">Ny bruker registrert</span>`);
        } else {
            innlogging();
            $(".innlogging").append(`<span class="feil" style="color: red;">Brukernavn er opptatt</span>`);
        }
    })

}

// Funksjon som bruker regexp for å sjekke brukernavn og passord, uten de helt store begrensingene.
const valideringBrukerPassord = (brukernavn, passord) =>{
    const regexpBrukerPassord = /^[0-9a-zæøåA-ZÆØÅ. \-]{2,20}/;
    if(regexpBrukerPassord.test(brukernavn) && regexpBrukerPassord.test(passord)){
        return true;
    } else {
        return false;
    }

}

// Funksjon som validerer brukernavn og passord før det sendes til server
const logginnSjekk = () => {
    let brukernavn = $("#brukernavn").val();
    let passord = $("#passord").val();

    if (valideringBrukerPassord(brukernavn, passord)){
        const bruker = {
            brukernavn: brukernavn,
            passord: passord
        }
        $.get("/logginn", bruker, (sjekk) => {
            if(sjekk) {
                let html = `<ol>
                        <li class="form-group">
                            <button class="btn btn-dark form-control form-control-sm button" onclick="loggut()">Logg ut</button>
                        </li>
                    </ol>`;
                $(".innlogging").empty();
                $(".innlogging").append(html);

            } else {
                let html = `<span class="feil" style="color: red;">Feil brukernavn og/eller passord</span>`
                $(".innlogging").append(html);
            }
        }).fail(jqXHR => {
            const json = $.parseJSON(jqXHR.responseText);
            $("#kjøp").after().empty();
            $("#kjøp").after(`<span class="feil" style="color: red;">${json.message}</span>`);
        })} else {
        let html = `<span class="feil" style="color: red;">Feil brukernavn og/eller passord</span>`
        $(".innlogging").append(html);
    }
}

// Funksjon som logger ut brukeren når logg ut knappen trykkes
const loggut = () => {
    $.get("/loggut", () => {
        window.location.href="/";
    })
}

// Funksjon som sjekker om brukeren er logget inn
const sjekkSession = () => {
    return new Promise((resolve) => {
        $.get("/sjekkLogginn", sjekk => {
            resolve(sjekk);
        });
    });
}

// Funksjon som viser utloggingsknapp hvis brukeren er logget inn.
const loggutMeny = (innlogget) => {
    return new Promise((resolve, reject) => {
        if (innlogget) {
            let html = `<ol>
                            <li class="form-group">
                                <button class="btn btn-dark form-control form-control-sm button" onclick="loggut()">Logg ut</button>
                            </li>
                        </ol>`;
            $(".innlogging").empty();
            $(".innlogging").append(html);
            resolve(true);
        } else {
            reject(false);
        }
    });
}

// Async funksjon som kjører en sjekk på innlogging og sletter billettene hvis brukeren er logget inn
async function slettBilletter() {
    try {
        const innlogget = await sjekkSession();
        await slettSjekk(innlogget);
    } catch(err){
        console.log("logg inn: " + err);
    }
}

// Funksjon som responderer på om brukeren er logget inn når han trykker på sletteknappen
// Hvis brukeren ikke er logget inn, kommer en beskjed om at brukeren må logge inn for å kunne slette billetter.
const slettSjekk = (innlogget) => {
    return new Promise((resolve, reject) => {
        if(innlogget){
            $.get("/slettBilletter", () => {
                window.location.href = "/";
                resolve(true);
            }).fail(jqXHR => {
                const json = $.parseJSON(jqXHR.responseText);
                $("#kjøp").after().empty();
                $("#kjøp").after(`<span class="feil" style="color: red;">${json.message}</span>`);
            });
        } else {
            window.confirm("Du må være logget inn for å kunne slette alle billettene.");
            reject(false);
        }
    })
}
