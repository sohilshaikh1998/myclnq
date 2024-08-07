import React, { Component } from 'react';
import {
    Platform,
    StyleSheet,
    I18nManager,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

import { AppColors } from "../../../shared/AppColors";
import { AppStyles } from "../../../shared/AppStyles";
import {AppUtils} from "../../../utils/AppUtils";
const isRTL = I18nManager.isRTL;

const searchProductStyle = StyleSheet.create({
    container: {flex: 1, backgroundColor: AppColors.whiteShadeColor},
    elevatedView:{height: (Platform.OS === 'ios') ? hp(14) : hp(14), width: wp(100),
        paddingTop:(Platform.OS === 'ios') ? hp(2) : hp(0),
        backgroundColor: AppColors.whiteColor},
    searchView:{flexDirection: 'row', marginTop: (Platform.OS === 'ios') ? 0 : hp(2),},
    inputView:{
        width: wp(80), marginLeft: wp(2), borderWidth: wp(.2),
        borderColor: AppColors.backgroundGray, borderRadius: hp(1.2),
        height: hp(5),
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: AppColors.whiteShadeColor
    },searchIcon:{
        height: hp(3),
        width: hp(3),
        marginLeft: wp(2),
        marginRight: wp(2),
    },inputStyle:{
        width: wp(70),
        color: AppColors.blackColor3,
        fontSize: wp(4),
        padding:0,
        borderWidth:0,
        textAlign: isRTL ? 'right' : 'auto',
    },clearView:{alignSelf: 'center', alignItems: 'center', height: hp(5), justifyContent: 'center'},
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
        marginTop: hp(-4),

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
        width: wp(84/4)
    },
    bestSeller: {
        width: wp(90),
        height: hp(75),
        alignSelf: 'center',
    },
    bestSellerInnerView: {
        width: wp(100),
        alignSelf: 'center',
        height: hp(72),
        marginTop: hp(2),

    },emptyText: {
        alignSelf: 'center',
        marginTop: (AppUtils.isIphone) ? hp(.5) : 0,
        fontSize: hp(2.5),
        fontFamily: AppStyles.fontFamilyMedium
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
    title: {
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: 16,marginTop:hp(1.5),
        color: AppColors.blackColor,height: 24,
    },
    smallTxt: {
        color: AppColors.textGray, fontSize: 12, fontFamily: AppStyles.fontFamilyRegular,
    },
    smallTxt2: {
        color: AppColors.textGray, fontSize: 10, fontFamily: AppStyles.fontFamilyRegular,
    },
    productView: {
        backgroundColor: AppColors.whiteColor,
        width: wp(45), borderRadius: 10,
    },
    productViewImageView: {
        height: 150,
        width: wp(45),
        alignContent: 'center',
        justifyContent: 'center',
    },
    productViewImageStyle: {
        height: hp(20),
        width: wp(35),
        marginTop: hp(1),
        marginBottom: hp(1),
        alignSelf: 'center',
    },
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
    CategoryImageStyle: {
        width: 40, height: 40
    },
    CategoryTxt:{
        marginTop:hp(2),
        fontSize: 10.5,
        fontFamily: AppStyles.fontFamilyBold,
    },
    box: {
        width: 50,
        height: 50,
        backgroundColor: '#ff4848',
        alignSelf: 'center',
        borderRadius: 10,
        opacity: 0.9
    },
    priceTxt: {
        color: AppColors.primaryColor,
        fontSize: hp(2.2),
        marginTop: 10,
        justifyContent: 'flex-end',
        marginBottom: hp(1),
        fontFamily: AppStyles.fontFamilyRegular,
    },
    priceView: { flex: 1}


});

export default searchProductStyle;
