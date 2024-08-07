import React, { Component } from 'react';
import {
    Platform,
    StyleSheet,
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

import { AppColors } from "../../../shared/AppColors";
import { AppStyles } from "../../../shared/AppStyles";
import { AppUtils } from "../../../utils/AppUtils";

const cartStyle = StyleSheet.create({
    container: {
        flex: 1, backgroundColor: AppColors.whiteShadeColor
    },
    subContainer: { flex: 1, backgroundColor: AppColors.whiteShadeColor },
    checkBox: { flexDirection: 'row', alignItems: 'center', height: hp(6), marginLeft: hp(1) },
    checkImage: {
        height: hp(3.5),
        width: AppUtils.isX ? hp(5) : hp(9),
        alignSelf: 'center'
    }, selectText: {
        alignSelf: 'center',
        marginTop: (AppUtils.isIphone) ? hp(.5) : 0,
        fontSize: hp(2),
        fontFamily: AppStyles.fontFamilyRegular
    },
    checkoutView: {
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
    totalText: {
        marginLeft: wp(5),
        marginTop: (AppUtils.isIphone) ? hp(.5) : 0,
        fontSize: hp(2.5),
        fontFamily: AppStyles.fontFamilyMedium
    },
    placeOrder: { flex: 1, marginRight: wp(5), alignItems: 'flex-end' },
    checkView: {
        height: hp(6),
        width: wp(45),
        backgroundColor: AppColors.primaryColor,
        borderWidth: 2,
        justifyContent: 'center',
        borderRadius: hp(.8),
        alignItems: 'center',
        borderColor: AppColors.primaryColor
    }, checkoutText: {
        fontFamily: AppStyles.fontFamilyRegular, color: AppColors.whiteColor,
        marginTop: (AppUtils.isIphone) ? hp(.5) : 0,
        fontSize: hp(2.2)
    },
    emptyView: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: AppColors.whiteShadeColor },
    emptyText: {
        alignSelf: 'center',
        marginTop: (AppUtils.isIphone) ? hp(.5) : 0,
        fontSize: hp(2.5),
        fontFamily: AppStyles.fontFamilyMedium
    }, listProduct: {
        width: wp(100),
        marginTop: hp(1),
        marginBottom: hp(1),
        justifyContent: 'center',
        height: hp(12),
        flexDirection: 'row',
    }, listProductImageView: {
        alignSelf: 'center',
        justifyContent: 'center',
        height: hp(12),
        width: AppUtils.isX ? wp(10) : wp(15),
    }, listProductImage: {
        height: hp(3.5),
        alignSelf: 'center'
    }, cardView: {
        height: hp(12),
        backgroundColor: AppColors.whiteColor,
        width: AppUtils.isX ? wp(82) : wp(80),
        alignSelf: 'flex-end'
    }, itemView: { flexDirection: 'column', marginLeft: hp(1), marginRight: hp(1) },
    itemImage: {
        height: hp(10),
        width: wp(10),
        alignSelf: 'center'
    }, itemName: {
        color: AppColors.blackColor,
        width: wp(55),
        marginTop: hp(1),
        marginLeft: wp(3),
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: hp(1.8),
    }, itemSeller: {
        marginTop: hp(.3),
        color: AppColors.blueColor,
        marginLeft: wp(4), fontFamily: AppStyles.fontFamilyRegular,
        fontSize: hp(1.5)
    }, itemSellerLabel: {
        marginTop: hp(.3),
        color: AppColors.blackColor,
        marginLeft: wp(3), fontFamily: AppStyles.fontFamilyRegular,
        fontSize: hp(1.5)
    }
    , seller: {
        marginTop: hp(.3),
        width: wp(35), 
        marginLeft: wp(1), fontFamily: AppStyles.fontFamilyRegular,
        fontSize: hp(1.5), color: AppColors.blueColor, textDecorationLine: 'none'
    }, trash: {
        height: hp(3),
        marginTop: hp(.5),
        width: wp(6),
        alignSelf: 'flex-start'
    }, itemBottom: { flexDirection: 'row', marginBottom: hp(1), alignItems: 'center', marginTop: hp(.5) },
    itemPrice: {
        color: AppColors.primaryColor, width: AppUtils.isX ? wp(19) : wp(21),
        marginTop: hp(.5),
        marginLeft: wp(3), fontFamily: AppStyles.fontFamilyMedium,
        fontSize: hp(1.8)
    }, leftView: {
        marginLeft: wp(1),
        height: hp(2.5),
        width: wp(15),
        borderRadius: hp(2),
        borderWidth: 0,
        backgroundColor: AppColors.primaryColor,
        alignItems: 'center',
        justifyContent: 'center'
    }, leftText: {
        color: AppColors.whiteColor,
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: hp(1.2), marginTop: (AppUtils.isIphone) ? hp(.5) : 0,

    }, countView: { flexDirection: 'row', alignItems: 'center', marginLeft: wp(8), },
    minus: {
        height: hp(3),
        fontSize: hp(2),
        textAlign: 'center',
        width: hp(3),
        backgroundColor: AppColors.backgroundGray
    }, count: {
        height: hp(3),
        fontSize: hp(1.8),
        paddingTop: hp(.3),
        borderWidth: hp(0),
        //borderColor: AppColors.backgroundGray,
        textAlign: 'center',
        width: hp(3),
        backgroundColor: AppColors.whiteColor
    }, plus: {
        height: hp(3),
        fontSize: hp(2),
        textAlign: 'center',
        width: hp(3),
        backgroundColor: AppColors.backgroundGray
    },


});

export default cartStyle;
