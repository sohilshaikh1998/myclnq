import React, { Component } from 'react';
import {
    View,
    Text,
    Image,
    Alert,
    BackHandler,
    Platform,
    TouchableOpacity,
    FlatList,
    ScrollView,
    I18nManager
} from 'react-native';
import StarRatingBar from '../../../utils/starRatingBar/StarRatingBar'
import AsyncStorage from '@react-native-community/async-storage';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';


import { Actions } from 'react-native-router-flux';
import CardView from 'react-native-cardview'
import { AppColors } from "../../../shared/AppColors";
import { AppStyles } from "../../../shared/AppStyles";
import medicalHomeScreenStyle from "./medicalHomeScreenStyle"
import searchProductStyle from "./../searchProduct/searchProductStyle"
import productDetailsStyle from "./../productDetails/productDetailsStyle"
import cartStyle from "./../medicalCart/cartStyle"

import { IndicatorViewPager, PagerDotIndicator } from 'react-native-best-viewpager';
import { SHApiConnector } from "../../../network/SHApiConnector";
import ProgressLoader from "rn-progress-loader";
import { AppUtils } from "../../../utils/AppUtils";
import { AppStrings } from '../../../shared/AppStrings';

import {
    CachedImage,
    ImageCacheProvider
} from '../../../cachedImage';
import Geolocation from '@react-native-community/geolocation';
import { strings } from '../../../locales/i18n';

const isRTL = I18nManager.isRTL;

export const getCurrentLocation = async () => {
    return new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(position => resolve(position), e => reject(e));
    });
};
class medicalHomeScreen extends Component {
    constructor(props) {
        super(props);
        AppUtils.analyticsTracker('Medical Equipment Home Screen');
        this.state = {
            categoryList: [],
            available_products: [],
            nearby_products: [],
            best_products: [],
            viewed_product: [],
            nearByShow: false,
            bestShow: false,
            viewedShow: false,
            isLoading: false,
            latestOrder: [],
            latestRated: [], sliderList: [],
            orderedShow: false,
            ratedShow: false
        }
    }

    componentDidMount() {
        this.apiCall();
        if (Platform.OS === 'android') {
            BackHandler.addEventListener('hardwareBackPress', () => {
                this.goBack();
                return true;
            })
        }
    }

    async apiCall() {
        await this.getDashboardData();
        await this.getNearBy();
        await this.getViewedData();
    }

    goBack() {

        Actions.MainScreen();

    }

    componentWillUnmount() {
        if (Platform.OS === 'android') {

            BackHandler.removeEventListener('hardwareBackPress', () => {
                Actions.MainScreen();
            });
        }
    }

    async getNearBy() {
 
        let data = {
            latitude: 1.4538337,
            longitude: 103.8195883,
        }
        try {
            let response = await SHApiConnector.getNearBy(data);
            if (response.data.status) {
         
                if (response.data.response.latestOrder) {
                    this.setState({
                        latestOrder: response.data.response.latestOrder, orderedShow: true
                    })
                }
                if (response.data.response.latestRatedProduct) {
                    this.setState({
                        latestRated: response.data.response.latestRatedProduct, ratedShow: true
                    })
                }
                if (response.data.response.productList) {
                    // this.setState({
                    //     nearby_products: response.data.response.productList,
                    //     nearByShow: (response.data.response.productList.length > 0) ? true : false
                    // })
                }
            } else {
                Alert.alert('', response.data.error_message);
            }
        } catch (e) {
            AppUtils.console("NearBYERROR", e);
        }
    }

    async getDashboardData() {
        try {
            this.setState({ isLoading: true })
            let data = {}
            let response = await SHApiConnector.getDashboardData(data);
            AppUtils.console("GetMedicalData", response);
            AppUtils.console("GetMedicalDataList", response.data.response.productList.length);

            if (response.data.status) {
                this.setState({
                    available_products: response.data.response.productList,
                    categoryList: response.data.response.categoryList,
                })
                Actions.refresh({ cartCount: response.data.response.cartCount })
                await AsyncStorage.setItem(AppStrings.label.cart_count, JSON.stringify({ cartCount: response.data.response.cartCount }));


            } else {
                this.setState({ isLoading: false })

                Alert.alert('', response.data.error_message);
            }
        } catch (e) {
            this.setState({ isLoading: false })
            AppUtils.console("ERROR", e);
        }
    }

