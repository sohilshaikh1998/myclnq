import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Image,
    PermissionsAndroid,
    Dimensions,
    Alert,
    BackHandler,
    Platform,
    TouchableOpacity,
    TextInput,
    FlatList,
    ScrollView,
    I18nManager
} from 'react-native';

import ElevatedView from 'react-native-elevated-view';

import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Dropdown } from 'react-native-material-dropdown';

import { Actions } from 'react-native-router-flux';
import CardView from 'react-native-cardview'
import { AppColors } from "../../../shared/AppColors";
import searchProductStyle from "./searchProductStyle"
import { SHApiConnector } from "../../../network/SHApiConnector";
import ProgressLoader from "rn-progress-loader";
import { AppStyles } from "../../../shared/AppStyles";
import { AppUtils } from "../../../utils/AppUtils";
import images from "../../../utils/images";
import Toast from "react-native-simple-toast";
import productDetailsStyle from "./../productDetails/productDetailsStyle"

import {
    CachedImage,
    ImageCacheProvider
} from '../../../cachedImage';
import { AppStrings } from '../../../shared/AppStrings';
import { strings } from '../../../locales/i18n';
const elevationVal = 5;
const isRTL = I18nManager.isRTL;

const sortBy = [

    {
        value: 'Name'
    },
    {
        value: 'Price'
    },
]

class searchProduct extends Component {
    constructor(props) {
        super(props);
        AppUtils.console("sdzxdfg", props);
        AppUtils.analyticsTracker('Medical Equipment Search Product');
        this.state = {
            categoryList: [],
            categoryListForDropDown: [],
            available_products: [],
            isLoading: false,
            searchText: (props.seller) ? props.seller : '',
            page: 1,
            isDataAvail: true,
            selectedCategoryName: (props.selectedCategroyName) ? props.selectedCategroyName : 'All Category',
            selectedCategoryIndex: (props.selectedCategoryIndex) ? props.selectedCategoryIndex : 0,
            isSearchTextEnable: true,showEmpty:false
        }
    }

    componentDidMount() {
        AppUtils.console("searchSeller", this.props.seller);

        this.getCategory();
        if (Platform.OS === 'android') {
            BackHandler.addEventListener('hardwareBackPress', () => {
                this.goBack();
                return true;
            })
        }
    }


