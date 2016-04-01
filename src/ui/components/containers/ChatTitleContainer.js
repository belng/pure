/* @flow */

import React, { PropTypes } from 'react';
import Connect from '../../../modules/store/Connect';
import ChatTitle from '../views/ChatTitle';

const getRelationsCount = result => {
	if (result) {
		if (result[0] && result[0].type === 'loading') {
			return 0;
		} else {
			return result.length;
		}
	} else {
		return 0;
	}
};

const ChatTitleContainer = (props: any) => {
	return (
		<Connect
			mapSubscriptionToProps={{
				thread: {
					key: {
						type: 'entity',
						id: props.thread
					}
				},
				relations: {
					key: {
						slice: {
							type: 'rel',
							link: {
								user: 'user'
							},
							filter: {
								item: props.thread
							},
							order: 'presenceTime'
						},
						range: {
							start: Infinity,
							before: 100,
							after: 0
						}
					},
					transform: getRelationsCount
				}
			}}
			passProps={props}
			component={ChatTitle}
		/>
	);
};

ChatTitleContainer.propTypes = {
	thread: PropTypes.string.isRequired
};

export default ChatTitleContainer;
