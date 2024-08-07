import React, {Component} from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    Image,
    TouchableHighlight,
    Dimensions,
    ViewPropTypes,
    PixelRatio,
    Alert,    BackHandler,

} from 'react-native';
import {Actions} from 'react-native-router-flux';
import PropTypes from 'prop-types'
import {scale, verticalScale, moderateScale} from '../../../utils/Scaling';
import {AppUtils} from "../../../utils/AppUtils";
import {AppStyles} from '../../../shared/AppStyles';
import {AppColors} from "../../../shared/AppColors";
import ElevatedView from 'react-native-elevated-view';
import Drawer from 'react-native-drawer'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';

import images from "./../../../utils/images";

import {SHApiConnector} from "../../../network/SHApiConnector";


class selectPaymentHeader extends React.Component {
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
        return (
            AppUtils.isIphone ? this.renderIOS() : this.renderIOS()
        );
    }

    menuIconPressed() {
        this.setState({isMenuPressed: !this.state.isMenuPressed}, () => {
            //Actions.refresh({isMenuPressed: false});
            Actions.drawerOpen();
        });
    }

    renderIOS() {
        AppUtils.console("sdfvdsedv", this.props)
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
                    <TouchableHighlight underlayColor="transparent" onPress={this.goBack}
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
                <View style={{width: cellWidth, height: (AppUtils.headerHeight),marginTop:AppUtils.isX ? (16+18) : 10, justifyContent: 'center'}}>
                    <Text allowFontScaling={false} style={styles.headerTextIOS}>{this.props.title}</Text>
                </View>
                <View style={{
                    width: cellWidth,
                    height: (AppUtils.headerHeight),
                    justifyContent: 'flex-end',
                    flexDirection: 'row',
                    alignItems: 'center',
                    alignSelf:'center',
                    paddingTop: (AppUtils.isIphone)? AppUtils.isX ? 0 : 16 : 0,
                }}>
                    <TouchableHighlight underlayColor="transparent" onPress={() => Actions.MedicalCart()}>
                        <Image
                            style={{
                                height: moderateScale(30),
                                width: moderateScale(30),
                                marginTop: AppUtils.isX ? (16+18) : 0,
                                marginRight: 8
                            }}
                            source={images.equipmentHome}
                        />
                    </TouchableHighlight>
                </View>
            </ElevatedView>

        )
    }

    goBack() {
        Actions.pop()
    }

    navToHomescreen() {
        Actions.MainScreen()
    }

    renderAndroid() {
        AppUtils.console("sdfvdsedv", this.props)
        const cellWidth = AppUtils.screenWidth / 3;
        return (

            <ElevatedView style={[styles.headerStyle, {flexDirection: 'row'}]} elevation={0}>

                <TouchableHighlight onPress={this.goBack} underlayColor="transparent"
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
                        source={images.menu}
                    />
                </TouchableHighlight>

                <View style={{
                    width: cellWidth,
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
                }}>
                    {/*<TouchableHighlight onPress={() => this.wagonSettings()} underlayColor="transparent"*/}
                    {/*                    style={{*/}
                    {/*                        marginRight: wp(2)*/}
                    {/*                    }}>*/}
                    {/*    <Image*/}
                    {/*        style={{*/}
                    {/*            height: moderateScale(30),*/}
                    {/*            width: moderateScale(30),*/}
                    {/*            marginTop: AppUtils.isX ? (16 + 18) : 0,*/}
                    {/*        }}*/}
                    {/*        source={require('../../../../assets/images/setting.png')}*/}
                    {/*    />*/}
                    {/*</TouchableHighlight>*/}

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
        //elevation: 5,
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
        marginTop: AppUtils.isX ? (16 + 18) : (Platform.OS === 'ios' ? 16 : (verticalScale(1))),
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: moderateScale(15)
    }
});

export default selectPaymentHeader;
