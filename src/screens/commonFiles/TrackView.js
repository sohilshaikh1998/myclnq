import React from 'react';
import {BackHandler, Dimensions} from 'react-native';

import {AppUtils} from "../../utils/AppUtils";
import {WebView} from 'react-native-webview';
import {Actions} from 'react-native-router-flux';

const {width, height} = Dimensions.get('window');

class TrackView extends React.Component {
    constructor(props) {
        super(props);
        AppUtils.analyticsTracker("Privacy Policy");
    }
    componentDidMount(){
        AppUtils.console("WebUrl",this.props)
    }

    componentWillMount() {
        BackHandler.addEventListener("hardwareBackPress", () => {
            this.goBack();
            return true;
        })
    }

    goBack() {
        Actions.pop();
    }


    render() {
        return (
            <WebView
                source={{uri: this.props.url}}
                androidHardwareAccelerationDisabled={true}

                style={{height: height, width: width}}

            />
        )
    }


}

export default TrackView;
