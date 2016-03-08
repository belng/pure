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
	savePlaces: Function;
	style?: any;
}

export default class MyPlaces extends Component<void, Props, void> {
	static propTypes = {
		places: PropTypes.object,
		savePlaces: PropTypes.func.isRequired,
		style: View.propTypes.style,
	};

	render() {
		if (this.props.places) {
			return (
				<PlaceManager
					{...this.props}
					onChange={this.props.savePlaces}
					style={[ styles.container, this.props.style ]}
				/>
			);
		}

		return <PageLoading />;
	}
}
