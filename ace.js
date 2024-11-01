/*
|--------------------------------------------------------------------------
| JavaScript entrypoint for running ace commands
|--------------------------------------------------------------------------
|
| DO NOT MODIFY THIS FILE AS IT WILL BE OVERRIDDEN DURING THE BUILD
| PROCESS.
|
| See docs.adonisjs.com/guides/typescript-build-process#creating-production-build
|
| Since, we cannot run TypeScript source code using "node" binary, we need
| a JavaScript entrypoint to run ace commands.
|
| This file registers the "ts-node/esm" hook with the Node.js module system
| and then imports the "bin/console.ts" file.
|
*/

/**
 * Register hook to process TypeScript files using ts-node
 */
import { register } from 'node:module'
register('ts-node/esm', import.meta.url)
import { configure, getConsoleSink } from "@logtape/logtape";

await configure({
    sinks: { console: getConsoleSink() },
    filters: {},
    loggers: [
        { category: "my-app", level: "debug", sinks: ["console"] },
        { category: "fedify", sinks: ["console"], level: "error" },
    ]
});

/**
 * Import ace console entrypoint
 */
await import('./bin/console.js')
