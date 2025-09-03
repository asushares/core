// Author: Preston Lee

import { Bundle, Consent } from "fhir/r5.js";
import { SystemValue, SystemCode } from "../cds/data_sharing_cds_hook_request.js";

export class DataSharingEngineContext {

    public static HEADER_CDS_REDACTION_ENABLED = 'CDS-Redaction-Enabled';
    public static HEADER_CDS_CREATE_AUDIT_EVENT_ENABLED = 'CDS-Create-Audit-Event';
    public static HEADER_CDS_CONFIDENCE_THRESHOLD = 'CDS-Confidence-Threshold';
    public static HEADER_CDS_RULES_FILE = 'CDS-Rules-File';

    /** Identifiers of the actor */
    actor: SystemValue[] = [];

    purposeOfUse?: string[] | string = [];

    /**
     * Categories of applicable consents to the workflow context
     */
    category?: SystemCode[] = [];
    /**
     * Identity of the patient whose consent is being considered
     */
    patientId: SystemValue[] = [];

    /**
     * Content classes being requested
     */
    class?: SystemCode[] = [];

    /**
     * FHIR data to be evaluated.
     */
    content?: Bundle;

    /**
     * Optional Consent directives to use in leui of any that may be retrieved by, or known to, the engine.
     */
    consent?: Consent[] = [];

}
