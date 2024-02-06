// Author: Preston Lee

import { CodeSetCoding } from './code_set_coding';

export class CodeSet {

    public groupID: string = '';
    public codes: CodeSetCoding[] = [];

    static codeFromTemplate() {
        let c = new CodeSetCoding();
        c.system = 'http://snomed.info/sct';
        c.code = '';
        c.confidence = 1.0;
        return c;
    }

}