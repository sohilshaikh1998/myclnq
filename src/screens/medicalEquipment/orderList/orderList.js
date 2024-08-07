import React, { Component } from "react";
import {
    Alert,
    BackHandler,
    Dimensions,
    FlatList,
    Image,
    Platform,
    RefreshControl,
    Text,
    TouchableHighlight,
    TouchableOpacity,
    View, Linking, StyleSheet,AppState
} from "react-native";
import CardView from "react-native-cardview";
import AsyncStorage from '@react-native-community/async-storage';
import caregiverBookingRequestStyle from "../../caregiver/caregiverBookingRequest/caregiverBookingRequestStyle";
import { AppColors } from "../../../shared/AppColors";
import { AppStrings } from "../../../shared/AppStrings";
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import images from "../../../utils/images";
import { moderateScale, verticalScale } from "../../../utils/Scaling";

import {
    CachedImage,
    ImageCacheProvider
} from '../../../cachedImage';
import { SHApiConnector } from "../../../network/SHApiConnector";
import ProgressLoader from "rn-progress-loader";
import { Actions } from "react-native-router-flux";
import moment from "moment";
import ElevatedView from "react-native-elevated-view";
import { AppStyles } from "../../../shared/AppStyles";
import { AppUtils } from "../../../utils/AppUtils";
import orderListStyle from "./orderListStyle";
import { strings } from "../../../locales/i18n";
const { width, height } = Dimensions.get('window');
var productLenght;

class orderList extends Component {
    constructor(props) {
        super(props);
        AppUtils.analyticsTracker("Caregiver Booking Request Screen");
        let startDate = moment(AppUtils.currentDateTime()).add(2, 'hours');
        let endDate = moment(AppUtils.currentDateTime()).add(3, 'hours');
        let roundStartMin = 30 - (startDate.minute() % 30);
        let roundEndMin = 30 - (endDate.minute() % 30);
        this.onRefreshPast = this.onRefreshPast.bind(this);
        this.onRefreshUpcoming = this.onRefreshUpcoming.bind(this);
        this.onRefreshRequest = this.onRefreshRequest.bind(this);

        this.state = {
            isLoading: false,
            showCalender: false,
            requestPage: 1,
            pastRequestPage: 1,
            upcomingRequestPage: 1,
            isPastFooterLoading: false,
            isUpcomingFooterLoading: false,
            isRequestFooterLoading: false,
            isUpcoming: true,
            isRequest: false,
            isPast: false,
            select_StartDate: false,
            select_StartTime: false,
            isDate: true,
            orderDetailModal: false,
            orderExtendModal: false,
            extendData: '',
            isRefreshing: false,
            isReqInvoice: false,
            invoiceMail: '',
            sDate: true,
            eDate: true,
            selectStartDate: true,
            selectEndDate: false,
            selectStartTime: false,
            selectEndTime: false,
            selectedStartDate: moment(startDate).add(roundEndMin, "minutes"),
            selectedEndDate: moment(endDate).add(roundEndMin, "minutes"),
            selectedStartTime: moment(startDate).add(roundStartMin, "minutes"),
            selectedEndTime: moment(endDate).add(roundEndMin, "minutes"),
            isSelectedStartDate: true,
            serviceDays: 0,
            serviceHours: 0,
            sTime: true,
            eTime: true,
            isSelectedStartTime: true,

            upcomingRequest: [],
            pastRequest: [],
            request: [],
            upcomingDetail: {
                isUpcoming: true,
                location: "",
                lookingFor: {
                    service: "",
                    subservice: "",
                },
                Date: {
                    startDate: "",
                    startTime: "",
                    endDate: "",
                    endTime: "",
                },
                nurse: {
                    name: "",
                    providerName: "",
                    gender: "",
                    age: "",
                    lang: [],
                },
                Patient: {
                    name: "",
                    age: "",
                    condition: "",
                },
                orderId: "",
                jobStatus: "",

                isPanExpanded: false,
                selected: 0,
                isMale: true,
                isExperienced: true,


            },
            appState: AppState.currentState

        };
    }
    componentWillUnmount() {
        AppState.removeEventListener('change', this._handleAppStateChange);
    }

