import {AppRegistry, Text, TextInput} from 'react-native';
import App from './src/Navigation';
import firebaseNotifications from "./src/utils/firebaseNotifications";
import messaging from '@react-native-firebase/messaging';
import {AppUtils} from "./src/utils/AppUtils";
import { TextInput as GextureTextInput } from 'react-native-gesture-handler';

console.disableYellowBox = true;

AppRegistry.registerComponent('smartHelpRequester', () => App);

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;
TextInput.defaultProps = TextInput.defaultProps || {}
TextInput.defaultProps.allowFontScaling = false;
GextureTextInput.defaultProps = GextureTextInput.defaultProps || {}
GextureTextInput.defaultProps.allowFontScaling = false;


//Trackflow.startTracking(AppStrings.trackflowId);

messaging().setBackgroundMessageHandler(async remoteMessage => {
    AppUtils.console('Message handled in the background index!', remoteMessage);
    await firebaseNotifications.backgroundNotification(remoteMessage.data);
});
