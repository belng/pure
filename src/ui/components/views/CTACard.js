/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowEqual from 'shallowequal';
import template from 'lodash/template';
import Card from './Card';
import Share from '../../modules/Share';
import type { Room, User } from '../../../lib/schemaTypes';

const {
	StyleSheet,
	Image,
	TouchableOpacity,
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	cover: {
		height: 180,
		resizeMode: 'cover',
	},
});

type Props = {
	id: string;
	room: Room;
	user: User;
	image: string;
	title: string;
	content: string;
}

export default class CTACard extends Component<void, Props, void> {
	static propTypes = {
		id: PropTypes.string.isRequired,
		room: PropTypes.object.isRequired,
		user: PropTypes.object.isRequired,
		image: PropTypes.string.isRequired,
		title: PropTypes.string.isRequired,
		content: PropTypes.string.isRequired,
	};

	shouldComponentUpdate(nextProps: Props): boolean {
		return !shallowEqual(this.props, nextProps);
	}

	_handlePress: Function = () => {
		const { room, user, id, title, content } = this.props;

		try {
			Share.shareItem(title, template(content)({ room, user, id }));
		} catch (e) {
			// ignore
		}
	};

	render() {
		return (
			<Card {...this.props}>
				<TouchableOpacity style={styles.container} onPress={this._handlePress}>
					<Image style={styles.cover} source={{ uri: this.props.image }} />
				</TouchableOpacity>
			</Card>
		);
	}
}
