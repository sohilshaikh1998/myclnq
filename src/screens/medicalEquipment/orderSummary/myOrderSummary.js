import React, { Component } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, View, Text, Linking, TouchableOpacity, TouchableHighlight, BackHandler } from 'react-native'
import { AppColors } from "../../../shared/AppColors";
import CardView from "react-native-cardview";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { AppStyles } from "../../../shared/AppStyles";
import { AppUtils } from "../../../utils/AppUtils";
import { scale, verticalScale, moderateScale } from '../../../utils/Scaling';
import ProgressLoader from "rn-progress-loader";

import Toast from 'react-native-simple-toast';
import { SHApiConnector } from "../../../network/SHApiConnector";
import { Actions } from "react-native-router-flux";
import orderSummaryStyle from "./orderSummaryStyle";
import orderListStyle from "../orderList/orderListStyle"

import caregiverBookingRequestStyle from "../../caregiver/caregiverBookingRequest/caregiverBookingRequestStyle"

import ElevatedView from 'react-native-elevated-view';
import images from "./../../../utils/images";

import moment from "moment";
import { color } from 'react-native-reanimated';


import {
    CachedImage,
    ImageCacheProvider
} from '../../../cachedImage';
import { strings } from '../../../locales/i18n';

let currencySymbol;
let userDetails;
let orderStatus;

class myOrderSummary extends Component {
    constructor(props) {
        super(props);
        AppUtils.analyticsTracker('Medical Equipment User Order Summery')


        this.state = {
            subTotal: 0,
            total: 0,
            discount: 0,
            addressList: [],
            selectedAddress: {}, trackId: '', trackOrderId: '', trackOrderUrl: '',
            isAddAddressOpen: false, isLoading: false, orderId: '', delivery: 0, orderStatus: '', orderTotalAmount: 0,
            isAddressOpen: false, track: false, trackItem: '', currencySymbol: '', userDetails: '', orderedOn: ''
        }
        this.goBack = this.goBack.bind(this)

    }

    componentDidMount() {
        AppUtils.console("ComponentMountSummary", this.props);

        this.setState({
            isLoading: true
        })
        this.getOrder()
        try {
            BackHandler.addEventListener("hardwareBackPress", () => {
                this.goBack()
                return true;
            });


        } catch (e) {
            AppUtils.console("Error", e);
        }

    }
    async getOrder() {
        try {
            let subTotal = 0;
            let discount = 0;
            let response = await SHApiConnector.getOrder(this.props.orderId);
            AppUtils.console("getOrder", response.data.response)

            response.data.response.map(product => {

                discount = discount + parseFloat(product.discountCharge);

                product.userQuantity = (product.productQuantity) ? product.productQuantity : 1;
                subTotal = subTotal + (parseFloat(product.amount) * product.productQuantity);
            });
            this.setState({
                productList: response.data.response, subTotal: subTotal, discount: discount, isLoading: false, orderedOn: response.data.response[0].orderedOn,
                currencySymbol: response.data.response[0].currencySymbol, userDetails: response.data.response[0].userDetails,
                orderId: response.data.response[0].orderId, delivery: response.data.response[0].totalShippingCharge, orderStatus: response.data.response[0].orderStatus,
                orderTotalAmount: response.data.response[0].orderTotalAmount
            })

        } catch (e) {
            AppUtils.console("zdcszdcsx", e)
        }
    }

    componentWillReceiveProps(p) {
        AppUtils.console("ComponentReceiveSummary", p)

    }


