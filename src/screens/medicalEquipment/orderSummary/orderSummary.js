import React, { Component } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, View, Text, TouchableOpacity, TextInput, Alert, BackHandler } from 'react-native'
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
import moment from "moment";
import cartStyle from "./../medicalCart/cartStyle";

import {CachedImage,ImageCacheProvider} from '../../../cachedImage';
import { strings } from '../../../locales/i18n';
const groupBy = key => array =>
    array.reduce((objectsByKeyValue, obj) => {
        const value = obj[key];
        objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
        return objectsByKeyValue;
    }, {});
class orderSummary extends Component {
    constructor(props) {
        super(props);
        AppUtils.console("ordreSummery", props.productList);
        AppUtils.analyticsTracker('Medical Equipment Order Summery')
        this.state = {
            productList: props.productList,
            subTotal: 0,
            total: 0,
            discount: 0,
            addressList: [],
            selectedAddress: {},
            isAddAddressOpen: false,
            isAddressOpen: false,
            updateAddressData: {},
            currentAddress: true
        }
    }

    componentDidMount() {
        this.getAddress();
        let productList = this.state.productList;
        let subTotal = 0;
        productList.map(product => {
            product.userQuantity = (product.userQuantity) ? product.userQuantity : 1;
            subTotal = subTotal + (parseFloat(product.sellingPrice) * product.userQuantity);
        });
        this.setState({ productList: productList, subTotal: subTotal, total: subTotal })
    }

    async getAddress() {
        try {
            let addressData = await SHApiConnector.getAddress();
            AppUtils.console("Sdzfcszd", addressData)
            if (addressData.data.status) {
                this.setState({ addressList: addressData.data.response }, () => this.getSelectedAddress(addressData.data.response))
            }
        } catch (e) {
            AppUtils.console("zdcszdcsx", e)
        }
    }

    getSelectedAddress(addressList) {
        AppUtils.console("Address", addressList)
        let selectedAddress = (addressList.length > 0) ? addressList[0] : {};
        let isDefaultAddressAvail = false;
        addressList.map(address => {
            AppUtils.console("zxcsdzxfscx", address)
            if (address.isDefaultAddress) {
                selectedAddress = address;
                isDefaultAddressAvail = true
            }
        });
        if (!isDefaultAddressAvail && addressList.length > 0) {
            addressList[0].isDefaultAddress = true;
        }
        this.setState({ selectedAddress: selectedAddress, addressList: addressList });
    }

    getSubTotal(productList) {
        let subTotal = 0;
        AppUtils.console("sdzfcszsdcsd", productList)
        productList.map(product => {
            subTotal = subTotal + (parseFloat(product.sellingPrice) * product.userQuantity);
        });
        this.setState({ productList: productList, subTotal: subTotal }, () => this.addDiscount())
    }

