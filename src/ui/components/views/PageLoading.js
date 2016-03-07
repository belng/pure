/* @flow */

import React, { Component } from 'react';
import LoadingItem from './LoadingItem';
import Page from './Page';

export default class PageLoading extends Component {
	render() {
		return (
			<Page {...this.props}>
				<LoadingItem />
			</Page>
		);
	}
}
