import React, { Component } from 'react';
import { FlatList, Dimensions, Modal, Image, ScrollView, View, Text, TouchableOpacity, BackHandler, Linking, Button, Platform, I18nManager } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { AppColors } from '../../../shared/AppColors';
import CardView from 'react-native-cardview';
import medicalHomeScreenStyle from '../medicalEquipmentHome/medicalHomeScreenStyle';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import ProgressLoader from 'rn-progress-loader';
import { IndicatorViewPager, PagerDotIndicator } from 'react-native-best-viewpager';
import MarqueeText from 'react-native-marquee';
import { AppStyles } from '../../../shared/AppStyles';
import { AppUtils } from '../../../utils/AppUtils';
import HTMLView from 'react-native-htmlview';
import {StyleSheet} from 'react-native';
import { Actions } from 'react-native-router-flux';
import { SHApiConnector } from '../../../network/SHApiConnector';
import Toast from 'react-native-simple-toast';
import StarRatingBar from '../../../utils/starRatingBar/StarRatingBar';
import { moderateScale, verticalScale } from '../../../utils/Scaling';
import moment from 'moment';
import productDetailsStyle from './productDetailsStyle';
import caregiverBookingRequestStyle from './../../caregiver/caregiverBookingRequest/caregiverBookingRequestStyle';
import { AppStrings } from '../../../shared/AppStrings';
import images from './../../../utils/images';
import Video from 'react-native-video';
import VideoPlayer from 'react-native-video-player';
import ImageZoom from 'react-native-image-pan-zoom';
import { TouchableHighlight } from 'react-native-gesture-handler';
import { WebView } from 'react-native-webview';
import { strings } from '../../../locales/i18n';
import Share from 'react-native-share';
import { captureScreen } from 'react-native-view-shot';
const { width, height } = Dimensions.get('window');
const isRTL = I18nManager.isRTL;

class productDetails extends Component {
  constructor(props) {
    super(props);
    this.viewShotRef = React.createRef();
    AppUtils.analyticsTracker('Medical Equipment Product Details');
    this.state = {
      categoryList: [],
      fullViewModal: false,
      selectedImageIndex: 0,
      available_products: [],
      isLoading: false,
      reviewItems: [],
      avgRating: 0,
      totalRating: 0,
      cartCount: 0,
      isProductInWishList: 0,
      productDetails: [],
      productDetailsShow: false,
      fullImage: null,
    };
  }

