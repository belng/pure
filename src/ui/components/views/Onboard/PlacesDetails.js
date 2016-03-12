/* @flow */

import React, { Component, PropTypes } from 'react';
import PlacesSelectorTip from '../Account/PlacesSelectorTip';
import PlacesSelectorContainer from '../../containers/PlaceSelectorContainer';

type Props = {
	onChangeField: (type: string, value: { [key: string]: string }) => void;
	submitPlaceDetails: () => void;
}

export default class PlacesDetails extends Component<void, Props, void> {
	static propTypes = {
		onChangeField: PropTypes.func.isRequired,
		submitPlaceDetails: PropTypes.func.isRequired
	};

	_handleSelectPlace: Function = place => {
		this.props.onChangeField('places', { home: place });

		setTimeout(() => this.props.submitPlaceDetails(), 100);
	};

	_renderBlankslate: Function = () => <PlacesSelectorTip type='home' />;

	render() {
		return (
			<PlacesSelectorContainer
				renderBlankslate={this._renderBlankslate}
				onSelectPlace={this._handleSelectPlace}
				searchHint='Search for your apartment'
			/>
		);
	}
}
