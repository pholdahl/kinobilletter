package com.example.kinobilletter;

public class Film {
    private int filmid;
    private String film;
    private String filmbilde;
    private String filmtrailer;

    public Film(int filmid, String film, String filmbilde, String filmtrailer) {
        this.filmid = filmid;
        this.film = film;
        this.filmbilde = filmbilde;
        this.filmtrailer = filmtrailer;
    }

    public Film() {

    }

    public int getFilmid() {
        return filmid;
    }

    public void setFilmid(int filmid) {
        this.filmid = filmid;
    }

    public String getFilm() {
        return film;
    }

    public void setFilm(String film) {
        this.film = film;
    }

    public String getFilmbilde() {
        return filmbilde;
    }

    public void setFilmbilde(String filmbilde) {
        this.filmbilde = filmbilde;
    }

    public String getFilmtrailer() {
        return filmtrailer;
    }

    public void setFilmtrailer(String filmtrailer) {
        this.filmtrailer = filmtrailer;
    }
}
