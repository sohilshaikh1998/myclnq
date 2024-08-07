import React, {Component} from 'react';
import {Image, PermissionsAndroid, Platform, Text, TouchableOpacity, View,} from 'react-native';
import images from "../utils/images";
import PropTypes from 'prop-types'
import {AppUtils} from "../utils/AppUtils";
import Geocoder from "react-native-geocoding";
import ElevatedView from "react-native-elevated-view";
import careGiverHomeScreenStyle from "../screens/caregiver/caregiverHome/caregiverHomeScreenStyle";
import {AppStrings} from "./AppStrings";
import { strings } from '../locales/i18n';

class AddressView extends Component {

    static propTypes = {
        isOpen: PropTypes.bool,
        selectedAddress: PropTypes.object,
        onPress: PropTypes.func
    }

    static defaultProps = {
        location: '',
        selectedAddress: {},
        onPress: () => {
        }
    }

    constructor(props) {
        super(props);
        Geocoder.init(AppStrings.MAP_API_KEY);
        this.state = {
            selectedAddress: {},isElevation:true
        }
    }

    componentDidMount(): void {
        this.getLocation();
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
        AppUtils.console("sdzfcxaszdc", location)
        Geocoder.from(latitude, longitude).then(json => {
            AppUtils.console("sdzfcxaszdc123", json)
            let addressComponent = json.results[0].formatted_address;
            self.setState({
                location: addressComponent
            })
        })
    }

    componentWillReceiveProps(nextProps) {
        AppUtils.console("nextProps_sdfzvxzdsfx ", nextProps);
        this.setState({selectedAddress: nextProps.selectedAddress,isElevation:nextProps.isElevation?true:false})
    }

    render() {
        AppUtils.console("sdfzvxzdsfx", this.state.selectedAddress);
        let address = (!this.state.selectedAddress.address) ? this.state.location : AppUtils.getAddress(this.state.selectedAddress);
             
        return (
            <ElevatedView 
             elevation={this.state.isElevation?2 :5}
             style={careGiverHomeScreenStyle.header}>
                <TouchableOpacity
                    onPress={() => this.props.onPress()}
                    activeOpacity={0.8}
                    style={careGiverHomeScreenStyle.subHeader}>
                    <View style={careGiverHomeScreenStyle.addressView}>
                        <View style={careGiverHomeScreenStyle.innerAddressView}>
                            <View style={careGiverHomeScreenStyle.addAddressView}>
                                <Text
                                    style={careGiverHomeScreenStyle.addressPlaceHolderTxt}>{(!this.state.selectedAddress.title) ? strings('doctor.text.currentLocation') : this.state.selectedAddress.title}</Text>
                                <Text
                                    style={careGiverHomeScreenStyle.addressTxt}
                                    numberOfLines={(Platform.OS === 'ios') ? 2 : 2}
                                >{address}</Text>
                            </View>
                            <View>

                            </View>
                            <View
                                style={careGiverHomeScreenStyle.dropDownView}
                            >
                                <TouchableOpacity
                                    onPress={() => this.props.onPress()}
                                    activeOpacity={0.8}
                                    style={{padding: 10}}
                                >
                                    <Image
                                        style={careGiverHomeScreenStyle.dropDownImage}
                                        source={images.arrowDown}
                                    />
                                </TouchableOpacity>
                            </View>

                        </View>
                    </View>
                </TouchableOpacity>
            </ElevatedView>
        )
    }
}

export default AddressView
