// Author: Preston Lee

import { Bundle, FhirResource } from "fhir/r5.js";
import { ConsentDecision } from "./consent_decision.js";

export class ConsentExtension {

    decision: ConsentDecision = ConsentDecision.NO_CONSENT;
    obligations: { id: { system: string, code: string }, parameters: { codes: Array<{ system: string, code: string }> } }[] = [];
    content: Bundle<FhirResource> | null = null;
    basedOn: string = '';

    constructor(requestContent: Bundle | null) {
        if (requestContent) {
            this.content = structuredClone(requestContent)
        }
    }
}