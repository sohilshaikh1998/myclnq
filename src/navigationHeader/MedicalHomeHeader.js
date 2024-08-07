import React from 'react';
import {Image, ImageBackground, Platform, StyleSheet, Text, TouchableHighlight, View} from 'react-native';
import {Actions} from 'react-native-router-flux';
import {moderateScale, verticalScale} from '../utils/Scaling';
import {AppUtils} from "../utils/AppUtils";
import {AppStyles} from '../shared/AppStyles';
import {AppColors} from "../shared/AppColors";
import ElevatedView from 'react-native-elevated-view';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';

import images from "./../utils/images";


class MedicalHomeHeader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isHome: true,
            cartCount: 0
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

    componentWillReceiveProps(nextProps: Readonly<P>, nextContext: any) {
        AppUtils.console("timeout23453", nextProps, nextContext)

    }

    renderIOS() {
        AppUtils.console("sdfvdsedv", this.props)
        const cellWidth = AppUtils.screenWidth / 3;
        return (

            <ElevatedView style={[styles.headerStyle, {flexDirection: 'row'}]} elevation={5}>

                <View
                    style={{
                        width: cellWidth,
                        height: (AppUtils.headerHeight),
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingTop: (AppUtils.isIphone) ? AppUtils.isX ? 0 : 16 : 0,
                    }}>
                    <TouchableHighlight underlayColor="transparent"
                                        onPress={() => this.menuIconPressed()}
                                        testID={"drawer"}>
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
                    <TouchableHighlight onPress={() => Actions.SearchProduct()} underlayColor="transparent">
                        <Image
                            resizeMode={'contain'}
                            style={{
                                height: moderateScale(25),
                                width: moderateScale(25),
                                marginTop: AppUtils.isX ? (16 + 18) : 0,
                                marginLeft: 8
                            }}
                            source={images.searchIcon}
                        />
                    </TouchableHighlight>
                </View>
                <View style={{width: cellWidth, height: (AppUtils.headerHeight), justifyContent: 'center'}}>
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
                    <TouchableHighlight onPress={() => this.wagonSettings()} underlayColor="transparent"
                                        style={{marginRight: 8}}>
                        <Image
                            style={{
                                height: moderateScale(30),
                                width: moderateScale(30),
                                marginTop: AppUtils.isX ? (16 + 18) : 0,
                            }}
                            source={images.cogwheel}
                        />
                    </TouchableHighlight>
                    <TouchableHighlight underlayColor="transparent" onPress={() => Actions.MedicalCart({isDashboard:true})}>
                        <ImageBackground
                            style={{
                                height: moderateScale(30),
                                width: moderateScale(30),
                                marginTop: AppUtils.isX ? (16 + 18) : 0,
                                marginRight: 8
                            }}
                            source={images.cart}
                        >
                            {(this.props.cartCount && this.props.cartCount > 0)?
                                <View style={{
                                    backgroundColor: AppColors.primaryColor,
                                    height: moderateScale(15), width: moderateScale(15), color: AppColors.whiteColor,
                                    borderRadius: moderateScale(15 / 2),
                                    alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end'
                                }}>
                                    <Text allowFontScaling={false} style={{
                                        color: AppColors.whiteColor,
                                        marginTop: (Platform.OS === 'ios') ? moderateScale(3) : 0,
                                        fontSize: moderateScale(7),
                                        fontFamily: AppStyles.fontFamilyRegular
                                    }}>{this.props.cartCount}</Text>
                                </View> : null
                            }

                        </ImageBackground>
                    </TouchableHighlight>
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

            <ElevatedView style={[styles.headerStyle, {flexDirection: 'row'}]} elevation={0}>

                <View style={{
                    width: cellWidth, flexDirection: 'row',
                    height: (AppUtils.headerHeight),
                    justifyContent: 'center',
                    //backgroundColor: '#f18867',
                }}>
                    <TouchableHighlight onPress={this.goBack} underlayColor="transparent">

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

                    <TouchableHighlight onPress={this.goBack} underlayColor="transparent"
                    >
                        {(this.props.sceneKey == 'MedicalEquipmentHome') ?
                            <Image
                                style={{
                                    height: moderateScale(25),
                                    width: moderateScale(25),
                                    marginTop: AppUtils.isX ? (16 + 18) : 0,
                                    marginLeft: 8
                                }}
                                source={images.searchIcon}
                            /> :
                            <View/>
                        }
                    </TouchableHighlight>
                </View>
                <View style={{
                    width: cellWidth,
                    height: (AppUtils.headerHeight),
                    justifyContent: 'center',
                }}>
                    <Text allowFontScaling={false} style={styles.headerTextIOS}>{this.props.title}</Text>
                </View>

                {/* <View style={{
                    width: cellWidth/2,
                    height: (AppUtils.headerHeight),
                    justifyContent: 'flex-end',
                    flexDirection: 'row',
                    alignItems: 'center',
                    //paddingTop: AppUtils.isX ? (16 + 18) : 16
                }}>
                    {(this.props.sceneKey == 'MedicalEquipmentHome') ? <TouchableHighlight onPress={() => this.wagonSettings()} underlayColor="transparent"
                        style={{ marginRight: wp(6) }}>
                        <Image
                            style={{ height: moderateScale(30), width: moderateScale(30), marginTop: AppUtils.isX ? (16 + 18) : 0, }}
                            source={require('../../assets/images/setting.png')}
                        />
                    </TouchableHighlight> : <View />}

                </View> */}

                <View style={{
                    width: cellWidth,
                    height: (AppUtils.headerHeight),
                    justifyContent: 'flex-end',
                    flexDirection: 'row',
                    alignItems: 'center',
                    //paddingTop: AppUtils.isX ? (16 + 18) : 16
                    //backgroundColor:'#50bda1'
                }}>
                    {(this.props.sceneKey == 'MedicalEquipmentHome') ?
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
        marginTop: AppUtils.isX ? (16 + 25) : (Platform.OS === 'ios' ? 16 : (verticalScale(5))),
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: moderateScale(15)
    }
});

export default MedicalHomeHeader;
