/* @flow */

import React, { PropTypes, Component } from 'react';
import ReactNative from 'react-native';
import shallowEqual from 'shallowequal';
import PersistentNavigator from '../../navigation/PersistentNavigator';
import StatusbarWrapper from './StatusbarWrapper';
import KeyboardSpacer from './KeyboardSpacer';
import Modal from './Modal';
import VersionCodes from '../../modules/VersionCodes';
import Colors from '../../Colors';
import { convertRouteToState, convertURLToState } from '../../../lib/Route';

const {
	NavigationState,
	StyleSheet,
	Platform,
	View
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		flex: 1
	},
	statusbar: {
		backgroundColor: Colors.primary
	},
});

const PERSISTANCE_KEY = __DEV__ ? 'FLAT_PERSISTENCE_0' : null;

type Props = {
	initialURL: ?string
};

export default class Home extends Component<void, Props, void> {
	static propTypes = {
		initialURL: PropTypes.string
	};

	shouldComponentUpdate(nextProps: Props): boolean {
		return !shallowEqual(this.props, nextProps);
	}

	render() {
		const { initialURL } = this.props;
		const { index, routes } = initialURL ? convertURLToState(initialURL) : convertRouteToState({ name: 'home' });

		return (
			<View style={styles.container}>
				<StatusbarWrapper style={styles.statusbar} />
				<PersistentNavigator
					initialState={new NavigationState(routes, index)}
					persistenceKey={initialURL ? null : PERSISTANCE_KEY}
				/>

				{Platform.Version >= VersionCodes.KITKAT ?
					<KeyboardSpacer /> :
					null // Android seems to Pan the screen on < Kitkat
				}
				<Modal />
			</View>
		);
	}
}
