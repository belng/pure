/* @flow */

import type { Route } from '../../lib/RouteTypes';
import NotificationIcon from '../components/views/NotificationIcon';
import AccountButton from '../components/views/Account/AccountButton';
import ShareButtonContainer from '../components/containers/ShareButtonContainer';
import DiscussionsDetailsContainer from '../components/containers/DiscussionDetailsContainer';
import ChatContainer from '../components/containers/ChatContainer';
import ChatTitleContainer from '../components/containers/ChatTitleContainer';
import RoomTitleContainer from '../components/containers/RoomTitleContainer';
import DiscussionsContainer from '../components/containers/DiscussionsContainer';
import NotificationCenterContainer from '../components/containers/NotificationCenterContainer';
import NotificationClearIconContainer from '../components/containers/NotificationClearIconContainer';
import RoomsContainer from '../components/containers/RoomsContainer';
import AccountContainer from '../components/containers/AccountContainer';
import SignUpContainer from '../components/containers/SignUpContainer';
import StartDiscussionContainer from '../components/containers/StartDiscussionContainer';
import MyRoomsContainer from '../components/containers/MyRoomsContainer';
import { config } from '../../core-client';

type RouteDescription = {
	title?: string;
	titleComponent?: Function;
	leftComponent?: Function;
	rightComponent?: Function;
	component: ReactClass;
}

export default function(route: Route): RouteDescription {
	switch (route.name) {
	case 'room':
		return {
			titleComponent: RoomTitleContainer,
			rightComponent: NotificationIcon,
			component: DiscussionsContainer,
		};
	case 'chat':
		return {
			titleComponent: ChatTitleContainer,
			rightComponent: NotificationIcon,
			component: ChatContainer,
		};
	case 'notes':
		return {
			title: 'Notifications',
			component: NotificationCenterContainer,
			rightComponent: NotificationClearIconContainer
		};
	case 'account':
		return {
			title: 'My account',
			component: AccountContainer
		};
	case 'places':
		return {
			title: 'My places',
			component: MyRoomsContainer
		};
	case 'details':
		return {
			title: 'Details',
			component: DiscussionsDetailsContainer,
			rightComponent: ShareButtonContainer
		};
	case 'onboard':
		return {
			title: 'Sign in',
			component: SignUpContainer,
		};
	case 'compose':
		return {
			title: 'Start new discussion',
			component: StartDiscussionContainer,
		};
	default:
		return {
			title: config.app_name,
			leftComponent: AccountButton,
			rightComponent: NotificationIcon,
			component: RoomsContainer
		};
	}
}
