import React, {PureComponent} from 'react';
import {Dimensions, StyleSheet, Text, View} from 'react-native';
import {AppColors} from "../shared/AppColors";
import NetInfo from "@react-native-community/netinfo";
import {strings} from '../locales/i18n'

const {height, width} = Dimensions.get('window');

function MiniOfflineSign() {
    return (
        <View style={styles.offlineContainer}>
            <Text style={styles.offlineText}>{strings('shared.noInternet')}</Text>
        </View>
    );
}


class CheckInternet extends PureComponent {
    state = {
        isConnected: true
    };

    async componentDidMount() {
        let checkInternetConnectivity = await NetInfo.fetch();
        this.setState({isConnected: checkInternetConnectivity.isConnected});
    }

    render() {
        if (!this.state.isConnected) {
            return <MiniOfflineSign/>;
        }
        return null;
    }
}

const styles = StyleSheet.create({
    offlineContainer: {
        backgroundColor: '#b52424',
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        width: width,
        position: 'absolute',
        top: 30
    },
    onlineContainer: {
        backgroundColor: AppColors.greenColor,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        width: width,
        position: 'absolute',
        top: 30
    },
    offlineText: {color: '#fff'}
});

export default CheckInternet;