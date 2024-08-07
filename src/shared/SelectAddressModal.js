import React, {Component} from 'react';
import {
    Alert,
    FlatList,
    Image,
    Modal,
    PermissionsAndroid,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import images from "../utils/images";
import {AppColors} from "./AppColors";
import {AppStyles} from "./AppStyles";
import {AppStrings} from "./AppStrings";
import PropTypes from 'prop-types'
import {AppUtils} from "../utils/AppUtils";
import Geocoder from "react-native-geocoding";
import {SHApiConnector} from "../network/SHApiConnector";
import Toast from "react-native-simple-toast";
import { strings } from '../locales/i18n';

class SelectAddressModal extends Component {

    static propTypes = {
        isOpen: PropTypes.bool,
        location: PropTypes.string,
        addressList: PropTypes.array,
        closeModal: PropTypes.func,
        addAddress: PropTypes.func,
        selectAddress: PropTypes.func,
        deleteAddress: PropTypes.func,
        updateAddress: PropTypes.func,
    }

    static defaultProps = {
        isOpen: false,
        location: '',
        addressList: [],
        closeModal: () => {
        },
        addAddress: () => {
        },
        selectAddress: () => {
        },
        deleteAddress: () => {
        },
        updateAddress: () => {
        }
    };

    constructor(props) {
        super(props);
        Geocoder.init(AppStrings.MAP_API_KEY);
        this.state = {
            addressList: props.addressList,
            isAddressOpen: false,//this.props.isOpen,
            location: '',
        }
    }

    componentDidMount(): void {
        this.getLocation()
    }

    async getLocation() {
        if (Platform.OS === 'ios') {
            this.getUserCurrentLocation();
        } else {
            const permissionGranted = await AppUtils.locationPermissionsAccess();
            this.setState({isLoading: false})
            if (permissionGranted === PermissionsAndroid.RESULTS.GRANTED) {
                this.getUserCurrentLocation();
            }
        }
    }

    async getUserCurrentLocation() {
        let self = this;
        const location = await AppUtils.getCurrentLocation();
        this.setState({isLoading: false})
        const {latitude, longitude} = location.coords;
        Geocoder.from(latitude, longitude).then(json => {
            let addressComponent = json.results[0].formatted_address;
            self.setState({
                location: addressComponent
            })
        })
    }

    componentWillReceiveProps(nextProps: Readonly<P>, nextContext: any): void {
        AppUtils.console("nextPropsView ", nextProps, nextContext, this.state.isAddressOpen, nextProps.isOpen != this.state.isAddressOpen);
        if (nextProps.isOpen) {
            this.setState({
                isAddressOpen: this.props.isOpen,
                addressList: nextProps.addressList
            })
        }
    }

    selectAddress(item) {
        let addressList = this.state.addressList;
        addressList.map((address, i) => {
            AppUtils.console("xdcdfxvbx567", address, i)
            if (item.index == i) {
                address.isDefaultAddress = true;
            } else {
                address.isDefaultAddress = false;
            }
        });

        this.setState({isAddressOpen: false}, async () => {
            try {
                this.props.selectAddress(addressList);
                this.setState({isLoading: true});
                AppUtils.console("xdcdfxvbx", item)
                let response = await SHApiConnector.setDefaultAddress({addressId: item.item._id});
                AppUtils.console("xdcdfxvbx123", response)
                if (response.data.status) {
                    this.setState({addressList: response.data.response, isAddressOpen: false}, () => {
                        this.props.selectAddress(response.data.response)
                    })
                } else {
                    this.setState({isLoading: false}, () => Toast.show(response.data.error_message))
                }
            } catch (e) {
                AppUtils.console("SET_ADDRESS_DEFAULT_ERROR", e);
            }
        });
    }

    deleteAddress(item) {
        Alert.alert('', strings('shared.sureWantToDeleteAddress'),
            [
                {text: strings('doctor.button.capYes'), onPress: () => this.deleteAddressApiCall(item)},
                {text: strings('doctor.button.capNo')}
            ])
        AppUtils.console("sdzfxcsz", item)
    }

    async deleteAddressApiCall(item) {
        try {
            let response = await SHApiConnector.deleteAddress({addressId: item._id});
            AppUtils.console("sdzfxcsz123", response);
            if (response.data.status) {
                this.setState({isLoading: false, addressList: response.data.response}, () => {
                    this.props.deleteAddress(response.data.response)
                })
            } else {
                this.setState({isLoading: false}, () => Toast.show(response.data.error_message))
            }
        } catch (e) {
            AppUtils.console("DELETE_ADDRESS_ERROR", e)
        }
    }

    renderAddressList(item, isCurrentLocation) {
        let address = (isCurrentLocation) ? item : AppUtils.getAddress(item.item);
        let backgroundColor = (isCurrentLocation) ? 'transparent' : (item.item.isDefaultAddress) ? AppColors.selectAddressBorderColor : 'transparent';
        let borderWidth = (isCurrentLocation) ? 0 : (item.item.isDefaultAddress) ? 2 : 0;
        return (
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => (isCurrentLocation) ? this.props.addAddress() : this.selectAddress(item)}
                style={[
                    styles.addSelectorIndicator,
                    {
                        backgroundColor: backgroundColor,
                        borderWidth: borderWidth,
                    }
                ]}>
                <View style={styles.innerAddressListView}>
                    <View style={[
                        styles.innerAddressListView1,
                        {justifyContent: 'center',}
                    ]}>
                        {
                            isCurrentLocation ?
                                <Image
                                    style={[styles.binImage, {tintColor: AppColors.locationIconColor}]}
                                    source={images.location}/>
                                :
                                <View
                                    activeOpacity={0.8}
                                    style={styles.addressOuterRadio}>
                                    <View style={[styles.addressInnerRadio,
                                        {backgroundColor: (item.item.isDefaultAddress) ? AppColors.primaryColor : null}
                                    ]}/>
                                </View>
                        }
                    </View>

                    <View style={[
                        styles.innerAddressListView2,
                        {height: item.index === 0 ? hp(8) : null}
                    ]}>
                        <Text style={{
                            color: AppColors.blackColor,
                            fontFamily: AppStyles.fontFamilyMedium,
                            fontSize: 14
                        }}>{(isCurrentLocation) ? strings('doctor.text.currentLocation') : item.item.title}</Text>
                        <Text
                            style={{
                                fontFamily: AppStyles.fontFamilyMedium,
                                fontSize: 12,
                                marginTop: hp(0.2),
                                lineHeight: hp(2),
                                color: item.index === 0 ? AppColors.blackColor : AppColors.greenColor3
                            }}
                            numberOfLines={2}>{address}</Text>
                    </View>

                    {
                        !isCurrentLocation ?
                            <View style={styles.innerAddressListView3}>
                                <TouchableOpacity
                                    onPress={() => this.setState({isAddressOpen: false}, () => this.props.updateAddress(item.item))}>
                                    <Image
                                        style={styles.binImage}
                                        source={images.editIcon}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => this.deleteAddress(item.item)}>
                                    <Image
                                        style={styles.binImage}
                                        source={images.deleteIcon}
                                    />
                                </TouchableOpacity>
                            </View>
                            :
                            <View style={styles.innerAddressListView3}>
                            </View>
                    }
                </View>
            </TouchableOpacity>
        )
    }

    closeModal() {
        this.setState({isAddressOpen: false}, () => this.props.closeModal())
    }

    renderAddSelectAddress() {
        AppUtils.console("MyAddress", this.state.addressList)
        return (
            <Modal
                style={{justifyContent: 'center', zIndex: 2}}
                visible={this.props.isOpen}
                onRequestClose={() => this.closeModal()}
                transparent={true}>
                <View style={{
                    width: wp('100'),
                    height: hp('100'),
                    alignItems: 'center',
                    justifyContent: 'center',
                    alignSelf: 'center',
                    backgroundColor: "rgba(0,0,0,0.3)"
                }}>
                    <TouchableOpacity style={{width: wp('100'), height: hp('100')}}
                                      onPress={() => this.closeModal()}
                    >
                        <View/>
                    </TouchableOpacity>
                    <View style={styles.addressModal}>
                        <View style={styles.addressModalView1}>
                            <View style={styles.addressModalView1TxtView}>
                                <Text style={styles.modalTxt}>{strings('string.addressModal.selectAdd')}</Text>
                            </View>
                        </View>
                        <View style={styles.addressListView}>
                            {this.renderAddressList(this.state.location, true)}
                            {(this.state.addressList.length > 0) ?
                                <FlatList
                                    data={this.state.addressList}
                                    extraData={this.state}
                                    renderItem={(item, index) => (
                                        this.renderAddressList(item, false)
                                    )}
                                    keyExtractor={(item, index) => index.toString()}
                                />
                                : <View style={{height: hp(30), justifyContent: 'center'}}>
                                    <Text
                                        style={{fontFamily: AppStyles.fontFamilyMedium, color: AppColors.primaryColor}}>{strings('shared.addAddress')}</Text>
                                </View>
                            }
                        </View>
                        {(this.state.addressList.length < 5) ?
                            <View style={styles.addressModalView2}>
                                <TouchableOpacity
                                    onPress={() => this.setState({isAddressOpen: false}, () => this.props.addAddress())}
                                    activeOpacity={0.8}
                                    style={styles.addressModalBtn}>
                                    <Image
                                        resizeMode="contain"
                                        style={styles.addressModalGPSIcon}
                                        source={images.addAddress}
                                    />
                                    <Text style={styles.addressModalBtnTxt}>{strings('shared.addNewAddress')}</Text>
                                </TouchableOpacity>
                            </View> : null
                        }
                    </View>
                </View>
            </Modal>
        )
    }


    render() {
        return this.renderAddSelectAddress()
    }
}


const styles = StyleSheet.create({

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
        height: hp(5), width: wp(45),
        borderRadius: 6,
        backgroundColor: AppColors.primaryColor,
        marginTop: hp(2), justifyContent: 'center', alignItems: 'center'
    },
    addressModalBtnTxt: {
        color: AppColors.whiteColor,
        fontFamily: AppStyles.fontFamilyMedium, alignItems: 'center', textAlign: 'center',
        fontSize: 12, height: hp('1.8')
    },
    addressModalGPSIcon: {
        height: wp(6),
        width: wp(6), marginRight: wp('2')
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

})

export default SelectAddressModal
