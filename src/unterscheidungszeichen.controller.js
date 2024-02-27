/**
 * Diese Controller-Klasse enthält die REST-Endpunkte für die Collection "Unterscheidungszeichen".
 */

import logging          from "logging";
import { uzService }    from "./unterscheidungszeichen.service.js";
import { uzPostMiddlewareArray } from "./middleware/unterscheidungszeichen.middleware.js";

import { UnterscheidungszeichenIntern } from './model/UnterscheidungszeichenIntern.model.js';
import { RestErgebnis }                 from './model/RestErgebnis.model.js';


export const logger = logging.default("uz-controller");

/** Anfangs-String für alle Routen, mit Versionsnummer. */
const prefixFuerRouten = "/kfzkennzeichen/v1";


/**
 * Routen für einzelne REST-Endpunkte registrieren.
 *
 * @param {*} Express-App-Objekt
 */
export default function uzRoutenRegistrieren(app) {

    const uzCollection = "unterscheidungszeichen";

    const routeSuche = `${prefixFuerRouten}/${uzCollection}/:id`;
    app.get( routeSuche, suchen );
    logger.info(`Route registriert: GET  ${routeSuche}`);

    const routeNeu = `${prefixFuerRouten}/${uzCollection}`;
    app.post( routeNeu, uzPostMiddlewareArray, neu );
    logger.info(`Route registriert: POST ${routeNeu}`);
};

// Leeres Unterscheidungszeichen-Objekt für Fehlerfälle
const uzInternLeer = new UnterscheidungszeichenIntern( "", "", "" );


const HTTP_STATUS_CODE_OK          = 200;
const HTTP_STATUS_CODE_NOT_FOUND   = 404;
const HTTP_STATUS_CODE_BAD_REQUEST = 400;
const HTTP_STATUS_CODE_CONFLICT    = 409;


/**
 * REST-Endpunkt zur Abfrage von Unterscheidungszeichen.
 *
 * @param {*} req Request-Objekt, zum Auslesen von Pfad-Parameter mit
 *                Unterscheidungszeichen, das abgefragt werden soll.
 *
 * @param {*} res Response-Objekt in das HTTP-Status-Code und Payload
 *                (Body) geschrieben werden.
 */
async function suchen(req, res) {

    const pfadParameter = req.params.id;
    const suchString    = pfadParameter.toUpperCase().trim();

    if (suchString.length > 3) {

        const ergebnisErfolglos = new RestErgebnis( false,
                                                    `Unterscheidungszeichen \"${suchString}\" zu lang!`,
                                                    uzInternLeer );
        res.status(HTTP_STATUS_CODE_BAD_REQUEST)
           .send(ergebnisErfolglos);

        return;
    }

    const result = uzService.suchen( suchString ); // *** eigentliche Suche ***

    if (result === null) {

        const ergebnisErfolglos = new RestErgebnis( false,
                                                    `Unterscheidungszeichen \"${suchString}\" nicht gefunden.`,
                                                    uzInternLeer );
        res.send(ergebnisErfolglos)
           .status(HTTP_STATUS_CODE_NOT_FOUND);

    } else {

        const ergebnisErfolg = new RestErgebnis( true,
                                                 `Unterscheidungszeichen "${pfadParameter}" konnte aufgelöst werden.`,
                                                 result );
        res.status(HTTP_STATUS_CODE_OK)
           .send(ergebnisErfolg);
    }
}



/**
 * REST-Endpunkt zum Anlegen eines neuen Unterscheidungszeichens.
 * Wegen der vorgeschalteten Middleware-Funktion `middlewareNeuValidator`
 * können wir davon ausgehen, dass die Pflichtattribute im Request
 * mit zulässigen Werten gefüllten sind.
 *
 * @param {*} req Request-Objekt, zum Auslesen des Bodys (JSON) mit
 *                den drei Attributen des neuen Unterscheidungszeichen:
 *                - `unterscheidungszeichen`
 *                - `bedeutung`
 *                - `kategorie`
 *
 * @param {*} res Response-Objekt in das HTTP-Status-Code geschrieben wird.
 */
async function neu(req, res) {

    const uzNormalized        = req.body.unterscheidungszeichen;
    const bedeutungNormalized = req.body.bedeutung;
    const kategorieNormalized = req.body.kategorie;

    const neuesUz = new UnterscheidungszeichenIntern( uzNormalized,
                                                      bedeutungNormalized,
                                                      kategorieNormalized );

    const warErfolgreich = await uzService.anlegen(neuesUz); // *** eigentliches Erzeugen ***

    if (warErfolgreich) {

        const ergebnisErfolg = new RestErgebnis( true,
                                                 `Unterscheidungszeichen "${uzNormalized}" erfolgreich angelegt.`,
                                                 neuesUz );
        res.status(HTTP_STATUS_CODE_OK)
           .send(ergebnisErfolg);

    } else {

        const ergebnisErfolglos = new RestErgebnis( false,
                                                    `Unterscheidungszeichen "${uzNormalized}" war schon vorhanden.`,
                                                    uzInternLeer );
        res.status(HTTP_STATUS_CODE_CONFLICT)
           .send(ergebnisErfolglos);
    }
}
