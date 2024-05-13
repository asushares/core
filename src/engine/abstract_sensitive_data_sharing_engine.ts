// Author: Preston Lee

import { JSONPath } from "jsonpath-plus";

import { Consent, ConsentProvision } from "fhir/r5";
import { ConsentDecision } from "../model/consent_decision";
import { ConsentExtension } from "../model/consent_extension";
import { PatientConsentHookRequest } from "../model/patient_consent_hook_request";
import { AbstractSensitivityRuleProvider } from "../rules/abstract_sensitivity_rule_provider";
import { CodeMatchingThresholdSensitivityRuleProvider } from "../rules/code_matching_theshold_sensitivity_rule_provider";

export abstract class AbstractSensitiveDataSharingEngine {


    constructor(public threshold: number, public redaction_enabled: boolean) {
        // super();
    }
    // abstract     async findConsents(subjects: SystemValue[], categories: SystemCode[]);
    ruleProvider(): AbstractSensitivityRuleProvider {
        return new CodeMatchingThresholdSensitivityRuleProvider(this.threshold);
    };

    addSecurityLabels(consents: Consent[], request: PatientConsentHookRequest, consentExtension: ConsentExtension, decisionSummary: ConsentDecision) {
        if (request.context.content?.entry) { // If the request contains FHIR resources
            // Find all Coding elements anywhere within the tree. It doesn't matter where.
            consentExtension = new ConsentExtension(request.context.content);
            consentExtension.decision = decisionSummary;
            if (consentExtension.content?.entry) {
                consentExtension.content.entry.forEach(e => {
                    if (e.resource) {
                        // TODO This is a pretty naiive implementation, as it only looks for coded elements recursively without awareness of the context.
                        let codings = JSONPath({ path: "$..coding", json: e.resource }).flat();
                        let srp = this.ruleProvider();
                        let srp_rules = srp.applicableRulesForAll(codings);
                        // rp.applySecurityLabelsToResource(rules, )
                        if (!e.resource.meta) {
                            e.resource.meta = {};
                        }
                        if (!e.resource.meta.security) {
                            e.resource.meta.security = [];
                        }
                        srp_rules.forEach(r => {
                            // console.log("LABELS: ");
                            // console.log(r);
                            let ob = { id: CodeMatchingThresholdSensitivityRuleProvider.REDACTION_OBLIGATION, parameters: { codes: r.labels } }
                            // r.labels.map(l => l.);
                            consentExtension.obligations.push(ob);
                            console.log('Adding label to resource meta security:');
                            console.log(r.labels);
                            r.labels.forEach(l => {
                                e.resource?.meta?.security?.push(l);
                            });
                        });
                        // console.log(codings);
                    }
                });
            }
        }
    }

    // redactFromLabels(card: Card) {
    redactFromLabels(consentExtension: ConsentExtension) {
        if (consentExtension.content?.entry) {
            consentExtension.content.entry = consentExtension.content?.entry.filter(e => {
                let shouldRedact = false;
                if (e.resource?.meta?.security) {
                    consentExtension.obligations.forEach(o => {
                        if (o.id.code == AbstractSensitivityRuleProvider.REDACTION_OBLIGATION.code && o.id.system == AbstractSensitivityRuleProvider.REDACTION_OBLIGATION.system) {
                            o.parameters.codes.forEach(code => {
                                e.resource!.meta!.security!.findIndex((c, i, all) => {
                                    if (code.code == c.code && code.system == c.system) {
                                        shouldRedact = true;
                                    }
                                });

                            });
                        }
                    });
                    return !shouldRedact;
                }
            })
        }
    }


    filterForApplicableConsents(consents: Consent[]): Consent[] {
        return consents.filter(c => { return c.status == 'active' })
            .filter(c => { return !c.period?.start || (c.period?.start && new Date(c.period.start).valueOf() <= Date.now()) })
            .filter(c => { return !c.period?.end || (c.period?.end && new Date(c.period.end).valueOf() >= Date.now()) })
    }

    consentDecision(consent: Consent, request: PatientConsentHookRequest): 'permit' | 'deny' | 'unspecified' {
        let decision: 'permit' | 'deny' | 'unspecified' = 'unspecified';
        switch (consent.decision) {
            case 'deny':
                decision = 'deny';
                break;
            case 'permit':
                decision = 'permit';
                break;
            default: // undefined
                break;
        }
        if (consent.provision) {
            let provisions_result: 'permit' | 'deny' | 'unspecified' = 'unspecified';
            switch (decision) {
                case 'permit':
                    provisions_result = this.consentDecisionProvisionsRecursive('deny', consent.provision, request);
                    break;
                case 'deny':
                    provisions_result = this.consentDecisionProvisionsRecursive('permit', consent.provision, request);
                    break;
                default:
                    // We can't process any provisions because the permit/deny logic is impossible to interpret.
                    break;
            }
            if (provisions_result == 'permit' || provisions_result == 'deny') {
                decision = provisions_result;
            } else {
                // No explicit decision could be made from any recursive provision tree.
            }
        }
        return decision;
    }

    consentDecisionProvisionsRecursive(mode: 'permit' | 'deny', provisions: ConsentProvision[], request: PatientConsentHookRequest): 'permit' | 'deny' | 'unspecified' {
        let decision: 'permit' | 'deny' | 'unspecified' = 'unspecified';
        // TODO @preston Implement conditional logic here
        // ...
        // ...
        // ...

        // Check sub-provisions, recursively.
        if (provisions) {
            let sub_results: ('permit' | 'deny' | 'unspecified')[] = [];
            for (let i = 0; i < provisions.length; i++) {
                const sub = provisions[i];
                if (sub.provision) {
                    switch (mode) {
                        case 'permit':
                            sub_results.push(this.consentDecisionProvisionsRecursive('deny', sub.provision, request))
                            break;
                        case 'deny':
                            sub_results.push(this.consentDecisionProvisionsRecursive('permit', sub.provision, request));
                            break;
                        default:
                            break;
                    }
                }
            }
            let sub_permits = sub_results.filter(sr => { return sr == 'permit' });
            let sub_denies = sub_results.filter(sr => { return sr == 'deny' });
            // Any deny decision should trump all permit decisions.
            if (sub_denies.length > 0) {
                decision = 'deny';
            } else if (sub_permits.length > 0) {
                decision = 'permit';
            }
        }
        return decision;
    }

}