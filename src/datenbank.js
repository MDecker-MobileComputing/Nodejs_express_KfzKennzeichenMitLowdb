/*
 * Nur in dieser Klasse darf auf die Datenbank zugegriffen werden.
 */

import { JSONFilePreset } from 'lowdb/node';
import logging from "logging";

import { UnterscheidungszeichenIntern } from './UnterscheidungszeichenIntern.model.js';


const logger = logging.default("datenbank");

// Datenbank initialisieren
const anfangsDaten =  {

    "B": {
        "bedeutung": "Berlin",
        "kategorie": "B"
    },
    "BA": {
        "bedeutung": "Bamberg",
        "kategorie": "BY"
    },
    "BAD": {
        "bedeutung": "Baden-Baden",
        "kategorie": "BW"
    },
    "KA": {
        "bedeutung": "Karlsruhe",
        "kategorie": "BW"
    },
    "HD": {
        "bedeutung": "Heidelberg",
        "kategorie": "BW"
    },
    "X": {
        "bedeutung": "Nato",
        "kategorie": "MIL"
    },
    "Y": {
        "bedeutung": "Bundeswehr",
        "kategorie": "MIL"
    }
};

const dbDatei = "db.json";
const db      = await JSONFilePreset(dbDatei, anfangsDaten);

const anzahlDatensaetze = Object.keys( db.data ).length;
logger.info(`Datenbank \"${dbDatei}\" geladen mit ${anzahlDatensaetze} Datensätzen.`);


/**
 *
 * @param {string} suchString Such-String für Unterscheidungszeichen (z.B. "KA"), muss
 *                            schon normalisiert sein
 * @returns
 */
function suche(suchString) {

    return db.data[ suchString ];
}

/*
 * Funktionen als Attribute von Objekt `datenbank` exportieren
 */
export const datenbank = {

    suche
};