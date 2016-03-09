/* @flow */

import React, { Component } from 'react';
import shallowEqual from 'shallowequal';
import LoadingItem from './LoadingItem';
import Page from './Page';

export default class PageLoading extends Component<void, any, void> {
	shouldComponentUpdate(nextProps: any): boolean {
		return !shallowEqual(this.props, nextProps);
	}

	render() {
		return (
			<Page {...this.props}>
				<LoadingItem />
			</Page>
		);
	}
}