    goBack() {
        if (this.state.isPanExpanded) {
            this.closeForm()
        } else {
            Actions.MainScreen();
        }
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', () => {
            Actions.MainScreen();
        });
    }

    async getCategory() {
        try {
            this.setState({ isLoading: true })
            let response = await SHApiConnector.getCategory();
            AppUtils.console("searchCategory", response);
            if (response.data.status) {
                let categoryList = response.data.response;
                categoryList.map(category => {
                    category.value = category.category;
                });
                this.setState({
                    categoryList: response.data.response,
                    categoryListForDropDown: [{ value: 'All Category' }].concat(categoryList)
                }, () => {
                    this.getSearchProductList();
                })
            } else {
                Alert.alert('', response.data.error_message);
            }
        } catch (e) {
            this.setState({ isLoading: false })
            AppUtils.console("ERROR", e.response);
        }
    }

    async getSearchProductList() {
        try {
            let data = {
                search: this.state.searchText,
                filterBy: (this.state.selectedCategoryIndex === 0) ? "" : "CATEGORY",
                categoryId: (this.state.selectedCategoryIndex === 0) ? "" : this.state.categoryListForDropDown[this.state.selectedCategoryIndex]._id,
                subCategoryId: ""
            };
            this.setState({ isLoading: (this.state.page === 1 && this.state.searchText.length === 0) ? true : false });
            let response = await SHApiConnector.getProductList(data, this.state.page);
            AppUtils.console("SearchList", response)
            if (response.data.status) {
                this.setState({
                    available_products: (this.state.page === 1) ? response.data.response : this.state.available_products.concat(response.data.response),
                    page: (this.state.searchText.length > 0) ? 1 : this.state.page + 1,
                    isLoading: false,
                    isSearchTextEnable: true,
                    showEmpty:response.data.response.length > 0?false:true,
                    isDataAvail: (response.data.response.length === 10) ? true : false
                })
            } else {
                this.setState({ isSearchTextEnable: true, isLoading: false });
                Alert.alert('', response.data.error_message);
            }
        } catch (e) {
            this.setState({ isLoading: false, isSearchTextEnable: true });
            AppUtils.console("ERROR", e.response);
        }
    }


    renderBestSellerContent(item) {
        AppUtils.console("dxgfchjdfchg", item);
        let wishListImage = (item.item.wish) ? require('../../../../assets/images/filled_wishlist.png') : require('../../../../assets/images/wishlist.png');

        return (
            <View style={{
                flex: 1,
                alignItems: item.index % 2 !== 0 ? 'flex-end' : null,
                marginLeft: item.index % 2 !== 0 ? wp(1) : wp(3),
                marginBottom: hp(3),
                marginRight: item.index % 2 !== 0 ? wp(3) : wp(1),

            }}>
                <TouchableOpacity onPress={() => Actions.ProductDetails({ productDetails: item.item })}>
                    <CardView cornerRadius={13} cardElevation={2} style={[searchProductStyle.productView]}>
                        <View>
                            <CachedImage
                                resizeMode={'contain'}
                                style={searchProductStyle.productViewImageStyle}
                                source={{ uri: item.item.productImages[0] }}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <View style={{ marginLeft: wp(3), marginRight: wp(1) }}>

                                <Text numberOfLines={1}
                                    style={[searchProductStyle.title]}>{item.item.productName}</Text>
                                <TouchableOpacity onPress={() => this.setSearchText(item.item.sellerId.companyName)}>
                                    <Text numberOfLines={1}
                                        style={productDetailsStyle.sellerName}>
                                        <Text style={{ color: AppColors.blackColor }}>{strings('equip.soldBy')}</Text>{item.item.sellerId.companyName}</Text>
                                </TouchableOpacity>


                                {!item.item.notForSale ?
                                    <View style={[searchProductStyle.priceView, { flexDirection: 'row' }]}>
                                        <Text numberOfLines={1}
                                            style={[searchProductStyle.priceTxt, { flex: 1 }]}>
                                            {item.item.currencySymbol + "" + item.item.sellingPrice}
                                        </Text>
                                        <TouchableOpacity
                                            style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-end' }}
                                            onPress={() => this.insertOrRemoveProductFromWishList(item)}>
                                            <Image resizeMode={'contain'} style={{ height: hp(3), width: wp(12) }}
                                                source={wishListImage} />
                                        </TouchableOpacity>
                                    </View> :
                                    <View style={[searchProductStyle.priceView, { flexDirection: 'row' }]}>
                                        <Text numberOfLines={1}
                                            style={[searchProductStyle.priceTxt, { flex: 1 }]}>
                                            {strings('string.label.notForSale')}
                                        </Text>
                                    </View>}




                            </View>
                        </View>
                    </CardView>
                </TouchableOpacity>
            </View>
        )
    }

    async insertOrRemoveProductFromWishList(item) {
        try {
            let data = {
                productId: item.item._id,
                sellerId: item.item.sellerId._id
            };
            this.setState({ isLoading: true });
            let response = null;
            if (item.item.wish) {
                response = await SHApiConnector.removeFromWishList(data);
            } else {
                response = await SHApiConnector.addToWishList(data);
            }

            if (response.data.status) {
                let productList = this.state.available_products;
                productList[item.index].wish = !item.item.wish;
                this.setState({ available_products: productList, isLoading: 'false' })
            } else {
                this.setState({ isLoading: false });
                Toast.show(response.data.error_message);
            }

        } catch (e) {
            this.setState({ isLoading: false });
            AppUtils.console("ADD_IN_WISHLIST_ERROR", e);
        }
    }

    renderBestSeller() {
        return (

            <View style={searchProductStyle.bestSellerInnerView}>
               {this.state.available_products.length ==0 && this.state.showEmpty?
                <View style={{ height: hp(80), justifyContent: 'center' }}>
                <Text style={searchProductStyle.emptyText}>{strings('equip.productNotAvail')}</Text>
            </View>
       

               :
                <FlatList
                    data={this.state.available_products}
                    showsVerticalScrollIndicator={false}
                    renderItem={(item) => (this.renderBestSellerContent(item))}
                    numColumns={2}
                    onEndReachedThreshold={0.5}
                    onEndReached={() => (this.state.isDataAvail) ? setTimeout(() => { this.getSearchProductList() }, 500) : null}
                    keyExtractor={(item, index) => index.toString()}
                />}
                </View>
        )
    }

    selectCategory(categroyName, index) {
        if (index != this.state.selectedCategoryIndex) {
            this.setState({
                selectedCategoryName: categroyName,
                selectedCategoryIndex: index,
                page: 1,
                isDataAvail: true,
            }, () => this.getSearchProductList());
        }
    }

    setSearchText(input) {
        this.setState({
            searchText: input,
            page: 1,
            isDataAvail: true,
            isSearchTextEnable: false,
        }, () => {
            setTimeout(() => {
                this.getSearchProductList()
            }, 500);
        });
    }

    render() {
        AppUtils.console("sadzcvdsdx", this.state.categoryList);
        return (
            <View style={searchProductStyle.container}>
                <ElevatedView elevation={5}
                    style={searchProductStyle.elevatedView}>
                    <View style={searchProductStyle.searchView}>
                        <View style={searchProductStyle.inputView}>
                            <Image
                                resizeMode={'contain'}
                                style={searchProductStyle.searchIcon}
                                source={images.searchIcon}
                            />
                            <TextInput allowFontScaling={false}
                                testID='loginNumber'
                                style={searchProductStyle.inputStyle}
                                autoFocus={true}
                                placeholder={strings('equip.searchProduct')}
                                placeholderColor={AppColors.primaryGray}
                                value={this.state.searchText}
                                onChangeText={(input) => this.setSearchText(input)}
                                returnKeytype='done'
                            />
                        </View>
                        <TouchableOpacity onPress={() => this.setState({ searchText: '', page: 1 }, () => this.getSearchProductList())}
                            style={searchProductStyle.clearView}>
                            <Text style={[searchProductStyle.headingTxt,
                            {
                                marginTop: (AppUtils.isIphone) ? hp(.5) : 0,
                                alignSelf: 'center',
                                fontFamily: AppStyles.fontFamilyRegular,
                                fontSize: hp(2),
                                marginLeft: wp(3)
                            }]}>{strings('equip.clear')}</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        <Dropdown
                            label=''
                            textColor={AppColors.blackColor}
                            itemColor={AppColors.blackColor}
                            rippleColor={'transparent'}
                            dropdownPosition={-5}
                            dropdownOffset={{ top: hp(2), left: 0 }}
                            itemTextStyle={{ fontFamily: AppStyles.fontFamilyRegular,textAlign: isRTL ? 'right' : 'auto', }}
                            dropdownMargins={{ min: 8, max: 16 }}
                            value={this.state.selectedCategoryName}
                            onChangeText={(value, index, data) => this.selectCategory(value, index)}
                            containerStyle={{
                                width: wp(30), padding: 0,
                                marginLeft: wp(3), fontFamily: AppStyles.fontFamilyRegular
                            }}
                            data={this.state.categoryListForDropDown}
                        />

                        <Dropdown
                            label=''
                            textColor={AppColors.blackColor}
                            itemColor={AppColors.blackColor}
                            rippleColor={'transparent'}
                            dropdownPosition={-3}
                            dropdownOffset={{ top: hp(2), left: 0 }}
                            itemTextStyle={{ fontFamily: AppStyles.fontFamilyRegular }}
                            dropdownMargins={{ min: 8, max: 16 }}
                            value={'Sort By'}
                            containerStyle={{
                                width: wp(30), padding: 0,
                                marginLeft: wp(10), fontFamily: AppStyles.fontFamilyRegular
                            }}
                            data={sortBy}
                        />
                    </View>
                </ElevatedView>
                <View>
                    {this.renderBestSeller()}
                    <ProgressLoader
                        visible={this.state.isLoading}
                        isModal={true} isHUD={true}
                        hudColor={"#FFFFFF"}
                        color={AppColors.primaryColor} />
                </View>

            </View>
        );
    }


}

export default searchProduct;