    renderProduct(item) {
        let itemStatus = AppUtils.getOrderStatus(item.item.orderStatus)

        AppUtils.console("renderItem", item.item.medicalProductId)
        return (
            <CardView cardElevation={2} cornerRadius={5}
                style={{
                    backgroundColor: AppColors.whiteColor,
                    marginBottom: hp(2),
                    width: wp(90),
                    alignSelf: 'center'
                }}>
                <View style={{ flexDirection: 'column', marginLeft: hp(1), marginRight: hp(1) }}>

                    <View style={{ flexDirection: 'row', borderBottomWidth: 1, 
                    //borderColor: AppColors.backgroundGray, 
                    paddingBottom: hp(1) }}>
                        <CachedImage
                            resizeMode={'contain'}
                            style={{

                                height: hp(10),
                                marginLeft: wp(1),
                                width: wp(10),
                                alignSelf: 'center'
                            }}
                            source={{ uri: item.item.medicalProductId.productImages[0] }}
                        />
                        <View style={{ flexDirection: 'column' }}>
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ marginTop: hp(1.5) }}>
                                    <View style={{ flexDirection: 'row', width: wp(50) }}>
                                        <View style={{
                                            width: wp(50), flexDirection: 'row'
                                        }}>
                                            <Text
                                                style={{
                                                    color: AppColors.blackColor, width: wp(35),
                                                    marginTop: hp(1),
                                                    marginLeft: wp(5),
                                                    fontFamily: AppStyles.fontFamilyMedium,
                                                    fontSize: hp(1.8)
                                                }}>{item.item.medicalProductId.productName}</Text>
                                            <Text numberOfLines={1}
                                                style={{
                                                    color: AppColors.blackColor,
                                                    marginTop: hp(1),
                                                    marginLeft: wp(3.5),
                                                    fontFamily: AppStyles.fontFamilyMedium,
                                                    fontSize: hp(1.8)
                                                }}>{'x  ' + item.item.productQuantity}</Text>
                                        </View>
                                        <View >
                                            <Text
                                                numberOfLines={1}
                                                style={{
                                                    marginTop: hp(.6), width: wp(23),
                                                    color: AppColors.primaryColor, textAlign: 'right',
                                                    fontFamily: AppStyles.fontFamilyMedium,
                                                    fontSize: hp(1.8), marginRight: hp(0)
                                                }}>{item.item.medicalProductId.currencySymbol + '' + item.item.medicalProductId.sellingPrice * item.item.productQuantity}</Text>
                                        </View>
                                    </View>
                                    {item.item.discountCharge == 0 ? null :
                                        <View style={{ flexDirection: 'row', width: wp(50) }}>

                                            <Text
                                                numberOfLines={1}
                                                style={{
                                                    marginTop: hp(.3),
                                                    color: AppColors.textGray,
                                                    width: wp(57),
                                                    marginLeft: wp(5), fontFamily: AppStyles.fontFamilyRegular,
                                                    fontSize: hp(1.5)
                                                }}>{strings('doctor.button.discount')} </Text>


                                            <Text
                                                numberOfLines={1}
                                                style={{
                                                    color: AppColors.primaryColor,
                                                    marginLeft: wp(5.5), fontFamily: AppStyles.fontFamilyMedium,
                                                    fontSize: hp(1.5)
                                                }}>{item.item.medicalProductId.currencySymbol + '' + item.item.discountCharge}</Text>

                                        </View>
                                    }



                                    <Text
                                        numberOfLines={1}
                                        style={{
                                            marginTop: hp(.3),
                                            color: AppColors.textGray,
                                            width: wp(50),
                                            marginLeft: wp(5), fontFamily: AppStyles.fontFamilyRegular,
                                            fontSize: hp(1.5)
                                        }}>{strings('equip.brand')} : {item.item.medicalProductId.brand}</Text>



                                    <View style={{ flexDirection: 'row', width: wp(50) }}>

                                        <Text
                                            numberOfLines={1}
                                            style={{
                                                color: AppColors.primaryColor,
                                                width: item.item.orderStatus == "CANCELLED" || item.item.orderStatus == "PAYMENT_PENDING" ? wp(50) : wp(35),
                                                marginLeft: wp(5), fontFamily: AppStyles.fontFamilyRegular,
                                                fontSize: hp(1.5), marginTop: hp(.5)
                                            }}>{itemStatus.orderStatus} {item.item.refundAmount ?
                                                strings('equip.refundAmount', {amount: item.item.currencySymbol + item.item.refundAmount})
                                                : null}
                                        </Text>

