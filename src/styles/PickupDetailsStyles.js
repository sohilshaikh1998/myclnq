import React from 'react';
import {StyleSheet,    I18nManager,
} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {AppStyles} from "../shared/AppStyles";
import {AppColors} from "../shared/AppColors";

const isRTL = I18nManager.isRTL;
const Styles = StyleSheet.create({

    content: {
        alignItems: 'center',
        backgroundColor: AppColors.whiteColor,
    },
    details: {
        fontSize: hp('2.5%'),
        textAlign: 'center',
        fontFamily: AppStyles.fontFamilyMedium,
        color: AppColors.blackColor,
        paddingTop: hp(2)
    },
    accepted: {
        fontSize: hp('3%'),
        color: AppColors.blackColor,
        textAlign: 'center',
        letterSpacing: 1,
        fontFamily: AppStyles.fontFamilyMedium
    },
    driver: {
        color: AppColors.blackColor,
        fontSize: hp('2%'),
        fontFamily: AppStyles.fontFamilyMedium,
        width: wp(50),
        textAlign: isRTL ? "left" : "auto"
    },
    wagon: {
        height: hp('30%'),
        width: wp('40%'),
        alignSelf: 'center',
    },
    pickupButton: {
        height: hp(8),
        width: wp(100),
        marginTop: hp(2),
        alignSelf: 'center',
        tintColor: AppColors.primaryColor
    },
    pickupScreenHeader: {
        height: (Platform.OS === 'ios') ? hp(10) : hp(7),
        paddingTop: (Platform.OS === 'ios') ? hp(3) : hp(0),
        width: wp(100),
        backgroundColor: AppColors.whiteColor,
        alignItems: 'center',
        justifyContent: 'flex-start',
        alignSelf: 'center',
        elevation: 5,
        flexDirection: 'row',
        marginTop: 0
    },
    pickupDetails: {
        color: AppColors.blackColor,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: 15
    },
    blackArrowIcon: {
        height: hp(4),
        width: wp(9),
        marginLeft: 10
    },
    hashTag: {
        color: AppColors.textGray,
        fontFamily: AppStyles.fontFamilyBold,
        width: wp(5),
        fontSize: 15
    },
    driverFields: {
        color: AppColors.textGray,
        fontFamily: AppStyles.fontFamilyBold,
        width: wp(25),
        fontSize: 15,
        textAlign: isRTL ? "left" : "auto"
    },
    payButton: {
        height: hp(4),
        width: wp(17),
        borderWidth: 1,
        justifyContent: 'center',
        borderColor: AppColors.primaryColor,
        borderRadius: wp(5)
    },
    payHeader: {
        alignSelf: 'center',
        marginLeft: wp(13),
        justifyContent: 'center',
    },
    pay: {
        color: AppColors.primaryColor,
        alignSelf: 'center',
        fontSize: 12,
        fontFamily: AppStyles.fontFamilyBold
    },
    confirmPayment: {
        height: hp(5),
        width: wp(30),
        borderWidth: 1,
        borderRadius: 5,
        borderColor: AppColors.primaryColor,
        alignSelf: 'center',
        justifyContent: 'center',
        backgroundColor: AppColors.primaryColor
    },
    confirmButton: {
        fontSize: 15,
        color: AppColors.whiteColor,
        alignSelf: 'center',
        justifyContent: 'center'
    }


});
export default Styles;