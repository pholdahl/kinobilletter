CREATE TABLE Kunde
(
    kid INTEGER AUTO_INCREMENT NOT NULL,
    fornavn VARCHAR(30) NOT NULL,
    etternavn VARCHAR(30) NOT NULL,
    telefonnr VARCHAR(8) NOT NULL,
    epost VARCHAR(50) NOT NULL,
    PRIMARY KEY(kid)
);

CREATE TABLE Filmer
(
    filmid INTEGER AUTO_INCREMENT NOT NULL,
    film VARCHAR(255) NOT NULL,
    filmbilde VARCHAR(255) NOT NULL,
    filmtrailer VARCHAR(255) NOT NULL,
    PRIMARY KEY(filmid)
);

CREATE TABLE Billettdata
(
    billnr INTEGER AUTO_INCREMENT NOT NULL,
    film INTEGER NOT NULL,
    antall INTEGER NOT NULL,
    kid INTEGER NOT NULL,
    PRIMARY KEY(billnr),
    FOREIGN KEY(film) REFERENCES Filmer(filmid),
    FOREIGN KEY(kid) REFERENCES Kunde(kid)
);

CREATE TABLE Brukere
(
    bid INTEGER AUTO_INCREMENT NOT NULL,
    brukernavn VARCHAR(20) NOT NULL,
    passord VARCHAR(255) NOT NULL,
    PRIMARY KEY(bid)
);