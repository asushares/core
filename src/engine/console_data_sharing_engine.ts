// Author: Preston Lee

import { Consent, Coding } from "fhir/r5.js";
import { AbstractDataSharingEngine } from "./abstract_data_sharing_engine.js";
import { DataSharingEngineContext } from "../model/engine_context.js";

export class ConsoleDataSharingEngine extends AbstractDataSharingEngine {

    createAuditEvent(consents: Consent[], engineContext: DataSharingEngineContext, outcodeCode: Coding): void {
        console.log('WebDataSharingEngine.createAuditEvent', consents, engineContext, outcodeCode);
    }

}