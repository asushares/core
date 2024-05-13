// Author: Preston Lee

import { ConsentExtension } from "../../model/consent_extension";
import { ConsentDecision } from "../../model/consent_decision";

export abstract class Card {
    // abstract summary: 'CONSENT_PERMIT' | 'CONSENT_DENY' | 'NO_CONSENT';// = 'NO_CONSENT';
    abstract summary: ConsentDecision;
    abstract detail: string;
    abstract indicator: string;
    source: { label: string, url: string } = {
        label: process.env.ORG_NAME!,
        url: process.env.ORG_URL!
    };
    public extension: ConsentExtension = new ConsentExtension(null);

}