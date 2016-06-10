/* @flow */

import flowRight from 'lodash/flowRight';
import createContainer from '../../../modules/store/createContainer';
import createUserContainer from '../../../modules/store/createUserContainer';
import Chat from '../views/Chat/Chat';
import { sendMessage } from '../../../modules/store/actions';

const mapDispatchToProps = dispatch => ({
	sendMessage: data => dispatch(sendMessage(data)),
});

export default flowRight(
	createUserContainer(),
	createContainer(null, mapDispatchToProps),
)(Chat);