                                        <View style={{ width: wp(15), }}>
                                            {item.item.orderStatus == "DELIVERED" ?


                                                <TouchableOpacity onPress={() => Actions.ReviewProduct({ itemDetail: [item.item.medicalProductId], itemId: item.item._id, sellerName: item.item.sellerId.companyName })}>
                                                    <View style={{
                                                        height: hp(3.2), width: wp(15), backgroundColor: AppColors.whiteColor,
                                                        borderWidth: 1, justifyContent: 'center', borderRadius: hp(.8), alignItems: 'center', 
                                                        //borderColor: AppColors.primaryColor
                                                    }}>
                                                        <Text allowFontScaling={false} style={{
                                                            fontFamily: AppStyles.fontFamilyRegular, color: AppColors.primaryColor,
                                                            marginTop: (AppUtils.isIphone) ? hp(.5) : 0,
                                                            fontSize: hp(1.3)
                                                        }}>{strings('equip.rate')}</Text>
                                                    </View>
                                                </TouchableOpacity>
                                                : null}
                                        </View>

                                        {(item.item.orderStatus == "CONFIRMED" || item.item.orderStatus == "PROCESSED" || item.item.orderStatus == "PROCESSING" || item.item.orderStatus == "PACKED" || item.item.orderStatus == "SHIPPED" || item.item.orderStatus == "DELIVERED") ?
                                            this.state.track ? null :
                                                <TouchableOpacity onPress={() => this.trackOrder(item.item)}>
                                                    <View style={{
                                                        height: hp(3.2), width: wp(15), backgroundColor: AppColors.primaryColor, marginLeft: hp(2.1),
                                                        borderWidth: 1, justifyContent: 'center', borderRadius: hp(.8), alignItems: 'center', 
                                                        //borderColor: AppColors.primaryColor
                                                    }}>
                                                        <Text allowFontScaling={false} style={{
                                                            fontFamily: AppStyles.fontFamilyRegular,
                                                            marginTop: (AppUtils.isIphone) ? hp(.5) : 0,
                                                            fontSize: hp(1.3), color: AppColors.whiteColor
                                                        }}>{strings('equip.track')} </Text>
                                                    </View>
                                                </TouchableOpacity> : null}

                                    </View>

                                </View>

                            </View>
                        </View>

                    </View>

                    {this.state.track && this.state.trackId == item.item._id ?
                        <View style={{ marginTop: hp(3), marginBottom: hp(1) }}
                        >
                            {(item.item.orderStatus == 'ORDER_PLACED' || item.item.orderStatus == 'PAYMENT_PENDING') ? null : this.renderTracking(item.item)}


                        </View> : null}


                    <View style={{ flexDirection: 'row', marginBottom: hp(1), marginLeft: wp(1), marginTop: hp(1) }}>
                        <View style={{ flexDirection: 'column' }}>
                            <View style={{
                                flexDirection: 'row'
                            }}>

                                <TouchableOpacity onPress={() => {
                                    Actions.SearchProduct({ seller: item.item.sellerId.companyName })
                                }}>
                                    <Text numberOfLines={1}
                                        style={{
                                            marginTop: hp(.3),
                                            color: AppColors.blueColor,
                                            width: wp(65),
                                            fontFamily: AppStyles.fontFamilyRegular,
                                            fontSize: hp(1.5)
                                        }}>
                                        <Text style={{ color: AppColors.blackColor }}>{strings('equip.soldBy')}</Text>{item.item.sellerId.companyName}</Text>
                                </TouchableOpacity>

                            </View>

                            <Text
                                numberOfLines={2}
                                style={{
                                    marginTop: hp(.3),
                                    color: AppColors.textGray, lineHeight: hp(2),
                                    fontFamily: AppStyles.fontFamilyRegular,
                                    fontSize: hp(1.5)
                                }}>{item.item.sellerId.companyAddress}</Text>

                            <View style={{ flexDirection: 'row' }}>

