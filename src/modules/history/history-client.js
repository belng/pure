/* @flow */

import { bus } from '../../core-client';

bus.on('state:init', state => (state.initialURL = null));
