/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowEqual from 'shallowequal';
import PeopleListItem from './PeopleListItem';
import PageEmpty from './PageEmpty';
import PageLoading from './PageLoading';
import ListHeader from './ListHeader';
import { PRESENCE_FOREGROUND } from '../../../lib/Constants';
import type { RoomRel, ThreadRel } from '../../../lib/schemaTypes';

const {
	ListView,
} = ReactNative;

type Props = {
	data: Array<RoomRel | ThreadRel | { type: 'loading' } | { type: 'failed' }>;
}

type State = {
	dataSource: ListView.DataSource
}

export default class PeopleList extends Component<void, Props, State> {
	static propTypes = {
		data: PropTypes.arrayOf(PropTypes.object).isRequired,
	};

	state: State = {
		dataSource: new ListView.DataSource({
			rowHasChanged: (r1, r2) => r1 !== r2
		})
	};

	componentWillMount() {
		this.setState({
			dataSource: this.state.dataSource.cloneWithRows(this.props.data)
		});
	}

	componentWillReceiveProps(nextProps: Props) {
		this.setState({
			dataSource: this.state.dataSource.cloneWithRows(nextProps.data)
		});
	}

	shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
		return !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState);
	}

	_dataSource: ListView.DataSource = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

	_renderHeader: Function = () => <ListHeader>People talking</ListHeader>;

	_renderRow: Function = (relation: RoomRel | ThreadRel) => (
		<PeopleListItem
			key={relation.user}
			user={relation.user}
			status={relation.presence === PRESENCE_FOREGROUND ? 'online' : 'offline'}
		/>
	);

	render() {
		const { data } = this.props;

		if (data.length === 0) {
			return <PageEmpty label='Nobody here' image='sad' />;
		} else if (data.length === 1) {
			switch (data[0] && data[0].type) {
			case 'loading':
				return <PageLoading />;
			case 'failed':
				return <PageEmpty label='Failed to load people list' image='sad' />;
			}
		}

		return (
			<ListView
				dataSource={this.state.dataSource}
				renderHeader={this._renderHeader}
				renderRow={this._renderRow}
			/>
		);
	}
}