    async getViewedData() {
        try {
            let response = await SHApiConnector.getViewedData();
            AppUtils.console("GetViewedData", response);
            if (response.data.status) {
                this.setState({
                    isLoading: false,
                    best_products: response.data.response.bestProduct,
                    bestShow: (response.data.response.bestProduct.length > 0) ? true : false,
                    viewed_products: response.data.response.viewedProduct,
                    viewedShow: (response.data.response.viewedProduct.length > 0) ? true : false,
                    sliderList: (response.data.response.bestProduct.length > 0) ? response.data.response.bestProduct :
                        (response.data.response.viewedProduct.length > 0) ? response.data.response.viewedProduct :
                            (this.state.nearby_products.length > 0) ? this.state.nearby_products :
                                (this.state.available_products.length > 0) ? this.state.available_products : []


                })
            } else {
                // Alert.alert('', response.data.error_message);
            }
        } catch (e) {
            this.setState({ isLoading: false })
            AppUtils.console("ERROR", e);
        }

    }

    _renderDotIndicator() {
        return <PagerDotIndicator pageCount={this.state.sliderList.length}
            dotStyle={[
                { backgroundColor: AppColors.primaryTransparent }, medicalHomeScreenStyle.swipeIndicatorCommonStyle
            ]}
            selectedDotStyle={[
                { backgroundColor: AppColors.primaryColor }, medicalHomeScreenStyle.swipeIndicatorCommonStyle
            ]}
        />;
    }

    pagerData(value) {
        return (
            <TouchableOpacity onPress={() => Actions.ProductDetails({ productDetails: value, isDashboard: true })}
                style={medicalHomeScreenStyle.pagerData}>
                <CachedImage
                    resizeMode={'contain'}
                    style={medicalHomeScreenStyle.pagerImage}
                    source={{ uri: value.productImages[0] }}
                />
            </TouchableOpacity>
        );
    }

    renderSwiper() {
        return (
            <View>
                <IndicatorViewPager
                    style={{ height: hp(40) }}
                    indicator={this._renderDotIndicator()}
                >
                    {this.state.sliderList.map(product => this.pagerData(product))}
                </IndicatorViewPager>
            </View>
        )
    }

    renderCategory(item) {
        AppUtils.console("item: ", item.item)
        return (
            <TouchableOpacity
                activeOpacity={.7}
                onPress={() => Actions.SearchProduct({
                    selectedCategoryIndex: item.index + 1,
                    selectedCategroyName: item.item.category
                })} style={medicalHomeScreenStyle.categoryIndividualAlignment}>

                <CachedImage
                    resizeMode={'contain'}
                    style={medicalHomeScreenStyle.CategoryImageStyle}
                    source={{ uri: item.item.logo }}
                />
                <Text style={medicalHomeScreenStyle.CategoryTxt}>
                    {item.item.category}
                    
                    </Text>
            </TouchableOpacity>
        );
    }

    renderBestSellerContent(item) {
        AppUtils.console("dxgfchjdfchg", item);

        return (
            <View
              style={{
                flex: 1,
                alignItems: item.index % 2 !== 0 ? 'flex-end' : null,
                marginLeft: item.index % 2 !== 0 ? wp(1) : wp(3),
                marginBottom: hp(3),
                marginRight: item.index % 2 !== 0 ? wp(3) : wp(1),

            }}>
                <TouchableOpacity
                    activeOpacity={.7}

                    onPress={() => Actions.ProductDetails({ productDetails: item.item, isDashboard: true })}>
                    <CardView cornerRadius={13} cardElevation={2} style={[searchProductStyle.productView]}>
                        <View>
                            <CachedImage
                                resizeMode={'contain'}
                                style={searchProductStyle.productViewImageStyle}
                                source={{ uri: item.item.productImages[0] }}
                            />
                        </View>
                        <View style={{ flex: 1, }}>
                            <View style={{ marginLeft: wp(3), marginRight: wp(1) }}>

                                <Text numberOfLines={1}
                                    style={searchProductStyle.title
                                    }>{item.item.productName}</Text>
                                <TouchableOpacity onPress={() => {
                                    Actions.SearchProduct({ seller: item.item.sellerId.companyName })
                                }}>
                                    <Text numberOfLines={1}
                                        style={productDetailsStyle.sellerName}>
                                        <Text style={{ color: AppColors.blackColor }}>{strings('equip.soldBy')}</Text>{item.item.sellerId.companyName}</Text>
                                </TouchableOpacity>

                                <View style={[searchProductStyle.priceView, { flexDirection: 'row' }]}>
                                    <Text numberOfLines={1}
                                        style={[searchProductStyle.priceTxt, { flex: 1 }]}>
                                        {!item.item.notForSale ? (item.item.currencySymbol + "" + item.item.sellingPrice) : strings('string.label.notForSale')}
                                    </Text>

                                </View>

                            </View>

                        </View>
                    </CardView>
                </TouchableOpacity>
            </View>
        )
    }

