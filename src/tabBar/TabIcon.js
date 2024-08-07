import {Dimensions, Image, Platform, StyleSheet, View} from 'react-native';
import React from 'react';
import {Actions} from 'react-native-router-flux';
import {AppColors} from "../shared/AppColors";
import {AppUtils} from "../utils/AppUtils";
import {moderateScale, verticalScale} from "../utils/Scaling";

const {width, height} = Dimensions.get('window');


const inactiveCompass = require('../../assets/images/compass_inactive.png');
const activeCompass = require('../../assets/images/compass_active.png');
const inactiveCalender = require('../../assets/images/calendar_inactive.png');
const activeCalender = require('../../assets/images/calendar_active.png');
const inactiveUser = require('../../assets/images/unactive_user.png');
const activeUser = require('../../assets/images/active_user.png');
const inactiveNotification = require('../../assets/images/notifcation_inactive.png');
const activeNotification = require('../../assets/images/notifcation_active.png');


export default class TabIcon extends React.Component {

    constructor(props) {
        super(props);
    }


    componentWillReceiveProps(props) {
    }

    componentWillMount() {
        if (this.props.isProfileUpdated) {
            Actions.Profile();
        } else if (this.props.isAppointmentUpdated) {
            Actions.MyAppointments();
        } else if (this.props.isNotifictionUpdated) {
            Actions.Notifications();
        }
    }

    render() {
        return (
            (Platform.OS === 'ios') ? this.renderIOS() : this.renderAndroid()
        )
    }

    renderIOS() {
        let focused = this.props.focused;
        let sceneKey = this.props.sceneKey;
        let image = activeCompass;
        switch (sceneKey) {
            case 'HomeScreen':
                image = focused ? activeCompass : inactiveCompass;
                break;

            case 'MyAppointments':
                image = focused ? activeCalender : inactiveCalender;
                break;

            case 'Profile':
                image = focused ? activeUser : inactiveUser;
                break;

            case 'Notifications':
                image = focused ? activeNotification : inactiveNotification;
                break;
        }

        let topM = AppUtils.isX ? 10 : 0;
        return (
            <View style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                alignSelf: 'center',
                justifyContent: 'center',
                marginTop: topM
            }}>
                <Image
                    source={image}
                    resizeMode='contain'
                    style={{flex: 1, height: verticalScale(30), width: moderateScale(30), alignSelf: 'center'}}
                />
            </View>
        )
    }

    renderAndroid() {
        var isProfileUpdated = this.props.isProfileUpdated
        var isAppointmentUpdated = this.props.isAppointmentUpdated;
        var isNotifictionUpdated = this.props.isNotifictionUpdated;
        let focused = this.props.focused;
        let sceneKey = this.props.sceneKey;
        AppUtils.console("SceneKey :    >>>>>>>", sceneKey, focused)
        let image = activeCompass;
        switch (sceneKey) {
            case 'HomeScreen':
                image = focused ? activeCompass : inactiveCompass;
                break;

            case 'MyAppointments':
                image = isAppointmentUpdated ? activeCalender : focused ? activeCalender : inactiveCalender;
                break;

            case 'Profile':
                image = isProfileUpdated ? activeUser : focused ? activeUser : inactiveUser;
                break;

            case 'Notifications':
                image = isNotifictionUpdated ? activeNotification : focused ? activeNotification : inactiveNotification;
                break;
        }

        let topM = AppUtils.isX ? 10 : 0;
        return (
            <View style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                alignSelf: 'center',
                justifyContent: 'center',
                marginTop: topM
            }}>
                <Image
                    source={image}
                    resizeMode='contain'
                    style={{flex: 1, height: verticalScale(30), width: moderateScale(30), alignSelf: 'center'}}
                />
            </View>
        )
    }


}


const styles = StyleSheet.create({
    mapContainer: {
        backgroundColor: 'transparent',
        position: 'absolute',
        height: verticalScale(50),
        width: width,
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    tabView: {
        width: width,
        height: AppUtils.isX ? verticalScale(50 + 20) : verticalScale(50),
        backgroundColor: AppColors.whiteColor,
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        alignSelf: 'center',
        marginBottom: AppUtils.isX ? 20 : 0
    }
})