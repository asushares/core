// Author: Preston Lee

import { AbstractSensitivityRuleProvider, Card, ConsentCategorySettings, ConsentDecision, ConsentExtension, ConsoleDataSharingEngine, DataSharingCDSHookRequest, DataSharingEngineContext, DenyCard, DummyRuleProvider, PermitCard } from "@asushares/core";
import { SimulatorInput } from "./simulator_input";
import { Bundle, FhirResource, Resource } from "fhir/r5";
import axios from "axios";
import { AbstractSimulator } from "./abstract_simulator";

export class HeadlessSimulatorCds extends AbstractSimulator{

    public labeledResources: FhirResource[] = [];
    public consentDecisions: { [key: string]: Card } = {};

    constructor(public input: SimulatorInput, public cdsBaseUrl: string, public redactionEnabled: boolean, public threshold: string) {
        super(input);
    }

    reset() {
        this.labeledResources = [];
    }

    simulate() {
        return this.recomputeLabels().then(() => {
            this.recomputeConsentDecisions();
        });
    }

    recomputeLabels() {
        let patientId = this.input.consent?.subject?.reference || ('Patient/' + this.input.consent?.subject?.id);
        const data = new DataSharingCDSHookRequest();
        data.context.patientId = [{ value: patientId }];
        data.context.content = this.input.bundle;
        const headers: { [key: string]: string } = {};
        headers[DataSharingEngineContext.HEADER_CDS_REDACTION_ENABLED] = this.redactionEnabled.toString();
        headers[DataSharingEngineContext.HEADER_CDS_CONFIDENCE_THRESHOLD] = this.threshold;
        const url = this.cdsBaseUrl + '/cds-services/' + (new DataSharingCDSHookRequest().hook);
        console.log('Invoking remote CDS labeling service at:', url);
        // console.debug('Data:', JSON.stringify(data.context));
        return axios.post<Card>(url, data, { headers: headers }).then((result) => {
            const data = result.data;
            // console.debug('Result: ', data);
            if (data.extension.content?.entry) {
                console.log('Entries:', data.extension.content.entry.length);
                this.labeledResources = data.extension.content.entry.map(e => e.resource).filter(r => r !== undefined);
            }
            console.log('Security labeling completed.');
        });
    }


    recomputeConsentDecisions() {
        let shouldShare = false;
        if (this.input.consent?.provision) {
            if (this.input.consent.decision === undefined) {
                // Making a root denial by default, for purposes of simulation.
                this.input.consent.decision = 'deny';
            }
            const ruleProvider = new DummyRuleProvider();
            const engine = new ConsoleDataSharingEngine(ruleProvider, 0.0, false);
            const tmpCategorySettings = new ConsentCategorySettings();

            this.input.consent.provision.forEach((p) => {
                tmpCategorySettings.loadAllFromConsentProvision(p);
                this.labeledResources.forEach((r) => {
                    let extension = new ConsentExtension(null);
                    let includeEnabled = this.input.consent?.decision == 'permit';
                    extension.obligations.push({
                        id: { system: AbstractSensitivityRuleProvider.REDACTION_OBLIGATION.system, code: AbstractSensitivityRuleProvider.REDACTION_OBLIGATION.code },
                        parameters: {
                            codes: tmpCategorySettings.allCategories()
                                .filter(c => includeEnabled ? !c.enabled : c.enabled) // Only categories relevant to the consent
                                .map(c => { return { system: c.system, code: c.act_code } }) // Make it a valid Coding
                        }
                    })
                    shouldShare = !engine.shouldRedactFromLabels(extension, r) && engine.shouldShareFromPurposes(r, p, this.input.categorySettings);
                    // console.log('Decision:', r.resourceType, r.id, shouldShare);
                    if (shouldShare) {
                        this.consentDecisions[r.id!] = new PermitCard();
                    } else {
                        this.consentDecisions[r.id!] = new DenyCard();
                    }
                });
            });

        } else {
            this.labeledResources.forEach((r) => {
                if (this.input.consent?.decision == 'deny') {
                    this.consentDecisions[r.id!] = new DenyCard();
                } else {
                    this.consentDecisions[r.id!] = new PermitCard();
                }
            });
        }
    }

    exportCsv() {
        let data = this.exportCsvData();
        // let csvContent = 'data:text/csv;charset=utf-8,';
        let csvContent = '';
        data.forEach((row) => {
            let rowContent = row.join(',');
            csvContent += rowContent + "\n";
        });
        return csvContent;
    }

    exportCsvData() {
        let data = [['Resource Type', 'Resource ID', 'Labels', 'Decision']];
        this.labeledResources.forEach((r) => {
            let labels: string[] = [];
            r.meta?.security?.forEach((s) => {
                if (s.code) {
                    let label = this.input.categorySettings.categoryForCode(s.code)?.name || (s.code + ' (Unknown)');
                    labels.push(label);
                } else {
                    labels.push('(Unknown)');
                }
            });
            if (r.id && this.consentDecisions[r.id]) {
                let decision = 'Undecided';
                switch (this.consentDecisions[r.id].summary) {
                    case ConsentDecision.CONSENT_PERMIT:
                        decision = 'Permit';
                        break;
                    case ConsentDecision.CONSENT_DENY:
                        decision = 'Deny';
                    default:
                        break;
                }
                data.push([r.resourceType,
                r.id || 'unknown',
                labels.join('|'),
                    decision]);
            }
        });
        return data;
    }
}