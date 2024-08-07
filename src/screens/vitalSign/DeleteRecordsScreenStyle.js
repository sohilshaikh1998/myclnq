import React from 'react';
import {Platform, StyleSheet,} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {moderateScale, verticalScale} from "../../utils/Scaling";
import {AppUtils} from "../../utils/AppUtils";
import {AppColors} from "../../shared/AppColors";
import {AppStyles} from "../../shared/AppStyles";

const cellWidth = AppUtils.screenWidth / 3;
const unerLineWidth = 0.5

const DeleteRecordsScreenStyle = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppColors.backgroundGray,
    },
    addRecordsTitle:
        {
            color: AppColors.blackColor,
            fontFamily: AppStyles.fontFamilyMedium,
            fontSize: 14,marginLeft:wp(2)
        },

        btnSubmit:{
            backgroundColor:'#ff4848',
            color:'white',
            // borderColor:'#ff4848',
            // borderWidth:hp(.2),
            // borderRadius:hp(1),
            width:wp(90),
            textAlign:'center',
            paddingTop:hp(1.5),
            paddingBottom:hp(1.5),
            marginLeft:wp(2),
            fontSize:16,
            fontFamily:AppStyles.fontFamilyRegular,
        },

    modalListContentView: {
        width: wp(90),
        borderBottomColor: AppColors.greyBorder, borderBottomWidth: wp(.3),
    },

    modalListContentInnerView: {
        flexDirection: 'row',
        paddingTop: hp(.5),
        borderBottomColor: AppColors.greyBorder,
        borderBottomWidth: 0,
    },
    modalListContentInnerActionView: {
        width: wp(75),
        flexDirection: 'row',
        paddingTop: 20,
        borderBottomColor: AppColors.greyBorder,
        borderBottomWidth: 0,
    },
    modalListContentViewHead: {
        width: wp(15),justifyContent:'center',
    },
    modalListContentViewTxt: {
        color: AppColors.textGray,width:wp(70),
        fontFamily: AppStyles.fontFamilyRegular,padding:hp(1),
        fontSize: 14,height:hp(4),justifyContent:'center',
    },
    modalListContentViewTxtAction: {
        color: AppColors.blackColor,
        fontFamily: AppStyles.fontFamilyRegular,
        fontSize: 15,justifyContent:'center',marginTop:hp(.5)
    },
    modalListContentViewTail: {
        width: wp(70),marginTop:hp(1)
        },
    modalListContentViewSubTxt: {
        color: AppColors.blackColor,
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: 10,justifyContent:'center',marginLeft:wp(1.5)
    }, textViewStyle: {
        alignSelf: 'center', height: hp(4), flexDirection: 'row',
        width: wp(90)
    },

    textTitleStyle: {
        flex: 1,
        fontSize: hp(2), marginTop: (AppUtils.isIphone) ? hp(.5) : 0,
        alignSelf: 'center',
        paddingLeft: wp(1), fontFamily: AppStyles.fontFamilyRegular
    },
    commonView:{flex: 1, flexDirection: 'row', alignItems: 'center'},


    textDataStyle: {
        flex: 1,
        fontSize: hp(1.8), marginTop: (AppUtils.isIphone) ? hp(.5) : 0,
        marginRight: wp(1),
        alignSelf: 'center',
        textAlign: 'right',
        fontFamily: AppStyles.fontFamilyRegular
    },
    orderDetailModal:{
        width: wp("100"),
        height: hp("100"),
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        backgroundColor: "rgba(0,0,0,0.3)",
    }


});

export default DeleteRecordsScreenStyle;
