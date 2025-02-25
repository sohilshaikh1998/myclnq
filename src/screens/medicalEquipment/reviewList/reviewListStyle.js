import React, { Component } from 'react';
import {
    Platform,
    StyleSheet,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

import { AppColors } from "../../../shared/AppColors";
import { AppStyles } from "../../../shared/AppStyles";
import {AppUtils} from "../../../utils/AppUtils";

const medicalReviewScreenStyle = StyleSheet.create({
    container: {
         flex: 1, backgroundColor: AppColors.whiteShadeColor 
    },
    reviewView:{
        width: wp(90),
        shadowRadius: 5,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        
        shadowOpacity: .2,
        shadowColor: '#000000',
        elevation: 0, borderRadius: hp(.5),
        alignSelf: 'center', backgroundColor: AppColors.whiteColor, marginTop: hp(3)
    },
    reviewtitle:{
        fontSize: hp(2.5), color: AppColors.blackColor,
        fontFamily: AppStyles.fontFamilyMedium
    },
    avgView:{ flexDirection: 'row', alignItems: 'center', top: hp('2'), borderBottomWidth: 0, borderBottomColor: AppColors.underLineColorGrey, marginBottom: hp(2) },
    avgText:{
        fontSize: hp(5),color: AppColors.blackColor,
        fontFamily: AppStyles.fontFamilyMedium,bottom:hp(1)
    },
    swipeIndicatorCommonStyle: {
        width: hp(1.2), height: hp(1.2), borderRadius: hp(1.2/2),
        marginTop: hp(-13),
    },
    reviewText:{
        fontSize: hp(1.8), color: AppColors.textGray,
        fontFamily: AppStyles.fontFamilyMedium
    },
    reviewDesc:{
        fontSize: hp(2.2),color: AppColors.textGray,
        fontFamily: AppStyles.fontFamilyMedium
    },
    name:{
        fontSize: hp(2.2),
        fontFamily: AppStyles.fontFamilyMedium,color: AppColors.blackColor,
    },
    date:{
        fontSize: hp(2.2), color: AppColors.textGray,
        fontFamily: AppStyles.fontFamilyMedium
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
        alignSelf: 'center',
        marginTop: hp(4),
        marginBottom: hp(2),
    },
    bestSellerInnerView: {
        width: wp(100),
        alignSelf: 'center',
        marginTop: hp(4),

    },  cancelIcon: {
        height: hp(4), width: hp(3),alignSelf:'flex-end',margin:hp(1)
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
        fontSize: 16,
        color: AppColors.blackColor
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
    productViewImageView: {
        height: 150,
        width: wp(42),
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
        fontSize: 16,
        marginTop: 10,
        fontFamily: AppStyles.fontFamilyMedium,
    },
    priceView: { flex: 1}


});

export default medicalReviewScreenStyle;
