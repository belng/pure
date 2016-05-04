/* @flow */

import React, { PropTypes, Component } from 'react';
import ReactNative from 'react-native';
import shallowEqual from 'shallowequal';
import PageLoading from './PageLoading';
import PageEmpty from './PageEmpty';
import DiscussionDetailsCard from './DiscussionDetailsCard';
import PeopleListContainer from '../containers/PeopleListContainer';
import type { Thread } from '../../../lib/schemaTypes';

const {
	ScrollView,
} = ReactNative;

type Props = {
	thread: ?Thread | { type: 'loading' }
}

export default class DiscussionDetails extends Component<void, Props, void> {
	static propTypes = {
		thread: PropTypes.object,
	};

	shouldComponentUpdate(nextProps: Props): boolean {
		return !shallowEqual(this.props, nextProps);
	}

	render() {
		const { thread } = this.props;

		if (thread) {
			if (thread.type === 'loading') {
				return <PageLoading />;
			}

			return (
				<ScrollView {...this.props}>
					<DiscussionDetailsCard thread={thread} />
					<PeopleListContainer thread={thread.id} />
				</ScrollView>
			);
		} else {
			return <PageEmpty label='Discussion not found' image='sad' />;
		}
	}
}
