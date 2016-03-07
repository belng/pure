/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import URLResolver from '../../modules/URLResolver';

const {
	Image
} = ReactNative;

type Props = {
	uri?: string;
	size: number;
}

type State = {
	uri: string
}

export default class Avatar extends Component<void, Props, State> {
	static propTypes = {
		uri: PropTypes.string,
		size: PropTypes.number.isRequired
	};

	state: State = {
		uri: ''
	};

	componentWillMount() {
		this._mounted = true;

		if (this.props.uri) {
			this._updateData(this.props.uri);
		}
	}

	componentWillReceiveProps(nextProps: Props) {
		if (this.props.uri !== nextProps.uri) {
			this._updateData(nextProps.uri);
		}
	}

	shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
		return (this.state.uri !== nextState.uri);
	}

	componentWillUnmount() {
		this._mounted = false;
	}

	_mounted: boolean = false;

	_updateData: Function = async (currentUri: string) => {
		try {
			// We manually resolve the links since RN doesn't seem to handle redirects properly
			const uri = await URLResolver.resolveURL(currentUri);

			if (this._mounted) {
				this.setState({
					uri
				});
			}
		} catch (e) {
			this.setState({
				uri: currentUri
			});
		}
	};

	render() {
		if (this.state.uri) {
			return (
				<Image
					{...this.props}
					source={{ uri: this.state.uri }}
				/>
			);
		} else {
			return null;
		}
	}
}
