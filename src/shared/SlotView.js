/**
 * Created by anooj on 25/06/18.
 */


import React from 'react';
import {Platform, StyleSheet, Text, TouchableHighlight, View} from 'react-native';
import PropTypes from 'prop-types'
import {moderateScale, verticalScale} from '../utils/Scaling';
import {AppStyles} from '../shared/AppStyles';
import {AppColors} from "../shared/AppColors";

class SlotView extends React.Component {
    static propTypes = {
        height: PropTypes.number,
        width: PropTypes.number,
        slotText: PropTypes.string.isRequired,
        slotType: PropTypes.oneOf(['occupied', 'available', 'blocked']).isRequired,
        backgroundColor: PropTypes.string,
        onSlotClick: PropTypes.func,
    }
    static defaultProps = {
        height: (45),
        width: (70),
        slotText: "",
        slotType: 'blocked',
        backgroundColor: AppColors.primaryGray
    }

    constructor(props) {
        super(props);
        this.props = props;
    }

    getStyle() {
        switch (this.props.slotType) {
            case 'occupied':
                return {
                    width: moderateScale(this.props.width),
                    borderRadius: moderateScale(5),
                    height: moderateScale(this.props.height),
                    alignSelf: 'center', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: this.props.backgroundColor,
                    ...this.props.style
                }
            case 'available':
                return {
                    width: moderateScale(this.props.width),
                    borderRadius: moderateScale(5),
                    height: moderateScale(this.props.height),
                    alignSelf: 'center', alignItems: 'center', justifyContent: 'center',
                    borderWidth: moderateScale(1),
                    borderColor: AppColors.primaryColor,
                    ...this.props.style
                }
            case 'blocked':
                return {
                    width: moderateScale(this.props.width),
                    borderRadius: moderateScale(5),
                    height: moderateScale(this.props.height),
                    alignSelf: 'center', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: this.props.backgroundColor,
                    ...this.props.style
                }
        }
    }

    getTextColor() {
        switch (this.props.slotType) {
            case 'occupied':
                return AppColors.blackColor
            case 'available':
                return AppColors.blackColor
            case 'blocked':
                return AppColors.whiteColor
        }
    }

    render() {
        let slotStyle = this.getStyle();
        let slotTextColor = this.getTextColor();
        return (
            <TouchableHighlight onPress={this.onSlotClick.bind(this)} underlayColor={AppColors.whiteColor}>
                <View style={slotStyle}>
                    <Text style={{
                        color: slotTextColor,
                        justifyContent: 'center',
                        alignItems: 'center',
                        alignSelf: 'center',
                        fontFamily: AppStyles.fontFamilyRegular,
                        fontSize: moderateScale(10),
                        marginTop: Platform.OS === 'ios' ? 3 : 0
                    }}>
                        {this.props.slotText}
                    </Text>
                </View>
            </TouchableHighlight>
        )
    }

    onSlotClick() {
        if (this.props.onSlotClick) {
            this.props.onSlotClick()
        }
    }


}

const styles = StyleSheet.create({

    cardSlot: {
        height: verticalScale(30),
        flexDirection: 'row',
        margin: moderateScale(10)
    },
    cardSelectText: {
        fontFamily: AppStyles.fontFamilyBold,
        fontSize: moderateScale(15),
        color: AppColors.primaryColor,
        flex: 3
    },
    cardDate: {
        fontFamily: AppStyles.fontFamilyRegular,
        fontSize: moderateScale(15),
        color: AppColors.primaryGray,
        justifyContent: 'flex-end',
        flex: 1
    },
    cardSpecFree: {
        width: moderateScale(70),
        borderRadius: moderateScale(5),
        height: moderateScale(45),
        alignSelf: 'center',
        borderWidth: moderateScale(1),
        borderColor: AppColors.primaryColor
    },
    cardSpecOccupied: {
        width: moderateScale(70),
        borderRadius: moderateScale(5),
        height: moderateScale(45),
        alignSelf: 'center',
        backgroundColor: AppColors.primaryGray,
    },
    cardTimeText: {
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        color: AppColors.blackColor,
        fontFamily: AppStyles.fontFamilyRegular,
        fontSize: moderateScale(10),
        marginTop: moderateScale(15)
    }
})

export default SlotView;