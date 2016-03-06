/* @flow */

import React, { PropTypes } from 'react';
import ReactNative from 'react-native';
import Card from './Card';
import CardTitle from './CardTitle';
import DiscussionSummary from './DiscussionSummary';
import CardAuthor from './CardAuthor';

const {
	StyleSheet
} = ReactNative;

const styles = StyleSheet.create({
	details: {
		paddingVertical: 12,
		marginVertical: 0
	},

	title: {
		marginBottom: 8,
		marginHorizontal: 16
	},

	author: {
		marginTop: 8,
		marginHorizontal: 16
	}
});

const DiscussionDetailsCard = props => {
	const {
		thread
	} = props;

	return (
		<Card style={styles.details}>
			<CardTitle style={styles.title}>{thread.title}</CardTitle>
			<DiscussionSummary text={thread.text} />
			<CardAuthor nick={thread.from} style={styles.author} />
		</Card>
	);
};

DiscussionDetailsCard.propTypes = {
	thread: PropTypes.shape({
		title: PropTypes.string.isRequired,
		text: PropTypes.string.isRequired,
		from: PropTypes.string.isRequired
	})
};

export default DiscussionDetailsCard;
