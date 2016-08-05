/* @flow */

import React, { Component, PropTypes } from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import AppText from './AppText';
import BigEmoji from './BigEmoji';
import LinkContainer from '../../containers/LinkContainer';
import { buildLink } from '../../../../lib/URL';
import { format, isEmoji } from '../../../../lib/Smiley';

type Props = {
	text: string;
	style?: any;
}

export default class RichText extends Component<void, Props, void> {
	static propTypes = {
		text: PropTypes.string.isRequired,
		style: AppText.propTypes.style,
	};

	shouldComponentUpdate(nextProps: Props, nextState: any): boolean {
		return shallowCompare(this, nextProps, nextState);
	}

	render() {
		const textWithEmoji = format(this.props.text);

		if (isEmoji(textWithEmoji)) {
			return (
				<BigEmoji {...this.props}>
					{textWithEmoji}
				</BigEmoji>
			);
		} else {
			return (
				<AppText {...this.props}>
					{textWithEmoji.split('\n').map((text, index, arr) => {
						return ([
							text.split(' ').map((inner, i) => {
								let t = inner;

								const items = [];

								const key = 'inner-' + index + '-' + i;

								// Strip out ending punctuations
								let punctuation = '';

								const matches = t.match(/[\.,\?!:;]+$/);

								if (matches) {
									punctuation = matches[0];
									t = t.substring(0, t.length - punctuation.length);
								}

								if (/^@[a-z0-9\-]{3,}$/.test(t)) {
									// a mention
									items.push(<LinkContainer key={key}>{t}</LinkContainer>);
								} else if (/^#\S{2,}$/.test(t)) {
									// a hashtag
									items.push(<LinkContainer key={key}>{t}</LinkContainer>);
								} else {
									const url = buildLink(t);

									if (url !== null) {
										items.push(
											<LinkContainer key={key} url={url}>{t}</LinkContainer>,
										);
									} else {
										return t + punctuation + ' ';
									}
								}

								items.push(punctuation + ' ');

								return items;
							}),
							index !== (arr.length - 1) ? '\n' : '',
						]);
					})}
				</AppText>
			);
		}
	}
}
