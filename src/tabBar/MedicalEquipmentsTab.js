import {Dimensions, Image, Platform, StyleSheet, View} from 'react-native';
import React from 'react';
import {Actions} from 'react-native-router-flux';
import {AppColors} from "../shared/AppColors";
import {AppUtils} from "../utils/AppUtils";
import {moderateScale, verticalScale} from "../utils/Scaling";
import {heightPercentageToDP} from "react-native-responsive-screen";

const {width, height} = Dimensions.get('window');


const inactiveCompass = require('../../assets/images/shop_medpro.png');
const activeCompass = require('../../assets/images/shop_medpro_fill.png');
const inactiveCalender = require('../../assets/images/open_box_medpro.png');
const activeCalender = require('../../assets/images/open_box-medpro_fill.png');
const inactiveUser = require('../../assets/images/user_medpro.png');
const activeUser = require('../../assets/images/user_medpro_fill.png');
const inactiveNotification = require('../../assets/images/notification_medpro.png');
const activeNotification = require('../../assets/images/notification_medpro_fill.png');


export default class MedicalEquipmentsTab extends React.Component {

    constructor(props) {
        super(props);
    }

    componentWillMount() {
        if (this.props.isMedicalEquipmentProfileUpdated) {
            Actions.MedicalEquipmentProfile();
        } else if (this.props.isMedicalEquipmentBookingUpdated) {
            Actions.MedicalEquipmentBooking();
        } else if (this.props.isMedicalEquipmentNotifictionUpdated) {
            Actions.MedicalEquipmentNotification();
        }
    }

    render() {
        return (
            (Platform.OS === 'ios') ? this.renderIOS() : this.renderAndroid()
        )
    }

    renderIOS() {
        AppUtils.console("TAB_PROPS", this.props.focused, this.props.sceneKey);
        let focused = this.props.focused;
        let sceneKey = this.props.sceneKey;
        let image = activeCompass;
        switch (sceneKey) {
            case 'MedicalEquipmentHome':
                image = focused ? activeCompass : inactiveCompass;
                break;

            case 'MedicalEquipmentBooking':
                image = focused ? activeCalender : inactiveCalender;
                break;

            case 'MedicalEquipmentProfile':
                image = focused ? activeUser : inactiveUser;
                break;

            case 'MedicalEquipmentNotification':
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
                    style={{flex: 1, height: verticalScale(30), width: moderateScale(30), alignSelf: 'center'}}
                />
            </View>
        )
    }

    renderAndroid() {
        var isProfileUpdated = this.props.isMedicalEquipmentProfileUpdated
        var isBookingUpdated = this.props.isMedicalEquipmentBookingUpdated;
        var isNotifictionUpdated = this.props.isMedicalEquipmentNotifictionUpdated;
        let focused = this.props.focused;
        let sceneKey = this.props.sceneKey;
        AppUtils.console("SceneKey :    >>>>>>>", sceneKey, focused)
        let image = activeCompass;

        AppUtils.console("SEdfvdxd", this.props)
        switch (sceneKey) {
            case 'MedicalEquipmentHome':
                image = focused ? activeCompass : inactiveCompass;
                break;

            case 'MedicalEquipmentBooking':
                image = isBookingUpdated ? activeCalender : focused ? activeCalender : inactiveCalender;
                break;

            case 'MedicalEquipmentProfile':
                image = isProfileUpdated ? activeUser : focused ? activeUser : inactiveUser;
                break;

            case 'MedicalEquipmentNotification':
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