    renderBestSeller() {
        return (
            <View style={medicalHomeScreenStyle.bestSeller}>
                <Text style={medicalHomeScreenStyle.headingTxt}>{strings('equip.betSeller')}</Text>

                <View style={medicalHomeScreenStyle.bestSellerInnerView}>
                    <FlatList
                        data={this.state.available_products}
                        renderItem={(item) => (this.renderBestSellerContent(item))}
                        numColumns={2}
                        keyExtractor={(item, index) => index.toString()}
                    />
                </View>
                {this.state.available_products.length == 4 ?
                    <TouchableOpacity onPress={() => Actions.SearchProduct()} activeOpacity={0.9}
                        style={medicalHomeScreenStyle.viewAll}>
                        <Text style={medicalHomeScreenStyle.btnTxt}>{strings('equip.viewAll')}</Text>
                    </TouchableOpacity> : null}
            </View>
        )
    }

    renderNearBy() {
        return (
            <View style={medicalHomeScreenStyle.bestSeller}>
                <Text style={medicalHomeScreenStyle.headingTxt}>{strings('equip.nearByProduct')}</Text>

                <View style={medicalHomeScreenStyle.bestSellerInnerView}>
                    <FlatList
                        data={this.state.nearby_products}
                        renderItem={(item) => (this.renderBestSellerContent(item))}
                        numColumns={2}
                        keyExtractor={(item, index) => index.toString()}
                    />
                </View>
                {this.state.nearby_products.length == 4 ?

                    <TouchableOpacity onPress={() => Actions.SearchProduct()} activeOpacity={0.9}
                        style={medicalHomeScreenStyle.viewAll}>
                        <Text style={medicalHomeScreenStyle.btnTxt}>{strings('equip.viewAll')}</Text>
                    </TouchableOpacity> : null}
            </View>
        )
    }


    renderBest() {
        return (
            <View style={medicalHomeScreenStyle.bestSeller}>
                <Text style={medicalHomeScreenStyle.headingTxt}>{strings('equip.topSelling')}</Text>

                <View style={medicalHomeScreenStyle.bestSellerInnerView}>
                    <FlatList
                        data={this.state.best_products}
                        renderItem={(item) => (this.renderBestSellerContent(item))}
                        numColumns={2}
                        keyExtractor={(item, index) => index.toString()}
                    />
                </View>
                {this.state.best_products.length == 4 ?

                    <TouchableOpacity onPress={() => Actions.SearchProduct()} activeOpacity={0.9}
                        style={medicalHomeScreenStyle.viewAll}>
                        <Text style={medicalHomeScreenStyle.btnTxt}>{strings('equip.viewAll')}</Text>
                    </TouchableOpacity> : null}
            </View>
        )
    }

    renderView() {
        return (
            <View style={medicalHomeScreenStyle.bestSeller}>
                <Text style={medicalHomeScreenStyle.headingTxt}>{strings('equip.mostViewed')}</Text>

                <View style={medicalHomeScreenStyle.bestSellerInnerView}>
                    <FlatList
                        data={this.state.viewed_products}
                        renderItem={(item) => (this.renderBestSellerContent(item))}
                        numColumns={2}
                        keyExtractor={(item, index) => index.toString()}
                    />
                </View>
                {this.state.viewed_products.length == 4 ?

                    <TouchableOpacity onPress={() => Actions.SearchProduct()} activeOpacity={0.9}
                        style={medicalHomeScreenStyle.viewAll}>
                        <Text style={medicalHomeScreenStyle.btnTxt}>{strings('equip.viewAll')}</Text>
                    </TouchableOpacity> : null}
            </View>
        )
    }