    quantityAddOrReduce(item, addOrSub) {
        let productList = this.state.productList;
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

    renderProduct(item) {
        AppUtils.console("renderProduct", item)
        return (
            <CardView cardElevation={2} cornerRadius={5}
                style={{
                    backgroundColor: AppColors.whiteColor,
                    marginBottom: hp(1),
                    width: wp(90),
                    alignSelf: 'center'
                }}>
                <View style={{ flexDirection: 'column', marginLeft: hp(1), marginRight: hp(1) }}>
                    <View style={{ flexDirection: 'row' }}>
                    <CachedImage
                            resizeMode={'contain'}
                            style={{
                                height: hp(10),
                                width: wp(10),
                                alignSelf: 'center'
                            }}
                            source={{ uri: item.item.productImages[0] }}
                        />
                        <View style={{ flexDirection: 'column' }}>
                            <View style={{ flexDirection: 'row' }}>
                                <View style={{ marginTop: hp(1.5), width: wp(70) }}>
                                    <Text numberOfLines={1}
                                        style={{
                                            color: AppColors.blackColor,
                                            width: wp(65),
                                            marginTop: hp(1),
                                            marginLeft: wp(4),
                                            fontFamily: AppStyles.fontFamilyMedium,
                                            fontSize: hp(1.8)
                                        }}>{item.item.productName}</Text>
                                    <View style={{ flexDirection: 'row' }}>
                                        <TouchableOpacity onPress={() => {
                                            Actions.SearchProduct({ seller: item.item.sellerId.companyName })
                                        }}>
                                            <Text numberOfLines={1}
                                                style={cartStyle.itemSeller}>
                                                <Text style={{ color: AppColors.blackColor }}>{strings('equip.soldBy')}</Text>{item.item.sellerId.companyName}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View>
                                    <TouchableOpacity onPress={() => this.removeItem(item.item)}>
                                        <Image resizeMode={'stretch'} style={{
                                            height: hp(3),
                                            marginTop: hp(.5),
                                            width: wp(6),
                                            alignSelf: 'flex-start'
                                        }}
                                            source={images.thrash}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', marginBottom: hp(1), alignItems: 'center', marginTop: hp(.5) }}>
                                <Text
                                    numberOfLines={1}
                                    style={{
                                        color: AppColors.primaryColor, width: AppUtils.isX?wp(21):wp(25),
                                        marginTop: hp(.5),
                                        marginLeft: wp(4.3), fontFamily: AppStyles.fontFamilyMedium,
                                        fontSize: hp(1.8)
                                    }}>{item.item.currencySymbol + ' ' + item.item.sellingPrice}</Text>
                                <View style={{
                                    marginLeft: wp(1),
                                    height: hp(2.5),
                                    width: wp(15),
                                    borderRadius: hp(2),
                                    borderWidth: 0,
                                    backgroundColor: AppColors.primaryColor,
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Text
                                        numberOfLines={1}
                                        style={{
                                            color: AppColors.whiteColor,
                                            fontFamily: AppStyles.fontFamilyMedium,
                                            fontSize: hp(1.2), marginTop: AppUtils.isIphone ? hp(.5) : hp(0)
                                        }}>{item.item.productQuantity} Left</Text>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: wp(12), }}>
                                    <TouchableOpacity onPress={() => this.quantityAddOrReduce(item, 'sub')}>
                                        <Text style={{
                                            height: hp(3),
                                            fontSize: hp(2),
                                            textAlign: 'center',
                                            width: hp(3),
                                            backgroundColor: AppColors.backgroundGray
                                        }}>-</Text>
                                    </TouchableOpacity>
                                    <Text style={{
                                        height: hp(3),
                                        fontSize: hp(1.8),
                                        paddingTop: hp(.3),
                                        borderWidth: hp(0),
                                        //borderColor: AppColors.blackColor,
                                        textAlign: 'center',
                                        width: hp(3),
                                        backgroundColor: AppColors.whiteColor
                                    }}>{item.item.productQuantity == 0 ? 0 : item.item.userQuantity}</Text>
                                    <TouchableOpacity onPress={() => this.quantityAddOrReduce(item, 'add')}>
                                        <Text style={{
                                            height: hp(3),
                                            fontSize: hp(2),
                                            textAlign: 'center',
                                            width: hp(3),
                                            backgroundColor: AppColors.backgroundGray
                                        }}>+</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                    {(item.item.offerId) ?
                        <View style={{ flexDirection: 'row', margin: hp(.5), marginBottom: hp(2) }}>
                            <View style={{
                                height: hp(4),
                                borderWidth: hp(.2),
                                borderColor: AppColors.backgroundGray,
                                borderRadius: wp(2),
                                width: wp(54),
                                justifyContent: 'center',
                                backgroundColor: AppColors.whiteShadeColor
                            }}>
                                <TextInput allowFontScaling={false}
                                    placeholder={strings('doctor.text.enterCouponCode')}
                                    value={item.item.couponCode}
                                    placeholderTextColor={AppColors.textGray}
                                    onChangeText={text => this.addCoupon(text, item)}
                                    style={{ marginLeft: wp(1), height: hp('5'), fontSize: hp(1.8), color: AppColors.textGray, padding: hp('1') }} />
                            </View>

                            <TouchableOpacity onPress={() => this.applyCoupon(item)} style={{
                                height: hp(4),
                                marginLeft: wp(5),
                                borderRadius: wp(2),
                                width: wp(25),
                                justifyContent: 'center',
                                backgroundColor: AppColors.primaryColor
                            }}>
                                <Text style={{
                                    textAlign: 'center',
                                    fontSize: hp(1.8),
                                    color: AppColors.whiteColor
                                }}>{strings('doctor.button.apply')}</Text>
                            </TouchableOpacity>

                        </View> : null
                    }
                </View>
            </CardView>
        );
    }
    removeItem(item1) {
        let self = this;
        AppUtils.console("removeItem", item1)
        AppUtils.console("ListLength", self.state.productList.length)
        if (self.state.productList.length == 1) {
            Alert.alert(
                '',

                strings('equip.sureWantToRemoveItem'),
                [
                    { text: strings('doctor.button.cancel'), onPress: () => { } },

                    {
                        text: strings('doctor.button.ok'), onPress: () => {
                            var filtered = self.state.productList.filter(function (item) {
                                AppUtils.console("id", item._id, "idd", item1._id)
                                return item._id !== item1._id;
                            });
                            AppUtils.console("data", filtered)
                            Actions.pop()
                            // this.setState({productList: filtered});

                        }
                    },
                ]
            )
        } else {
            var filtered = self.state.productList.filter(function (item) {
                AppUtils.console("id", item._id, "idd", item1._id)
                return item._id !== item1._id;
            });
            AppUtils.console("data", filtered)
            this.setState({ productList: filtered });
            this.getSubTotal(filtered)
        }
    }

    addCoupon(text, item) {
        AppUtils.console("Coupon", item);

        let productList = this.state.productList;
        productList[item.index].couponCode = text;
        productList[item.index].isCoupenApplied = false;
        this.setState({ productList: productList });
    }

    async applyCoupon(item) {
        AppUtils.console("sdzfcdfg", item);
        let coupenDetails = {
            couponCode: item.item.couponCode,
            productId: item.item._id
        };

        try {
            let response = await SHApiConnector.verifyOffer(coupenDetails);
            AppUtils.console("Discount", response)

            if (response.data.status) {
                let productList = this.state.productList;
                productList[item.index].offerType = response.data.response.offer.valueType;
                productList[item.index].offerValue = response.data.response.offer.couponValue;
                productList[item.index].isCoupenApplied = true;
                AppUtils.console("dfxcdvg", productList)
                this.setState({ productList: productList }, () => this.addDiscount());
                Toast.show(strings('doctor.text.couponApplied'));
            } else {
                Toast.show(response.data.error_message);
            }
            AppUtils.console("sdfzvbdsfv", response);
        } catch (e) {
            AppUtils.console("VERIFY_OFFER_ERROR", e)
        }
    }

    addDiscount() {
        let discount = 0;
        let total = 0;
        this.state.productList.map(product => {
            AppUtils.console("zdfxvdbgfh", product);
            if (product.isCoupenApplied) {
                if (product.offerType === 'PERCENT') {
                    let offerVal = ((product.offerValue * product.sellingPrice) / 100) * product.userQuantity;
                    discount = discount + offerVal;
                } else {
                    discount = discount + product.offerValue;
                }
            }
            total = total + (product.sellingPrice) * product.userQuantity;
        });

        this.setState({
            total: total - discount,
            subTotal: parseFloat(total),
            discount: discount
        })
    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: AppColors.whiteShadeColor }}>
                <AddressView
                    selectedAddress={this.state.selectedAddress}
                    onPress={() => this.setState({ isAddressOpen: true })} />
                <AddOrUpdateAddress
                    isOpen={this.state.isAddAddressOpen}
                    location={this.state.location}
                    addressList={this.state.addressList}
                    currentAddress={this.state.currentAddress}
                    updateAddressData={this.state.updateAddressData}
                    closeModal={() => this.setState({ isAddAddressOpen: false, isAddressOpen: false, updateAddressData: {} })}
                    onAddressAddedOrUpdated={addressList => this.setState({ addressList: addressList, isAddAddressOpen: false, isAddressOpen: false, updateAddressData: {} }, () => this.getSelectedAddress(addressList))}
                />
                <SelectAddressModal
                    isOpen={this.state.isAddressOpen}
                    location={this.state.location}
                    addressList={this.state.addressList}
                    addAddress={() => this.setState({ isAddressOpen: false }, () => this.setState({ isAddAddressOpen: true }))}
                    selectAddress={(addressList) => this.setState({ addressList: addressList, isAddressOpen: false, isAddAddressOpen: false }, () => this.getSelectedAddress(addressList))}
                    deleteAddress={(addressList) => this.setState({ addressList: addressList }, () => this.getSelectedAddress(addressList))}
                    closeModal={() => this.setState({ isAddressOpen: false })}
                    updateAddress={(updateAddress) => this.setState({ updateAddressData: updateAddress, isAddressOpen: false, isAddAddressOpen: true })}
                />
                <ScrollView showsVerticalScrollIndicator={false}>

