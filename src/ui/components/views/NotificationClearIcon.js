import React from 'react-native';
import AppbarTouchable from './AppbarTouchable';
import AppbarIcon from './AppbarIcon';

export default class NotificationClearIcon extends React.Component {
	render() {
		return (
			<AppbarTouchable onPress={this.props.dismissAllNotes}>
				<AppbarIcon name='clear-all' />
			</AppbarTouchable>
		);
	}
}

NotificationClearIcon.propTypes = {
	dismissAllNotes: React.PropTypes.func.isRequired
};
