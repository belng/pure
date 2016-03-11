/* @flow */

import React, { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';

// TODO: Image upload container
const ImageUploadContainer = (props: any) => <Connect passProps={props} component={props.component} />;

ImageUploadContainer.propTypes = {
	component: PropTypes.any.isRequired
};

export default ImageUploadContainer;
