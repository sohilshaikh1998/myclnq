import React from 'react';
import {Dimensions, StyleSheet,} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {moderateScale, verticalScale} from "../../../utils/Scaling";
import {AppUtils} from "../../../utils/AppUtils";
import {AppColors} from "../../../shared/AppColors";
import {AppStyles} from "../../../shared/AppStyles";

const {width, height} = Dimensions.get('window');

const cellWidth = AppUtils.screenWidth / 3;
const unerLineWidth = 0.5

const caregiverNotificationStyle = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppColors.whiteColor,
    }, main: {
        width: width,
        backgroundColor: AppColors.whiteColor,
        marginTop: moderateScale(5),
        justifyContent: 'flex-start',
        alignItems: 'center',
        alignSelf: 'center'
    },

    renderFooter: {
        backgroundColor: AppColors.white,
        height: verticalScale(40),
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        width: width
    },
    footerText: {
        fontFamily: AppStyles.fontFamilyBold,
        color: AppColors.primaryColor,
        fontSize: moderateScale(15),
        alignSelf: 'center',
        alignItems: 'center'
    },
    cancelView: {
        marginRight: moderateScale(5),
        marginLeft: moderateScale(5),
        marginTop: moderateScale(220),
        backgroundColor: AppColors.whiteColor,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center'
    },
    notificationView: {
        flexDirection: 'row',
        width: (width - moderateScale(10)),
        alignSelf: 'center',
        borderBottomWidth: moderateScale(2),
        borderBottomColor: AppColors.lightGray
    }, notificationImage: {
        height: moderateScale(50),
        width: moderateScale(50),
        borderRadius: moderateScale(25),
        marginRight: moderateScale(10),
        marginTop: moderateScale(5),
        marginBottom: moderateScale(10),
        marginLeft: moderateScale(5)
    },
    
    card: {
        width: wp(88),
        height: hp(13),
        alignSelf: 'center', alignItems: 'center', justifyContent: 'center',
        borderRadius: 7,
        backgroundColor: AppColors.whiteColor,
        //backgroundColor:'yellow',
        borderBottomColor: AppColors.greyBorder, borderBottomWidth: 0.5,
    },
    innerCard: {
        width: wp(88),
        height: hp(10),
        alignSelf: 'center', alignItems: 'center', justifyContent: 'center',
        //backgroundColor:'red',
    },
    innerCardView1: {
        flexDirection: 'row',
        width: wp(88),
        height: hp(6),
        //alignSelf: 'center', 
        alignItems: 'center',
        //justifyContent: 'center',
        //borderBottomColor: AppColors.greyBorder, borderBottomWidth:0.5,
    },
    imageView: {
        width: wp(13),
        height: hp(6),
        alignSelf: 'center', alignItems: 'center', justifyContent: 'center',
    },
    providerImage: {height: 55, width: 55},
    textView: {
        width: wp(70),
        height: hp(6),
        marginLeft: wp(4),
        justifyContent: 'center',
    },
    innerCardView2: {
        width: wp(88),
        height: hp(4),
        alignSelf: 'center', alignItems: 'center', justifyContent: 'center',
    },
    pageContainer: {
        width: wp(100),
        height: hp(100) - (verticalScale(30) + hp(19)),
        alignItems: 'center',
    },
    txt1: {
        fontSize: 12,
        fontFamily: AppStyles.fontFamilyMedium,
        color: AppColors.blackColor,
    },
    txt2: {
        fontSize: 10,
        fontFamily: AppStyles.fontFamilyMedium,
        color: AppColors.descColor,
    },

})

export default caregiverNotificationStyle;