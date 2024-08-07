import {Dimensions, Image, StyleSheet, TouchableHighlight, View} from 'react-native';
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


export default class TabBar extends React.Component {

    constructor(props) {
        super();
        super(props);

        this.state = {
            map: activeCompass,
            calendar: inactiveCalender,
            user: inactiveUser,
            notification: inactiveNotification
        }
    }

    setTabIcon(value) {
        if (value == 'map') {
            this.setState({
                map: activeCompass,
                calendar: inactiveCalender,
                user: inactiveUser,
                notification: inactiveNotification
            })
        } else if (value == 'MyAppointments') {
            this.setState({
                map: inactiveCompass,
                calendar: activeCalender,
                user: inactiveUser,
                notification: inactiveNotification
            })

        } else if (value == 'user') {
            this.setState({
                map: inactiveCompass,
                calendar: inactiveCalender,
                user: activeUser,
                notification: inactiveNotification
            })
        } else if (value == 'notification') {
            this.setState({
                map: inactiveCompass,
                calendar: inactiveCalender,
                user: inactiveUser,
                notification: activeNotification
            })
        }
    }

    selectedTab(value) {
        if (value == 'map') {
            Actions.HomeScreen();
        } else if (value == 'MyAppointments') {
            Actions.MyAppointments();

        } else if (value == 'user') {
            Actions.Profile();
        } else if (value == 'notification') {
            Actions.Notifications();
        }

        this.setTabIcon(value);
    }


    render() {
        return (
            <View style={styles.mapContainer}>
                <View style={styles.tabView}>
                    <TouchableHighlight onPress={() => this.selectedTab('map')} underlayColor='transparent'>
                        <View style={{height: verticalScale(60), width: (width / 4), justifyContent: 'center'}}>
                            <Image
                                source={this.state.map}
                                resizeMode='contain'
                                style={{height: verticalScale(30), width: moderateScale(30), alignSelf: 'center'}}
                            />
                        </View>
                    </TouchableHighlight>
                    <TouchableHighlight onPress={() => this.selectedTab('MyAppointments')} underlayColor='transparent'>
                        <View style={{height: verticalScale(60), width: (width / 4), justifyContent: 'center'}}>
                            <Image
                                source={this.state.calendar}
                                resizeMode='contain'
                                style={{height: verticalScale(30), width: moderateScale(30), alignSelf: 'center'}}
                            />
                        </View>
                    </TouchableHighlight>
                    <TouchableHighlight onPress={() => this.selectedTab('user')} underlayColor='transparent'>
                        <View style={{height: verticalScale(60), width: (width / 4), justifyContent: 'center'}}>
                            <Image
                                source={this.state.user}
                                resizeMode='contain'
                                style={{height: verticalScale(30), width: moderateScale(30), alignSelf: 'center'}}
                            />
                        </View>
                    </TouchableHighlight>
                    <TouchableHighlight onPress={() => this.selectedTab('notification')} underlayColor='transparent'>
                        <View style={{height: verticalScale(60), width: (width / 4), justifyContent: 'center'}}>
                            <Image
                                source={this.state.notification}
                                resizeMode='contain'
                                style={{height: verticalScale(30), width: moderateScale(30), alignSelf: 'center'}}
                            />
                        </View>
                    </TouchableHighlight>
                </View>
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
        marginBottom: AppUtils.isX ? 50 : 0
    }
})
