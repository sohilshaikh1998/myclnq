import React from 'react';
import {Dimensions, Platform, StyleSheet,I18nManager} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {moderateScale} from "../../../utils/Scaling";
import {AppUtils} from "../../../utils/AppUtils";
import {AppColors} from "../../../shared/AppColors";
import {AppStyles} from "../../../shared/AppStyles";

const {width, height} = Dimensions.get('window');

const cellWidth = AppUtils.screenWidth / 3;
const unerLineWidth = 0.5
const isRTL = I18nManager.isRTL;

const caregiverHomeScreenStyle = StyleSheet.create({
    container: {
        flex: 1, backgroundColor: AppColors.whiteColor,
    },
    gapBy: {
        height: 30,
    },

    gapBy2: {
        height: 8,
        marginTop: 20,
    },
    panClosedView: {
        flex: 1, width: wp(100),
        marginTop: Platform.OS === 'ios' ? hp(0) : hp(-0.5)
    },

    header: {
        width: wp(100), height: 80,
        alignSelf: 'center',
        backgroundColor: AppColors.whiteColor,
    },
    innerHeader: {
        flexDirection: 'row',
        alignContent: 'center',
        alignSelf: 'center',
        height: AppUtils.headerHeight,
        width: wp(102)
    },
    headingTxt: {
        color: AppColors.blackColor,
        textAlign: 'center', alignSelf: 'center',
        fontFamily: Platform.OS === 'ios' ? AppStyles.fontFamilyRegular : AppStyles.fontFamilyMedium,
        fontSize: 16
    },
    sideBlock: {
        width: cellWidth / 2,
        justifyContent: 'center',
        alignItems: 'center'
    },
    middleBlock: {
        width: cellWidth * 2, alignItems: 'center', alignSelf: 'center',
        justifyContent: 'center',
    },
    subHeader: {
        flex: 1,
        alignItems: 'center',
        marginTop: hp(0.1),
    },
    addressView: {
        width: wp(90),
        borderRadius: 9,
        borderColor: AppColors.underLineColorGrey,
        borderWidth: 0.5,
        height: 70,
        justifyContent: 'center',
        alignItems: 'center',
    },
    innerAddressView: {
        alignItems: 'center',
        flexDirection: 'row',
        width: wp(80),
        height: hp(9),
    },
    addAddressView: {
        flex: 10,
        justifyContent: 'center',
    },
    dropDownView: {
        justifyContent: "center",
        alignItems: 'flex-end',
        flex: 2,
    },
    dropDownImage: {
        height: moderateScale(9),
        width: moderateScale(16),
    },
    dropDownImage2: {
        height: moderateScale(7),
        width: moderateScale(11),
    },
    leftRightArrowsImage: {
        height: hp(3),
        width: wp(5),

    },
    smallBackArrow: {
        height: hp(3),
        width: wp(7),
    },
    settingImage: {
        // height: hp(3),
        // width: wp(5),
        height: wp(7),
        width: wp(7),
        alignSelf: 'flex-end',
        marginRight: hp(3),
    },
    closeIcon: {
        height: moderateScale(14),
        width: moderateScale(14),
    },
    addressPlaceHolderTxt: {
        color: AppColors.blackColor,
        marginBottom: 3,
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: 14
    },
    addressTxt: {
        color: AppColors.placeholderTxtColor,
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: 12,
        lineHeight: 15,
        padding: 0,
    },
    expandedPanStyle: {
        width: wp(100),
        height: hp(65),
        backgroundColor: AppColors.whiteColor,
        alignSelf: 'center',
    },
    panHead: {
        height: hp(25),
        alignItems: 'center',
    },
    innerPanHead: {
        height: hp(22),
        width: wp(90),
    },
    headerTxtLine: {
        flexDirection: "row",
        alignItems: 'center',
    },
    box: {
        width: 50,
        height: 50,
        backgroundColor: '#f67280',
    },
    optionHeadTxt: {
        color: AppColors.primaryColor,
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: hp(3),
        marginLeft: wp(2),
        marginTop: Platform.OS === 'ios' ? hp(1) : hp(0)

    },
    optionView: {
        borderColor: AppColors.primaryColor,
        borderWidth: 1,
        borderRadius: 3,
        height: hp(5),
        width: wp(44),
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionTxt: {
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: 14,
    },
    title: {

        color: AppColors.blackColor,
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: 14

    },
    address: {
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: 12,
        marginTop: hp(0.2),
        lineHeight: hp(2),

    },
    nationallityModal: {justifyContent: 'center', zIndex: 2},
    // nationalityView: {
    //     width: wp('100'),
    //     height: hp('100'),
    //     alignItems: 'center',
    //     justifyContent: 'center',
    //     alignSelf: 'center',
    //     backgroundColor: "rgba(0,0,0,0.3)"
    // },
    subView: {width: wp('100'), height: hp('100')},
    panExpand: {
        backgroundColor: AppColors.greyColor2,
        borderRadius: 23,
        height: hp(1),
        width: wp(10),
        marginTop: hp(2)
    },
    selectorView: {
        flex: 1,
        backgroundColor: 'rgba(52, 52, 52, 0.8)',
        height: height, width: width,
        alignSelf: 'center',
        alignItems: 'center'
    },
    cancelView: {
        height: 40, width: width - 30,
        backgroundColor: AppColors.whiteColor,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end'
    },
    dateView: {
        backgroundColor: AppColors.primaryColor,
        height: 50,
        width: width - 30,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center'
    },
    dateText: {
        fontFamily: AppStyles.fontFamilyBold,
        fontSize: 18,
        color: AppColors.whiteColor,
        alignSelf: 'center'
    },
    openView: {
        width: wp('100'),
        height: hp('100'),
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        backgroundColor: "rgba(0,0,0,0.3)"
    },
    form: {
        width: wp(100),
        backgroundColor: AppColors.whiteColor,
        alignItems: 'center',
    },
    nightStayLine: {
        alignItems: 'center',
        flexDirection: 'row', justifyContent: 'space-between'
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
        textAlign: isRTL ? 'right' : 'auto',
        //alignItems: 'center',
    },
    cancelIcon: {
        height: 30, width: 30, marginRight: 10
    },
    ageGenderRowStyle: {
        height: 50,
        alignItems: 'center',
        width: wp(90),
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    Box: {
        width: wp(90 / 2.5),
        borderBottomColor: AppColors.underLineColorGrey, borderBottomWidth: 1,
        height: 50,
        paddingLeft: wp(2),
        paddingRight: wp(2),
    },
    softHeading: {
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: 14,
        color: AppColors.textGray,
        textAlign: isRTL ? 'left' : 'auto',
    },
    ageView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: wp(90 / 2.5),
        height: 34,
        paddingRight: wp(5),
    },
    genderView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: wp(90 / 2.5),
        height: 34,
        paddingRight: wp(4),
    },
    genderTxt: {
        color: AppColors.blackColor,
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: 15,
    },
    nationalityView: {
        width: wp(90),
    },
    nationalityInnerView: {
        width: wp(90),
    },
    moreView: {
        flexDirection: 'row',
        width: wp(12),
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderBottomColor: AppColors.primaryColor,
        borderBottomWidth: 0.8,
    },
    moreTxt: {
        color: AppColors.primaryColor,
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: 12,
    },
    plusIcon: {
        height: moderateScale(12),
        width: moderateScale(12),
    },
    nationalityModalView: {
        height: hp(55),
        width: wp(90),
    },
    ageModalView: {
        width: wp(30),
        alignItems: 'center',
    },
    modalBox: {
        borderRadius: 20,
        alignSelf: 'center',
        justifyContent: 'center',
        backgroundColor: AppColors.whiteColor,
        position: 'absolute',
        padding: 30,
    },
    nationalityTxt: {
        color: AppColors.blackColor,
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: 15,
    },
    outerRadio: {
        borderColor: AppColors.greyColor,
        borderWidth: 1,
        width: wp(3.5),
        height: wp(3.5),
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    innerRadio: {
        backgroundColor: AppColors.primaryColor,
        width: wp(2.5),
        height: wp(2.5),
        borderRadius: 50,
    },
    txtStyle1: {
        color: AppColors.blackColor,
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: 12,
    },
    txtStyle2: {
        color: AppColors.textGray,
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: 14,
        textAlign: isRTL ? 'left' : 'auto',
    },
    radioView: {
        flexDirection: 'row', alignItems: 'center', width: wp(25),
    },
    radioRowView: {
        flexDirection: 'row', alignItems: 'center', width: wp(60), justifyContent: 'space-between', marginTop: 10
    },
    subServiceView: {
        width: wp(90), height: 30,
        borderBottomColor: AppColors.underLineColorGrey, borderBottomWidth: 1,
        flexDirection: 'row',
        alignItems: 'center', justifyContent: 'space-between', alignSelf: 'center',
        paddingLeft: wp(2), paddingRight: wp(2),
        marginTop: hp(1),
    },
    subServiceModalDimention: {
        height: hp(40),
        width: wp(90),
        alignItems: 'center',
    },
    additionalInfoView: {
        width: wp(90),
        height: 80,
        borderBottomColor: AppColors.underLineColorGrey,
        borderBottomWidth: 1,
        paddingLeft: wp(2),
        paddingRight: wp(2)
    },
    additionalInfoTxt: {
        fontSize: 15,
        fontFamily: AppStyles.fontFamilyMedium,
        height: 80,
        textAlign: isRTL ? 'right' : 'auto',
    },
    buttonRowView: {
        width: wp(80),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignSelf: 'center',
    },
    buttonView: {
        borderRadius: 23,
        borderColor: AppColors.primaryColor,
        borderWidth: 1,
        width: wp(35),
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmModalBox: {
        width: wp(90),
        alignItems: 'center',
        height: hp(80),
        borderRadius: 16,
        alignSelf: 'center',
        backgroundColor: AppColors.whiteColor,
        position: 'absolute',
    },
    redBarView: {
        height: hp(12), width: wp(90),
        //marginTop: hp(-5),
        alignItems: 'center',
        backgroundColor: AppColors.primaryColor,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    viewBelowredBarView: {
        width: wp(93),
        alignItems: 'center',
        height: hp(65),
    },
    viewBelowredBarView1: {
        height: hp(52),
        width: wp(90),
        alignItems: 'center',
    },
    viewBelowredBarView2: {
        height: hp(12),
        width: wp(90),
        alignItems: 'center',
        justifyContent: 'center',
    },
    redBarInnerView: {
        width: wp(72),
        alignSelf: 'center',
        justifyContent: 'center',
    },
    redBarTxt: {
        color: AppColors.whiteColor,
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: 18,
        textAlign: isRTL ? 'left' : 'auto',

    },
    closeIconView: {
        alignSelf: 'flex-end', justifyContent: 'center', alignItems: 'center',
        height: hp(3), width: wp(6),
        marginRight: wp(2), marginTop: wp(2),
        padding: 0,
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
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: 14,
        textAlign: isRTL ? 'left' : 'auto',

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
        fontSize: 12,
        textAlign: isRTL ? 'left' : 'auto',

    },
    patientView: {
        backgroundColor: AppColors.primaryColor,
        height: hp(6), width: wp(37),
        marginRight: wp(2),
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    patientInnerView: {
        flexDirection: 'row',
        height: hp(4), width: wp(30),
        alignItems: 'center',

    },
    patientImage: {
        height: wp(8),
        width: wp(8),
        borderRadius: 50,
    },
    patientTxt: {
        color: AppColors.whiteColor,
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: hp(1.5),
    },
    addNewMemberIcon: {
        height: wp(6),
        width: wp(6),
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
    priceTxt: {
        color: AppColors.blackColor2,
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: 12,
    },
    adjustImage: {
        height: hp(3),
        width: wp(5),
    },


    addressModal: {
        position: 'absolute',
        height: hp(60), width: wp(90),
        backgroundColor: AppColors.whiteColor,
        borderRadius: 13,
    },
    addressModalView1: {
        height: hp(10), width: wp(90),
        justifyContent: 'center', alignItems: 'center',
    },
    addressModalView1TxtView: {
        width: wp(75),
    },
    modalTxt: {
        color: AppColors.blackColor,
        fontFamily: AppStyles.fontFamilyBold,
        fontSize: 16,
    },
    addressListView: {
        height: hp(38), width: wp(90),
        justifyContent: 'center', alignItems: 'center',
    },
    innerAddressListView: {
        flexDirection: 'row',
        height: hp(10),
        width: wp(80),
        alignItems: 'center',
        borderBottomWidth: 1, borderBottomColor: AppColors.greyBorder,
        paddingTop: hp(1), paddingBottom: hp(1),
    },
    innerAddressListView1: {
        height: hp(8), width: wp(10),
        alignItems: 'center', justifyContent: 'center',
    },
    innerAddressListView2: {
        width: wp(60),
    },
    innerAddressListView3: {
        flexDirection: 'row',
        height: hp(8), width: wp(10),
        alignItems: 'center', justifyContent: 'space-between',
    },
    addressModalView2: {
        height: hp(12), width: wp(90),
        alignItems: 'center',
    },
    addressModalBtn: {
        flexDirection: 'row',
        height: hp(5), width: wp(40),
        borderRadius: 6,
        backgroundColor: AppColors.primaryColor,
        justifyContent: 'center', alignItems: 'center',
        marginTop: hp(2),
    },
    addressModalBtnTxt: {
        color: AppColors.whiteColor,
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: 12,
    },
    addressModalGPSIcon: {
        height: wp(6),
        width: wp(6),
    },
    addressOuterRadio: {
        borderColor: AppColors.primaryColor,
        borderWidth: 1,
        width: wp(3.7),
        height: wp(3.7),
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addressInnerRadio: {
        backgroundColor: AppColors.primaryColor,
        width: wp(2.7),
        height: wp(2.7),
        borderRadius: 50,
    },
    binImage: {
        height: wp(4),
        width: wp(4),
    },
    addSelectorIndicator: {
        justifyContent: 'center', alignItems: 'center',
        height: hp(10), width: wp(86),
        borderRadius: 7,
        borderColor: AppColors.greyBorder,
    },


});

export default caregiverHomeScreenStyle;
