/* @flow */

import React, { PropTypes, Component } from 'react';
import ReactNative from 'react-native';
import shallowEqual from 'shallowequal';
import PageLoading from './PageLoading';
import DiscussionDetailsCard from './DiscussionDetailsCard';
import PeopleListContainer from '../containers/PeopleListContainer';

const {
	ScrollView
} = ReactNative;

type Props = {
	thread: ?Object
}

export default class DiscussionDetails extends Component<void, Props, void> {
	static propTypes = {
		thread: PropTypes.object
	};

	shouldComponentUpdate(nextProps: Props): boolean {
		return !shallowEqual(this.props, nextProps);
	}

	render() {
		const { thread } = this.props;

		if (thread) {
			return (
				<ScrollView {...this.props}>
					<DiscussionDetailsCard thread={thread} />
					<PeopleListContainer thread={thread} />
				</ScrollView>
			);
		} else {
			return <PageLoading />;
		}
	}
}
