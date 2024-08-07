import {Dimensions, Image, Platform, StyleSheet, View} from 'react-native';
import React from 'react';
import {Actions} from 'react-native-router-flux';
import {AppColors} from "../shared/AppColors";
import {AppUtils} from "../utils/AppUtils";
import {moderateScale, verticalScale} from "../utils/Scaling";
import {heightPercentageToDP} from "react-native-responsive-screen";
import images from "../utils/images"


const {width, height} = Dimensions.get('window');


const inactiveCompass = images.inactiveCompass;
const activeCompass = images.activeCompass;
const inactiveCalender = images.inactiveCalender;
const activeCalender = images.activeCalender;
const inactiveUser = images.inactiveUser;
const activeUser = images.activeUser;
const inactiveNotification = images.inactiveNotification;
const activeNotification = images.activeNotification;


export default class CaregiverTab extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        AppUtils.console("CareGiverTabs", this.props);
    }

    componentWillMount() {
        if (this.props.isCaregiverProfileUpdated) {
            Actions.CaregiverProfile();
        } else if (this.props.isCaregiverBookingUpdated) {
            Actions.CaregiverRequest();
        } else if (this.props.isCaregiverNotifictionUpdated) {
            Actions.CaregiverNotification();
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
            case 'CaregiverHome':
                image = focused ? activeCompass : inactiveCompass;
                break;

            case 'CaregiverRequest':
                image = focused ? activeCalender : inactiveCalender;
                break;

            case 'CaregiverProfile':
                image = focused ? activeUser : inactiveUser;
                break;

            case 'CaregiverNotification':
                image = focused ? activeNotification : inactiveNotification;
                break;
        }

        let topM = AppUtils.isX ? 0 : 0;
        return (
            <View
                style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    alignSelf: 'center',
                    borderColor: AppColors.primaryColor,
                    borderTopWidth: heightPercentageToDP(.1),
                    justifyContent: 'center',
                    backgroundColor: AppColors.whiteColor,
                    marginTop: topM
                }}>
                <Image
                    source={image}
                    resizeMode='contain'
                    style={{flex: 1, height: verticalScale(20), width: moderateScale(20), alignSelf: 'center'}}
                />
            </View>
        )
    }

    renderAndroid() {
        var isProfileUpdated = this.props.isCaregiverProfileUpdated
        var isBookingUpdated = this.props.isCaregiverBookingUpdated;
        var isNotifictionUpdated = this.props.isCaregiverNotifictionUpdated;
        let focused = this.props.focused;
        let sceneKey = this.props.sceneKey;
        AppUtils.console("SceneKey :    >>>>>>>", sceneKey, focused)
        let image = activeCompass;

        AppUtils.console("SEdfvdxd", this.props)
        switch (sceneKey) {
            case 'CaregiverHome':
                image = focused ? activeCompass : inactiveCompass;
                break;

            case 'CaregiverRequest':
                image = isBookingUpdated ? activeCalender : focused ? activeCalender : inactiveCalender;
                break;

            case 'CaregiverProfile':
                image = isProfileUpdated ? activeUser : focused ? activeUser : inactiveUser;
                break;

            case 'CaregiverNotification':
                image = isNotifictionUpdated ? activeNotification : focused ? activeNotification : inactiveNotification;
                break;
        }

        let topM = AppUtils.isX ? 10 : 0;
        return (
            <View
                style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    alignSelf: 'center',
                    borderColor: AppColors.lightGray,
                    borderTopWidth: heightPercentageToDP(.1),
                    justifyContent: 'center',
                    backgroundColor: AppColors.whiteColor,
                    marginTop: topM
                }}>
                <Image
                    source={image}
                    resizeMode='contain'
                    style={{flex: 1, height: verticalScale(20), width: moderateScale(20), alignSelf: 'center'}}
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
