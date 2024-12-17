// Author: Preston Lee

import { JSONPath } from "jsonpath-plus";

import { Coding, Consent, ConsentProvision, FhirResource } from "fhir/r5";
import { ConsentExtension } from "../model/consent_extension";
import { AbstractSensitivityRuleProvider } from "../rules/abstract_sensitivity_rule_provider";
import { DataSharingEngineContext } from "../model/engine_context";
import { Card } from "../cds/cards/card";
import { DenyCard } from "../cds/cards/deny_card";
import { NoConsentCard } from "../cds/cards/no_consent_card";
import { PermitCard } from "../cds/cards/permit_card";

export abstract class AbstractDataSharingEngine {

    constructor(public ruleProvider: AbstractSensitivityRuleProvider, public threshold: number, public redaction_enabled: boolean) {
    }


    process(consents: Consent[], engineContext: DataSharingEngineContext): Card {
        // Find and determine the correct card type.
        const filtered = this.filterForApplicableConsents(consents);
        let card: Card = new NoConsentCard();
        if (filtered.length > 0) {
            console.log('Evaluating ' + filtered.length + ' applicable consents.');

            let results = [];
            for (let i = 0; i < filtered.length; i++) {
                const consent = filtered[i];
                results.push(this.consentDecision(consent));

            }
            // console.log('CONSENT INDIVIDUAL DECISIONS: ');
            // console.log(results);

            let permits = results.filter(sr => { return sr == 'permit' });
            let denies = results.filter(sr => { return sr == 'deny' });
            // Any deny decision should trump all permit decisions.
            if (denies.length > 0) {
                // console.log('Using DenyCard template.');
                card = new DenyCard();
            } else if (permits.length > 0) {
                // console.log('Using PermitCard template.');
                card = new PermitCard();
            }
        } else {
            console.log("No applicable consent documents.");
        }

        // Add copy of request content to response, if present.
        if (engineContext.content) {
            card.extension = new ConsentExtension(engineContext.content);
            card.extension.decision = card.summary;
        }

        // Apply security labels
        if (card.extension) {
            this.addSecurityLabels(consents, engineContext, card.extension);
        }

        // Redact resources
        if (this.redaction_enabled && card.extension) {
            this.redactFromLabels(card.extension);
        }

        // Update the number of bundle resource, as it may have changed due to redaction.
        if (card.extension?.content?.entry) {

            card.extension.content.total = card.extension?.content?.entry?.length;
        }

        // Create an AuditEvent with the results.
        let outcodeCode = { code: card.extension.decision, display: card.extension.decision };
       this.createAuditEvent(consents, engineContext, outcodeCode);
        return card;
    }

    abstract createAuditEvent(consents: Consent[], engineContext: DataSharingEngineContext, outcodeCode: Coding): void;

    addSecurityLabels(consents: Consent[], engineContext: DataSharingEngineContext, consentExtension: ConsentExtension) {
        if (engineContext.content?.entry) { // If the request contains FHIR resources
            // Find all Coding elements anywhere within the tree. It doesn't matter where.
            // consentExtension = new ConsentExtension(engineContext.content);
            if (consentExtension.content?.entry) {
                consentExtension.content.entry.forEach(e => {
                    if (e.resource) {
                        // TODO This is a pretty naiive implementation, as it only looks for coded elements recursively without awareness of the context.
                        let codings = JSONPath({ path: "$..coding", json: e.resource }).flat();
                        let srp = this.ruleProvider;
                        let srp_rules = srp.applicableRulesForAll(codings, this.threshold);
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
                            let ob = { id: AbstractSensitivityRuleProvider.REDACTION_OBLIGATION, parameters: { codes: r.labels } }
                            // r.labels.map(l => l.);
                            consentExtension.obligations.push(ob);
                            console.log(`Adding label to meta security for resource: ${e.resource?.resourceType}/${r.id}`);
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
    shouldRedactFromLabels(consentExtension: ConsentExtension, resource: FhirResource) {
        let shouldRedact = false;
        if (resource?.meta?.security) {
            consentExtension.obligations.forEach(o => {
                if (o.id.code == AbstractSensitivityRuleProvider.REDACTION_OBLIGATION.code && o.id.system == AbstractSensitivityRuleProvider.REDACTION_OBLIGATION.system) {
                    o.parameters.codes.forEach(code => {
                        resource!.meta!.security!.findIndex((c, i, all) => {
                            if (code.code == c.code && code.system == c.system) {
                                shouldRedact = true;
                            }
                        });

                    });
                }
            });
            return !shouldRedact;
        }
    }
    
    redactFromLabels(consentExtension: ConsentExtension) {
        if (consentExtension.content?.entry) {
            consentExtension.content.entry = consentExtension.content?.entry.filter(e => {
                if(e.resource){
                    return !this.shouldRedactFromLabels(consentExtension, e!.resource);
                }
                return true;
            })
        }
    }


    filterForApplicableConsents(consents: Consent[]): Consent[] {
        return consents.filter(c => { return c.status == 'active' })
            .filter(c => { return !c.period?.start || (c.period?.start && new Date(c.period.start).valueOf() <= Date.now()) })
            .filter(c => { return !c.period?.end || (c.period?.end && new Date(c.period.end).valueOf() >= Date.now()) })
    }

    consentDecision(consent: Consent): 'permit' | 'deny' | 'unspecified' {
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
                    provisions_result = this.consentDecisionProvisionsRecursive('deny', consent.provision);
                    break;
                case 'deny':
                    provisions_result = this.consentDecisionProvisionsRecursive('permit', consent.provision);
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

    consentDecisionProvisionsRecursive(mode: 'permit' | 'deny', provisions: ConsentProvision[]): 'permit' | 'deny' | 'unspecified' {
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
                            sub_results.push(this.consentDecisionProvisionsRecursive('deny', sub.provision))
                            break;
                        case 'deny':
                            sub_results.push(this.consentDecisionProvisionsRecursive('permit', sub.provision));
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