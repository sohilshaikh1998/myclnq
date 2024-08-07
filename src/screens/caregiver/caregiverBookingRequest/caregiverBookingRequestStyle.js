import React from 'react';
import {Platform, StyleSheet,I18nManager,} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {moderateScale, verticalScale} from "../../../utils/Scaling";
import {AppUtils} from "../../../utils/AppUtils";
import {AppColors} from "../../../shared/AppColors";
import {AppStyles} from "../../../shared/AppStyles";

const cellWidth = AppUtils.screenWidth / 3;
const unerLineWidth = 0.5
const isRTL = I18nManager.isRTL;
const caregiverBookingRequestStyle = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: AppColors.backgroundGray,
    },
    form: {
        width: wp(100), marginLeft: wp(8), marginRight: wp(8)
        , backgroundColor: AppColors.whiteColor,
        alignItems: 'center',
    },
    header: {
        width: wp(100), height: hp(7),
        alignItems: 'center',
        backgroundColor: AppColors.whiteColor
    },
    topTabView: {
        flexDirection: 'row',
        height: hp(5), width: wp(90),
        alignItems: 'center',
        borderRadius: 19,
    },
    tab: {
        height: hp(5), width: wp(60) / 2,
        justifyContent: 'center', alignItems: 'center',
    },
    txtStyle3: {
        color: AppColors.blackColor,
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: 16, fontWeight: 'bold'
    },
    txtStyle2: {
        color: AppColors.textGray,
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: 14,
    },
    nightStayLine: {
        alignItems: 'center',
        flexDirection: 'row', justifyContent: 'space-between'
    },
    leftRightArrowsImage: {
        height: hp(3),
        width: wp(5),

    },
    gapBy: {
        height: 30,
    },

    nightStayTxt: {
        color: AppColors.blackColor,
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: 15,
    },
    timeBox: {
        width: wp(90 / 2.5),
        height: 30,
        borderBottomColor: AppColors.underLineColorGrey, borderBottomWidth: 1,
        justifyContent: 'center',
        paddingLeft: wp(2),
        paddingRight: wp(2),
        //alignItems: 'center',
    },
    requestTab: {
        borderBottomLeftRadius: 19,
        borderTopLeftRadius: 19,
        borderRightWidth: 0,
    },

    upcomingTab: {
        borderBottomLeftRadius: 0,
        borderTopLeftRadius: 0,
        borderRightWidth: 0,
    },
    pastTab: {
        borderBottomRightRadius: 19,
        borderTopRightRadius: 19,

        borderLeftWidth: 1,
    },
    tabTxt: {
        fontSize: 12,
        fontFamily: AppStyles.fontFamilyMedium, textAlign: 'center', marginTop: hp('.5')
    },
    pageContainer: {
        width: wp(100),
        flex: 1,
        //height: hp(100) - (verticalScale(30) + hp(19)),
        alignItems: 'center',
        marginTop: hp(1),
    },
    card: {
        width: wp(92),
        height: hp(21),
        alignSelf: 'center', alignItems: 'center', justifyContent: 'center',
        borderRadius: 7,
        backgroundColor: AppColors.whiteColor,
    },
    serviceTxt: {
        fontSize: 13,
        fontFamily: AppStyles.fontFamilyMedium,
        color: AppColors.blackColor,
        textAlign: isRTL ? "left" : "auto"
    },
    subService: {
        fontSize: 12,
        fontFamily: AppStyles.fontFamilyMedium,
        color: AppColors.descColor,
        textAlign: isRTL ? "left" : "auto"
    },
    timeStyle: {
        fontSize: 12, width: wp('35'),
        fontFamily: AppStyles.fontFamilyMedium,
        color: AppColors.descColor,
        textAlign: isRTL ? 'left' : 'auto',
    },
    rowView: {
        flexDirection: 'row',
        width: wp(83),
        height: hp(6),
    },
    block1: {width: wp(41.5), justifyContent: 'center',},
    block2: {width: wp(41.5), justifyContent: 'center', alignItems: 'flex-end'},
    block3: {width: wp(41.5), justifyContent: "center", textAlign: isRTL ? 'left' : 'auto',},

    priceBlock: {width: wp(41.5)},
    requestStatusTxt: {
        fontSize: 8,
        fontFamily: AppStyles.fontFamilyMedium,
        color: AppColors.primaryColor,
    },
    btn: {
        height: hp(4),
        width: wp(25),
        backgroundColor: AppColors.primaryColor,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnTxt: {
        fontSize: 8,
        fontFamily: AppStyles.fontFamilyMedium,
        color: AppColors.whiteColor,
        marginTop: Platform.OS === 'ios' ? hp(0.5) : hp(0)
    },
    line: {borderBottomColor: AppColors.greyBorder, borderBottomWidth: 1,},
    providerView: {width: wp(34), flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end'},
    providerSubView: {width: wp(34), flexDirection: 'row', alignItems: 'center'},

    providerImage: {height: wp(6), width: wp(6),borderRadius: 100,borderWidth:1,borderColor:AppColors.whiteColor},
    modal: {
        width: wp(90),
        alignItems: 'center',
        height: hp(80),
        borderRadius: 16,
        alignSelf: 'center',
        backgroundColor: AppColors.whiteColor,
        position: 'absolute',
    },
    modal1: {
        width: wp(90),
        alignItems: 'center',
        height: hp(60),
        borderRadius: 16,
        alignSelf: 'center',
        backgroundColor: AppColors.whiteColor,
        position: 'absolute',
    },
    
    modalView1: {
        height: hp(13), width: wp(90),
        borderTopLeftRadius: 16, borderTopRightRadius: 16,
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: AppColors.primaryColor,
    },
    innerModalView1: {
        height: hp(6), width: wp(75),
        justifyContent: 'space-between',
    },
    modalView2: {
        width: wp(90),
    },
    modalView3: {
        height: hp(13), width: wp(90),
        borderBottomLeftRadius: 16, borderBottomRightRadius: 16,
        alignItems: 'center',
        paddingTop: hp(2),
        backgroundColor: AppColors.whiteColor
    },
    modalHeadingTxt: {
        fontSize: 18,
        fontFamily: AppStyles.fontFamilyMedium,
        color: AppColors.whiteColor,
    },
    subHeadingTxt: {
        fontSize: 14,
        fontFamily: AppStyles.fontFamilyMedium,
        color: AppColors.whiteColor,
    },
    cancelIcon: {
        height: 30, width: 30, marginRight: 10
    },
    closeIcon: {
        height: hp(2),
        width: wp(4),
    },
    closeIconView: {
        right: wp(3), top: wp(3),
        position: 'absolute',
        zIndex: 2,
        alignSelf: 'flex-end',
    },
    priceTxt: {
        color: AppColors.blackColor2,
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: 12,
    },
    confirmBtn: {
        borderRadius: 23,
        backgroundColor: AppColors.primaryColor,
        height: hp(6),
        width: wp(35),
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: hp(0.8)
    },
    confirmBtnTxt: {
        color: AppColors.whiteColor,
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: 12,
    },
    placeHolderView: {
        height: hp(100) - (verticalScale(30) + hp(19)),
        justifyContent: 'center', alignItems: 'center',
    },
    placeHolderImage: {
        height: verticalScale(100),
        width: moderateScale(100),
        margin: moderateScale(20),
        marginTop: hp(-10),
    },
    placeHolderTxt: {
        color: AppColors.primaryColor,
        fontSize: moderateScale(15),
        fontFamily: AppStyles.fontFamilyBold,
        //marginTop: hp(-5),
    },


    modalListContentView: {
        width: wp(90),
        borderBottomColor: AppColors.greyBorder, borderBottomWidth: 0.5,
        alignItems: 'center',
    },
    modalListContentInnerView: {
        width: wp(75),
        flexDirection: 'row',
        paddingTop: 20,
    },
    modalListContentViewHead: {
        width: wp(20),
        paddingBottom: 20,
    },
    modalListContentViewTxt: {
        color: AppColors.blackColor,
        fontFamily: AppStyles.fontFamilyRegular,
        fontSize: 14,
    },
    modalListContentViewTxtAction: {
        color: AppColors.blackColor,
        fontFamily: AppStyles.fontFamilyRegular,
        fontSize: 14,justifyContent:'center',marginTop:hp(.5)
    },
    modalListContentViewTail: {
        width: wp(60),
        paddingLeft: 25,
        paddingRight: 25,
        paddingBottom: 20,
    },
    modalListContentViewSubTxt: {
        color: AppColors.greyColor,
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: 12,justifyContent:'center'
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

export default caregiverBookingRequestStyle;
