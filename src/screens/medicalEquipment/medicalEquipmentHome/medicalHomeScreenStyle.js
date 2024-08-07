import React, { Component } from 'react';
import {
    Platform,
    StyleSheet,
    I18nManager
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

import { AppColors } from "../../../shared/AppColors";
import { AppStyles } from "../../../shared/AppStyles";
import {AppUtils} from "../../../utils/AppUtils";
import { scale, verticalScale, moderateScale } from "../../../utils/Scaling";

const isRTL = I18nManager.isRTL;
const medicalHomeScreenStyle = StyleSheet.create({
    container: {

    },
    swipeIndicatorCommonStyle: {
        width: hp(1.2), height: hp(1.2), borderRadius: hp(1.2/2),
        marginTop: hp(-13),
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
    categoryInnerView: {
        width: wp(84),
        height: hp(10),
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryRowAlignment: {
        justifyContent: 'space-around', flexDirection: 'row', flex: 1, backgroundColor: AppColors.whiteColor,
    },
    categoryIndividualAlignment: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius:hp(1.2),
        padding:hp(1),borderColor:AppColors.primaryColor,
        width: wp(84/4),marginTop:hp(1),marginBottom:hp(1),marginRight:hp(1),borderWidth:hp(.1)
    },
    bestSeller: {
        width: wp(90),
        alignSelf: 'center',
        marginTop: hp(4),
        marginBottom: hp(2),
    },
    bestSellerInnerView: {
        width: wp(100),
        alignSelf: 'center',
        marginTop: hp(4),

    },
    greyDot:{ width: hp(1.5), height: hp(1.5), borderRadius: hp(1.5 / 2), backgroundColor: AppColors.backgroundGray} ,
    greyLine:{ width: wp(10), height: hp(.2), backgroundColor: AppColors.backgroundGray },
    headingTxt: {
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: 16,
        color: AppColors.blackColor,
        textAlign: isRTL ? 'left' : 'auto',

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
        color: AppColors.blackColor,width:wp(32),height:hp(6)
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
    pagerData:{ backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center' },
    productViewImageView: {
        height: 150,
        width: wp(42),
        alignContent: 'center',
        justifyContent: 'center',
    },nameView:{ height: 85, marginLeft: wp(1.8), marginRight: wp(1.8) },
    bestSellerSubView:{ flex: 1, alignItems: 'center', },
    pagerImage:{
        height: hp(26), marginBottom: hp(5),
        width: wp(80), alignSelf: 'center'
    },
    starView:{ flex: 1, marginLeft: wp(5), justifyContent: 'center' },
    trackProduct:{ flexDirection: 'row', flex: 1, marginTop: hp('2') },
    productViewImageStyle: {
        height: hp(20),
        width: wp(35),
        marginTop: hp(1),
        marginBottom: hp(1),
        alignSelf: 'center',
    },shipView:{ flexDirection: 'row', alignItems: 'center', marginTop: hp(2) },
    ratedNameView:{ flex: 1, marginLeft: wp(5), justifyContent: 'center', flexDirection: 'column' },
    urlView:{ flexDirection: 'row', alignContent: 'center' },
    viewAll: {
        marginTop: hp(4),
        borderRadius: 10,
        backgroundColor: AppColors.primaryColor,
        height: hp(6),
        width: wp(36),
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnTxt: {
        color: AppColors.whiteColor, fontSize: 18, fontFamily: AppStyles.fontFamilyMedium,
        marginTop: (AppUtils.isIphone)? hp(.5) : 0
    },
    review: {
        marginTop: hp(2),
        backgroundColor: AppColors.whiteColor,
        height: hp(17), width: wp(90),
        borderRadius: 10,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    ratingView:{ height: hp(16), width: wp(84), marginTop: hp(3) },
    ratingTrackView:{ flexDirection: 'row', alignContent: 'center', justifyContent: 'space-between', marginTop: hp(2) },
    redLine:{ width: wp(10), height: hp(.2), backgroundColor: AppColors.primaryColor },
    redDot:{ width: hp(1.5), height: hp(1.5), borderRadius: hp(1.5 / 2), backgroundColor: AppColors.primaryColor },
    CategoryImageStyle: {
        width: hp(5), height: hp(5)
    },
    CategoryTxt:{
        marginTop:hp(1.5),
        fontSize: 10.5,
        fontFamily: AppStyles.fontFamilyRegular,textAlign:'center'
    },
    box: {
        width: 50,
        height: 50,
        backgroundColor: '#ff4848',
        alignSelf: 'center',
        borderRadius: 10,
        opacity: 0.9
    },
    
    priceView: { flex: 1,justifyContent:'center'}


});

export default medicalHomeScreenStyle;