    renderReviewView(item) {
        AppUtils.console("NearByitem", item.product);


        return (
            <CardView cornerRadius={12} cardElevation={2} style={[medicalHomeScreenStyle.review]}>
                <View style={medicalHomeScreenStyle.ratingView}>
                    <Text style={medicalHomeScreenStyle.headingTxt}>{strings('equip.lastRated')}</Text>
                    <Text style={medicalHomeScreenStyle.smallTxt}>{strings('wquip.howYouLike')}</Text>

                    <View style={{ flexDirection: 'row', flex: 1, }}>
                        <CachedImage
                            resizeMode={'contain'}
                            style={medicalHomeScreenStyle.imageView}
                            source={{ uri: (item.product.productImages[0]) ? item.product.productImages[0] : 'https://smarthelpbucket.s3.us-east-2.amazonaws.com/staging_storage/medical/category/wellness.png' }}
                        />
                        <View style={medicalHomeScreenStyle.starView}>
                            <Text style={medicalHomeScreenStyle.headingTxt2}>{item.product.productName}</Text>
                            <StarRatingBar
                                starStyle={{
                                    width: hp('2.5'),
                                    height: hp('2.5'),
                                }}
                                scrollEnabled={false}
                                readOnly={true}
                                continuous={true}
                                score={item.rating}
                                allowsHalfStars={false}
                                accurateHalfStars={true}
                            />
                        </View>
                    </View>

                </View>
            </CardView>
        )

    }

    renderTracking(item) {
        AppUtils.console("renderTracking", item.orderStatus.length)


        return (
            <CardView cornerRadius={12} cardElevation={2}
                style={[medicalHomeScreenStyle.review, { height: hp(20), marginTop: hp(4) }]}>
                <View style={{ height: hp(23 - 6), width: wp(84), }}>
                    <View style={medicalHomeScreenStyle.ratingTrackView}>

                        <Text style={medicalHomeScreenStyle.headingTxt}>{strings('equip.orderStatus')} ({item.orderId})</Text>


                    </View>
                    {item.trackUrl ?
                        <View>
                            <View style={medicalHomeScreenStyle.urlView}>
                                {/* <Text style={medicalHomeScreenStyle.smallTxt2}>Img</Text> */}
                                <Text style={medicalHomeScreenStyle.smallTxt2}>{strings('equip.trackDetails')}</Text>

                                <TouchableOpacity onPress={() => {
                                    Actions.TrackView({ url: item.trackUrl ? item.trackUrl : 'https://www.google.com/' })
                                }}>
                                    <Text
                                        style={[medicalHomeScreenStyle.smallTxt2, {
                                            color: AppColors.blueColor, textDecorationLine: 'underline',
                                            fontFamily: AppStyles.fontFamilyRegular, marginLeft: hp(1)
                                        }]}>{item.trackingNumber}</Text></TouchableOpacity>
                            </View>
                        </View> : null}

                    <Text style={medicalHomeScreenStyle.smallTxt2}>{strings('equip.yourOrderIs')} {item.orderStatus[item.orderStatus.length - 1].status}</Text>
                    <View style={medicalHomeScreenStyle.trackProduct}>
                        <CachedImage
                            style={medicalHomeScreenStyle.imageView}
                            source={{ uri: (item.product.productImages[0]) ? item.product.productImages[0] : 'https://smarthelpbucket.s3.us-east-2.amazonaws.com/staging_storage/medical/category/wellness.png' }}
                        />
                        <View style={medicalHomeScreenStyle.ratedNameView}>
                            <Text style={medicalHomeScreenStyle.headingTxt2}>{item.product.productName}</Text>
                            {this.shipView(item.orderStatus[item.orderStatus.length - 1].status)}
                        </View>
                    </View>

                </View>
            </CardView>
        )
    }