                    <FlatList
                        style={{ marginTop: hp(3), marginBottom: hp(3) }}
                        data={this.state.productList}
                        renderItem={(item) => (this.renderProduct(item))}
                        keyExtractor={(item, index) => index.toString()}
                    />
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
                                <Text style={styles.textDataStyle}>{this.state.productList[0].currencySymbol + this.state.subTotal}</Text>
                            </View>
                        </View>
                        <View style={styles.textViewStyle}>

                            <Text style={styles.textTitleStyle}>{strings('equip.delivery')}</Text>
                            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={styles.textDataStyle}>{this.state.productList[0].currencySymbol}0</Text>
                            </View>

                        </View>

                        <View style={styles.textViewStyle}>

                            <Text style={styles.textTitleStyle}>{strings('doctor.button.discount')}</Text>
                            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={styles.textDataStyle}>{this.state.productList[0].currencySymbol + this.state.discount}</Text>
                            </View>

                        </View>

                        <View style={styles.textViewStyle}>

                            <Text style={[styles.textTitleStyle, { color: AppColors.primaryColor }]}>{strings('common.caregiver.total')}</Text>
                            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={[styles.textDataStyle, { color: AppColors.primaryColor }]}>{this.state.productList[0].currencySymbol + this.state.total}</Text>
                            </View>


