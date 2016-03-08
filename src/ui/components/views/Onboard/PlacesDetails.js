/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import PlacesSelectorContainer from '../../containers/PlaceSelectorContainer';
import Colors from '../../../Colors';

const {
	StyleSheet,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.lightGrey
	},

	poweredBy: {
		borderTopColor: Colors.separator,
		borderTopWidth: StyleSheet.hairlineWidth,
		alignSelf: 'stretch'
	},

	blankslate: {
		flex: 1,
	}
});

type Props = {
	onChangeField: (type: string, value: { [key: string]: string }) => void;
	submitPlaceDetails: () => void;
}

export default class PlacesDetails extends Component<void, Props, void> {
	static propTypes = {
		onChangeField: PropTypes.func.isRequired,
		submitPlaceDetails: PropTypes.func.isRequired
	};

	_handleSelectPlace: Function = place => {
		this.props.onChangeField('places', { home: place });

		setTimeout(() => this.props.submitPlaceDetails(), 100);
	};

	_renderBlankslate: Function = () => <View style={styles.blankslate} />;

	render() {
		return (
			<PlacesSelectorContainer
				renderBlankslate={this._renderBlankslate}
				onSelectPlace={this._handleSelectPlace}
				searchHint='Search for your apartment'
			/>
		);
	}
}
