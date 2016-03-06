/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import PlaceItem from './PlaceItem';
import PlaceButton from './PlaceButton';
import Modal from '../Modal';

const {
	View,
	InteractionManager
} = ReactNative;

type Place = {
	id: string;
}

const TYPES = [
	{
		type: 'home',
		title: 'Home',
		label: 'Add where you live',
		hint: 'Join your neighborhood group'
	},
	{
		type: 'work',
		title: 'Work',
		label: 'Add where you work or study',
		hint: 'Join your office or campus group'
	},
	{
		type: 'state',
		title: 'Hometown',
		label: 'Add your hometown',
		hint: 'Join people from your state in the city'
	}
];

export default class PlaceManager extends Component {

	static propTypes = {
		onChange: PropTypes.func.isRequired,
		places: PropTypes.arrayOf(PropTypes.shape({
			place: PropTypes.object,
			type: PropTypes.oneOf([ 'home', 'work', 'state' ])
		}))
	};

	_handleDismissModal: Function = () => {
		Modal.renderChild(null);
	};

	_handleSelectItem: Function = (type: string, place: Place) => {
		this._handleDismissModal();

		InteractionManager.runAfterInteractions(() => {
			const { places } = this.props;

			this.props.onChange([ ...places, {
				place,
				type
			} ]);
		});
	};

	_handleRemoveLocality: Function = (place: Place, type: string) => {
		this.props.onChange(this.props.places.filter(it => !(it.place.id === place.id && it.type === type)));
	};

	_handlePress: Function = () => {
		Modal.renderChild(
			<View />
		);
	};

	render() {
		const { places } = this.props;

		const placesMap = {};

		for (let i = 0, l = places.length; i < l; i++) {
			placesMap[places[i].type] = places[i].place;
		}

		return (
			<View {...this.props}>
				{TYPES.map(item => {
					if (placesMap[item.type]) {
						return (
							<PlaceItem
								key={item.type}
								type={item.type}
								place={placesMap[item.type]}
								onRemove={this._handleRemoveLocality}
							/>
						);
					}

					return (
						<PlaceButton
							key={item.type}
							type={item.type}
							label={item.label}
							hint={item.hint}
							onPress={this._handlePress}
						/>
					);
				})}
			</View>
		);
	}
}
