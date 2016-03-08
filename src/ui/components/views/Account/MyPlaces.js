/* @flow */

import React, { PropTypes, Component } from 'react';
import ReactNative from 'react-native';
import PlaceManager from './PlaceManager';
import PageLoading from '../PageLoading';
import Colors from '../../../Colors';

const {
	StyleSheet,
	View
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.white,
		paddingVertical: 8
	}
});

type Props = {
	places: Object;
	addPlace: Function;
	removePlace: Function;
	style?: any;
}

export default class MyPlaces extends Component<void, Props, void> {
	static propTypes = {
		places: PropTypes.object,
		addPlace: PropTypes.func.isRequired,
		removePlace: PropTypes.func.isRequired,
		style: View.propTypes.style,
	};

	render() {
		if (this.props.places) {
			return (
				<PlaceManager
					{...this.props}
					onPlaceAdded={this.props.addPlace}
					onPlaceRemoved={this.props.removePlace}
					style={[ styles.container, this.props.style ]}
				/>
			);
		}

		return <PageLoading />;
	}
}
