import React, { Component } from 'react';
import {
    Platform,
    StyleSheet,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

import { AppColors } from "../../../shared/AppColors";
import { AppStyles } from "../../../shared/AppStyles";
import {AppUtils} from "../../../utils/AppUtils";

const selectPaymentStyle = StyleSheet.create({
    container: { flex: 1, backgroundColor: AppColors.whiteShadeColor },
    paymentHeader:{
        height: hp(10),
        justifyContent: 'center',
        width: wp(100),
        backgroundColor: AppColors.primaryColor
    },paymentText:{
        color: AppColors.whiteColor,
        fontSize: hp(2),
        marginLeft: 30,
        marginRight: 10,
        fontFamily: AppStyles.fontFamilyMedium
    },orderView:{
        width: wp(100),
        shadowRadius: 5,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: .2,
        shadowColor: '#000000',
        elevation: 0, borderRadius: hp(.5),
        alignSelf: 'center', backgroundColor: AppColors.whiteColor
    },orderTotalView:{
        height: hp(7),
        alignItems: 'center',
        marginBottom: hp(1.5),
        marginLeft: wp(5),
        marginRight: wp(5),
        width: wp(90),
        flexDirection: 'row',
        backgroundColor: AppColors.whiteColor
    },
    totalLabel:{
        flex: 1,
        color: AppColors.blackColor,
        fontSize: hp(2.2),
        fontFamily: AppStyles.fontFamilyMedium
    },
    totalText:{
        color: AppColors.primaryColor,
        fontSize: hp(2.2),
        fontFamily: AppStyles.fontFamilyMedium
    },
    detailView:{flex: 1, flexDirection: 'row', alignItems: 'center',},
    detailText:{
        flex: 1,
        color: AppColors.blackColor,
        textAlign: 'right',
        fontSize: hp(2),
        fontFamily: AppStyles.fontFamilyMedium,padding:hp(1)
    },pay:{ flex: 1, marginRight: wp(5), alignItems: 'flex-end' },
    payView:{
        height: hp(6),
        width: wp(45),
        backgroundColor: AppColors.primaryColor,
        borderWidth: 2,
        justifyContent: 'center',
        borderRadius: hp(.8),
        alignItems: 'center',
        borderColor: AppColors.primaryColor
    },payText:{
        fontFamily: AppStyles.fontFamilyRegular, color: AppColors.whiteColor,
        marginTop: (AppUtils.isIphone) ? hp(.5) : 0,
        fontSize: hp(2.2)
    },totalView:{
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
    },totalPrice:{ marginLeft: wp(5),color:AppColors.primaryColor, marginTop: (AppUtils.isIphone) ? hp(.5) : 0, fontSize: hp(2.5), fontFamily: AppStyles.fontFamilyMedium },
    addressText:{
        marginLeft: wp(6),
        color: AppColors.textGray,
        width: wp(80),
        marginTop: hp(.2),
        marginBottom: hp(2),
        fontSize: hp(1.6)
    },
    commonView:{flex: 1, flexDirection: 'row', alignItems: 'center'},
    addressLabel:{
        marginLeft: wp(6),
        color: AppColors.textGray, marginTop: hp(.8),
        fontSize: hp(2)
    },contactView:{
        marginLeft: wp(6),
        color: AppColors.blackColor, marginTop: hp(.8),
        fontSize: hp(2)
    },
    elevatedView:{height: (Platform.OS === 'ios') ? hp(12) : hp(14), width: wp(100), backgroundColor: AppColors.whiteColor},
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
        fontSize: 20,
        padding:0,
        borderWidth:0
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

export default selectPaymentStyle;
