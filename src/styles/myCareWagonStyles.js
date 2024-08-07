import React from 'react';
import {StyleSheet} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {AppStyles} from '../shared/AppStyles';
import {AppColors} from "../shared/AppColors";
import {AppUtils} from "../utils/AppUtils";
import {moderateScale} from "../utils/Scaling";

const styles = StyleSheet.create({

    container: {
        flex: 1,
    },
    map: {
        position: 'absolute',
        top: 0,
        height: hp(60),
        width: wp(100)
    },
    form: {
        width: wp('100%'),
        height: (AppUtils.isX) ? hp(38) : hp(44),
        alignSelf: 'center',
        bottom: 0,
        position: 'absolute',
        paddingTop: hp('1%'),
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        shadowOpacity: 0
    },
    pickupViewStyle: {
        height: hp('6%'),
        width: wp('90%'),
        alignSelf: 'center',
        paddingLeft: hp('1%'),
        paddingRight: hp('1%'),
        backgroundColor: AppColors.whiteColor,
    },
    pack1: {
        fontSize: (AppUtils.screenHeight > 580) ? hp('2.5%') : hp('2%'),
        borderBottomWidth: 0,
        textAlign: 'left',
        borderColor: AppColors.backgroundGray
    },
    pack2: {
        fontSize: hp('3%'),
        color: '#808080'
    },
    pack3: {
        fontSize: hp('2%'),
        color: '#808080'
    },
    tray1: {
        alignItems: 'center',
        alignSelf: 'center',
        flexDirection: 'row',
        marginTop: hp('1%'),
    },
    tray1PickerViewStyle: {
        justifyContent: 'center',
    },
    vehiclePickerDimension: {
        height: ((AppUtils.headerHeight > 580)) ? (AppUtils.isX) ? hp('4%') : hp(6) : hp(7),
        borderBottomWidth: 1,
        borderColor: AppColors.primaryColor
    },
    tripPickerViewStyle: {
        height: hp('4%'),
        width: wp('40%'),
        borderBottomWidth: 1,
        borderColor: AppColors.primaryColor
    },
    paymentPickerViewStyle: {
        height: hp('4%'),
        width: wp('35%'),
    },

    addNoteViewStyle: {
        width: wp('85%'),
        height: hp('4%'),
        alignSelf: 'center',
        marginTop: hp('2%'),
        borderBottomWidth: 1,
        borderColor: AppColors.primaryColor,
        borderRadius: 5,
        padding: 3,
        backgroundColor: AppColors.whiteColor
    },

    bookingDetails: {
        flexDirection: 'row',
        width: wp('100%'),
    },
    bookLater: {
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        width: wp('23%'),
        height: hp(4),
        borderRadius: 5,
        borderColor: AppColors.whiteColor,
        borderWidth: 1,
    },
    autoCompleteContainer: {
        width: wp('90%'),
        alignSelf: 'center',
        position: 'absolute',
        paddingLeft: hp('1%'),
        paddingRight: hp('1%'),
        backgroundColor: AppColors.whiteColor
    },

    description: {
        fontWeight: 'bold',
        color: AppColors.blackColor,
        backgroundColor: AppColors.whiteColor,
    },
    textInput: {
        borderBottomWidth: 1,
        borderColor: AppColors.backgroundGray,
        marginLeft: 0,
        marginRight: 0,
        height: (AppUtils.heightWindow > 580) ? 38 : 25,
        color: '#5d5d5d',
        fontSize: 16,
        

    },
    predefinedPlacesDescription: {
        color: AppColors.blackColor

    },
    totalAmount: {
        fontSize: hp('1.8%'),
        color: AppColors.primaryColor,
        marginTop: hp(0.8),
        fontFamily: AppStyles.fontFamilyBold,
        marginLeft: wp('1%')
    },
    twoWayReturn: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: AppColors.transparent,
        height: AppUtils.screenHeight,
        width: AppUtils.screenWidth

    },
    selectReturnHour: {
        flexDirection: 'column',
        height: hp(50),
        backgroundColor: AppColors.whiteColor,
        borderRadius: moderateScale(10),
        alignSelf: 'center',
        alignItems: 'center',
        elevation: 5,

    },
    selectReturnTrip: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignSelf: 'center',
        alignItems: 'center',
        width: wp(60),
        height: moderateScale(50),
        marginBottom: hp(1)
    },
    returnTimeText: {
        color: AppColors.blackColor,
        fontFamily: AppStyles.fontFamilyBold,
        flex: 3,
        fontSize: 17,
        marginTop: hp(3),
        textAlign: 'center',
        marginRight: wp(7),
    },
    twoWayTime: {
        width: wp(50),
        borderBottomWidth: 1,
        borderColor: AppColors.backgroundGray,
        marginLeft: wp(5),
        marginRight: wp(5)
    },
    hospitalData: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignSelf: 'center',
        alignItems: 'center',
        width: wp(80),
        height: moderateScale(50),
        marginLeft: wp(15),
        marginBottom: hp(1)
    },
    selectHospitalList: {
        color: AppColors.blackColor,
        fontFamily: AppStyles.fontFamilyBold,
        flex: 3,
        fontSize: 17,
        marginTop: hp(1)
    },
    hospitalName: {
        color: AppColors.blackColor,
        fontFamily: AppStyles.fontFamilyMedium,
        borderBottomWidth: 1,
        textAlign: 'left',
        alignItems: 'center',
        height: hp(8)
    }


});

export default styles;
