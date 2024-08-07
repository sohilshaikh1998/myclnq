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

const productDetailsStyle = StyleSheet.create({
    container: { flex: 1, backgroundColor: AppColors.whiteShadeColor }
    ,
    productName:{
        color: AppColors.blackColor, marginRight: wp(10), marginTop: hp(1),
        marginLeft: wp(5), fontFamily: AppStyles.fontFamilyMedium,
        fontSize: hp(2.4),
        textAlign: isRTL ? 'left' : 'auto',
    },soldBy:{
        marginTop: hp(.8), color: AppColors.textGray, marginRight: wp(1),
        marginLeft: wp(5), fontFamily: AppStyles.fontFamilyRegular,
        fontSize: hp(2.2)
    },amount:{
        color: AppColors.primaryColor,
        marginLeft: wp(5), fontFamily: AppStyles.fontFamilyMedium,
        fontSize: hp(3)
    },stockView:{
        marginLeft: wp(5),
        height: hp(3.5),
        width: wp(17),
        borderRadius: hp(2),
        borderWidth: 0,
        backgroundColor: AppColors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center'
    },stockText:{
        color: AppColors.whiteColor,
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: hp(1.8),  marginTop: AppUtils.isIphone ? hp(.5) : hp(0)
    },delivery:{
        color: AppColors.textGray,
        marginLeft: wp(5), fontFamily: AppStyles.fontFamilyRegular,
        fontSize: hp(1.8),
        marginTop: AppUtils.isIphone ? hp(1) : hp(1)
    },description:{
        color: AppColors.blackColor, marginRight: wp(5), marginTop: hp(2.5),
        paddingBottom: hp(1),
        marginLeft: wp(5), fontFamily: AppStyles.fontFamilyRegular,
        fontSize: hp(2)
    },specificationView:{
        width: wp(90),
        
        shadowColor: '#000000',
        elevation: 0, borderRadius: hp(.5),
        alignSelf: 'center', backgroundColor: AppColors.whiteColor, marginTop: hp(3)
    },productSpecification:{
        fontSize: hp(2.5), color: AppColors.blackColor,
        fontFamily: AppStyles.fontFamilyMedium
    },footer:{

        width: wp(100),
        shadowOffset: {
            width: 0,
            height: -3,
        },
        shadowOpacity: .2,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#000000', backgroundColor: AppColors.whiteColor, paddingBottom: (AppUtils.isX) ? hp(2) : 0,
        elevation: 2, height: (AppUtils.isX) ? hp(12) : hp(10), flexDirection: 'row'
    },
    reviewView:{
        width: wp(90),
        shadowColor: '#000000',
        elevation: 0, borderRadius: hp(.5),marginTop:hp(1),
        alignSelf: 'center',
    },
    cartView:{
        height: hp(5), width: wp(35), marginRight: wp(5),
        borderWidth: 2, justifyContent: 'center', borderRadius: hp(.8), alignItems: 'center', borderColor: AppColors.primaryColor
    },cartText:{
        fontFamily: AppStyles.fontFamilyRegular, color: AppColors.primaryColor,
        marginTop: (AppUtils.isIphone) ? hp(.5) : 0,
        fontSize: hp(1.8)
    },
    buyView:{
        height: hp(5), width: wp(35), marginRight: wp(5),
        backgroundColor: AppColors.primaryColor,
        borderWidth: 2, justifyContent: 'center', borderRadius: hp(.8), alignItems: 'center', borderColor: AppColors.primaryColor
    },buyText:{
        fontFamily: AppStyles.fontFamilyRegular, color: AppColors.whiteColor,
        marginTop: (AppUtils.isIphone) ? hp(.5) : 0,
        fontSize: hp(1.8)
    },
    cardView:{
        backgroundColor: AppColors.whiteColor,
        marginBottom: hp(2),
        width: wp(90),
        alignSelf: 'center'
    },cardSubView:{ flexDirection: 'column', marginLeft: hp(1), marginRight: hp(1) },
    orderIdView:{
        flexDirection: 'row', borderBottomWidth: 0, borderColor: AppColors.backgroundGray,
        height: hp(5), alignItems: 'center'
    },orderIdText:{
        flex: 1,
        fontFamily: AppStyles.fontFamilyRegular,
        color: AppColors.textGray,
        fontSize: hp(1.4),
        marginLeft: wp(3),
        marginTop: AppUtils.isIphone ? hp(1) : 0
    },orderTotal:{
        color: AppColors.primaryColor,
        marginLeft: wp(5), fontFamily: AppStyles.fontFamilyMedium,
        fontSize: hp(2)
    },orderDate:{
        flexDirection: 'row', borderBottomWidth: 1, borderColor: AppColors.backgroundGray,
        height: hp(5), alignItems: 'center'
    },
    dateText:{
        flex: 1,
        fontFamily: AppStyles.fontFamilyRegular,
        color: AppColors.textGray,
        fontSize: hp(1.4),
        marginLeft: wp(3),
        marginTop: AppUtils.isIphone ? hp(1) : 0
    },productImage:{
    height: hp(8),
    width: hp(8),
    alignSelf: 'center'
},

orderStatus:{
    flex: 1, textAlign: 'right',
    fontFamily: AppStyles.fontFamilyRegular,
    fontSize: hp(1.5),
},brand:{
    flex: 1,
    fontFamily: AppStyles.fontFamilyRegular,
    color: AppColors.textGray,
    fontSize: hp(1.5),
    marginLeft: wp(5),
    marginTop: AppUtils.isIphone ? hp(1) : 0
},productAmount:{
    flex: 1, textAlign: 'right',
    fontFamily: AppStyles.fontFamilyRegular,
    fontSize: hp(1.5), 
},seller:{
    marginTop: hp(.3),
    color: AppColors.textGray,
    width: wp(65),
    marginLeft: wp(5), fontFamily: AppStyles.fontFamilyRegular,
    fontSize: hp(1.5)
},
   
    reviewtitle:{
   
    
    fontSize: hp(2.5), color: AppColors.blackColor,
    fontFamily: AppStyles.fontFamilyMedium
},
    avgView:{ flexDirection: 'row', alignItems: 'center', top: hp('2'), borderBottomWidth: 1, borderBottomColor: AppColors.backgroundGray, marginBottom: hp(2) },
    avgText:{
        fontSize: hp(5), color: AppColors.blackColor,
        fontFamily: AppStyles.fontFamilyMedium, bottom: hp(1)
    },
    swipeIndicatorCommonStyle: {
        width: hp(1.2), height: hp(1.2), borderRadius: hp(1.2/2),
        marginTop: hp(-13),
    },
    reviewText:{
        fontSize: hp(1.8), color: AppColors.textGray,
        fontFamily: AppStyles.fontFamilyMedium
    },
    viewAll:{
        marginTop: hp(4),
        borderRadius: 10,
        backgroundColor: AppColors.primaryColor,
        height: hp(5),
        width: wp(26),
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },viewAllText:{
        color: AppColors.whiteColor, fontSize: hp(1.8), fontFamily: AppStyles.fontFamilyMedium,
        marginTop: (AppUtils.isIphone) ? hp(.5) : 0
    },
    reviewDesc:{
        fontSize: hp(2),color: AppColors.blackColor,
        fontFamily: AppStyles.fontFamilyMedium ,width:wp(90)
    },
    name:{
        fontSize: hp(2.2),
        fontFamily: AppStyles.fontFamilyMedium,color: AppColors.blackColor,marginTop:AppUtils.isIphone?hp(1):0
    },userImage:{height: wp(8), width: wp(8),borderRadius: 100,borderWidth:0,marginRight:hp(1)},
    date:{
        fontSize: hp(1.6), color: AppColors.textGray,
        fontFamily: AppStyles.fontFamilyMedium,marginBottom:hp(1)
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
    },sellerName:{
        color: AppColors.blueColor, textDecorationLine: 'none', marginTop: hp(.8),
        fontFamily: AppStyles.fontFamilyRegular,
        fontSize: hp(1.8)
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

export default productDetailsStyle;
