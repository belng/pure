/* @flow */

import React, { PropTypes } from 'react';
import ReactNative from 'react-native';
import CardSummary from './CardSummary';
import Embed from './Embed';
import { parseURLs } from '../../../lib/URL';

const {
	StyleSheet,
	View
} = ReactNative;

const styles = StyleSheet.create({
	image: {
		marginVertical: 4,
		height: 180,
		width: null
	},
	item: {
		marginHorizontal: 16
	}
});

type Props = {
	text: string;
	meta: ?{
		photo?: Object
	};
}

const DiscussionSummary = (props: Props) => {
	const {
		text,
		meta
	} = props;

	const trimmedText = text.trim();

	const links = parseURLs(trimmedText, 1);

	let cover, hideSummary;

	if (meta && meta.photo) {
		cover = (
			<Embed
				url={meta.photo.url}
				data={meta.photo}
				thumbnailStyle={styles.image}
				showTitle={false}
				showSummary={false}
				openOnPress={false}
			/>
		);

		hideSummary = true;
	} else if (links.length) {
		cover = (
			<Embed
				url={links[0]}
				thumbnailStyle={styles.image}
				showTitle={false}
				showSummary={false}
			/>
		);
	}

	return (
		<View {...props}>
			{cover}

			{hideSummary ? null :
				<CardSummary style={styles.item} text={trimmedText} />
			}
		</View>
	);
};

DiscussionSummary.propTypes = {
	text: PropTypes.string.isRequired,
	meta: PropTypes.object
};

export default DiscussionSummary;