                                <View style={{ width: wp(50) }}>
                                    <TouchableOpacity onPress={() => Linking.openURL('mailto:' + item.item.sellerId.email + '?subject=' + 'Order Id : ' + item.item.orderId + '\nProduct Name : ' + item.item.medicalProductId.productName)}
                                        style={caregiverBookingRequestStyle.providerSubView}>
                                        <Image
                                            resizeMode={"contain"}
                                            style={[caregiverBookingRequestStyle.providerImage, { borderWidth: 0 }]}
                                            source={images.dashboardMail}
                                        />
                                        <Text
                                            style={
                                                [caregiverBookingRequestStyle.modalListContentViewSubTxt, {
                                                    fontSize: 10, width: wp(45),
                                                    marginLeft: wp(1),
                                                    marginTop: Platform.OS === "ios" ? hp(0.5) : hp(0),
                                                }]
                                            }
                                        >
                                            {item.item.sellerId.email}
                                        </Text>

                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity onPress={() => this.openDialScreen('+' + item.item.sellerId.countryCode +
                                    " " +
                                    item.item.sellerId.phoneNumber)} style={caregiverBookingRequestStyle.providerSubView}>
                                    <Image
                                        resizeMode={"contain"}
                                        style={[caregiverBookingRequestStyle.providerImage, { borderWidth: 0 }]}
                                        source={images.dashboardCall}
                                    />
                                    <Text style={[
                                        caregiverBookingRequestStyle.modalListContentViewSubTxt, {
                                            fontSize: 10,
                                            marginLeft: wp(1),
                                            marginTop: Platform.OS === "ios" ? hp(0.5) : hp(0),
                                        }]}
                                    >{"+" + item.item.sellerId.countryCode + " " + item.item.sellerId.phoneNumber}
                                    </Text>

                                </TouchableOpacity>
                            </View>




                        </View>
                    </View>

                </View>


