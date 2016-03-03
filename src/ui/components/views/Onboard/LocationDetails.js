/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import LocationItem from './LocationItem';
import PoweredByGoogle from './PoweredByGoogle';
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
	location: {
		latitude: number;
		longitude: number;
	};
	onChangeField: (type: string, value: Array<Object>) => void;
	submitPlaceDetails: () => void;
}

export default class LocationDetails extends Component<void, Props, void> {
	static propTypes = {
		location: PropTypes.shape({
			latitude: PropTypes.number,
			longitude: PropTypes.number
		}),
		onChangeField: PropTypes.func.isRequired,
		submitPlaceDetails: PropTypes.func.isRequired
	};

	_getResults: Function = async (query: string) => GooglePlaces.getAutoCompletePredictions(
		query, [ this.props.location || { latitude: 12.9667, longitude: 77.5667 } ], [ GooglePlaces.TYPE_FILTER_REGIONS ]
	);

	_handleSelectPlace: Function = place => {
		this.props.onChangeField('places', [ place ]);

		setTimeout(() => this.props.submitPlaceDetails(), 1000);
	};

	_renderRow: Function = place => <LocationItem place={place} onPress={() => this._handleSelectPlace(place)} />;

	_renderBlankslate: Function = () => <View style={styles.blankslate} />;

	render() {
		return (
			<View style={styles.container}>
				<StatusbarWrapper />
				<SearchableList
					getResults={this._getResults}
					renderRow={this._renderRow}
					renderBlankslate={this._renderBlankslate}
					searchHint='Search for your locality'
					autoFocus
				/>
				<KeyboardSpacer offset={36} />
				<PoweredByGoogle style={styles.poweredBy} />
			</View>
		);
	}
}
