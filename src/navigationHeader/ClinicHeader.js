/*
 * Created by anooj on 25/06/18.
 */


import React from 'react';
import { Image, PixelRatio, Platform, StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import { Actions } from 'react-native-router-flux';
import PropTypes from 'prop-types'
import { moderateScale, verticalScale } from '../utils/Scaling';
import { AppUtils } from "../utils/AppUtils";
import { AppStyles } from '../shared/AppStyles';
import { AppColors } from "../shared/AppColors";
import LinearGradient from 'react-native-linear-gradient';
import ClinicDetails from '../screens/doctorBooking/ClinicDetails';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { TouchableOpacity } from 'react-native-gesture-handler';

var color = AppColors.greenColor;
let clinicDetail

class ClinicHeader extends React.Component {

    static propTypes = {
        clinicName: PropTypes.string.isRequired,
        clinicLogo: PropTypes.string,
        clinicStartHour: PropTypes.number,
        clinicStartMinute: PropTypes.number,
        clinicEndHour: PropTypes.number,
        clinicEndMinute: PropTypes.number,
        clinicStatus: PropTypes.string.isRequired,
        clinicAddress: PropTypes.string

    }
    static defaultProps = {
        clinicName: "",
        clinicLogo: "",
        clinicStartHour: 0,
        clinicStartMinute: 0,
        clinicEndHour: 0,
        clinicEndMinute: 0,
        clinicStatus: "",
        clinicAddress: ""
    }

    constructor(props) {
        super(props);
        this.props = props;
    }



    render() {
        color = (this.props.clinicStatus == "Open" || this.props.clinicStatus == "open") ? AppColors.greenColor : AppColors.primaryColor;
        clinicDetail = this.props.isClinicDetail;

        var clinicstartTime = AppUtils.timeConversion(this.props.clinicStartHour, this.props.clinicStartMinute);
        var clinicendTime = AppUtils.timeConversion(this.props.clinicEndHour, this.props.clinicEndMinute);
        AppUtils.console("Clinic Details ContactList:", AppUtils.getNumberInString(this.props.clinicDetails.contactNumbers));
        let numbers = AppUtils.getNumberInString(this.props.clinicDetails.contactNumbers);
        return (
            (!clinicDetail ?
                <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    colors={[AppColors.primaryColor, AppColors.primaryLight]} style={styles.topContainer}>
                    <View style={{ alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', paddingTop: (Platform.OS === 'ios') ? moderateScale(20) : 0 }}>
                            <TouchableOpacity
                                style={[{
                                    alignSelf: 'flex-start', height: hp(8),
                                    width: wp(32),
                                }, styles.navbar]}
                                underlayColor='transparent'
                                onPress={() => Actions.HomeScreenDash({ isHomeScreenUpdated: true })}>

                                <Image
                                    source={require('../../assets/images/whitearrow.png')}
                                    style={{
                                        alignSelf: 'flex-start',
                                        height: moderateScale(30),
                                        width: moderateScale(30),
                                        marginLeft: moderateScale(20),
                                        marginTop: verticalScale(15),
                                    }}
                                />
                            </TouchableOpacity>
                            <View style={{ flex: 1, alignItems: 'center' }}>
                                <View style={[styles.hospLogo, { overflow: 'hidden' }]}>
                                    <Image
                                        style={{
                                            backgroundColor: AppColors.whiteColor,
                                            height: PixelRatio.getPixelSizeForLayoutSize(AppUtils.isLowResiPhone ? 20 : 30),
                                            width: PixelRatio.getPixelSizeForLayoutSize(AppUtils.isLowResiPhone ? 20 : 30),
                                            borderRadius: (PixelRatio.getPixelSizeForLayoutSize(AppUtils.isLowResiPhone ? 20 : 30) / 2)
                                        }}
                                        resizeMode={'cover'}
                                        source={{ uri: AppUtils.handleNullClinicImg(this.props.clinicLogo) }}
                                    />
                                </View>
                            </View>
                            <View style={{ flex: 1 }} />
                        </View>
                        <View style={{
                            alignSelf: 'center',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: moderateScale(250)
                        }}>
                            <Text allowFontScaling={false} style={styles.hospName} numberOfLines={1}>{this.props.clinicName}</Text>
                        </View>
                        <View style={{ width: AppUtils.widthWindow - 50 }}>
                            <Text allowFontScaling={false} numberOfLines={AppUtils.isLowResiPhone ? 1 : 2} style={[styles.hospTimimgText, {
                                marginTop: Platform.OS === 'ios' ? 8 : 8,
                                color: AppColors.whiteColor,
                                alignSelf: 'center', textAlign: 'center',
                                marginLeft: hp(2)
                            }]}>{this.props.clinicAddress} </Text>
                        </View>
                        <View style={styles.hospTimimg}>
                            <Text allowFontScaling={false} style={[{ color: color }, styles.hospStatusText]}>{this.props.clinicStatus}</Text>
                        </View>
                        <View style={styles.hospTimimg}>
                            <View style={{ flexDirection: 'column' }}>
                                <Text allowFontScaling={false} style={styles.hospTimimgText}>{clinicstartTime}-{clinicendTime}</Text>
                            </View>

                        </View>

                    </View>
                </LinearGradient>
                :
                <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    colors={[AppColors.primaryColor, AppColors.primaryLight]} style={{
                        backgroundColor: AppColors.whiteColor,
                        width: wp(90),
                        alignItems: 'center',
                        alignSelf: 'center',
                        borderRadius: hp(2)
                    }}>

                    <View style={{ alignItems: 'center' }}>
                        <View
                            style={{ flexDirection: 'row'}}>
                            <View style={{ flex: 1 }} />

                            <View style={{ flex: 1, alignItems: 'center', alignSelf: 'center' }}>
                                <View style={[{
                                    marginTop: hp(2),
                                    height: hp(13),
                                    width: hp(13),
                                    borderRadius: hp(10), borderColor: AppColors.colorHeadings, borderWidth: hp(.2)
                                }, { overflow: 'hidden', }]}>
                                    <Image
                                        style={{
                                            backgroundColor: AppColors.whiteColor,
                                            height: hp(20),
                                            width: hp(20),
                                            borderRadius: (PixelRatio.getPixelSizeForLayoutSize(AppUtils.isLowResiPhone ? 20 : 30) / 2)
                                        }}
                                        resizeMode={'cover'}
                                        source={{ uri: AppUtils.handleNullClinicImg(this.props.clinicLogo) }}
                                    />
                                </View>
                            </View>
                            <TouchableHighlight
                                style={[{ alignSelf: 'flex-start', flex: 1 }, styles.navbar]}
                                underlayColor='transparent'
                                onPress={() => this.props.closeModal(false)}>

                                <Image
                                    source={require('../../assets/images/close.png')}
                                    style={{
                                        height: hp(2),
                                        width: hp(2),
                                        marginLeft: wp(18),
                                        marginTop: hp(3),
                                        tintColor:AppColors.whiteColor
                                    }}
                                />
                            </TouchableHighlight>
                        </View>
                        <View style={{
                            alignSelf: 'center',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: moderateScale(250)
                        }}>
                            <Text allowFontScaling={false}
                                style={{
                                    alignSelf: 'center',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center',
                                    color: AppColors.whiteColor,
                                    fontFamily: AppStyles.fontFamilyBold,
                                    fontSize: hp(3.5),
                                    marginTop: verticalScale(10)
                                }} numberOfLines={2}>{this.props.clinicName}</Text>
                        </View>
                        <View style={{ width: wp(80), flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                            <Image
                                resizeMode={'contain'}
                                source={require('../../assets/images/locationHolder.png')}
                                style={{
                                    height: hp(2),
                                    width: hp(2),
                                    marginTop: hp(1.5),
                                    justifyContent: 'center',
                                    tintColor:AppColors.whiteColor

                                }}
                            />
                            <Text allowFontScaling={false}
                                numberOfLines={3} style={{
                                    marginTop: hp(1),
                                    color: AppColors.whiteColor,
                                    textAlign: 'center',
                                    justifyContent: 'center',
                                    fontSize: hp(2), marginLeft: hp(.5),

                                }}>{this.props.clinicAddress} </Text>
                        </View>

                        <View style={{
                            flexDirection: 'row', alignItems: 'center', marginLeft: hp(1),
                            marginRight: hp(1)
                        }}>
                            <Image
                                resizeMode={'contain'}
                                source={require('../../assets/images/phoneIcon.png')}
                                style={{
                                    height: hp(2),
                                    width: hp(2),
                                    marginTop: hp(1.5),
                                    justifyContent: 'center',
                                    tintColor:AppColors.whiteColor

                                }}
                            />
                            <Text allowFontScaling={false}
                                numberOfLines={2} style={[{
                                    marginTop: hp(1),
                                    color: AppColors.whiteColor,
                                    alignSelf: 'center',
                                    textAlign: 'center',
                                    justifyContent: 'center',
                                    fontSize: hp(2), marginLeft: hp(.5),

                                }]}>{numbers}</Text>
                        </View>


                        <View style={{
                            flexDirection: 'row', alignItems: 'center', marginLeft: hp(1),
                            marginRight: hp(1),marginBottom:hp(4)
                        }}>
                            <Image
                                resizeMode={'contain'}
                                source={require('../../assets/images/clock.png')}
                                style={{
                                    height: hp(2.6),
                                    width: hp(2.6),
                                    marginTop: hp(1),
                                    justifyContent: 'center',
                                    tintColor:AppColors.whiteColor,

                                }}
                            />
                            <Text allowFontScaling={false}
                                numberOfLines={2} style={[{
                                    marginTop: hp(1),
                                    color: AppColors.whiteColor,
                                    alignSelf: 'center',
                                    textAlign: 'center',
                                    justifyContent: 'center',
                                    fontSize: hp(2), marginLeft: hp(.5),

                                }]}> {clinicstartTime}-{clinicendTime} ({this.props.clinicStatus}) </Text>
                        </View>

                        {/* <View style={[styles.hospTimimg, { height: hp(5), marginTop: hp(3) }]}>
                            <Text allowFontScaling={false} style={[{ color: color }, styles.hospStatusText]}>{this.props.clinicStatus}</Text>
                        </View>
                        <View style={[styles.hospTimimg, { height: hp(5), marginTop: hp(1), marginBottom: hp(3) }]}>
                            <View style={{ flexDirection: 'column' }}>
                                <Text allowFontScaling={false} style={styles.hospTimimgText}>{clinicstartTime}-{clinicendTime}</Text>
                            </View>

                        </View> */}
                    </View>
                </LinearGradient>

            ))
    }

}

const styles = StyleSheet.create({

    topContainer: {
        backgroundColor: AppColors.primaryColor,
        height: AppUtils.screenHeight / 2.3, //verticalScale(250),
        width: AppUtils.widthWindow,
        alignItems: 'center',
        alignSelf: 'center',


    },
    hospLogo: {
        marginTop: verticalScale(15),
        height: clinicDetail ? hp(9) : PixelRatio.getPixelSizeForLayoutSize(AppUtils.isLowResiPhone ? 20 : 30),
        width: clinicDetail ? hp(9) : PixelRatio.getPixelSizeForLayoutSize(AppUtils.isLowResiPhone ? 20 : 30),
        borderRadius: (PixelRatio.getPixelSizeForLayoutSize(AppUtils.isLowResiPhone ? 20 : 30) / 2),
    },
    hospName: {
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        color: AppColors.whiteColor,
        fontFamily: AppStyles.fontFamilyBold,
        fontSize: AppUtils.isLowResiPhone ? PixelRatio.getPixelSizeForLayoutSize(6) : PixelRatio.getPixelSizeForLayoutSize(8),
        marginTop: verticalScale(10)
    },

    hospTimimg: {

        width: moderateScale(180),
        borderRadius: moderateScale(35),
        backgroundColor: AppColors.whiteColor,
        marginTop: Platform.OS === 'ios' ? verticalScale(5) : verticalScale(10),
        paddingTop: 2, paddingBottom: 2,
        alignSelf: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
    },


    hospStatus: {
        height: verticalScale(20),
        width: moderateScale(80),
        borderRadius: moderateScale(35),
        backgroundColor: AppColors.lightPink,
        marginTop: verticalScale(10),
        alignSelf: 'center',
        justifyContent: 'center'
    },

    hospTimimgModal: {

        width: moderateScale(180),
        borderRadius: moderateScale(35),
        backgroundColor: 'transparent',
        marginTop: Platform.OS === 'ios' ? verticalScale(5) : verticalScale(10),
        paddingTop: 2, paddingBottom: 2,
        alignSelf: 'center',
        justifyContent: 'center',
        flexDirection: 'column', borderColor: AppColors.textGray, borderWidth: hp(.1)
    },

    hospStatusText: {
        alignSelf: 'center',
        fontSize: Platform.OS === 'ios' ? PixelRatio.getPixelSizeForLayoutSize(6) : moderateScale(17),
        fontFamily: AppStyles.fontFamilyBold,
        marginTop: (Platform.OS === 'ios' ? 4 : 0),
    },
    hospTimimgText: {
        alignSelf: 'center',
        fontFamily: AppStyles.fontFamilyMedium,
        color: AppColors.blackColor,
        fontSize: Platform.OS === 'ios' ? PixelRatio.getPixelSizeForLayoutSize(6) : moderateScale(15),
        marginTop: (Platform.OS === 'ios' ? 4 : 0)
    },
    navbar: {
        marginTop: AppUtils.isX ? 15 : (Platform.OS === 'ios' ? 4 : 0)
    }

})

export default ClinicHeader;

