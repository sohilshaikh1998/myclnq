import React, { Component } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, View, Text, TouchableOpacity, AsyncStorage, TextInput, Alert } from 'react-native'
import { AppColors } from "../../../shared/AppColors";
import CardView from "react-native-cardview";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { AppStyles } from "../../../shared/AppStyles";
import { AppUtils } from "../../../utils/AppUtils";
import Toast from 'react-native-simple-toast';
import images from "../../../utils/images";
import AddressView from "../../../shared/AddressView";
import { SHApiConnector } from "../../../network/SHApiConnector";
import AddOrUpdateAddress from "../../../shared/AddOrUpdateAddress";
import SelectAddressModal from "../../../shared/SelectAddressModal";
import { Actions } from "react-native-router-flux";
import ProgressLoader from "rn-progress-loader";
import cartStyle from "./cartStyle";
import productDetailsStyle from "./../productDetails/productDetailsStyle"
import { AppStrings } from '../../../shared/AppStrings';

import {
    CachedImage,
    ImageCacheProvider
} from '../../../cachedImage';
import { strings } from '../../../locales/i18n';
class medicalCart extends Component {
    constructor(props) {
        super(props);
        AppUtils.console("sdzfvbdsefd123", props);
        AppUtils.analyticsTracker('Medical Equipments Cart Screen');
        this.state = {
            productList: [],
            productEditedList: [],
            subTotal: 0,
            addressList: [],
            selectedAddress: {},
            isAddAddressOpen: false,
            isAddressOpen: false,
            updateAddressData: {},
            isAllSelected: false
        }
    }

    componentDidMount() {
        this.getCartProductList()
    }

    async getCartProductList() {
        try {
            this.setState({ isLoading: true });
            let response = await SHApiConnector.getCartList();
            AppUtils.console("getCartList", response);
            if (response.data.status) {
                let productList = [];
                response.data.response.map((product, index) => {
                    productList.push(product.medicalProductId);
                    productList[index].sellerId = product.sellerId;
                    productList[index].userQuantity = product.productQuantity;
                    productList[index].cartId = product._id;
                    productList[index].isSelect = false;
                });

                AppUtils.console("sdzxdsf123", productList);

                this.setState({
                    productList: response.data.response,
                    productEditedList: productList,
                    isLoading: false, isAllSelected: false
                })
            } else {
                this.setState({ isLoading: false });
                Alert.alert('', response.data.error_message);
            }
        } catch (e) {
            this.setState({ isLoading: false });
            AppUtils.console("ERROR", e.response);
        }
    }
    async removeToCart(item) {
        AppUtils.console("removeCartData", item)
        try {
            let data = {
                productList: [{
                    medicalProductId: item._id, cartId: item.cartId
                }]
            };
            AppUtils.console("removeCartitem", data)


            this.setState({ isLoading: true });
            let response = await SHApiConnector.removeToCart(data);
            if (response.data.status) {
                AppUtils.console("RemoveresponseCArt", response);
                AppUtils.console("RemoveresponseCArtData", response.data.response);
                this.setState({ isLoading: false });
                await AsyncStorage.setItem(AppStrings.label.cart_count, JSON.stringify({ cartCount: response.data.response.length }));


                // setTimeout(() => {
                //     Toast.show(item.productName + ' is successfully removed from your cart.')
                // }, 500);
                this.getCartProductList()

            } else {
                this.setState({ isLoading: false });
                Toast.show(response.data.error_message);
            }

        } catch (e) {
            this.setState({ isLoading: false });
            AppUtils.console("ADD_IN_WISHLIST_ERROR", e);
        }
    }


    quantityAddOrReduce(item, addOrSub) {
        let productList = this.state.productEditedList;
        let availableProduct = item.item.productQuantity;
        if (addOrSub === 'add') {
            if (item.item.userQuantity < availableProduct) {
                productList[item.index].userQuantity = productList[item.index].userQuantity + 1;
            }
            this.getSubTotal(productList)
        } else {
            if (item.item.userQuantity > 1) {
                productList[item.index].userQuantity = productList[item.index].userQuantity - 1;
            }
            this.getSubTotal(productList)
        }
    }

