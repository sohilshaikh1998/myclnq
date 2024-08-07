import React, {Component} from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    Image,
    TouchableHighlight} from 'react-native';
import {Actions} from 'react-native-router-flux';
import {scale, verticalScale, moderateScale} from '../../../utils/Scaling';
import {AppUtils} from "../../../utils/AppUtils";
import {AppStyles} from '../../../shared/AppStyles';
import {AppColors} from "../../../shared/AppColors";
import ElevatedView from 'react-native-elevated-view';
import {widthPercentageToDP as wp, heightPercentageToDP} from 'react-native-responsive-screen';

import images from "./../../../utils/images";
import myOrderSummary from "./myOrderSummary";


class orderSummaryHeader extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isHome: true
        }

    }

    wagonSettings() {
        Actions.Settings();
    }

    render() {
        AppUtils.console("renderData",this.props)
        return (
            this.props.title == "Order Summary" || this.props.title == "Confirm Booking"  ?
            ((AppUtils.isIphone) ? this.renderIOS() : this.renderAndroid()):
            null
        );
    }

    menuIconPressed() {
        this.setState({isMenuPressed: !this.state.isMenuPressed}, () => {
            Actions.drawerOpen();
        });
    }

    renderIOS() {
        const cellWidth = AppUtils.screenWidth / 3;
        return (
            <ElevatedView style={[styles.headerStyle, {flexDirection: 'row'}]} elevation={0}>

                <View
                    style={{
                        width: cellWidth,
                        height: (AppUtils.headerHeight),
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingTop: (AppUtils.isIphone)? AppUtils.isX ? 0 : 16 : 0,
                    }}>
                    <TouchableHighlight underlayColor="transparent" onPress={()=>{this.goBack()}}
                                        testID={"drawer"}>
                        <Image
                            style={{
                                height: moderateScale(30),
                                width: moderateScale(30),
                                marginTop: AppUtils.isX ? (16+18) : 0,
                                marginLeft: 8
                            }}
                            source={images.smallBackIcon}
                        />
                    </TouchableHighlight>
                </View>
                <View style={{width: (this.props.title=="Appointment Details")?wp(42): cellWidth,height:heightPercentageToDP('6'),marginTop:heightPercentageToDP(1),  alignItems: 'center', justifyContent: 'center'}}>
                    <Text allowFontScaling={false} style={styles.headerTextIOS}>{this.props.title}</Text>
                </View>
                <View style={{
                    width: cellWidth,
                    height: (AppUtils.headerHeight),
                    justifyContent: 'flex-end',
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingTop: (AppUtils.isIphone)? AppUtils.isX ? 0 : 0 : 0,
                }}>
                   {this.props.title=="Confirm Booking" || this.props.title=="Appointment Details" || this.props.title === 'E-Prescription'  ? null:
                    <TouchableHighlight underlayColor="transparent" onPress={() =>  Actions.drawer()}>
                        <Image
                            style={{
                                height: moderateScale(30),
                                width: moderateScale(30),
                                marginTop: AppUtils.isX ? (16 + 18) : 16,
                                marginRight: 8,
                            }}
                            source={images.equipmentHome}
                        />
                    </TouchableHighlight>
                    }
                </View>
            </ElevatedView>

        )
    }

    goBack() {
        let self = this;
        self.props.title == "Confirm Booking"?
        Actions.caregiverTab({isCaregiverBookingUpdated: true})
        : Actions.pop()

        }

    navToHomescreen() {
        Actions.MainScreen()
    }

    renderAndroid() {
        AppUtils.console("sdfvdsedv", this.props)
        const cellWidth = AppUtils.screenWidth / 3;
        return (

            <ElevatedView style={[styles.headerStyle, {flexDirection: 'row'}]} elevation={0}>

                <TouchableHighlight onPress={()=>{this.goBack()}} underlayColor="transparent"
                                    style={{
                                        width: cellWidth,
                                        height: (AppUtils.headerHeight),
                                        justifyContent: 'center',
                                        //backgroundColor: '#f18867',
                                    }}>

                    <Image
                        style={{
                            height: moderateScale(30),
                            width: moderateScale(30),
                            marginTop: AppUtils.isX ? (16 + 18) : 0,
                            marginLeft: 8
                        }}
                        source={images.smallBackIcon}
                    />
                </TouchableHighlight>

                <View style={{
                    width: this.props.title=="Appoinment Details"?wp(38):cellWidth,
                    height: (AppUtils.headerHeight),
                    justifyContent: 'center',
                }}>
                    <Text allowFontScaling={false} style={styles.headerTextIOS}>{this.props.title}</Text>
                </View>

                <View style={{
                    width: cellWidth,
                    height: (AppUtils.headerHeight),
                    justifyContent: 'flex-end',
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingTop: (AppUtils.isIphone)? AppUtils.isX ? 0 : 0 : 0,
                }}>
                   {this.props.title=="Confirm Booking" || this.props.title=="Appoinment Details" || this.props.title === 'E-Prescription' ? null:
                    <TouchableHighlight underlayColor="transparent" onPress={() =>  Actions.drawer()}>
                        <Image
                            style={{
                                height: moderateScale(30),
                                width: moderateScale(30),
                                marginTop: AppUtils.isX ? (16 + 18) : 0,
                                marginRight: 8,
                            }}
                            source={images.equipmentHome}
                        />
                    </TouchableHighlight>
                    }
                </View>

            </ElevatedView>

        )
    }
}

const styles = StyleSheet.create({

    headerStyle: {
        height: (AppUtils.headerHeight),
        width: AppUtils.screenWidth,
        backgroundColor: AppColors.whiteColor,
        alignItems: 'center', justifyContent: 'flex-start', alignSelf: 'center',
        flexDirection: 'row'
    },
    headerText: {
        color: AppColors.blackColor,
        marginLeft: moderateScale(120),
        marginTop: (Platform.OS === 'ios' ? 16 : (verticalScale(1))),
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: moderateScale(15)
    },
    headerTextIOS: {
        color: AppColors.blackColor,
        alignItems: 'center', justifyContent: 'center', alignSelf: 'center',
        marginTop: AppUtils.isX ? (16 + 18) : (Platform.OS === 'ios' ? 16 : (verticalScale(1))),
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: moderateScale(15)
    }
});

export default orderSummaryHeader;
