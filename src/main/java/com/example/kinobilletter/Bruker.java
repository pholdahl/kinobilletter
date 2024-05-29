package com.example.kinobilletter;

public class Bruker {

    private String brukernavn;
    private String passord;

    public Bruker(String brukernavn, String passord){
        this.brukernavn = brukernavn;
        this.passord = passord;
    }

    public Bruker(){

    }

    public String getBrukernavn() {
        return brukernavn;
    }

    public void setBrukernavn(String brukernavn) {
        this.brukernavn = brukernavn;
    }

    public String getPassord() {
        return passord;
    }

    public void setPassord(String passord) {
        this.passord = passord;
    }
}
