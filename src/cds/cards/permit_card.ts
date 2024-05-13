// Author: Preston Lee

import { Card } from "./card"
import { ConsentDecision } from "../../model/consent_decision";

export class PermitCard extends Card {
    summary: ConsentDecision = ConsentDecision.CONSENT_PERMIT;
    detail = "There is a consent permitting this action.";
    indicator = "info";

    constructor() {
        super();
        this.extension.decision =  ConsentDecision.CONSENT_PERMIT;
    }


};