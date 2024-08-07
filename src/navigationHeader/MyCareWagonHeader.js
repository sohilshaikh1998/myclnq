import React from 'react';
import {Image, Platform, StyleSheet, Text, TouchableHighlight, View} from 'react-native';
import {Actions} from 'react-native-router-flux';
import {moderateScale, verticalScale} from '../utils/Scaling';
import {AppUtils} from "../utils/AppUtils";
import {AppStyles} from '../shared/AppStyles';
import {AppColors} from "../shared/AppColors";
import ElevatedView from 'react-native-elevated-view';
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import { strings } from '../locales/i18n';


class MyCareWagonHeader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isHome: true
        }
    }

    componentDidMount() {
        AppUtils.console("MyHeader", this.props)
    }

    wagonSettings() {
        Actions.Settings();
    }
    //CaregiverNotification

    render() {
        AppUtils.console("HeaderData",this.props.title,"title",this.props.sceneKey)
        return (
            this.props.title == strings('common.title.allOrders')?
           null:
           AppUtils.isIphone ? this.renderIOS() : this.renderAndroid()
        );
    }

    editUserProfile() {
        AppUtils.console("zdxicons8-heart-100.pngcdszsf", this.props.sceneKey)
        let selfProfile = (this.state.selfProfileExists) ? true : false;
        let isWagon = (this.props.sceneKey === 'WagonProfile') ? true : false;
        Actions.EditProfile({
            selfProfile: (Platform.OS === 'ios') ? true : selfProfile,
            isWagon: isWagon, profile: this.props.sceneKey
        });
    }


    renderIOS() {
        AppUtils.console("sdfvdsedv", this.props)
        const cellWidth = AppUtils.screenWidth / 3;
        return (

            <ElevatedView style={[styles.headerStyle, {flexDirection: 'row'}]} elevation={5}>

                <TouchableHighlight onPress={this.goBack} underlayColor="transparent"
                                    style={{
                                        width: cellWidth,
                                        height: (AppUtils.headerHeight),
                                        justifyContent: 'center'
                                    }}>
                    {(this.props.sceneKey == 'MyCareWagonHome') ?
                        <Image
                            style={{
                                height: moderateScale(30),
                                width: moderateScale(30),
                                marginTop: AppUtils.isX ? (16 + 18) : 16,
                                marginLeft: wp(3),
                                tintColor: AppColors.blackColor
                            }}
                            source={require('../../assets/images/house_call.png')}
                        />
                        : <View/>
                    }
                </TouchableHighlight>
                <View style={{
                    width: cellWidth,
                    height: hp('6'),
                    marginTop: hp('3'),
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Text allowFontScaling={false} style={styles.headerTextIOS}>{this.props.title}</Text>
                </View>
                <View style={{
                    width: cellWidth,
                    height: (AppUtils.headerHeight),
                    justifyContent: 'flex-end',
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingTop: AppUtils.isX ? (0) : 16,
                    marginRight: 8
                }}>
                    {(this.props.title == 'My Profile') ?
                        <TouchableHighlight onPress={() => this.editUserProfile()} underlayColor='transparent'>
                            <Image
                                style={{
                                    height: verticalScale(20),
                                    width: moderateScale(20),
                                    marginRight: moderateScale(8),
                                    marginTop: hp('2'),
                                    tintColor: 'black'
                                }}
                                source={(require('../../assets/images/edit.png'))}
                            />
                        </TouchableHighlight> : <View/>}

                    {(this.props.sceneKey == 'MyCareWagonHome') ?
                        <TouchableHighlight onPress={() => this.wagonSettings()} underlayColor="transparent"
                                            style={{marginRight: 8}}>
                            <Image
                                style={{
                                    height: moderateScale(25),
                                    width: moderateScale(25),
                                    marginTop: AppUtils.isX ? (16 + 18) : 0,
                                }}
                                source={require('../../assets/images/setting.png')}
                            />
                        </TouchableHighlight> : <View/>}


                </View>


            </ElevatedView>

        )
    }

    goBack() {
        Actions.MainScreen()
    }

    navToHomescreen() {
        Actions.MainScreen()
    }

    renderAndroid() {
        AppUtils.console("sdfvdsedv", this.props)
        const cellWidth = AppUtils.screenWidth / 3;
        return (

            <ElevatedView style={[styles.headerStyle, {flexDirection: 'row'}]} elevation={5}>

                <TouchableHighlight onPress={this.goBack} underlayColor="transparent"
                                    style={{
                                        width: cellWidth,
                                        height: (AppUtils.headerHeight),
                                        justifyContent: 'center'
                                    }}>
                    {(this.props.sceneKey == 'MyCareWagonHome') ?
                        <Image
                            style={{
                                height: moderateScale(30),
                                width: moderateScale(30),
                                marginLeft: wp(3),
                                tintColor: AppColors.blackColor
                            }}
                            source={require('../../assets/images/house_call.png')}
                        /> :
                        <View/>
                    }
                </TouchableHighlight>
                <View style={{width: cellWidth, height: (AppUtils.headerHeight), justifyContent: 'center'}}>
                    <Text allowFontScaling={false} style={styles.headerTextIOS}>{this.props.title}</Text>
                </View>
                <View style={{
                    width: cellWidth,
                    height: (AppUtils.headerHeight),
                    justifyContent: 'flex-end',
                    flexDirection: 'row',
                    alignItems: 'center',
                    //paddingTop: AppUtils.isX ? (16 + 18) : 16
                }}>
                    {(this.props.title == 'My Profile') ?
                        <TouchableHighlight onPress={() => this.editUserProfile()} underlayColor='transparent'>
                            <Image
                                style={{
                                    height: verticalScale(20),
                                    width: moderateScale(20),
                                    marginRight: moderateScale(8),
                                    tintColor: 'black'
                                }}
                                source={(require('../../assets/images/edit.png'))}
                            />
                        </TouchableHighlight> : <View/>}

                    {(this.props.sceneKey == 'MyCareWagonHome') ?
                        <TouchableHighlight onPress={() => this.wagonSettings()} underlayColor="transparent"
                                            style={{marginRight: wp(6)}}>
                            <Image
                                style={{
                                    height: moderateScale(30),
                                    width: moderateScale(30),
                                    marginTop: AppUtils.isX ? (16 + 18) : 0,
                                }}
                                source={require('../../assets/images/setting.png')}
                            />
                        </TouchableHighlight> : <View/>}

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
        elevation: 5,
        flexDirection: 'row'
    },
    headerText: {
        color: AppColors.blackColor,
        marginLeft: moderateScale(120),
        marginTop: (Platform.OS === 'ios' ? 16 : (verticalScale(5))),
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: moderateScale(15)
    },
    headerTextIOS: {
        color: AppColors.blackColor,
        alignItems: 'center', justifyContent: 'center', alignSelf: 'center',
        marginTop: AppUtils.isX ? (16 + 18) : (Platform.OS === 'ios' ? 16 : (verticalScale(5))),
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: moderateScale(15)
    }
});

export default MyCareWagonHeader;