// Author: Preston Lee

import { RulesFile } from "../model/rules_file.js";
import { AbstractSensitivityRuleProvider } from "./abstract_sensitivity_rule_provider.js";


export class DummyRuleProvider extends AbstractSensitivityRuleProvider {

    rulesSchema() {
        return null;
    }
    loadRulesFile(): RulesFile {
        return new RulesFile();
    }


}