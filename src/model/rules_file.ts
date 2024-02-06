// Author: Preston Lee

import { Rule } from "./rule";

export class RulesFile {

    public $schema = 'https://cds-hooks.sandbox.asushares.com/schemas/sensitivity-rules.schema.json';
    
    public name: string = 'My Rules';
    public updated_at: string = 'Not Set';
    public settings: { editable: boolean } = { editable: true };
    public rules: Rule[] = [];

}