import React, { Component } from 'react';
import {
    Platform,
    StyleSheet,
    I18nManager,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

import { AppColors } from "../../shared/AppColors";
import { AppStyles } from "../../shared/AppStyles";
import { AppUtils } from "../../utils/AppUtils";
import { scale, verticalScale, moderateScale } from "../../utils/Scaling";
const isRTL = I18nManager.isRTL;
const VitalHomeScreenStyle = StyleSheet.create({

    vitalHeadingText: {
        fontFamily: AppStyles.fontFamilyDemi,
        fontSize: 15,
        color: AppColors.black,
        marginBottom: hp(1)
    },
    dividerVital: {
        width: wp('100%'),
        height: hp(0.3),
        flexDirection: 'row',
        backgroundColor: AppColors.greyBorder,
        marginTop: hp(3),
    },
    categoryView: {
        width: wp(90),
        height: hp(14),
        justifyContent: 'center',
        alignSelf: 'center',
        alignItems: 'center',
        borderRadius: 10,
        backgroundColor: AppColors.whiteColor,
        marginTop: hp(4),
    },
    categoryIndividualAlignment: {
        justifyContent: 'center', backgroundColor: AppColors.whiteColor,
        borderRadius: hp(1.2),
        borderColor: AppColors.greyBorder,
        width: wp(28),paddingBottom:hp(1),paddingTop:hp(1),
        marginRight:wp(3),
        marginBottom:hp(1),
        marginTop:hp(1),
        borderWidth: hp(.1)
    },
    categorySub: { flexDirection: 'row', alignContent: 'center', justifyContent: 'center', marginTop: hp(1), marginRight: hp(.5), marginLeft: hp(1.5) },
    categoryTxt: { width:wp(12),paddingTop: hp(.5), height: hp(7) },
    categoryVital: {
        fontSize: wp(4.5),
        marginRight:wp(1),
        marginLeft:wp(1.5),
        marginTop: hp(.5),
        fontFamily: AppStyles.fontFamilyDemi, color: AppColors.blackColor
    }, categoryVitalTxt: {
        width:wp(20),
        fontSize: wp(2.5),
        marginLeft: wp(1.5),
        marginTop: hp(1),
        fontFamily: AppStyles.fontFamilyMedium,
        color: AppColors.blackColor
    },

    modalListContentViewTxt: {
        color: AppColors.textGray, width: wp(90),paddingTop:hp(2),
        fontFamily: AppStyles.fontFamilyRegular, paddingBottom: hp(2),
        fontSize: 14, justifyContent: 'center', borderBottomColor: AppColors.greyBorder, borderBottomWidth: hp(.1)
    },

    headingTxt: {
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: 16,
        color: AppColors.blackColor
    },
    headingTxt2: {
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: 14,
        color: AppColors.blackColor
    },
    imageView: {
        height: moderateScale(50),
        width: moderateScale(50),
        alignSelf: 'center',
    },
    title: {
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: 16,
        color: AppColors.blackColor, width: wp(32), height: hp(6)
    },
    priceTxt: {
        color: AppColors.primaryColor,
        fontSize: 16,
        marginTop: 10,
        fontFamily: AppStyles.fontFamilyMedium
    },
    smallTxt: {
        color: AppColors.textGray, fontSize: 12, fontFamily: AppStyles.fontFamilyRegular,
    },
    smallTxt2: {
        color: AppColors.textGray, fontSize: 10, fontFamily: AppStyles.fontFamilyRegular,
    },
    productView: {
        backgroundColor: AppColors.whiteColor,
        width: wp(42), borderRadius: 10,
    },

    categoryImageStyle: {
        width: hp(2.5), height: hp(2.5),
        marginRight: wp(3)
    },
    categoryTitleTxt: {
        marginLeft: wp(1),
        marginTop: hp(.5),
        fontSize: wp(2.6), width: wp(17), 
        color: AppColors.blackColor,
        fontFamily: AppStyles.fontFamilyMedium,
        textAlign: isRTL ? 'left' : 'auto',
    },



});

export default VitalHomeScreenStyle;
