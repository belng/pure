/* @flow */

import React, { Component, PropTypes } from 'react';
import ReactNative from 'react-native';
import shallowEqual from 'shallowequal';
import DiscussionItem from './DiscussionItem';
import PageEmpty from './PageEmpty';
import PageLoading from './PageLoading';
import LoadingItem from './LoadingItem';
import StartDiscussionButton from './StartDiscussionButton';
import { TAG_POST_HIDDEN } from '../../../lib/Constants';
import type { Item } from '../../../lib/schemaTypes';

const {
	StyleSheet,
	ListView,
	View
} = ReactNative;

const styles = StyleSheet.create({
	container: {
		paddingTop: 4,
		paddingBottom: 88
	},
	item: {
		overflow: 'hidden'
	}
});

type Props = {
	user: string;
	room: string;
	data: Array<Item | { type: 'loading' } | { type: 'failed' }>;
	loadMore: (count: number) => void;
	onNavigation: (count: number) => void;
}

type State = {
	dataSource: ListView.DataSource
}

export default class Discussions extends Component<void, Props, State> {
	static propTypes = {
		data: PropTypes.arrayOf(PropTypes.object).isRequired,
		room: PropTypes.string.isRequired,
		user: PropTypes.string.isRequired,
		loadMore: PropTypes.func.isRequired,
		onNavigation: PropTypes.func.isRequired
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

	_loadMore: Function = () => {
		this.props.loadMore(this.props.data.length);
	};

	_renderRow: Function = thread => {
		if (thread && thread.type === 'loading') {
			return <LoadingItem />;
		}

		return (
			<DiscussionItem
				key={thread.id}
				thread={thread}
				hidden={thread.tags && thread.tags.indexOf(TAG_POST_HIDDEN) > -1}
				onNavigation={this.props.onNavigation}
				style={styles.item}
			/>
		);
	};

	render() {
		let placeHolder;

		if (this.props.data.length === 0) {
			placeHolder = <PageEmpty label='No discussions yet' image='sad' />;
		} else if (this.props.data.length === 1) {
			switch (this.props.data[0] && this.props.data[0].type) {
			case 'loading':
				placeHolder = <PageLoading />;
				break;
			case 'banned':
				placeHolder = <PageEmpty label="You're banned in this community" image='meh' />;
				break;
			case 'nonexistent':
				placeHolder = <PageEmpty label="This community doesn't exist" image='sad' />;
				break;
			case 'failed':
				placeHolder = <PageEmpty label='Failed to load discussions' image='sad' />;
				break;
			}
		}

		return (
			<View {...this.props}>
				{placeHolder ? placeHolder :
					<ListView
						removeClippedSubviews
						contentContainerStyle={styles.container}
						initialListSize={3}
						onEndReached={this._loadMore}
						dataSource={this.state.dataSource}
						renderRow={this._renderRow}
					/>
				}

				<StartDiscussionButton
					room={this.props.room}
					user={this.props.user}
					onNavigation={this.props.onNavigation}
				/>
			</View>
		);
	}
}
