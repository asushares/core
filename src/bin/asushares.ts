// #!/usr/bin/env node
// // The `node` runtime (instead of ts-node) is used to be runnable in compiled .js form.
// // Author: Preston Lee

// import { Command } from 'commander';
// import * as fs from 'fs';
// import path from 'path';
// import { AsuSharesVersion } from '../version';

// const program = new Command('asushares');
// const description = `AsuShares core libraries and utilities, based on the HL7/Logica Marketplace specification.`

// program.description(description);

// const server_command = program.command('server');
// // server_command.action(() => server_command.help());


// program.command('version')
//     .description('Package version information.')
//     .action(options => {
//         const json = {
//             package_version: AsuSharesVersion.PACKAGE_VERSION,
//         }
//         console.log(JSON.stringify(json, null, "\t"));
//     });


// program.parse();


// server_command.command('status')
//     .description("Remote server status information.")
//     // .argument("<postgres|parquet>", "SQL implementation dialect to emit.")
//     .action((options) => {
//         console.log('Not implemented');
//     });
