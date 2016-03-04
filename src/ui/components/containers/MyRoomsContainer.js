/* @flow */

import React from 'react';
import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';

// TODO: My rooms container
const MyRoomsContainer = (props: any) => <Connect passProps={props} component={Dummy} />;

export default MyRoomsContainer;
