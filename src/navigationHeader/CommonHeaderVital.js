import React from 'react';
import { Platform, StyleSheet, Dimensions, Text, View, TouchableHighlight, TouchableOpacity, Image } from 'react-native';
import { moderateScale, verticalScale } from '../utils/Scaling';
import { AppUtils } from "../utils/AppUtils";
import { AppStyles } from '../shared/AppStyles';
import ElevatedView from 'react-native-elevated-view'
import { AppColors } from "../shared/AppColors";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import images from "../utils/images";
import { Actions } from "react-native-router-flux";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
const { width, height } = Dimensions.get('window');



class CommonHeaderVital extends React.Component {
    constructor(props) {
        super(props);
    }
    onBackPress() {
        Actions.pop()
        setTimeout(() => {
            AppUtils.console("timeout", "----->")
            Actions.refresh({ update: true })
        }, 500);
    }

    renderIOS() {
        const cellWidth = AppUtils.screenWidth / 5;
        return (
            <View style={[styles.headerStyle, { flexDirection: 'row', paddingBottom: hp(3), paddingTop: hp(4), borderBottomWidth: hp(.1)}]} elevation={5}>
                <TouchableOpacity onPress={() => this.onBackPress()} underlayColor="transparent"
                    style={{
                        width: cellWidth,
                        height: (AppUtils.headerHeight),
                        justifyContent: 'center'
                    }}>
                    <Image
                        style={{
                            height: moderateScale(20),
                            width: moderateScale(30),
                            marginTop: hp(2),
                            marginLeft: hp(2)
                        }}
                        source={images.smallBackIcon}
                    />
                </TouchableOpacity>
                <View style={{ width: cellWidth * 3, height: (AppUtils.headerHeight), justifyContent: 'center' }}>
                    <Text allowFontScaling={false} numberOfLines={1}
                        style={styles.headerTextIOS}>{this.props.title}</Text>
                </View>
                <View style={{
                    width: cellWidth,
                    height: (AppUtils.headerHeight),
                    justifyContent: 'flex-end',
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingTop: AppUtils.isX ? (16 + 18) : 16
                }}>
                </View>


            </View>

        )
    }

    renderAndroid() {

        const cellWidth = AppUtils.screenWidth / 5;
        return (

            <View style={[styles.headerStyle, { flexDirection: 'row', paddingBottom: hp(3), paddingTop: hp(1), borderBottomWidth: hp(.1) }]} elevation={5}>

                <TouchableOpacity onPress={() => this.onBackPress()} underlayColor="transparent"
                    style={{
                        width: cellWidth,
                        height: (AppUtils.headerHeight),
                        justifyContent: 'center'
                    }}>
                    <Image
                        style={{
                            height: moderateScale(20),
                            width: moderateScale(30),
                            marginTop: hp(2),
                            marginLeft: hp(2)
                        }}
                        source={images.smallBackIcon}
                    />
                </TouchableOpacity>
                <View style={{ width: cellWidth * 3, height: (AppUtils.headerHeight), justifyContent: 'center' }}>
                    <Text allowFontScaling={false} numberOfLines={1}
                        style={styles.headerTextIOS}>{this.props.title}</Text>
                </View>
                <View style={{
                    width: cellWidth,
                    height: (AppUtils.headerHeight),
                    justifyContent: 'flex-end',
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingTop: AppUtils.isX ? (16 + 18) : 16
                }}>

                </View>


            </View>

        )
    }


    render() {
        return (

            <View style={{ backgroundColor: AppColors.whiteColor, marginLeft: hp(1) }}>
                <KeyboardAwareScrollView >
                    {((AppUtils.isIphone) ? this.renderIOS() : this.renderAndroid())}
                </KeyboardAwareScrollView></View>

        )
    }

}
const styles = StyleSheet.create({
    textViewStyle: {
        alignSelf: 'center', height: hp(6), flexDirection: 'row',
        width: wp(90)
    },

    textTitleStyle: {
        flex: 1,
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: 14,
        marginTop: (AppUtils.isIphone) ? hp(.5) : 0,
        alignSelf: 'center',
        paddingLeft: wp(5),
    },

    textDataStyle: {
        flex: 1,
        fontSize: 14,
        marginTop: (AppUtils.isIphone) ? hp(.5) : 0,
        marginLeft: wp(25),
        alignSelf: 'center',
        fontFamily: AppStyles.fontFamilyRegular
    },
    headerStyle: {
        height: (AppUtils.headerHeight),
        width: AppUtils.screenWidth,
        backgroundColor: AppColors.whiteColor,
        alignItems: 'center', justifyContent: 'flex-start', alignSelf: 'center',
        flexDirection: 'row'
    },
    headerTextIOS: {
        color: AppColors.blackColor, textAlign: 'center',
        alignItems: 'center', justifyContent: 'center', alignSelf: 'center',
        marginTop: AppUtils.isX ? (16 + 18) : (Platform.OS === 'ios' ? 16 : (hp(2))),
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: moderateScale(15)
    }
});

export default CommonHeaderVital;
