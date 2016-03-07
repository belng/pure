import React, { PropTypes } from 'react';
import ReactNative from 'react-native';
import PageEmpty from './PageEmpty';
import PageLoading from './PageLoading';
import DiscussionDetailsCard from './DiscussionDetailsCard';
import PeopleListContainer from '../containers/PeopleListContainer';

const {
	ScrollView
} = ReactNative;

const DiscussionDetails = props => {
	if (props.thread === 'missing') {
		return <PageLoading />;
	} else if (typeof props.thread === 'object') {
		return (
			<ScrollView {...props}>
				<DiscussionDetailsCard thread={props.thread} />
				<PeopleListContainer thread={props.thread} />
			</ScrollView>
		);
	} else {
		return <PageEmpty label='Failed to load discussion' image='sad' />;
	}
};

DiscussionDetails.propTypes = {
	thread: PropTypes.oneOfType([
		PropTypes.oneOf([ 'missing', 'failed' ]),
		PropTypes.object
	])
};

export default DiscussionDetails;
