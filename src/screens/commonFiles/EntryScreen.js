import React from 'react';
import {Image, View} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {Actions} from 'react-native-router-flux';
import {AppStrings} from "../../shared/AppStrings";
import {AppColors} from "../../shared/AppColors";
import {SHApiConnector} from "../../network/SHApiConnector";
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';
import {AppUtils} from "../../utils/AppUtils";
import { strings } from '../../locales/i18n';

class EntryScreen extends React.Component {
    constructor(props) {
        super(props);
        AppUtils.analyticsTracker('Entry Screen');
    }


    componentWillMount() {
        this.checkIsUserLoggedIn();
    }



    async checkIsUserLoggedIn() {
        try {
            this.setState({isLoading: true, isRefreshing: false})
            const isLoggedIn = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.IS_LOGGED_IN));
            this.setState({isLoading: false});
            if (isLoggedIn && isLoggedIn.isLoggedIn) {
                const isProfileAvail = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.IS_PROFILE_AVAILABLE));
                if (isProfileAvail) {
                    if (isProfileAvail.isProfileAvailable) {
                        Actions.MainScreen();
                    } else {
                        Actions.UserSignUp({isNewUser:false});
                    }
                } else {
                    this.checkUserProfileAvailability();
                }
            } else {
                // Actions.LoginMobile();
                Actions.LoginOptions()
            }
        } catch (e) {
            // Actions.LoginMobile();
            Actions.LoginOptions()
        }
    }

    async checkUserProfileAvailability() {
        var self = this;

        try {
            let response = await SHApiConnector.checkUserProfileAvailability();
            if (response.data.status) {
                await AsyncStorage.setItem(AppStrings.contracts.IS_PROFILE_AVAILABLE, JSON.stringify({isProfileAvailable: response.data.isProfileAvailable}));
                if (response.data.isProfileAvailable) {
                    await AsyncStorage.setItem(AppStrings.contracts.LOGGED_IN_USER_DETAILS, JSON.stringify(response.data.response));
                    Actions.MainScreen();
                } else {
                    Actions.UserSignUp({isNewUser:false});
                }
            } else {
                Actions.MainScreen();
            }
        } catch (e) {
            Actions.MainScreen();
            AppUtils.console("USER_PROFILE_AVAILABILITY_ERROR", e)
        }
    }


    render() {
        return (
            <View style={{
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: AppColors.primaryColor,
                flex: 1
            }}>
                <Image
                    style={{height: hp(20), width: hp(20)}}
                    resizeMode={'contain'}
                    source={require('../../../assets/images/clnq_main_logo.png')}></Image>
            </View>
        )
    }
}


export default EntryScreen;