    shipView(item) {

        return (
            <View style={medicalHomeScreenStyle.shipView}>

                <View style={medicalHomeScreenStyle.redDot} />
                <View style={medicalHomeScreenStyle.redLine} />
                <View style={item == 'CONFIRMED' ? medicalHomeScreenStyle.greyDot : medicalHomeScreenStyle.redDot} />
                <View style={item == 'CONFIRMED' ? medicalHomeScreenStyle.greyLine : medicalHomeScreenStyle.redLine} />
                <View
                    style={(item == 'CONFIRMED' || item == 'PROCESSING' || item == 'PROCESSED') ? medicalHomeScreenStyle.greyDot : medicalHomeScreenStyle.redDot} />
                <View
                    style={item == 'CONFIRMED' || item == 'PROCESSING' || item == 'PROCESSED' ? medicalHomeScreenStyle.greyLine : medicalHomeScreenStyle.redLine} />
                <View
                    style={(item == 'CONFIRMED' || item == 'PROCESSING' || item == 'PROCESSED' || item == 'PACKED') ? medicalHomeScreenStyle.greyDot : medicalHomeScreenStyle.redDot} />
                <View
                    style={item == 'CONFIRMED' || item == 'PROCESSING' || item == 'PROCESSED' || item == 'PACKED' ? medicalHomeScreenStyle.greyLine : medicalHomeScreenStyle.redLine} />

                <View style={item == 'DELIVERED' ? medicalHomeScreenStyle.redDot : medicalHomeScreenStyle.greyDot} />

            </View>
        )
    }


    render() {
        return (
            <View style={{ flex: 1, backgroundColor: AppColors.whiteShadeColor }}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    {this.state.isLoading ? null : (this.state.categoryList.length > 0) ?
                        <View>
                            {/* {this.renderSwiper()} */}
                            {/* <CardView cornerRadius={12} cardElevation={2} style={medicalHomeScreenStyle.categoryView}> */}
                            <View style={{
                                width: wp(100),
                                alignSelf: 'center',
                                shadowRadius: 2,
                                shadowOffset: {
                                    width: 0,
                                    height: 1,
                                },
                                shadowOpacity: .1,
                                shadowColor: '#000000',
                                elevation: 0,
                                borderRadius: hp(.5),
                                marginBottom: hp(1), paddingTop: hp(2), backgroundColor: AppColors.whiteColor
                            }}>

                                <Text style={{
                                    marginTop: hp(2),
                                    fontFamily: AppStyles.fontFamilyMedium,
                                    fontSize: 16,
                                    color: AppColors.blackColor, marginLeft: hp(3),
                                    textAlign: isRTL ? 'left' : 'auto',
                                }}>{strings('equip.categories')}</Text>

                                <View style={{
                                    width: wp(100),
                                    justifyContent: 'center',
                                    alignSelf: 'center',
                                    alignItems: 'center',
                                    marginLeft: hp(1),
                                    marginTop: hp(2), marginBottom: hp(2)
                                }}>
                                    <FlatList
                                        data={this.state.categoryList}
                                        showsHorizontalScrollIndicator={false}
                                        renderItem={(item) => (this.renderCategory(item))}
                                        horizontal={false}
                                        numColumns={4}
                                        keyExtractor={(item, index) => index.toString()}
                                    />
                                </View>
                            </View>
                            {/* </CardView> */}
                            {this.state.bestShow ? this.renderBest() : null}
                            {this.state.viewedShow ? this.renderView() : null}
                            {/* {this.state.nearby_products.length > 0 ? this.renderNearBy() : null} */}
                            {this.state.available_products.length > 0 ? this.renderBestSeller() : null}
                            {this.state.ratedShow ? this.renderReviewView(this.state.latestRated) : null}
                            {this.state.orderedShow ? this.renderTracking(this.state.latestOrder) : null}
                            <View style={{ height: hp(8) }} />
                        </View> : <View style={{ height: hp(80), justifyContent: 'center' }}>
                            <Text style={cartStyle.emptyText}>{strings('equip.productNotAvail')}</Text>
                        </View>
                    }
                    <ProgressLoader
                        visible={this.state.isLoading}
                        isModal={true} isHUD={true}
                        hudColor={"#FFFFFF"}
                        color={AppColors.primaryColor} />
                </ScrollView>

            </View>
        );
    }


}

export default medicalHomeScreen;






