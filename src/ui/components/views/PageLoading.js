import React from 'react-native';
import LoadingItem from './LoadingItem';
import Page from './Page';

export default class PageLoading extends React.Component {
	render() {
		return (
			<Page {...this.props}>
				<LoadingItem />
			</Page>
		);
	}
}
