/* @flow */
/* eslint-disable import/no-commonjs */

import 'core-js/es6/symbol';
import 'core-js/es6/array';
import './polyfills/babelHelpers';

global.navigator.userAgent = 'react-native';

require('./client-base');
