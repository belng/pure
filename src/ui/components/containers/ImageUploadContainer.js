/* @flow */

import React from 'react';
import Connect from '../../../modules/store/Connect';
import Dummy from '../views/Dummy';

// TODO: Image upload container
const ImageUploadContainer = (props: any) => <Connect><Dummy {...props} /></Connect>;

export default ImageUploadContainer;
