import React from 'react';
import {Dimensions, StyleSheet} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {AppStyles} from '../../shared/AppStyles'
import {AppUtils} from "../../utils/AppUtils";
import {moderateScale, verticalScale} from '../../utils/Scaling';
import {AppColors} from "../../shared/AppColors";

const {width, height} = Dimensions.get('window');

const ReviewProductStyle = StyleSheet.create({
    container: {},
    scrollView: {
        height: height,
        width: width,
        backgroundColor: AppColors.whiteColor,
        borderTopWidth: .8,
        borderTopColor: AppColors.backgroundGray
    },
    inputStyle: {
        height: hp('15'),
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: 15,
        color: AppColors.blackColor,
        borderBottomWidth: 1,
        borderBottomColor: AppColors.backgroundGray,
        backgroundColor: AppColors.lightGray, padding: hp('3'), textAlignVertical: 'top'
    },
    insideView: {margin: moderateScale(10), marginTop: verticalScale(.5), justifyContent: 'center'},
    insideView1: {margin: moderateScale(10), marginTop: verticalScale(.5), justifyContent: 'center'},

    bottomView: {
        width: wp(100), justifyContent: 'center',
        shadowOffset: {
            width: 0,
            height: -3,
        },
        shadowOpacity: .2,
        shadowColor: '#000000', backgroundColor: AppColors.whiteColor,
        elevation: 2, height: hp(10),
    },
    buttonView: {
        height: hp(5),
        width: wp(25),
        marginRight: wp(5),
        backgroundColor: AppColors.primaryColor,
        borderWidth: 2,
        justifyContent: 'center',
        alignSelf: 'center',
        borderRadius: hp(.8),
        alignItems: 'center',
        borderColor: AppColors.primaryColor
    },
    buttonText: {
        fontFamily: AppStyles.fontFamilyRegular, color: AppColors.whiteColor,
        marginTop: (AppUtils.isIphone) ? hp(.5) : 0,
        fontSize: hp(1.8)
    },
    swipeIndicatorCommonStyle: {
        width: hp(1.2), height: hp(1.2), borderRadius: hp(1.2 / 2),
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
        width: wp(84 / 4)
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

    }, cancelIcon: {
        height: hp(4), width: hp(3), alignSelf: 'flex-end', margin: hp(1)
    },
    headingTxt: {
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: 16,
       margin:hp(2)
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
        marginTop: (AppUtils.isIphone) ? hp(.5) : 0
    },
    review: {
        marginTop: hp(1),
        backgroundColor: AppColors.whiteColor,
        height: hp(37), width: wp(90),
        borderRadius: 10,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    reviewCompany: {
        marginTop: hp(1),
        backgroundColor: AppColors.whiteColor,
        height: hp(37), width: wp(90),
        borderRadius: 10,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        borderTopWidth: 1, borderColor: AppColors.backgroundGray,
    },
   
    CategoryImageStyle: {
        width: 40, height: 40
    },
    CategoryTxt: {
        marginTop: hp(2),
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
    priceView: {flex: 1}


});

export default ReviewProductStyle;
