import * as React from 'react';

import Icon from 'react-native-vector-icons/FontAwesome';

const ToggleIcon = ({ isDeviceConnected, onPress }) => {
  return isDeviceConnected ? (
    <Icon name="toggle-on" size={20} color={'green'} onPress={onPress} />
  ) : (
    <Icon name="toggle-off" size={20} color={'red'} onPress={onPress} />
  );
};

export default ToggleIcon;