            </CardView>
        );
    }
    async   trackOrder(item) {
        AppUtils.console("TackId", item)

        try {
            let response = await SHApiConnector.trackOrder({ productOrderId: item._id });
            AppUtils.console("zfczdcsdxc", response)
            if (response.data.status) {
                this.setState({
                    track: true, trackStatus: item.orderStatus,
                    trackItem: item.medicalProductId.productName,
                    trackId: item._id,
                    trackOrderId: response.data.response.trackingNumber,
                    trackOrderUrl: response.data.response.trackUrl,
                })

            }
        } catch (e) {
            AppUtils.console("Place Order", e)
        }

    }
    renderTracking(item) {
        AppUtils.console("renderTack", item)
        let returnMsg = item.medicalProductId.returnDays == 0 ? strings('equip.returnNotAvail') 
        : strings('equip.returnBefore', {returnDate: moment(this.state.orderedOn).add(item.medicalProductId.returnDays, 'day').format('DD MMM YYYY')});
        let maxDay;
        if (item.medicalProductId.deliveryDays)
            maxDay = item.medicalProductId.deliveryDays ? item.medicalProductId.deliveryDays.maxDays : null;


        return (
            <CardView cardElevation={1} cornerRadius={5}
                style={{
                    backgroundColor: AppColors.whiteColor,
                    marginBottom: hp(.5),
                    width: wp(90),
                    alignSelf: 'center', paddingBottom: hp('3')
                }}>
                <View style={{ flexDirection: 'column', marginLeft: hp(1), marginRight: hp(1) }}>
                    {this.state.trackOrderId ?

                        <View style={{ flexDirection: 'row' }}>
                            <Text allowFontScaling={false}
                                numberOfLines={1}
                                style={{
                                    marginTop: hp(.8), color: AppColors.textGray, marginRight: wp(1),
                                    marginLeft: wp(1), fontFamily: AppStyles.fontFamilyRegular,
                                    fontSize: hp(1.8)
                                }}>{strings('equip.trackingId')}:  </Text>
                            <TouchableOpacity onPress={() => { Actions.TrackView({ url: this.state.trackOrderUrl ? this.state.trackOrderUrl : 'https://www.google.com/' }) }}>
                                <Text style={{
                                    color: AppColors.blueColor, textDecorationLine: 'underline', marginTop: hp(.5),
                                    fontFamily: AppStyles.fontFamilyRegular,
                                    fontSize: hp(1.8)
                                }}>{this.state.trackOrderId}</Text></TouchableOpacity>
                        </View> : null}


                    {item.orderStatus == "DELIVERED" ?

                        <Text style={{
                            fontFamily: AppStyles.fontFamilyRegular,
                            color: AppColors.textGray,
                            fontSize: hp(1.5), marginLeft: wp(1),
                            marginTop: AppUtils.isIphone ? hp(1) : hp(1)
                        }}>
                            {returnMsg}

                        </Text>

                        :
                        item.medicalProductId.deliveryDays ?
                            <Text style={{
                                fontFamily: AppStyles.fontFamilyRegular,
                                color: AppColors.textGray,
                                fontSize: hp(1.5), marginLeft: wp(1),
                                marginTop: AppUtils.isIphone ? hp(1) : hp(1)
                            }}>{strings('equip.deliverBefore', {deliverBefore: moment(this.state.orderedOn).add(maxDay, 'day').format('DD MMM YYYY')})}</Text>
                            : null
                    }

                    <Text style={{
                        fontFamily: AppStyles.fontFamilyRegular,
                        color: AppColors.textGray,
                        fontSize: hp(1.4), marginLeft: wp(1),

                    }}>{strings('equip.contactSellerForFurtherEnquiry')}</Text>

                    <View style={{ alignItems: 'center' }}>
                        {this.shipTrack(this.state.trackStatus)}
                    </View>
                </View>
            </CardView>
        )
    }
    shipTrack(item) {
        return (
            <View>
                <View style={{ flexDirection: 'row', marginTop: hp(2) }}>

                    <Text style={{
                        width: wp('18'),
                        fontFamily: AppStyles.fontFamilyRegular,
                        color: AppColors.textGray,
                        fontSize: hp(1.4),
                        marginTop: AppUtils.isIphone ? hp(1) : 0
                    }}>{strings('equip.ordered')}</Text>
                    <Text style={{
                        width: wp('18'),
                        fontFamily: AppStyles.fontFamilyRegular,
                        color: AppColors.textGray,
                        fontSize: hp(1.4),
                        marginTop: AppUtils.isIphone ? hp(1) : 0
                    }}>{strings('equip.processing')}</Text>
                    <Text style={{
                        width: wp('16'),
                        fontFamily: AppStyles.fontFamilyRegular,
                        color: AppColors.textGray,
                        fontSize: hp(1.4), paddingLeft: hp(.6),
                        marginTop: AppUtils.isIphone ? hp(1) : 0
                    }}>{strings('equip.packed')}</Text>
                    <Text style={{
                        width: wp('16'),
                        fontFamily: AppStyles.fontFamilyRegular,
                        color: AppColors.textGray,
                        fontSize: hp(1.4),
                        marginTop: AppUtils.isIphone ? hp(1) : 0
                    }}>{strings('equip.shipped')}</Text>
                    <Text style={{
                        fontFamily: AppStyles.fontFamilyRegular,
                        color: AppColors.textGray,
                        fontSize: hp(1.4),
                        marginTop: AppUtils.isIphone ? hp(1) : 0
                    }}>{strings('equip.delivered')}</Text>


                </View>


                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: hp(1), marginLeft: hp(1.5) }}>

                    <View style={orderSummaryStyle.redDot} />
                    <View style={orderSummaryStyle.redLine} />
                    <View style={item == 'CONFIRMED' ? orderSummaryStyle.greyDot : orderSummaryStyle.redDot} />
                    <View style={item == 'CONFIRMED' ? orderSummaryStyle.greyLine : orderSummaryStyle.redLine} />
                    <View style={(item == 'CONFIRMED' || item == 'PROCESSING' || item == 'PROCESSED') ? orderSummaryStyle.greyDot : orderSummaryStyle.redDot} />
                    <View style={item == 'CONFIRMED' || item == 'PROCESSING' || item == 'PROCESSED' ? orderSummaryStyle.greyLine : orderSummaryStyle.redLine} />
                    <View style={(item == 'CONFIRMED' || item == 'PROCESSING' || item == 'PROCESSED' || item == 'PACKED') ? orderSummaryStyle.greyDot : orderSummaryStyle.redDot} />
                    <View style={item == 'CONFIRMED' || item == 'PROCESSING' || item == 'PROCESSED' || item == 'PACKED' ? orderSummaryStyle.greyLine : orderSummaryStyle.redLine} />

                    <View style={item == 'DELIVERED' ? orderSummaryStyle.redDot : orderSummaryStyle.greyDot} />
                </View>
            </View>
        )



    }
    wagonSettings() {
        Actions.Settings();
    }
    menuIconPressed() {
        this.setState({ isMenuPressed: !this.state.isMenuPressed }, () => {
            Actions.drawerOpen();
        });
    }

    renderIOS() {
        const cellWidth = AppUtils.screenWidth / 3;
        return (

            <ElevatedView style={[styles.headerStyle, { flexDirection: 'row' }]} elevation={0}>

                <View
                    style={{
                        width: cellWidth,
                        height: (AppUtils.headerHeight),
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingTop: (AppUtils.isIphone) ? AppUtils.isX ? 0 : 16 : 0,
                    }}>
                    <TouchableHighlight underlayColor="transparent" onPress={this.goBack}
                        testID={"drawer"}>
                        <Image
                            style={{
                                height: moderateScale(30),
                                width: moderateScale(30),
                                marginTop: AppUtils.isX ? (16 + 18) : 0,
                                marginLeft: 8
                            }}
                            source={images.smallBackIcon}
                        />
                    </TouchableHighlight>
                </View>
                <View style={{ width: cellWidth, height: hp('6'), marginTop: hp('1'), alignItems: 'center', justifyContent: 'center' }}>
                    <Text allowFontScaling={false} style={styles.headerTextIOS}>{this.props.title}</Text>
                </View>
                <View style={{
                    width: cellWidth,
                    height: (AppUtils.headerHeight),
                    justifyContent: 'flex-end',
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingTop: (AppUtils.isIphone) ? AppUtils.isX ? 0 : 16 : 0,
                }}>
                    <TouchableHighlight onPress={() => Actions.drawer()} underlayColor="transparent"
                        style={{ marginRight: 8 }}>
                        <Image
                            style={{
                                height: moderateScale(30),
                                width: moderateScale(30),
                                marginTop: AppUtils.isX ? (16 + 18) : 0,
                            }}
                            source={images.equipmentHome}
                        />
                    </TouchableHighlight>
                </View>
            </ElevatedView>

        )
    }

    goBack() {
        if (this.state.track) {
            this.setState({ track: false })

        } else {
            Actions.pop()
        }
    }

    navToHomescreen() {
        Actions.MainScreen()
    }

    renderAndroid() {
        const cellWidth = AppUtils.screenWidth / 3;
        return (

            <ElevatedView style={[styles.headerStyle, { flexDirection: 'row' }]} elevation={0}>

                <TouchableHighlight onPress={this.goBack} underlayColor="transparent"
                    style={{
                        width: cellWidth,
                        height: (AppUtils.headerHeight),
                        justifyContent: 'center',
                        //backgroundColor: '#f18867',
                    }}>

                    <Image
                        style={{
                            height: moderateScale(30),
                            width: moderateScale(30),
                            marginTop: AppUtils.isX ? (16 + 18) : 0,
                            marginLeft: 8
                        }}
                        source={images.smallBackIcon}
                    />
                </TouchableHighlight>

                <View style={{
                    width: cellWidth,
                    height: (AppUtils.headerHeight),
                    justifyContent: 'center',
                }}>
                    <Text allowFontScaling={false} style={styles.headerTextIOS}>{this.props.title}</Text>
                </View>

                <View style={{
                    width: cellWidth,
                    height: (AppUtils.headerHeight),
                    justifyContent: 'flex-end',
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingTop: (AppUtils.isIphone) ? AppUtils.isX ? 0 : 16 : 0,
                }}>
                    <TouchableHighlight onPress={() => Actions.drawer()} underlayColor="transparent"
                        style={{ marginRight: 8 }}>
                        <Image
                            style={{
                                height: moderateScale(30),
                                width: moderateScale(30),
                                marginTop: AppUtils.isX ? (16 + 18) : 0,
                            }}
                            source={images.equipmentHome}
                        />
                    </TouchableHighlight>
                </View>

            </ElevatedView>

        )
    }

    renderHeader() {
        return (
            <View style={{
                paddingTop: hp(2),
                paddingBottom: hp(2),
                justifyContent: 'center',
                width: wp(100),
                backgroundColor: AppColors.primaryColor
            }}>
                {(orderStatus.orderStatus === 'Payment Pending') ? null :

                    <Text style={{
                        color: AppColors.whiteColor,
                        fontSize: hp(2),
                        marginLeft: 30,
                        marginRight: 10,
                        marginTop: hp(2),
                        fontFamily: AppStyles.fontFamilyMedium
                    }}>{strings('equip.orderId')} {this.state.orderId}</Text>}

                <Text style={{
                    color: AppColors.whiteColor,
                    fontSize: hp(1.5),
                    marginLeft: 30,
                    marginRight: 10,
                    fontFamily: AppStyles.fontFamilyRegular
                }}>{moment(this.state.orderedOn).format('DD MMM YYYY, hh:mm A')}</Text>
                {(orderStatus.orderStatus === 'Payment Pending') ? null :
                    <Text style={{
                        color: AppColors.whiteColor,
                        fontSize: hp(2),
                        marginLeft: 30,
                        marginRight: 10,
                        marginTop: hp(2),
                        fontFamily: AppStyles.fontFamilyMedium
                    }}>{this.state.userDetails.userName + ",  +" + this.state.userDetails.countryCode + " " + this.state.userDetails.contactNumber}</Text>
                }
                {(orderStatus.orderStatus === 'Payment Pending') ? null :
                    <Text style={{
                        color: AppColors.whiteColor,
                        fontSize: hp(1.6),
                        marginLeft: 30,
                        marginRight: wp(20), lineHeight: hp(2),
                        fontFamily: AppStyles.fontFamilyRegular
                    }}>{AppUtils.getAddress(this.state.userDetails)}</Text>
                }
            </View>


        )
    }
    renderDetail() {
        return (
            <View style={{
                width: wp(90),
                shadowRadius: 5,
                shadowOffset: {
                    width: 0,
                    height: 2,
                },
                shadowOpacity: .2,
                shadowColor: '#000000',
                elevation: 0, borderRadius: hp(.5),
                alignSelf: 'center', backgroundColor: AppColors.whiteColor
            }}>
                <View style={styles.textViewStyle}>

                    <Text style={styles.textTitleStyle}>{strings('equip.subTotal')}</Text>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.textDataStyle}>{this.state.currencySymbol + this.state.subTotal}</Text>
                    </View>
                </View>
                <View style={styles.textViewStyle}>

                    <Text style={styles.textTitleStyle}>{strings('equip.delivery')}</Text>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.textDataStyle}>{(this.state.delivery) ? this.state.currencySymbol + this.state.delivery : this.state.currencySymbol + '0'}</Text>
                    </View>

                </View>

                <View style={styles.textViewStyle}>

                    <Text style={styles.textTitleStyle}>{strings('equip.discount')}</Text>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                        <Text
                            style={styles.textDataStyle}>{(this.state.discount) ? this.state.currencySymbol + this.state.discount : this.state.currencySymbol + '0'}</Text>
                    </View>

                </View>


                <View style={styles.textViewStyle}>

                    <Text style={[styles.textTitleStyle, { color: AppColors.primaryColor }]}>{strings('equip.total')}</Text>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', }}>
                        <Text
                            style={[styles.textDataStyle, { color: AppColors.primaryColor }]}>{this.state.orderTotalAmount ? this.state.currencySymbol + this.state.orderTotalAmount : 'N/A'}</Text>
                    </View>
                </View>

            </View>


        )
    }

    render() {
        orderStatus = AppUtils.getOrderStatus(this.state.orderStatus);
        AppUtils.console("Orderstatus", this.state.productList, orderStatus);


        return (
            <View style={{ flex: 1, backgroundColor: AppColors.whiteShadeColor }}>
                {(AppUtils.isIphone) ? this.renderIOS() : this.renderAndroid()}
                {this.state.isLoading ? null : this.renderHeader()}
                <ScrollView showsVerticalScrollIndicator={false}>
                    <FlatList
                        style={{ marginTop: hp(2) }}
                        data={this.state.productList}
                        renderItem={(item) => this.renderProduct(item)}
                        keyExtractor={(item, index) => index.toString()}
                    />
                    {this.state.isLoading ? null : this.renderDetail()}
                    <View style={{ height: hp(10) }} />
                </ScrollView>
                <ProgressLoader
                    visible={this.state.isLoading}
                    isModal={true} isHUD={true}
                    hudColor={"#FFFFFF"}
                    color={AppColors.primaryColor} />
                {(orderStatus.orderStatus === 'Payment Pending') ? this.footer() : null}
            </View>
        );
    }
    footer() {
        return (
            <View style={{

                width: wp(100),
                shadowOffset: {
                    width: 0,
                    height: -3,
                },
                shadowOpacity: .2,
                alignItems: 'center', justifyContent: 'center',
                shadowColor: '#000000', backgroundColor: AppColors.whiteColor, paddingBottom: (AppUtils.isX) ? hp(2) : 0,
                elevation: 2, height: (AppUtils.isX) ? hp(12) : hp(10), flexDirection: 'row'
            }}>



                <TouchableOpacity onPress={() => this.buyNow()}>
                    <View style={{
                        height: hp(5), width: wp(35), marginRight: wp(5),
                        backgroundColor: AppColors.primaryColor,
                        borderWidth: 2, justifyContent: 'center', borderRadius: hp(.8), alignItems: 'center', 
                        //borderColor: AppColors.primaryColor
                    }}>
                        <Text allowFontScaling={false} style={{
                            fontFamily: AppStyles.fontFamilyRegular, color: AppColors.whiteColor,
                            marginTop: (AppUtils.isIphone) ? hp(.5) : 0,
                            fontSize: hp(1.8)
                        }}>{strings('equip.buyNow')}</Text>
                    </View>
                </TouchableOpacity>
            </View>


        );
    }

    buyNow() {
        let productList = [];
        this.state.productList.map((product, index) => {
            productList.push(product.medicalProductId);
            productList[index].sellerId = product.sellerId;
            productList[index].userQuantity = product.productQuantity;
        });
        Actions.OrderSummary({ productList: productList })


    }
    async placeOrder() {
        let productList = this.state.productList;
        let productServerDataList = [];
        AppUtils.console("sdzxcszdsx", this.state.addressList, this.state.addressList.length);
        if (this.state.addressList.length > 0) {
            productList.map((product, i) => {
                var productData = {
                    sellerId: product.sellerId._id,
                    medicalProductId: product._id,
                    productQuantity: product.userQuantity,
                    amount: product.sellingPrice,
                    offerId: product.OfferId,
                    TaxId: product.taxId,
                    totalAmount: this.state.total,
                    addressId: this.state.selectedAddress._id,
                    couponCode: product.couponCode
                };
                productServerDataList[i] = productData
            });

            try {
                let response = await SHApiConnector.placeOrder({ productList: productServerDataList });
                AppUtils.console("zfczdcsdxc", response, productServerDataList)
                if (response.data.status) {
                    Actions.SelectPayment({ paymentDetails: response.data.response, currencySymbol: this.state.productList[0].currencySymbol })
                }
            } catch (e) {
                AppUtils.console("Place Order", e)
            }
        } else {
            Toast.show(strings('string.alert.alert_address'))
        }
    }
    openDialScreen(number) {
        if (Platform.OS === 'ios') {
            number = 'telprompt:${' + number + '}';
        } else {
            number = 'tel:${' + number + '}';
        }
        Linking.openURL(number);
    };

}

