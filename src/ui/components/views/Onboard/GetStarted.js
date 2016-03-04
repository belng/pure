/* @flow */

import React, { PropTypes } from 'react';
import ReactNative from 'react-native';
import at from 'lodash/at';
import NextButton from './NextButton';
import StatusbarWrapper from '../StatusbarWrapper';
import OnboardTitle from './OnboardTitle';
import OnboardParagraph from './OnboardParagraph';
import Colors from '../../../Colors';

const {
	View,
	StyleSheet,
	Image,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.white,
	},

	inner: {
		padding: 15,
		alignItems: 'center',
		justifyContent: 'center',
	},

	text: {
		marginVertical: 8,
	},

	image: {
		margin: 8,
	},
});

const GetStarted = (props: { submitGetStarted: Function }) => {
	const completed = at(props, [ 'props.user.params.profile.places.length' ])[0] !== 0;

	return (
		<View style={styles.container}>
			<StatusbarWrapper />
			<View style={[ styles.container, styles.inner ]}>
				<OnboardTitle style={styles.text}>
					{
						completed ?
						'You are all set!' :
						'Join the Open House'
					}
				</OnboardTitle>
				<Image style={styles.image} source={require('../../../../../assets/open-door.png')} />
				<OnboardParagraph style={styles.text}>
					{
						completed ?
						'Have fun and help make your neighbourhood better.' :
						'We are coming to your city soon! Stay connected by joining the open house group.'
					}
				</OnboardParagraph>
			</View>
			<NextButton label="Let's go" onPress={props.submitGetStarted} />
		</View>
	);
};

GetStarted.propTypes = {
	submitGetStarted: PropTypes.func.isRequired,
	user: PropTypes.shape({
		profile: PropTypes.shape({
			places: PropTypes.arrayOf(PropTypes.string)
		})
	})
};

export default GetStarted;
