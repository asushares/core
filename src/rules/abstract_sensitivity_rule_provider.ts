// Author: Preston Lee


import Ajv from 'ajv';

import { Coding } from "fhir/r5";

import { Rule } from '../model/rule';
import { RulesFile } from '../model/rules_file';

export abstract class AbstractSensitivityRuleProvider {

    static REDACTION_OBLIGATION = {
        system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
        code: "REDACT"
    }

    rulesFileJSON: RulesFile = new RulesFile();// = this.loadRulesFile();
    rules: Rule[] = []; // = this.initializeRules();

    AJV = new Ajv();
    validator = this.rulesSchema() ? this.AJV.compile(this.rulesSchema()) : null;

    constructor() {
        // this.reinitialize();
    }


    abstract rulesSchema(): any;

    abstract loadRulesFile(): RulesFile;


    reinitialize() {
        this.rulesFileJSON = this.loadRulesFile();
        this.rules = this.rulesFileJSON.rules.map((n: any) => { return Object.assign(new Rule, n) });
        console.log('Loaded rules:');
        this.rules.forEach(r => {
            console.log(`\t${r.id} : (${r.allCodeObjects().length} total codes, Basis: ${r.basis.display}, Labels: ${r.labels.map(l => { return l.code + ' - ' + l.display }).join(', ')})`);
        });
    }


    validateRuleFile(data: string) {
        const ajv = new Ajv();
        if (!this.validator) {
            console.log('No validator found. All validations will pass without errors.');
            return null;
        }
        else if (this.validator(data)) {
            return null;
        } else {
            return this.validator.errors;
        }
    }


    applicableRulesFor(codings: Coding[], allRules: Rule[], threshold: number): Rule[] {
        let rules = allRules.filter(rule => {
            return rule.allCodeObjects().some(coding => {
                let found = false;
                for (let i = 0; i < codings.length; i++) {
                    if (coding.system == codings[i].system && coding.code == codings[i].code) {
                        if (coding.confidence >= threshold) {
                            found = true;
                            // console.debug("Rule sensitivity match on: " + coding.system + ' ' + coding.code);
                            break;
                        } else {
                            // console.debug(`Rule sensitivity match SKIPPED due to low confidence ` +
                            //     `(confidence ${coding.confidence} < configured threshold ${threshold}) for: ` +
                            //     coding.system + ' ' + coding.code);
                        }
                    }
                }
                return found;
            })
        })
        // console.log('Applicable rules (' + rules.length + '): ');
        // rules.forEach(r => {
        //     console.log("\tRule ID: " + r.id);
        // });
        return rules;
    }

    applicableRulesForAll(codings: Coding[], threshold: number): Rule[] {
        return this.applicableRulesFor(codings, this.rules, threshold);
    }

}