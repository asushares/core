// Author: Preston Lee

import { Card } from "./card.js"
import { ConsentDecision } from "../../model/consent_decision.js";

export class DenyCard extends Card {
    summary: ConsentDecision = ConsentDecision.CONSENT_DENY;
    detail = "There is a consent denying this action.";
    indicator = "warning";

    constructor() {
        super();
        this.extension.decision =  ConsentDecision.CONSENT_DENY;
    }

};