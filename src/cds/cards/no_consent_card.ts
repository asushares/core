// Author: Preston Lee

import { Card } from "./card.js"
import { ConsentDecision } from "../../model/consent_decision.js";

export class NoConsentCard extends Card {

    summary: ConsentDecision = ConsentDecision.NO_CONSENT;
    detail = "No applicable consent was found.";
    indicator = "warning";
    
    constructor() {
        super();
        this.extension.decision =  ConsentDecision.NO_CONSENT;
    }

}