                        </View>


                    </View>
                </ScrollView>
                <View style={{
                    width: wp(100),
                    shadowOffset: {
                        width: 0,
                        height: -3,
                    },
                    shadowOpacity: .2,
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#000000',
                    backgroundColor: AppColors.whiteColor,
                    paddingBottom: (AppUtils.isX) ? hp(2) : 0,
                    elevation: 2,
                    height: (AppUtils.isX) ? hp(12) : hp(10),
                    flexDirection: 'row'
                }}>
                    <View style={{ flex: 1 }} >
                        <Text style={{ marginLeft: wp(5), marginTop: (AppUtils.isIphone) ? hp(.5) : 0, fontSize: hp(2.5), fontFamily: AppStyles.fontFamilyMedium }}>{strings('common.caregiver.total')} {this.state.productList[0].currencySymbol + this.state.total}</Text>
                    </View>


                    <TouchableOpacity style={{ flex: 1, marginRight: wp(5), alignItems: 'flex-end' }}
                        onPress={() => this.placeOrder()}>
                        <View style={{
                            height: hp(6),
                            width: wp(45),
                            backgroundColor: AppColors.primaryColor,
                            borderWidth: 2,
                            justifyContent: 'center',
                            borderRadius: hp(.8),
                            alignItems: 'center',
                            borderColor: AppColors.primaryColor
                        }}>
                            <Text style={{
                                fontFamily: AppStyles.fontFamilyRegular, color: AppColors.whiteColor,
                                marginTop: (AppUtils.isIphone) ? hp(.5) : 0,
                                fontSize: hp(2.2)
                            }}>{strings('equip.placeOrder')}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }


    async placeOrder() {
        try {

            let productList = this.state.productList;
            let productServerDataList = [];
            let checkQuantity = true;
            AppUtils.console("sdzxcszdsx", this.state.addressList, this.state.addressList.length);
            AppUtils.console("PlaceOrder", productList)

            let results = [];
            let seller_list = []
            productList.map((product, i) => {

                results.push({ "sellerId": product.sellerId._id, "productId": product._id, "total": (product.sellingPrice * product.userQuantity) })

            })
            AppUtils.console("Result", results)
            var result1 = [];
            var lookup = {}; var lookup1 = {};

            for (var item, i = 0; item = results[i++];) {
                var sellerId = item.sellerId;

                if (!(sellerId in lookup)) {
                    lookup[sellerId] = 1;
                    result1.push({ sellerId });
                }
            }
            AppUtils.console("Result1", result1)


            let groupBySellerId = groupBy('sellerId');
            seller_list.push(groupBySellerId(results));
            AppUtils.console("Result_final", seller_list[0]);
            let final_res = [];
            for (let i = 0; i < result1.length; i++) {

                AppUtils.console("Result_loop1", seller_list[0][result1[i].sellerId]);
                let list = seller_list[0][result1[i].sellerId];
                AppUtils.console("resultsellerId1", list.length)
                let total = 0;
                let final = [];
                let seller;

                for (let li = 0; li < list.length; li++) {
                    AppUtils.console("Result_loop2", list[li]);
                    total = total + list[li].total;
                    seller = list[li].sellerId;
                    final.push(list[li].productId);
                }
                final_res.push({ 'sellerId': seller, 'product': final, 'total': total })
            }

            AppUtils.console("Result_loop3", final_res)







            productList.map((product, i) => {
                if (product.productQuantity == 0) {
                    checkQuantity = false;

                }

            })
            if (checkQuantity) {
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
                    AppUtils.console("PlaceOrder", productServerDataList)


                    try {
                        let response = await SHApiConnector.placeOrder({ productList: productServerDataList });
                        AppUtils.console("PlaceOrderResponse", response, productServerDataList)
                        if (response.data.status) {
                            Actions.SelectPayment({ paymentDetails: response.data.response, currencySymbol: this.state.productList[0].currencySymbol })
                        }else{
                            Toast.show(response.data.error_message);
                        }
                    } catch (e) {
                        AppUtils.console("Place Order", e)
                    }
                } else {
                    Alert.alert(strings('string.label.add_address'), strings('string.alert.alert_address'),
                        [
                            {
                                text: strings('doctor.button.cancel'),
                                style: "cancel"
                            },
                            { text: strings('string.label.add_address'), onPress: () => this.setState({ isAddAddressOpen: true }) }
                        ],
                        { cancelable: false })
                }
            } else {
                Alert.alert('', strings('equip.productOutOfScope'),
                    [
                        {
                            text: strings('doctor.button.cancel'),
                            style: "cancel"
                        },
                        productList.length > 1 ? { text: strings('doctor.button.remove'), onPress: () => this.removeProduct() } : null
                    ],

                );

            }

        } catch (e) {
            AppUtils.console('ResultError', e);
        }

    }
    removeProduct() {
        var filtered = this.state.productList.filter(function (item) {
            AppUtils.console("id", item._id, "idd")
            return item.productQuantity !== 0;
        });
        AppUtils.console("dataFilter", filtered)
        if (filtered.length == 0) {
            Actions.pop()
        } else {
            this.setState({ productList: filtered });
            this.getSubTotal(filtered)
        }



    }
}

const styles = StyleSheet.create({
    textViewStyle: {
        alignSelf: 'center', height: hp(6), flexDirection: 'row',
        width: wp(90), borderBottomWidth: 1, 
        borderColor: AppColors.backgroundGray
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

export default orderSummary;


