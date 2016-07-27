/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';
import Icon from '../Core/Icon';
import Colors from '../../../Colors';
import type { Embed } from '../../../../modules/url-preview/oEmbedTypes';

const {
	StyleSheet,
	Dimensions,
	View,
	Image,
} = ReactNative;

const styles = StyleSheet.create({
	thumbnail: {
		width: 240,
		height: 135,
		justifyContent: 'center',
		alignItems: 'center',
	},
	playContainer: {
		backgroundColor: Colors.fadedBlack,
		borderColor: Colors.white,
		justifyContent: 'center',
		padding: 4,
		borderWidth: 2,
		borderRadius: 24,
	},
	play: {
		color: Colors.white,
	},
});

type Props = {
	embed: Embed;
	style?: any;
}

type State = {
	dimensions: ?{
		height: number;
		width: number;
	}
}

export default class EmbedThumbnail extends Component<void, Props, State> {
	static propTypes = {
		embed: PropTypes.shape({
			type: PropTypes.string,
			height: PropTypes.number,
			width: PropTypes.number,
			thumbnail_height: PropTypes.number,
			thumbnail_width: PropTypes.number,
			thumbnail_url: PropTypes.string,
		}).isRequired,
		style: Image.propTypes.style,
	};

	state: State;

	componentWillMount() {
		this.setState({
			dimensions: this.props.embed.thumbnail_url ? this._getOptimalDimensions(this.props.embed) : null,
		});
	}

	shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	_getOptimalDimensions = (embed: Embed) => {
		const {
			height,
			width,
			thumbnail_width,
			thumbnail_height,
		} = embed;

		const win = Dimensions.get('window');

		let ratio;

		if (thumbnail_height && thumbnail_width) {
			ratio = (thumbnail_height / thumbnail_width);
		} else if (width && height) {
			ratio = height / width;
		} else {
			ratio = 1;
		}

		let displayWidth;

		if (thumbnail_height && thumbnail_width) {
			displayWidth = Math.min(thumbnail_width, win.width - 140);
		} else if (height && width) {
			displayWidth = Math.min(width, win.width - 140);
		} else {
			displayWidth = 160;
		}

		return {
			height: displayWidth * ratio,
			width: displayWidth,
		};
	};

	render() {
		if (this.props.embed.thumbnail_url) {
			return (
				<Image source={{ uri: this.props.embed.thumbnail_url }} style={[ styles.thumbnail, this.state.dimensions, this.props.style ]}>
					{this.props.embed.type === 'video' ?
						<View style={styles.playContainer}>
							<Icon
								name='play-arrow'
								style={styles.play}
								size={36}
							/>
						</View> :
						null
					}
				</Image>
			);
		} else {
			return null;
		}
	}
}