const styles = StyleSheet.create({
    textViewStyle: {
        alignSelf: 'center', height: hp(6), flexDirection: 'row',
        width: wp(90), borderBottomWidth: 1, 
        //borderColor: AppColors.backgroundGray
    },

    textTitleStyle: {
        flex: 1,
        fontSize: hp(2), marginTop: (AppUtils.isIphone) ? hp(.5) : 0,
        alignSelf: 'center',
        paddingLeft: wp(5), fontFamily: AppStyles.fontFamilyRegular,
    },

    textDataStyle: {
        flex: 1,
        fontSize: hp(2), marginTop: (AppUtils.isIphone) ? hp(.5) : 0,
        marginLeft: wp(25),
        alignSelf: 'center',
        fontFamily: AppStyles.fontFamilyRegular,
    },
    headerStyle: {
        height: (AppUtils.headerHeight),
        width: AppUtils.screenWidth,
        backgroundColor: AppColors.whiteColor,
        alignItems: 'center', justifyContent: 'flex-start', alignSelf: 'center',
        flexDirection: 'row'
    },
    headerText: {
        color: AppColors.blackColor,
        marginLeft: moderateScale(120),
        marginTop: (Platform.OS === 'ios' ? 16 : (verticalScale(5))),
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: moderateScale(15)
    },
    headerTextIOS: {
        color: AppColors.blackColor,
        alignItems: 'center', justifyContent: 'center', alignSelf: 'center',
        marginTop: AppUtils.isX ? (16 + 18) : (Platform.OS === 'ios' ? 16 : (verticalScale(5))),
        fontFamily: AppStyles.fontFamilyMedium,
        fontSize: moderateScale(15)
    }
});

export default myOrderSummary;


