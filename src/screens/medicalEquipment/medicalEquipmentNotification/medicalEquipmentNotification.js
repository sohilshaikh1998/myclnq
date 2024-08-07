import React from 'react';
import {
    View,
    Text,
    Image,
    Dimensions,
    TouchableHighlight,
    FlatList,
    ScrollView, BackHandler, RefreshControl, Platform
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import ElevatedView from 'react-native-elevated-view'
import moment from 'moment-timezone'
import { Actions } from 'react-native-router-flux';
import { AppStyles } from "../../../shared/AppStyles"
import { AppStrings } from "../../../shared/AppStrings";
import { verticalScale, moderateScale } from '../../../utils/Scaling';
import { AppColors } from "../../../shared/AppColors";
import { SHApiConnector } from "../../../network/SHApiConnector";
import { AppUtils } from "../../../utils/AppUtils";

const { width } = Dimensions.get('window');
import ProgressLoader from 'rn-progress-loader';
import medicalEquipmentNotificationStyle from './medicalEquipmentNotificationStyle';
import { strings } from '../../../locales/i18n';


class medicalEquipmentNotification extends React.Component {
    constructor(props) {
        super(props);
        AppUtils.analyticsTracker("Medical Equipment Notifications");
        this.state = ({
            notifications: '',
            isLoading: false,
            isDataVisible: false,
            noNOtifications: false,
            isRefreshing: false,
            page: 1,
            isFooterLoading: false,
            clinicLogo: ''

        });

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
        self.setState({ isRefreshing: true, page: 1 })
        self.getNotifications(true);
    }


    async getNotifications(isRefresh) {
        var self = this;
        var page = {
            page: (isRefresh == true) ? 1 : self.state.page
        };
        try {
            self.setState({ isLoading: (self.state.isRefreshing) ? false : true });

            let response = await SHApiConnector.getMedicalEquipmentNotifications(page.page);
            self.setState({ isLoading: false });

            AppUtils.console("xdzxcxaszdxf", response)
            if (response.data.status) {
                if (response.data.response.length > 0) {
                    if (response.data.response.length < 10) {
                        self.setState({ isFooterLoading: false })
                    } else {
                        self.setState({ isFooterLoading: true })
                    }
                    if (self.state.page == 1) {
                        self.setState({
                            notifications: response.data.response,
                            noNotifications: false,
                            isRefreshing: false,
                            page: self.state.page + 1,
                            isDataVisible: true
                        })
                    } else {
                        self.setState({
                            notifications: [...self.state.notifications, ...response.data.response],
                            page: (self.state.page) + 1,
                            isDataVisible: true
                        })
                    }

                } else if (response.data.response.length == 0) {
                    self.setState({
                        noNotifications: true,
                        isRefreshing: false,
                        isDataVisible: true
                    })
                }
            }
        } catch (e) {
            AppUtils.console("MEDICAL_EQUIPMENT_NOTIFICATION", e)
        }
    }

    goBack() {
        Actions.drawer();
    }

    render_footer() {
        return (
            <ElevatedView elevation={10}>
                {(this.state.isFooterLoading) ?
                    <View style={medicalEquipmentNotificationStyle.footerView} onPress={() => this.getNotifications(false)}>
                        <TouchableHighlight style={medicalEquipmentNotificationStyle.seeView}
                            onPress={() => this.getNotifications(false)} underlayColor='transparent'>
                            <Text style={medicalEquipmentNotificationStyle.seeText}>{strings('doctor.button.seeMore')}</Text>
                        </TouchableHighlight>
                    </View>
                    :
                    <View />}
            </ElevatedView>
        )
    }


    render() {
        return (
            <View style={medicalEquipmentNotificationStyle.container}>
                {(this.state.isDataVisible) ?
                    <View>
                        {(!this.state.noNotifications) ?
                            <View style={medicalEquipmentNotificationStyle.subContainer}>
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
                            </View> : <View style={medicalEquipmentNotificationStyle.emptyView}>

                                <Image
                                    source={require('../../../../assets/images/cancel.png')}
                                    style={medicalEquipmentNotificationStyle.cancelImage}
                                />
                                <Text style={medicalEquipmentNotificationStyle.emptyText}>{strings('doctor.text.noNotifToDisplay')}</Text>
                            </View>}
                    </View> : <View />}
                <ProgressLoader
                    visible={this.state.isLoading}
                    isModal={true} isHUD={true}
                    hudColor={"#FFFFFF"}
                    color={AppColors.primaryColor} />
            </View>
        )
    }

    noNotificationAlert() {
        return (
            alert(strings('string.alert.alert_notification'))
        )
    }
    clickNotification(item) {
        AppUtils.console("Notificationclick", item);
        item.orderId ? Actions.MyOrderSummary({ orderId: item.orderId }) : Actions.MedicalEquipmentBooking();
    }

    renderNotification(item) {
        AppUtils.console("Notification", item.item)
        return (
            <ScrollView showsVerticalScrollIndicator={false}>
                {item.item.isRead == 'NO' || item.item.isRead == 'No' || item.item.isRead == 'no' ?

                    <TouchableHighlight onPress={() => this.clickNotification(item.item)}
                        underlayColor='transparent'
                        style={{ marginBottom: verticalScale(20) }}>
                        <View style={medicalEquipmentNotificationStyle.itemView}>
                            <Image
                                source={{ uri: AppUtils.handleNullClinicImg(item.item.image) }}
                                style={medicalEquipmentNotificationStyle.itemImage}
                            />
                            <View style={medicalEquipmentNotificationStyle.itemTitleView}>
                                <Text style={medicalEquipmentNotificationStyle.titleText}>{item.item.title}</Text>
                                <Text style={medicalEquipmentNotificationStyle.dateText}>{moment(item.item.sendOn).format("hh:mm A")} | {moment(item.item.sendOn).format("MMM DD, YYYY")}</Text>
                            </View>
                            {(item.item.isRead == 'NO' || item.item.isRead == 'No' || item.item.isRead == 'no') ?
                                <View style={medicalEquipmentNotificationStyle.indicator}>
                                    <Image
                                        style={medicalEquipmentNotificationStyle.indicatorImages}
                                        source={require('../../../../assets/images/unread_indicator.png')}
                                    />
                                </View> : <View />
                            }
                        </View>
                    </TouchableHighlight>
                    :
                    <View />}
            </ScrollView>
        )
    }

    updateNotification(notificationData, id) {
        let notidData = {
            notificationId: id,
            read: 'YES'
        };
        SHApiConnector.updateNotifications(notidData, function (err, stat) {
            try {
                if (!err && stat) {
                    if (stat.status) {
                        if (notificationData.notify_about == 'CLINIC_REJECTED_APPOINTMENT' || notificationData.notify_about == 'CLINIC_PROPOSED_NEW_TIME' || notificationData.notify_about == 'EXPIRE_AFTER_FIVE_MIN') {
                            AsyncStorage.setItem(AppStrings.key.key, JSON.stringify({ key: true }));
                            (Platform.OS === 'ios') ? Actions.MyAppointments() : Actions.HomeScreenDash({ isAppointmentUpdated: true });
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
                                AsyncStorage.setItem(AppStrings.key.key, JSON.stringify({ key: false }));
                                (Platform.OS === 'ios') ? Actions.MyAppointments() : Actions.HomeScreenDash({ isAppointmentUpdated: true });
                            }

                        } else {
                            AsyncStorage.setItem(AppStrings.key.key, JSON.stringify({ key: false }));
                            (Platform.OS === 'ios') ? Actions.MyAppointments() : Actions.HomeScreenDash({ isAppointmentUpdated: true });
                        }

                    }
                }
            } catch (e) {
                console.error(e)
            }
        })

    }
}

export default medicalEquipmentNotification;
