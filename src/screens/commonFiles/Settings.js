import React from 'react';
import {
    Alert,
    BackHandler,
    Dimensions,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableHighlight,
    View,
    I18nManager
} from 'react-native';
import Share from 'react-native-share';
import {Actions} from 'react-native-router-flux';
import {AppStyles} from '../../shared/AppStyles'
import {moderateScale, verticalScale} from '../../utils/Scaling';
import {AppColors} from "../../shared/AppColors";
import {SHApiConnector} from "../../network/SHApiConnector";
import {AppUtils} from "../../utils/AppUtils";
import {AppStrings} from "../../shared/AppStrings";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import AsyncStorage from '@react-native-community/async-storage';
import { strings } from '../../locales/i18n';
import { revokeAccessToken } from '../../network/vitalApi';


const {width, height} = Dimensions.get('window');
const isRTL = I18nManager.isRTL;
var dt = new Date();
dt.setDate(dt.getDate());
var _dt = dt;


class Settings extends React.Component {

    constructor(props) {
        super(props);
        AppUtils.analyticsTracker("Settings");
        this.manageLogout = this.manageLogout.bind(this);
        this.logout = this.logout.bind(this);
        this.state = {
            value: AppUtils.maxDistance,
            logoutText: "Login to MyCLNQ",
            isJustLoginUser:false,
            corporatePlan: false
        }

        this.getFilter = this.getFilter.bind(this);
    }

    componentDidMount() {
        this.getUserDetails();
    }


    componentWillMount() {
        this.getFilter();
        this.manageLogout();
        BackHandler.addEventListener("hardwareBackPress", () => {
            this.goBack();
            return true;
        })
    }

    goBack() {
        Actions.pop();
    }
    async getUserDetails(){
        let userData = await AsyncStorage.getItem(AppStrings.contracts.LOGGED_IN_USER);
        let user = await JSON.parse(userData)
        if(user.company == null || user.company == undefined) {
            this.setState({
                corporatePlan: false
            })
        } else {
            this.setState({
                corporatePlan: true
            })
        }
        this.setState({isJustLoginUser:user.isJustLoginUser})
    }

    async manageLogout() {
        let self = this;
        await AppUtils.isUserLoggedIn() ? (self.setState({logoutText: strings('common.common.logout')})) : (self.setState({logoutText: "Login to MyCLNQ "}))
    }


    getFilter(val) {
        var self = this;
        self.setState({value: val})

        AppUtils.maxDistance = self.state.value;

        var distance = {
            maximumDistance: (self.state.value) * 1000,
        }
    }

    sureLogout() {
        Alert.alert('', strings('common.common.sureWantToLogout'), [
          { text: strings('common.common.logout'), onPress: () => this.logout() },
          { text: strings('doctor.button.cancel') },
        ]);
      }

    async logout() {
        let self = this;
        let isUserLoggedIn = await AppUtils.isUserLoggedIn();
        const accessToken = await AsyncStorage.getItem(AppStrings.fitBitToken.ACCESS_TOKEN);
        await revokeAccessToken(accessToken).catch((error)=>{
            console.log(error,'error in revoking fitbit token')
        })

        if (isUserLoggedIn) {
            SHApiConnector.logout(function (err, stat) {
                if (stat) {
                    try {
                        if (stat.logOutStatus) {
                            AppUtils.logoutNoNav();
                            self.manageLogout();

                            Alert.alert(
                                strings('common.common.logout'),
                                strings('common.common.logoutSuccess'),
                                [
                                    {text: strings('doctor.button.ok'), onPress: () =>  Actions.LoginOptions()
                                }
                                ]
                            );
                        } else {
                            AppUtils.logoutNoNav();
                            self.manageLogout();
                            Actions.LoginOptions()
                        }
                    } catch (err) {
                        console.error(err)
                    }
                }
            })
        } else {
            Actions.LoginOptions()
        }
    }

    privacyPolicy() {
        Actions.PrivacyPolicy();
    }

    feedBack() {
        Actions.Feedback();
    }

    deleteFeedback() {
        Actions.DeleteFeedback();
    }

    mySubscriptions() {
        Actions.MySubscriptions();
    }

    corporatePlan() {
        Actions.CorporatePlan();
    }

    about() {
        Actions.About();
    }


    helpAndSupport() {
        Actions.HelpAndSupport();
    }

    termsAndConditions() {
        Actions.TermsAndConditions();
    }

    async updateNumber(){
        let userDetails = JSON.parse(await AsyncStorage.getItem('logged_in_user'));
        let countryDetails = AppUtils.getCountryDetails(userDetails.countryCode);
        countryDetails.phoneNumber = userDetails.phoneNumber;
        Actions.UpdateRegistrationNumber({countryDetails});
    }

