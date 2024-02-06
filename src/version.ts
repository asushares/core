// Author: Preston Lee

import path from 'path';
import fs from 'fs';

export class AsuSharesVersion {
    public static PACKAGE_VERSION: string = JSON.parse(fs.readFileSync(path.normalize(__dirname + path.sep + '..' + path.sep + 'package.json')).toString()).version;
    // public static SPECIFICATION_VERSION: string = '1';
}