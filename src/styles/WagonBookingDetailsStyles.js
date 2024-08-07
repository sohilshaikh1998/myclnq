import React from 'react';
import {StyleSheet} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from "react-native-responsive-screen";
import {AppColors} from "../shared/AppColors";
import {AppUtils} from "../utils/AppUtils";
import {AppStyles} from "../shared/AppStyles";


const styles = StyleSheet.create({

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
        width: wp(50)
    },
    wagon: {
        height: hp('25%'),
        width: wp('30%'),
        alignSelf: 'center',
    },
    pickupButton: {
        height: hp(4),
        width: wp(100),
        marginTop: hp(2),
        alignSelf: 'center',
        tintColor: AppColors.primaryColor
    },
    expandScreenHeader: {
        height: (AppUtils.headerHeight),
        width: wp(100),
        backgroundColor: AppColors.whiteColor,
        alignItems: 'center',
        justifyContent: 'flex-start',
        alignSelf: 'center',
        elevation: 2,
        flexDirection: 'row',
        paddingTop: (Platform.OS === 'ios') ? 20 : 0
    },
    pickupDetails: {
        color: AppColors.blackColor,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: 15
    },
    backIcon: {
        height: hp(4),
        width: wp(9),
        marginLeft: 10
    },
    pickUpFields: {
        color: AppColors.textGray,
        fontFamily: AppStyles.fontFamilyBold,
        width: wp(25),
        fontSize: 15
    },
    hashSymbol: {
        color: AppColors.textGray,
        fontFamily: AppStyles.fontFamilyBold,
        width: wp(5),
        fontSize: 15
    },
    bookingDesign: {
        flexDirection: 'row',
        marginTop: hp('2%')
    },
    bookingDetail: {
        justifyContent: 'center',
        alignSelf: 'center',
        marginLeft: wp(23)
    },
    specialNote: {
        height: hp('9%'),
        borderWidth: 1,
        borderRadius: 8,
        padding: 5,
        borderColor: AppColors.textGray,
        width: wp(50),
        backgroundColor: AppColors.whiteColor
    },

});
export default styles