    _handleAppStateChange = (nextAppState) => {
        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
            if (this.state.isRequest) {
                this.onRefreshRequest();
    
            } else if(this.state.isUpcoming) {
                this.onRefreshUpcoming();
            }else{
                 this.onRefreshPast();
                 }  
        }
        this.setState({appState: nextAppState});
    }



    async componentDidMount() {
        AppUtils.console("caregiver", this.props)
        this.setState({ isLoading: true });
        AppState.addEventListener('change', this._handleAppStateChange);

        const value = await AsyncStorage.getItem(AppStrings.key.request);
        AppUtils.console("RequestKey", value);
        if (value == "Request") {
            this.setState({ isRequest: true, isUpcoming: false });
            this.getRequest();
            await AsyncStorage.setItem(AppStrings.key.request, JSON.stringify(false));

        } else {
            this.setState({ isRequest: false, isUpcoming: true });
            this.getUpcomingRequest();
        }
        AsyncStorage.getAllKeys((err, keys) => {
            AsyncStorage.multiGet(keys, (error, stores) => {
                stores.map((result, i, store) => {
                    AppUtils.console({ [store[i][0]]: store[i][1] });
                    return true;
                });
            });
        });


        const userDetails = JSON.parse(await AsyncStorage.getItem(AppStrings.contracts.LOGGED_IN_USER_DETAILS));
        AppUtils.console("userDetails1", userDetails);
        if (userDetails.email) {
            this.setState({ invoiceMail: userDetails.email, savedEmail: userDetails.email })
        }
        1
        BackHandler.addEventListener("hardwareBackPress", () => {
            this.goBack();
            return true;
        });
    }

    goBack() {
        Actions.pop()
    }

    openDialScreen(number) {
        if (Platform.OS === 'ios') {
            number = 'telprompt:${' + number + '}';
        } else {
            number = 'tel:${' + number + '}';
        }
        Linking.openURL(number);
    };

    onRefreshPast() {
        var self = this;
        self.setState({ isRefreshing: true, isLoading: true, pastRequestPage: 1, pastRequest: [] }, () => self.getPastRequest())
    }

    onRefreshUpcoming() {
        var self = this;
        self.setState({
            isRefreshing: true, isLoading: true,
            upcomingRequestPage: 1,
            upcomingRequest: []
        }, () => self.getUpcomingRequest())
    }

    onRefreshRequest() {
        var self = this;
        self.setState({ isRefreshing: true, isLoading: true, requestPage: 1, request: [] }, () => self.getRequest())
    }

    async getPastRequest() {
        let data = {
            filterBy: "PAST_ORDER"
        }


        try {
            let response = await SHApiConnector.getMyOrder({ page: this.state.pastRequestPage, filterBy: data });
            AppUtils.console("getPast", response);
            this.setState({ isLoading: false });

            if (response.data.status) {
                // this.setState({isLoading: false, isRefreshing: false});

                if (response.data.response.length > 0) {
                    if (response.data.response.length < 10) {
                        this.setState({ isPastFooterLoading: false })
                    } else {
                        this.setState({ isPastFooterLoading: true })
                    }
                    if (this.state.pastRequestPage == 1) {
                        this.setState({
                            pastRequest: response.data.response,
                            isRefreshing: false,
                            pastRequestPage: this.state.pastRequestPage + 1
                        });

                    } else {

                        this.setState({
                            pastRequest: [...this.state.pastRequest, ...response.data.response],
                            isRefreshing: false,
                            pastRequestPage: this.state.pastRequestPage + 1
                        });

                    }
                }

                AppUtils.console(">>>>> RES History ", response, "currentList", this.state.pastRequest.length);
            } else {
                //   this.setState({isLoading: false, isRefreshing: false});

                this.showAlert(response.data.error_message);

            }

        } catch (e) {
            this.setState({ isLoading: false });

            this.showAlert(e.response.data.error_message);
            //   this.setState({isLoading: false, isRefreshing: false});
        }
    }

    async getUpcomingRequest() {

        let data = {
            filterBy: "NEW_ORDER"
        }

        try {
            let response = await SHApiConnector.getMyOrder({ page: this.state.upcomingRequestPage, filterBy: data });
            this.setState({ isLoading: false });
            AppUtils.console("getUpcoming", response)
            if (response.data.status) {
                if (response.data.response.length > 0) {
                    if (response.data.response.length < 10) {
                        this.setState({ isUpcomingFooterLoading: false })
                    } else {
                        this.setState({ isUpcomingFooterLoading: true })
                    }
                    if (this.state.upcomingRequestPage == 1) {
                        this.setState({
                            upcomingRequest: response.data.response,
                            isRefreshing: false,
                            upcomingRequestPage: this.state.upcomingRequestPage + 1
                        });

                    } else {

                        this.setState({
                            upcomingRequest: [...this.state.upcomingRequest, ...response.data.response],
                            isRefreshing: false,
                            upcomingRequestPage: this.state.upcomingRequestPage + 1
                        });

                    }

                    AppUtils.console(">>>>> RES Upcoming ", response, "currentList", this.state.upcomingRequest.length);
                }
            } else {
                this.showAlert(response.data.error_message);
            }
        } catch (e) {
            this.setState({ isLoading: false, isRefreshing: false });
            this.showAlert(e.response.data.error_message);
        }
    }


    async getRequest() {
        let data = {
            filterBy: "PAYMENT_PENDING"
        }

        try {
            let response = await SHApiConnector.getMyOrder({ page: this.state.requestPage, filterBy: data });
            AppUtils.console("getRequest", response)
            this.setState({ isLoading: false });
            if (response.data.status) {


                if (response.data.response.length > 0) {
                    if (response.data.response.length < 10) {
                        this.setState({ isRequestFooterLoading: false })
                    } else {
                        this.setState({ isRequestFooterLoading: true })
                    }
                    if (this.state.requestPage == 1) {
                        this.setState({
                            request: response.data.response,
                            isRefreshing: false,
                            requestPage: this.state.requestPage + 1
                        });

                    } else {

                        this.setState({
                            request: [...this.state.request, ...response.data.response],
                            isRefreshing: false,
                            requestPage: this.state.requestPage + 1
                        });

                    }

                    AppUtils.console(">>>>> RES Request ", response, "currentList", this.state.request.length);
                }
            } else {
                this.showAlert(response.data.error_message);
            }
        } catch (e) {
            this.setState({ isLoading: false, isRefreshing: false });
            this.showAlert(e.response.data.error_message);
        }
    }


    header() {
        return (
            <ElevatedView elevation={0} style={caregiverBookingRequestStyle.header}>


                <View style={caregiverBookingRequestStyle.topTabView}>
                    <TouchableOpacity
                        onPress={() =>
                            this.setState({ isUpcoming: true, isPast: false, isRequest: false, isLoading: true, upcomingRequestPage: 1 }, () =>
                                this.getUpcomingRequest()
                            )
                        }
                        activeOpacity={this.state.isUpcoming ? 1 : 0.8}
                        style={[
                            caregiverBookingRequestStyle.requestTab,
                            caregiverBookingRequestStyle.tab,
                            {
                                backgroundColor: this.state.isUpcoming
                                    ? AppColors.primaryColor
                                    : AppColors.whiteColor,
                                borderColor: AppColors.greyBorder,
                                borderWidth: !this.state.isUpcoming ? 1 : 0.8,
                            },
                        ]}

                    >
                        <Text
                            allowFontScaling={false}
                            style={[
                                caregiverBookingRequestStyle.tabTxt,
                                {
                                    color: this.state.isUpcoming
                                        ? AppColors.whiteColor
                                        : AppColors.blackColor,
                                },
                            ]}
                        >
                            {strings('string.label.new')}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => this.setState({ isRequest: true, isUpcoming: false, isPast: false, isLoading: true, requestPage: 1 }, () =>
                            this.getRequest()
                        )
                        }
                        style={[
                            caregiverBookingRequestStyle.upcomingTab,
                            caregiverBookingRequestStyle.tab,
                            {
                                backgroundColor: this.state.isRequest
                                    ? AppColors.primaryColor
                                    : AppColors.whiteColor,
                                borderColor: AppColors.greyBorder,
                                borderWidth: !this.state.isRequest ? 1 : 0,
                            },
                        ]}
                        underlayColor={AppColors.primaryColor}>
                        <Text style={[
                            caregiverBookingRequestStyle.tabTxt,
                            {
                                color: this.state.isRequest
                                    ? AppColors.whiteColor
                                    : AppColors.blackColor,
                            },
                        ]}>
                            {strings('string.label.pending')}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() =>
                            this.setState({
                                isPast: true,
                                isUpcoming: false,
                                isRequest: false, isLoading: true, pastRequestPage: 1
                            }, () => this.getPastRequest())
                        }
                        activeOpacity={this.state.isPast ? 1 : 0.8}
                        style={[
                            caregiverBookingRequestStyle.pastTab,
                            caregiverBookingRequestStyle.tab,
                            {
                                backgroundColor: this.state.isPast
                                    ? AppColors.primaryColor
                                    : AppColors.whiteColor,
                                borderColor: AppColors.greyBorder,
                                borderWidth: !this.state.isPast ? 1 : 0,
                            },
                        ]}
                    >
                        <Text
                            allowFontScaling={false}
                            style={[
                                caregiverBookingRequestStyle.tabTxt,
                                {
                                    color: this.state.isPast
                                        ? AppColors.whiteColor
                                        : AppColors.blackColor,
                                },
                            ]}
                        >
                            {strings('string.label.history')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ElevatedView>
        );
    }


    upcomingCard(item) {
        AppUtils.console("item>>>>> ", item.item);
        let status = AppUtils.getOrderStatus(item.item.orderStatus);
        productLenght = item.item.productList.length;
        return (
            <CardView cardElevation={2} cornerRadius={5}
                style={orderListStyle.cardView}>
                <TouchableOpacity onPress={() => Actions.MyOrderSummary({ orderId: item.item.orderId })}
                    style={orderListStyle.cardSubView}>
                    <View style={orderListStyle.orderIdView}>
                        <Text style={orderListStyle.orderIdText
                        }>{item.item.orderId}</Text>

                    </View>
                    <View style={orderListStyle.orderDate}>
                        <Text style={orderListStyle.dateText
                        }>{moment(item.item.orderedOn).format('DD MMM YYYY, hh:mm A')}</Text>
                        <Text
                            numberOfLines={1}
                            style={orderListStyle.orderTotal}>{strings('common.caregiver.total')} {item.item.currencySymbol + '' + item.item.orderTotalAmount} </Text>

                    </View>
                    <FlatList
                        data={item.item.productList}
                        extraData={this.state}
                        renderItem={(item) => this.listItem(item)}
                        keyExtractor={(item, index) => index.toString()}

                    />


                </TouchableOpacity>
            </CardView>
        );
    }
    listItem(data) {
        let item = data.item.medicalProductId;
        AppUtils.console("statussend", data.item.orderStatus);

        let status = AppUtils.getOrderStatus(data.item.orderStatus);
        AppUtils.console("Status", status);

        AppUtils.console("ProductList", data, " Productlength ", productLenght);

        AppUtils.console("ProductListL", item);
        return (
            <View style={{ flexDirection: 'row', marginTop: hp(1), marginBottom: hp(1), borderBottomWidth: data.index == productLenght - 1 ? 0 : 1, borderColor: AppColors.backgroundGray, }}>
                <CachedImage
                    resizeMode={'contain'}
                    style={orderListStyle.productImage}
                    source={{ uri: (item.productImages[0]) ? item.productImages[0] : 'https://smarthelpbucket.s3.us-east-2.amazonaws.com/staging_storage/medical/category/wellness.png' }}
                />
                <View style={{ flexDirection: 'column', }}>
                    <View style={{ flexDirection: 'row', }}>
                        <View style={{ marginRight: AppUtils.isX ? hp(1) : 0 }}>
                            <View style={{ flexDirection: 'row' }}>
                                <Text numberOfLines={1}
                                    style={orderListStyle.productName}>{item.productName}</Text>
                                <Text style={orderListStyle.orderStatus}>{status.orderStatus}</Text>

                            </View>
                            <View style={{ flexDirection: 'row' }}>
                                <Text numberOfLines={1}
                                    style={orderListStyle.brand
                                    }><Text style={{ color: AppColors.textGray }}>Brand:</Text> {item.brand}</Text>

                                <Text style={orderListStyle.productAmount}> {data.item.currencySymbol}{data.item.totalProductAmount}</Text>

                            </View>
                            <TouchableOpacity onPress={() => {
                                Actions.SearchProduct({ seller: data.item.sellerId.companyName })
                            }}>
                                <Text numberOfLines={1}
                                    style={orderListStyle.seller}>
                                    <Text style={{ color: AppColors.textGray }}>{strings('equip.soldBy')}</Text>{data.item.sellerId.companyName}</Text>
                            </TouchableOpacity>

                        </View>
                    </View>

                </View>

            </View>
        )
    }


    requestCard(item) {
        AppUtils.console("item>>>>> ", item.item);
        let status = AppUtils.getOrderStatus(item.item.orderStatus);
        productLenght = item.item.productList.length;


        return (

            <CardView cardElevation={2} cornerRadius={5}
                style={orderListStyle.cardView}>
                <TouchableOpacity onPress={() => Actions.MyOrderSummary({ orderId: item.item.orderId })}
                    style={orderListStyle.cardSubView}>
                    {item.item.orderStatus == "PAYMENT_PENDING" ? null :

                        <View style={orderListStyle.orderIdView}>
                            <Text style={orderListStyle.orderIdText
                            }>{item.item.orderId}</Text>
                        </View>}

                    <View style={orderListStyle.orderDate}>
                        <Text style={orderListStyle.dateText
                        }>{moment(item.item.orderedOn).format('DD MMM YYYY, hh:mm A')}</Text>
                        <Text
                            numberOfLines={1}
                            style={orderListStyle.orderTotal}>{strings('common.caregiver.total')} {item.item.currencySymbol + '' + item.item.orderTotalAmount} </Text>


                    </View>
                    <FlatList

                        data={item.item.productList}
                        extraData={this.state}
                        renderItem={(item) => this.listItem(item)}
                        keyExtractor={(item, index) => index.toString()}

                    />


                </TouchableOpacity>
            </CardView>
        )
    }


    pastCard(item) {
        AppUtils.console("item>>>>> ", item.item);
        let status = AppUtils.getOrderStatus(item.item.orderStatus);
        productLenght = item.item.productList.length;

        return (
            <CardView cardElevation={2} cornerRadius={5}
                style={orderListStyle.cardView}>
                <TouchableOpacity onPress={() => Actions.MyOrderSummary({ orderId: item.item.orderId })}
                    style={orderListStyle.cardSubView}>
                    <View style={orderListStyle.orderIdView}>
                        <Text style={orderListStyle.orderIdText
                        }>{item.item.orderId}</Text>

                    </View>

                    <View style={orderListStyle.orderDate}>
                        <Text style={orderListStyle.dateText
                        }>{moment(item.item.orderedOn).format('DD MMM YYYY, hh:mm A')}</Text>
                        <Text
                            numberOfLines={1}
                            style={orderListStyle.orderTotal}>{strings('common.caregiver.total')} {item.item.currencySymbol + '' + item.item.orderTotalAmount} </Text>

                    </View>
                    <FlatList

                        data={item.item.productList}
                        extraData={this.state}
                        renderItem={(item) => this.listItem(item)}
                        keyExtractor={(item, index) => index.toString()}

                    />


                </TouchableOpacity>
            </CardView>
        );
    }






    showAlert(msg, ispop) {
        setTimeout(() => {
            AppUtils.showMessage(this, "", msg, strings('doctor.button.ok'), function () {
            });
        }, 500)
    }


    page() {
        let pastRequest = this.state.pastRequest;
        let upcomingRequest = this.state.upcomingRequest;
        let request = this.state.request;

        return (
            <View style={caregiverBookingRequestStyle.pageContainer}>
                {this.state.isUpcoming ? (
                    upcomingRequest.length > 0 ? (
                        <FlatList
                            refreshControl={
                                <RefreshControl
                                    refreshing={this.state.isRefreshing}
                                    onRefresh={this.onRefreshUpcoming}
                                />
                            }
                            style={{
                                width: wp(100),
                                height: hp(100) - (verticalScale(30) + hp(19)),
                            }}
                            data={this.state.upcomingRequest}
                            extraData={this.state}
                            renderItem={(item) => this.upcomingCard(item)}
                            keyExtractor={(item, index) => index.toString()}
                            onEndReached={() => this.upcomingFooterLoading()}
                        />
                    ) : (
                            this.state.isLoading ?
                                null :
                                this.placeHolder("New Request")

                        )
                ) :
                    this.state.isPast ?
                        pastRequest.length > 0 ? (
                            <FlatList
                                refreshControl={
                                    <RefreshControl
                                        refreshing={this.state.isRefreshing}
                                        onRefresh={this.onRefreshPast}
                                    />
                                }
                                style={{
                                    width: wp(100),
                                    height: hp(100) - (verticalScale(30) + hp(19)),
                                }}
                                data={this.state.pastRequest}
                                extraData={this.state}
                                renderItem={(item) => this.pastCard(item)}
                                keyExtractor={(item, index) => index.toString()}
                                onEndReached={() => this.pastFooterLoading()}

                            />
                        ) : (
                                this.state.isLoading ?
                                    null :
                                    this.placeHolder("History")
                            )
                        :
                        request.length > 0 ? (
                            <FlatList
                                refreshControl={
                                    <RefreshControl
                                        refreshing={this.state.isRefreshing}
                                        onRefresh={this.onRefreshRequest}
                                    />
                                }
                                style={{
                                    width: wp(100),
                                    height: hp(100) - (verticalScale(30) + hp(19)),
                                }}
                                data={this.state.request}
                                extraData={this.state}
                                renderItem={(item) => this.requestCard(item)}
                                keyExtractor={(item, index) => index.toString()}
                                onEndReached={() => this.requestFooterLoading()}

                            />
                        ) : (
                                this.state.isLoading ?
                                    null :
                                    this.placeHolder("Pending Request")
                            )

                }

                {/*
                        this.state.isUpcoming ?
                            upcomingRequest.length > 0 ? this.upcomingCard() : this.placeHolder("Upcoming Request")
                            :
                            pastRequest.length > 0 ? this.pastCard() : this.placeHolder("Past Request")
                    */}
            </View>
        );
    }
    placeHolder(txt) {
        return (
            <View style={caregiverBookingRequestStyle.placeHolderView}>
                <Image
                    source={images.cancelIcon}
                    style={caregiverBookingRequestStyle.placeHolderImage}
                />
                <Text style={caregiverBookingRequestStyle.placeHolderTxt}>
                    {strings('doctor.button.no')} {txt}
                </Text>
            </View>
        );
    }

    upcomingFooterLoading() {
        (this.state.isUpcomingFooterLoading) ? this.getUpcomingRequest() : null
    }

    pastFooterLoading() {
        (this.state.isPastFooterLoading) ? this.getPastRequest() : null
    }

    requestFooterLoading() {
        (this.state.isRequestFooterLoading) ? this.getRequest() : null
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
                </View>
                <View style={{ width: cellWidth, height: hp('6'), marginTop: hp('1'), alignItems: 'center', justifyContent: 'center' }}>
                    <Text allowFontScaling={false} style={styles.headerTextIOS}>
                        {this.props.title}
                        
                    </Text>
                </View>

            </ElevatedView>

        )
    }


    navToHomescreen() {
        Actions.MainScreen()
    }

    renderAndroid() {
        AppUtils.console("sdfvdsedv", this.props)
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



            </ElevatedView>

        )
    }

    render() {
        return (
            <View style={caregiverBookingRequestStyle.container}>
                {(AppUtils.isIphone) ? this.renderIOS() : this.renderAndroid()}

                {this.header()}

                {this.page()}

                <ProgressLoader
                    visible={this.state.isLoading}
                    isModal={true}
                    isHUD={true}
                    hudColor={"#FFFFFF"}
                    color={AppColors.primaryColor}
                />
            </View>
        );
    }
}
const styles = StyleSheet.create({
    textViewStyle: {
        alignSelf: 'center', height: hp(6), flexDirection: 'row',
        width: wp(90), borderBottomWidth: 1, borderColor: AppColors.backgroundGray
    },

    textTitleStyle: {
        flex: 1,
        fontSize: hp(2), marginTop: (AppUtils.isIphone) ? hp(.5) : 0,
        alignSelf: 'center',
        paddingLeft: wp(5), fontFamily: AppStyles.fontFamilyRegular
    },

    textDataStyle: {
        flex: 1,
        fontSize: hp(2), marginTop: (AppUtils.isIphone) ? hp(.5) : 0,
        marginLeft: wp(25),
        alignSelf: 'center',
        fontFamily: AppStyles.fontFamilyRegular
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



export default orderList;
