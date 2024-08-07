import React, { Component } from 'react';
import {
    FlatList,
    Image,
    StyleSheet,
    View,
    Text,
    TouchableOpacity, ScrollView,
    RefreshControl, Alert
} from 'react-native'
import { AppColors } from "../../../shared/AppColors";
import CardView from "react-native-cardview";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { AppStyles } from "../../../shared/AppStyles";
import { AppUtils } from "../../../utils/AppUtils";
import { SHApiConnector } from "../../../network/SHApiConnector";
import { Actions } from "react-native-router-flux";
import moment from "moment";
import ProgressLoader from "rn-progress-loader";
import { Dropdown } from 'react-native-material-dropdown';
import medicalWishScreenStyle from "./wishListStyle"
import Toast from 'react-native-simple-toast';
import searchProductStyle from "./../searchProduct/searchProductStyle"
import productDetailsStyle from "./../productDetails/productDetailsStyle"
import cartStyle from '../medicalCart/cartStyle'
import { AppStrings } from '../../../shared/AppStrings';

import images from "../../../utils/images";

import {CachedImage,ImageCacheProvider} from '../../../cachedImage';
import { strings } from '../../../locales/i18n';
class wishList extends Component {
    constructor(props) {
        super(props);
        AppUtils.analyticsTracker('Medical Equipment Order List')
        this.state = {
            wishList: [],
            page: 1, isAllSelected: false, productEditedList: [],

            filter: '',
            isLoading: false,
            isDataVisible: false,
            isRefreshing: false,
            isFooterLoading: false, selectedSort: 'All'
        }
    }

    componentDidMount() {
        this.getWishList(true);
    }
    async removeItem(item) {
        try {
            let data = {
                productId: item._id,
                sellerId: item.sellerId._id
            };
            this.setState({ isLoading: true });
            let response = null;
            response = await SHApiConnector.removeFromWishList(data);
            AppUtils.console("WISH_RESPONSE", response);

            if (response.data.status) {
                this.setState({ isLoading: false, page: 1 });

                this.getWishList(true);
            }

        } catch (e) {

        }


    }

    async getWishList(isLoading) {
        try {
            this.setState({ isLoading: isLoading });
            let response = await SHApiConnector.getMyWishList({ page: this.state.page, filterBy: this.state.filter });
            AppUtils.console("WishList", response)
            this.setState({ isLoading: false }, () => {
                if (response.data) {
                    if (response.data.status) {
                        if (response.data.response.length > 0) {
                            if (response.data.response.length < 10) {
                                this.setState({ isFooterLoading: false })
                            } else {
                                this.setState({ isFooterLoading: true })
                            }
                            if (this.state.page == 1) {
                                this.setState({
                                    productEditedList: response.data.response,

                                    isRefreshing: false,
                                    page: this.state.page + 1,
                                    isDataVisible: true
                                })
                            } else {
                                this.setState({
                                    productEditedList: [...this.state.productEditedList, ...response.data.response],

                                    page: (this.state.page) + 1,
                                    isDataVisible: true
                                })
                            }

                            let productList = [];
                            response.data.response.map((product, index) => {
                                AppUtils.console("product", product)
                                productList.push(product.product);
                                productList[index].sellerId = product.sellerId;
                                productList[index].userQuantity = product.productQuantity;
                                productList[index].cartId = product._id;
                                productList[index].isSelect = false;
                            });

                            AppUtils.console("sdzxdsf123", productList);
                            AppUtils.console("sdzxdsf1234", response.data.response);

                            this.setState({
                                productEditedList: productList, isAllSelected: false,
                                isLoading: false,
                            })


                        } else {
                            this.setState({
                                isRefreshing: false,
                                isDataVisible: true,
                                productEditedList: response.data.response,


                            })
                        }
                    } else {
                        Alert.alert('', response.data.error_message);
                    }
                } else {
                    if (response.problem && response.problem === 'NETWORK_ERROR') {
                        Alert.alert('', strings('equip.checkNetwork'));
                    }
                }
            });
        } catch (e) {
            AppUtils.console("ORDER_LIST_ERROR", e)
        }
    }


    checkFooterLoading() {
        (this.state.isFooterLoading) ? this.getWishList(false) : null
    }

    selectProduct(item) {
        let productList = this.state.productEditedList;
        productList[item.index].isSelect = !item.item.isSelect;
        let selectedItemCount = 0;
        productList.map(product => {
            selectedItemCount = (product.isSelect) ? selectedItemCount + 1 : selectedItemCount;
        });
        this.setState({
            productEditedList: productList,
            isAllSelected: (productList.length === selectedItemCount)

        })
    }
    selectAllProduct() {
        let productList = this.state.productEditedList;
        productList.map(product => {
            product.isSelect = !this.state.isAllSelected
        });
        this.setState({
            productEditedList: productList,
            isAllSelected: !this.state.isAllSelected
        })
    }

