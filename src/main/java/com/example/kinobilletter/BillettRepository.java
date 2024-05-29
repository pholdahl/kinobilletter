package com.example.kinobilletter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.sql.PreparedStatement;
import java.util.Comparator;
import java.util.List;

@Repository
public class BillettRepository {

    @Autowired
    private JdbcTemplate db;

    private Logger logger = LoggerFactory.getLogger(BillettRepository.class);

    // Lager krypterte passord
    private String krypterPassord(String passord){
        return BCrypt.hashpw(passord, BCrypt.gensalt(10));
    }

    // Sjekker krypterte passord
    private boolean sjekkPassord(String passord, String hashPassord) {
        return BCrypt.checkpw(passord, hashPassord);
    }

    // Lagrer biletter til databasen, passer også på at hvis kunden har registrert kjøp før,
    // så dobbeltlagres ikke kundeinformasjonen
    @Transactional
    public boolean lagreBillett(Billett billett){
        int kid;
        int eid = 0;
        Object[] param = new Object[]{billett.getTelefonnr()};
        String sql1 = "SELECT kid FROM Kunde WHERE telefonnr=?";
        String sql2 = "INSERT INTO Kunde (fornavn, etternavn, telefonnr, epost) " +
                "VALUES(?, ?, ?, ?)";
        String sql3 = "INSERT INTO Billettdata (film, antall, kid)" +
                "VALUES(?, ?, ?)";
        KeyHolder id = new GeneratedKeyHolder();
        try {
            try {
                eid = db.queryForObject(sql1, param, Integer.class);
                System.out.println(eid);
            } catch(Exception e){
                System.out.println("EmptyResult ");
            }
            if(eid == 0){
                db.update(con -> {
                    PreparedStatement par = con.prepareStatement(sql2, new String[]{"kid"});
                    par.setString(1, billett.getFornavn());
                    par.setString(2, billett.getEtternavn());
                    par.setString(3, billett.getTelefonnr());
                    par.setString(4, billett.getEpost());
                    return par;
                }, id);
                kid = id.getKey().intValue();
            } else {
                kid = eid;
            }
            db.update(sql3, billett.getFilm(), billett.getAntall(), kid);
            return true;
        } catch(Exception e){
            logger.error("Feil i lagreBillett " + e);
        }
        return false;
    }

    // Henter billetter fra databasen
    public List<Billett> hentBilletter(){
        String sql = "SELECT b.billnr, f.film, b.antall, k.fornavn, k.etternavn, k.telefonnr, k.epost" +
                " FROM Billettdata AS b, Filmer AS f, Kunde AS k" +
                " WHERE k.kid = b.kid AND f.filmid = b.film";
        try {
            List<Billett> billetter = db.query(sql, new BeanPropertyRowMapper<>(Billett.class));
            billetter.sort(Comparator.comparing(Billett::getEtternavn));
            return billetter;
        } catch(Exception e){
            logger.error("Feil i hentBilletter " + e);
            return null;
        }
    }

    // Sletter data fra databasen
    public boolean slettBilletter(){
        String sql1 = "DELETE FROM Billettdata";
        String sql2 = "DELETE FROM Kunde";
        try {
            db.update(sql1);
            db.update(sql2);
            return true;
        } catch(Exception e){
            logger.error("Feil i slettBilletter " + e);
            return false;
        }
    }

    // Henter filmer fra databasen
    public List<Film> hentFilmer(){
        String sql = "SELECT * FROM Filmer";
        try {
            return db.query(sql, new BeanPropertyRowMapper<>(Film.class));
        } catch(Exception e){
            logger.error("Feil i hentFilmer " + e);
            return null;
        }
    }

    // Sjekker om brukeren eksisterer i databasen
    public boolean sjekkBruker(Bruker bruker){
        Object[] param = new Object[]{bruker.getBrukernavn()};
        String sql = "SELECT COUNT(*) FROM Brukere WHERE brukernavn =?";
        try {
            int antall = db.queryForObject(sql, param, Integer.class);
            if (antall > 0){
                return true;
            }
            return false;
        } catch(Exception e) {
            logger.error("Feil i sjekkInnlogging " + e);
            return false;
        }
    }

    // Sjekker om brukeren og passordet ligger i databasen
    public boolean sjekkBrukerPassord(Bruker bruker){
        String sql = "SELECT * FROM Brukere WHERE brukernavn =?";
        try {
            Bruker dbBruker = db.queryForObject(sql,
                    BeanPropertyRowMapper.newInstance(Bruker.class), new Object[]{bruker.getBrukernavn()});
            return sjekkPassord(bruker.getPassord(), dbBruker.getPassord());
        } catch (Exception e) {
            logger.error("Feil i sjekkBrukerOgPassord");
            return false;
        }
    }

    // Registrerer bruker hvis bruker ikke eksisterer fra før av
    public boolean regBruker(Bruker bruker) {
        String sql = "INSERT INTO Brukere(brukernavn, passord) " +
                "VALUES(?, ?)";
        String hashPass = krypterPassord(bruker.getPassord());
        try {
            if (sjekkBruker(bruker)) {
                return false;
            } else {
                db.update(sql, bruker.getBrukernavn(), hashPass);
                return true;
            }
        } catch(Exception e){
            logger.error("Feil i regBruker", e);
            return false;
        }
    }

}