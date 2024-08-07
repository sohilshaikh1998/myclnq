import React from 'react';
import {
    Alert,
    BackHandler,
    Dimensions,
    FlatList,
    Image,
    Platform,
    RefreshControl,
    ScrollView,
    Text,
    TouchableHighlight,
    View
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import ElevatedView from 'react-native-elevated-view'
import moment from 'moment-timezone'
import {Actions} from 'react-native-router-flux';
import {AppStyles} from '../../shared/AppStyles'
import {AppStrings} from "../../shared/AppStrings";
import {moderateScale, verticalScale} from '../../utils/Scaling';
import {AppColors} from "../../shared/AppColors";
import {SHApiConnector} from "../../network/SHApiConnector";
import {AppUtils} from "../../utils/AppUtils";
import ProgressLoader from 'rn-progress-loader';

const {width, height} = Dimensions.get('window');
import {CachedImage,ImageCacheProvider} from '../../cachedImage';
import string from '../../locales/en/string';
import { strings } from '../../locales/i18n';


var dt = new Date();
dt.setDate(dt.getDate());
var _dt = dt;


class Notifications extends React.Component {

    constructor(props) {
        super();
        super(props);
        AppUtils.analyticsTracker("Medical Appointment Notifications");
        this.state = ({
            notifications: '',
            isLoading: false,
            isDataVisible: false,
            noNOtifications: false,
            isRefreshing: false,
            page: 1,
            isFooterLoading: false,
            clinicLogo: ''

        })

        this.getNotifications = this.getNotifications.bind(this);
    }

    componentWillMount() {
        this.getNotifications();
        BackHandler.addEventListener('hardwareBackPress', () => {
            this.goBack();
            return true;
        })
    }

    _onRefresh = () => {
        var self = this;
        self.setState({isRefreshing: true, page: 1})
        self.getNotifications(true);
    }


    getNotifications(isRefresh) {
        var self = this;
        var page = {
            page: (isRefresh == true) ? 1 : self.state.page
        };
        AppUtils.userSessionValidation(function (loggedIn) {
            if (!loggedIn) {
                self.setState({isLoading: false})
                Actions.LoginMobile({screen: 'notification'})
            } else {
                self.setState({isLoading: (self.state.isRefreshing) ? false : true});
                SHApiConnector.getNotifications(page, function (err, stat) {
                    self.setState({isLoading: false, isRefreshing: false})
                    try {
                        if (stat) {
                            if (stat.error_code == "10006") {
                                self.setState({isDataVisible: true})
                                Alert.alert(
                                    strings('doctor.alertTitle.userLoggedOut'),
                                    strings('doctor.alertMsg.loginFirst'),
                                    [
                                        {text: strings('doctor.button.loging'), onPress: () => self.login()},
                                    ]
                                )
                            } else if (stat.notificationList.length > 0) {
                                if (stat.notificationList.length < 10) {
                                    self.setState({isFooterLoading: false})
                                } else {
                                    self.setState({isFooterLoading: true})
                                }
                                if (self.state.page == 1) {
                                    self.setState({
                                        notifications: stat.notificationList,
                                        noNotifications: false,
                                        isRefreshing: false,
                                        page: self.state.page + 1,
                                        isDataVisible: true
                                    })
                                } else {
                                    self.setState({
                                        notifications: [...self.state.notifications, ...stat.notificationList],
                                        page: (self.state.page) + 1,
                                        isDataVisible: true
                                    })
                                }

                            } else if (stat.notificationList.length == 0) {
                                self.setState({
                                    noNotifications: true,
                                    isRefreshing: false,
                                    isDataVisible: true
                                })
                            }
                        }
                    } catch (e) {
                        console.error(e)
                    }
                })
            }
        })

    }

    login() {
        Actions.LoginMobile({screen: 'notification'});
    }

    goBack() {
        Actions.HomeScreenDash();
    }

    render_footer() {
        return (
            <ElevatedView elevation={10}>
                {(this.state.isFooterLoading) ?
                    <View style={{
                        backgroundColor: AppColors.white,
                        height: verticalScale(40),
                        justifyContent: 'center',
                        alignItems: 'center',
                        alignSelf: 'center',
                        width: width
                    }} onPress={() => this.getNotifications(false)}>
                        <TouchableHighlight style={{backgroundColor: AppColors.colorPrimary, width: width}}
                                            onPress={() => this.getNotifications(false)} underlayColor='transparent'>
                            <Text style={{
                                fontFamily: AppStyles.fontFamilyBold,
                                color: AppColors.primaryColor,
                                fontSize: moderateScale(15),
                                alignSelf: 'center',
                                alignItems: 'center'
                            }}>{strings('doctor.button.seeMore')}</Text>
                        </TouchableHighlight>
                    </View>
                    :
                    <View/>}
            </ElevatedView>
        )
    }


    render() {
        return (
            <View style={{
                width: width,
                backgroundColor: AppColors.whiteColor,
                marginTop: moderateScale(5),
                justifyContent: 'flex-start',
                alignItems: 'center',
                alignSelf: 'center'
            }}>
                {(this.state.isDataVisible) ?
                    <View>
                        {(!this.state.noNotifications) ?
                            <View style={{
                                marginRight: moderateScale(5),
                                marginLeft: moderateScale(5)
                            }}>
                                <FlatList
                                    data={this.state.notifications}
                                    keyExtractor={(item, index) => index.toString()}
                                    renderItem={(item) => this.renderNotification(item)}
                                    refreshControl={
                                        <RefreshControl
                                            refreshing={this.state.isRefreshing}
                                            onRefresh={this._onRefresh}
                                        />
                                    }
                                    ListFooterComponent={this.render_footer()}
                                />
                            </View> : <View style={{
                                width: width,
                                height: height,
                                marginRight: moderateScale(5),
                                marginLeft: moderateScale(5),
                                backgroundColor: AppColors.whiteColor,
                                justifyContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'center'
                            }}>

                                <Image
                                    source={require('../../../assets/images/cancel.png')}
                                    style={{
                                        height: verticalScale(100),
                                        width: moderateScale(100),
                                        margin: moderateScale(20)
                                    }}
                                />
                                <Text style={{
                                    color: AppColors.primaryColor,
                                    fontSize: moderateScale(15),
                                    fontFamily: AppStyles.fontFamilyBold
                                }}>{strings('doctor.text.noNotifToDisplay')}</Text>
                            </View>}
                    </View> : <View/>}
                <ProgressLoader
                    visible={this.state.isLoading}
                    isModal={true} isHUD={true}
                    hudColor={"#FFFFFF"}
                    color={AppColors.primaryColor}/>
            </View>
        )
    }

    noNotificationAlert() {
        return (
            alert(strings('string.alert.alert_notification'))
        )
    }

    renderNotification(item) {
        return (
            <ScrollView showsVerticalScrollIndicator={false}>
                {item.item.isRead == 'NO' || item.item.isRead == 'No' || item.item.isRead == 'no' ?

                    <TouchableHighlight onPress={() => this.updateNotification(item.item, item.item._id)}
                                        underlayColor='transparent'
                                        style={{marginBottom: verticalScale(20)}}>
                        <View style={{
                            flexDirection: 'row',
                            width: (width - moderateScale(10)),
                            alignSelf: 'center',
                            borderBottomWidth: moderateScale(2),
                            borderBottomColor: AppColors.lightGray
                        }}>
                            <CachedImage
                                source={{uri: AppUtils.handleNullClinicImg(item.item.clinicLogo)}}
                                style={{
                                    height: moderateScale(50),
                                    width: moderateScale(50),
                                    borderRadius: moderateScale(25),
                                    marginTop: moderateScale(10),
                                    marginRight: moderateScale(10),
                                    marginBottom: moderateScale(10),
                                    marginLeft: moderateScale(5)



                                }}
                            />
                            <View style={{flex: 2, flexDirection: 'column', margin: moderateScale(10)}}>
                                <Text style={{
                                    fontFamily: AppStyles.fontFamilyRegular,
                                    fontSize: moderateScale(12),
                                    color: AppColors.blackColor
                                }}>{item.item.message}</Text>
                                <Text style={{
                                    fontFamily: AppStyles.fontFamilyRegular,
                                    fontSize: moderateScale(8),
                                    marginTop: moderateScale(10),
                                    color: AppColors.blackColor
                                }}>{moment(item.item.sendOn).format("hh:mm A")} | {moment(item.item.sendOn).format("MMM DD, YYYY")}</Text>
                            </View>
                            {(item.item.isRead == 'NO' || item.item.isRead == 'No' || item.item.isRead == 'no') ?
                                <View style={{
                                    marginTop: moderateScale(25),
                                    alignItems: 'center',
                                    marginRight: moderateScale(5)
                                }}>
                                    <Image
                                        style={{height: moderateScale(20), width: moderateScale(20)}}
                                        source={require('../../../assets/images/unread_indicator.png')}
                                    />
                                </View> : <View/>
                            }
                        </View>
                    </TouchableHighlight>
                    :
                    <View/>}
            </ScrollView>
        )
    }

    updateNotification(notificationData, id) {
        var self = this;

        let data = {
            notificationId: id,
            read: 'YES'
        };
        SHApiConnector.updateNotifications(data, function (err, stat) {
            try {
                if (!err && stat) {
                    if (stat.status) {
                        if (notificationData.notify_about == 'CLINIC_REJECTED_APPOINTMENT' || notificationData.notify_about == 'CLINIC_PROPOSED_NEW_TIME' || notificationData.notify_about == 'EXPIRE_AFTER_FIVE_MIN') {
                            AsyncStorage.setItem(AppStrings.key.key, JSON.stringify({key: true}));
                            (Platform.OS === 'ios') ? Actions.MyAppointments() : Actions.HomeScreenDash({isAppointmentUpdated: true});
                        } else if (notificationData.notify_about == 'PATIENT_RECEIVED_MESSAGES') {
                            if (notificationData.notificationData) {
                                let data = notificationData.notificationData
                                Actions.ChatScreen({
                                    sender: 'PATIENT',
                                    receiver: 'CLINIC',
                                    appointmentId: data.appointmentId, clinicName: data.clinicName,
                                    clinicLogo: data.clinicLogo, clinicAddress: data.address
                                })
                            } else {
                                AsyncStorage.setItem(AppStrings.key.key, JSON.stringify({key: false}));
                                (Platform.OS === 'ios') ? Actions.MyAppointments() : Actions.HomeScreenDash({isAppointmentUpdated: true});
                            }

                        } else {
                            AsyncStorage.setItem(AppStrings.key.key, JSON.stringify({key: false}));
                            (Platform.OS === 'ios') ? Actions.MyAppointments() : Actions.HomeScreenDash({isAppointmentUpdated: true});
                        }

                    }
                }
            } catch (e) {
                console.error(e)
            }
        })

    }
}

export default Notifications;
