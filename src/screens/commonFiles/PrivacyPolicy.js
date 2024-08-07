import React from 'react';
import {BackHandler, Dimensions} from 'react-native';

import {AppUtils} from "../../utils/AppUtils";
import {WebView} from 'react-native-webview';
import {Actions} from 'react-native-router-flux';
import { strings } from '../../locales/i18n';

const {width, height} = Dimensions.get('window');

class PrivacyPolicy extends React.Component {
    constructor(props) {
        super(props);
        AppUtils.analyticsTracker("Privacy Policy");
    }

    componentWillMount() {
        BackHandler.addEventListener("hardwareBackPress", () => {
            this.goBack();
            return true;
        })
    }

    goBack() {
        Actions.Settings();
    }


    render() {
        return (
            <WebView
                androidHardwareAccelerationDisabled={true}
                source={{uri: 'http://myclnq.co/privacypolicy.htm'}}
                style={{height: height, width: width}}
            />
        )
    }


}

export default PrivacyPolicy;
