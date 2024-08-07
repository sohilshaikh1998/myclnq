import React from 'react';
import {Image, Platform, StyleSheet, Text, TouchableOpacity, View,} from 'react-native';
import {Actions} from 'react-native-router-flux';
import {moderateScale, verticalScale} from '../utils/Scaling';
import {AppUtils} from "../utils/AppUtils";
import {AppStyles} from '../shared/AppStyles';
import {AppColors} from "../shared/AppColors";
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import careGiverHomeScreenStyle from '../screens/caregiver/caregiverHome/caregiverHomeScreenStyle'
import images from "./../utils/images";


class caregiverHeader extends React.Component {
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
        return (AppUtils.isIphone ? this.renderIOS() : this.renderAndroid());
    }

    renderIOS() {
        return (
            <View style={[careGiverHomeScreenStyle.innerHeader, {
                backgroundColor: AppColors.whiteColor,
                paddingTop: AppUtils.isX ? (16 + 18) : 16,
            }]}>
                <TouchableOpacity
                    onPress={this.goBack}
                    activeOpacity={1}
                    style={careGiverHomeScreenStyle.sideBlock}>

                    {(this.props.sceneKey === 'CaregiverHome') ?
                        < Image

                            style={[
                                careGiverHomeScreenStyle.smallBackArrow,
                                {height: hp(5), marginLeft: wp(3), tintColor: AppColors.blackColor}
                            ]}
                            source={require('../../assets/images/house_call.png')}
                        />
                        :
                        <View/>
                    }


                </TouchableOpacity>
                <View style={careGiverHomeScreenStyle.middleBlock}>
                    <Text allowFontScaling={false} style={careGiverHomeScreenStyle.headingTxt}> {this.props.title} </Text>
                </View>
                <TouchableOpacity
                    onPress={() => this.wagonSettings()}
                    style={careGiverHomeScreenStyle.sideBlock}>
                    {(this.props.sceneKey === 'CaregiverHome') ?
                        <Image
                            style={careGiverHomeScreenStyle.settingImage}
                            source={images.cogwheel}
                        />
                        :
                        <View/>
                    }
                </TouchableOpacity>
            </View>
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
            <View style={[careGiverHomeScreenStyle.innerHeader, {backgroundColor: AppColors.whiteColor}]}>

                <TouchableOpacity
                    onPress={this.goBack}
                    activeOpacity={1}
                    style={careGiverHomeScreenStyle.sideBlock}>
                    {(this.props.sceneKey === 'CaregiverHome') ?
                        <Image
                            style={[careGiverHomeScreenStyle.smallBackArrow, {tintColor: AppColors.blackColor}]}
                            source={require('../../assets/images/house_call.png')}
                        />
                        :
                        <View/>
                    }
                </TouchableOpacity>

                <View style={careGiverHomeScreenStyle.middleBlock}>
                    <Text allowFontScaling={false} style={careGiverHomeScreenStyle.headingTxt}> {this.props.title} </Text>
                </View>
                <TouchableOpacity
                    onPress={() => this.wagonSettings()}
                    style={careGiverHomeScreenStyle.sideBlock}>
                    {(this.props.sceneKey === 'CaregiverHome') ?
                        <Image
                            style={careGiverHomeScreenStyle.settingImage}
                            source={images.cogwheel}
                        />
                        :
                        <View/>
                    }
                </TouchableOpacity>
            </View>
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

export default caregiverHeader;