  async componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', () => {
      this.onBackPress();
      return true;
    });

    this.getProductDetail();
    let cart = await AsyncStorage.getItem(AppStrings.label.cart_count);
    AppUtils.console('cartCount', cart);
    cart = JSON.parse(cart);
    if (cart.cartCount) {
      this.setState({ cartCount: cart.cartCount });

      Actions.refresh({ cartCount: cart.cartCount });
    }
  }
  onBackPress() {
    let self = this;
    try {
      if (self.state.fullViewModal) {
        self.setState({ fullImage: null, fullViewModal: null });
      } else {
        Actions.pop();
        setTimeout(() => {
          AppUtils.console('timeout', '----->', this.state.cartCount);
          Actions.refresh({ cartCount: this.state.cartCount });
        }, 1000);
      }
    } catch (e) {
      AppUtils.console('Error', e);
    }
  }

  customerReview(item) {
    AppUtils.console('CustomerReview-->', item);

    return (
      <View style={productDetailsStyle.reviewView}>
        <CardView cornerRadius={10} elevation={2} style={{ backgroundColor: AppColors.whiteColor, padding: hp(2), flex: 1, marginTop: hp(2) }}>
          <Text allowFontScaling={false} numberOfLines={1} style={[productDetailsStyle.reviewtitle,{textAlign: isRTL ? "left" : "auto"}]}>
            {strings('equip.customerReview')}
          </Text>
          <View style={productDetailsStyle.avgView}>
            <Text allowFontScaling={false} numberOfLines={1} style={productDetailsStyle.avgText}>
              {this.state.avgRating}
            </Text>
            <View style={{ bottom: hp('1'), left: wp('4') }}>
              <StarRatingBar
                starStyle={{
                  width: hp('2.5'),
                  height: hp('2.5'),
                }}
                scrollEnabled={false}
                readOnly={true}
                continuous={true}
                score={this.state.avgRating}
                allowsHalfStars={false}
                accurateHalfStars={true}
              />
              <Text allowFontScaling={false} numberOfLines={1} style={[productDetailsStyle.reviewText,{textAlign: isRTL ? "left" : "auto"}]}>
                {this.state.totalRating} {strings('equip.reviews')}
              </Text>
            </View>
          </View>

          <FlatList
            data={this.state.reviewItems}
            extraData={this.state}
            renderItem={(item) => this.reviewList(item)}
            keyExtractor={(item, index) => index.toString()}
          />
          {this.state.reviewItems.length > 1 ? (
            <TouchableOpacity
              onPress={() => Actions.ReviewList({ reviewItems: this.state.reviewItems, avg: this.state.avgRating, total: this.state.totalRating })}
              activeOpacity={0.9}
              style={productDetailsStyle.viewAll}
            >
              <Text allowFontScaling={false} style={productDetailsStyle.viewAllText}>
                {strings('equip.viewAll')}
              </Text>
            </TouchableOpacity>
          ) : null}
        </CardView>
      </View>
    );
  }
  reviewList(item) {
    AppUtils.console('REviewList-->>>', item.index);
    return item.index == 0 || item.index == 1 ? (
      <View style={{ borderBottomWidth: 0.5, borderBottomColor: AppColors.backgroundGray, marginTop: hp(2) }}>
        <View style={{ width: wp(34), flexDirection: 'row', alignItems: 'center' }}>
          <Image
            resizeMode={'cover'}
            style={productDetailsStyle.userImage}
            source={item.item.userProfilePic ? { uri: item.item.userProfilePic } : { uri: AppStrings.placeholderImg }}
          />
          <Text allowFontScaling={false} style={productDetailsStyle.name}>
            {item.item.userName}
          </Text>
        </View>

        <StarRatingBar
          starStyle={{
            width: hp('2'),
            height: hp('2'),
          }}
          scrollEnabled={false}
          readOnly={true}
          continuous={true}
          score={item.item.rate.rating}
          allowsHalfStars={false}
          accurateHalfStars={true}
        />
        <Text numberOfLines={3} allowFontScaling={false} style={productDetailsStyle.reviewDesc}>
          {item.item.rate.review}
        </Text>
        <View style={{ flexDirection: 'row', marginTop: hp('1') }}>
          <Text allowFontScaling={false} numberOfLines={1} style={productDetailsStyle.date}>
            {moment(item.item.rate.ratedOn).format('DD MMM YYYY, hh:mm A')}
          </Text>
        </View>
      </View>
    ) : null;
  }
  productDetailView() {
    let minMax;
    if (this.state.productDetails.deliveryDays)
      minMax =
        this.state.productDetails.deliveryDays.minDays == this.state.productDetails.deliveryDays.maxDays
          ? this.state.productDetails.deliveryDays.minDays
          : false;

    return (
      <View style={productDetailsStyle.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {this.renderSwiper()}
          <View>
            <CardView cornerRadius={5} elevation={2} style={{ backgroundColor: AppColors.whiteColor, padding: hp(2), flex: 1, marginTop: hp(2) }}>
              <Text allowFontScaling={false} style={productDetailsStyle.productName}>
                {this.state.productDetails.productName}
              </Text>
              <View style={{ flexDirection: 'row' }}>
                <Text allowFontScaling={false} numberOfLines={1} style={productDetailsStyle.soldBy}>
                  {strings('equip.soldBy')}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    Actions.SearchProduct({ seller: this.state.productDetails.sellerId.companyName });
                  }}
                >
                  <Text style={productDetailsStyle.sellerName}>{this.state.productDetails.sellerId.companyName}</Text>
                </TouchableOpacity>
              </View>
              {this.state.productDetails.description ? (
                <Text allowFontScaling={false} style={[productDetailsStyle.description,{textAlign: isRTL ? "left" : "auto"}]}>
                  {this.state.productDetails.description}
                </Text>
              ) : null}

              <View style={{ flexDirection: 'row', marginTop: hp(1.5) }}>
                <Text allowFontScaling={false} numberOfLines={1} style={productDetailsStyle.amount}>
                  {!this.state.productDetails.notForSale
                    ? this.state.productDetails.currencySymbol + '' + this.state.productDetails.sellingPrice
                    : strings('string.label.notForSale')}
                </Text>
                {!this.state.productDetails.notForSale ? (
                  <View style={productDetailsStyle.stockView}>
                    <Text allowFontScaling={false} numberOfLines={1} style={productDetailsStyle.stockText}>
                      {this.state.productDetails.productQuantity} Left
                    </Text>
                  </View>
                ) : null}
              </View>
              {this.state.productDetails.deliveryDays && !this.state.productDetails.notForSale ? (
                <Text style={[productDetailsStyle.delivery,{textAlign: isRTL ? "left" : "auto"}]}>
                  {strings('equip.deliverWithIn', {
                    minMax: minMax ? minMax : this.state.productDetails.deliveryDays.minDays + '-' + this.state.productDetails.deliveryDays.maxDays,
                  })}
                </Text>
              ) : null}
            </CardView>

            <View style={productDetailsStyle.specificationView}>
              <CardView cornerRadius={10} elevation={2} style={{ backgroundColor: AppColors.whiteColor, padding: hp(2), flex: 1 }}>
                <View style={{ flexDirection: 'row', marginBottom: hp(1), marginLeft: wp(1), marginTop: hp(1) }}>
                  <View style={{ flexDirection: 'column' }}>
                    <Text allowFontScaling={false} numberOfLines={1} style={[productDetailsStyle.productSpecification,{textAlign: isRTL ? "left" : "auto"}]}>
                      {strings('equip.sellerDetails')}
                    </Text>

                    <View
                      style={{
                        flexDirection: 'row',
                        paddingTop: hp(2),
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => {
                          Actions.SearchProduct({ seller: this.state.productDetails.sellerId.companyName });
                        }}
                      >
                        <Text
                          numberOfLines={1}
                          style={{
                            marginTop: hp(0.3),
                            color: AppColors.blueColor,
                            width: wp(70),
                            fontFamily: AppStyles.fontFamilyRegular,
                            fontSize: hp(2),
                            textAlign: isRTL ? "left" : "auto",
                          }}
                        >
                          <Text style={{ color: AppColors.blackColor }}>{strings('equip.sellerName')}: </Text>
                          {this.state.productDetails.sellerId.companyName}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    {this.state.productDetails.notForSale ? (
                      <Text
                        numberOfLines={2}
                        style={{
                          marginTop: hp(0.5),
                          color: AppColors.textGray,
                          lineHeight: hp(2),
                          fontFamily: AppStyles.fontFamilyRegular,
                          fontSize: hp(1.8),
                          width: wp(70),
                        }}
                      >
                        {strings('equip.contactSeller')}
                      </Text>
                    ) : null}

                    <View style={{ flexDirection: 'column', marginTop: hp(1.5) }}>
                      <View style={{ width: wp(50) }}>
                        <TouchableOpacity
                          onPress={() =>
                            Linking.openURL(
                              'mailto:' +
                                this.state.productDetails.sellerId.email +
                                '?subject=' +
                                '\nProduct Name : ' +
                                this.state.productDetails.productName
                            )
                          }
                          style={caregiverBookingRequestStyle.providerSubView}
                        >
                          <Image
                            resizeMode={'contain'}
                            style={[caregiverBookingRequestStyle.providerImage, { borderWidth: 0 }]}
                            source={images.dashboardMail}
                          />
                          <Text
                            numberOfLines={1}
                            style={[
                              caregiverBookingRequestStyle.modalListContentViewSubTxt,
                              {
                                fontSize: hp(1.8),
                                width: wp(70),
                                marginLeft: wp(1),
                                marginTop: Platform.OS === 'ios' ? hp(0.5) : hp(0),
                                textAlign: isRTL ? 'left' : 'auto',
                              },
                            ]}
                          >
                            {this.state.productDetails.sellerId.email}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity
                        onPress={() =>
                          this.openDialScreen(
                            '+' + this.state.productDetails.sellerId.countryCode + ' ' + this.state.productDetails.sellerId.phoneNumber
                          )
                        }
                        style={caregiverBookingRequestStyle.providerSubView}
                      >
                        <Image
                          resizeMode={'contain'}
                          style={[caregiverBookingRequestStyle.providerImage, { borderWidth: 0 }]}
                          source={images.dashboardCall}
                        />
                        <Text
                          numberOfLines={1}
                          style={[
                            caregiverBookingRequestStyle.modalListContentViewSubTxt,
                            {
                              fontSize: hp(1.8),
                              marginLeft: wp(1),
                              width: wp(70),
                              marginTop: Platform.OS === 'ios' ? hp(0.5) : hp(0),
                              textAlign: isRTL ? 'left' : 'auto',
                            },
                          ]}
                        >
                          {'+' + this.state.productDetails.sellerId.countryCode + ' ' + this.state.productDetails.sellerId.phoneNumber}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </CardView>
            </View>
            <View style={productDetailsStyle.specificationView}>
              <CardView cornerRadius={10} elevation={2} style={{ backgroundColor: AppColors.whiteColor, padding: hp(2), flex: 1 }}>
                <Text allowFontScaling={false} numberOfLines={1} style={[productDetailsStyle.productSpecification,{textAlign: isRTL ? "left" : "auto"}]}>
                  {strings('equip.productSpecification')}
                </Text>
                <HTMLView value={this.state.productDetails.specification} stylesheet={styles}></HTMLView>
              </CardView>
            </View>

            {this.state.reviewItems ? this.customerReview(this.state.reviewItems) : null}
          </View>

          <View style={{ height: hp(5) }} />
        </ScrollView>
        {!this.state.productDetails.notForSale ? this.footer() : null}
      </View>
    );
  }

  fullView() {
    let dt = AppUtils.currentDateTime;
    return (
      <Modal
        transparent={true}
        ref={(element) => (this.model = element)}
        visible={this.state.fullViewModal}
        onRequestClose={() => this.onBackPress()}
        animationType={this.props.animationType}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(52, 52, 52, 0.8)',
            height: height,
            width: width,
            alignSelf: 'center',
            alignItems: 'center',
          }}
        >
          <View style={{ flex: 1, width: width }}>
            {this.renderSwiper()}
            <TouchableOpacity
              style={{
                position: 'absolute',
                height: hp(4),
                width: hp(4),
                top: AppUtils.isIphone ? hp(4) : 0,
                alignSelf: 'flex-end',
                marginRight: hp(2),
                marginTop: hp(1),
              }}
              underlayColor="transparent"
              onPress={() => this.setState({ fullImage: null, fullViewModal: false })}
            >
              <Image
                source={require('./../../../../assets/images/cancel.png')}
                style={{
                  height: hp(4),
                  width: hp(4),
                  alignSelf: 'flex-end',
                }}
              ></Image>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  openDialScreen(number) {
    if (Platform.OS === 'ios') {
      number = 'telprompt:${' + number + '}';
    } else {
      number = 'tel:${' + number + '}';
    }
    Linking.openURL(number);
  }
  footer() {
    let wishListImage = this.state.isProductInWishList
      ? require('../../../../assets/images/filled_wishlist.png')
      : require('../../../../assets/images/wishlist.png');

    return (
      <View style={productDetailsStyle.footer}>
        <TouchableOpacity onPress={() => this.insertOrRemoveProductFromWishList()}>
          <Image resizeMode={'contain'} style={{ height: hp(5), width: wp(20) }} source={wishListImage} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => this.addToCart()}>
          <View style={productDetailsStyle.cartView}>
            <Text allowFontScaling={false} style={productDetailsStyle.cartText}>
              {strings('equip.addCart')}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => Actions.OrderSummary({ productList: [this.state.productDetails] })}>
          <View style={productDetailsStyle.buyView}>
            <Text allowFontScaling={false} style={productDetailsStyle.buyText}>
              {strings('equip.buyNow')}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  captureScreenshot = async () => {
    let productId = this.props.productDetails._id;
    const productLink = `https://myclnq.co/marketplace/#/products/:${productId}`

    captureScreen({
      format: 'jpg',
      quality: 0.8,
    })
      .then(
        //callback function to get the result URL of the screnshot
        (uri) => {
          let shareImage = {
            title: 'Share',
            message: `${productLink}`,
            url: uri,
          };
          Share.open(shareImage).then(() => navigation.goBack());
        }
      )
      .catch((error) => {
        console.log(error, 'error in screenshot');
      });
  };

  render() {
    return (
      <View style={productDetailsStyle.container}>
        {/* {this.state.fullImage ? this.imageView()
                    : null} */}

        {this.state.productDetailsShow ? this.productDetailView() : null}
        {this.state.fullViewModal ? this.fullView() : null}
        <ProgressLoader visible={this.state.isLoading} isModal={true} isHUD={true} hudColor={'#FFFFFF'} color={AppColors.primaryColor} />
      </View>
    );
  }

  async getProductDetail() {
    AppUtils.console('ProductDetail', this.props.productDetails);

    try {
      let id = this.props.productDetails._id;

      this.setState({ isLoading: true });
      let response = await SHApiConnector.getProductDetail(id);
      if (response.data.status) {
        AppUtils.console('ResponseProductDetail', response.data.response);
        if (response.data.response) {
          //  AppUtils.console("reviewResponse", response.data.response[0].avg.$numberDecimal);

          this.setState({
            isLoading: false,
            productDetails: response.data.response,
            productDetailsShow: true,
            isProductInWishList: response.data.response.wish,
          });
          this.reviewFetch();
          this.storeProduct();

          //     response.data.response.map((item1) => {
          //         AppUtils.console("Item avg :",item1.avg.$numberDecimal,"reviewItems",[item1.rate].length);
          //         this.setState({avgRating:item1.avg.$numberDecimal,totalRating:[item1.rate].length,reviewItems:[item1.rate]});
          //    })
        } else {
          this.setState({ isLoading: false });
        }
      } else {
        this.setState({ isLoading: false });
        Toast.show(response.data.error_message);
      }
    } catch (e) {
      this.setState({ isLoading: false });
      AppUtils.console('ADD_IN_WISHLIST_ERROR', e);
    }
  }

  async reviewFetch() {
    try {
      let id = this.props.productDetails._id;

      this.setState({ isLoading: true });
      let response = await SHApiConnector.getReview(id);
      if (response.data.status) {
        AppUtils.console('reviewResponse', response.data.response);
        if (response.data.response.length > 0) {
          AppUtils.console('reviewResponse', response.data.response[0].avg.$numberDecimal);

          this.setState({
            isLoading: false,
            reviewItems: response.data.response,
            avgRating: response.data.response[0].avg.$numberDecimal,
            totalRating: response.data.response.length,
          });
          //     response.data.response.map((item1) => {
          //         AppUtils.console("Item avg :",item1.avg.$numberDecimal,"reviewItems",[item1.rate].length);
          //         this.setState({avgRating:item1.avg.$numberDecimal,totalRating:[item1.rate].length,reviewItems:[item1.rate]});
          //    })
        } else {
          this.setState({ isLoading: false });
        }
      } else {
        this.setState({ isLoading: false });
        Toast.show(response.data.error_message);
      }
    } catch (e) {
      this.setState({ isLoading: false });
      AppUtils.console('ADD_IN_WISHLIST_ERROR', e);
    }
  }

  async storeProduct() {
    try {
      let data = {
        productId: this.state.productDetails._id,
        sellerId: this.state.productDetails.sellerId._id,
      };
      let response = await SHApiConnector.storeProduct(data);

      AppUtils.console('storeResponse', response);
    } catch (e) {
      AppUtils.console('Store', e);
    }
  }

  async addToCart() {
    try {
      let data = {
        productList: [
          {
            medicalProductId: this.state.productDetails._id,
            sellerId: this.state.productDetails.sellerId._id,
            productQuantity: 1,
          },
        ],
      };
      this.setState({ isLoading: true });
      let response = await SHApiConnector.addToCart(data);
      if (response.data.status) {
        let cart = await AsyncStorage.getItem(AppStrings.label.cart_count);
        AppUtils.console('cartCount', cart);
        cart = JSON.parse(cart);

        AppUtils.console('zdfxcvdswszfdx', response, this.props);
        this.setState({ isLoading: false });

        if (response.data.response.length == cart.cartCount) {
          this.setState({ cartCount: response.data.response.length });

          setTimeout(() => {
            Toast.show(strings('equip.alreadyInCart', { productName: this.state.productDetails.productName }));
          }, 500);
        } else {
          Actions.refresh({ cartCount: response.data.response.length });
          this.setState({ cartCount: response.data.response.length });
          await AsyncStorage.setItem(AppStrings.label.cart_count, JSON.stringify({ cartCount: response.data.response.length }));

          setTimeout(() => {
            Toast.show(strings('equip.addedSuccess', { productName: this.state.productDetails.productName }));
          }, 500);
        }
      } else {
        this.setState({ isLoading: false });
        Toast.show(response.data.error_message);
      }
    } catch (e) {
      this.setState({ isLoading: false });
      AppUtils.console('ADD_IN_WISHLIST_ERROR', e);
    }
  }

  async insertOrRemoveProductFromWishList() {
    try {
      let data = {
        productId: this.state.productDetails._id,
        sellerId: this.state.productDetails.sellerId._id,
      };
      this.setState({ isLoading: true });
      let response = null;
      if (this.state.isProductInWishList) {
        response = await SHApiConnector.removeFromWishList(data);
      } else {
        response = await SHApiConnector.addToWishList(data);
        AppUtils.console('WISH_RESPONSE', response);
      }

      AppUtils.console('sdzsfxcg', this.state.isProductInWishList, response, data);
      if (response.data.status) {
        this.setState({ isProductInWishList: this.state.isProductInWishList ? false : true, isLoading: false });
      } else {
        this.setState({ isLoading: false });
        Toast.show(response.data.error_message);
      }
    } catch (e) {
      this.setState({ isLoading: false });
      AppUtils.console('ADD_IN_WISHLIST_ERROR', e);
    }
  }

  renderSwiper() {
    AppUtils.console('pagerData', this.state.productDetails.file);
    return (
      <View>
        <IndicatorViewPager
          initialPage={this.state.selectedImageIndex}
          style={{ height: this.state.fullViewModal ? hp(100) : hp(40) }}
          indicator={this._renderDotIndicator()}
        >
          {this.state.productDetails.file.map((data, index) => this.pagerData(data, index))}
        </IndicatorViewPager>
      </View>
    );
  }

  _renderDotIndicator() {
    return (
      <PagerDotIndicator
        pageCount={this.state.productDetails.file.length}
        onPageSelected={(pageNumber) => this.setState({ selectedImageIndex: pageNumber.position })}
        dotStyle={[{ backgroundColor: AppColors.backgroundGray }, medicalHomeScreenStyle.swipeIndicatorCommonStyle]}
        selectedDotStyle={[{ backgroundColor: AppColors.primaryColor }, medicalHomeScreenStyle.swipeIndicatorCommonStyle]}
      >
        {/*<Image*/}
        {/*    source={require("./../../../../assets/images/cancel.png")}*/}
        {/*    style={{*/}
        {/*        height: hp(4),*/}
        {/*        width: hp(4),*/}
        {/*        alignSelf: 'flex-end', marginRight: hp(2), marginTop: hp(2)*/}
        {/*    }}*/}
        {/*></Image>*/}
      </PagerDotIndicator>
    );
  }
  showImage(img, index) {
    this.setState({ fullImage: img, fullViewModal: true, selectedImageIndex: index });
  }

  pagerData(data, index) {
    AppUtils.console('dfzvbdfgf', data, 'index ', index);

    return (
      <View style={{ backgroundColor: AppColors.whiteColor, justifyContent: 'center', alignItems: 'center' }}>
        {data.fileType === 'image' ? (
          this.state.fullViewModal ? (
            <ImageZoom
              cropWidth={Dimensions.get('window').width}
              cropHeight={Dimensions.get('window').height}
              imageWidth={Dimensions.get('window').width}
              imageHeight={Dimensions.get('window').height}
              enableSwipeDown={true}
            >
              <Image
                enableHorizontalBounce={true}
                resizeMode={'contain'}
                style={{
                  width: Dimensions.get('window').width,
                  height: Dimensions.get('window').height,
                }}
                source={{ uri: data.fileName }}
              />
            </ImageZoom>
          ) : (
            <TouchableOpacity
              underlayColor="transparent"
              style={{
                display: 'flex',
                flexDirection: 'row',
              }}
              onPress={() => {
                this.showImage(data.fileName, index);
              }}
            >
              <Image
                resizeMode={'contain'}
                style={{
                  height: hp(26),
                  marginBottom: hp(5),
                  width: wp(80),
                  alignSelf: 'center',
                }}
                source={{ uri: data.fileName }}
              />
              <AntDesign
                name="sharealt"
                size={24}
                onPress={() => this.captureScreenshot()}
                style={{
                  color: AppColors.primaryColor,
                }}
              />
            </TouchableOpacity>
          )
        ) : (
          <View>
            <View
              style={{
                width: wp(100),
                height: this.state.fullViewModal ? hp(70) : hp(30),
                marginBottom: hp(5),
                alignSelf: 'center',
              }}
            >
              {/*<VideoPlayer*/}
              {/*    endWithThumbnail*/}
              {/*    style={{ width: wp(100),height:this.state.fullViewModal?hp(70):hp(30), alignSelf: 'center' }}*/}
              {/*    thumbnail={{ uri: data.fileName }}*/}
              {/*    disableFullscreen={true}*/}
              {/*    loop={true}*/}
              {/*    video={{ uri: data.fileName }}*/}
              {/*    ref={r => this.player = r}*/}
              {/*/>*/}
              <WebView
                source={{ uri: data.fileName }}
                androidHardwareAccelerationDisabled={true}
                style={{ width: wp(100), height: this.state.fullViewModal ? hp(70) : hp(30), alignSelf: 'center' }}
              />
            </View>
            {this.state.fullViewModal ? null : (
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  height: hp(4),
                  width: hp(4),
                  alignSelf: 'flex-end',
                  marginTop: hp(1),
                }}
                underlayColor="transparent"
                onPress={() => this.setState({ fullViewModal: true, selectedImageIndex: index })}
              >
                <Image
                  source={require('./../../../../assets/images/full-screen.png')}
                  style={{
                    height: hp(3),
                    width: hp(3),
                    marginRight: hp(1.5),
                    alignSelf: 'flex-end',
                    tintColor: AppColors.whiteColor,
                  }}
                ></Image>
              </TouchableOpacity>
            )}
          </View>
        )}
 
      </View>
    );
  }
}
const styles = StyleSheet.create({
  p: {
    // fontWeight: '300',
    fontSize: 30,
    fontWeight: "bold",
    color: "black", 
    textAlign: isRTL ? "right": "auto"  
  },
  ul:{
    fontSize: 15,
    color: "black",
    textAlign: isRTL ? "right": "auto"   },
  li:{
    fontSize: 18,
      color: "black",
      textAlign: isRTL ? "right": "auto" 
  },
   span: {
    fontSize: 15,
    color: "black",
    textAlign: isRTL ? "right": "auto"   },
   a:{
    fontSize: 15,
    color: "black",
    textAlign: isRTL ? "right": "auto"   }
}
);

export default productDetails;