    async changePwd(){
        let userDetails = JSON.parse(await AsyncStorage.getItem('logged_in_user'));
        let countryDetails = AppUtils.getCountryDetails(userDetails.countryCode);
        let data = {
            cca2: countryDetails.code,
            countryCode: countryDetails.dial_code,
            numberLimit: countryDetails.dial_code == '91' ? 10 :countryDetails.dial_code == '65' ? 8 : countryDetails.dial_code == '62' ? 13 : 12,
            mobileNumber: userDetails.phoneNumber,
            countryName: countryDetails.name,
            isUserLoggedIn: true
        }
        AppUtils.console('sdzfasfdsfzd', data);
        Actions.ForgetPassword(data);
    }

    render() {

        let distance = (this.state.value) * 1000;
        const sliderWidth = AppUtils.isIphone ? (AppUtils.screenWidth / 2.2) : 250;
        const sliderLeft = AppUtils.isIphone ? (0) : 40;

        AppUtils.console("segfh34566t", AppStrings.myClnqVersionName);
        let shareApp = {
            title: strings('common.common.share'),
            message: (Platform.OS === 'ios') ? strings('common.common.checkForAppStore') : strings('common.common.checkForPlayStore'),
            url: (Platform.OS === 'ios') ? "https://itunes.apple.com/us/app/myclnq/id1436460772?ls=1&mt=8" : 'https://play.google.com/store/apps/details?id=com.ssivixlab.MYCLNQ',
            subject: "Share Application"
        };

        return (
            <ScrollView style={{backgroundColor: AppColors.whiteColor, width: width}}>
                <View style={{
                    height: verticalScale(50),
                    backgroundColor: AppColors.primaryColor,
                    justifyContent: 'center'
                }}>
                    <Text style={{
                        color: AppColors.whiteColor,
                        fontFamily: AppStyles.fontFamilyMedium,
                        marginLeft: moderateScale(20),
                        fontSize: moderateScale(15),
                        textAlign: isRTL ? 'left' : 'auto',
                    }}>{strings('common.common.general')}</Text>
                </View>

                <View style={{backgroundColor: AppColors.whiteColor, justifyContent: 'center'}}>
                    <TouchableHighlight onPress={() => this.about()} underlayColor='transparent'>
                        <Text style={{
                            color: AppColors.blackColor,
                            fontFamily: AppStyles.fontFamilyMedium,
                            margin: moderateScale(20),
                            fontSize: moderateScale(15),
                            textAlign: isRTL ? 'left' : 'auto',

                        }}>{strings('common.common.about')}</Text>

                    </TouchableHighlight>

                    <TouchableHighlight onPress={() => this.helpAndSupport()} underlayColor='transparent'>
                        <Text style={{
                            color: AppColors.blackColor,
                            fontFamily: AppStyles.fontFamilyMedium,
                            margin: moderateScale(20),
                            fontSize: moderateScale(15),
                            textAlign: isRTL ? 'left' : 'auto',
                        }}>{strings('common.common.helpSupport')}</Text>
                    </TouchableHighlight>
                    <TouchableHighlight onPress={() => this.termsAndConditions()} underlayColor='transparent'>
                        <Text style={{
                            color: AppColors.blackColor,
                            fontFamily: AppStyles.fontFamilyMedium,
                            margin: moderateScale(20),
                            fontSize: moderateScale(15),
                            textAlign: isRTL ? 'left' : 'auto',
                        }}>{strings('common.common.termConditon')}</Text>
                    </TouchableHighlight>

                    <TouchableHighlight onPress={() => this.privacyPolicy()} underlayColor='transparent'>
                        <Text style={{
                            color: AppColors.blackColor,
                            fontFamily: AppStyles.fontFamilyMedium,
                            margin: moderateScale(20),
                            fontSize: moderateScale(15),
                            textAlign: isRTL ? 'left' : 'auto',
                        }}>{strings('common.common.privacy')}</Text>
                    </TouchableHighlight>
                    <TouchableHighlight onPress={() => Share.open(shareApp)} underlayColor='transparent'>
                        <Text style={{
                            color: AppColors.blackColor,
                            fontFamily: AppStyles.fontFamilyMedium,
                            margin: moderateScale(20),
                            fontSize: moderateScale(15),
                            textAlign: isRTL ? 'left' : 'auto',
                        }}>{strings('common.common.share')}</Text>
                    </TouchableHighlight>
                    <TouchableHighlight onPress={() => this.feedBack()} underlayColor='transparent'>
                        <Text style={{
                            color: AppColors.blackColor,
                            fontFamily: AppStyles.fontFamilyMedium,
                            margin: moderateScale(20),
                            fontSize: moderateScale(15),
                            textAlign: isRTL ? 'left' : 'auto',
                        }}>{strings('common.common.sendFeedback')}</Text>
                    </TouchableHighlight>                  
                </View>
                <View style={{
                    height: verticalScale(50),
                    backgroundColor: AppColors.primaryColor,
                    justifyContent: 'center'
                }}>
                    <Text style={{
                        color: AppColors.whiteColor,
                        fontFamily: AppStyles.fontFamilyMedium,
                        marginLeft: moderateScale(20),
                        fontSize: moderateScale(15),
                        textAlign: isRTL ? 'left' : 'auto',
                    }}>{strings('common.common.account')}</Text>
                </View>
                {  !this.state.isJustLoginUser? (
             <View>
             {
                this.state.corporatePlan == false ?  <TouchableHighlight onPress={() => this.mySubscriptions()} underlayColor='transparent'>
                        <Text style={{
                            color: AppColors.blackColor,
                            fontFamily: AppStyles.fontFamilyMedium,
                            margin: moderateScale(20),
                            fontSize: moderateScale(15),
                            textAlign: isRTL ? 'left' : 'auto',
                        }}>{strings('common.titles.mySubscriptions')}</Text>
                    </TouchableHighlight>
                    : <TouchableHighlight onPress={() => this.corporatePlan()} underlayColor='transparent'>
                        <Text style={{
                            color: AppColors.blackColor,
                            fontFamily: AppStyles.fontFamilyMedium,
                            margin: moderateScale(20),
                            fontSize: moderateScale(15),
                            textAlign: isRTL ? 'left' : 'auto',
                        }}>{strings('common.titles.corporatePlan')}</Text>
                    </TouchableHighlight>
             }
             
             <TouchableHighlight style={{
                    height: verticalScale(50),
                    backgroundColor: AppColors.whiteColor,
                    justifyContent: 'center',
                    marginTop: 10,
                }} onPress={() => this.updateNumber()} underlayColor='transparent'>
                    <Text style={{
                        color: AppColors.blackColor,
                        fontFamily: AppStyles.fontFamilyMedium,
                        marginLeft: moderateScale(20),
                        fontSize: moderateScale(15),
                        textAlign: isRTL ? 'left' : 'auto',
                    }}>{strings('common.common.updateNumber')}</Text>
                </TouchableHighlight>

                <TouchableHighlight style={{
                    height: verticalScale(50),
                    backgroundColor: AppColors.whiteColor,
                    justifyContent: 'center',
                    marginTop: 10,
                }} onPress={() => this.changePwd()} underlayColor='transparent'>
                    <Text style={{
                        color: AppColors.blackColor,
                        fontFamily: AppStyles.fontFamilyMedium,
                        marginLeft: moderateScale(20),
                        fontSize: moderateScale(15),
                        textAlign: isRTL ? 'left' : 'auto',
                    }}>{strings('common.common.changePwd')}</Text>
                </TouchableHighlight>

                <TouchableHighlight style={{
                    height: verticalScale(50),
                    backgroundColor: AppColors.whiteColor,
                    justifyContent: 'center',
                    marginTop: 10,
                }} onPress={() => this.deleteFeedback()} underlayColor='transparent'>
                    <Text style={{
                        color: AppColors.blackColor,
                        fontFamily: AppStyles.fontFamilyMedium,
                        marginLeft: moderateScale(20),
                        fontSize: moderateScale(15),
                        textAlign: isRTL ? 'left' : 'auto',
                    }}>{strings('common.common.deleteAccount')}</Text>
                </TouchableHighlight> 
                </View>)
                : null
    }
                <TouchableHighlight style={{
                    height: verticalScale(50),
                    backgroundColor: AppColors.whiteColor,
                    justifyContent: 'center',
                    marginBottom: 20
                }} onPress={() => this.sureLogout()} underlayColor='transparent'>
                    <Text style={{
                        color: AppColors.blackColor,
                        fontFamily: AppStyles.fontFamilyMedium,
                        marginLeft: moderateScale(20),
                        fontSize: moderateScale(15),
                        textAlign: isRTL ? 'left' : 'auto',
                    }}>{this.state.logoutText}</Text>
                </TouchableHighlight>
                <View style={{justifyContent: 'center', alignItems: 'center'}}>
                    <Image resize={'contain'} style={{width: wp(15), height: hp(10)}}
                           source={require('../../../assets/images/clnq_main_logo.png')}
                    />
                    <Text style={{
                        color: AppColors.primaryColor,
                        fontFamily: AppStyles.fontFamilyMedium,
                        //margin: moderateScale(10),
                        fontSize: moderateScale(15),
                        textAlign: isRTL ? 'left' : 'auto',
                    }}>MyCLNQ v{AppStrings.myClnqVersionName}</Text>
                </View>

            </ScrollView>
        )
    }
}


const styles = StyleSheet.create({

    distance: {
        fontSize: 20,
        textAlign: 'right',
        marginTop: 20,
        color: AppColors.blackColor
    },

})

export default Settings;