    getSubTotal(productList) {
        let subTotal = 0;
        AppUtils.console("sdzfcszsdcsd", productList)
        productList.map(product => {
            if (product.isSelect) {
                subTotal = subTotal + (parseFloat(product.sellingPrice) * product.userQuantity);
            }
        });
        this.setState({ productEditedList: productList, subTotal: subTotal })
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
        }, () => this.getSubTotal(productList))
    }

    selectAllProduct() {
        let productList = this.state.productEditedList;
        productList.map(product => {
            product.isSelect = !this.state.isAllSelected
        });
        this.setState({
            productEditedList: productList,
            isAllSelected: !this.state.isAllSelected
        }, () => this.getSubTotal(productList))
    }

    renderProduct(item) {
        AppUtils.console("sdcszdsdcsx", item);
        let image = (item.item.isSelect) ? require('../../../../assets/images/check_active.png') : require('../../../../assets/images/check_inactive.png');
        return (
            <View style={cartStyle.listProduct}>
                <TouchableOpacity onPress={() => this.selectProduct(item)} style={cartStyle.listProductImageView}>
                    <Image resizeMode={'contain'} style={cartStyle.listProductImage}
                        source={image}
                    />
                </TouchableOpacity>
                <CardView cardElevation={2} cornerRadius={5}
                    style={cartStyle.cardView}>
                    <View style={cartStyle.itemView}>
                        <View style={{ flexDirection: 'row' }}>
                            <CachedImage
                                resizeMode={'contain'}
                                style={cartStyle.itemImage}
                                source={{ uri: item.item.productImages[0] }}
                            />
                            <View style={{ flexDirection: 'column' }}>
                                <View style={{ flexDirection: 'row' }}>
                                    <View style={{ marginTop: hp(1.5), width: wp(61) }}>
                                        <Text numberOfLines={1}
                                            style={cartStyle.itemName}>{item.item.productName}</Text>
                                        <View style={{ flexDirection: 'row' }}>

                                            <Text
                                                numberOfLines={1}
                                                style={cartStyle.itemSellerLabel}>{strings('equip.soldBy')}</Text>
                                            <TouchableOpacity onPress={() => { Actions.SearchProduct({ seller: item.item.sellerId.companyName }) }}>
                                                <Text numberOfLines={1}
                                                    style={cartStyle.seller}>{item.item.sellerId.companyName}</Text>
                                            </TouchableOpacity></View>

                                    </View>
                                    <View>
                                        <TouchableOpacity onPress={() => this.removeToCart(item.item)}>
                                            <Image resizeMode={'stretch'} style={cartStyle.trash}
                                                source={images.thrash}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                {!item.item.notForSale ?
                                    <View style={cartStyle.itemBottom}>
                                        <Text
                                            numberOfLines={1}
                                            style={cartStyle.itemPrice}>

                                            {item.item.currencySymbol + "" + item.item.sellingPrice}

                                        </Text>
                                        <View style={cartStyle.leftView}>
                                            <Text
                                                numberOfLines={1}
                                                style={cartStyle.leftText}>{item.item.productQuantity} Left</Text>
                                        </View>
                                        <View style={cartStyle.countView}>
                                            <TouchableOpacity onPress={() => this.quantityAddOrReduce(item, 'sub')}>
                                                <Text style={cartStyle.minus}>-</Text>
                                            </TouchableOpacity>
                                            <Text style={cartStyle.count}>{item.item.userQuantity}</Text>
                                            <TouchableOpacity onPress={() => this.quantityAddOrReduce(item, 'add')}>
                                                <Text style={cartStyle.plus}>+</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View> :
                                    <View style={cartStyle.itemBottom}>

                                        <Text
                                            numberOfLines={1}
                                            style={cartStyle.itemPrice}>

                                            {!item.item.notForSale ? (item.item.currencySymbol + "" + item.item.sellingPrice) : strings('string.label.notForSale')}

                                        </Text></View>}
                            </View>
                        </View>
                    </View>
                </CardView>
            </View>
        );
    }


    render() {
        let checkImage = (this.state.isAllSelected) ? require('../../../../assets/images/check_active.png') : require('../../../../assets/images/check_inactive.png');
        return (
            <View style={cartStyle.container}>
                {(this.state.productEditedList.length > 0) ?
                    <View style={cartStyle.subContainer}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <TouchableOpacity onPress={() => this.selectAllProduct()}
                                style={cartStyle.checkBox}>
                                <Image resizeMode={'contain'} style={cartStyle.checkImage}
                                    source={checkImage}
                                />
                                <Text style={cartStyle.selectText}>{strings('equip.selectAll')}</Text>
                            </TouchableOpacity>
                            <FlatList
                                data={this.state.productEditedList}
                                renderItem={(item) => (this.renderProduct(item))}
                                keyExtractor={(item, index) => index.toString()}
                            />
                        </ScrollView>
                        <View style={cartStyle.checkoutView}>
                            <View style={{ flex: 1 }}>
                                <Text style={cartStyle.totalText}>{strings('common.caregiver.total')} {(this.state.productEditedList.length > 0) ? this.state.productEditedList[0].currencySymbol + this.state.subTotal : ''}</Text>
                            </View>
                            <TouchableOpacity style={cartStyle.placeOrder}
                                onPress={() => this.placeOrder()}>
                                <View style={cartStyle.checkView}>
                                    <Text style={cartStyle.checkoutText}>{strings('equip.checkOut')}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View> :
                    (this.state.isLoading) ? null :
                        <View style={cartStyle.emptyView}>
                            <Text style={cartStyle.emptyText}>{strings('equip.cartEmpty')}</Text>
                        </View>
                }
                <ProgressLoader
                    visible={this.state.isLoading}
                    isModal={true} isHUD={true}
                    hudColor={"#FFFFFF"}
                    color={AppColors.primaryColor} />
            </View>
        );
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
            Toast.show(strings('equip.selectForCheckout'));
        }
    }else{
        Toast.show(strings('string.label.notForSaleMessage'));

    }
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
});

export default medicalCart;


