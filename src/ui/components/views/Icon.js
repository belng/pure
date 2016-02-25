import React from 'react';
import ReactNative from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const {
	Text
} = ReactNative;

export default class Icon extends React.Component {
	setNativeProps(nativeProps) {
		this._root.setNativeProps(nativeProps);
	}

	render() {
		return (
			<MaterialIcons
				ref={c => (this._root = c)}
				allowFontScaling={false}
				{...this.props}
			/>
		);
	}
}

Icon.propTypes = {
	style: Text.propTypes.style
};
