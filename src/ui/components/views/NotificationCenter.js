/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import NotificationCenterItem from './NotificationCenterItem';
import PageEmpty from './PageEmpty';
import PageLoading from './PageLoading';

const {
	ListView,
} = ReactNative;

export default class NotificationCenter extends Component {
	constructor(props) {
		super(props);

		this._dataSource = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
	}

	_getDataSource = () => {
		return this._dataSource.cloneWithRows(this.props.data);
	};

	_renderRow = note => (
		<NotificationCenterItem
			key={note.ref + note.type}
			note={note}
			onNavigation={this.props.onNavigation}
			dismissNote={this.props.dismissNote}
		/>
	);

	render() {
		const { data } = this.props;

		if (data.length === 0) {
			return <PageEmpty label='No new notifications' image='cool' />;
		}

		if (data.length === 1) {
			if (this.props.data[0] === 'missing') {
				return <PageLoading />;
			}

			if (data[0] === 'failed') {
				return <PageEmpty label='Failed to load notifications' image='sad' />;
			}
		}

		return (
			<ListView
				dataSource={this._getDataSource()}
				renderRow={this._renderRow}
			/>
		);
	}
}

NotificationCenter.propTypes = {
	data: PropTypes.arrayOf(PropTypes.oneOfType([
		PropTypes.oneOf([ 'missing', 'failed' ]),
		PropTypes.shape({
			id: PropTypes.string
		})
	])).isRequired,
	dismissNote: PropTypes.func.isRequired,
	refreshData: PropTypes.func,
	onNavigation: PropTypes.func.isRequired
};
