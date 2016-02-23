#! ./node_modules/babel-cli/bin/babel-node.js

/* eslint-disable no-console*/
import secureRandom from 'secure-random';

console.log(secureRandom(128, { type: 'Buffer' }).toString('base64'));
