import React from 'react';
import {
    Alert,
    BackHandler,
    Dimensions,
    FlatList,
    Image,
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
import { strings } from '../../locales/i18n';

const {width, height} = Dimensions.get('window');

var dt = new Date();
dt.setDate(dt.getDate());
var _dt = dt;


class MyCareWagonNotification extends React.Component {

    constructor(props) {
        super();
        super(props);
        AppUtils.analyticsTracker("Medical Transport Notifications");
        this.state = ({
            notifications: [],
            isLoading: false,
            isDataVisible: true,
            noNotifications: false,
            isRefreshing: false,
            page: 1,
            isFooterLoading: false,
            clinicLogo: '',
            isRead: 'NO'

        })

        this.getNotifications = this.getNotifications.bind(this);
    }

    /*componentWillMount() {
        this.getNotifications();
        //this.fetchNotificationList();
        BackHandler.addEventListener('hardwareBackPress', () => {
            this.goBack();
            return true;
        })

    }*/

    componentDidMount() {
        this.getNotifications();
        BackHandler.addEventListener('hardwareBackPress', () => {
            this.goBack();
            return true;
        })
    }

    _onRefresh = () => {
        let self = this;
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
                AppUtils.console("11111111111111", loggedIn);
                SHApiConnector.getNotificationList(page, function (err, stat) {
                    self.setState({isLoading: false, isRefreshing: false})
                    AppUtils.console("222222222", stat);
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
                            } else if (stat.data.length > 0) {

                                AppUtils.console("aaaaa", stat.data);
                                if (stat.data.length < 10) {
                                    self.setState({isFooterLoading: false})
                                } else {
                                    self.setState({isFooterLoading: true})
                                }
                                if (self.state.page == 1) {
                                    self.setState({
                                        notifications: stat.data,
                                        noNotifications: false,
                                        isRefreshing: false,
                                        page: self.state.page + 1,
                                        isDataVisible: true
                                    })
                                } else {
                                    self.setState({
                                        notifications: [...self.state.notifications, ...stat.data],
                                        page: (self.state.page) + 1,
                                        isDataVisible: true
                                    })
                                }

                            } else if (stat.data.length == 0) {
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
        Actions.MyCareWagonDash();
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
                marginTop: moderateScale(0),
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
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    <FlatList
                                        data={this.state.notifications}
                                        keyExtractor={(item, index) => index.toString()}
                                        renderItem={(item) => this.renderNotification(item)
                                        }
                                        refreshControl={
                                            <RefreshControl
                                                refreshing={this.state.isRefreshing}
                                                onRefresh={this._onRefresh}
                                            />
                                        }

                                        ListFooterComponent={this.render_footer()}
                                    />
                                </ScrollView>
                            </View> : <View style={{
                                width: width,
                                height: height,
                                marginRight: moderateScale(5),
                                marginLeft: moderateScale(5),
                                backgroundColor: AppColors.whiteColor,
                                justifyContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'center',
                                marginTop: verticalScale(-80)
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
        AppUtils.console("itemmmmmmmmmm", item)

        return (

            <ScrollView>


                <TouchableHighlight onPress={() => this.updateNotification(item)}
                                    underlayColor='transparent'
                                    style={{marginBottom: verticalScale(20)}}>
                    <View style={{
                        flexDirection: 'row',
                        width: (width - moderateScale(10)),
                        alignSelf: 'center',
                        borderBottomWidth: moderateScale(2),
                        borderBottomColor: AppColors.lightGray,
                        //justifyContent:'center'
                    }}>
                        <Image resizeMode={'contain'}
                            //source={{uri: AppUtils.handleNullClinicImg(item.item.clinicLogo)}}
                               source={require('../../../assets/images/ambulance-notification.png')}
                               style={{
                                   height: moderateScale(50),
                                   width: moderateScale(50),
                                   borderRadius: moderateScale(25),
                                   margin: moderateScale(10)
                               }}
                        />
                        <View style={{flex: 2, flexDirection: 'column', margin: moderateScale(10)}}>
                            <Text allowFontScaling={false} style={{
                                fontFamily: AppStyles.fontFamilyRegular,
                                fontSize: moderateScale(12),
                                color: AppColors.blackColor
                            }}>{item.item.message}</Text>
                            <Text allowFontScaling={false} style={{
                                fontFamily: AppStyles.fontFamilyRegular,
                                fontSize: moderateScale(8),
                                marginTop: moderateScale(10),
                                color: AppColors.blackColor
                            }}>{moment(item.item.sendOn).format("hh:mm A")} | {moment(item.item.sendOn).format("MMM DD, YYYY")}</Text>
                        </View>
                        {(item.item.isRead == 'NO') ?
                            <View style={{
                                marginTop: moderateScale(25),
                                alignItems: 'center',
                                marginRight: moderateScale(20)
                            }}>
                                <Image
                                    style={{height: moderateScale(15), width: moderateScale(15)}}
                                    source={require('../../../assets/images/unread_indicator.png')}
                                />
                            </View> : <View/>
                        }
                        {(item.item.isRead == 'YES') ?
                            <View style={{
                                marginTop: moderateScale(25),
                                alignItems: 'center',
                                marginRight: moderateScale(5)
                            }}>

                            </View> : <View/>
                        }
                    </View>
                </TouchableHighlight>

            </ScrollView>
        )
    }


    updateNotification(notificationData) {
        AppUtils.console("notificationdata", notificationData);
        let self = this;

        let data = {
            notificationId: notificationData.item._id,
            read: 'YES'
        };
        AppUtils.console("data", data);
        SHApiConnector.updateNotifications(data, function (err, stat) {
            AppUtils.console("notification", stat)
            try {
                if (!err && stat) {
                    if (stat.status) {
                        AppUtils.console("status", stat);
                        AppUtils.console("notificationlist", notificationData.index);

                        let list = self.state.notifications;
                        AppUtils.console("beforeeeee", list);
                        list[notificationData.index].isRead = 'YES';
                        self.setState({notifications: list});
                        AppUtils.console("afterrrrrrr", self.state.notifications);

                        if (notificationData.item.notify_about == 'NO_RESPONSE') {
                            Alert.alert(
                                '',
                                strings('common.transport.vehicleNotAvail'),
                                [
                                    {text: strings('doctor.button.ok'),},

                                ]
                            )
                        } else if (notificationData.item.notify_about == 'TRIP_COMPLETED') {
                            Alert.alert(
                                '',
                                strings('common.transport.tripCompleted'),
                                [
                                    {text: strings('doctor.button.ok'), onPress: () => Actions.MyBooking()},
                                    {text: strings('doctor.button.cancel'), style: 'No'},

                                ]
                            )
                        } else if (notificationData.item.notify_about == "PICKED_UP") {

                            Alert.alert(
                                '',
                                strings('common.transport.tripStarted'),
                                [
                                    {text: strings('doctor.button.ok'), onPress: () => Actions.MyBooking()},
                                    {text: strings('doctor.button.cancel'), style: 'No'},

                                ]
                            )
                        } else if (notificationData.item.notify_about == "TRIP_AMOUNT_PAID") {

                            Alert.alert(
                                '',
                                strings('common.transport.paymentReceived'),
                                [
                                    {text: strings('doctor.button.ok'), onPress: () => Actions.MyBooking()},
                                    {text: strings('doctor.button.cancel'), style: 'No'},

                                ]
                            )
                        } else if (notificationData.item.notify_about == "NON_PAYMENT_CANCELLATION") {

                            Alert.alert(
                                '',
                                strings('common.transport.tripCancelled'),
                                [
                                    {text: strings('doctor.button.ok'), onPress: () => Actions.MyBooking()},
                                    {text: strings('doctor.button.cancel'), style: 'No'}

                                ]
                            )
                        } else {
                            AsyncStorage.setItem(AppStrings.key.key, JSON.stringify({key: false}));
                            Actions.MyBooking();
                        }

                    }
                }
            } catch (e) {
                console.error(e)
            }
        })

    }


}

export default MyCareWagonNotification;
