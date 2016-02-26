/* @flow */

import React from 'react-native';
import PlaceManager from './PlaceManager';
import PageLoading from '../PageLoading';
import Colors from '../../../Colors';

const {
	StyleSheet,
	View
} = React;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.white,
		paddingVertical: 8
	}
});

const MyPlaces = (props: { places: Array<any>, style: any }) => {
	if (props.places && props.places.length === 1 && props.places[0] === 'missing') {
		return <PageLoading />;
	}

	return <PlaceManager {...props} style={[ styles.container, props.style ]} />;
};

MyPlaces.propTypes = {
	style: View.propTypes.style,
	places: React.PropTypes.array
};

export default MyPlaces;
