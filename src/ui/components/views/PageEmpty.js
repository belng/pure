import React from 'react-native';
import AppText from './AppText';
import Page from './Page';

const {
	StyleSheet,
	Image
} = React;

const styles = StyleSheet.create({
	missing: {
		margin: 16,
		textAlign: 'center',
		fontSize: 16,
		lineHeight: 24
	},
});

export default class PageEmpty extends React.Component {
	shouldComponentUpdate(nextProps) {
		return (
			this.props.label !== nextProps.label ||
			this.props.image !== nextProps.image
		);
	}

	_getImageSource = name => {
		switch (name) {
		case 'cool':
			return require('../../../../assets/monkey-cool.png');
		case 'happy':
			return require('../../../../assets/monkey-happy.png');
		case 'meh':
			return require('../../../../assets/monkey-meh.png');
		case 'sad':
			return require('../../../../assets/monkey-sad.png');
		default:
			return null;
		}
	};

	render() {
		return (
			<Page {...this.props}>
				{this.props.image ?
					<Image source={this._getImageSource(this.props.image)} /> :
					null
				}
				{this.props.label ?
					<AppText style={styles.missing}>{this.props.label}</AppText> :
					null
				}
			</Page>
		);
	}
}

PageEmpty.propTypes = {
	label: React.PropTypes.string,
	image: React.PropTypes.any
};
