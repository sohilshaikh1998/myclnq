import React, { Component } from 'react';
import {
    Platform,
    StyleSheet,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

import { AppColors } from "../../../shared/AppColors";
import { AppStyles } from "../../../shared/AppStyles";
import {AppUtils} from "../../../utils/AppUtils";

const medicalWishScreenStyle = StyleSheet.create({
    container: {
        flex: 1, backgroundColor: AppColors.whiteShadeColor 
    },
    subContainer:{ flex: 1, flexDirection: 'row', marginRight: hp('2') },
    swipeIndicatorCommonStyle: {
        width: hp(1.2), height: hp(1.2), borderRadius: hp(1.2/2),
        marginTop: hp(-13),
    },
    selectAll:{ flexDirection: 'row',  height: hp(6),width:wp(40) },
    checkImage:{
        height: hp(3.5),
        width: AppUtils.isX?hp(5):hp(9),
        alignSelf: 'center'
    },
    selectText:{
        alignSelf: 'center',
        marginTop: (AppUtils.isIphone) ? hp(.5) : 0,
        fontSize: hp(2),
        fontFamily: AppStyles.fontFamilyRegular
    },
    checkoutView:{
        width: wp(100),
        shadowOffset: {
            width: 0,
            height: -3,
        },
        shadowOpacity: .2,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000000',
        backgroundColor: AppColors.whiteColor,
        paddingBottom: (AppUtils.isX) ? hp(2) : 0,
        elevation: 2,
        height: (AppUtils.isX) ? hp(12) : hp(10),
        flexDirection: 'row'
    },
    checkoutTextView:{
        height: hp(6),
        width: wp(45),
        backgroundColor: AppColors.primaryColor,
        borderWidth: 2,
        justifyContent: 'center',
        borderRadius: hp(.8),
        alignItems: 'center',
        borderColor: AppColors.primaryColor
    },
    checkoutText:{
        fontFamily: AppStyles.fontFamilyRegular, color: AppColors.whiteColor,
        marginTop: (AppUtils.isIphone) ? hp(.5) : 0,
        fontSize: hp(2.2)
    },
    remove:{ position: 'absolute', alignSelf: 'flex-end' },
    productView:{ height: 80, marginLeft: wp(1.8), marginRight: wp(1.8) },
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
        marginTop: hp(2),justifyContent:'center',marginLeft:hp(2)

    },  cancelIcon: {
        height: hp(4), width: hp(3),alignSelf:'flex-end',margin:hp(1)
    },
    headingTxt: {
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: 16,
        color: AppColors.blackColor,width:wp(40)
    },
    headingTxt2: {
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: 14,
        color: AppColors.blackColor
    },
    title: {
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: 16,marginTop:hp(.5),
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
        width: wp(45), borderRadius: 10,
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
        marginTop: hp(2),
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

export default medicalWishScreenStyle;
