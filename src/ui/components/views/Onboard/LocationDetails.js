/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import LocationItem from './LocationItem';
import KeyboardSpacer from '../KeyboardSpacer';
import StatusbarWrapper from '../StatusbarWrapper';
import SearchableList from '../SearchableList';
import Colors from '../../../Colors';
import GooglePlaces from '../../../modules/GooglePlaces';

const {
	StyleSheet,
	View,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.lightGrey
	},
});

export default class LocationDetails extends Component {
	static propTypes = {
		location: PropTypes.shape({
			latitude: PropTypes.number,
			longitude: PropTypes.number
		}),
	};

	_getResults: Function = async (query: string) => GooglePlaces.getAutoCompletePredictions(
		query, [ this.props.location || { latitude: 12.9667, longitude: 77.5667 } ], null
	);

	_renderRow: Function = place => <LocationItem place={place} />;

	render() {
		return (
			<View style={styles.container}>
				<StatusbarWrapper />
				<SearchableList
					getResults={this._getResults}
					renderRow={this._renderRow}
					searchHint='Search for your apartment'
				/>
				<KeyboardSpacer />
			</View>
		);
	}
}
