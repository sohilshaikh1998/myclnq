import React, { Component } from 'react';
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
    Alert, BackHandler, ImageBackground
} from 'react-native';
import { Actions } from 'react-native-router-flux';
import PropTypes from 'prop-types'
import { scale, verticalScale, moderateScale } from '../../../utils/Scaling';
import { AppUtils } from "../../../utils/AppUtils";

import { AppStyles } from '../../../shared/AppStyles';
import { AppColors } from "../../../shared/AppColors";
import ElevatedView from 'react-native-elevated-view';
import Drawer from 'react-native-drawer'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

import images from "./../../../utils/images";

import { SHApiConnector } from "../../../network/SHApiConnector";
import { AppStrings } from '../../../shared/AppStrings';

class productDetailsHeader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isHome: true, cartCount: 0,
        }
    }

    async componentDidMount() {
        AppUtils.console("Proops", this.props)
        // BackHandler.addEventListener("hardwareBackPress", () => {
        //     this.goBack();

        //     return true;
        // })


    }
    componentWillReceiveProps(nextProps: Readonly<P>, nextContext: any) {
        AppUtils.console("timeoutProduct", nextProps, nextContext)
        this.setState({ cartCount: nextProps.cartCount })


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
        this.setState({ isMenuPressed: !this.state.isMenuPressed }, () => {
            //Actions.refresh({isMenuPressed: false});
            Actions.drawerOpen();
        });
    }

    renderIOS() {
        AppUtils.console("sdfvdsedv", this.props)
        const cellWidth = AppUtils.screenWidth / 3;
        return (

            <ElevatedView style={[styles.headerStyle, { flexDirection: 'row' }]} elevation={0}>

                <View
                    style={{
                        width: cellWidth,
                        height: (AppUtils.headerHeight),
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingTop: (AppUtils.isIphone) ? AppUtils.isX ? 0 : 16 : 0,
                    }}>
                    <TouchableHighlight underlayColor="transparent" onPress={() => this.goBack()}
                        testID={"drawer"}>
                        <Image
                            style={{
                                height: moderateScale(30),
                                width: moderateScale(30),
                                marginTop: AppUtils.isX ? (16 + 18) : 16,
                                marginLeft: 8
                            }}
                            source={images.smallBackIcon}
                        />
                    </TouchableHighlight>
                    <TouchableHighlight underlayColor="transparent" onPress={() => Actions.SearchProduct()}>
                        <Image
                            resizeMode={'contain'}
                            style={{
                                height: moderateScale(25),
                                width: moderateScale(25),
                                marginTop: AppUtils.isX ? (16 + 18) : 16,
                                marginLeft: 8
                            }}
                            source={images.searchIcon}
                        />
                    </TouchableHighlight>
                </View>
                <View style={{ width: cellWidth, height: (AppUtils.headerHeight), justifyContent: 'center' }}>
                    <Text allowFontScaling={false} style={styles.headerTextIOS}>{this.props.title}</Text>
                </View>

                <View style={{
                    width: cellWidth,
                    height: (AppUtils.headerHeight),
                    justifyContent: 'flex-end',
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingTop: (AppUtils.isIphone) ? AppUtils.isX ? 0 : 16 : 0,
                }}>
                    {(this.props.cartCount && this.props.cartCount > 0) ?

                        <TouchableHighlight underlayColor="transparent" onPress={() => Actions.MedicalCart()}>
                            <ImageBackground
                                style={{
                                    height: moderateScale(30),
                                    width: moderateScale(30),
                                    marginTop: AppUtils.isX ? (16 + 18) : 16,
                                    marginRight: 8
                                }}
                                source={images.cart}
                            >
                                <View style={{
                                    backgroundColor: AppColors.primaryColor,
                                    height: moderateScale(15), width: moderateScale(15), color: AppColors.whiteColor,
                                    borderRadius: moderateScale(15 / 2),
                                    alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end'
                                }}>
                                    <Text style={{
                                        color: AppColors.whiteColor, marginTop: (Platform.OS === 'ios') ? moderateScale(3) : 0, fontSize: moderateScale(7),
                                        fontFamily: AppStyles.fontFamilyRegular
                                    }}>{this.props.cartCount}</Text>
                                </View>

                            </ImageBackground>
                        </TouchableHighlight> : null}
                    <TouchableHighlight onPress={() => Actions.drawer()} underlayColor="transparent"
                        style={{ marginRight: 8 }}>
                        <Image
                            style={{
                                height: moderateScale(30),
                                width: moderateScale(30),
                                marginTop: AppUtils.isX ? (16 + 18) : 16,
                            }}
                            source={images.equipmentHome}
                        />
                    </TouchableHighlight>
                </View>
            </ElevatedView>

        )
    }

    async goBack() {
        AppUtils.console("BackProductDetails", this.props)

        Actions.pop();
        setTimeout(() => {
            AppUtils.console("timeout", "----->", this.props.cartCount)
            Actions.refresh({ cartCount: this.props.cartCount })
        }, 1000);




    }

    navToHomescreen() {
        Actions.MainScreen()
    }

    renderAndroid() {
        AppUtils.console("sdfvdsedv", this.props)
        const cellWidth = AppUtils.screenWidth / 3;
        return (

            <ElevatedView style={[styles.headerStyle, { flexDirection: 'row' }]} elevation={0}>

                <TouchableHighlight  onPress={() => this.goBack()} underlayColor="transparent"
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
                    <TouchableHighlight onPress={() => this.wagonSettings()} underlayColor="transparent"
                        style={{
                            marginRight: wp(2)
                        }}>
                        <Image
                            style={{
                                height: moderateScale(30),
                                width: moderateScale(30),
                                marginTop: AppUtils.isX ? (16 + 18) : 0,
                            }}
                            source={require('../../../../assets/images/setting.png')}
                        />
                    </TouchableHighlight>

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
        marginTop: AppUtils.isX ? (16 + 18) : (Platform.OS === 'ios' ? 16 : (verticalScale(5))),
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: moderateScale(15)
    }
});

export default productDetailsHeader;