    placeOrder() {      
        AppUtils.console("placeOrder",this.state.productEditedList)
        let productList = [];
        let notForSale =false;
        
      
        this.state.productEditedList.map(product => {
            
            AppUtils.console("placeOrderLoop",product.notForSale);

            (product.notForSale) ? notForSale = true : null;
        });
        if(!notForSale){
       
        this.state.productEditedList.map(product => {
            (product.isSelect) ? productList.push(product) : null;
        });

        if (productList.length > 0) {
            Actions.OrderSummary({ productList: productList });
        } else {
            Toast.show(strings('equip.selectFromWishList'));
        } 
    }else{
            Toast.show(strings('string.label.notForSaleMessage'));
    
        }
    }

    renderContent(item) {
        AppUtils.console("dxgfchjdfchg", item);
        let image = (item.item.isSelect) ? require('../../../../assets/images/check_active.png') : require('../../../../assets/images/check_inactive.png');

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
                                style={medicalWishScreenStyle.productViewImageStyle}
                                source={{ uri: (item.item.productImages[0]) ? item.item.productImages[0] : 'https://smarthelpbucket.s3.us-east-2.amazonaws.com/staging_storage/medical/category/wellness.png' }}
                            />
                            <TouchableOpacity onPress={() => this.selectProduct(item)} style={{ position: 'absolute', alignSelf: 'flex-start' }}>
                                <Image resizeMode={'contain'} style={medicalWishScreenStyle.cancelIcon}
                                    source={image}
                                />
                            </TouchableOpacity>

                            <TouchableOpacity style={medicalWishScreenStyle.remove} onPress={() => this.removeItem(item.item)}>
                                <Image resizeMode={'contain'} style={medicalWishScreenStyle.cancelIcon}
                                    source={images.closeItem} />
                            </TouchableOpacity>
                        </View>


                        <View style={{ flex: 1 }}>
                            <View style={{ marginLeft: wp(3), marginRight: wp(1) }}>

                                <Text numberOfLines={1}
                                    style={[searchProductStyle.title, { height: 24 }]}>{item.item.productName}</Text>
                                <TouchableOpacity onPress={() => { Actions.SearchProduct({ seller: item.item.sellerId.companyName }) }}>
                                    <Text numberOfLines={1}
                                        style={productDetailsStyle.sellerName}>
                                        <Text style={{ color: AppColors.blackColor }}>{strings('equip.soldBy')}</Text>{item.item.sellerId.companyName}</Text>
                                </TouchableOpacity>


                                <View style={[searchProductStyle.priceView, { flexDirection: 'row' }]}>
                                    <Text numberOfLines={1}
                                        style={[searchProductStyle.priceTxt, { flex: 1 }]}>
                                          
                                          {!item.item.notForSale?(item.item.currencySymbol + "" + item.item.sellingPrice):strings('string.label.notForSale')}
                                            
                                            </Text>

                                </View>
                            </View>
                        </View>
                    </CardView>
                </TouchableOpacity>
            </View>
        )
    }


    render() {
        let checkImage = (this.state.isAllSelected) ? require('../../../../assets/images/check_active.png') : require('../../../../assets/images/check_inactive.png');

        return (

            <View style={medicalWishScreenStyle.container}>
                {(this.state.productEditedList.length > 0) ?

                    <View style={cartStyle.subContainer}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <TouchableOpacity onPress={() => this.selectAllProduct()}
                                style={medicalWishScreenStyle.selectAll}>
                                <Image resizeMode={'contain'} style={medicalWishScreenStyle.checkImage}
                                    source={checkImage}
                                />
                                <Text style={medicalWishScreenStyle.selectText}>{strings('equip.selectAll')}</Text>
                            </TouchableOpacity>


                            <View style={cartStyle.bestSellerInnerView}>

                                <FlatList
                                    data={this.state.productEditedList}
                                    renderItem={(item) => (this.renderContent(item))}
                                    numColumns={2}
                                    keyExtractor={(item, index) => index.toString()}

                                    onEndReachedThreshold={0.5}
                                    onEndReached={() => this.checkFooterLoading()}
                                    keyExtractor={(item, index) => index.toString()}

                                />
                            </View>

                        </ScrollView>
                        <View style={medicalWishScreenStyle.checkoutView}>

                            <TouchableOpacity style={{ flex: 1, marginRight: wp(5), alignItems: 'flex-end' }}
                                onPress={() => this.placeOrder()}>
                                <View style={medicalWishScreenStyle.checkoutTextView}>
                                    <Text style={medicalWishScreenStyle.checkoutText}>{strings('equip.checkOut')}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>


                    </View> : (this.state.isLoading) ? null :
                        <View style={cartStyle.emptyView}>
                            <Text style={cartStyle.emptyText}>{strings('equip.wishlistEmpty')}</Text>
                        </View>
                }
                <ProgressLoader
                    visible={this.state.isLoading}
                    isModal={true} isHUD={true}
                    hudColor={"#FFFFFF"}
                    color={AppColors.primaryColor} />

            </View>



        )
    }

}


export default wishList;


