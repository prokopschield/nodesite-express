#!/usr/bin/env node

import factory from '.';

const [ ,, name, port, ] = process.argv;

const app = factory({
    name,
    port: +port,
    interface: 'http',
});

console.log(`Initializing REPL-server ${name} on port ${+port}`);

app.set('GET', '/', (req) => new Promise(resolve => {
	console.log(`${req.method} ${req.uri}`);
	process.stdin.once('data', resolve);
}));
