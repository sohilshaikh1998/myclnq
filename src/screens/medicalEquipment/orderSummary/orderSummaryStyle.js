import React, { Component } from 'react';
import {
    Platform,
    StyleSheet,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

import { AppColors } from "../../../shared/AppColors";
import { AppStyles } from "../../../shared/AppStyles";
import {AppUtils} from "../../../utils/AppUtils";
import { scale, verticalScale, moderateScale } from "../../../utils/Scaling";

const orderSummeryStyle = StyleSheet.create({
 
greyDot:{ width: hp(2.5), height: hp(2.5), borderRadius: 50, backgroundColor: AppColors.backgroundGray} ,
greyLine:{ width: wp(13), height: hp(.2), backgroundColor: AppColors.backgroundGray },
redLine:{ width: wp(13), height: hp(.2), backgroundColor: AppColors.primaryColor },
redDot:{ width: hp(2.5), height: hp(2.5),  borderRadius: 50, backgroundColor: AppColors.primaryColor },
smallTxt: {
    color: AppColors.textGray, fontSize: 12, fontFamily: AppStyles.fontFamilyRegular,
},
smallTxt2: {
    color: AppColors.textGray, fontSize: 10, fontFamily: AppStyles.fontFamilyRegular,
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
imageView:{
    height: moderateScale(50),
    width: moderateScale(50),
    alignSelf: 'center',
},
title: {
    fontFamily: AppStyles.fontFamilyMedium,
    fontSize: 16,
    color: AppColors.blackColor
},
})
export default orderSummeryStyle;
