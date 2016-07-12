/* @flow */

import flowRight from 'lodash/flowRight';
import createUserContainer from '../../../modules/store/createUserContainer';
import createContainer from '../../../modules/store/createContainer';
import createTransformPropsContainer from '../../../modules/store/createTransformPropsContainer';
import RoomsFooter from '../views/Homescreen/RoomsFooter';

const getPlacesFromUser = user => user.params && user.params.places ? user.params.places : {};

const mapSubscriptionToProps = ({ user }) => ({
	user: {
		type: 'entity',
		options: {
			id: user,
		},
	},
});

const transformFunction = props => {
	if (props.user) {
		return {
			...props,
			places: getPlacesFromUser(props.user),
		};
	}
	return props;
};

export default flowRight(
	createUserContainer(),
	createContainer(mapSubscriptionToProps),
	createTransformPropsContainer(transformFunction),
)(RoomsFooter);
