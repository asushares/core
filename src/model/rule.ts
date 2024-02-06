// Author: Preston Lee

import * as uuid from 'uuid';
import { CodeSet } from './code_set';
import { Coding } from './coding';

export class Rule {

    id: string = '';
    basis: Coding = new Coding();
    labels: Coding[] = [];
    codeSets: CodeSet[] = [];

    static fromTemplate() {
        const r = new Rule();
        r.id = 'rule-' + uuid.v4().substring(0, 6);
        r.basis = Rule.basisFromTemplate();
        r.labels.push(Rule.labelFromTemplate());
        r.codeSets.push(Rule.codeSetFromTemplate());
        return r;
    }

    static basisFromTemplate(): Coding {
        const b = new Coding();
        b.system = 'http://terminology.hl7.org/CodeSystem/v3-ActCode';
        b.code = '42CFRPart2';
        b.display = '42 CFR Part2';
        return b;
    }
    
    static labelFromTemplate(): Coding {
        const c = new Coding();
        c.system = 'http://terminology.hl7.org/CodeSystem/v3-ActCode';
        c.code = 'X';
        c.display = 'Description of X';
        return c;
    }

    static codeSetFromTemplate(): CodeSet {
        const cs = new CodeSet();
        cs.groupID = 'Group-' + uuid.v4()
        return cs;
    }

}
