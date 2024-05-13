// Author: Preston Lee

import { Card } from "./card"
import { ConsentDecision } from "../../model/consent_decision";

export class DenyCard extends Card {
    summary: ConsentDecision = ConsentDecision.CONSENT_DENY;
    detail = "There is a consent denying this action.";
    indicator = "warning";

    constructor() {
        super();
        if (this.extension) {
            this.extension.decision = this.summary;
        }
    }
};